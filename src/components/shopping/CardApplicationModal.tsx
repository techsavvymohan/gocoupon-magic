/**
 * @file CardApplicationModal.tsx
 * @description High-converting modal presenting bank credit card benefits and official application CTA.
 * Generates ₹1,500 - ₹2,500 CPA bounties via wrapped affiliate links.
 */

import { useState, useEffect } from "react";
import { type BankCardDefinition } from "@/lib/services/bank-offers";
import { BankLogoIcon } from "@/components/icons/BankLogos";
import { useUserCards } from "@/context/UserCardsContext";
import {
  X,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Gift,
  Zap,
} from "lucide-react";

interface CardApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: BankCardDefinition | null;
  currentProductTitle?: string;
  instantSavingsAmount?: number;
}

export function CardApplicationModal({
  isOpen,
  onClose,
  card,
  currentProductTitle,
  instantSavingsAmount,
}: CardApplicationModalProps) {
  const { isIndia } = useUserCards();
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !card) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl border-2 border-primary/20 bg-card shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-2xl" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-border/80 bg-muted/30">
          <div className="flex items-center gap-3.5">
            <BankLogoIcon cardId={card.id} className="h-12 w-12 rounded-2xl shrink-0 shadow-sm" />
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                <ShieldCheck className="h-3 w-3" />
                <span>Instant Bank Offer Partner</span>
              </div>
              <h3 id="card-modal-title" className="font-display text-lg font-bold text-foreground">
                {card.cardName}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors touch-manipulation focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Real-time Savings Banner */}
          {instantSavingsAmount && instantSavingsAmount > 0 && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3">
              <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase block">
                  Unlock Instant Checkout Savings:
                </span>
                <p className="text-xs sm:text-sm font-medium text-foreground">
                  Get approved today and save{" "}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {isIndia ? "₹" : "$"}{instantSavingsAmount.toLocaleString(isIndia ? "en-IN" : "en-US")}
                  </strong>{" "}
                  {currentProductTitle ? `on ${currentProductTitle.slice(0, 30)}…` : "on your order"}!
                </p>
              </div>
            </div>
          )}

          {/* Welcome Bonus Callout */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3">
            <Gift className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-mono text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase block">
                Exclusive Welcome Bonus:
              </span>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                {card.welcomeBonus}
              </p>
            </div>
          </div>

          {/* Card Features & Perks */}
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
              Key Card Privileges &amp; Rewards:
            </h4>
            <ul className="space-y-2.5">
              {card.keyPerks.map((perk, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fee & Charges Summary */}
          <div className="rounded-2xl border border-border bg-muted/20 p-4 flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground block font-mono text-[10px] uppercase">
                Annual / Renewal Fee:
              </span>
              <span className="font-bold text-foreground mt-0.5 block">{card.annualFee}</span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground block font-mono text-[10px] uppercase">
                Approval Speed:
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                2-Min Digital KYC
              </span>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              100% Official Bank Portal
            </span>
            <span>•</span>
            <span>Zero Spam Guarantee</span>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-5 sm:p-6 border-t border-border bg-muted/30 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl border border-border bg-card text-xs font-bold text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
          >
            Cancel
          </button>

          <a
            href={card.affiliateApplyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              // Close modal after initiating click
              setTimeout(onClose, 500);
            }}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 min-h-[44px] text-xs sm:text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all touch-manipulation focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>Apply on Official {card.bankName} Portal</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
