#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# InterviewReady — Hetzner EX44 Dedicated Server Setup Script
# ============================================================================
# *** IF YOU ARE USING COOLIFY, DO NOT RUN THIS SCRIPT! ***
# Coolify handles Docker, Nginx, SSL, and deployments automatically.
# Instead, use docker-compose.yml + the Coolify UI to deploy.
# This script is for BARE-METAL setups ONLY (no Docker, no Coolify).
# ============================================================================
#
# This script sets up everything on a fresh Debian/Ubuntu Linux server:
#   1. System updates & base packages
#   2. PostgreSQL install, database & user creation
#   3. Node.js 22 LTS install (via NodeSource)
#   4. Nginx reverse proxy (HTTP → port 3001, serves frontend static files)
#   5. Let's Encrypt HTTPS (via Certbot) — requires a domain name
#   6. Firewall (UFW) — only SSH, HTTP, HTTPS open
#   7. Deploy the app (clone/copy, npm install, build, migrate, seed)
#   8. systemd services — auto-start backend, auto-restart on crash
#   9. Daily PostgreSQL backups via cron
#
# Hetzner EX44 specs: Intel Core i5-13500, 64GB DDR5 RAM, 2x 512GB NVMe
# — more than enough. This script is safe for any Debian 12 / Ubuntu 22+.
# ============================================================================

# ---- CONFIGURATION (edit these before running) ----
APP_DIR="/opt/interviewready"
APP_USER="interviewready"
DB_NAME="interviewready"
DB_USER="irapp"
DB_PASS=""          # leave blank → auto-generated 32-char password
NODE_MAJOR=22       # Node.js LTS major version
SERVER_PORT=3001    # backend API port (only localhost, proxied by Nginx)

# Domain for HTTPS — leave blank for HTTP-only (no Certbot)
DOMAIN=""

# Admin credentials (seeded into the database)
ADMIN_EMAIL="admin@interviewready.app"
ADMIN_PASSWORD=""   # leave blank → auto-generated 16-char password

# Resend API key (get from https://resend.com — free 100 emails/day)
RESEND_API_KEY=""
EMAIL_FROM="noreply@interviewready.app"

# JWT secret — leave blank → auto-generated 64-char string
JWT_SECRET=""

# ---- COLORS ----
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# ---- GENERATE SECRETS IF EMPTY ----
generate_secret() { openssl rand -base64 48 | tr -d '\n/=+' | head -c "$1"; }
[[ -z "$DB_PASS" ]]        && DB_PASS=$(generate_secret 32)
[[ -z "$ADMIN_PASSWORD" ]] && ADMIN_PASSWORD=$(generate_secret 16)
[[ -z "$JWT_SECRET" ]]     && JWT_SECRET=$(generate_secret 64)

# ---- PRE-FLIGHT CHECKS ----
if [[ $EUID -ne 0 ]]; then
  err "Run this script as root:  sudo bash setup-server.sh"
  exit 1
fi

if command -v docker &>/dev/null || systemctl is-active --quiet docker 2>/dev/null; then
  warn "Docker is detected on this server!"
  warn "If you are using Coolify, STOP and use docker-compose.yml instead."
  warn "This script is for bare-metal setups only and will conflict with Coolify."
  echo ""
  read -rp "Are you SURE you want to run this bare-metal setup? [y/N] " yn2
  [[ "$yn2" =~ ^[Yy]$ ]] || { warn "Aborted — use docker-compose.yml with Coolify instead."; exit 0; }
fi

if ! grep -qiE 'debian|ubuntu' /etc/os-release 2>/dev/null; then
  err "This script is designed for Debian 12+ or Ubuntu 22+. Detected:"
  cat /etc/os-release 2>/dev/null || echo "unknown"
  exit 1
fi

