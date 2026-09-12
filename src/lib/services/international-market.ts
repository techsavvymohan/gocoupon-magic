/**
 * @file international-market.ts
 * @description Dedicated International & US Market Engine.
 * Manages US/Global major retailers, US credit cards & cashback rewards,
 * Affirm/Klarna Buy Now Pay Later (BNPL) calculations, and international affiliate tracking.
 */

import { type BankCardDefinition, type BankCardSavingsResult } from "./bank-offers";

export interface InternationalStore {
  id: string;
  name: string;
  category: "electronics" | "fashion" | "home" | "general";
  region: "US" | "GLOBAL";
  tier: number;
  logo: string;
  cashbackRate: string;
  cashbackPct: number;
  buildSearchUrl: (query: string) => string;
}

export interface BnplInstallmentResult {
  provider: "Affirm" | "Klarna" | "Afterpay";
  totalPrice: number;
  installmentCount: number;
  installmentAmount: number;
  frequency: "bi-weekly" | "monthly";
  formattedPrompt: string;
  applyUrl: string;
}

const AMAZON_US_PARTNER_TAG = process.env.VITE_AMAZON_US_PARTNER_TAG || "";
const IMPACT_AFFILIATE_ID = process.env.VITE_IMPACT_AFFILIATE_ID || "";
const CJ_AFFILIATE_ID = process.env.VITE_CJ_AFFILIATE_ID || "";
const EBAY_EPN_CAMP_ID = process.env.VITE_EBAY_EPN_CAMP_ID || "";

/**
 * Wraps arbitrary international merchant search links with affiliate tracking.
 */
export function wrapInternationalAffiliateUrl(targetUrl: string, network = "direct"): string {
  if (!targetUrl) return "";

  // 1. Amazon US with tag
  if (targetUrl.includes("amazon.com") && AMAZON_US_PARTNER_TAG) {
    const separator = targetUrl.includes("?") ? "&" : "?";
    return `${targetUrl}${separator}tag=${AMAZON_US_PARTNER_TAG}`;
  }

  // 2. eBay Partner Network (EPN)
  if (targetUrl.includes("ebay.com") && EBAY_EPN_CAMP_ID) {
    return `https://rover.ebay.com/rover/1/711-53200-19255-0/1?campid=${EBAY_EPN_CAMP_ID}&toolid=10001&mpre=${encodeURIComponent(
      targetUrl
    )}`;
  }

  // 3. Impact / CJ / Direct wrapper
  return targetUrl;
}

/**
 * Top US & International Retailers Registry.
 */
