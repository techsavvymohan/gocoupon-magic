/**
 * @file bank-offers.ts
 * @description Indian Bank Card & EMI Offer Intelligence Engine.
 * Manages bank discount rules, card cashback formulas, affiliate application links,
 * and net out-of-pocket checkout price calculations for Indian credit cards.
 */

import { wrapAffiliateTracking } from "./store-registry";

export interface BankCardDefinition {
  id: string;
  bankName: string;
  cardName: string;
  shortName: string;
  logo: string;
  badgeColor: string;
  annualFee: string;
  cpaBountyInr: number;
  officialApplyUrl: string;
  affiliateApplyUrl: string;
  keyPerks: string[];
  welcomeBonus: string;
  defaultCashbackPct: number; // e.g. 0.05 for 5%
  // Specific discount rules per store/category
  rules: BankOfferRule[];
}

export interface BankOfferRule {
  storeIdPattern: string[]; // e.g. ["amazon", "flipkart", "croma"]
  categoryPattern?: string[]; // e.g. ["electronics", "smartphones", "laptops"]
  minSpendInr: number;
  discountType: "percent" | "flat";
  discountValue: number; // e.g. 10 for 10%, or 1500 for flat ₹1,500
  maxDiscountInr: number;
  isEmiOnly?: boolean;
  description: string;
}

export interface BankCardSavingsResult {
  cardId: string;
  bankName: string;
  cardName: string;
  instantDiscount: number;
  cashbackAmount: number;
  totalCardSavings: number;
  effectiveNetPrice: number;
  appliedRuleDescription: string;
  isBestOffer: boolean;
  affiliateApplyUrl: string;
}

const CUELINKS_PUB_ID = process.env.VITE_CUELINKS_PUB_ID || "148920";

function buildCardAffiliateUrl(rawBankUrl: string, bankId: string): string {
  if (CUELINKS_PUB_ID && /^https?:\/\//i.test(rawBankUrl)) {
    return `https://linksredirect.com/?pub_id=${CUELINKS_PUB_ID}&subid=gocoupon_cards_${bankId}&url=${encodeURIComponent(
      rawBankUrl
    )}`;
  }
  return rawBankUrl;
}

/**
 * Master Registry of Indian Credit Cards & Bank Discount Programs.
 */
