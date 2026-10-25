/**
 * @file server/routes/coupons.ts
 * @description Express Router for Auto-Apply & Directory Coupons.
 *
 * Endpoint: GET /api/coupons?store=... OR ?domain=...
 */

import { Router, type Request, type Response } from "express";
import { CANONICAL_COUPONS } from "../../src/data/canonicalCatalogData.js";
import { sortCoupons, type CouponSortField, type SortOrder } from "../services/sorter.js";
import { normalizeCategoryId, CANONICAL_CATEGORIES } from "../services/taxonomy.js";
import {
  fetchCuelinksCoupons,
  normalizeCuelinksToStoreCoupon,
  getLiveDealsPool,
} from "../services/providers/cuelinks-client.js";
import { otpService } from "../services/otp-service.js";
import { recordNewSubmission } from "./admin.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";

export const couponsRouter = Router();

couponsRouter.get("/", async (req: Request, res: Response) => {
  const store =
    (req.query.store as string) || (req.query.site as string) || (req.query.domain as string) || (req.query.merchant as string);
  const category = (req.query.category as string)?.toLowerCase();
  const sortBy = (req.query.sortBy as CouponSortField) || "successRate";
  const order = (req.query.order as SortOrder) || "desc";

  // 1. Fetch relevant live Cuelinks coupons
  let cuelinksCoupons: any[] = [];
  try {
    const cueOffers = await fetchCuelinksCoupons({
      storeNameOrDomain: store,
      category,
      limit: 30,
    });
    cuelinksCoupons = cueOffers.map(normalizeCuelinksToStoreCoupon);
  } catch (err) {
    console.warn("[CouponsRoute] Cuelinks fetch warning:", err);
  }

  // 2. Merge canonical and Cuelinks coupons, deduplicating by code + storeId
  const seenCodes = new Set<string>();
  const combined = [...CANONICAL_COUPONS, ...cuelinksCoupons];
  let filtered = combined.filter((c) => {
    const key = `${c.storeId}_${c.code}`.toLowerCase();
    if (seenCodes.has(key)) return false;
    seenCodes.add(key);
    return true;
  });

  if (store) {
    const s = store
      .toLowerCase()
      .replace("https://", "")
      .replace("http://", "")
      .replace("www.", "")
      .split(".")[0];

    filtered = filtered.filter(
      (c) => c.storeId.toLowerCase().includes(s) || c.storeName.toLowerCase().includes(s)
    );
  }

  if (category && category !== "all") {
    const canonicalCatId = normalizeCategoryId(category);
    const catDef = CANONICAL_CATEGORIES[canonicalCatId];
    if (catDef) {
      filtered = filtered.filter((c) => {
        const text = `${c.title} ${c.description} ${c.storeName}`.toLowerCase();
        return catDef.keywords.some((kw) => text.includes(kw));
      });
    }
  }

  filtered = sortCoupons(filtered, sortBy, order);

  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
  res.json({
    store: store || "all",
    category: category || "all",
    sortBy,
    order,
    count: filtered.length,
    cuelinksCount: cuelinksCoupons.length,
    coupons: filtered,
  });
});

/**
 * POST /api/coupons/send-otp
 * Dispatches a 6-digit OTP from support@gocoupon.io to verify submitter email.
 */
couponsRouter.post("/send-otp", async (req: Request, res: Response) => {
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const rateCheck = apiRateLimiter.check(`send-otp:${clientIp}`, 5, 60 * 1000);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    res.status(429).json({
      success: false,
      message: `Too many verification requests. Please wait ${rateCheck.retryAfterSeconds} seconds before requesting again.`,
      retryAfterSeconds: rateCheck.retryAfterSeconds,
    });
    return;
  }

  const { email, storeName } = req.body || {};
  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({
      success: false,
      message: "A valid email address is required to receive the verification code.",
    });
    return;
  }

  const result = await otpService.sendOtp(email, storeName);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  res.json(result);
});

/**
 * POST /api/coupons/verify-otp
 * Validates the 6-digit code and returns a verification token.
 */