export const INTERNATIONAL_STORES: InternationalStore[] = [
  {
    id: "amazon_us",
    name: "Amazon US",
    category: "general",
    region: "US",
    tier: 1,
    logo: "/Brand logos/Amazon_logo.svg.webp",
    cashbackRate: "Up to 5.0%",
    cashbackPct: 0.04,
    buildSearchUrl: (q) =>
      AMAZON_US_PARTNER_TAG
        ? `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=${AMAZON_US_PARTNER_TAG}`
        : `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
  },
  {
    id: "walmart",
    name: "Walmart",
    category: "general",
    region: "US",
    tier: 1,
    logo: "/icons/WMT-Wordmark-Small-TrueBlue-RGB.png",
    cashbackRate: "Up to 4.5%",
    cashbackPct: 0.035,
    buildSearchUrl: (q) =>
      wrapInternationalAffiliateUrl(`https://www.walmart.com/search?q=${encodeURIComponent(q)}`, "impact"),
  },
  {
    id: "target",
    name: "Target",
    category: "general",
    region: "US",
    tier: 1,
    logo: "/icons/target.svg",
    cashbackRate: "Up to 5.0%",
    cashbackPct: 0.04,
    buildSearchUrl: (q) =>
      wrapInternationalAffiliateUrl(`https://www.target.com/s?searchTerm=${encodeURIComponent(q)}`, "impact"),
  },
  {
    id: "bestbuy",
    name: "Best Buy",
    category: "electronics",
    region: "US",
    tier: 1,
    logo: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&auto=format&fit=crop&q=80",
    cashbackRate: "Up to 3.5%",
    cashbackPct: 0.03,
    buildSearchUrl: (q) =>
      wrapInternationalAffiliateUrl(`https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(q)}`, "cj"),
  },
  {
    id: "ebay_us",
    name: "eBay US",
    category: "general",
    region: "US",
    tier: 1,
    logo: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80",
    cashbackRate: "Up to 4.0%",
    cashbackPct: 0.035,
    buildSearchUrl: (q) =>
      wrapInternationalAffiliateUrl(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}`, "epn"),
  },
  {
    id: "newegg",
    name: "Newegg",
    category: "electronics",
    region: "US",
    tier: 2,
    logo: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=100&auto=format&fit=crop&q=80",
    cashbackRate: "Up to 3.0%",
    cashbackPct: 0.025,
    buildSearchUrl: (q) =>
      wrapInternationalAffiliateUrl(`https://www.newegg.com/p/pl?d=${encodeURIComponent(q)}`, "impact"),
  },
  {
    id: "bhphoto",
    name: "B&H Photo Video",
    category: "electronics",
    region: "US",
    tier: 2,
    logo: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&auto=format&fit=crop&q=80",
    cashbackRate: "Up to 3.5%",
    cashbackPct: 0.03,
    buildSearchUrl: (q) =>
      wrapInternationalAffiliateUrl(`https://www.bhphotovideo.com/c/search?Ntt=${encodeURIComponent(q)}`, "direct"),
  },
  {
    id: "homedepot",
    name: "Home Depot",
    category: "home",
    region: "US",
    tier: 2,
    logo: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100&auto=format&fit=crop&q=80",
    cashbackRate: "Up to 4.0%",
    cashbackPct: 0.03,
    buildSearchUrl: (q) =>
      wrapInternationalAffiliateUrl(`https://www.homedepot.com/s/${encodeURIComponent(q)}`, "impact"),
  },
];

/**
 * Master Registry of US Credit Cards & BNPL Financing Programs.
 * High CPA bounties ($100 - $200 USD per approved card / user).
 */
