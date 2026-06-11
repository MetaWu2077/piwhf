# AdAIWiz - AI Video Ad Brief Generator for Shopify

AdAIWiz is a Shopify embedded app that generates AI-powered video ad briefs and creative variants from Shopify product data, designed for merchants running paid-social campaigns on Meta Ads, TikTok, and other platforms.

## Tech Stack

- **Framework**: React Router (Shopify App Router)
- **Database**: SQLite via Prisma (production) / PostgreSQL recommended for scale
- **Process Manager**: PM2
- **Web Server**: Nginx with Let's Encrypt SSL
- **Hosting**: Hong Kong server (Ubuntu)

## Project Setup

### Prerequisites

- Node.js 20+
- Shopify CLI (`npm install -g @shopify/cli @shopify/plugin-ngrok`)
- GitHub account with Actions enabled
- Shopify Partner account with an app created

### Local Development

```bash
# Install dependencies
npm install

# Setup database
npm run setup

# Start dev server
npm run dev
```

### Environment Variables

Create `.env` from `.env.example`:

```env
SHOPIFY_API_KEY=your_shopify_client_id
SHOPIFY_API_SECRET=your_shopify_client_secret
SHOPIFY_APP_URL=https://your-domain.com
SCOPES=read_products
NODE_ENV=development
DATABASE_URL=file:./prisma/dev.sqlite
PORT=3000
```

## Deployment to Hong Kong Server

### Server Requirements

- Ubuntu 20.04+
- Nginx
- Node.js 20+
- PM2 (`npm install -g pm2`)
- Domain DNS pointing to server IP

### One-Time Server Setup

SSH to your server and run the following steps:

#### 1. Create Directory Structure

```bash
sudo mkdir -p /var/www/adaiwiz/{releases,shared}
sudo chown -R $USER:$USER /var/www/adaiwiz
```

#### 2. Install Node.js (if not already installed)

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
npm install -g pm2
```

#### 3. Create Production .env

```bash
nano /var/www/adaiwiz/shared/.env
```

```env
SHOPIFY_API_KEY=your_shopify_client_id
SHOPIFY_API_SECRET=your_shopify_client_secret
SHOPIFY_APP_URL=https://www.adaiwiz.com
SCOPES=read_products
NODE_ENV=production
PORT=3000
DATABASE_URL=file:/var/www/adaiwiz/shared/production.sqlite
```

```bash
chmod 600 /var/www/adaiwiz/shared/.env
```

#### 4. Install & Configure Nginx with SSL

```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Stop nginx temporarily for certbot
sudo pkill -9 nginx
sleep 2

# Create webroot for ACME challenges
mkdir -p /var/www/adaiwiz/shared/.well-known/acme-challenge

# Request Let's Encrypt certificate
sudo certbot certonly --webroot -w /var/www/adaiwiz/shared -d www.your-domain.com --non-interactive --agree-tos --email your-email@domain.com

