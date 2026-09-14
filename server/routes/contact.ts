/**
 * @file server/routes/contact.ts
 * @description Express Router for Contact Form Submissions with SMTP delivery.
 */

import { Router, type Request, type Response } from "express";
import { sendContactInquiryEmail } from "../services/email.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";

export const contactRouter = Router();

contactRouter.post("/", async (req: Request, res: Response) => {
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const rateCheck = apiRateLimiter.check(`contact:${clientIp}`, 5, 10 * 60 * 1000);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    res.status(429).json({
      error: "Too many contact submissions from this IP. Please wait before submitting again.",
      retryAfterSeconds: rateCheck.retryAfterSeconds,
    });
    return;
  }

  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    res.status(400).json({ error: "Name, email, and message are required." });
    return;
  }

  const success = await sendContactInquiryEmail({
    name: String(name),
    email: String(email),
    subject: subject ? String(subject) : undefined,
    message: String(message),
  });

  res.json({
    success,
    message: "Thank you for reaching out! We have received your message and will respond shortly.",
  });
});
