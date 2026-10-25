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

export interface SubmissionOtpEmailOptions {
  to: string;
  otp: string;
  storeName?: string;
}

/**
 * Sends a 6-digit OTP verification email for coupon submission from support@gocoupon.io.
 */
export async function sendSubmissionOtpEmail(options: SubmissionOtpEmailOptions): Promise<boolean> {
  const safeOtp = escapeHtml(options.otp);
  const safeStore = options.storeName ? escapeHtml(options.storeName) : "Community Offer";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>GoCoupon Verification Code</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #121827; border: 1px solid #1f293d; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
              <!-- Header -->
              <tr>
                <td style="padding: 28px 24px 20px; text-align: center; border-bottom: 1px solid #1f293d; background: linear-gradient(180deg, #161f36 0%, #121827 100%);">
                  <div style="display: inline-block;">
                    <span style="font-size: 24px; font-weight: 900; color: #10b981; letter-spacing: -0.5px;">Go<span style="color: #ffffff;">Coupon</span></span>
                  </div>
                  <div style="margin-top: 6px;">
                    <span style="display: inline-block; font-size: 11px; font-weight: 700; color: #10b981; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); padding: 3px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Community Submitter Verification
                    </span>
                  </div>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 32px 28px;">
                  <h1 style="margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #ffffff; text-align: center;">
                    Verify Your Submitter Email
                  </h1>
                  <p style="margin: 0 0 24px; font-size: 14px; line-height: 22px; color: #94a3b8; text-align: center;">
                    You are sharing a discount code for <strong style="color: #e2e8f0;">${safeStore}</strong> on GoCoupon.io. Enter the 6-digit verification code below to verify your email and publish your deal.
                  </p>

                  <!-- OTP Display Box -->
                  <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%); border: 2px dashed rgba(16, 185, 129, 0.4); border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                    <span style="display: block; font-size: 11px; font-weight: 700; color: #a7f3d0; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                      Your One-Time Passcode (OTP)
                    </span>
                    <span style="display: block; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #10b981; padding-left: 10px;">
                      ${safeOtp}
                    </span>
                    <span style="display: block; font-size: 11px; color: #64748b; margin-top: 8px;">
                      ⏳ Valid for 10 minutes &bull; Do not share this code
                    </span>
                  </div>

                  <!-- Why Verification -->
                  <div style="background-color: #0d121f; border: 1px solid #1a2234; border-radius: 10px; padding: 14px 16px; margin-bottom: 24px;">
                    <div style="font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">
                      🛡️ Why do we verify submitter emails?
                    </div>
                    <div style="font-size: 12px; line-height: 18px; color: #64748b;">
                      At GoCoupon, we verify all community contributors to prevent spam, maintain a 100% working discount feed, and credit verified submitters in our rewards community.
                    </div>
                  </div>

                  <p style="margin: 0; font-size: 12px; line-height: 18px; color: #64748b; text-align: center;">
                    If you did not request this verification on GoCoupon.io, you can safely ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 24px; border-top: 1px solid #1f293d; background-color: #0b0f19; text-align: center;">
                  <p style="margin: 0 0 4px; font-size: 11px; color: #64748b;">
                    Sent securely by <strong style="color: #94a3b8;">support@gocoupon.io</strong>
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #475569;">
                    &copy; ${new Date().getFullYear()} GoCoupon.io &bull; All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`[SMTP DEV] Submission OTP Email for ${options.to}: CODE is ${options.otp}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"GoCoupon Verification" <${process.env.SMTP_USER || "support@gocoupon.io"}>`,
      to: options.to,
      replyTo: "support@gocoupon.io",
      subject: `Your GoCoupon Verification Code: ${options.otp}`,
      html,
    });
    console.log(`[SMTP] Submission OTP successfully delivered to ${options.to}`);
    return true;
  } catch (err: any) {
    console.error("[SMTP] Failed to send submission OTP email:", err.message);
    return false;
  }
}

export interface CouponApprovedEmailOptions {
  to: string;
  storeName: string;
  code: string;
  discount?: string;
  dealUrl?: string;
}

