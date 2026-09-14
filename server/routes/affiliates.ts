/**
 * @file server/routes/affiliates.ts
 * @description Express Router for Live Affiliate Product Search.
 *
 * Endpoint: GET /api/affiliates/products
 */

import { Router, type Request, type Response } from "express";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";
import { globalCache } from "../../src/lib/services/cache-service.js";

export const affiliatesRouter = Router();

interface AffiliateProductResponse {
  provider: string;
  providerProductId: string;
  title: string;
  description: string;
  imageUrl: string;
  productUrl: string;
  affiliateUrl: string;
  price: number;
  currency: string;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  availability: string;
  category: string;
  country: string;
  badge?: string;
  couponCode?: string;
  tags?: string[];
  savingLabel?: string;
}

const AMAZON_IN_PARTNER_TAG = process.env.VITE_AMAZON_IN_PARTNER_TAG || "gocoupon0e-21";

const AMAZON_IN_PRODUCTS: AffiliateProductResponse[] = [
  {
    provider: "amazon",
    providerProductId: "B08L5VJYV3",
    title: "Premium Wireless Noise-Cancelling Headphones & Audio",
    description: "Top-rated noise-cancelling wireless headphones with premium sound quality and long battery life.",
    imageUrl: "/amazon-deals-tech.webp",
    productUrl: "https://www.amazon.in/dp/B08L5VJYV3",
    affiliateUrl: `https://www.amazon.in/dp/B08L5VJYV3?tag=${AMAZON_IN_PARTNER_TAG}`,
    price: 5499,
    currency: "INR",
    originalPrice: 9999,
    discountPercentage: 45,
    rating: 4.8,
    reviewCount: 12400,
    availability: "In Stock",
    category: "Electronics & Tech",
    country: "IN",
    badge: "Prime Deal • 45% OFF",
    couponCode: "AMZTECH10",
    tags: ["Auto-Apply Coupon", "Bank Offer Stackable", "Free One-Day Delivery"],
    savingLabel: "Save ₹4,500",
  },
  {
    provider: "amazon",
    providerProductId: "B09NODE976",
    title: "Smart Espresso Machine & Compact Home Kitchen Setup",
    description: "Compact smart espresso machine perfect for home kitchens. Easy to use and easy to clean.",
    imageUrl: "/amazon-deals-home.webp",
    productUrl: "https://www.amazon.in/b?node=976442031",
    affiliateUrl: `https://www.amazon.in/b?node=976442031&tag=${AMAZON_IN_PARTNER_TAG}`,
    price: 5299,
    currency: "INR",
    originalPrice: 8499,
    discountPercentage: 38,
    rating: 4.7,
    reviewCount: 8900,
    availability: "In Stock",
    category: "Home & Appliances",
    country: "IN",
    badge: "Trending • 38% OFF",
    couponCode: "AMZHOME15",
    tags: ["Extra 10% ICICI Card", "Zero Cost EMI", "Manufacturer Warranty"],
    savingLabel: "Save ₹3,200",
  },
  {
    provider: "amazon",
    providerProductId: "B09FASH648",
    title: "Minimalist Smartwatches & Luxury Accessories Bundle",
    description: "Minimalist design smartwatch with luxury accessories. Perfect for fashion-conscious shoppers.",
    imageUrl: "/amazon-deals-fashion.webp",
    productUrl: "https://www.amazon.in/b?node=6648217031",
    affiliateUrl: `https://www.amazon.in/b?node=6648217031&tag=${AMAZON_IN_PARTNER_TAG}`,
    price: 2399,
    currency: "INR",
    originalPrice: 4999,
    discountPercentage: 52,
    rating: 4.5,
    reviewCount: 6300,
    availability: "In Stock",
    category: "Fashion & Lifestyle",
    country: "IN",
    badge: "Lightning Deal • 52% OFF",
    couponCode: "AMZFASH20",
    tags: ["Free Returns", "Cash On Delivery", "Verified Seller"],
    savingLabel: "Save ₹2,600",
  },
  {
    provider: "amazon",
    providerProductId: "B08FIT2024",
    title: "Organic Superfood Powders & Daily Vitamin Supplements",
    description: "Certified organic superfood blend for energy, immunity, and daily wellness.",
    imageUrl: "/amazon-deals-health.webp",
    productUrl: "https://www.amazon.in/b?node=1350384031",
    affiliateUrl: `https://www.amazon.in/b?node=1350384031&tag=${AMAZON_IN_PARTNER_TAG}`,
    price: 1199,
    currency: "INR",
    originalPrice: 1999,
    discountPercentage: 40,
    rating: 4.6,
    reviewCount: 4200,
    availability: "In Stock",
    category: "Beauty & Health",
    country: "IN",
    badge: "Health Pick • 40% OFF",
    couponCode: "AMZHEALTH10",
    tags: ["Subscribe & Save 10%", "FSSAI Certified", "Same Day Dispatch"],
    savingLabel: "Save ₹800",
  },
];

