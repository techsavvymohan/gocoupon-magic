/**
 * @file server/routes/contact.ts
 * @description Express Router for Contact Form Submissions with SMTP delivery.
 */

import { Router, type Request, type Response } from "express";
import { sendContactInquiryEmail } from "../services/email.js";

export const contactRouter = Router();

contactRouter.post("/", async (req: Request, res: Response) => {
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