/**
 * Sends an automated congratulatory email from support@gocoupon.io when admin approves a coupon submission.
 */
export async function sendCouponApprovedEmail(options: CouponApprovedEmailOptions): Promise<boolean> {
  const safeStore = escapeHtml(options.storeName);
  const safeCode = escapeHtml(options.code);
  const safeDiscount = escapeHtml(options.discount || "Verified Deal");
  const liveUrl = options.dealUrl || "https://gocoupon.io";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Your GoCoupon Submission is Approved!</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #121827; border: 1px solid #1f293d; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
              <!-- Header -->
              <tr>
                <td style="padding: 28px 24px 20px; text-align: center; border-bottom: 1px solid #1f293d; background: linear-gradient(180deg, #161f36 0%, #121827 100%);">
                  <div style="display: inline-block;">
                    <span style="font-size: 24px; font-weight: 900; color: #10b981; letter-spacing: -0.5px;">Go<span style="color: #ffffff;">Coupon</span></span>
                  </div>
                  <div style="margin-top: 6px;">
                    <span style="display: inline-block; font-size: 11px; font-weight: 700; color: #10b981; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); padding: 3px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                      🎉 Submission Verified &amp; Approved
                    </span>
                  </div>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 32px 28px;">
                  <h1 style="margin: 0 0 12px; font-size: 22px; font-weight: 800; color: #ffffff; text-align: center;">
                    Your Coupon is Now LIVE!
                  </h1>
                  <p style="margin: 0 0 24px; font-size: 14px; line-height: 22px; color: #94a3b8; text-align: center;">
                    Great news! Our editorial team has tested and approved your coupon for <strong style="color: #e2e8f0;">${safeStore}</strong>. It is now published live to help shoppers save.
                  </p>

                  <!-- Coupon Details Card -->
                  <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 20px; margin: 0 0 24px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="color: #94a3b8; font-size: 12px; font-weight: 600; padding-bottom: 10px;">Store / Merchant:</td>
                        <td align="right" style="color: #ffffff; font-size: 14px; font-weight: 800; padding-bottom: 10px;">${safeStore}</td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8; font-size: 12px; font-weight: 600; padding-bottom: 10px;">Promo Code:</td>
                        <td align="right" style="padding-bottom: 10px;">
                          <span style="font-family: monospace; font-size: 16px; font-weight: 900; color: #10b981; background-color: rgba(16, 185, 129, 0.15); border: 1px dashed rgba(16, 185, 129, 0.4); padding: 4px 10px; border-radius: 6px;">
                            ${safeCode}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8; font-size: 12px; font-weight: 600;">Offer / Savings:</td>
                        <td align="right" style="color: #38bdf8; font-size: 13px; font-weight: 700;">${safeDiscount}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- CTA Button -->
                  <div style="text-align: center; margin: 0 0 24px;">
                    <a href="${liveUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">
                      View Your Live Deal on GoCoupon &rarr;
                    </a>
                  </div>

                  <p style="margin: 0; font-size: 12px; line-height: 18px; color: #64748b; text-align: center;">
                    Thank you for being a valued community contributor. Keep sharing working deals to help thousands save daily!
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 24px; border-top: 1px solid #1f293d; background-color: #0b0f19; text-align: center;">
                  <p style="margin: 0 0 4px; font-size: 11px; color: #64748b;">
                    Sent with ❤️ by <strong style="color: #94a3b8;">support@gocoupon.io</strong> &bull; GoCoupon Community Team
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #475569;">
                    &copy; ${new Date().getFullYear()} GoCoupon.io &bull; All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`[SMTP DEV] Coupon Approved Email for ${options.to}: ${options.storeName} (${options.code})`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"GoCoupon Community" <${process.env.SMTP_USER || "support@gocoupon.io"}>`,
      to: options.to,
      replyTo: "support@gocoupon.io",
      subject: `🎉 Your Coupon for ${options.storeName} (${options.code}) is Live on GoCoupon!`,
      html,
    });
    console.log(`[SMTP] Coupon approval email sent to ${options.to}`);
    return true;
  } catch (err: any) {
    console.error("[SMTP] Failed to send coupon approval email:", err.message);
    return false;
  }
}


