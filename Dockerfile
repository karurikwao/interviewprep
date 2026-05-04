# ============================================================================
# InterviewReady — All-in-One Dockerfile (Coolify-compatible)
# ============================================================================
# Builds EVERYTHING from source:
#   Stage 1: Install frontend deps + build React app
#   Stage 2: Install server deps + compile TypeScript + generate Prisma
#   Stage 3: Production image with Nginx + Node.js backend
#
# When this container starts:
#   1. Nginx serves the frontend at port 80
#   2. The Node.js API runs at port 3001 (internal only)
#   3. Nginx proxies /api/ → localhost:3001
#   4. docker-entrypoint.sh runs migrations + seed before starting
#
# Coolify: just point to this Dockerfile, set env vars, deploy. Done.
# ============================================================================

# ─── Stage 1: Build Frontend ──────────────────────────────────────────────
FROM node:22-alpine AS frontend-builder

WORKDIR /frontend
COPY app/package.json app/package-lock.json* ./
RUN npm install

COPY app/ ./
RUN npm run build
# Output: /frontend/dist/  (the complete React SPA)

# ─── Stage 2: Build Backend ───────────────────────────────────────────────
FROM node:22-alpine AS backend-builder

WORKDIR /backend
COPY server/package.json server/package-lock.json* ./
COPY server/prisma ./prisma/
RUN npm install --include=dev

COPY server/ ./
RUN npx prisma generate
RUN npx tsc
# Output: /backend/dist/  (compiled JavaScript)

# ─── Stage 3: Production Runner ───────────────────────────────────────────
FROM node:22-alpine AS runner

# Install Nginx + supervisord (to run both Nginx and Node.js)
RUN apk add --no-cache nginx openssl supervisor

# --- Nginx setup ---
RUN mkdir -p /run/nginx
RUN rm -f /etc/nginx/http.d/default.conf
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Frontend static files (from Stage 1)
COPY --from=frontend-builder /frontend/dist /usr/share/nginx/html
# PDFs and PWA assets (from Stage 1)
COPY --from=frontend-builder /frontend/public /usr/share/nginx/html

# --- Backend setup ---
WORKDIR /app
COPY --from=backend-builder /backend/dist ./dist
COPY --from=backend-builder /backend/prisma ./prisma
COPY --from=backend-builder /backend/package.json ./
COPY --from=backend-builder /backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-builder /backend/node_modules/@prisma ./node_modules/@prisma
COPY --from=backend-builder /backend/node_modules ./node_modules

# Entrypoint script (runs migrations, then starts everything)
COPY docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Supervisor config (manages Nginx + Node.js in one container)
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

ENV NODE_ENV=production

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
