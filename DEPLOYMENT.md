# GoCoupon Production Deployment & Operations Manual

This guide covers setting up, running, and maintaining the GoCoupon platform on a dedicated Linux VPS (Ubuntu 22.04 / 24.04 LTS), Docker, or standalone Node.js environment.

---

## 1. System Requirements

* **Operating System:** Ubuntu 22.04 / 24.04 LTS, Debian 12, or Alpine Linux.
* **Node.js Runtime:** Node.js v20.x or v22.x LTS.
* **Memory (RAM):** Minimum 1 GB (2 GB+ recommended for concurrent SearXNG metasearch).
* **Disk Space:** 10 GB SSD.
* **Network:** Open outbound HTTPS ports (80, 443) and inbound HTTP/HTTPS.

---

## 2. Environment Configuration (`.env`)

Create a `.env` file in the project root with the following variables:

```bash
# ------------------------------------------------------------------------------
# 1. Server Core Configuration
# ------------------------------------------------------------------------------
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
APP_URL=https://gocoupon.io

# ------------------------------------------------------------------------------
# 2. Database & Persistence (Primary Supabase Cloud)
# ------------------------------------------------------------------------------
DATABASE_URL=postgresql://postgres.xxx:yyy@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...

# ------------------------------------------------------------------------------
# 3. Affiliate Ingestion APIs (24/7 Deal Engine)
# ------------------------------------------------------------------------------
CUELINKS_API_KEY=your_cuelinks_api_key_v3
CUELINKS_CAMPAIGN_ID=your_campaign_id
ADMITAD_CLIENT_ID=your_admitad_client_id
ADMITAD_CLIENT_SECRET=your_admitad_client_secret

# ------------------------------------------------------------------------------
# 4. Price Comparison & Metasearch
# ------------------------------------------------------------------------------
SERPAPI_API_KEY=your_serpapi_key_optional
SEARXNG_URL=http://127.0.0.1:8888

# ------------------------------------------------------------------------------
# 5. Email & Notification Delivery (SpaceMail / Nodemailer)
# ------------------------------------------------------------------------------
SMTP_HOST=mail.spacemail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=support@gocoupon.io
SMTP_PASS=your_smtp_password
SMTP_FROM="GoCoupon Support" <support@gocoupon.io>
ADMIN_EMAIL=admin@gocoupon.io

# ------------------------------------------------------------------------------
# 6. Admin Control Panel Security
# ------------------------------------------------------------------------------
ADMIN_PASSWORD=your_strong_admin_secret_key_minimum_32_chars
```

---

## 3. Installation & Static Build Pipeline

Run the build pipeline to generate the static pre-rendered SEO pages:

```bash
# 1. Install dependencies
npm install

# 2. Run TypeScript check
npm run typecheck

# 3. Generate production bundle and 145+ pre-rendered SEO pages
npm run build
```

The build script compiles client-side assets into `dist/` and runs `scripts/generate-routes.js` to create standalone `.html` files for all core routes.

---

## 4. Running the Process Daemon (PM2)

Using **PM2** ensures the Express server runs 24/7, restarts automatically on crash, and launches on system reboots:

```bash
# Install PM2 globally
npm install -g pm2

# Start GoCoupon Express Server
pm2 start "node --env-file=.env server/server.ts" --name "gocoupon-engine"

# (Optional) Start SearXNG metasearch daemon if running locally
pm2 start "python3 -m searx.webapp" --name "searxng-engine" --cwd "./services/searxng"

# Save PM2 process list and configure system startup
pm2 save
pm2 startup
```

### Useful PM2 Commands
```bash
pm2 status                  # View status and memory usage
pm2 logs gocoupon-engine    # View live server logs
pm2 reload gocoupon-engine  # Zero-downtime reload
```

---

## 5. Reverse Proxy Configuration (Caddy Server)

Caddy automatically provisions free SSL/TLS certificates (Let's Encrypt / ZeroSSL), enables HTTP/3, and handles edge gzip compression.

Create or update `/etc/caddy/Caddyfile` (or use the project's root `Caddyfile`):

```caddyfile
# Canonical 301 Redirect: www -> apex
www.gocoupon.io {
    redir https://gocoupon.io{uri} permanent
}

gocoupon.io {
    encode gzip zstd

    # Security & HSTS Headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    # Proxy all traffic to persistent Express VPS server
    reverse_proxy 127.0.0.1:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}
```

Reload Caddy:
```bash
sudo systemctl reload caddy
```

---

## 6. Automated Production Verification

After deployment, run the automated production test suite to verify all endpoints and the database connection:

```bash
# Run 40-test production audit
npx tsx --env-file=.env scripts/full-production-audit.mjs

# Run 8-test security suite
node scripts/test-security.mjs
```

Expected result: **40 / 40 Passed (100%)** and **8 / 8 Security Tests Passed**.

---

## 7. Backup & Maintenance Procedures

1. **Database Backups**:
   Supabase performs automated daily backups. You can also run manual logical backups using `pg_dump`:
   ```bash
   pg_dump "$DATABASE_URL" > gocoupon_backup_$(date +%F).sql
   ```
2. **Local Fallback Data**:
   Ensure `server/data/` is included in regular server backups (`live-deals.json`, `blogs.json`, `admin-submissions.json`).

---

## 8. Automated GitHub Actions CI/CD Pipeline

Every push to the `main` branch triggers an automated zero-downtime production deployment:

```
git push origin main
       │
       ▼
GitHub Actions Runner (Cloud)
├── npm ci
├── npm run build (Bundles & generates 147 SEO static routes)
└── Verifies dist/index.html & sitemap.xml
       │
       ▼ (If build passes)
Secure SCP Transfer to VPS (/var/www/gocoupon)
       │
       ▼
pm2 reload gocoupon-web --update-env (0s Downtime)
```

### GitHub Repository Secrets
Configured in **Settings ➔ Secrets and variables ➔ Actions**:
* `VPS_HOST`: `50.6.37.40`
* `VPS_USER`: `root`
* `VPS_SSH_KEY`: Dedicated OpenSSH private key for automated deployments.