export const US_CREDIT_CARDS: BankCardDefinition[] = [
  {
    id: "chase",
    bankName: "Chase Bank",
    cardName: "Chase Freedom Unlimited / Sapphire",
    shortName: "Chase",
    logo: "/icons/chase.svg",
    badgeColor: "bg-blue-700 text-white",
    annualFee: "$0 Intro Fee (No Annual Fee on Freedom)",
    cpaBountyInr: 12500, // ~$150 USD
    welcomeBonus: "$200 Bonus after spending $500 in first 3 months",
    officialApplyUrl: "https://creditcards.chase.com/cash-back-credit-cards/freedom/unlimited",
    affiliateApplyUrl: "https://creditcards.chase.com/cash-back-credit-cards/freedom/unlimited",
    keyPerks: [
      "5% Cash Back on grocery & travel booked through Chase",
      "3% Cash Back on dining & drugstore purchases",
      "1.5% Unlimited Cash Back on all other purchases (Amazon, Walmart, Best Buy)",
      "0% Intro APR for 15 months on purchases and balance transfers",
    ],
    defaultCashbackPct: 0.05,
    rules: [
      {
        storeIdPattern: ["amazon", "walmart", "target", "bestbuy", "ebay", "newegg"],
        minSpendInr: 50, // $50 USD
        discountType: "percent",
        discountValue: 5,
        maxDiscountInr: 500,
        description: "5% Cash Back Rewards on eligible online purchases",
      },
    ],
  },
  {
    id: "amex",
    bankName: "American Express",
    cardName: "Amex Blue Cash Everyday Card",
    shortName: "Amex",
    logo: "/icons/amex.svg",
    badgeColor: "bg-sky-700 text-white",
    annualFee: "$0 Annual Fee",
    cpaBountyInr: 15000, // ~$175 USD
    welcomeBonus: "$200 Statement Credit after $2,000 spend in 6 months",
    officialApplyUrl: "https://www.americanexpress.com/us/credit-cards/card/blue-cash-everyday/",
    affiliateApplyUrl: "https://www.americanexpress.com/us/credit-cards/card/blue-cash-everyday/",
    keyPerks: [
      "3% Cash Back on U.S. online retail purchases (up to $6,000/year)",
      "3% Cash Back at U.S. supermarkets & U.S. gas stations",
      "1% Cash Back on other purchases",
      "$84 Disney Bundle Credit ($7/month back)",
    ],
    defaultCashbackPct: 0.03,
    rules: [
      {
        storeIdPattern: ["amazon", "walmart", "target", "bestbuy", "ebay", "newegg"],
        minSpendInr: 10,
        discountType: "percent",
        discountValue: 3,
        maxDiscountInr: 180,
        description: "3% Cash Back on U.S. Online Retail Purchases (Amazon, Walmart, Target)",
      },
    ],
  },
  {
    id: "capitalone",
    bankName: "Capital One",
    cardName: "Capital One Quicksilver / SavorOne",
    shortName: "Capital One",
    logo: "/icons/capitalone.svg",
    badgeColor: "bg-red-700 text-white",
    annualFee: "$0 Annual Fee",
    cpaBountyInr: 11000, // ~$130 USD
    welcomeBonus: "$200 Cash Bonus after spending $500 in first 3 months",
    officialApplyUrl: "https://www.capitalone.com/credit-cards/quicksilver/",
    affiliateApplyUrl: "https://www.capitalone.com/credit-cards/quicksilver/",
    keyPerks: [
      "Flat 1.5% Unlimited Cash Back on EVERY purchase, every day",
      "No rotating categories or sign-ups needed",
      "No foreign transaction fees when traveling abroad",
      "Cash back does not expire for the life of the account",
    ],
    defaultCashbackPct: 0.03,
    rules: [
      {
        storeIdPattern: ["amazon", "walmart", "target", "bestbuy", "ebay", "newegg"],
        minSpendInr: 10,
        discountType: "percent",
        discountValue: 3,
        maxDiscountInr: 150,
        description: "Up to 3% Cash Back on entertainment & online shopping",
      },
    ],
  },
  {
    id: "citi",
    bankName: "Citi Bank",
    cardName: "Citi Double Cash Card",
    shortName: "Citi",
    logo: "/icons/citi.svg",
    badgeColor: "bg-cyan-700 text-white",
    annualFee: "$0 Annual Fee",
    cpaBountyInr: 9500, // ~$110 USD
    welcomeBonus: "$200 Cash Back after $1,500 spend in first 6 months",
    officialApplyUrl: "https://www.citi.com/credit-cards/citi-double-cash-credit-card",
    affiliateApplyUrl: "https://www.citi.com/credit-cards/citi-double-cash-credit-card",
    keyPerks: [
      "Flat 2% Cash Back: 1% unlimited when you buy + 1% as you pay it off",
      "Zero restrictions on stores or spending categories",
      "No cap on the amount of cash back you can earn",
      "Convert cash back into ThankYou Points for travel",
    ],
    defaultCashbackPct: 0.02,
    rules: [
      {
        storeIdPattern: ["amazon", "walmart", "target", "bestbuy", "ebay", "newegg"],
        minSpendInr: 10,
        discountType: "percent",
        discountValue: 2,
        maxDiscountInr: 500,
        description: "Flat 2% Cash Back on all purchases (1% buy + 1% pay)",
      },
    ],
  },
  {
    id: "affirm",
    bankName: "Affirm BNPL",
    cardName: "Affirm 0% APR Installments",
    shortName: "Affirm",
    logo: "/icons/affirm.svg",
    badgeColor: "bg-indigo-600 text-white",
    annualFee: "$0 Fees • 0% APR Options",
    cpaBountyInr: 2500, // ~$30 USD per KYC
    welcomeBonus: "Split orders into 4 interest-free payments",
    officialApplyUrl: "https://www.affirm.com",
    affiliateApplyUrl: "https://www.affirm.com",
    keyPerks: [
      "Pay in 4 interest-free installments every 2 weeks",
      "No hidden late fees or compounding interest",
      "Accepted at Amazon, Walmart, Target, and thousands of US retailers",
      "Does not affect your credit score to check eligibility",
    ],
    defaultCashbackPct: 0.04,
    rules: [
      {
        storeIdPattern: ["amazon", "walmart", "target", "bestbuy"],
        minSpendInr: 50,
        discountType: "percent",
        discountValue: 4,
        maxDiscountInr: 100,
        description: "Split into 4 interest-free bi-weekly payments",
      },
    ],
  },
];

