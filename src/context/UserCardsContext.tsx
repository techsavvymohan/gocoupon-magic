/**
 * @file UserCardsContext.tsx
 * @description Context and Hook for managing user-selected and owned bank cards.
 * Persists card choices in localStorage to provide instant personalized out-of-pocket pricing.
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  SUPPORTED_BANK_CARDS,
  type BankCardDefinition,
  type BankCardSavingsResult,
  calculateBankCardSavings,
  getBestCardOfferForProduct,
} from "@/lib/services/bank-offers";
import {
  US_CREDIT_CARDS,
  calculateUsCardSavings,
  getBestUsCardForProduct,
} from "@/lib/services/international-market";
import { useCurrency } from "./CurrencyContext";

interface UserCardsContextType {
  selectedCardId: string; // 'all' or specific bank id e.g. 'hdfc', 'chase'
  setSelectedCardId: (id: string) => void;
  activeCard: BankCardDefinition | null;
  allCards: BankCardDefinition[];
  userOwnedCardIds: string[];
  toggleUserOwnedCard: (cardId: string) => void;
  isCardOwned: (cardId: string) => boolean;
  getSavingsForOffer: (
    storeName: string,
    price: number,
    category?: string
  ) => BankCardSavingsResult;
  isIndia: boolean;
}

const STORAGE_KEY_SELECTED_CARD = "gocoupon_selected_bank_card";
const STORAGE_KEY_OWNED_CARDS = "gocoupon_owned_bank_cards";

const UserCardsContext = createContext<UserCardsContextType | undefined>(undefined);

export function UserCardsProvider({ children }: { children: React.ReactNode }) {
  const { isIndia } = useCurrency();

  // Pick regional cards list based on detected geo
  const regionalCards = useMemo(() => {
    return isIndia ? SUPPORTED_BANK_CARDS : US_CREDIT_CARDS;
  }, [isIndia]);

  // 1. Active filter/focus card
  const [selectedCardId, setSelectedCardIdState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY_SELECTED_CARD) || "all";
    }
    return "all";
  });

  // 2. User's actual wallet of owned cards
  const [userOwnedCardIds, setUserOwnedCardIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_OWNED_CARDS);
        if (stored) return JSON.parse(stored);
      } catch {
        // Fallback to default
      }
    }
    return isIndia ? ["hdfc", "sbi"] : ["chase", "amex"];
  });

  // Update localStorage when active card changes
  const setSelectedCardId = useCallback((id: string) => {
    setSelectedCardIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_SELECTED_CARD, id);
    }
  }, []);

  // Toggle card ownership in user's profile
  const toggleUserOwnedCard = useCallback((cardId: string) => {
    setUserOwnedCardIds((prev) => {
      const next = prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId];
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_OWNED_CARDS, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const isCardOwned = useCallback(
    (cardId: string) => userOwnedCardIds.includes(cardId),
    [userOwnedCardIds]
  );

  const activeCard = useMemo(() => {
    if (selectedCardId === "all") return null;
    return regionalCards.find((c) => c.id === selectedCardId) || null;
  }, [selectedCardId, regionalCards]);

  /**
   * Computes bank card savings for any given store offer taking into account the user's active card selection and region.
   */
  const getSavingsForOffer = useCallback(
    (storeName: string, price: number, category = "general"): BankCardSavingsResult => {
      if (isIndia) {
        if (selectedCardId !== "all") {
          return calculateBankCardSavings(selectedCardId, storeName, price, category);
        }
        return getBestCardOfferForProduct(storeName, price, category);
      } else {
        if (selectedCardId !== "all") {
          return calculateUsCardSavings(selectedCardId, storeName, price, category);
        }
        return getBestUsCardForProduct(storeName, price, category);
      }
    },
    [isIndia, selectedCardId]
  );

  const value = useMemo(
    () => ({
      selectedCardId,
      setSelectedCardId,
      activeCard,
      allCards: regionalCards,
      userOwnedCardIds,
      toggleUserOwnedCard,
      isCardOwned,
      getSavingsForOffer,
      isIndia,
    }),
    [
      selectedCardId,
      setSelectedCardId,
      activeCard,
      regionalCards,
      userOwnedCardIds,
      toggleUserOwnedCard,
      isCardOwned,
      getSavingsForOffer,
      isIndia,
    ]
  );

  return <UserCardsContext.Provider value={value}>{children}</UserCardsContext.Provider>;
}

export function useUserCards() {
  const context = useContext(UserCardsContext);
  if (!context) {
    throw new Error("useUserCards must be used within a UserCardsProvider");
  }
  return context;
}
