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
  let matchedCoupon: (typeof CANONICAL_COUPONS)[number] | null = null;
  const storeCoupons = CANONICAL_COUPONS.filter((c) => {
    const cStore = (c.storeName || c.storeId).toLowerCase().replace(/[^a-z0-9]/g, "");
    return normalizedStore.includes(cStore) || cStore.includes(normalizedStore);
  });

  if (storeCoupons.length > 0) {
    // Pick the coupon that gives the highest discount for this sticker price
    storeCoupons.sort((a, b) => {
      const aVal = a.discountPercent ? (sticker * a.discountPercent) / 100 : a.maxDiscount || 0;
      const bVal = b.discountPercent ? (sticker * b.discountPercent) / 100 : b.maxDiscount || 0;
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

  // ── Tier 3: Instant Cashback Kickback ──────────────────────────────────────
  const cashbackRate = req.userCashbackRate !== undefined ? req.userCashbackRate : 0.05; // 5% standard
  const cashbackAmount = Math.round(priceAfterBank * cashbackRate);
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
