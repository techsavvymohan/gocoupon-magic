/**
 * @file src/components/submit_coupon/useSubmitCoupon.ts
 * @description React hook managing the coupon submission state, validation, and API lifecycle.
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { CouponSubmissionFormValues, SubmitCouponResult } from "./types";
import { validateCouponSubmission } from "./validation";
import { submitCouponToBackend } from "./api";

const INITIAL_VALUES: CouponSubmissionFormValues = {
  storeName: "",
  code: "",
  discount: "",
  category: "General",
  url: "",
  terms: "",
  expiryDate: "",
  email: "",
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

  const setFieldValue = useCallback((field: keyof CouponSubmissionFormValues, val: string) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

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

      setIsSubmitting(true);
      setErrors({});

      try {
        const result = await submitCouponToBackend(sanitizedPayload);

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
    [values, options]
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
  };
}
