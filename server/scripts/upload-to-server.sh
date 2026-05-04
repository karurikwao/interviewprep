#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# InterviewReady — Upload to Server Script
# ============================================================================
# Run this from your LOCAL machine (Windows WSL, Mac, or Linux).
# Uploads the built frontend + server code to your Hetzner server.
# ============================================================================

# ---- EDIT THESE ----
SERVER_IP=""          # Your Hetzner EX44 IP address
SERVER_USER="root"    # SSH user (root for initial setup)
APP_DIR="/opt/interviewready"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }

if [[ -z "$SERVER_IP" ]]; then
  echo "Edit this script and set SERVER_IP to your Hetzner EX44 IP address."
  echo "Example: SERVER_IP=\"65.109.xxx.xxx\""
  exit 1
fi

REMOTE="${SERVER_USER}@${SERVER_IP}"

info "Uploading to ${REMOTE}..."

# 1. Upload server code
info "  Uploading server/ ..."
ssh "$REMOTE" "mkdir -p ${APP_DIR}/server/src/routes ${APP_DIR}/server/src/middleware ${APP_DIR}/server/prisma ${APP_DIR}/server/scripts"
scp -r server/package.json server/tsconfig.json server/.env "${REMOTE}:${APP_DIR}/server/"
scp -r server/src/ "${REMOTE}:${APP_DIR}/server/"
scp -r server/prisma/ "${REMOTE}:${APP_DIR}/server/"
scp -r server/scripts/ "${REMOTE}:${APP_DIR}/server/"

# 2. Upload frontend build
info "  Uploading app/dist/ ..."
ssh "$REMOTE" "mkdir -p ${APP_DIR}/app/dist"
scp -r app/dist/ "${REMOTE}:${APP_DIR}/app/"

# 3. Upload PDFs (if they exist)
if [[ -d "app/public/pdfs" ]]; then
  info "  Uploading PDFs ..."
  ssh "$REMOTE" "mkdir -p ${APP_DIR}/app/pdfs"
  scp -r app/public/pdfs/*.pdf "${REMOTE}:${APP_DIR}/app/pdfs/" 2>/dev/null || warn "No PDFs found."
fi

# 4. Run deploy-update on the server
info "  Running deploy script on server..."
ssh "$REMOTE" "bash ${APP_DIR}/server/scripts/deploy-update.sh"

info "============================================"
info " Upload & deploy complete!"
info "============================================"
