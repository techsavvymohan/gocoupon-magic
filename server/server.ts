/**
 * @file server/server.ts
 * @description Dedicated Production Node.js + Express Server for GoCoupon.
 *
 * Runs 24/7 on a VPS, PM2, or Docker container with:
 * - Pure Express architecture (no serverless wrappers, zero cold starts)
 * - Gzip compression for all text/JS/CSS responses (60-70% size reduction)
 * - Persistent in-memory and Redis-backed caching
 * - Full CORS & JSON parsing middleware
 * - Clean modular routing for /api/*
 * - High-speed static file serving for dist/ with pre-rendered SEO route support & SPA fallback
 * - Integrated 24/7 background price monitoring worker
 * - Production health checks & graceful shutdown
 */
import "./env.js";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import compression from "compression";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { apiRouter } from "./routes/index.js";
import { redirectRouter } from "./routes/redirect.js";
import { postbackRouter } from "./routes/postback.js";
import { startBackgroundWorkers, stopBackgroundWorkers } from "./workers/price-watcher.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "../dist");

// Reliably load environment variables from .env using absolute path
try {
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    process.loadEnvFile(envPath);
    console.log(`[Env] Loaded environment from ${envPath}`);
  } else {
    process.loadEnvFile();
  }
} catch (err: any) {
  console.warn(`[Env] process.loadEnvFile notice: ${err?.message || err}`);
}

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";

// Security: Disable X-Powered-By header
app.disable("x-powered-by");

// Trust proxy for VPS reverse proxy setups (Nginx, Caddy, Cloudflare)
app.set("trust proxy", 1);

// ─── Gzip Compression (60-70% bandwidth reduction) ────────────────────────────
// Must be placed BEFORE static middleware and routes.
// Threshold 1kb: don't compress tiny responses (overhead > gain)
app.use(
  compression({
    level: 6,          // balanced: good ratio, minimal CPU
    threshold: 1024,   // only compress responses > 1 kB
    filter: (req, res) => {
      // Never compress already-compressed image/video formats
      const ct = res.getHeader("Content-Type") as string | undefined;
      if (ct && /image\/(png|jpg|jpeg|gif|webp)|video\//.test(ct)) return false;
      return compression.filter(req, res);
    },
  })
);

// Enable ETag-based conditional requests (304 Not Modified) for static assets
app.set("etag", "strong");

// HTTP Security & Transport Headers (Clickjacking, MIME-sniffing, XSS, & Downgrade Defense)
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://utt.impactcdn.com https://www.thunderbolt.com https://www.googletagmanager.com https://*.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://apis.google.com https://s.skimresources.com https://*.skimresources.com https://cdn0.cuelinks.com https://*.cuelinks.com https://linksredirect.com https://*.admitad.com https://ad.admitad.com https://*.admitad-connect.com https://*.tjzuh.com https://*.rzekl.com https://*.bednari.com https://*.kjuzv.com https://*.hxbok.com https://*.ntzgd.com https://*.ali.click https://*.xpuvo.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.thunderbolt.com; img-src 'self' data: blob: https: http: https://*.google-analytics.com https://*.googletagmanager.com https://*.cuelinks.com https://linksredirect.com https://*.admitad.com https://ad.admitad.com https://*.admitad-connect.com https://*.tjzuh.com https://*.rzekl.com https://*.bednari.com https://*.kjuzv.com https://*.hxbok.com https://*.ntzgd.com https://*.ali.click https://*.xpuvo.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: wss: http://localhost:* http://127.0.0.1:* https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://s.skimresources.com https://*.skimresources.com https://*.cuelinks.com https://linksredirect.com https://*.admitad.com https://ad.admitad.com https://*.admitad-connect.com https://*.tjzuh.com https://*.rzekl.com https://*.bednari.com https://*.kjuzv.com https://*.hxbok.com https://*.ntzgd.com https://*.ali.click https://*.xpuvo.com; frame-src 'self' https://www.thunderbolt.com https://chromewebstore.google.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self' https:; upgrade-insecure-requests;"
  );
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader(
    "Permissions-Policy",
    'camera=(), microphone=(self "https://www.thunderbolt.com"), geolocation=(), payment=(self)'
  );
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  next();
});

