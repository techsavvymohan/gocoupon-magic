import type { IncomingMessage, ServerResponse } from "node:http";
import nodemailer from "nodemailer";

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

function escapeHtml(text: string): string {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

    const { name, email, subject, message } = bodyData;

    if (!name || !email || !message) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Name, email, and message are required." }));
      return;
    }

    // Attempt SMTP dispatch if configured
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
    const SMTP_SECURE = process.env.SMTP_SECURE === "true" || SMTP_PORT === 465;
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || SMTP_USER || "support@gocoupon.io";

    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: SMTP_PORT,
          secure: SMTP_SECURE,
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
          },
        });

        const safeName = escapeHtml(String(name));
        const safeEmail = escapeHtml(String(email));
        const safeSubject = escapeHtml(String(subject || "General Inquiry"));
        const safeMessage = escapeHtml(String(message));

        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"GoCoupon Support" <${SMTP_USER}>`,
          to: ADMIN_EMAIL,
          replyTo: String(email),
          subject: `[Contact Inquiry] ${safeSubject} from ${safeName}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2>New Contact Inquiry from GoCoupon.io</h2>
              <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
              <p><strong>Subject:</strong> ${safeSubject}</p>
              <p><strong>Message:</strong></p>
              <div style="background: #f4f4f5; padding: 15px; border-radius: 6px; white-space: pre-wrap; font-family: monospace;">${safeMessage}</div>
            </div>
          `,
        });
      } catch (mailErr) {
        console.warn("[Contact API] SMTP dispatch notice:", (mailErr as Error)?.message);
      }
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
