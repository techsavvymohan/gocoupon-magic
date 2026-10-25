/**
 * @file src/components/submit_coupon/types.ts
 * @description Type definitions for Coupon & Offer Submission module.
 */

export interface SubmitCouponPayload {
  storeName: string;
  code: string;
  discount?: string;
  category?: string;
  url?: string;
  terms?: string;
  expiryDate?: string;
  email: string;
  verificationToken?: string;
}

export interface SendOtpResult {
  success: boolean;
  message: string;
  cooldownSeconds?: number;
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  verificationToken?: string;
}

export interface SubmitCouponResult {
  success: boolean;
  message: string;
  submissionId?: string;
  deal?: {
    id: string;
    title: string;
    storeName: string;
    code: string;
    discount: string;
  };
  errors?: Record<string, string>;
}

export interface CouponSubmissionFormValues {
  storeName: string;
  code: string;
  discount: string;
  category: string;
  url: string;
  terms: string;
  expiryDate: string;
  email: string;
  otp: string;
}

export interface SubmitCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStore?: string;
  defaultCategory?: string;
  onSuccess?: (result: SubmitCouponResult) => void;
}

export interface SubmitCouponButtonProps {
  variant?: "primary" | "outline" | "pill" | "ghost" | "header";
  label?: string;
  defaultStore?: string;
  defaultCategory?: string;
  className?: string;
  onSuccess?: (result: SubmitCouponResult) => void;
}
