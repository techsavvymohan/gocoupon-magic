import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { BankOffer } from "./types";

export interface BankOfferCardProps {
  bank: BankOffer;
}

export function BankOfferCard({ bank }: BankOfferCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(bank.code);
    setCopied(true);
    toast.success(`Bank code "${bank.code}" copied to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <article
      aria-label={`${bank.bankName} offer`}
      className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
    >
      <div>
        {/* Top: Bank Logo + Name & Type + Discount Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-xl bg-white dark:bg-card border border-border/80 p-1.5 shrink-0 flex items-center justify-center shadow-xs">
              <img
                src={bank.logo}
                alt={`${bank.bankName} logo`}
                className="max-h-full max-w-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-base text-foreground truncate">
                {bank.bankName}
              </h3>
              <div className="text-xs text-muted-foreground mt-0.5 font-medium truncate">
                {bank.cardType}
              </div>
            </div>
          </div>

          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 font-mono">
            {bank.discount}
          </span>
        </div>

        {/* Order & Savings Specs */}
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
          <div>
            <span className="text-muted-foreground">Min Order: </span>
            <strong className="text-foreground font-mono">{bank.minOrder}</strong>
          </div>
          <div>
            <span className="text-muted-foreground">Max Savings: </span>
            <strong className="text-foreground font-mono">{bank.maxSavings}</strong>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-2">
        {/* Coupon Code Block */}
        <div className="flex items-center justify-between gap-3 bg-muted/40 rounded-xl p-2.5 border border-border/60">
          <div className="font-mono text-xs font-bold text-foreground">
            Code: <span className="text-primary font-black tracking-wider text-sm">{bank.code}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy coupon code ${bank.code}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary px-3 py-1.5 text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Applicable Stores */}
        <div className="mt-3 text-[11px] text-muted-foreground flex flex-wrap items-center gap-1.5">
          <span className="font-medium text-muted-foreground/80">Valid on:</span>
          {bank.applicableStores.map((st) => (
            <span key={st} className="rounded-md bg-muted/70 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
              {st}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
