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

    const { name, email, message } = bodyData;

    if (!name || !email || !message) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Name, email, and message are required." }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        message: "Thank you for reaching out! We have received your message and will respond shortly.",
      })
    );
  } catch (err: unknown) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Internal error" }));
  }
}
