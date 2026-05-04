#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# InterviewReady — Deploy Update Script
# ============================================================================
# Run this on the SERVER after uploading new code.
# Rebuilds backend, runs migrations, restarts services.
# ============================================================================

APP_DIR="/opt/interviewready"
APP_USER="interviewready"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }

if [[ $EUID -ne 0 ]]; then
  err "Run as root:  sudo bash deploy-update.sh"
  exit 1
fi

# --- BACKEND ---
info "Updating backend..."
cd "${APP_DIR}/server"

if [[ -f package.json ]]; then
  sudo -u "$APP_USER" npm install --production=false 2>&1 | tail -3
  sudo -u "$APP_USER" npx prisma generate 2>&1 | tail -3
  sudo -u "$APP_USER" npx prisma migrate deploy 2>&1 | tail -5 || warn "Migrate had issues."
  sudo -u "$APP_USER" npx tsc 2>&1 | tail -5 || warn "TypeScript build had warnings."
  info "Backend compiled."
else
  warn "No server/package.json found — skipping backend update."
fi

systemctl restart interviewready
sleep 2
if systemctl is-active --quiet interviewready; then
  info "Backend service: RUNNING"
else
  err "Backend service: FAILED — check: journalctl -u interviewready -n 50"
fi

# --- FRONTEND ---
if [[ -d "${APP_DIR}/app/dist" && -f "${APP_DIR}/app/dist/index.html" ]]; then
  info "Frontend build detected — reloading Nginx..."
  systemctl reload nginx
  info "Nginx reloaded."
else
  warn "No frontend build at ${APP_DIR}/app/dist/ — upload your built files."
fi

info "============================================"
info " Deploy complete!"
info "============================================"
