/**
 * @file server/routes/realtime.ts
 * @description High-Performance Server-Sent Events (SSE) Realtime Event Stream for GoCoupon.
 *
 * Provides sub-second event broadcasts for:
 *   - Live deal creation, updates, and deletions
 *   - Community coupon submissions
 *   - Realtime deal usage/click counters
 *   - Merchant store updates
 *   - 24/7 background sync notifications
 */

import { Router, type Request, type Response } from "express";

export const realtimeRouter = Router();

// Set of active client SSE connections
const activeClients = new Set<Response>();

export type RealtimeEventType =
  | "deal:created"
  | "deal:updated"
  | "deal:deleted"
  | "deal:submitted"
  | "deal:clicked"
  | "store:created"
  | "store:updated"
  | "store:deleted"
  | "sync:completed"
  | "ping";

export interface RealtimeMessage {
  type: RealtimeEventType;
  payload?: any;
  timestamp: string;
}

/**
 * Broadcasts an event to all connected browsers in real-time.
 */
export function broadcastRealtimeEvent(type: RealtimeEventType, payload?: any): void {
  const message: RealtimeMessage = {
    type,
    payload,
    timestamp: new Date().toISOString(),
  };

  const payloadString = `data: ${JSON.stringify(message)}\n\n`;

  for (const client of activeClients) {
    try {
      client.write(payloadString);
    } catch {
      activeClients.delete(client);
    }
  }
}

// 15-second heartbeat ping to prevent proxy/browser timeouts
const heartbeat = setInterval(() => {
  broadcastRealtimeEvent("ping", {
    status: "alive",
    subscribersCount: activeClients.size,
  });
}, 15000);

if (heartbeat.unref) heartbeat.unref();

/**
 * GET /api/realtime/events or /api/realtime/stream
 * Connects a client to the live SSE stream.
 */
function handleRealtimeStream(req: Request, res: Response) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "X-Accel-Buffering": "no",
  });

  if (typeof (res as any).flushHeaders === "function") {
    (res as any).flushHeaders();
  }

  // Welcome handshake
  const welcome: RealtimeMessage = {
    type: "ping",
    payload: {
      status: "connected",
      message: "GoCoupon Realtime Event Bus Connected",
      activeClients: activeClients.size + 1,
    },
    timestamp: new Date().toISOString(),
  };
  res.write(`data: ${JSON.stringify(welcome)}\n\n`);

  activeClients.add(res);

  req.on("close", () => {
    activeClients.delete(res);
  });
}

realtimeRouter.get("/events", handleRealtimeStream);
realtimeRouter.get("/stream", handleRealtimeStream);

/**
 * GET /api/realtime/status
 * Returns current health and active connection count.
 */
realtimeRouter.get("/status", (_req: Request, res: Response) => {
  res.json({
    status: "online",
    activeSubscribers: activeClients.size,
    timestamp: new Date().toISOString(),
  });
});
