/**
 * @file src/components/submit_coupon/EmailOtpVerifier.tsx
 * @description Dedicated email OTP verification module for community coupon contributors.
 * Dispatches and verifies 6-digit OTP codes via support@gocoupon.io.
 */

import React from "react";
import { Mail, CheckCircle2, ShieldCheck, Loader2, ArrowRight, RotateCw, Edit3 } from "lucide-react";

export interface EmailOtpVerifierProps {
  email: string;
  otp: string;
  emailError?: string;
  otpError?: string;
  isSendingOtp: boolean;
  isOtpSent: boolean;
  isVerifyingOtp: boolean;
  isEmailVerified: boolean;
  verifiedEmail: string | null;
  cooldown: number;
  onEmailChange: (email: string) => void;
  onOtpChange: (otp: string) => void;
  onSendOtp: () => Promise<boolean>;
  onVerifyOtp: (codeOverride?: string) => Promise<boolean>;
  onChangeEmail: () => void;
  disabled?: boolean;
}

export function EmailOtpVerifier({
  email,
  otp,
  emailError,
  otpError,
  isSendingOtp,
  isOtpSent,
  isVerifyingOtp,
  isEmailVerified,
  verifiedEmail,
  cooldown,
  onEmailChange,
  onOtpChange,
  onSendOtp,
  onVerifyOtp,
  onChangeEmail,
  disabled = false,
}: EmailOtpVerifierProps) {
  // If already verified, show sleek emerald verified card
  if (isEmailVerified && verifiedEmail) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 p-4 transition-all animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  Email Verified
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  support@gocoupon.io
                </span>
              </div>
              <p className="text-xs font-mono font-medium text-emerald-800 dark:text-emerald-200 mt-0.5">
                {verifiedEmail}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onChangeEmail}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-background/80 px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Change email address"
          >
            <Edit3 className="h-3 w-3" />
            <span>Change</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border/80 bg-muted/20 p-4">
      {/* Email Input Field */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="submitter-email" className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-primary" />
            <span>Submitter Email Address</span>
            <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] font-semibold text-muted-foreground">
            Verified via support@gocoupon.io
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <input
              id="submitter-email"
              type="email"
              required
              disabled={disabled || isSendingOtp || (isOtpSent && isEmailVerified)}
              placeholder="e.g. yourname@domain.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary ${
                emailError ? "border-rose-500" : "border-border"
              }`}
            />
          </div>

          <button
            type="button"
            onClick={onSendOtp}
            disabled={disabled || isSendingOtp || cooldown > 0 || !email.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 shrink-0 min-w-[120px]"
          >
            {isSendingOtp ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : cooldown > 0 ? (
              <span>Resend ({cooldown}s)</span>
            ) : isOtpSent ? (
              <>
                <RotateCw className="h-3.5 w-3.5" />
                <span>Resend OTP</span>
              </>
            ) : (
              <>
                <span>Send OTP</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>

        {emailError && (
          <p className="mt-1 text-xs text-rose-500 font-medium">{emailError}</p>
        )}
      </div>

      {/* OTP Code Input Box (Visible once OTP is sent) */}
      {isOtpSent && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-2.5 animate-in fade-in-50 slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
              <span>Enter 6-Digit Code</span>
            </span>
            <span className="text-[10px] text-muted-foreground">
              Sent to <strong className="text-foreground">{email}</strong>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                id="submitter-otp"
                type="text"
                maxLength={6}
                autoFocus
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  onOtpChange(val);
                  if (val.length === 6) {
                    onVerifyOtp(val);
                  }
                }}
                className={`w-full tracking-widest text-center font-mono font-black text-base rounded-xl border bg-background py-2 text-foreground placeholder:text-muted-foreground/30 focus:outline-hidden focus:ring-2 focus:ring-primary ${
                  otpError ? "border-rose-500 text-rose-600" : "border-border"
                }`}
              />
            </div>

            <button
              type="button"
              onClick={() => onVerifyOtp()}
              disabled={disabled || isVerifyingOtp || otp.trim().length !== 6}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isVerifyingOtp ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Verify Code</span>
                </>
              )}
            </button>
          </div>

          {otpError ? (
            <p className="text-[11px] text-rose-500 font-medium">{otpError}</p>
          ) : (
            <p className="text-[10px] text-muted-foreground flex items-center justify-between">
              <span>Check your inbox or spam folder for an email from support@gocoupon.io.</span>
              <button
                type="button"
                onClick={onChangeEmail}
                className="text-primary hover:underline font-semibold ml-2 cursor-pointer"
              >
                Wrong email?
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
