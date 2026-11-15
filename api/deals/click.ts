import type { IncomingMessage, ServerResponse } from "node:http";

export interface VercelApiRequest extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string>;
  body?: Record<string, unknown>;
}

export interface VercelApiResponse extends ServerResponse {
  status?: (code: number) => VercelApiResponse;
  json?: (body: unknown) => void;
  send?: (body: unknown) => void;
}

export default async function handler(req: VercelApiRequest, res: VercelApiResponse): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed. Use POST." }));
    return;
  }

  try {
    let bodyData: Record<string, unknown> = {};
    if (req.body && typeof req.body === "object") {
      bodyData = req.body;
    } else {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
      }
      const raw = Buffer.concat(chunks).toString("utf-8");
      if (raw) {
        try {
          bodyData = JSON.parse(raw);
        } catch {
          // ignore parsing error
        }
      }
    }

    const dealId = String(bodyData.dealId || req.query?.dealId || "unknown").trim();
    const clickId = `clk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        dealId,
        clickId,
        usesCount: 1,
      })
    );
  } catch (err: unknown) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Internal error" }));
  }
}
