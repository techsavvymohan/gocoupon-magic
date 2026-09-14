/**
 * @file server/routes/admin.ts
 * @description Comprehensive GoCoupon Administration API Router.
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import crypto from "node:crypto";
import fs from "fs";
import path from "path";
import {
  syncLiveCuelinksDeals,
  getLiveDealsPool,
  addDealToPool,
  isDealValid,
} from "../services/providers/cuelinks-client.js";
import { STORES_DB } from "../../src/lib/server-data/stores-db.js";
import { globalCache } from "../../src/lib/services/cache-service.js";

export const adminRouter = Router();

// In-memory persistent stores with file-backed storage
const DATA_DIR = path.resolve(process.cwd(), "server", "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// Cryptographic Admin Session Token Security
// ---------------------------------------------------------------------------
const ADMIN_TOKEN_SECRET = process.env.ADMIN_PASSWORD || "GC_Admin_Secured#2026!";

export interface AdminTokenPayload {
  email: string;
  role: string;
  exp: number;
}

export function generateAdminToken(email: string, role = "admin"): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days validity
  const payload: AdminTokenPayload = { email, role, exp };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", ADMIN_TOKEN_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  if (!token || !token.includes(".")) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encodedPayload, signature] = parts;

  try {
    const expectedSignature = crypto
      .createHmac("sha256", ADMIN_TOKEN_SECRET)
      .update(encodedPayload)
      .digest("base64url");

    if (signature.length !== expectedSignature.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: AdminTokenPayload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf-8")
    );
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!token) {
    res.status(401).json({ success: false, error: "Unauthorized: Missing admin bearer token." });
    return;
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: "Unauthorized: Invalid or expired admin session token." });
    return;
  }

  (req as any).adminUser = payload;
  next();
}

const SETTINGS_FILE = path.join(DATA_DIR, "admin-settings.json");
const EVENTS_FILE = path.join(DATA_DIR, "admin-events.json");
const HERO_FILE = path.join(DATA_DIR, "admin-hero.json");
const SECTIONS_FILE = path.join(DATA_DIR, "admin-sections.json");
const USERS_FILE = path.join(DATA_DIR, "admin-users.json");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "admin-submissions.json");

function loadJson<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch (err) {
    console.warn(`[AdminAPI] Failed to read ${filePath}:`, err);
  }
  return defaultValue;
}

function saveJson<T>(filePath: string, data: T) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`[AdminAPI] Failed to save ${filePath}:`, err);
  }
}

// ---------------------------------------------------------------------------
// 1. Notifications State
// ---------------------------------------------------------------------------
interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  timestamp: string;
  read: boolean;
}

let adminNotifications: AdminNotification[] = [
  {
    id: "notif-1",
    title: "Cuelinks Sync Active",
    message: "Live validity-based deal sync is monitoring 970+ merchant offers.",
    type: "success",
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: "notif-2",
    title: "Store Directory Ready",
    message: "240+ verified Indian and Global stores are indexed.",
    type: "info",
    timestamp: new Date().toISOString(),
    read: false,
  },
];

// ---------------------------------------------------------------------------
// 2. Initial Data Sets
// ---------------------------------------------------------------------------
const defaultSettings = {
  general: {
    siteName: "GoCoupon",
    tagline: "Auto Coupon Applier & Verified Discounts",
    supportEmail: "support@gocoupon.io",
    copyrightText: "© 2026 GoCoupon. All rights reserved.",
  },
  announcement: {
    badge: "OFFERS",
    headline: "970+ Verified Live Deals across 240+ Merchant Stores & Extra 10% Bank Offers",
    ctaLabel: "Explore Now",
    ctaLink: "/offers",
    active: true,
  },
  social: {
    facebook: "https://facebook.com/gocouponapp",
    instagram: "https://instagram.com/gocoupon.io",
    x: "https://twitter.com/gocoupon_in",
    telegram: "",
    youtube: "",
    defaultShareText: "Verified coupons, live price tracking, and instant bank card savings on GoCoupon.",
  },
  seo: {
    titleTemplate: "%s | GoCoupon",
    metaDescription: "Verified coupons, live price comparison, 30-day price history graphs, and auto-applied promo codes.",
    ogTitle: "GoCoupon - Auto Coupon Applier & Verified Discounts",
    ogDescription: "Discover 970+ verified coupons, live price comparison, and use our free Chrome extension.",
    robots: "index,follow",
  },
};

const defaultHero = {
  eyebrow: "Verified Daily Deals & Live Price Tracker",
  titleLineOne: "Find Your Lowest Price",
  titleAccent: "In 1 Second",
  description: "GoCoupon cross-checks 500+ stores, auto-applies working coupons, exposes fake sales, and stacks bank card discounts. 100% free.",
  searchPlaceholder: "Paste any Amazon, Flipkart or store product link...",
  searchButtonLabel: "Compare Prices",
  memberCountText: "Join 150k+ smart shoppers saving daily",
  slides: [],
};

const defaultEvents = [
  {
    id: "evt-1",
    name: "Big Billion Days 2026",
    slug: "big-billion-days",
    keyword: "flipkart big billion days coupons",
    seoTitle: "Flipkart Big Billion Days 2026 Coupons & Bank Offers – GoCoupon",
    seoDescription: "Exclusive 10% instant discount on Axis & ICICI cards + up to 80% off on smartphones & electronics.",
    shortDescription: "India's biggest annual festive shopping festival.",
    longDescription: "Uncover verified coupon codes and stackable bank discounts during Big Billion Days.",
    status: "enabled",
    startDate: "2026-10-01",
    endDate: "2026-10-10",
  },
  {
    id: "evt-2",
    name: "Great Indian Festival 2026",
    slug: "great-indian-festival",
    keyword: "amazon great indian festival coupons",
    seoTitle: "Amazon Great Indian Festival 2026 Promo Codes – GoCoupon",
    seoDescription: "Verified Amazon promo codes, 10% instant discount with SBI cards, and coupon voucher clipping.",
    shortDescription: "Amazon India's blockbuster annual mega sale.",
    longDescription: "Shop smarter with real-time price history graphs and verified card rebates on Amazon.",
    status: "enabled",
    startDate: "2026-10-02",
    endDate: "2026-10-12",
  },
  {
    id: "evt-3",
    name: "Black Friday & Cyber Monday 2026",
    slug: "black-friday-deals",
    keyword: "black friday promo codes 2026",
    seoTitle: "Black Friday & Cyber Monday 2026 Deals | GoCoupon",
    seoDescription: "Huge tech, fashion, and gadget markdowns across Amazon, Walmart, Best Buy, and Target.",
    shortDescription: "Global holiday savings weekend.",
    longDescription: "Automated coupon testing and 30-day baseline tracker to detect fake pre-Black Friday markups.",
    status: "enabled",
    startDate: "2026-11-27",
    endDate: "2026-11-30",
  },
];

const defaultUsers = [
  {
    id: "usr-1",
    name: "GoCoupon Admin",
    email: "admin@gocoupon.io",
    role: "admin",
    permissions: ["dashboard", "offers", "stores", "categories", "products", "blogs", "events", "hero", "sections", "users", "settings"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr-2",
    name: "Deals Desk Editor",
    email: "editor@gocoupon.io",
    role: "editor",
    permissions: ["dashboard", "offers", "stores", "categories", "blogs", "events", "hero"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// ---------------------------------------------------------------------------
// 3. Admin Authentication & Verification Endpoints
// ---------------------------------------------------------------------------
adminRouter.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPass = String(password || "").trim();

  const configuredEmail = (process.env.ADMIN_EMAIL || "support@gocoupon.io").trim().toLowerCase();
  const configuredPass = (process.env.ADMIN_PASSWORD || "GC_Admin_Secured#2026!").trim();

  const isSuperadminMatch =
    (cleanEmail === configuredEmail || cleanEmail === "admin@gocoupon.io") &&
    cleanPass === configuredPass;

  const users = loadJson(USERS_FILE, defaultUsers);
  const matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail && u.isActive);

  if (!isSuperadminMatch && (!matchedUser || cleanPass !== configuredPass)) {
    res.status(401).json({ success: false, error: "Invalid admin email or password." });
    return;
  }

  const role = matchedUser ? matchedUser.role : "admin";
  const token = generateAdminToken(cleanEmail, role);
  const userPayload = matchedUser || {
    id: "usr-superadmin",
    name: "GoCoupon SuperAdmin",
    email: cleanEmail,
    role: "admin",
    permissions: defaultUsers[0].permissions,
    isActive: true,
  };

  res.json({
    success: true,
    token,
    user: userPayload,
  });
});

adminRouter.get("/verify", requireAdminAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    user: (req as any).adminUser,
  });
});

// ---------------------------------------------------------------------------
// 3.1 Cache Management Endpoints
// ---------------------------------------------------------------------------
adminRouter.post("/cache/clear", requireAdminAuth, async (_req: Request, res: Response) => {
  const clearedCount = await globalCache.clearAll();
  res.json({
    success: true,
    message: `Flushed all active cache entries (${clearedCount} in-memory keys purged).`,
    clearedCount,
    timestamp: new Date().toISOString(),
  });
});

adminRouter.get("/cache/stats", requireAdminAuth, (_req: Request, res: Response) => {
  res.json({
    success: true,
    activeKeys: globalCache.size(),
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// 4. Dashboard Stats Endpoint
// ---------------------------------------------------------------------------
adminRouter.get("/stats", async (req: Request, res: Response) => {
  try {
    const rawDeals = getLiveDealsPool();
    const validDeals = rawDeals.filter(isDealValid);
    const coupons = validDeals.filter((d: any) => d.code && d.code.trim().length > 0);
    const storesCount = STORES_DB.length;
    const users = loadJson(USERS_FILE, defaultUsers);

    res.json({
      success: true,
      data: {
        totalOffers: validDeals.length,
        activeCoupons: coupons.length,
        activeDeals: validDeals.length - coupons.length,
        totalStores: storesCount,
        totalCategories: 8,
        totalUsers: users.length,
        totalClicksToday: 4820,
        syncStatus: {
          lastSync: new Date().toISOString(),
          status: "healthy",
          accumulatedValidDeals: validDeals.length,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 5. Notifications Endpoints
// ---------------------------------------------------------------------------
adminRouter.get("/notifications", (req: Request, res: Response) => {
  res.json({ success: true, data: adminNotifications });
});

adminRouter.post("/notifications", requireAdminAuth, (req: Request, res: Response) => {
  adminNotifications = adminNotifications.map((n) => ({ ...n, read: true }));
  res.json({ success: true, message: "Marked all as read." });
});

adminRouter.delete("/notifications", requireAdminAuth, (req: Request, res: Response) => {
  adminNotifications = [];
  res.json({ success: true, message: "Cleared all notifications." });
});

// ---------------------------------------------------------------------------
// 6. Settings Endpoints
// ---------------------------------------------------------------------------
adminRouter.get("/settings", (req: Request, res: Response) => {
  const settings = loadJson(SETTINGS_FILE, defaultSettings);
  res.json({ success: true, data: settings });
});

adminRouter.put("/settings", requireAdminAuth, (req: Request, res: Response) => {
  const newSettings = req.body || {};
  saveJson(SETTINGS_FILE, newSettings);
  res.json({ success: true, message: "Settings saved successfully.", data: newSettings });
});

// ---------------------------------------------------------------------------
// 7. SEO Files (robots.txt, sitemap.xml)
// ---------------------------------------------------------------------------
adminRouter.get("/seo-files", (req: Request, res: Response) => {
  const fileName = String(req.query.fileName || "robots.txt").replace(/[^a-zA-Z0-9._-]/g, "");
  const targetPath = path.resolve(process.cwd(), "public", fileName);

  if (!fs.existsSync(targetPath)) {
    res.status(404).json({ error: `File ${fileName} not found.` });
    return;
  }

  try {
    const content = fs.readFileSync(targetPath, "utf-8");
    res.json({ success: true, fileName, content });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post("/seo-files", requireAdminAuth, (req: Request, res: Response) => {
  const { fileName = "robots.txt", content = "" } = req.body || {};
  const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "");
  const targetPath = path.resolve(process.cwd(), "public", safeName);

  try {
    fs.writeFileSync(targetPath, String(content), "utf-8");
    res.json({ success: true, message: `Successfully updated ${safeName}.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 8. Admin Users Management
// ---------------------------------------------------------------------------
adminRouter.get("/users", requireAdminAuth, (req: Request, res: Response) => {
  const users = loadJson(USERS_FILE, defaultUsers);
  res.json({ success: true, data: users });
});

adminRouter.post("/users", requireAdminAuth, (req: Request, res: Response) => {
  const { name, email, role, permissions, isActive } = req.body || {};
  if (!email || !name) {
    res.status(400).json({ error: "Name and email are required." });
    return;
  }

  const users = loadJson(USERS_FILE, defaultUsers);
  const newUser = {
    id: `usr-${Date.now()}`,
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    role: role || "editor",
    permissions: Array.isArray(permissions) ? permissions : ["dashboard", "offers"],
    isActive: isActive !== false,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveJson(USERS_FILE, users);
  res.json({ success: true, data: newUser });
});

adminRouter.put("/users", requireAdminAuth, (req: Request, res: Response) => {
  const { id, name, email, role, permissions, isActive } = req.body || {};
  if (!id) {
    res.status(400).json({ error: "User ID is required." });
    return;
  }

  const users = loadJson(USERS_FILE, defaultUsers);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  users[idx] = {
    ...users[idx],
    name: name ? String(name).trim() : users[idx].name,
    email: email ? String(email).trim().toLowerCase() : users[idx].email,
    role: role || users[idx].role,
    permissions: Array.isArray(permissions) ? permissions : users[idx].permissions,
    isActive: typeof isActive === "boolean" ? isActive : users[idx].isActive,
  };

  saveJson(USERS_FILE, users);
  res.json({ success: true, data: users[idx] });
});

adminRouter.delete("/users", requireAdminAuth, (req: Request, res: Response) => {
  const id = req.query.id as string;
  if (!id) {
    res.status(400).json({ error: "User ID is required." });
    return;
  }

  let users = loadJson(USERS_FILE, defaultUsers);
  users = users.filter((u) => u.id !== id);
  saveJson(USERS_FILE, users);
  res.json({ success: true, message: "User deleted successfully." });
});

// ---------------------------------------------------------------------------
// 9. Hero & Homepage Sections Endpoints
// ---------------------------------------------------------------------------
adminRouter.get("/hero", (req: Request, res: Response) => {
  const hero = loadJson(HERO_FILE, defaultHero);
  res.json({ success: true, data: hero });
});

adminRouter.put("/hero", requireAdminAuth, (req: Request, res: Response) => {
  const hero = req.body || {};
  saveJson(HERO_FILE, hero);
  res.json({ success: true, message: "Hero settings saved.", data: hero });
});

adminRouter.get("/sections", (req: Request, res: Response) => {
  const sections = loadJson(SECTIONS_FILE, {
    featuredStores: true,
    trendingDeals: true,
    bankArbitrage: true,
    categoriesGrid: true,
    testimonials: true,
    faq: true,
  });
  res.json({ success: true, data: sections });
});

adminRouter.put("/sections", requireAdminAuth, (req: Request, res: Response) => {
  const sections = req.body || {};
  saveJson(SECTIONS_FILE, sections);
  res.json({ success: true, message: "Homepage sections saved.", data: sections });
});

// ---------------------------------------------------------------------------
// 10. Events / Festivals Endpoints
// ---------------------------------------------------------------------------
adminRouter.get("/events", (req: Request, res: Response) => {
  const events = loadJson(EVENTS_FILE, defaultEvents);
  res.json({ success: true, data: events });
});

adminRouter.post("/events", requireAdminAuth, (req: Request, res: Response) => {
  const event = req.body || {};
  const events = loadJson(EVENTS_FILE, defaultEvents);
  const newEvent = { ...event, id: `evt-${Date.now()}` };
  events.unshift(newEvent);
  saveJson(EVENTS_FILE, events);
  res.json({ success: true, data: newEvent });
});

adminRouter.put("/events", requireAdminAuth, (req: Request, res: Response) => {
  const event = req.body || {};
  const events = loadJson(EVENTS_FILE, defaultEvents);
  const idx = events.findIndex((e) => e.id === event.id || e.slug === event.slug);
  if (idx !== -1) {
    events[idx] = { ...events[idx], ...event };
    saveJson(EVENTS_FILE, events);
    res.json({ success: true, data: events[idx] });
  } else {
    events.unshift(event);
    saveJson(EVENTS_FILE, events);
    res.json({ success: true, data: event });
  }
});

adminRouter.delete("/events", requireAdminAuth, (req: Request, res: Response) => {
  const id = (req.query.id as string) || (req.query.slug as string);
  let events = loadJson(EVENTS_FILE, defaultEvents);
  events = events.filter((e) => e.id !== id && e.slug !== id);
  saveJson(EVENTS_FILE, events);
  res.json({ success: true, message: "Event deleted." });
});

// ---------------------------------------------------------------------------
// 11. Community Coupon Submissions Review Desk
// ---------------------------------------------------------------------------
export interface StoredSubmission {
  id: string;
  storeName: string;
  code: string;
  discount?: string;
  category?: string;
  url?: string;
  terms?: string;
  expiryDate?: string;
  email?: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  approvedDealId?: string;
}

const defaultSubmissions: StoredSubmission[] = [
  {
    id: "sub-101",
    storeName: "Myntra",
    code: "MYNTRA500",
    discount: "Flat ₹500 OFF on orders above ₹1,999",
    category: "Fashion",
    url: "https://www.myntra.com",
    terms: "Valid on clothing, footwear, and accessories. Select brands only.",
    expiryDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    email: "priya.sharma@gmail.com",
    submittedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    status: "pending",
  },
  {
    id: "sub-102",
    storeName: "Croma",
    code: "CROMAAUDIO15",
    discount: "15% Instant Discount on Premium Audio",
    category: "Electronics",
    url: "https://www.croma.com",
    terms: "Valid on Sony, JBL, and Bose headphones. Max discount ₹2,000.",
    expiryDate: new Date(Date.now() + 20 * 86400000).toISOString().split("T")[0],
    email: "rahul.techie@outlook.com",
    submittedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    status: "pending",
  },
  {
    id: "sub-103",
    storeName: "Swiggy",
    code: "SWIGGYTASTY",
    discount: "Flat ₹120 OFF on orders above ₹299",
    category: "Food",
    url: "https://www.swiggy.com",
    terms: "Valid on select restaurants. Payment via UPI or Credit Card.",
    expiryDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    email: "ananya.foodie@gmail.com",
    submittedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    status: "approved",
  },
];

export function recordNewSubmission(sub: Omit<StoredSubmission, "id" | "submittedAt" | "status">): StoredSubmission {
  const submissions = loadJson(SUBMISSIONS_FILE, defaultSubmissions);
  const newSub: StoredSubmission = {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...sub,
    submittedAt: new Date().toISOString(),
    status: "pending",
  };
  submissions.unshift(newSub);
  saveJson(SUBMISSIONS_FILE, submissions);
  return newSub;
}

/**
 * GET /api/admin/submissions
 * Retrieve submitted community coupons with optional status filter
 */
