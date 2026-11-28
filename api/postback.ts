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
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    let data: Record<string, unknown> = {};

    if (req.method === "POST") {
      if (req.body && typeof req.body === "object") {
        data = req.body;
      } else {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
        }
        const raw = Buffer.concat(chunks).toString("utf-8");
        if (raw) {
          try {
            data = JSON.parse(raw);
          } catch {
            // URL-encoded form data fallback
            const params = new URLSearchParams(raw);
            data = Object.fromEntries(params.entries());
          }
        }
      }
    } else {
      data = req.query || (req.url ? Object.fromEntries(new URL(req.url, "http://localhost").searchParams.entries()) : {});
    }

    const transactionId = String(
      data.transaction_id ||
      data.tx_id ||
      data.order_id ||
      data.orderId ||
      data.action_id ||
      data.conv_id ||
      `tx_${Date.now()}`
    ).trim();

    const subid1 = String(data.subid1 || data.sub_id1 || data.source || data.channel || "web").trim();
    const subid2 = String(data.subid2 || data.sub_id2 || data.store || data.merchant || "").trim();
    const subid3 = String(data.subid3 || data.sub_id3 || data.deal_id || data.dealId || "").trim();
    const subid4 = String(data.subid4 || data.sub_id4 || data.click_id || data.clickId || "").trim();
    const subid5 = String(data.subid5 || data.sub_id5 || data.device || "").trim();

    const saleAmount = parseFloat(
      String(data.sale_amount || data.amount || data.sale || data.order_amount || data.order_sum || data.cart || "0")
    ) || 0;

    const commissionAmount = parseFloat(
      String(data.commission_amount || data.commission || data.payout || data.earnings || data.payment || "0")
    ) || 0;

    const currency = String(data.currency || data.curr || "INR").toUpperCase();
    const rawStatus = String(data.status || "approved").toLowerCase();
    const network = String(data.network || data.provider || "cuelinks").trim();

    console.log(
      `[S2S Postback Ingested] Tx: ${transactionId}, Network: ${network}, Comm: ${currency} ${commissionAmount}, SubIDs: [${subid1}, ${subid2}, ${subid3}, ${subid4}, ${subid5}], Status: ${rawStatus}`
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        transactionId,
        received: true,
        message: "S2S conversion postback recorded successfully.",
      })
    );
  } catch (err: unknown) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Internal error" }));
  }
}
