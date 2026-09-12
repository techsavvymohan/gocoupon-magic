/**
 * @file server/services/stack-calculator.ts
 * @description The "True Landed Cost" Stacking Calculator Engine.
 *
 * Implements GoCoupon's 4-tier instant savings formula:
 * True Landed Cost = Sticker - AutoCoupon - PaymentOffer - Cashback + Shipping + CustomsDuty
 */

import {
  findBestBankOffer,
  calculateBankDiscount,
  type BankOfferEvaluation,
  type RegionCode,
} from "./bank-offers.js";
import { CANONICAL_COUPONS } from "../../src/data/canonicalCatalogData.js";

export interface StackRequest {
  productId?: string;
  productTitle?: string;
  storeName: string;
  storeSlug?: string;
  stickerPrice: number;
  currency?: string;
  region?: RegionCode;
  preferredBankCard?: string;
  userCashbackRate?: number; // e.g. 0.05 for 5%
  availableCoupons?: any[];  // Live Cuelinks or store-specific coupons
  isCrossBorderImport?: boolean;
  internationalShippingFee?: number;
  customsDutyPercent?: number;
}

export interface StackSavingsBreakdown {
  currency: string;
  stickerPrice: number;

  // Tier 1: Auto-Applied Coupon Code
  coupon: {
    applied: boolean;
    code: string | null;
    title: string | null;
    discountAmount: number;
    discountLabel: string | null;
  };

  // Tier 2: Optimal Bank Card / Payment Instrument
  bankOffer: {
    applied: boolean;
    bankName: string | null;
    cardTypes: string[];
    discountAmount: number;
    isInstantDiscount: boolean;
    description: string | null;
    instruction: string | null;
  };

  // Tier 3: Affiliate Cashback Kickback
  cashback: {
    applied: boolean;
    ratePercent: number;
    amount: number;
  };

  // Tier 4: Cross-Border / Shipping Logistics
  logistics: {
    isCrossBorder: boolean;
    shippingFee: number;
    estimatedCustomsDuty: number;
  };

  // Summary Metrics
  totalInstantSavings: number;
  savingsPercentage: number;
  trueNetLandedCost: number;
  shopperVerdict: string;
}

/**
 * Calculates the complete stacked savings breakdown for any product or cart checkout.
 */