adminRouter.get("/submissions", (req: Request, res: Response) => {
  const status = (req.query.status as string || "").toLowerCase();
  const q = (req.query.q as string || "").toLowerCase().trim();
  let submissions = loadJson(SUBMISSIONS_FILE, defaultSubmissions);

  if (status && status !== "all") {
    submissions = submissions.filter((s) => s.status === status);
  }

  if (q) {
    submissions = submissions.filter(
      (s) =>
        s.storeName.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.discount && s.discount.toLowerCase().includes(q))
    );
  }

  const all = loadJson(SUBMISSIONS_FILE, defaultSubmissions);
  const counts = {
    all: all.length,
    pending: all.filter((s) => s.status === "pending").length,
    approved: all.filter((s) => s.status === "approved").length,
    rejected: all.filter((s) => s.status === "rejected").length,
  };

  res.json({
    success: true,
    total: submissions.length,
    counts,
    data: submissions,
  });
});

/**
 * POST /api/admin/submissions/:id/approve
 * Approve user submission and automatically inject it into the live deals pool
 */
adminRouter.post("/submissions/:id/approve", requireAdminAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const submissions = loadJson(SUBMISSIONS_FILE, defaultSubmissions);
  const idx = submissions.findIndex((s) => s.id === id);

  if (idx === -1) {
    res.status(404).json({ success: false, error: `Submission '${id}' not found.` });
    return;
  }

  const sub = submissions[idx];
  const dealId = `sub_deal_${sub.id}`;
  const storeSlug = sub.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "-coupons";

  // Create real live deal record
  const newDeal = {
    id: dealId,
    title: sub.discount ? `${sub.discount} at ${sub.storeName}` : `Verified Coupon Code at ${sub.storeName}`,
    description: sub.terms || `Community submitted coupon verified by GoCoupon editorial for ${sub.storeName}.`,
    storeName: sub.storeName,
    storeSlug,
    storeLogo: `https://www.google.com/s2/favicons?domain=${sub.storeName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com&sz=128`,
    category: sub.category || "General",
    code: sub.code,
    discount: sub.discount || "Verified Deal",
    badge: "Verified" as const,
    verifiedDate: "Today",
    expiresIn: "30 days left",
    endDate: sub.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString(),
    terms: sub.terms || "Standard merchant terms apply.",
    link: sub.url || `https://${sub.storeName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    url: sub.url || `https://${sub.storeName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    usesCount: 15,
    verified: true,
    votesCount: 1,
    rating: 4.9,
    source: "community-verified",
    status: "active" as const,
    type: sub.code ? ("Coupon" as const) : ("Deal" as const),
  };

  addDealToPool(newDeal as any);
  await globalCache.deletePrefix("deals:");

  sub.status = "approved";
  sub.approvedDealId = dealId;
  saveJson(SUBMISSIONS_FILE, submissions);

  res.json({
    success: true,
    message: `Coupon "${sub.code}" for ${sub.storeName} approved and published to live deals pool!`,
    data: sub,
    deal: newDeal,
  });
});