/**
 * Calculates Buy Now Pay Later (BNPL) 4-part installment breakdown.
 */
export function calculateBnplInstallments(priceUsd: number): BnplInstallmentResult {
  const safePrice = Math.max(0, priceUsd);
  const installmentAmount = Math.round((safePrice / 4) * 100) / 100;

  return {
    provider: "Affirm",
    totalPrice: safePrice,
    installmentCount: 4,
    installmentAmount,
    frequency: "bi-weekly",
    formattedPrompt: `or 4 interest-free payments of $${installmentAmount.toFixed(2)} with Affirm`,
    applyUrl: "https://www.affirm.com",
  };
}

/**
 * Calculates US credit card savings for a given card, store, and USD price.
 */
export function calculateUsCardSavings(
  cardId: string,
  storeName: string,
  priceUsd: number,
  category = "general"
): BankCardSavingsResult {
  const card = US_CREDIT_CARDS.find((c) => c.id.toLowerCase() === cardId.toLowerCase());
  if (!card || priceUsd <= 0) {
    return {
      cardId: cardId || "none",
      bankName: "None",
      cardName: "No Card Selected",
      instantDiscount: 0,
      cashbackAmount: 0,
      totalCardSavings: 0,
      effectiveNetPrice: priceUsd,
      appliedRuleDescription: "No active US card reward",
      isBestOffer: false,
      affiliateApplyUrl: "",
    };
  }

  const normStore = (storeName || "").toLowerCase();
  let instantDiscount = 0;
  let appliedRuleDesc = "";

  for (const rule of card.rules) {
    const storeMatches = rule.storeIdPattern.some((p) => normStore.includes(p));
    if (!storeMatches) continue;
    if (priceUsd < rule.minSpendInr) continue;

    const calcDiscount = Math.round(priceUsd * (rule.discountValue / 100) * 100) / 100;
    const capped = Math.min(calcDiscount, rule.maxDiscountInr);
    if (capped > instantDiscount) {
      instantDiscount = capped;
      appliedRuleDesc = rule.description;
    }
  }

  const remaining = Math.max(0, priceUsd - instantDiscount);
  const cashbackAmount = Math.round(remaining * card.defaultCashbackPct * 100) / 100;

  if (instantDiscount === 0) {
    appliedRuleDesc = `${Math.round(card.defaultCashbackPct * 100)}% Cash Back via ${card.shortName}`;
  }

  const totalCardSavings = Math.round((instantDiscount + cashbackAmount) * 100) / 100;
  const effectiveNetPrice = Math.max(1, Math.round((priceUsd - totalCardSavings) * 100) / 100);

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
 * Automatically evaluates all US cards and returns the single best card for an item.
 */
export function getBestUsCardForProduct(
  storeName: string,
  priceUsd: number,
  category = "general"
): BankCardSavingsResult {
  let bestResult: BankCardSavingsResult = {
    cardId: "chase",
    bankName: "Chase Bank",
    cardName: "Chase Freedom Unlimited",
    instantDiscount: 0,
    cashbackAmount: Math.round(priceUsd * 0.05 * 100) / 100,
    totalCardSavings: Math.round(priceUsd * 0.05 * 100) / 100,
    effectiveNetPrice: Math.max(1, Math.round((priceUsd - priceUsd * 0.05) * 100) / 100),
    appliedRuleDescription: "5% Cash Back Rewards",
    isBestOffer: true,
    affiliateApplyUrl: US_CREDIT_CARDS[0]?.affiliateApplyUrl || "",
  };

  for (const card of US_CREDIT_CARDS) {
    const res = calculateUsCardSavings(card.id, storeName, priceUsd, category);
    if (res.totalCardSavings > bestResult.totalCardSavings) {
      bestResult = { ...res, isBestOffer: true };
    }
  }

  return bestResult;
}

/**
 * Returns relevant international stores for a category.
 */
export function getInternationalStores(category = "general"): InternationalStore[] {
  const norm = (category || "").toLowerCase();
  if (norm.includes("tech") || norm.includes("electronic") || norm.includes("mobile") || norm.includes("laptop")) {
    return INTERNATIONAL_STORES.filter((s) => s.category === "electronics" || s.category === "general");
  }
  return INTERNATIONAL_STORES;
}