// Standard Middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  })
);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// ─── Global Path Traversal Guard ──────────────────────────────────────────────
// Block any request whose raw URL contains directory traversal sequences.
// This runs before routing so ../ cannot reach static files or API routes.
app.use((req: Request, res: Response, next: NextFunction) => {
  const rawUrl = req.originalUrl || req.url || "";
  try {
    const decoded = decodeURIComponent(rawUrl);
    if (/(?:\.\.|%2e%2e|%252e|\\\.\\\.)/i.test(decoded)) {
      res.status(400).json({ error: "Bad Request: Path traversal not allowed." });
      return;
    }
  } catch {
    if (/(?:\.\.|%2e%2e|%252e|\\\.\\\.)/i.test(rawUrl)) {
      res.status(400).json({ error: "Bad Request: Path traversal not allowed." });
      return;
    }
  }
  next();
});

// Request logger for API calls
app.use("/api", (req: Request, _res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== "test") {
    console.log(`[API] ${req.method} ${req.originalUrl}`);
  }
  next();
});


// 1. Health Check Endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "GoCoupon VPS Engine",
    architecture: "Persistent Node.js + Express Server",
    serverless: false,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  });
});

// 2. Mount API Routes & Outbound Deal Redirection
app.use("/api", apiRouter);
app.use(["/out", "/redirect"], redirectRouter);
app.use(["/postback", "/api/postback"], postbackRouter);

