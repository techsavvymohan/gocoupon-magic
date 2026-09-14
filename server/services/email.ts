/**
 * @file server/services/email.ts
 * @description Production SMTP Email Service using Nodemailer.
 *
 * Handles:
 * - Real-time Price Drop Alert emails to subscribers
 * - Contact Form inquiry notifications to the admin
 * - Graceful fallback logging when SMTP credentials are not configured
 */

import nodemailer, { type Transporter } from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_SECURE = process.env.SMTP_SECURE === "true" || SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
export function getFromAddress(): string {
  const raw = process.env.SMTP_FROM?.trim();
  if (raw && raw.includes("@")) {
    return raw;
  }
  const user = process.env.SMTP_USER || "support@gocoupon.io";
  return `"GoCoupon Support" <${user}>`;
}

let transporter: Transporter | null = null;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  console.log(`[SMTP] Email transport initialized for ${SMTP_HOST}:${SMTP_PORT}`);
} else {
  console.log("[SMTP] Credentials not yet configured — emails will be logged to console in dev mode.");
}

/**
 * Security: HTML entity escaper to eliminate HTML/script injection in generated emails.
 */
function escapeHtml(text: string): string {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export interface PriceDropEmailOptions {
  to: string;
  productTitle: string;
  storeName: string;
  currentPrice: number;
  targetPrice: number;
  currencySymbol?: string;
  productUrl: string;
}

/**
 * Sends a high-conversion, beautifully formatted Price Drop Alert email.
 */
export async function sendPriceDropEmail(options: PriceDropEmailOptions): Promise<boolean> {
  const sym = options.currencySymbol || "₹";
  const safeTitle = escapeHtml(options.productTitle);
  const safeStore = escapeHtml(options.storeName);
  const safeProductUrl = options.productUrl.replace(/"/g, "%22");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #090d16; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <span style="font-size: 22px; font-weight: 800; color: #4338ca;">GoCoupon</span>
        <span style="display: block; font-size: 12px; color: #64748b; margin-top: 4px;">Smart Price Drop Radar</span>
      </div>

      <div style="padding: 24px 0;">
        <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 9999px; margin-bottom: 12px;">
          🎉 PRICE DROP DETECTED!
        </div>
        <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 12px 0; color: #0f172a;">
          ${safeTitle}
        </h2>
        <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0;">
          Great news! The item you're tracking on <strong>${safeStore}</strong> has hit your target price.
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #64748b; font-size: 13px;">Current Deal Price:</td>
              <td style="text-align: right; font-size: 20px; font-weight: 800; color: #059669;">${sym}${options.currentPrice.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-size: 13px; padding-top: 8px;">Your Target Price:</td>
              <td style="text-align: right; font-size: 14px; color: #334155; font-weight: 600; padding-top: 8px;">${sym}${options.targetPrice.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center;">
          <a href="${safeProductUrl}" style="display: inline-block; background-color: #4338ca; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(67, 56, 202, 0.2);">
            View Deal at ${safeStore} &rarr;
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center;">
        You received this email because you requested a price drop alert on <a href="https://gocoupon.io" style="color: #4338ca; text-decoration: none;">GoCoupon.io</a>.
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`[SMTP DEV] Price Drop Email would be sent to: ${options.to}`);
    console.log(`[SMTP DEV] Subject: Price Drop Alert: ${options.productTitle}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: options.to,
      subject: `🚨 Price Drop Alert: ${options.productTitle} is now ${sym}${options.currentPrice.toLocaleString()}`,
      html,
    });
    console.log(`[SMTP] Price drop email successfully delivered to ${options.to}`);
    return true;
  } catch (err: any) {
    console.error("[SMTP] Failed to send price drop email:", err.message);
    return false;
  }
}

/**
 * Sends contact form submission to the admin with strict HTML sanitization.
 */
export async function sendContactInquiryEmail(options: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || SMTP_USER || "support@gocoupon.io";

  const safeName = escapeHtml(options.name);
  const safeEmail = escapeHtml(options.email);
  const safeSubject = escapeHtml(options.subject || "General Inquiry");
  const safeMessage = escapeHtml(options.message);

  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>New Contact Inquiry from GoCoupon.io</h2>
      <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f4f4f5; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${safeMessage}</div>
    </div>
  `;

  if (!transporter) {
    console.log(`[SMTP DEV] Contact Form inquiry received from: ${options.name} (${options.email})`);
    console.log(`[SMTP DEV] Message: ${options.message}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: adminEmail,
      replyTo: options.email,
      subject: `[GoCoupon Contact] ${options.subject || "New Message from " + options.name}`,
      html,
    });
    return true;
  } catch (err: any) {
    console.error("[SMTP] Failed to send contact inquiry email:", err.message);
    return false;
  }
}