info "============================================"
info " InterviewReady Server Setup"
info "============================================"
info "App directory : $APP_DIR"
info "App user      : $APP_USER"
info "Database      : $DB_NAME (user: $DB_USER)"
info "Node.js       : $NODE_MAJOR LTS"
info "Domain        : ${DOMAIN:-<none — HTTP only, no HTTPS>}"
info "Admin email   : $ADMIN_EMAIL"
info "============================================"
echo ""
read -rp "Continue? [y/N] " yn
[[ "$yn" =~ ^[Yy]$ ]] || { warn "Aborted."; exit 0; }

# ============================================================================
# STEP 1 — System updates & base packages
# ============================================================================
info "Step 1/9: System updates & base packages..."
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq \
  curl wget git unzip software-properties-common \
  apt-transport-https ca-certificates gnupg \
  ufw fail2ban \
  nginx certbot python3-certbot-nginx \
  postgresql postgresql-contrib \
  build-essential python3
info "Step 1 done."

# ============================================================================
# STEP 2 — PostgreSQL: create database & user
# ============================================================================
info "Step 2/9: Setting up PostgreSQL..."
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS}';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" 2>/dev/null || true

# Ensure PostgreSQL is running
systemctl enable postgresql
systemctl start postgresql

DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}"
info "PostgreSQL ready. DATABASE_URL set."
info "Step 2 done."

# ============================================================================
# STEP 3 — Node.js via NodeSource
# ============================================================================
info "Step 3/9: Installing Node.js ${NODE_MAJOR} LTS..."
if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt "$NODE_MAJOR" ]]; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash -
  apt-get install -y -qq nodejs
fi
node -v && npm -v
info "Step 3 done."

# ============================================================================
# STEP 4 — Create app user & directory
# ============================================================================
info "Step 4/9: Creating app user & directory..."
id -u "$APP_USER" &>/dev/null || useradd -r -m -s /bin/bash "$APP_USER"
mkdir -p "$APP_DIR"/{server,app/dist}
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
info "Step 4 done."

# ============================================================================
# STEP 5 — Deploy application code
# ============================================================================
info "Step 5/9: Deploying application code..."
info "  Copy your project files to the server, or the script will create placeholders."

# --- SERVER ---
if [[ ! -f "$APP_DIR/server/package.json" ]]; then
  warn "No server code found at $APP_DIR/server/"
  warn "You need to upload your server/ directory contents there."
  warn "Example:  scp -r server/ root@YOUR_SERVER:$APP_DIR/server/"
  warn ""
  warn "For now, creating a minimal placeholder so the rest of setup can proceed."
  sudo -u "$APP_USER" mkdir -p "$APP_DIR/server"/{src/routes,src/middleware,prisma,scripts}
fi

# --- FRONTEND BUILD ---
if [[ ! -f "$APP_DIR/app/dist/index.html" ]]; then
  warn "No frontend build found at $APP_DIR/app/dist/"
  warn "You need to build the frontend and upload dist/ there."
  warn "Example from your dev machine:"
  warn "  cd app && npm run build"
  warn "  scp -r dist/ root@YOUR_SERVER:$APP_DIR/app/dist/"
fi

info "Step 5 done (files must be uploaded separately if not present)."

# ============================================================================
# STEP 6 — Server .env, npm install, Prisma migrate, seed
# ============================================================================
info "Step 6/9: Configuring backend..."

# Write .env
cat > "$APP_DIR/server/.env" <<ENVEOF
# Server
PORT=${SERVER_PORT}
NODE_ENV=production

# Database
DATABASE_URL=${DATABASE_URL}

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# Resend (email)
RESEND_API_KEY=${RESEND_API_KEY}
EMAIL_FROM=${EMAIL_FROM}

# Frontend URL (for CORS)
FRONTEND_URL=https://${DOMAIN:-localhost}

# Admin seed
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
ENVEOF

chown "$APP_USER:$APP_USER" "$APP_DIR/server/.env"
chmod 600 "$APP_DIR/server/.env"

