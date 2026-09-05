# GoCoupon Hybrid FOSS Backend Stack

This directory contains the production-ready Docker Compose configuration for running GoCoupon's open-source price intelligence, search, and caching infrastructure.

## Services Included

| Service | Port | Purpose |
| :--- | :--- | :--- |
| **Typesense** | `8108` | Instant (<15ms) typo-tolerant product autocomplete |
| **SearXNG** | `8888` | Meta-search fallback for unindexed and new products |
| **Dragonfly** | `6379` | Multi-threaded Redis replacement for BullMQ job queues |
| **TimescaleDB** | `5432` | PostgreSQL with hyper-tables & pgvector for 90-day price trends |
| **FlareSolverr**| `8191` | Cloudflare Turnstile bypass proxy for retailer scraping |

---

## 🚀 1-Command Startup

To run the entire backend on any VPS or local developer machine:

```bash
cd docker
docker compose up -d
```

### Checking Service Health:

1. **Typesense**: `curl http://localhost:8108/health` (should return `{"ok":true}`)
2. **SearXNG**: Open `http://localhost:8888` in browser
3. **Dragonfly**: `redis-cli -p 6379 PING` (should return `PONG`)

---

## ⚙️ Connecting GoCoupon Frontend

In your root `.env.local` or hosting provider environment variables:

```env
VITE_TYPESENSE_URL=http://localhost:8108
VITE_TYPESENSE_API_KEY=xyz123_gocoupon_local_secret
SEARXNG_URL=http://localhost:8888
DATABASE_URL=postgres://gocoupon:gocoupon_secure_pass@localhost:5432/gocoupon_db
REDIS_URL=redis://localhost:6379
```

> **Note**: If Typesense is offline or restarting, GoCoupon automatically uses its internal in-memory catalog and falls back to SearXNG with zero downtime.
