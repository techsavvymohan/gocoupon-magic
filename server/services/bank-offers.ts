/**
 * @file server/services/bank-offers.ts
 * @description Dynamic Regional Bank & Payment Card Offer Engine.
 *
 * Implements temporal validity (validFrom, validUntil) with automated pruning,
 * regional banking profiles (India, US, UK, UAE, EU), card tier filtering
 * (Credit, Debit, EMI), and instant discount calculation.
 */

export type RegionCode = "IN" | "US" | "UK" | "EU" | "AE";
export type CardType = "CREDIT" | "DEBIT" | "EMI" | "PAYPAL" | "WALLET" | "BNPL";
export type DiscountType = "PERCENT" | "FLAT";

export interface BankOfferRule {
  id: string;
  bankName: string;
  code?: string;
  region: RegionCode;
  applicableStores: string[]; // ["amazon", "flipkart", "croma", "walmart", "bestbuy", "*"]
  cardTypes: CardType[];
  minSpend: number;
  discountType: DiscountType;
  discountValue: number;      // e.g. 10 for 10%, or 2500 for flat ₹2500
  maxDiscountCap: number;     // Upper ceiling on savings
  isInstantDiscount: boolean; // True = instant deduction at checkout; False = statement credit
  validFrom: string;          // ISO timestamp
  validUntil: string;         // ISO timestamp (Auto-pruned when expired)
  description: string;
  termsUrl?: string;
}

/**
 * Curated live registry of regional card and bank promotions.
 * Stored in memory with strict temporal boundaries to prevent stale offers.
 */
export const BANK_OFFER_REGISTRY: BankOfferRule[] = [
  // ── 1. INDIA (IN) ──────────────────────────────────────────────────────────
  {
    id: "in_hdfc_instant_10",
    bankName: "HDFC Bank",
    region: "IN",
    applicableStores: ["amazon", "croma", "tatacliq", "reliancedigital"],
    cardTypes: ["CREDIT", "EMI"],
    minSpend: 15000,
    discountType: "PERCENT",
    discountValue: 10,
    maxDiscountCap: 3000,
    isInstantDiscount: true,
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    description: "10% Instant Discount up to ₹3,000 on HDFC Credit Card & EMI transactions.",
  },
  {
    id: "in_icici_instant_flat",
    bankName: "ICICI Bank",
    region: "IN",
    applicableStores: ["flipkart", "amazon", "croma"],
    cardTypes: ["CREDIT", "DEBIT"],
    minSpend: 25000,
    discountType: "FLAT",
    discountValue: 2500,
    maxDiscountCap: 2500,
    isInstantDiscount: true,
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    description: "Flat ₹2,500 Instant Discount on ICICI Bank Cards on orders above ₹25,000.",
  },
  {
    id: "in_amazon_pay_icici",
    bankName: "Amazon Pay ICICI",
    region: "IN",
    applicableStores: ["amazon"],
    cardTypes: ["CREDIT"],
    minSpend: 500,
    discountType: "PERCENT",
    discountValue: 5,
    maxDiscountCap: 5000,
    isInstantDiscount: false, // 5% unlimited cashback
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    description: "5% Unlimited Cashback for Prime Members using Amazon Pay ICICI Card.",
  },
  {
    id: "in_sbi_card_festive",
    bankName: "SBI Card",
    region: "IN",
    applicableStores: ["amazon", "flipkart", "myntra"],
    cardTypes: ["CREDIT", "EMI"],
    minSpend: 10000,
    discountType: "PERCENT",
    discountValue: 10,
    maxDiscountCap: 1750,
    isInstantDiscount: true,
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    description: "10% Instant Savings up to ₹1,750 on SBI Credit Card transactions.",
  },
  {
    id: "in_axis_bank_flipkart",
    bankName: "Axis Bank",
    region: "IN",
    applicableStores: ["flipkart"],
    cardTypes: ["CREDIT"],
    minSpend: 1000,
    discountType: "PERCENT",
    discountValue: 5,
    maxDiscountCap: 4000,
    isInstantDiscount: false,
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    description: "5% Unlimited Cashback on Flipkart with Flipkart Axis Bank Credit Card.",
  },

  // ── 2. UNITED STATES (US) ──────────────────────────────────────────────────
  {
    id: "us_amex_offer_tech",
    bankName: "American Express",
    region: "US",
    applicableStores: ["bestbuy", "dell", "lenovo"],
    cardTypes: ["CREDIT"],
    minSpend: 250,
    discountType: "FLAT",
    discountValue: 40,
    maxDiscountCap: 40,
    isInstantDiscount: false, // Statement credit
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    description: "Spend $250 or more, get $40 back via Amex Offers statement credit.",
  },
  {
    id: "us_chase_freedom_wholesale",
    bankName: "Chase Freedom",
    region: "US",
    applicableStores: ["target", "walmart", "amazon"],
    cardTypes: ["CREDIT"],
    minSpend: 50,
    discountType: "PERCENT",
    discountValue: 5,
    maxDiscountCap: 75,
    isInstantDiscount: false,
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    description: "5% Cash Back on up to $1,500 in quarterly rotational merchant categories.",
  },
  {
    id: "us_paypal_rewards",
    bankName: "PayPal Rewards",
    region: "US",
    applicableStores: ["walmart", "target", "newegg"],
    cardTypes: ["PAYPAL"],
    minSpend: 100,
    discountType: "PERCENT",
    discountValue: 4,
    maxDiscountCap: 50,
    isInstantDiscount: true,
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    description: "4% Instant Reward Discount at checkout when paying with PayPal Balance/Linked Card.",
  },

  // ── 3. UNITED KINGDOM (UK) ─────────────────────────────────────────────────
  {
    id: "uk_monzo_perks_currys",
    bankName: "Monzo Perks",
    region: "UK",
    applicableStores: ["currys", "argos", "amazon"],
    cardTypes: ["DEBIT", "CREDIT"],
    minSpend: 80,
    discountType: "PERCENT",
    discountValue: 5,
    maxDiscountCap: 35,
    isInstantDiscount: false,
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    description: "5% Cashback on electronics purchases at Currys and Argos with Monzo Plus/Premium.",
  },

  // ── 4. MIDDLE EAST / UAE (AE) ──────────────────────────────────────────────
  {
    id: "ae_adcb_noon_vip",
    bankName: "ADCB Islamic",
    region: "AE",
    applicableStores: ["noon", "amazon"],
    cardTypes: ["CREDIT"],
    minSpend: 200,
    discountType: "PERCENT",
    discountValue: 15,
    maxDiscountCap: 100,
    isInstantDiscount: true,
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    description: "15% Instant Discount (up to AED 100) with ADCB TouchPoints Credit Cards on Noon.",
  },
];

