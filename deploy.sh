#!/bin/bash
# =============================================================================
# GoCoupon VPS Deployment Script
# Usage: ./deploy.sh [docker|pm2]
# Default: docker
# =============================================================================

set -euo pipefail

MODE="${1:-docker}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  GoCoupon Deploy — $TIMESTAMP"
echo "  Mode: $MODE"
echo "  Dir:  $APP_DIR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$APP_DIR"

# Verify .env exists
if [ ! -f ".env" ]; then
  echo "❌ ERROR: .env file not found in $APP_DIR"
  echo "   Create it with: cp .env.example .env && nano .env"
  exit 1
fi

if [ "$MODE" = "docker" ]; then
  # ── Docker Compose path ──────────────────────────────────────────
  echo ""
  echo "📥 Pulling latest code..."
  git pull origin main

  echo ""
  echo "🐳 Building and restarting Docker services..."
  docker compose -f docker-compose.prod.yml up -d --build app

  echo ""
  echo "⏳ Waiting for app to start..."
  sleep 5

  echo ""
  echo "🏥 Health check..."
  HEALTH=$(curl -sf http://localhost:3000/api/health || echo "FAILED")
  echo "   $HEALTH"

  echo ""
  echo "📊 Service status:"
  docker compose -f docker-compose.prod.yml ps

elif [ "$MODE" = "pm2" ]; then
  # ── PM2 path ─────────────────────────────────────────────────────
  echo ""
  echo "📥 Pulling latest code..."
  git pull origin main

  echo ""
  echo "📦 Installing dependencies..."
  npm ci

  echo ""
  echo "🏗️  Building..."
  npm run build

  echo ""
  echo "🟢 Restarting PM2 process..."
  if pm2 list | grep -q "gocoupon"; then
    pm2 restart gocoupon
  else
    pm2 start ecosystem.config.cjs
    pm2 save
  fi

  echo ""
  echo "⏳ Waiting for app to start..."
  sleep 3

  echo ""
  echo "🏥 Health check..."
  HEALTH=$(curl -sf http://localhost:3000/api/health || echo "FAILED")
  echo "   $HEALTH"

  echo ""
  echo "📊 PM2 status:"
  pm2 status

else
  echo "❌ Unknown mode: $MODE. Use 'docker' or 'pm2'"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Deployment complete!"
echo "  🌐 Live API: curl https://gocoupon.io/api/health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
