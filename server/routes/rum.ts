/**
 * @file server/routes/rum.ts
 * @description Real User Monitoring (RUM) Collector Endpoint for Core Web Vitals.
 *
 * Receives non-blocking beacons from client browsers measuring:
 * - LCP (Largest Contentful Paint)
 * - INP (Interaction to Next Paint)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 */

import { Router, type Request, type Response } from "express";
import { requireAdminAuth } from "./admin.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";

export const rumRouter = Router();

interface VitalSample {
  metric: "LCP" | "INP" | "CLS" | "FCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  path: string;
  timestamp: string;
  connection?: string;
}

const maxSamples = 500;
const samples: VitalSample[] = [];

/**
 * POST /api/rum/vitals
 * Receives beacon payloads from client-side Web Vitals monitor.
 */
rumRouter.post("/vitals", (req: Request, res: Response) => {
  try {
    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    const rateCheck = apiRateLimiter.check(`rum:${clientIp}`, 60, 60 * 1000);
    if (!rateCheck.allowed) {
      res.status(429).end();
      return;
    }

    const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (data && data.metric && typeof data.value === "number") {
      samples.unshift({
        metric: data.metric,
        value: data.value,
        rating: data.rating || "good",
        path: (data.path || "/").slice(0, 100),
        timestamp: data.timestamp || new Date().toISOString(),
        connection: data.connection || "unknown",
      });

      if (samples.length > maxSamples) {
        samples.length = maxSamples;
      }
    }
    // Return 204 No Content for beacons
    res.status(204).end();
  } catch (err: any) {
    res.status(400).json({ error: "Invalid RUM payload" });
  }
});

/**
 * GET /api/rum/vitals
 * Serves aggregated Core Web Vitals health metrics for admin dashboards.
 */
rumRouter.get("/vitals", requireAdminAuth, (_req: Request, res: Response) => {
  const metrics = ["LCP", "INP", "CLS", "FCP", "TTFB"] as const;
  const summary: Record<string, { count: number; avg: number; goodPercent: number; status: string }> = {};

  for (const m of metrics) {
    const matching = samples.filter((s) => s.metric === m);
    if (matching.length === 0) {
      summary[m] = { count: 0, avg: 0, goodPercent: 100, status: "No samples yet" };
      continue;
    }
    const sum = matching.reduce((acc, s) => acc + s.value, 0);
    const avg = Number((sum / matching.length).toFixed(m === "CLS" ? 3 : 0));
    const goodCount = matching.filter((s) => s.rating === "good").length;
    const goodPercent = Math.round((goodCount / matching.length) * 100);

    let status = "good";
    if (goodPercent < 75) status = "needs-improvement";
    if (goodPercent < 50) status = "poor";

    summary[m] = {
      count: matching.length,
      avg,
      goodPercent,
      status,
    };
  }

  res.setHeader("Cache-Control", "no-cache");
  res.json({
    success: true,
    totalSamples: samples.length,
    vitalsThresholds: {
      LCP: "Good: <= 2.5s",
      INP: "Good: <= 200ms",
      CLS: "Good: <= 0.1",
      FCP: "Good: <= 1.8s",
      TTFB: "Good: <= 800ms",
    },
    summary,
    recentSamples: samples.slice(0, 20),
  });
});