/**
 * POST /api/admin/submissions/:id/reject
 * Reject user submission with optional reason
 */
adminRouter.post("/submissions/:id/reject", requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body || {};
  const submissions = loadJson(SUBMISSIONS_FILE, defaultSubmissions);
  const idx = submissions.findIndex((s) => s.id === id);

  if (idx === -1) {
    res.status(404).json({ success: false, error: `Submission '${id}' not found.` });
    return;
  }

  submissions[idx].status = "rejected";
  submissions[idx].rejectionReason = reason || "Expired or invalid coupon code format.";
  saveJson(SUBMISSIONS_FILE, submissions);

  res.json({
    success: true,
    message: `Submission '${id}' marked as rejected.`,
    data: submissions[idx],
  });
});

/**
 * PUT /api/admin/submissions/:id
 * Edit submission fields before approving
 */
adminRouter.put("/submissions/:id", requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const submissions = loadJson(SUBMISSIONS_FILE, defaultSubmissions);
  const idx = submissions.findIndex((s) => s.id === id);

  if (idx === -1) {
    res.status(404).json({ success: false, error: `Submission '${id}' not found.` });
    return;
  }

  const b = req.body || {};
  submissions[idx] = {
    ...submissions[idx],
    storeName: b.storeName !== undefined ? b.storeName.trim() : submissions[idx].storeName,
    code: b.code !== undefined ? b.code.trim().toUpperCase() : submissions[idx].code,
    discount: b.discount !== undefined ? b.discount.trim() : submissions[idx].discount,
    category: b.category !== undefined ? b.category : submissions[idx].category,
    url: b.url !== undefined ? b.url : submissions[idx].url,
    terms: b.terms !== undefined ? b.terms : submissions[idx].terms,
    expiryDate: b.expiryDate !== undefined ? b.expiryDate : submissions[idx].expiryDate,
  };

  saveJson(SUBMISSIONS_FILE, submissions);

  res.json({
    success: true,
    message: "Submission updated successfully.",
    data: submissions[idx],
  });
});

/**
 * DELETE /api/admin/submissions/:id
 * Remove submission
 */
adminRouter.delete("/submissions/:id", requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  let submissions = loadJson(SUBMISSIONS_FILE, defaultSubmissions);
  const initialLen = submissions.length;
  submissions = submissions.filter((s) => s.id !== id);

  if (submissions.length === initialLen) {
    res.status(404).json({ success: false, error: `Submission '${id}' not found.` });
    return;
  }

  saveJson(SUBMISSIONS_FILE, submissions);
  res.json({ success: true, message: `Submission '${id}' deleted.` });
});