/**
 * Filter and evaluate active, non-expired bank offers for a given store and purchase amount.
 */
export function getActiveBankOffers(options: {
  storeNameOrSlug: string;
  region?: RegionCode;
  cartAmount?: number;
  now?: Date;
}): BankOfferRule[] {
  const now = options.now || new Date();
  const nowIso = now.toISOString();
  const normalizedStore = options.storeNameOrSlug.toLowerCase().replace(/[^a-z0-9]/g, "");
  const targetRegion = options.region;

  return BANK_OFFER_REGISTRY.filter((offer) => {
    // 1. Temporal Boundary Check (Auto-pruning)
    if (offer.validFrom > nowIso || offer.validUntil < nowIso) {
      return false;
    }

    // 2. Region check (if specified)
    if (targetRegion && offer.region !== targetRegion) {
      return false;
    }

    // 3. Store check
    const matchesStore =
      offer.applicableStores.includes("*") ||
      offer.applicableStores.some((s) => normalizedStore.includes(s) || s.includes(normalizedStore));
    if (!matchesStore) {
      return false;
    }

    // 4. Minimum spend check (if cartAmount provided)
    if (options.cartAmount !== undefined && options.cartAmount < offer.minSpend) {
      return false;
    }

    return true;
  });
}

export interface BankOfferEvaluation {
  offer: BankOfferRule;
  discountAmount: number;
  effectivePrice: number;
  isMaxCapApplied: boolean;
  savingsSummary: string;
}

/**
 * Calculates the exact currency discount for a specific bank offer given a purchase amount.
 */
export function calculateBankDiscount(
  offer: BankOfferRule,
  cartAmount: number
): BankOfferEvaluation {
  if (cartAmount < offer.minSpend) {
    return {
      offer,
      discountAmount: 0,
      effectivePrice: cartAmount,
      isMaxCapApplied: false,
      savingsSummary: `Minimum spend of ${offer.minSpend} required to unlock this offer`,
    };
  }

  let calculatedDiscount = 0;
  if (offer.discountType === "PERCENT") {
    calculatedDiscount = Math.round((cartAmount * offer.discountValue) / 100);
  } else {
    calculatedDiscount = offer.discountValue;
  }

  const isMaxCapApplied = calculatedDiscount > offer.maxDiscountCap;
  const finalDiscount = Math.min(calculatedDiscount, offer.maxDiscountCap);
  const effectivePrice = Math.max(0, cartAmount - finalDiscount);

  return {
    offer,
    discountAmount: finalDiscount,
    effectivePrice,
    isMaxCapApplied,
    savingsSummary: `${offer.bankName}: Save ${finalDiscount} (${offer.isInstantDiscount ? "Instant Checkout Discount" : "Statement / Rewards Credit"})`,
  };
}

/**
 * Finds the single best bank card offer that yields the maximum net discount for a basket.
 */
export function findBestBankOffer(options: {
  storeNameOrSlug: string;
  cartAmount: number;
  region?: RegionCode;
  preferredBank?: string;
}): BankOfferEvaluation | null {
  const eligibleOffers = getActiveBankOffers({
    storeNameOrSlug: options.storeNameOrSlug,
    cartAmount: options.cartAmount,
    region: options.region,
  });

  if (eligibleOffers.length === 0) {
    return null;
  }

  // If user has a preferred bank card, try that first
  if (options.preferredBank) {
    const pref = options.preferredBank.toLowerCase();
    const matchedPref = eligibleOffers.find((o) => o.bankName.toLowerCase().includes(pref));
    if (matchedPref) {
      return calculateBankDiscount(matchedPref, options.cartAmount);
    }
  }

  // Otherwise pick the offer yielding highest discount
  let best: BankOfferEvaluation | null = null;
  for (const offer of eligibleOffers) {
    const evalResult = calculateBankDiscount(offer, options.cartAmount);
    if (!best || evalResult.discountAmount > best.discountAmount) {
      best = evalResult;
    }
  }

  return best;
}
