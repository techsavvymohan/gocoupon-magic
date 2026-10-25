/**
 * @file server/services/otp-service.ts
 * @description In-memory OTP management and email verification service for GoCoupon contributors.
 */

import crypto from "crypto";
import { sendSubmissionOtpEmail } from "./email.js";

interface OtpRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  sendCount: number;
  verificationToken?: string;
  verifiedAt?: number;
}

class OtpService {
  private store = new Map<string, OtpRecord>();

  constructor() {
    // Periodic garbage collection every 5 minutes
    setInterval(() => this.pruneExpired(), 5 * 60 * 1000);
  }

  private normalize(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Generates and dispatches a 6-digit OTP code to the submitter's email.
   */
  async sendOtp(rawEmail: string, storeName?: string): Promise<{ success: boolean; message: string; cooldownSeconds?: number }> {
    const email = this.normalize(rawEmail);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: "Please provide a valid email address." };
    }

    const now = Date.now();
    const existing = this.store.get(email);

    if (existing) {
      // Cooldown check (45 seconds between sends)
      const elapsedSeconds = Math.floor((now - existing.lastSentAt) / 1000);
      if (elapsedSeconds < 45) {
        const remaining = 45 - elapsedSeconds;
        return {
          success: false,
          message: `Please wait ${remaining} seconds before requesting a new code.`,
          cooldownSeconds: remaining,
        };
      }

      // Max 6 requests per hour
      if (existing.sendCount >= 6 && now - existing.lastSentAt < 60 * 60 * 1000) {
        return {
          success: false,
          message: "Too many verification requests. Please try again in one hour.",
        };
      }
    }

    // Generate random 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes

    this.store.set(email, {
      otp,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
      sendCount: (existing?.sendCount || 0) + 1,
      // If already verified previously, retain until re-verification
      verificationToken: existing?.verificationToken,
      verifiedAt: existing?.verifiedAt,
    });

    // Send email from support@gocoupon.io
    const sent = await sendSubmissionOtpEmail({
      to: email,
      otp,
      storeName,
    });

    if (!sent) {
      return {
        success: false,
        message: "Failed to dispatch verification email. Please check your email address or try again.",
      };
    }

    return {
      success: true,
      message: "A 6-digit verification code has been sent to your email from support@gocoupon.io.",
      cooldownSeconds: 45,
    };
  }

  /**
   * Verifies the 6-digit OTP and generates an auth verification token.
   */
  verifyOtp(rawEmail: string, rawOtp: string): { success: boolean; message: string; verificationToken?: string } {
    const email = this.normalize(rawEmail);
    const otp = (rawOtp || "").trim();

    const record = this.store.get(email);
    if (!record) {
      return {
        success: false,
        message: "No verification request found for this email. Please request a new code.",
      };
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      this.store.delete(email);
      return {
        success: false,
        message: "Verification code has expired. Please request a new one.",
      };
    }

    if (record.attempts >= 5) {
      this.store.delete(email);
      return {
        success: false,
        message: "Too many incorrect attempts. Please request a new code.",
      };
    }

    if (record.otp !== otp) {
      record.attempts += 1;
      const remainingAttempts = 5 - record.attempts;
      return {
        success: false,
        message: `Incorrect code. ${remainingAttempts} attempts remaining.`,
      };
    }

    // Successfully verified! Generate secure verification token valid for 2 hours
    const verificationToken = crypto.randomBytes(32).toString("hex");
    record.verificationToken = verificationToken;
    record.verifiedAt = now;
    record.expiresAt = now + 2 * 60 * 60 * 1000; // 2 hour valid window for submissions

    return {
      success: true,
      message: "Email verified successfully!",
      verificationToken,
    };
  }

  /**
   * Checks whether the given email has a valid verification token or verified status.
   */
  isEmailVerified(rawEmail: string, token?: string): boolean {
    const email = this.normalize(rawEmail);
    const record = this.store.get(email);
    if (!record || !record.verifiedAt) return false;

    // Check expiration (2 hours from verifiedAt)
    const now = Date.now();
    if (now - record.verifiedAt > 2 * 60 * 60 * 1000) {
      return false;
    }

    if (token) {
      return record.verificationToken === token;
    }

    return true;
  }

  /**
   * Consumes or resets verification after a successful submission.
   */
  consumeVerification(rawEmail: string): void {
    const email = this.normalize(rawEmail);
    this.store.delete(email);
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [email, record] of this.store.entries()) {
      if (now > record.expiresAt) {
        this.store.delete(email);
      }
    }
  }
}

export const otpService = new OtpService();
