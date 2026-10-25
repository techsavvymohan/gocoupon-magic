/**
 * @file src/components/submit_coupon/validation.ts
 * @description Robust client-side validation and sanitization for coupon submissions.
 */

import type { CouponSubmissionFormValues, SubmitCouponPayload } from "./types";

export const ALLOWED_CATEGORIES = [
  "Fashion",
  "Beauty",
  "Electronics",
  "Food",
  "Travel",
  "Home",
  "Recharge",
  "General",
] as const;

export type AllowedCategory = (typeof ALLOWED_CATEGORIES)[number];

/**
 * Sanitizes coupon code to strictly uppercase, alphanumeric with hyphens/underscores, no spaces.
 */
export function sanitizeCouponCode(rawCode: string): string {
  return rawCode
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9_\-]/g, "");
}

/**
 * Sanitizes store or brand name.
 */
export function sanitizeStoreName(rawStore: string): string {
  return rawStore.trim().replace(/\s+/g, " ");
}

/**
 * Normalizes URL: prepends https:// if missing and validates format.
 */
export function normalizeAndValidateUrl(rawUrl?: string): {
  isValid: boolean;
  url?: string;
  error?: string;
} {
  if (!rawUrl || !rawUrl.trim()) {
    return { isValid: true };
  }

  let formatted = rawUrl.trim();
  if (!/^https?:\/\//i.test(formatted)) {
    formatted = `https://${formatted}`;
  }

  try {
    const parsed = new URL(formatted);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { isValid: false, error: "Only http:// and https:// URLs are permitted." };
    }
    if (!parsed.hostname.includes(".")) {
      return { isValid: false, error: "Please enter a valid domain (e.g. store.com)." };
    }
    return { isValid: true, url: formatted };
  } catch {
    return { isValid: false, error: "Please enter a valid store website URL." };
  }
}

/**
 * Validates required submitter email format.
 */
export function validateEmail(email?: string): { isValid: boolean; error?: string } {
  if (!email || !email.trim()) {
    return { isValid: false, error: "Submitter email address is required." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: "Please enter a valid email address." };
  }

  return { isValid: true };
}

/**
 * Runs full validation on form values.
 */
export function validateCouponSubmission(values: CouponSubmissionFormValues): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedPayload?: SubmitCouponPayload;
} {
  const errors: Record<string, string> = {};

  // 1. Store Name Validation
  const store = sanitizeStoreName(values.storeName);
  if (!store) {
    errors.storeName = "Store or brand name is required.";
  } else if (store.length < 2) {
    errors.storeName = "Store name must be at least 2 characters.";
  } else if (store.length > 100) {
    errors.storeName = "Store name cannot exceed 100 characters.";
  }

  // 2. Coupon Code Validation
  const code = sanitizeCouponCode(values.code);
  if (!code) {
    errors.code = "Coupon code is required.";
  } else if (code.length < 2) {
    errors.code = "Coupon code must be at least 2 characters.";
  } else if (code.length > 40) {
    errors.code = "Coupon code cannot exceed 40 characters.";
  }

  // 3. Category Validation
  const category = values.category.trim() || "General";

  // 4. URL Validation
  const urlCheck = normalizeAndValidateUrl(values.url);
  if (!urlCheck.isValid) {
    errors.url = urlCheck.error || "Invalid URL.";
  }

  // 5. Email Validation (Mandatory for verified submission)
  const emailCheck = validateEmail(values.email);
  if (!emailCheck.isValid) {
    errors.email = emailCheck.error || "Submitter email address is required.";
  }

  // 6. Discount Validation (optional, max 100 chars)
  const discount = values.discount.trim();
  if (discount.length > 100) {
    errors.discount = "Discount description cannot exceed 100 characters.";
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    sanitizedPayload: isValid
      ? {
          storeName: store,
          code,
          discount: discount || undefined,
          category,
          url: urlCheck.url || undefined,
          terms: values.terms.trim() || undefined,
          expiryDate: values.expiryDate.trim() || undefined,
          email: values.email.trim().toLowerCase(),
        }
      : undefined,
  };
}

