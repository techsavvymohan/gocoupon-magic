/**
 * @file SecurityTrustPledge.tsx
 * @description Compact, high-credibility privacy & security guarantee.
 */

import { ShieldCheck, Lock, EyeOff, Cpu, CheckCircle2 } from "lucide-react";

export function SecurityTrustPledge() {
  const pillars = [
    {
      icon: Lock,
      title: "Manifest V3 Sandboxed",
      description: "Strict Google Chrome security standards with zero unauthorized background execution.",
    },
    {
      icon: EyeOff,
      title: "Zero Financial Data Access",
      description: "Cannot read or access credit card numbers, CVVs, bank passwords, or OTPs.",
    },
    {
      icon: Cpu,
      title: "User-Initiated Only",
      description: "Activates only at checkout. Zero background tracking or silent cookie stuffing.",
    },
    {
      icon: ShieldCheck,
      title: "Zero Personal Data Sale",
      description: "Your browsing history is never logged, sold, or shared with third parties.",
    },
  ];

  return (
    <section className="relative border-t border-border bg-card/30 px-4 sm:px-6 py-8 sm:py-10 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/60">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Privacy &amp; Security Guarantee</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
              Bank-Grade Sandboxing • Zero Data Selling
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Google Chrome Web Store Verified</span>
          </div>
        </div>

        {/* 4 Pillars in a tight row */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="rounded-xl border border-border bg-card p-4 shadow-xs"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="font-display text-xs font-bold text-foreground">
                    {p.title}
                  </h3>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
