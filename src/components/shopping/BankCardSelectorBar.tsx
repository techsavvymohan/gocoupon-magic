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
  const {
    selectedCardId,
    setSelectedCardId,
    isCardDiscountApplied,
    setCardDiscountApplied,
    allCards,
    activeCard,
    isIndia,
  } = useUserCards();
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
              {isCardDiscountApplied ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Card Discount Applied
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  Standard Price (Off by Default)
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block mt-0.5">
              {isIndia
                ? "Standard store prices are shown by default. Choose a bank card below to calculate extra instant checkout savings."
                : "Standard store prices are shown by default. Choose a credit card below to calculate extra rewards & financing."}
            </p>
          </div>
        </div>

        {/* Dynamic Card Bonus Prompt or Master Toggle Switch */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Apply Card Discount Master Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={isCardDiscountApplied}
            onClick={() => setCardDiscountApplied(!isCardDiscountApplied)}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-all touch-manipulation cursor-pointer border ${
              isCardDiscountApplied
                ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                : "bg-muted/80 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
            }`}
            title={isCardDiscountApplied ? "Click to disable card discounts and view standard prices" : "Click to apply bank card discounts"}
          >
            <div
              className={`h-3 w-3 rounded-full transition-transform ${
                isCardDiscountApplied ? "bg-white translate-x-0.5" : "bg-muted-foreground"
              }`}
            />
            <span>{isCardDiscountApplied ? "Card Offer: ON" : "Apply Card Discount"}</span>
          </button>

          {activeCard ? (
            <button
              type="button"
              onClick={() => setModalCard(activeCard)}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-all touch-manipulation cursor-pointer shrink-0"
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
              <span>Official Bank Partners</span>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Brand SVG Pill Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-3">
        {/* Option 1: No Card / Standard Price Pill (SELECTED BY DEFAULT) */}
        <button
          type="button"
          onClick={() => setSelectedCardId("none")}
          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 min-h-[40px] text-xs font-semibold transition-all touch-manipulation focus-visible:ring-2 focus-visible:ring-primary cursor-pointer ${
            selectedCardId === "none"
              ? "bg-foreground text-background shadow-sm scale-102 ring-2 ring-foreground/20 font-bold"
              : "border border-border/80 bg-background/80 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/40"
          }`}
        >
          <CreditCard className="h-4 w-4 opacity-50 shrink-0" />
          <span>No Card / Standard Price</span>
          {selectedCardId === "none" && <Check className="h-3.5 w-3.5 text-background" />}
        </button>

        {/* Option 2: All Cards (Best Deal) Pill */}
        <button
          type="button"
          onClick={() => setSelectedCardId("all")}
          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 min-h-[40px] text-xs font-semibold transition-all touch-manipulation focus-visible:ring-2 focus-visible:ring-primary cursor-pointer ${
            selectedCardId === "all"
              ? "border-2 border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm ring-2 ring-emerald-500/25 scale-102"
              : "border border-border/80 bg-background/80 text-foreground hover:border-emerald-500/40 hover:bg-muted/40"
          }`}
        >
          <BankLogoIcon cardId="all" className="h-5 w-5 rounded-md shrink-0" />
          <span>All Cards (Best Deal)</span>
          <span
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
              selectedCardId === "all"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-muted text-muted-foreground"
            }`}
          >
            Up to 5% off
          </span>
          {selectedCardId === "all" && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ml-0.5" />}
        </button>

        {/* Option 3..N: Specific Brand SVG Bank Pills */}
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

      {/* Active Card Rule Description Banner or Off State Tip */}
      {selectedCardId !== "none" ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-2.5 sm:p-3 text-xs text-foreground">
          <div className="flex items-center gap-2.5 min-w-0">
            <BankLogoIcon cardId={selectedCardId} className="h-5 w-5 rounded-xs shrink-0 shadow-xs" />
            <span className="truncate">
              <strong>Active Card Offer:</strong>{" "}
              {activeCard
                ? `Applying ${activeCard.cardName} benefits (Instant checkout deduction + ${Math.round(activeCard.defaultCashbackPct * 100)}% rewards).`
                : "Automatically applying the highest-saving bank card offer across all participating stores."}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeCard && (
              <button
                type="button"
                onClick={() => setModalCard(activeCard)}
                className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline touch-manipulation cursor-pointer"
              >
                <span>Benefits &amp; Apply</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedCardId("none")}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground underline ml-2 cursor-pointer"
            >
              Reset to Standard Price
            </button>
          </div>
        </div>
      ) : null}

      {/* Card Application Modal */}
      <CardApplicationModal
        isOpen={modalCard !== null}
        onClose={() => setModalCard(null)}
        card={modalCard}
      />
    </div>
  );
}