# npm install (if package.json exists)
if [[ -f "$APP_DIR/server/package.json" ]]; then
  info "  Running npm install..."
  cd "$APP_DIR/server"
  sudo -u "$APP_USER" npm install --production=false 2>&1 | tail -3
  sudo -u "$APP_USER" npx prisma generate 2>&1 | tail -3

  info "  Running database migrations..."
  sudo -u "$APP_USER" npx prisma migrate deploy 2>&1 | tail -5 || {
    warn "prisma migrate deploy failed. Trying prisma db push..."
    sudo -u "$APP_USER" npx prisma db push 2>&1 | tail -5
  }

  info "  Seeding database..."
  sudo -u "$APP_USER" npx tsx prisma/seed.ts 2>&1 | tail -5 || \
    warn "Seed failed (may already be seeded)."

  # Build TypeScript to dist/
  info "  Compiling TypeScript..."
  sudo -u "$APP_USER" npx tsc 2>&1 | tail -5 || warn "TypeScript build had warnings."
else
  warn "No server/package.json — skipping npm install / migrate / seed."
  warn "Upload server code then run:"
  warn "  cd $APP_DIR/server && npm install && npx prisma generate && npx prisma migrate deploy && npx tsx prisma/seed.ts"
fi

info "Step 6 done."

# ============================================================================
# STEP 7 — systemd service for the backend API
# ============================================================================
info "Step 7/9: Creating systemd service..."

cat > /etc/systemd/system/interviewready.service <<SVCEOF
[Unit]
Description=InterviewReady API Server
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=${APP_USER}
Group=${APP_USER}
WorkingDirectory=${APP_DIR}/server
ExecStart=$(which node) dist/index.js
Restart=always
RestartSec=5
StartLimitBurst=3
StartLimitIntervalSec=60

Environment=NODE_ENV=production
EnvironmentFile=${APP_DIR}/server/.env

StandardOutput=journal
StandardError=journal
SyslogIdentifier=interviewready

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
systemctl enable interviewready
if [[ -f "$APP_DIR/server/dist/index.js" ]]; then
  systemctl restart interviewready || true
  sleep 2
  if systemctl is-active --quiet interviewready; then
    info "Backend service is RUNNING on port ${SERVER_PORT}."
  else
    warn "Backend service failed to start. Check: journalctl -u interviewready -n 50"
  fi
else
  warn "No dist/index.js yet — service will start after you build."
fi

info "Step 7 done."

# ============================================================================
# STEP 8 — Nginx reverse proxy & HTTPS
# ============================================================================
info "Step 8/9: Configuring Nginx..."

# Nginx config — serves frontend static files + proxies /api to backend
cat > /etc/nginx/sites-available/interviewready <<NGINXEOF
# InterviewReady — Nginx configuration
# Serves:  /       → frontend static files (Vue/React SPA)
# Proxies: /api    → Node.js backend on localhost:${SERVER_PORT}

