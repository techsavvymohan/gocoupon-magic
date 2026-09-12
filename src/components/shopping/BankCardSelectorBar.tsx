/**
 * @file BankCardSelectorBar.tsx
 * @description Sleek, high-converting Bank Card & EMI / BNPL Filter Bar.
 * Uses authentic vector SVG brand logos (Chase, Amex, Capital One, Citi, Affirm, HDFC, SBI, ICICI, Axis)
 * with real-time net checkout price recalculation.
 */

import { useState } from "react";
import { useUserCards } from "@/context/UserCardsContext";
import { CardApplicationModal } from "./CardApplicationModal";
import { BankLogoIcon } from "@/components/icons/BankLogos";
import { CreditCard, Check, ArrowRight, ShieldCheck } from "lucide-react";

export function BankCardSelectorBar() {
  const { selectedCardId, setSelectedCardId, allCards, activeCard, isIndia } = useUserCards();
  const [modalCard, setModalCard] = useState<(typeof allCards)[0] | null>(null);

  return (
    <div className="rounded-2xl border border-border/80 bg-card/75 p-3.5 sm:p-4.5 shadow-sm backdrop-blur-md transition-all">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0 shadow-2xs">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-sm font-bold tracking-tight text-foreground">
                {isIndia ? "Bank Card Discounts & EMI (Optional)" : "Credit Cards & Financing (Optional)"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Auto-Calculate Net Price
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block mt-0.5">
              {isIndia
                ? "Have a bank card? Select it to calculate extra instant checkout discounts & rewards"
                : "Have a US card? Select it to calculate extra cash back rewards & Affirm installment plans"}
            </p>
          </div>
        </div>

        {/* Dynamic Card Bonus Prompt CTA */}
        {activeCard ? (
          <button
            type="button"
            onClick={() => setModalCard(activeCard)}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-all touch-manipulation cursor-pointer shrink-0"
          >
            <CreditCard className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>
              {isIndia
                ? `Need ${activeCard.shortName}? Apply & Save ₹1,500+`
                : `Need ${activeCard.shortName}? Apply & Get $200 Bonus`}
            </span>
            <ArrowRight className="h-3 w-3 shrink-0" />
          </button>
        ) : (
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Verified Official Bank Partners</span>
          </div>
        )}
      </div>

      {/* Horizontal Brand SVG Pill Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-3">
        {/* All Cards (Best Deal) Pill */}
        <button
          type="button"
          onClick={() => setSelectedCardId("all")}
          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 min-h-[40px] text-xs font-semibold transition-all touch-manipulation focus-visible:ring-2 focus-visible:ring-primary cursor-pointer ${
            selectedCardId === "all"
              ? "bg-foreground text-background shadow-sm scale-102 ring-2 ring-foreground/20"
              : "border border-border/80 bg-background/80 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/40"
          }`}
        >
          <BankLogoIcon cardId="all" className="h-5 w-5 rounded-md shrink-0" />
          <span>All Cards / Any Payment</span>
          {selectedCardId === "all" && <Check className="h-3.5 w-3.5 text-background" />}
        </button>

        {/* Real Brand SVG Bank Pills */}
        {allCards.map((card) => {
          const isSelected = selectedCardId === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setSelectedCardId(card.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 min-h-[40px] text-xs font-semibold transition-all touch-manipulation focus-visible:ring-2 focus-visible:ring-primary cursor-pointer ${
                isSelected
                  ? "border-2 border-primary bg-primary/[0.08] text-foreground font-bold shadow-sm ring-2 ring-primary/25 scale-102"
                  : "border border-border/80 bg-background/80 text-foreground hover:border-primary/40 hover:bg-muted/40"
              }`}
            >
              {/* Real Vector SVG Brand Logo */}
              <BankLogoIcon cardId={card.id} className="h-5 w-5 rounded-md shrink-0 shadow-2xs" />
              <span>{card.shortName}</span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {Math.round(card.defaultCashbackPct * 100)}% off
              </span>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Active Card Rule Description Banner */}
      {activeCard && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/[0.04] p-2.5 sm:p-3 text-xs text-foreground">
          <div className="flex items-center gap-2.5 min-w-0">
            <BankLogoIcon cardId={activeCard.id} className="h-5 w-5 rounded-xs shrink-0 shadow-xs" />
            <span className="truncate">
              <strong>Active Filter:</strong> Applying <strong>{activeCard.cardName}</strong> benefits (Instant savings + {Math.round(activeCard.defaultCashbackPct * 100)}% rewards).
            </span>
          </div>
          <button
            type="button"
            onClick={() => setModalCard(activeCard)}
            className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline touch-manipulation cursor-pointer shrink-0"
          >
            <span>View Card Benefits &amp; Apply</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Card Application Modal */}
      <CardApplicationModal
        isOpen={modalCard !== null}
        onClose={() => setModalCard(null)}
        card={modalCard}
      />
    </div>
  );
}
