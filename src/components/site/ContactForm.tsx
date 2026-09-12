import { useState, useRef, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Mail,
  User,
  MessageSquare,
  CheckCircle,
  Send,
  MapPin,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export function ContactForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
  }>({});

  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    message?: boolean;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const validateField = (
    field: "name" | "email" | "message",
    value: string,
  ): string | undefined => {
    const trimmed = value.trim();
    if (field === "name") {
      if (!trimmed) return "Please enter your name.";
      if (trimmed.length < 2) return "Name must be at least 2 characters long.";
    }
    if (field === "email") {
      if (!trimmed) return "Please enter your email address.";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed))
        return "Please enter a valid email address (e.g. you@example.com).";
    }
    if (field === "message") {
      if (!trimmed) return "Please write a message describing your inquiry.";
      if (trimmed.length < 10) return "Message must be at least 10 characters long.";
    }
    return undefined;
  };

  const validateForm = () => {
    const nameErr = validateField("name", formData.name);
    const emailErr = validateField("email", formData.email);
    const messageErr = validateField("message", formData.message);

    const newErrors = {
      name: nameErr,
      email: emailErr,
      message: messageErr,
    };

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    setSubmitError(null);

    const newErrors = validateForm();

    if (newErrors.name) {
      nameInputRef.current?.focus();
      return;
    }
    if (newErrors.email) {
      emailInputRef.current?.focus();
      return;
    }
    if (newErrors.message) {
      messageInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry. Please try again.");
      }
      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(
        err.message || "Failed to send message. Please try again or email us at support@gocoupon.io.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlur = (field: "name" | "email" | "message") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: "name" | "email" | "message", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("support@gocoupon.io");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <section id="contact" className="relative px-6 py-20 sm:py-28 overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-14 sm:mb-16 text-center max-w-3xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            We'd love to hear from you.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed md:text-lg">
            Have questions about coupon auto-apply, cashback, or partner store integrations? Drop us
            a line and our Bangalore team will respond promptly.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] items-start">
          {/* Left Column: Contact Cards & Info */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Mail size={22} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">Email Support</h3>
                  <p className="text-xs text-muted-foreground">Our team answers within 2 hours</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl border border-border/80 bg-secondary/50 px-4 py-3">
                <a
                  href="mailto:support@gocoupon.io"
                  className="font-mono text-sm font-semibold text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                >
                  support@gocoupon.io
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary touch-manipulation min-h-[32px]"
                >
                  {copiedEmail ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                  <span>{copiedEmail ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Office Location & Stats */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Clock size={18} />
                </div>
                <h4 className="font-display text-sm font-bold text-foreground">Working Hours</h4>
                <p className="mt-1 text-xs text-muted-foreground">Mon – Sat: 9am – 8pm IST</p>
                <span className="mt-3 inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  ⚡ Avg Response &lt; 2h
                </span>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MapPin size={18} />
                </div>
                <h4 className="font-display text-sm font-bold text-foreground">
                  Registered Office
                </h4>
                <p className="mt-1 text-xs text-muted-foreground font-medium text-foreground">
                  GoCoupon Technologies
                </p>
                <p className="text-xs text-muted-foreground">100 Feet Road, Indiranagar, Stage 1</p>
                <p className="text-xs text-muted-foreground">
                  Bengaluru, Karnataka 560038, India 🇮🇳
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-secondary/40 p-4 sm:p-5 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                <strong className="text-foreground font-semibold">Privacy First Guarantee:</strong>{" "}
                We never share your email address or personal details with third-party advertisers.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-md">
            {isSubmitted ? (
              <div className="py-10 text-center animate-in zoom-in-95 duration-200">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-500 mb-4 ring-4 ring-emerald-500/10">
                  <CheckCircle size={36} />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Message Sent Successfully!
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. Our support team has logged your inquiry and will
                  reply to{" "}
                  <strong className="text-foreground font-semibold">{formData.email}</strong>{" "}
                  shortly.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/thank-you"
                    search={{ source: "contact" }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-98"
                  >
                    <span>View Confirmation Page</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
                      setErrors({});
                      setTouched({});
                    }}
                    className="w-full sm:w-auto rounded-full border border-border bg-secondary px-5 py-2.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-muted"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <h3 className="font-display text-xl font-bold text-foreground border-b border-border pb-4">
                  Send us a message
                </h3>

                {/* Name Input */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5"
                  >
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.name && touched.name ? "text-destructive" : "text-muted-foreground"}`}
                    />
                    <input
                      ref={nameInputRef}
                      id="contact-name"
                      type="text"
                      required
                      placeholder="Aarav Mehta"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      aria-invalid={Boolean(errors.name && touched.name)}
                      aria-describedby={
                        errors.name && touched.name ? "contact-name-error" : undefined
                      }
                      className={`w-full rounded-xl border bg-background py-3 pl-10 pr-4 text-base sm:text-sm text-foreground focus-visible:outline-none transition-colors touch-manipulation ${
                        errors.name && touched.name
                          ? "border-destructive focus-visible:ring-2 focus-visible:ring-destructive"
                          : "border-border focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                      }`}
                    />
                  </div>
                  {errors.name && touched.name && (
                    <p
                      id="contact-name-error"
                      role="alert"
                      className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Email Input */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5"
                  >
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.email && touched.email ? "text-destructive" : "text-muted-foreground"}`}
                    />
                    <input
                      ref={emailInputRef}
                      id="contact-email"
                      type="email"
                      required
                      placeholder="aarav@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      aria-invalid={Boolean(errors.email && touched.email)}
                      aria-describedby={
                        errors.email && touched.email ? "contact-email-error" : undefined
                      }
                      className={`w-full rounded-xl border bg-background py-3 pl-10 pr-4 text-base sm:text-sm text-foreground focus-visible:outline-none transition-colors touch-manipulation ${
                        errors.email && touched.email
                          ? "border-destructive focus-visible:ring-2 focus-visible:ring-destructive"
                          : "border-border focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                      }`}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <p
                      id="contact-email-error"
                      role="alert"
                      className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Subject Select */}
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5"
                  >
                    Topic / Inquiry Type
                  </label>
                  <select
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base sm:text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors focus:border-primary touch-manipulation cursor-pointer"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Coupon Code Issue">Coupon Code Not Working</option>
                    <option value="Cashback Support">Cashback / Earnings Query</option>
                    <option value="Merchant Partnership">Merchant / Store Partnership</option>
                    <option value="Feature Request">Feature Suggestion</option>
                  </select>
                </div>

                {/* Message Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-bold uppercase tracking-wider text-foreground"
                    >
                      Your Message <span className="text-rose-500">*</span>
                    </label>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {formData.message.length}/500
                    </span>
                  </div>
                  <div className="relative">
                    <MessageSquare
                      size={16}
                      className={`absolute left-3.5 top-3.5 ${errors.message && touched.message ? "text-destructive" : "text-muted-foreground"}`}
                    />
                    <textarea
                      ref={messageInputRef}
                      id="contact-message"
                      required
                      rows={4}
                      maxLength={500}
                      placeholder="Tell us how we can help you…"
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      onBlur={() => handleBlur("message")}
                      aria-invalid={Boolean(errors.message && touched.message)}
                      aria-describedby={
                        errors.message && touched.message ? "contact-message-error" : undefined
                      }
                      className={`w-full rounded-xl border bg-background py-3 pl-10 pr-4 text-base sm:text-sm text-foreground focus-visible:outline-none transition-colors resize-none touch-manipulation ${
                        errors.message && touched.message
                          ? "border-destructive focus-visible:ring-2 focus-visible:ring-destructive"
                          : "border-border focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                      }`}
                    />
                  </div>
                  {errors.message && touched.message && (
                    <p
                      id="contact-message-error"
                      role="alert"
                      className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{errors.message}</span>
                    </p>
                  )}
                </div>

                {/* API Submission Error */}
                {submitError && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 flex items-start gap-2.5 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_8px_25px_var(--accent-glow-strong)] active:scale-[0.99] disabled:opacity-70 cursor-pointer touch-manipulation min-h-[44px]"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