export const SUPPORTED_BANK_CARDS: BankCardDefinition[] = [
  {
    id: "hdfc",
    bankName: "HDFC Bank",
    cardName: "HDFC Bank Millennia / Regalia Gold",
    shortName: "HDFC",
    logo: "/icons/hdfc.svg",
    badgeColor: "bg-blue-600 text-white",
    annualFee: "₹1,000 (Waived on ₹1L spend)",
    cpaBountyInr: 2200,
    welcomeBonus: "Flat ₹1,000 Amazon Gift Voucher on 1st transaction",
    officialApplyUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards",
    affiliateApplyUrl: buildCardAffiliateUrl(
      "https://www.hdfcbank.com/personal/pay/cards/credit-cards",
      "hdfc"
    ),
    keyPerks: [
      "5% Cashback on Amazon, Flipkart, Myntra, Swiggy & Zomato",
      "10% Instant Bank Discount during festive & weekend sales (up to ₹3,000)",
      "1% Fuel Surcharge Waiver across India",
      "Complimentary domestic airport lounge access (4/year)",
    ],
    defaultCashbackPct: 0.05,
    rules: [
      {
        storeIdPattern: ["amazon", "flipkart", "croma", "reliance", "tatacliq", "vijaysales"],
        categoryPattern: ["electronics", "mobile", "smartphone", "laptop", "audio", "tv"],
        minSpendInr: 10000,
        discountType: "percent",
        discountValue: 10,
        maxDiscountInr: 2500,
        description: "10% Instant Discount up to ₹2,500 on Electronics (Min. ₹10,000)",
      },
      {
        storeIdPattern: ["myntra", "ajio"],
        categoryPattern: ["fashion", "clothing", "shoe"],
        minSpendInr: 2500,
        discountType: "percent",
        discountValue: 10,
        maxDiscountInr: 1000,
        description: "10% Instant Discount up to ₹1,000 on Fashion (Min. ₹2,500)",
      },
      {
        storeIdPattern: ["amazon", "flipkart", "tatacliq"],
        minSpendInr: 5000,
        discountType: "percent",
        discountValue: 10,
        maxDiscountInr: 1500,
        description: "10% Instant Discount up to ₹1,500 on all qualifying orders",
      },
    ],
  },
  {
    id: "sbi",
    bankName: "SBI Card",
    cardName: "SBI Cashback Credit Card",
    shortName: "SBI",
    logo: "/icons/sbi.svg",
    badgeColor: "bg-sky-600 text-white",
    annualFee: "₹999 (Waived on ₹2L spend)",
    cpaBountyInr: 2000,
    welcomeBonus: "Flat ₹500 Cashback on card activation",
    officialApplyUrl: "https://www.sbicard.com/en/personal/credit-cards/rewards/cashback-sbi-card.page",
    affiliateApplyUrl: buildCardAffiliateUrl(
      "https://www.sbicard.com/en/personal/credit-cards/rewards/cashback-sbi-card.page",
      "sbi"
    ),
    keyPerks: [
      "Flat 5% Unlimited Cashback on ALL online shopping merchants without restrictions",
      "Auto-credited to statement every month (up to ₹5,000/month)",
      "Zero merchant merchant exclusion on Amazon, Flipkart, Croma, Myntra",
      "1% Fuel surcharge waiver at all petrol pumps",
    ],
    defaultCashbackPct: 0.05,
    rules: [
      {
        storeIdPattern: ["amazon", "flipkart", "croma", "reliance", "myntra", "tatacliq", "ajio", "meesho", "nykaa"],
        minSpendInr: 500,
        discountType: "percent",
        discountValue: 5,
        maxDiscountInr: 5000,
        description: "Flat 5% Cashback on ALL online purchases without merchant restrictions",
      },
      {
        storeIdPattern: ["flipkart", "croma"],
        categoryPattern: ["electronics", "mobile", "smartphone", "tv"],
        minSpendInr: 15000,
        discountType: "percent",
        discountValue: 10,
        maxDiscountInr: 3000,
        description: "10% Instant Bank Discount up to ₹3,000 on high-value electronics",
      },
    ],
  },
  {
    id: "icici",
    bankName: "ICICI Bank",
    cardName: "Amazon Pay ICICI / Coral Card",
    shortName: "ICICI",
    logo: "/icons/icici.svg",
    badgeColor: "bg-amber-600 text-white",
    annualFee: "Lifetime FREE (₹0 joining & annual fee)",
    cpaBountyInr: 1500,
    welcomeBonus: "Up to ₹2,000 Amazon Pay Balance & Prime rewards",
    officialApplyUrl: "https://www.icicibank.com/personal-banking/cards/credit-card",
    affiliateApplyUrl: buildCardAffiliateUrl(
      "https://www.icicibank.com/personal-banking/cards/credit-card",
      "icici"
    ),
    keyPerks: [
      "Lifetime FREE: Zero joining fee and zero annual charges forever",
      "5% Unlimited Cashback on Amazon India for Prime members",
      "2% Unlimited Cashback on 100+ partner merchants (Swiggy, Uber, etc.)",
      "10% Instant Bank Discount during Flipkart Big Billion & festive sales",
    ],
    defaultCashbackPct: 0.05,
    rules: [
      {
        storeIdPattern: ["amazon"],
        minSpendInr: 100,
        discountType: "percent",
        discountValue: 5,
        maxDiscountInr: 10000,
        description: "5% Unlimited Cashback auto-credited as Amazon Pay balance",
      },
      {
        storeIdPattern: ["flipkart", "croma", "tatacliq", "reliance"],
        categoryPattern: ["electronics", "mobile", "laptop", "audio", "tv"],
        minSpendInr: 12000,
        discountType: "percent",
        discountValue: 10,
        maxDiscountInr: 2000,
        description: "10% Instant Bank Discount up to ₹2,000 on electronics",
      },
    ],
  },
  {
    id: "axis",
    bankName: "Axis Bank",
    cardName: "Flipkart Axis / Airtel Axis Bank Card",
    shortName: "Axis",
    logo: "/icons/axis.svg",
    badgeColor: "bg-rose-700 text-white",
    annualFee: "₹500 (Waived on ₹3.5L spend)",
    cpaBountyInr: 2100,
    welcomeBonus: "₹500 Flipkart voucher + ₹600 extra cashback",
    officialApplyUrl: "https://www.axisbank.com/retail/cards/credit-card",
    affiliateApplyUrl: buildCardAffiliateUrl(
      "https://www.axisbank.com/retail/cards/credit-card",
      "axis"
    ),
    keyPerks: [
      "Flat 5% Unlimited Cashback on Flipkart & Myntra orders",
      "4% Unlimited Cashback on Swiggy, Uber & PVR",
      "10% Instant Discount on Amazon Great Indian Festival & sales",
      "4 complimentary domestic lounge visits per year",
    ],
    defaultCashbackPct: 0.05,
    rules: [
      {
        storeIdPattern: ["flipkart", "myntra"],
        minSpendInr: 100,
        discountType: "percent",
        discountValue: 5,
        maxDiscountInr: 10000,
        description: "5% Unlimited Cashback on Flipkart & Myntra",
      },
      {
        storeIdPattern: ["amazon", "croma", "reliance"],
        minSpendInr: 10000,
        discountType: "percent",
        discountValue: 10,
        maxDiscountInr: 1750,
        description: "10% Instant Bank Discount up to ₹1,750 on select merchandise",
      },
    ],
  },
  {
    id: "kotak",
    bankName: "Kotak Mahindra Bank",
    cardName: "Kotak League / Zen Credit Card",
    shortName: "Kotak",
    logo: "/icons/kotak.svg",
    badgeColor: "bg-red-600 text-white",
    annualFee: "₹500 (Waived on ₹50K spend)",
    cpaBountyInr: 1800,
    welcomeBonus: "1,000 Reward Points on ₹10,000 retail spend",
    officialApplyUrl: "https://www.kotak.com/en/personal-banking/cards/credit-cards.html",
    affiliateApplyUrl: buildCardAffiliateUrl(
      "https://www.kotak.com/en/personal-banking/cards/credit-cards.html",
      "kotak"
    ),
    keyPerks: [
      "10% Instant Discount on Amazon, Flipkart & Croma festive sales",
      "8X reward points on online transactions",
      "Free movie tickets on BookMyShow (up to 4 tickets/quarter)",
      "Zero joining fee on select promotional links",
    ],
    defaultCashbackPct: 0.035,
    rules: [
      {
        storeIdPattern: ["amazon", "flipkart", "croma"],
        minSpendInr: 7500,
        discountType: "percent",
        discountValue: 10,
        maxDiscountInr: 1500,
        description: "10% Instant Discount up to ₹1,500 on min. purchase of ₹7,500",
      },
    ],
  },
  {
    id: "indusind",
    bankName: "IndusInd Bank",
    cardName: "IndusInd Legend / Tiger Credit Card",
    shortName: "IndusInd",
    logo: "/icons/indusind.svg",
    badgeColor: "bg-purple-800 text-white",
    annualFee: "Lifetime FREE",
    cpaBountyInr: 2500,
    welcomeBonus: "E-Gift vouchers worth ₹2,000 from top brands",
    officialApplyUrl: "https://www.indusind.com/in/en/personal/cards/credit-cards.html",
    affiliateApplyUrl: buildCardAffiliateUrl(
      "https://www.indusind.com/in/en/personal/cards/credit-cards.html",
      "indusind"
    ),
    keyPerks: [
      "Lifetime FREE credit card with instant online approval",
      "10% Instant Discount on Swiggy, Zomato & E-commerce portals",
      "Complimentary Golf rounds and lounge access",
      "Highest affiliate bounty of ₹2,500 per approved card",
    ],
    defaultCashbackPct: 0.03,
    rules: [
      {
        storeIdPattern: ["amazon", "flipkart", "croma", "tatacliq"],
        minSpendInr: 6000,
        discountType: "percent",
        discountValue: 10,
        maxDiscountInr: 1500,
        description: "10% Instant Discount up to ₹1,500 on shopping portals",
      },
    ],
  },
];