couponsRouter.post("/verify-otp", async (req: Request, res: Response) => {
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const rateCheck = apiRateLimiter.check(`verify-otp:${clientIp}`, 10, 60 * 1000);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    res.status(429).json({
      success: false,
      message: `Too many verification attempts. Please wait ${rateCheck.retryAfterSeconds} seconds.`,
      retryAfterSeconds: rateCheck.retryAfterSeconds,
    });
    return;
  }

  const { email, otp } = req.body || {};
  if (!email || !otp) {
    res.status(400).json({
      success: false,
      message: "Email and 6-digit OTP code are required.",
    });
    return;
  }

  const result = otpService.verifyOtp(email, otp);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  res.json(result);
});

/**
 * POST /api/coupons/submit
 * Community verified coupon submission endpoint.
 * Strictly requires submitter email verified with OTP from support@gocoupon.io.
 */
couponsRouter.post("/submit", async (req: Request, res: Response) => {
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const rateCheck = apiRateLimiter.check(`coupon-submit:${clientIp}`, 10, 10 * 60 * 1000);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    res.status(429).json({
      success: false,
      error: `Too many submissions. Please wait ${rateCheck.retryAfterSeconds} seconds.`,
      retryAfterSeconds: rateCheck.retryAfterSeconds,
    });
    return;
  }

  const { storeName, code, discount, url, terms, category, email, verificationToken } = req.body || {};

  if (!storeName || !code) {
    res.status(400).json({
      success: false,
      error: "Store name and coupon code are required.",
    });
    return;
  }

  const normStore = String(storeName).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const normCode = String(code).trim().toUpperCase();

  // 1. Check live deals pool for duplicate
  const livePool = getLiveDealsPool();
  const existingLive = livePool.find(
    (d) =>
      d.code &&
      d.code.toUpperCase().trim() === normCode &&
      d.storeName.toLowerCase().replace(/[^a-z0-9]/g, "") === normStore
  );
  if (existingLive) {
    res.status(409).json({
      success: false,
      error: `Coupon "${normCode}" for ${storeName} is already live and verified on GoCoupon!`,
    });
    return;
  }

  // 2. Check pending community submissions for duplicate
  const { getUserCouponSubmissions } = await import("../../src/lib/server-data/deals-db.js");
  const pendingSubs = getUserCouponSubmissions();
  const existingPending = pendingSubs.find(
    (s) =>
      s.status === "pending" &&
      s.code &&
      s.code.toUpperCase().trim() === normCode &&
      s.storeName.toLowerCase().replace(/[^a-z0-9]/g, "") === normStore
  );
  if (existingPending) {
    res.status(409).json({
      success: false,
      error: `Coupon "${normCode}" for ${storeName} has already been submitted and is currently in the verification queue.`,
    });
    return;
  }


  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    res.status(400).json({
      success: false,
      error: "A valid submitter email address is required.",
    });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();

  // Validate OTP verification status
  const isVerified = otpService.isEmailVerified(cleanEmail, verificationToken);
  if (!isVerified) {
    res.status(403).json({
      success: false,
      error: "Email verification required. Please verify your email with the 6-digit code sent from support@gocoupon.io before submitting.",
    });
    return;
  }

  try {
    const { recordUserCouponSubmission } = await import("../../src/lib/server-data/deals-db.js");
    const submission = recordUserCouponSubmission({
      storeName: String(storeName).trim(),
      code: String(code).trim().toUpperCase(),
      discount: discount ? String(discount).trim() : undefined,
      url: url ? String(url).trim() : undefined,
      terms: terms ? String(terms).trim() : undefined,
      category: category ? String(category).trim() : undefined,
      email: cleanEmail,
    });

    // Also persist in the Admin Submissions review queue
    recordNewSubmission({
      storeName: String(storeName).trim(),
      code: String(code).trim().toUpperCase(),
      discount: discount ? String(discount).trim() : undefined,
      url: url ? String(url).trim() : undefined,
      terms: terms ? String(terms).trim() : undefined,
      category: category ? String(category).trim() : undefined,
      email: cleanEmail,
    });

    otpService.consumeVerification(cleanEmail);

    res.status(201).json({
      success: true,
      message: `Thank you! Your coupon has been verified and submitted for ${cleanEmail}.`,
      submission,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

