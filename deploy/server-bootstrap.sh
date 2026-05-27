#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/adaiwiz}"
APP_USER="${APP_USER:-$USER}"
NODE_MAJOR="${NODE_MAJOR:-22}"

if ! command -v sudo >/dev/null 2>&1; then
  echo "sudo is required on the target server" >&2
  exit 1
fi

sudo mkdir -p "$APP_DIR/releases" "$APP_DIR/shared" "$APP_DIR/current"
sudo chown -R "$APP_USER":"$APP_USER" "$APP_DIR"

if command -v apt-get >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y curl ca-certificates build-essential nginx

  if ! command -v node >/dev/null 2>&1 || ! node -v | grep -Eq "^v(20|22|24)\."; then
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
    sudo apt-get install -y nodejs
  fi
elif command -v yum >/dev/null 2>&1; then
  sudo yum install -y curl ca-certificates gcc-c++ make nginx
  if ! command -v node >/dev/null 2>&1 || ! node -v | grep -Eq "^v(20|22|24)\."; then
    curl -fsSL "https://rpm.nodesource.com/setup_${NODE_MAJOR}.x" | sudo bash -
    sudo yum install -y nodejs
  fi
else
  echo "Unsupported Linux distribution. Install Node.js 20+/22+, npm, nginx manually." >&2
fi

if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
fi

echo "Server bootstrap complete. Node: $(node -v), npm: $(npm -v), pm2: $(pm2 -v)"
