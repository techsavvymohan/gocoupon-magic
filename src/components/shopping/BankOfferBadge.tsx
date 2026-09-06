/**
 * @file BankOfferBadge.tsx
 * @description Compact, high-converting badge highlighting bank card discounts with authentic vector SVG logos.
 */

import { useState } from "react";
import { type BankCardSavingsResult, SUPPORTED_BANK_CARDS } from "@/lib/services/bank-offers";
import { US_CREDIT_CARDS } from "@/lib/services/international-market";
import { BankLogoIcon } from "@/components/icons/BankLogos";
import { useUserCards } from "@/context/UserCardsContext";
import { CardApplicationModal } from "./CardApplicationModal";
import { Sparkles } from "lucide-react";

interface BankOfferBadgeProps {
  savingsResult: BankCardSavingsResult;
  productTitle?: string;
  size?: "small" | "medium";
}

export function BankOfferBadge({
  savingsResult,
  productTitle,
  size = "small",
}: BankOfferBadgeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isIndia } = useUserCards();

  if (!savingsResult || savingsResult.totalCardSavings <= 0) {
    return null;
  }

  // Check both Indian and US card registries for matching brand info
  const allCardsList = [...SUPPORTED_BANK_CARDS, ...US_CREDIT_CARDS];
  const matchingCard =
    allCardsList.find((c) => c.id.toLowerCase() === savingsResult.cardId.toLowerCase()) ||
    allCardsList[0];

  const isSmall = size === "small";

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        title={`Click to view ${matchingCard.cardName} benefits or apply`}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 font-sans font-semibold text-foreground hover:bg-primary/20 hover:border-primary/40 transition-all touch-manipulation cursor-pointer ${
          isSmall ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
        }`}
      >
        {/* Real Brand Vector SVG */}
        <BankLogoIcon cardId={matchingCard.id} className={isSmall ? "h-3.5 w-3.5 shrink-0" : "h-4 w-4 shrink-0"} />
        <span className="font-bold text-primary">
          {matchingCard.shortName}:
        </span>
        <span className="font-semibold tabular-nums">
          -{isIndia ? "₹" : "$"}{savingsResult.totalCardSavings.toLocaleString(isIndia ? "en-IN" : "en-US")}
        </span>
        <Sparkles className="h-2.5 w-2.5 text-amber-500 shrink-0" />
      </button>

      <CardApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        card={matchingCard}
        currentProductTitle={productTitle}
        instantSavingsAmount={savingsResult.totalCardSavings}
      />
    </>
  );
}
