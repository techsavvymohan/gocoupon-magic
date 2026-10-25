/**
 * @file src/components/submit_coupon/useSubmitCoupon.ts
 * @description React hook managing coupon submission state, validation, OTP verification, and API lifecycle.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { CouponSubmissionFormValues, SubmitCouponResult } from "./types";
import { validateCouponSubmission, validateEmail } from "./validation";
import { submitCouponToBackend, sendSubmissionOtp, verifySubmissionOtp } from "./api";
import { resolveStoreAutoFill, type StorePreset } from "./storeAutoFill";

const INITIAL_VALUES: CouponSubmissionFormValues = {
  storeName: "",
  code: "",
  discount: "",
  category: "General",
  url: "",
  terms: "",
  expiryDate: "",
  email: "",
  otp: "",
};

interface UseSubmitCouponOptions {
  defaultStore?: string;
  defaultCategory?: string;
  onSuccess?: (result: SubmitCouponResult) => void;
}

export function useSubmitCoupon(options: UseSubmitCouponOptions = {}) {
  const [values, setValues] = useState<CouponSubmissionFormValues>({
    ...INITIAL_VALUES,
    storeName: options.defaultStore || "",
    category: options.defaultCategory || "General",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastResult, setLastResult] = useState<SubmitCouponResult | null>(null);

  // OTP Verification States
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cooldown countdown tick
  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setTimeout(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cooldown]);

  const setFieldValue = useCallback((field: keyof CouponSubmissionFormValues, val: string) => {
    setValues((prev) => {
      const updated = { ...prev, [field]: val };

      // If user edits email after verification, reset verified state
      if (field === "email" && val.trim().toLowerCase() !== (verifiedEmail || "").toLowerCase()) {
        setIsEmailVerified(false);
        setVerificationToken(null);
      }

      // Smart store auto-fill: when storeName is entered, auto-detect domain and category
      if (field === "storeName" && val.trim().length >= 2) {
        const auto = resolveStoreAutoFill(val);
        if (auto) {
          if (auto.url && !prev.url) {
            updated.url = auto.url;
          }
          if (auto.category && (prev.category === "General" || !prev.category)) {
            updated.category = auto.category;
          }
        }
      }

      return updated;
    });

    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, [verifiedEmail]);

  const handleSelectStorePreset = useCallback((preset: StorePreset) => {
    setValues((prev) => ({
      ...prev,
      storeName: preset.name,
      url: prev.url && !prev.url.includes(preset.domain) ? prev.url : preset.url,
      category: prev.category === "General" || !prev.category ? preset.category : prev.category,
    }));

    setErrors((prev) => {
      const next = { ...prev };
      delete next.storeName;
      delete next.url;
      return next;
    });
  }, []);


  const handleSendOtp = useCallback(async () => {
    const emailCheck = validateEmail(values.email);
    if (!emailCheck.isValid) {
      setErrors((prev) => ({ ...prev, email: emailCheck.error || "Please enter a valid email." }));
      toast.error(emailCheck.error || "Please enter a valid email address.");
      return false;
    }

    if (cooldown > 0) {
      toast.info(`Please wait ${cooldown}s before requesting a new code.`);
      return false;
    }

    setIsSendingOtp(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.email;
      delete next.otp;
      return next;
    });

    try {
      const result = await sendSubmissionOtp(values.email.trim(), values.storeName);
      if (result.success) {
        setIsOtpSent(true);
        setCooldown(result.cooldownSeconds || 45);
        toast.success(result.message);
        return true;
      } else {
        toast.error(result.message);
        if (result.cooldownSeconds) {
          setCooldown(result.cooldownSeconds);
        }
        return false;
      }
    } catch {
      toast.error("Failed to send verification code. Please try again.");
      return false;
    } finally {
      setIsSendingOtp(false);
    }
  }, [values.email, values.storeName, cooldown]);

  const handleVerifyOtp = useCallback(async (codeOverride?: string) => {
    const codeToVerify = (codeOverride || values.otp).trim();
    if (!codeToVerify || codeToVerify.length !== 6) {
      setErrors((prev) => ({ ...prev, otp: "Please enter a 6-digit code." }));
      toast.error("Please enter the 6-digit verification code sent to your email.");
      return false;
    }

    setIsVerifyingOtp(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.otp;
      return next;
    });

    try {
      const result = await verifySubmissionOtp(values.email.trim(), codeToVerify);
      if (result.success) {
        setIsEmailVerified(true);
        setVerifiedEmail(values.email.trim().toLowerCase());
        setVerificationToken(result.verificationToken || "verified");
        toast.success("Email verified by support@gocoupon.io!");
        return true;
      } else {
        setErrors((prev) => ({ ...prev, otp: result.message }));
        toast.error(result.message);
        return false;
      }
    } catch {
      toast.error("Error verifying code. Please try again.");
      return false;
    } finally {
      setIsVerifyingOtp(false);
    }
  }, [values.email, values.otp]);

  const handleChangeEmail = useCallback(() => {
    setIsEmailVerified(false);
    setIsOtpSent(false);
    setVerifiedEmail(null);
    setVerificationToken(null);
    setFieldValue("otp", "");
  }, [setFieldValue]);

  const resetForm = useCallback(() => {
    setValues({
      ...INITIAL_VALUES,
      storeName: options.defaultStore || "",
      category: options.defaultCategory || "General",
    });
    setErrors({});
    setIsSubmitting(false);
    setIsSuccess(false);
    setLastResult(null);
    setIsSendingOtp(false);
    setIsOtpSent(false);
    setIsVerifyingOtp(false);
    setIsEmailVerified(false);
    setVerifiedEmail(null);
    setVerificationToken(null);
    setCooldown(0);
  }, [options.defaultStore, options.defaultCategory]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      const { isValid, errors: validationErrors, sanitizedPayload } = validateCouponSubmission(values);

      if (!isValid || !sanitizedPayload) {
        setErrors(validationErrors);
        const firstErrorKey = Object.keys(validationErrors)[0];
        if (firstErrorKey) {
          toast.error(validationErrors[firstErrorKey]);
        }
        return;
      }

      // Strict enforcement of OTP email verification
      if (!isEmailVerified || verifiedEmail !== values.email.trim().toLowerCase()) {
        setErrors((prev) => ({
          ...prev,
          email: "Please verify your email address with OTP before submitting.",
        }));
        toast.error("Please verify your email address with the 6-digit OTP code before submitting.");
        return;
      }

      setIsSubmitting(true);
      setErrors({});

      try {
        const result = await submitCouponToBackend({
          ...sanitizedPayload,
          verificationToken: verificationToken || undefined,
        });

        if (result.success) {
          setIsSuccess(true);
          setLastResult(result);
          toast.success(result.message);
          options.onSuccess?.(result);
        } else {
          if (result.errors) {
            setErrors(result.errors);
          }
          toast.error(result.message);
        }
      } catch (err: any) {
        toast.error(err.message || "An unexpected error occurred. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, isEmailVerified, verifiedEmail, verificationToken, options]
  );

  return {
    values,
    errors,
    isSubmitting,
    isSuccess,
    lastResult,
    setFieldValue,
    handleSubmit,
    resetForm,

    // OTP verification helpers
    isSendingOtp,
    isOtpSent,
    isVerifyingOtp,
    isEmailVerified,
    verifiedEmail,
    cooldown,
    handleSendOtp,
    handleVerifyOtp,
    handleChangeEmail,
    handleSelectStorePreset,
  };
}
