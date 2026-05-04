#!/bin/sh
set -e

echo "=== InterviewReady Docker Entrypoint ==="

# Run Prisma migrations (only in production when DATABASE_URL is set)
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy || {
    echo "WARNING: prisma migrate deploy failed. Attempting prisma db push..."
    npx prisma db push --accept-data-loss || true
  }

  # Seed if no users exist (first run)
  USER_COUNT=$(node -e "
    const { PrismaClient } = require('@prisma/client');
    const p = new PrismaClient();
    p.user.count().then(c => { console.log(c); p.\$disconnect(); });
  " 2>/dev/null || echo "0")

  if [ "$USER_COUNT" = "0" ] 2>/dev/null; then
    echo "No users found — seeding database..."
    npx tsx prisma/seed.ts || echo "Seed completed (or already seeded)."
  fi
else
  echo "WARNING: DATABASE_URL not set — skipping migrations."
fi

echo "Starting server..."
exec "$@"