/**
 * GET /api/affiliates
 * Root handler — returns default Amazon IN product highlights.
 */
affiliatesRouter.get("/", async (_req: Request, res: Response) => {
  const AMAZON_IN_PARTNER_TAG_VAR = process.env.VITE_AMAZON_IN_PARTNER_TAG || "gocoupon0e-21";
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  res.json({
    provider: "amazon",
    country: "IN",
    note: "Use /api/affiliates/products?provider=amazon for filtered results",
    products: AMAZON_IN_PRODUCTS.slice(0, 4),
    total: AMAZON_IN_PRODUCTS.length,
    cached: false,
  });
});

affiliatesRouter.get("/products", async (req: Request, res: Response) => {
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const rateCheck = apiRateLimiter.check(clientIp, 60, 60 * 1000);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    res.status(429).json({ error: "Rate limit exceeded." });
    return;
  }

  const provider = (req.query.provider as string)?.toLowerCase();
  const country = (req.query.country as string) === "US" ? "US" : "IN";
  const keyword = ((req.query.keyword as string) ?? "").toLowerCase().trim();
  const category = ((req.query.category as string) ?? "").toLowerCase().trim();
  const minPrice = parseFloat(req.query.minPrice as string);
  const maxPrice = parseFloat(req.query.maxPrice as string);
  const rawLimit = parseInt(req.query.limit as string, 10);
  const limit = isNaN(rawLimit) ? 10 : Math.min(rawLimit, 50);

  if (!provider) {
    res.status(400).json({ error: "provider query parameter is required" });
    return;
  }

  const ALLOWED_PROVIDERS = ["amazon", "impact", "awin", "cj", "sharesale", "mock"];
  if (!ALLOWED_PROVIDERS.includes(provider)) {
    res.status(400).json({ error: `Unknown provider: ${provider}` });
    return;
  }

  const cacheKey = `affiliate_products:${provider}:${country}:${keyword}:${category}:${limit}`;
  const cached = await globalCache.get<any>(cacheKey);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    res.json({ ...cached, cached: true });
    return;
  }

  let products = provider === "amazon" && country === "IN" ? [...AMAZON_IN_PRODUCTS] : [];

  if (keyword) {
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(keyword) ||
        p.category.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword)
    );
  }
  if (category) {
    products = products.filter((p) => p.category.toLowerCase().includes(category));
  }
  if (!isNaN(minPrice)) {
    products = products.filter((p) => p.price >= minPrice);
  }
  if (!isNaN(maxPrice)) {
    products = products.filter((p) => p.price <= maxPrice);
  }

  const sliced = products.slice(0, limit);

  const responseBody = {
    provider,
    country,
    keyword: keyword || null,
    category: category || null,
    limit,
    products: sliced,
    total: products.length,
    phase: 1,
    cached: false,
  };

  await globalCache.set(cacheKey, responseBody, 5 * 60 * 1000);

  res.setHeader("X-Cache", "MISS");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  res.json(responseBody);
});
