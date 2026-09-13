/**
 * @file src/components/submit_coupon/api.ts
 * @description Robust API service for sending coupon submissions to the backend.
 */

import type { SubmitCouponPayload, SubmitCouponResult } from "./types";

const PRIMARY_SUBMIT_ENDPOINT = "/api/deals/submit";
const FALLBACK_SUBMIT_ENDPOINT = "/api/coupons/submit";
const REQUEST_TIMEOUT_MS = 10000;

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