/**
 * Returns all supported bank cards.
 */
export function getAllSupportedBankCards(): BankCardDefinition[] {
  return SUPPORTED_BANK_CARDS;
}

/**
 * Calculates bank card savings for a given card, store, price, and category.
 */
export function calculateBankCardSavings(
  cardId: string,
  storeName: string,
  price: number,
  category = "general"
): BankCardSavingsResult {
  const card = SUPPORTED_BANK_CARDS.find((c) => c.id.toLowerCase() === cardId.toLowerCase());
  if (!card || price <= 0) {
    return {
      cardId: cardId || "none",
      bankName: "None",
      cardName: "No Card Selected",
      instantDiscount: 0,
      cashbackAmount: 0,
      totalCardSavings: 0,
      effectiveNetPrice: price,
      appliedRuleDescription: "No active bank card offer",
      isBestOffer: false,
      affiliateApplyUrl: "",
    };
  }

  const normStore = (storeName || "").toLowerCase();
  const normCat = (category || "").toLowerCase();

  let instantDiscount = 0;
  let appliedRuleDesc = "";

  // 1. Check for specific matching instant discount rules
  for (const rule of card.rules) {
    const storeMatches = rule.storeIdPattern.some((p) => normStore.includes(p));
    if (!storeMatches) continue;

    if (rule.categoryPattern && rule.categoryPattern.length > 0) {
      const catMatches = rule.categoryPattern.some((cp) => normCat.includes(cp));
      if (!catMatches) continue;
    }

    if (price < rule.minSpendInr) continue;

    const calcDiscount =
      rule.discountType === "percent"
        ? Math.round(price * (rule.discountValue / 100))
        : rule.discountValue;

    const cappedDiscount = Math.min(calcDiscount, rule.maxDiscountInr);
    if (cappedDiscount > instantDiscount) {
      instantDiscount = cappedDiscount;
      appliedRuleDesc = rule.description;
    }
  }

  // 2. Calculate card-level cashback on remaining price
  const priceAfterInstant = Math.max(0, price - instantDiscount);
  const cashbackAmount = Math.round(priceAfterInstant * card.defaultCashbackPct);

  // If no specific instant discount triggered, use default cashback description
  if (instantDiscount === 0) {
    appliedRuleDesc = `${Math.round(card.defaultCashbackPct * 100)}% Card Cashback via ${card.shortName}`;
  }

  const totalCardSavings = instantDiscount + cashbackAmount;
  const effectiveNetPrice = Math.max(99, price - totalCardSavings);

  return {
    cardId: card.id,
    bankName: card.bankName,
    cardName: card.cardName,
    instantDiscount,
    cashbackAmount,
    totalCardSavings,
    effectiveNetPrice,
    appliedRuleDescription: appliedRuleDesc,
    isBestOffer: false,
    affiliateApplyUrl: card.affiliateApplyUrl,
  };
}