export function calculateStackedSavings(req: StackRequest): StackSavingsBreakdown {
  const currency = req.currency || (req.region === "US" ? "USD" : req.region === "UK" ? "GBP" : req.region === "AE" ? "AED" : "INR");
  const region = req.region || (currency === "USD" ? "US" : currency === "GBP" ? "UK" : currency === "AED" ? "AE" : "IN");
  const sticker = Math.max(0, req.stickerPrice);
  const normalizedStore = req.storeName.toLowerCase().replace(/[^a-z0-9]/g, "");

  // ── Tier 1: Auto-Coupon Matching ──────────────────────────────────────────
  let matchedCoupon: any = null;
  const pool = [...CANONICAL_COUPONS, ...(req.availableCoupons || [])];
  const storeCoupons = pool.filter((c) => {
    const cStore = (c.storeName || c.storeId || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return normalizedStore.includes(cStore) || cStore.includes(normalizedStore);
  });

  if (storeCoupons.length > 0) {
    // Pick the coupon that gives the highest discount for this sticker price
    storeCoupons.sort((a, b) => {
      const aVal = a.discountPercent ? (sticker * a.discountPercent) / 100 : a.discountAmount || a.maxDiscount || 0;
      const bVal = b.discountPercent ? (sticker * b.discountPercent) / 100 : b.discountAmount || b.maxDiscount || 0;
      return bVal - aVal;
    });
    matchedCoupon = storeCoupons[0];
  }

  let couponDiscount = 0;
  if (matchedCoupon) {
    if (matchedCoupon.discountPercent) {
      couponDiscount = Math.round((sticker * matchedCoupon.discountPercent) / 100);
      if (matchedCoupon.maxDiscount && couponDiscount > matchedCoupon.maxDiscount) {
        couponDiscount = matchedCoupon.maxDiscount;
      }
    } else if (matchedCoupon.discountAmount) {
      couponDiscount = Math.min(sticker, matchedCoupon.discountAmount);
    } else if (matchedCoupon.maxDiscount) {
      couponDiscount = Math.min(matchedCoupon.maxDiscount, Math.round(sticker * 0.2));
    }
  }

  const priceAfterCoupon = Math.max(0, sticker - couponDiscount);

  // ── Tier 2: Bank Card Maximizer ───────────────────────────────────────────
  const bestBankEval: BankOfferEvaluation | null = findBestBankOffer({
    storeNameOrSlug: req.storeSlug || req.storeName,
    cartAmount: priceAfterCoupon,
    region,
    preferredBank: req.preferredBankCard,
  });

  const bankDiscount = bestBankEval ? bestBankEval.discountAmount : 0;
  const priceAfterBank = Math.max(0, priceAfterCoupon - bankDiscount);

  // ── Tier 3: Instant Cashback Kickback (Cuelinks Commission Tiers) ─────────
  const CUELINKS_COMMISSION_RATES: Record<string, number> = {
    flipkart: 0.06,          // 6.0% CPS
    myntra: 0.075,           // 7.5% CPS
    ajio: 0.09,              // 9.0% CPS
    boat: 0.055,             // 5.5% CPS
    tatacliq: 0.0375,        // 3.75% CPS
    croma: 0.04,             // 4.0% CPS
    nykaa: 0.042,            // 4.2% CPS
    bewakoof: 0.1155,        // 11.55% CPS
    levi: 0.1275,            // 12.75% CPS
    marksandspencer: 0.1364, // 13.64% CPS
    lenovo: 0.03,            // 3.0% CPS
    netmeds: 0.0473,         // 4.73% CPS
    pepperfry: 0.06,         // 6.0% CPS
    firstcry: 0.04,          // 4.0% CPS
    dell: 0.0225,            // 2.25% CPS
    godaddy: 0.06,           // 6.0% CPS
    udemy: 0.075,            // 7.5% CPS
    coursera: 0.0713,        // 7.13% CPS
    reliance: 0.05,          // 5.0% CPS
    amazon: 0.05,            // 5.0%
  };

  let defaultRate = 0.05;
  for (const [storeKey, rate] of Object.entries(CUELINKS_COMMISSION_RATES)) {
    if (normalizedStore.includes(storeKey)) {
      defaultRate = rate;
      break;
    }
  }

  let cashbackRate = req.userCashbackRate !== undefined ? req.userCashbackRate : defaultRate;
  let cashbackAmount = Math.round(priceAfterBank * cashbackRate);

  // Flipkart official tier & cap policy per Cuelinks contract
  if (normalizedStore.includes("flipkart") && req.userCashbackRate === undefined) {
    const title = (req.productTitle || "").toLowerCase();
    if (/\b(phone|iphone|samsung galaxy|smartphone|mobile|pixel|oneplus|realme|redmi|poco|vivo|oppo|motorola|nothing phone)\b/i.test(title)) {
      cashbackRate = 0.0075; // 0.75%
      cashbackAmount = Math.min(75, Math.round(priceAfterBank * cashbackRate));
    } else if (/\b(laptop|desktop|camera|tablet|headphone|earbud|audio|tv|television|refrigerator|washing machine|ac|air conditioner|appliance|gaming|power bank)\b/i.test(title)) {
      cashbackRate = 0.0225; // 2.25%
      cashbackAmount = Math.min(150, Math.round(priceAfterBank * cashbackRate));
    } else if (/\b(shoe|shoes|sneaker|footwear|shirt|t-shirt|dress|clothing|fashion|jeans|jacket|saree|kurti)\b/i.test(title)) {
      cashbackRate = 0.06; // 6.0% (Kids 7.5%)
      cashbackAmount = Math.round(priceAfterBank * cashbackRate);
    } else if (/\b(book|books|makeup|fragrance|baby|toy|grooming|fitness)\b/i.test(title)) {
      cashbackRate = 0.0375; // 3.75%
      cashbackAmount = Math.round(priceAfterBank * cashbackRate);
    } else {
      cashbackRate = 0.0225;
      cashbackAmount = Math.min(150, Math.round(priceAfterBank * cashbackRate));
    }
  }

  // Myntra official tier policy per Cuelinks contract
  if (normalizedStore.includes("myntra") && req.userCashbackRate === undefined) {
    const title = (req.productTitle || "").toLowerCase();
    if (/\b(kitchen|home|furnishing|decor|bedsheet|curtain)\b/i.test(title)) {
      cashbackRate = 0.055; // 3.75% - 7.5%
      cashbackAmount = Math.round(priceAfterBank * cashbackRate);
    } else if (/\b(beauty|makeup|perfume|fragrance|skincare|serum|shampoo|grooming)\b/i.test(title)) {
      cashbackRate = 0.05; // 3.0% - 6.75%
      cashbackAmount = Math.round(priceAfterBank * cashbackRate);
    } else if (/\b(shoe|shoes|sneaker|sneakers|footwear|sandals|heels)\b/i.test(title)) {
      cashbackRate = 0.042; // 2.25% - 6.0%
      cashbackAmount = Math.round(priceAfterBank * cashbackRate);
    } else if (/\b(kid|kids|boy|boys|girl|girls|baby|toys)\b/i.test(title)) {
      cashbackRate = 0.045; // 3.0% - 6.0%
      cashbackAmount = Math.round(priceAfterBank * cashbackRate);
    } else {
      cashbackRate = 0.0225; // standard apparel 2.25%
      cashbackAmount = Math.round(priceAfterBank * cashbackRate);
    }
  }

  // Ajio official tier policy per Cuelinks contract
  if (normalizedStore.includes("ajio") && req.userCashbackRate === undefined) {
    const title = (req.productTitle || "").toLowerCase();
    if (/\b(gold|silver|coin|coins|bar|bars|tech)\b/i.test(title)) {
      cashbackRate = 0.0; // 0.0% on gold, silver, coins, tech
      cashbackAmount = 0;
    } else {
      // 9.00% New User / 4.50% Existing User
      cashbackRate = 0.0675;
      cashbackAmount = Math.round(priceAfterBank * cashbackRate);
    }
  }

  const priceAfterCashback = Math.max(0, priceAfterBank - cashbackAmount);

  // ── Tier 4: Cross-Border Logistics & Duties ───────────────────────────────
  const isCrossBorder = Boolean(req.isCrossBorderImport);
  const shippingFee = req.internationalShippingFee || 0;
  const dutyRate = req.customsDutyPercent || (isCrossBorder ? 0.18 : 0); // 18% standard import tariff if cross-border
  const customsDuty = isCrossBorder ? Math.round(priceAfterBank * dutyRate) : 0;

  const trueNetLandedCost = priceAfterCashback + shippingFee + customsDuty;
  const totalSavings = (sticker - trueNetLandedCost) + (isCrossBorder ? shippingFee + customsDuty : 0);
  const totalInstantSavings = Math.max(0, sticker - (priceAfterBank - cashbackAmount));
  const savingsPct = sticker > 0 ? Math.round((totalInstantSavings / sticker) * 100) : 0;

  let shopperVerdict = "";
  if (savingsPct >= 25) {
    shopperVerdict = `Mega Stack Unlocked: You save ${currency === "INR" ? "₹" : currency === "USD" ? "$" : currency}${totalInstantSavings} (${savingsPct}% OFF). Buy now before bank quota resets!`;
  } else if (savingsPct >= 10) {
    shopperVerdict = `Solid Stack: ${currency === "INR" ? "₹" : currency === "USD" ? "$" : currency}${totalInstantSavings} instant deduction ready at checkout.`;
  } else {
    shopperVerdict = `Verified baseline price with direct cash rewards.`;
  }

  return {
    currency,
    stickerPrice: sticker,
    coupon: {
      applied: couponDiscount > 0,
      code: matchedCoupon?.code || null,
      title: matchedCoupon?.title || null,
      discountAmount: couponDiscount,
      discountLabel: matchedCoupon?.discountLabel || (couponDiscount > 0 ? `${couponDiscount} OFF` : null),
    },
    bankOffer: {
      applied: bankDiscount > 0,
      bankName: bestBankEval?.offer.bankName || null,
      cardTypes: bestBankEval?.offer.cardTypes || [],
      discountAmount: bankDiscount,
      isInstantDiscount: bestBankEval?.offer.isInstantDiscount ?? true,
      description: bestBankEval?.offer.description || null,
      instruction: bestBankEval
        ? `Select ${bestBankEval.offer.bankName} on payment screen to save ${currency === "INR" ? "₹" : "$"}${bankDiscount}.`
        : null,
    },
    cashback: {
      applied: cashbackAmount > 0,
      ratePercent: Math.round(cashbackRate * 100),
      amount: cashbackAmount,
    },
    logistics: {
      isCrossBorder,
      shippingFee,
      estimatedCustomsDuty: customsDuty,
    },
    totalInstantSavings,
    savingsPercentage: savingsPct,
    trueNetLandedCost,
    shopperVerdict,
  };
}
