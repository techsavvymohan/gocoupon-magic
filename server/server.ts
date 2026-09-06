/**
 * @file server/server.ts
 * @description Production-Grade Standalone HTTP Server for GoCoupon.
 *
 * Runs 24/7 on a VPS or container with:
 * - Persistent in-memory cache and Redis connectivity (zero cold starts)
 * - Zero serverless timeout restrictions
 * - Universal adapter executing all api/*.ts endpoints directly
 * - High-speed static file serving for dist/ with SPA fallback
 * - Health checks & graceful shutdown
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Import existing API handlers
import compareHandler from "../api/compare.js";
import shoppingHandler from "../api/shopping.js";
import searxngHandler from "../api/searxng.js";
import resolveHandler from "../api/resolve.js";
import priceHistoryHandler from "../api/price-history.js";
import couponsHandler from "../api/coupons.js";
import searchHandler from "../api/search.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "../dist");

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

/**
 * Adapter enhancing Node http.IncomingMessage and http.ServerResponse
 * into VercelRequest and VercelResponse compatible interfaces.
 */
function adaptRequestResponse(req: http.IncomingMessage, res: http.ServerResponse, urlObj: URL) {
  const queryObj: Record<string, string> = {};
  for (const [k, v] of urlObj.searchParams.entries()) {
    queryObj[k] = v;
  }

  // Extend request
  (req as any).query = queryObj;
  (req as any).cookies = {};

  // Extend response
  const originalStatus = res.statusCode;
  (res as any).status = function (code: number) {
    res.statusCode = code;
    return res;
  };

  (res as any).json = function (data: any) {
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
    }
    res.end(JSON.stringify(data));
    return res;
  };

  (res as any).send = function (data: any) {
    res.end(data);
    return res;
  };

  return { vercelReq: req as any, vercelRes: res as any };
}

const server = http.createServer(async (req, res) => {
  const urlString = req.url || "/";
  const urlObj = new URL(urlString, `http://${req.headers.host || "localhost"}`);
  const pathname = urlObj.pathname;

  // 1. Health Check Endpoint
  if (pathname === "/api/health") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        status: "healthy",
        service: "GoCoupon Commerce Engine",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      })
    );
    return;
  }

  // 2. API Routes Dispatcher
  if (pathname.startsWith("/api/")) {
    const { vercelReq, vercelRes } = adaptRequestResponse(req, res, urlObj);

    try {
      if (pathname === "/api/compare") {
        await compareHandler(vercelReq, vercelRes);
        return;
      }
      if (pathname === "/api/shopping") {
        await shoppingHandler(vercelReq, vercelRes);
        return;
      }
      if (pathname === "/api/searxng") {
        await searxngHandler(vercelReq, vercelRes);
        return;
      }
      if (pathname === "/api/resolve") {
        await resolveHandler(vercelReq, vercelRes);
        return;
      }
      if (pathname === "/api/price-history") {
        await priceHistoryHandler(vercelReq, vercelRes);
        return;
      }
      if (pathname === "/api/coupons") {
        await couponsHandler(vercelReq, vercelRes);
        return;
      }
      if (pathname === "/api/search") {
        await searchHandler(vercelReq, vercelRes);
        return;
      }

      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: `API endpoint ${pathname} not found` }));
      return;
    } catch (err: any) {
      console.error(`API Error on ${pathname}:`, err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Internal Server Error", message: err.message }));
      }
      return;
    }
  }

  // 3. Static Files Serving from dist/
  if (fs.existsSync(distDir)) {
    let filePath = path.join(distDir, pathname === "/" ? "index.html" : pathname);

    // If file directly exists, serve it
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      res.statusCode = 200;
      res.setHeader("Content-Type", contentType);

      if (pathname.startsWith("/assets/")) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }

      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // Check pre-rendered HTML path (e.g. /flipkart-coupons -> dist/flipkart-coupons.html or dist/flipkart-coupons/index.html)
    const directHtmlPath = `${filePath}.html`;
    if (fs.existsSync(directHtmlPath) && fs.statSync(directHtmlPath).isFile()) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      fs.createReadStream(directHtmlPath).pipe(res);
      return;
    }

    // SPA Fallback: dist/index.html
    const fallbackHtml = path.join(distDir, "index.html");
    if (fs.existsSync(fallbackHtml)) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      fs.createReadStream(fallbackHtml).pipe(res);
      return;
    }
  }

  res.statusCode = 404;
  res.end("Not Found");
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 GoCoupon Standalone Server running at http://${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/api/health`);
  console.log(`🔍 Static directory: ${fs.existsSync(distDir) ? distDir : "Not yet built (run npm run build)"}`);
});

// Graceful Shutdown
function handleShutdown() {
  console.log("\nStopping server gracefully...");
  server.close(() => {
    console.log("Server stopped.");
    process.exit(0);
  });
}
process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
