# ============================================================================
# InterviewReady Backend — Dockerfile (Coolify-compatible)
# ============================================================================
# Multi-stage build:
#   1. deps   — install all npm packages
#   2. build  — compile TypeScript + generate Prisma client
#   3. runner — minimal production image with only what's needed
# ============================================================================

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm install --include=dev

FROM deps AS build
COPY . .
RUN npx prisma generate
RUN npx tsc
# Prisma needs the schema at runtime for migrations
RUN cp -r prisma ./dist/prisma-schema 2>/dev/null || true

FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./

# Copy only production node_modules
COPY --from=deps /app/node_modules ./node_modules

# Startup script that runs migrations then starts the server
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001

ENV NODE_ENV=production

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