server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN:-_};

    # Frontend static files
    root ${APP_DIR}/app/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 256;

    # Cache static assets aggressively
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API reverse proxy
    location /api/ {
        proxy_pass http://127.0.0.1:${SERVER_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 30s;
        proxy_send_timeout 30s;
    }

    # SPA fallback — all other routes serve index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # PDF files directory (if you store PDFs on server)
    location /pdfs/ {
        alias ${APP_DIR}/app/pdfs/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Block dotfiles
    location ~ /\. { deny all; }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/interviewready /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t 2>&1 || { err "Nginx config test failed!"; exit 1; }
systemctl enable nginx
systemctl restart nginx

# HTTPS via Let's Encrypt (only if domain is set)
if [[ -n "$DOMAIN" ]]; then
  info "  Requesting HTTPS certificate for $DOMAIN..."
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect || {
    warn "Certbot failed. You can retry later with:"
    warn "  certbot --nginx -d $DOMAIN"
  }
  # Auto-renewal cron is installed by certbot package
else
  warn "No domain set — skipping HTTPS. HTTP only."
  warn "When you have a domain, update DOMAIN in this script and re-run Step 8,"
  warn "or manually run:  certbot --nginx -d yourdomain.com"
fi

info "Step 8 done."

# ============================================================================
# STEP 9 — Firewall (UFW) & security
# ============================================================================
info "Step 9/9: Configuring firewall & security..."

ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw --force enable

# fail2ban for SSH brute-force protection
systemctl enable fail2ban
systemctl start fail2ban

info "Step 9 done."

# ============================================================================
# DAILY BACKUPS — PostgreSQL dump via cron
# ============================================================================
info "Setting up daily PostgreSQL backups..."
mkdir -p /var/backups/interviewready
cat > /usr/local/bin/ir-backup.sh <<'BKEOF'
#!/usr/bin/env bash
set -euo pipefail
BACKUP_DIR="/var/backups/interviewready"
DB_NAME="interviewready"
KEEP_DAYS=14
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

sudo -u postgres pg_dump "$DB_NAME" | gzip > "$FILENAME"
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +${KEEP_DAYS} -delete
echo "$(date): Backup created: $FILENAME" >> "${BACKUP_DIR}/backup.log"
BKEOF
chmod +x /usr/local/bin/ir-backup.sh

(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/ir-backup.sh") | crontab -

info "Daily backups at 3:00 AM. Kept for ${KEEP_DAYS:-14} days in /var/backups/interviewready/"

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
info "============================================"
info " SETUP COMPLETE!"
info "============================================"
echo ""
info "DATABASE_URL  : ${DATABASE_URL}"
info "DB password   : ${DB_PASS}"
info "JWT secret    : ${JWT_SECRET}"
info "Admin email   : ${ADMIN_EMAIL}"
info "Admin password: ${ADMIN_PASSWORD}"
echo ""
if [[ -n "$DOMAIN" ]]; then
  info "App URL       : https://${DOMAIN}"
else
  info "App URL       : http://<YOUR_SERVER_IP>"
fi
echo ""
info "Important next steps:"
info "  1. Upload server code:     scp -r server/ root@SERVER:${APP_DIR}/server/"
info "  2. Upload frontend build:  scp -r app/dist/ root@SERVER:${APP_DIR}/app/dist/"
info "  3. Upload PDFs:            scp -r app/public/pdfs/ root@SERVER:${APP_DIR}/app/pdfs/"
info "  4. If uploaded, restart:   systemctl restart interviewready"
info "  5. Get Resend API key:     https://resend.com (free 100 emails/day)"
info "     Then edit:              nano ${APP_DIR}/server/.env"
info "     And restart:            systemctl restart interviewready"
echo ""
info "Useful commands:"
info "  View backend logs:   journalctl -u interviewready -f"
info "  Restart backend:     systemctl restart interviewready"
info "  Restart nginx:       systemctl restart nginx"
info "  Check service:       systemctl status interviewready"
info "  Manual DB backup:    /usr/local/bin/ir-backup.sh"
info "  Restore backup:      gunzip -c /var/backups/interviewready/DB.sql.gz | sudo -u postgres psql DB"
echo ""
info "Save these credentials somewhere safe!"
info "============================================"

# Save credentials to a secure file on the server (root-only)
cat > /root/.interviewready-credentials <<CREDEOF
# InterviewReady Server Credentials — GENERATED $(date)
# KEEP THIS FILE SECURE — chmod 600

DATABASE_URL=${DATABASE_URL}
DB_USER=${DB_USER}
DB_PASS=${DB_PASS}
DB_NAME=${DB_NAME}

JWT_SECRET=${JWT_SECRET}

ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}

RESEND_API_KEY=${RESEND_API_KEY}
EMAIL_FROM=${EMAIL_FROM}
CREDEOF
chmod 600 /root/.interviewready-credentials
info "Credentials also saved to /root/.interviewready-credentials (root-only readable)"