# Create nginx config
sudo tee /etc/nginx/sites-available/adaiwiz > /dev/null <<'NGINX'
server {
    listen 80;
    server_name www.your-domain.com;
    return 301 https://www.your-domain.com$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/www.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.your-domain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;

    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

# Enable site and remove default
sudo ln -sfn /etc/nginx/sites-available/adaiwiz /etc/nginx/sites-enabled/adaiwiz
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t

# Start nginx (not via systemctl if running manually)
sudo nginx
```

#### 5. Verify SSL Certificate Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Ensure renewal timer is active
sudo systemctl list-timers | grep certbot
```

### GitHub Actions Deployment

#### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `HK_SERVER_HOST` | Server IP address |
| `HK_SERVER_USER` | SSH username (e.g., `ubuntu`) |
| `HK_SERVER_SSH_KEY` | Private SSH key for deployment |
| `SHOPIFY_API_SECRET` | Shopify app client secret |

#### Deploy Workflow

Push to `main` branch or manually trigger:

```bash
gh workflow run deploy-hk.yml
```

#### Post-Deploy Server Steps

After GitHub Actions deploys the code, SSH to server and run:

```bash
# Navigate to current release
cd /var/www/adaiwiz/current

# Run database migrations
npm run setup

# Restart PM2
pm2 delete adaiwiz 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 list
```

### PM2 Process Management

```bash
# View logs
pm2 logs adaiwiz --lines 100

# Restart
pm2 restart adaiwiz --update-env

# Monitor
pm2 monit
```

### Nginx Management

```bash
# Reload config (if not using systemctl)
sudo nginx -s reload

# Restart (kill all nginx, then start fresh)
sudo pkill -9 nginx
sudo nginx

# Test config
sudo nginx -t
```

## Shopify App Configuration

### Local Config (shopify.app.toml)

```toml
client_id = "your_shopify_client_id"
name = "your-app-name"
application_url = "https://www.your-domain.com"
embedded = true

[access_scopes]
scopes = "read_products"

[auth]
redirect_urls = [
  "https://www.your-domain.com/auth/callback",
  "https://www.your-domain.com/auth/shopify/callback",
  "https://www.your-domain.com/api/auth/callback"
]
```

### Deploy Config to Shopify

```bash
shopify app deploy
```

## Troubleshooting

### OAuth Redirects to Wrong App

If OAuth redirects to a different app (e.g., old app with different `client_id`), check:

1. **Server .env**: `SHOPIFY_API_KEY` must match the current Shopify app's Client ID
   ```bash
   grep "^SHOPIFY_API_KEY=" /var/www/adaiwiz/shared/.env
   ```

2. **Restart app after changing .env**:
   ```bash
   pm2 restart adaiwiz --update-env
   pm2 save
   ```

3. **Verify OAuth URL**:
   ```bash
   curl -X POST http://127.0.0.1:3000/auth/login \
     -d "shop=your-store.myshopify.com" -i | grep location:
   ```
   The `client_id` in the redirect URL must be the correct one.

### EADDRINUSE on Port 3000

Another process is using port 3000. Find and kill it:

```bash
sudo ss -ltnp | grep ':3000'
sudo kill <PID>
pm2 restart adaiwiz
```

### Nginx Not Listening on Port 443

1. **Check SSL certificate exists**:
   ```bash
   ls /etc/letsencrypt/live/www.your-domain.com/
   ```

2. **If cert missing, re-request**:
   ```bash
   sudo certbot certonly --webroot -w /var/www/adaiwiz/shared -d www.your-domain.com --non-interactive --agree-tos --email your@email.com
   ```

3. **Reload nginx**:
   ```bash
   sudo pkill -9 nginx
   sudo nginx
   ```

### "Module not found" Errors After Deploy

Run setup on server:

```bash
cd /var/www/adaiwiz/current
npm run setup
pm2 restart adaiwiz
```

### PM2 Shows "errored" But App is Running

The app may have been started manually outside PM2. Clean up:

```bash
# Find non-PM2 node processes
ps aux | grep "react-router" | grep -v grep

# Kill them
sudo kill <PID>

# Restart via PM2
pm2 delete adaiwiz
pm2 start /var/www/adaiwiz/current/ecosystem.config.cjs
pm2 save
```

### Database Connection Issues

Ensure `DATABASE_URL` in `.env` uses absolute path for production:

```env
DATABASE_URL=file:/var/www/adaiwiz/shared/production.sqlite
```

And Prisma schema uses env var:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

## Directory Structure

```
/var/www/adaiwiz/
├── current -> /var/www/adaiwiz/releases/<timestamp>  (symlink)
├── releases/
│   └── <timestamp>/
│       ├── app/                  (React Router frontend)
│       ├── prisma/               (Database schema)
│       ├── package.json
│       └── ecosystem.config.cjs
└── shared/
    ├── .env                      (Production secrets)
    └── production.sqlite          (Production database)
```

## Useful Commands

```bash
# Full server status check
pm2 list && sudo ss -ltnp | grep -E ':80|:443|:3000' && curl -sS --max-time 5 https://www.your-domain.com | head -1

#查看 PM2 环境变量
pm2 env adaiwiz | grep -E "SHOPIFY_|PORT|NODE_ENV"

#查看最近日志
pm2 logs adaiwiz --lines 30

#强制重启
pm2 delete adaiwiz && pm2 start /var/www/adaiwiz/current/ecosystem.config.cjs && pm2 save
```

## License

MIT
