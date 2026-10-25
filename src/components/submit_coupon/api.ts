/**
 * @file src/components/submit_coupon/api.ts
 * @description Robust API service for sending coupon submissions and verifying submitter email OTP.
 */

import type { SubmitCouponPayload, SubmitCouponResult, SendOtpResult, VerifyOtpResult } from "./types";

const PRIMARY_SUBMIT_ENDPOINT = "/api/deals/submit";
const FALLBACK_SUBMIT_ENDPOINT = "/api/coupons/submit";
const PRIMARY_SEND_OTP_ENDPOINT = "/api/deals/send-otp";
const FALLBACK_SEND_OTP_ENDPOINT = "/api/coupons/send-otp";
const PRIMARY_VERIFY_OTP_ENDPOINT = "/api/deals/verify-otp";
const FALLBACK_VERIFY_OTP_ENDPOINT = "/api/coupons/verify-otp";
const REQUEST_TIMEOUT_MS = 10000;

/**
 * Requests a 6-digit OTP to be sent from support@gocoupon.io to the submitter's email.
 */
export async function sendSubmissionOtp(email: string, storeName?: string): Promise<SendOtpResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    let res = await fetch(PRIMARY_SEND_OTP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, storeName }),
      signal: controller.signal,
    });

    if (!res.ok && res.status === 404) {
      res = await fetch(FALLBACK_SEND_OTP_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, storeName }),
        signal: controller.signal,
      });
    }

    clearTimeout(timer);
    const data = await res.json().catch(() => null);

    if (res.ok && data?.success) {
      return {
        success: true,
        message: data.message || "A verification code has been sent from support@gocoupon.io to your email.",
        cooldownSeconds: data.cooldownSeconds || 45,
      };
    }

    return {
      success: false,
      message: data?.message || data?.error || "Could not send verification code. Please check your email address and try again.",
      cooldownSeconds: data?.cooldownSeconds,
    };
  } catch (err: any) {
    clearTimeout(timer);
    return {
      success: false,
      message: err.name === "AbortError" ? "Verification request timed out. Please try again." : (err.message || "Network error. Please try again."),
    };
  }
}

/**
 * Verifies the 6-digit OTP code entered by the user.
 */
export async function verifySubmissionOtp(email: string, otp: string): Promise<VerifyOtpResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    let res = await fetch(PRIMARY_VERIFY_OTP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, otp }),
      signal: controller.signal,
    });

    if (!res.ok && res.status === 404) {
      res = await fetch(FALLBACK_VERIFY_OTP_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, otp }),
        signal: controller.signal,
      });
    }

    clearTimeout(timer);
    const data = await res.json().catch(() => null);

    if (res.ok && data?.success) {
      return {
        success: true,
        message: data.message || "Email verified successfully!",
        verificationToken: data.verificationToken,
      };
    }

    return {
      success: false,
      message: data?.message || data?.error || "Invalid or expired verification code.",
    };
  } catch (err: any) {
    clearTimeout(timer);
    return {
      success: false,
      message: err.name === "AbortError" ? "Verification request timed out. Please try again." : (err.message || "Network error. Please try again."),
    };
  }
}

/**
 * Submits a community coupon to the GoCoupon backend with timeout & fallback.
 */
export async function submitCouponToBackend(
  payload: SubmitCouponPayload
): Promise<SubmitCouponResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // Attempt primary endpoint
    let res = await fetch(PRIMARY_SUBMIT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    // If primary returns 404 or fails, try fallback
    if (!res.ok && res.status === 404) {
      res = await fetch(FALLBACK_SUBMIT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    }

    clearTimeout(timer);

    const data = await res.json().catch(() => null);

    if (res.ok && data?.success) {
      return {
        success: true,
        message:
          data.message ||
          `Coupon "${payload.code}" for ${payload.storeName} has been submitted for live verification!`,
        submissionId: data.submission?.id || data.deal?.id,
        deal: data.deal,
      };
    }

    return {
      success: false,
      message:
        data?.error ||
        data?.message ||
        "Could not verify your coupon. Please check your submission and try again.",
      errors: data?.errors,
    };
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      return {
        success: false,
        message: "Submission request timed out. Please check your network and try again.",
      };
    }
    return {
      success: false,
      message:
        err.message || "A network error occurred while submitting. Please try again.",
    };
  }
}
