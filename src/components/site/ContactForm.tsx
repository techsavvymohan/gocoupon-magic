import { useState, type FormEvent } from "react";
import { Mail, User, MessageSquare, CheckCircle, Send, MapPin, Clock, ShieldCheck, Copy, Check } from "lucide-react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    // Simulate server submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("support@gocoupon.io");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <section id="contact" className="relative px-6 py-28 overflow-hidden">
      {/* Background radial glow graphics */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-25 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at center, var(--accent-glow-strong), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Get in Touch
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
            We'd love to hear from you.
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
            Have questions about coupon auto-apply, cashback, or partner store integrations? Drop us a line and our Bangalore team will respond promptly.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] items-start">
          {/* Left Column: Contact Cards & Info */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
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
                <a href="mailto:support@gocoupon.io" className="font-mono text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  support@gocoupon.io
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary"
                >
                  {copiedEmail ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copiedEmail ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Office Location & Stats */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Clock size={18} />
                </div>
                <h4 className="font-display text-sm font-bold text-foreground">Working Hours</h4>
                <p className="mt-1 text-xs text-muted-foreground">Mon – Sat: 9am – 8pm IST</p>
                <span className="mt-3 inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  ⚡ Avg Response &lt; 2h
                </span>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MapPin size={18} />
                </div>
                <h4 className="font-display text-sm font-bold text-foreground">Headquarters</h4>
                <p className="mt-1 text-xs text-muted-foreground">Indiranagar, 100ft Road</p>
                <p className="text-xs text-muted-foreground">Bangalore, KA 560038 🇮🇳</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-secondary/40 p-5 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                <strong className="text-foreground font-semibold">Privacy First Guarantee:</strong> We never share your email address or personal details with third-party advertisers.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="rounded-3xl border border-border bg-card p-8 shadow-md">
            {isSubmitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-500 mb-4 animate-in zoom-in-50 duration-300">
                  <CheckCircle size={36} />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Message Sent Successfully!
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  Thank you for contacting goCoupon. Our support team has received your inquiry and will reply to <strong className="text-foreground">{formData.email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
                  }}
                  className="mt-8 rounded-full bg-secondary px-6 py-2.5 text-xs font-bold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="font-display text-xl font-bold text-foreground border-b border-border pb-4">
                  Send us a message
                </h3>

                {/* Name Input */}
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="Aarav Mehta"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-base sm:text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors focus:border-primary touch-manipulation"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="aarav@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-base sm:text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors focus:border-primary touch-manipulation"
                    />
                  </div>
                </div>

                {/* Subject Select */}
                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
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
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-wider text-foreground">
                      Your Message <span className="text-rose-500">*</span>
                    </label>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {formData.message.length}/500
                    </span>
                  </div>
                  <div className="relative">
                    <MessageSquare size={16} className="absolute left-3.5 top-3.5 text-muted-foreground" />
                    <textarea
                      id="contact-message"
                      required
                      rows={4}
                      maxLength={500}
                      placeholder="Tell us how we can help you…"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-base sm:text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors focus:border-primary resize-none touch-manipulation"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_8px_25px_var(--accent-glow-strong)] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
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
