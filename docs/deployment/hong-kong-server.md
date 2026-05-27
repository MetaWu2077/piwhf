# Deploy AdAIWiz to a Hong Kong server

This project is deployed to `/var/www/adaiwiz` with this layout:

```text
/var/www/adaiwiz
├── current -> releases/<timestamp>
├── releases/
├── shared/
│   ├── .env
│   └── production.sqlite
├── adaiwiz-release.tgz
└── deploy.sh
```

Runtime stack:

- Node.js 22
- npm
- Prisma
- SQLite for current MVP
- PM2 process manager
- Nginx reverse proxy to `127.0.0.1:3000`

## GitHub Secrets already required

```text
HK_SERVER_HOST
HK_SERVER_USER
HK_SERVER_SSH_KEY
```

## Additional production secrets

The deployment creates this file if missing:

```text
/var/www/adaiwiz/shared/.env
```

You must fill it on the server:

```env
SHOPIFY_API_KEY=your_shopify_client_id
SHOPIFY_API_SECRET=your_shopify_client_secret
SHOPIFY_APP_URL=https://www.adaiwiz.com
SCOPES=read_products
NODE_ENV=production
PORT=3000
DATABASE_URL=file:/var/www/adaiwiz/shared/production.sqlite
```

Then restart:

```bash
pm2 restart adaiwiz --update-env
```

## Deploy from GitHub Actions

Push to `main`, or manually run:

```text
GitHub → Actions → Deploy to Hong Kong server → Run workflow
```

## Nginx

Copy the example:

```bash
sudo cp /var/www/adaiwiz/current/nginx/adaiwiz.conf.example /etc/nginx/sites-available/adaiwiz
sudo nano /etc/nginx/sites-available/adaiwiz
sudo ln -s /etc/nginx/sites-available/adaiwiz /etc/nginx/sites-enabled/adaiwiz
sudo nginx -t
sudo systemctl reload nginx
```

The example is prefilled with `www.adaiwiz.com` and `adaiwiz.com`.

## HTTPS

Recommended with Certbot:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d www.adaiwiz.com -d adaiwiz.com
```

## Shopify app configuration

After you have a real domain, update Shopify app config so these values match production:

```toml
application_url = "https://www.adaiwiz.com"

[access_scopes]
scopes = "read_products"

[auth]
redirect_urls = [
  "https://www.adaiwiz.com/auth/callback",
  "https://www.adaiwiz.com/auth/shopify/callback",
  "https://www.adaiwiz.com/api/auth/callback"
]
```

Then deploy config:

```bash
shopify app deploy
```

## Useful commands

```bash
pm2 status
pm2 logs adaiwiz
pm2 restart adaiwiz --update-env
cd /var/www/adaiwiz/current && npm run setup
```