// 3. Static Files & SPA Pre-rendered Serving from dist/
if (fs.existsSync(distDir)) {
  // Static assets with long-term caching
  app.use(
    "/assets",
    express.static(path.join(distDir, "assets"), {
      maxAge: "1y",
      immutable: true,
    })
  );

  // General static files (favicon, sitemap.xml, robots.txt, images, etc.)
  app.use(
    express.static(distDir, {
      maxAge: "1h",
      setHeaders: (res, filePath) => {
        if (/\.(webp|png|svg|ico|jpg|jpeg|woff2)$/i.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
      index: false, // Handle index routing explicitly below
      redirect: false, // Prevent automatic 301 directory redirects so /route serves immediately
      dotfiles: "allow", // Allow RFC 9116 /.well-known/security.txt
    })
  );

  // RFC 9116 security.txt dedicated route
  app.get("/.well-known/security.txt", (_req: Request, res: Response) => {
    const candidatePaths = [
      path.resolve(process.cwd(), "public", ".well-known", "security.txt"),
      path.resolve(distDir, ".well-known", "security.txt"),
      path.resolve(__dirname, "../public/.well-known/security.txt"),
    ];
    for (const target of candidatePaths) {
      if (fs.existsSync(target)) {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.send(fs.readFileSync(target, "utf-8"));
      }
    }
    res.status(404).send("Not found");
  });

  // RFC 8461 MTA-STS policy dedicated route
  app.get("/.well-known/mta-sts.txt", (_req: Request, res: Response) => {
    const candidatePaths = [
      path.resolve(process.cwd(), "public", ".well-known", "mta-sts.txt"),
      path.resolve(distDir, ".well-known", "mta-sts.txt"),
      path.resolve(__dirname, "../public/.well-known/mta-sts.txt"),
    ];
    for (const target of candidatePaths) {
      if (fs.existsSync(target)) {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.send(fs.readFileSync(target, "utf-8"));
      }
    }
    res.status(404).send("Not found");
  });

  // Pre-rendered SEO HTML routes + SPA fallback
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Only handle GET requests for web pages
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }

    // Never serve SPA HTML for unmatched API routes
    if (req.path.startsWith("/api/")) {
      return next();
    }

    // 1. Host normalization: redirect www.gocoupon.io -> gocoupon.io
    const host = req.headers.host || "";
    if (host.startsWith("www.")) {
      return res.redirect(301, `https://gocoupon.io${req.url}`);
    }

    // 2. Trailing-slash normalization: 301 redirect /path/ -> /path (except root "/")
    if (req.path.length > 1 && req.path.endsWith("/")) {
      const cleanTrailing = req.path.replace(/\/+$/, "");
      const queryString = req.url.slice(req.path.length);
      return res.redirect(301, cleanTrailing + queryString);
    }

    const cleanPath = req.path.replace(/\/+$/, "") || "/";

    // 3. Clean 301 redirect for legacy/subpath store links: /stores/:slug -> /:slug-coupons
    if (cleanPath.startsWith("/stores/") && cleanPath.length > 8) {
      const rawStoreSlug = cleanPath.slice(8).replace(/-coupons$/, "").trim();
      if (rawStoreSlug) {
        return res.redirect(301, `/${rawStoreSlug}-coupons`);
      }
    }

    // 4. Clean 301 redirects for all known duplicate/alias store slugs
    const CANONICAL_SLUG_REDIRECTS: Record<string, string> = {
      "/tatacliq-coupons": "/tata-cliq-coupons",
      "/tatacliq": "/tata-cliq-coupons",
      "/bestbuy-coupons": "/best-buy-coupons",
      "/bestbuy": "/best-buy-coupons",
      "/bookingcom-coupons": "/booking-com-coupons",
      "/bookingcom": "/booking-com-coupons",
      "/siderai-coupons": "/sider-ai-coupons",
      "/siderai": "/sider-ai-coupons",
      "/adcreativeai-coupons": "/adcreative-ai-coupons",
      "/adcreativeai": "/adcreative-ai-coupons",
      "/reclaimai-coupons": "/reclaim-ai-coupons",
      "/reclaimai": "/reclaim-ai-coupons",
      "/tripcom-coupons": "/trip-com-coupons",
      "/tripcom": "/trip-com-coupons",
      "/domaincom-coupons": "/domain-com-coupons",
      "/domaincom": "/domain-com-coupons",
      "/replyio-coupons": "/reply-io-coupons",
      "/replyio": "/reply-io-coupons",
      "/allegropl-coupons": "/allegro-pl-coupons",
      "/allegropl": "/allegro-pl-coupons",
      "/aosomcom-coupons": "/aosom-com-coupons",
      "/aosomcom": "/aosom-com-coupons",
      "/apohealthde-coupons": "/apohealth-de-coupons",
      "/apohealthde": "/apohealth-de-coupons",
      "/answearsi-coupons": "/answear-si-coupons",
      "/answearsi": "/answear-si-coupons",
      "/answearhu-coupons": "/answear-hu-coupons",
      "/answearhu": "/answear-hu-coupons",
      "/answearhr-coupons": "/answear-hr-coupons",
      "/answearhr": "/answear-hr-coupons",
      "/agatinsvetcz-coupons": "/agatinsvet-cz-coupons",
      "/agatinsvetcz": "/agatinsvet-cz-coupons",
      "/adblockultimatenet-coupons": "/adblockultimate-net-coupons",
      "/adblockultimatenet": "/adblockultimate-net-coupons",
      "/e-armyshopcz-coupons": "/e-armyshop-cz-coupons",
      "/e-armyshopcz": "/e-armyshop-cz-coupons",
      "/banggood-cj-affiliate-program-coupons": "/banggood-coupons",
      "/raynatours-many-geos-tracking-promo-codes-coupons": "/raynatours-coupons",
      "/stylevana-affiliate-program-coupons": "/stylevana-coupons",
      "/jcpenney-affiliate-coupons": "/jcpenney-coupons",
      "/contactsdirect-affiliate-program-coupons": "/contactsdirect-coupons",
      "/caribbean-affiliate-program-coupons": "/caribbean-coupons",
      "/flyfairly-coupons": "/fly-fairly-coupons",
      "/flyfairly": "/fly-fairly-coupons",
      "/agoda": "/agoda-coupons",
      "/dhgate": "/dhgate-coupons",
      "/udemy": "/udemy-coupons",
      "/shopbop": "/shopbop-coupons",
    };

    if (CANONICAL_SLUG_REDIRECTS[cleanPath]) {
      return res.redirect(301, CANONICAL_SLUG_REDIRECTS[cleanPath]);
    }

    // HTML pages: allow browser to cache but must revalidate with server.
    // "no-cache" (NOT no-store) lets the browser use ETag/Last-Modified → 304 on repeat visits
    // This is significantly faster than no-store which forces a full re-download every time.
    res.setHeader("Cache-Control", "public, no-cache, must-revalidate");
    res.setHeader("Vary", "Accept-Encoding");

    // A. Check root index.html
    if (cleanPath === "/") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.sendFile(path.join(distDir, "index.html"));
    }

    // B. Check pre-rendered HTML (e.g. /flipkart-coupons -> dist/flipkart-coupons.html)
    const directHtmlPath = path.join(distDir, `${cleanPath}.html`);
    if (fs.existsSync(directHtmlPath) && fs.statSync(directHtmlPath).isFile()) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.sendFile(directHtmlPath);
    }

    // C. Check directory index.html (e.g. /blog/ -> dist/blog/index.html)
    const subDirHtmlPath = path.join(distDir, cleanPath, "index.html");
    if (fs.existsSync(subDirHtmlPath) && fs.statSync(subDirHtmlPath).isFile()) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.sendFile(subDirHtmlPath);
    }

    // D. Known SPA Client Routes (served via index.html with dynamic canonical)
    const KNOWN_SPA_ROUTES = new Set([
      "/admin",
      "/login",
      "/welcome",
      "/uninstall",
      "/thank-you",
      "/watchlist",
      "/categories",
      "/deals",
      "/stores",
      "/offers",
      "/compare",
      "/submit-coupon",
    ]);

    const isKnownSpaRoute =
      KNOWN_SPA_ROUTES.has(cleanPath) ||
      cleanPath.startsWith("/admin/") ||
      cleanPath.startsWith("/product/") ||
      cleanPath.startsWith("/category/") ||
      cleanPath.startsWith("/collections/");

    if (isKnownSpaRoute) {
      const fallbackHtmlPath = path.join(distDir, "index.html");
      if (fs.existsSync(fallbackHtmlPath)) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        const rawHtml = fs.readFileSync(fallbackHtmlPath, "utf-8");
        const currentUrl = `https://gocoupon.io${cleanPath}`;
        const dynamicHtml = rawHtml
          .replace(/<link\s+rel="canonical"\s+href="[^"]*"/i, `<link rel="canonical" href="${currentUrl}"`)
          .replace(/<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="https:\/\/gocoupon\.io\/"/g, (match) => {
            return match.replace("https://gocoupon.io/", currentUrl);
          });
        return res.send(dynamicHtml);
      }
    }

    // E. True 404 Handler for all unknown web pages: sends HTTP 404 with 404.html to eliminate Soft 404s
    const notFoundHtmlPath = path.join(distDir, "404.html");
    if (fs.existsSync(notFoundHtmlPath)) {
      res.status(404).setHeader("Content-Type", "text/html; charset=utf-8");
      return res.sendFile(notFoundHtmlPath);
    }

    res.status(404).send("404 Not Found");
  });
}

