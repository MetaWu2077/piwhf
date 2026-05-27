#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/adaiwiz}"
RELEASE_ID="${RELEASE_ID:-$(date +%Y%m%d%H%M%S)}"
RELEASE_DIR="$APP_DIR/releases/$RELEASE_ID"
SHARED_DIR="$APP_DIR/shared"
CURRENT_DIR="$APP_DIR/current"
ARTIFACT="${ARTIFACT:-adaiwiz-release.tgz}"

mkdir -p "$RELEASE_DIR" "$SHARED_DIR"
tar -xzf "$ARTIFACT" -C "$RELEASE_DIR"

cd "$RELEASE_DIR"

if [ ! -f "$SHARED_DIR/.env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example "$SHARED_DIR/.env"
  else
    touch "$SHARED_DIR/.env"
  fi
  chmod 600 "$SHARED_DIR/.env"
  echo "Created $SHARED_DIR/.env. Fill it with production secrets before first successful start."
fi

ln -sfn "$SHARED_DIR/.env" "$RELEASE_DIR/.env"

npm ci
npm run build
npm run setup

if [ -L "$CURRENT_DIR" ] || [ -e "$CURRENT_DIR" ]; then
  rm -rf "$CURRENT_DIR"
fi
ln -s "$RELEASE_DIR" "$CURRENT_DIR"

cd "$CURRENT_DIR"
if [ ! -f ecosystem.config.cjs ]; then
  echo "ecosystem.config.cjs not found in $CURRENT_DIR" >&2
  ls -la "$CURRENT_DIR" >&2
  exit 1
fi
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save || true

# Keep last 5 releases
ls -1dt "$APP_DIR"/releases/* 2>/dev/null | tail -n +6 | xargs -r rm -rf

echo "Deployed AdAIWiz release $RELEASE_ID to $CURRENT_DIR"