/**
 * Automatically evaluates all cards and returns the single highest-saving card for a product.
 */
export function getBestCardOfferForProduct(
  storeName: string,
  price: number,
  category = "general"
): BankCardSavingsResult {
  let bestResult: BankCardSavingsResult = {
    cardId: "sbi",
    bankName: "SBI Card",
    cardName: "SBI Cashback Credit Card",
    instantDiscount: 0,
    cashbackAmount: Math.round(price * 0.05),
    totalCardSavings: Math.round(price * 0.05),
    effectiveNetPrice: Math.max(99, price - Math.round(price * 0.05)),
    appliedRuleDescription: "Flat 5% Cashback on online shopping",
    isBestOffer: true,
    affiliateApplyUrl: SUPPORTED_BANK_CARDS[1]?.affiliateApplyUrl || "",
  };

  for (const card of SUPPORTED_BANK_CARDS) {
    const res = calculateBankCardSavings(card.id, storeName, price, category);
    if (res.totalCardSavings > bestResult.totalCardSavings) {
      bestResult = { ...res, isBestOffer: true };
    }
  }

  return bestResult;
}

/**
 * Calculates net checkout price factoring in store coupons, platform cashback, and bank card savings.
 */
export function getNetPriceWithCard(
  basePrice: number,
  couponSavings = 0,
  platformCashback = 0,
  bankCardDiscount = 0
): number {
  return Math.max(99, basePrice - couponSavings - platformCashback - bankCardDiscount);
}