// 4. 404 handler for unmatched requests
app.use((req: Request, res: Response) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({ error: `API route ${req.path} not found` });
  } else {
    res.status(404).send("Not Found");
  }
});

// 5. Global error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled server error:", err);
  if (!res.headersSent) {
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message || "An unexpected error occurred",
    });
  }
});

// Start Server Listener
const server = app.listen(PORT, HOST, () => {
  console.log(`\n=================================================`);
  console.log(`🚀 GoCoupon Dedicated Express Server Running`);
  console.log(`📍 URL:          http://${HOST}:${PORT}`);
  console.log(`📊 Health:       http://${HOST}:${PORT}/api/health`);
  console.log(`🔗 Cuelinks:     http://${HOST}:${PORT}/api/cuelinks/status`);
  console.log(`🏢 Stores API:   http://${HOST}:${PORT}/api/stores`);
  console.log(`🔥 Deals API:    http://${HOST}:${PORT}/api/deals`);
  console.log(`⚖️ Compare API:  http://${HOST}:${PORT}/api/compare`);
  console.log(`📁 Static Dir:   ${fs.existsSync(distDir) ? distDir : "dist/ (build first)"}`);
  console.log(`⚡ Mode:         Persistent 24/7 VPS Server`);
  console.log(`=================================================\n`);

  // Start in-process background worker
  startBackgroundWorkers();
});

// Graceful Shutdown
function handleShutdown() {
  console.log("\nStopping server gracefully...");
  stopBackgroundWorkers();
  server.close(() => {
    console.log("Server closed. Process exiting.");
    process.exit(0);
  });
}

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);

export default app;
