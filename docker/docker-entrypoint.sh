#!/bin/sh
set -e

echo "============================================"
echo " InterviewReady — Docker Startup"
echo "============================================"

# ─── Database Migrations ────────────────────────────────────────────────
if [ -n "$DATABASE_URL" ]; then
  echo ""
  echo "[1/3] Running database migrations..."
  cd /app
  npx prisma migrate deploy 2>&1 || {
    echo "WARNING: prisma migrate deploy failed."
    echo "Attempting prisma db push instead..."
    npx prisma db push --accept-data-loss 2>&1 || {
      echo "WARNING: prisma db push also failed."
      echo "The database may not be ready yet. The server will start anyway."
      echo "You can run migrations manually later."
    }
  }
  echo "Migrations done."

  # ─── Seed (first run only) ───────────────────────────────────────────
  echo ""
  echo "[2/3] Checking if database needs seeding..."
  USER_COUNT=$(node -e "
    const { PrismaClient } = require('@prisma/client');
    const p = new PrismaClient();
    p.user.count().then(c => { console.log(c); return p.\$disconnect(); }).catch(() => { console.log('0'); });
  " 2>/dev/null || echo "0")

  if [ "$USER_COUNT" = "0" ] 2>/dev/null; then
    echo "No users found — seeding database with admin account..."
    npx tsx prisma/seed.ts 2>&1 || echo "Seed completed (or had issues — admin may already exist)."
  else
    echo "Database already has users — skipping seed."
  fi
else
  echo ""
  echo "[1/3] WARNING: DATABASE_URL not set — skipping migrations."
  echo "[2/3] WARNING: Cannot seed without DATABASE_URL."
fi

# ─── Start Services ─────────────────────────────────────────────────────
echo ""
echo "[3/3] Starting Nginx + Node.js API..."
echo "  Frontend: http://localhost:80"
echo "  API:      http://localhost:80/api/"
echo ""
echo "============================================"

# Execute the main CMD (supervisord)
exec "$@"
