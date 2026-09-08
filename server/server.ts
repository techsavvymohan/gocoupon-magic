/**
 * @file server/server.ts
 * @description Dedicated Production Node.js + Express Server for GoCoupon.
 *
 * Runs 24/7 on a VPS, PM2, or Docker container with:
 * - Pure Express architecture (no serverless wrappers, zero cold starts)
 * - Persistent in-memory and Redis-backed caching
 * - Full CORS & JSON parsing middleware
 * - Clean modular routing for /api/*
 * - High-speed static file serving for dist/ with pre-rendered SEO route support & SPA fallback
 * - Integrated 24/7 background price monitoring worker
 * - Production health checks & graceful shutdown
 */
// Automatically load environment variables from .env if running standalone outside Docker
try {
  process.loadEnvFile();
} catch {}

import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { apiRouter } from "./routes/index.js";
import { startBackgroundWorkers, stopBackgroundWorkers } from "./workers/price-watcher.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "../dist");

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";

// Trust proxy for VPS reverse proxy setups (Nginx, Caddy, Cloudflare)
app.set("trust proxy", 1);

// Standard Middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

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

// 2. Mount API Routes
app.use("/api", apiRouter);

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

  // General static files (favicon, sitemap.xml, robots.txt, etc.)
  app.use(
    express.static(distDir, {
      maxAge: "1h",
      index: false, // Handle index routing explicitly below
    })
  );

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

    const cleanPath = req.path.replace(/\/+$/, "") || "/";

    // A. Check root index.html
    if (cleanPath === "/") {
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

    // D. SPA Fallback: send dist/index.html for TanStack Router
    const fallbackHtml = path.join(distDir, "index.html");
    if (fs.existsSync(fallbackHtml)) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.sendFile(fallbackHtml);
    }

    next();
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
  console.log(`🏢 Stores API:   http://${HOST}:${PORT}/api/stores`);
  console.log(`🔥 Deals API:    http://${HOST}:${PORT}/api/deals`);
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
