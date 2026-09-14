/**
 * @file server/routes/blogs.ts
 * @description Blog & Shopping Guides API for GoCoupon with file persistence.
 */

import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { requireAdminAuth } from "./admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data");
const BLOGS_FILE = path.join(DATA_DIR, "blogs.json");

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  readTime: string;
  image?: string;
  bannerLink?: string;
  shortDescription?: string;
  excerpt?: string;
  content: string;
  status: "Published" | "Draft";
  createdAt: string;
  updatedAt: string;
  views?: number;
}

// Initial baseline seed posts from GoCoupon editorial
const SEED_BLOGS: BlogPost[] = [
  {
    id: "blog-1",
    slug: "why-other-coupon-apps-fail-and-how-gocoupon-saves-thousands",
    title: "Why Other Coupon Apps Leave 70% of Your Money on the Table (And How GoCoupon Rescues Your Budget)",
    category: "Expense Saviour",
    author: "GoCoupon Consumer Advocacy Team",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80",
    bannerLink: "/offers",
    shortDescription: "Most coupon apps only test dead promo codes while you overpay by ₹3,000 on every order. Here is how GoCoupon's 4-tier savings collapse puts ₹50,000+ back into your family budget every year.",
    excerpt: "Most coupon apps only test dead promo codes while you overpay by ₹3,000 on every order.",
    content: `## The Silent Retail Tax

The average household loses between ₹42,000 and ₹65,000 every year because they trust a single online store's advertised "discount" without checking competitor pricing, hidden vouchers, and bank card rebates.

## The 3 Lies of Traditional Coupon Extensions

If you have ever installed an extension like Honey, RetailMeNot, or Coupert, you know the feeling: you reach checkout, it tests 12 codes, tells you "You got the best price!", and saves you zero. Why? Because traditional coupon extensions were designed for the retailer, not for your wallet.

1. **Lie #1: "You got the best price on this store."** What they don't tell you is that a competing store is selling the exact same brand-new item for ₹4,000 less right now.
2. **Lie #2: Ignoring your wallet's bank cards.** Stores offer massive ₹2,500 to ₹7,500 instant discounts with partner banks (HDFC, SBI, ICICI, Axis). Traditional coupon tools ignore card rebates completely.
3. **Lie #3: Falling for fake pre-sale markups.** Sellers quietly raise prices by 30% a week before a big sale, then slap on a "20% OFF" banner. Traditional tools celebrate the fake discount, leaving you cheated.

## How GoCoupon Acts as Your Household Expense Saviour

GoCoupon collapses all 4 tiers of pricing into a single verified checkout: store coupon + merchant price comparison + bank card arbitrage + automatic coupon testing.`,
    status: "Published",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    views: 1420,
  },
  {
    id: "blog-2",
    slug: "gocoupon-vs-grabon-couponduniya-dealspotr",
    title: "GoCoupon vs GrabOn, CouponDuniya & Dealspotr: The 2026 Honest Comparison",
    category: "Comparison",
    author: "GoCoupon Tech Review Desk",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1200&auto=format&fit=crop&q=80",
    bannerLink: "/offers",
    shortDescription: "We tested 50 identical shopping carts across Amazon, Flipkart, Myntra, and Swiggy against GrabOn, CouponDuniya, and Dealspotr. Here are the verified savings results.",
    excerpt: "We tested 50 identical shopping carts across Amazon, Flipkart, Myntra, and Swiggy against traditional aggregators.",
    content: `## The Modern Coupon Verification Problem

For over a decade, Indian shoppers relied on coupon aggregators like GrabOn, CouponDuniya, and Dealspotr. However, crowdsourced coupon directories suffer from three major shortcomings:

- **Expired Code Clutter**: Over 60% of listed codes on legacy aggregators fail at checkout.
- **Missing Bank Arbitrage**: Legacy sites list basic store promo codes but omit instant 10% card discounts with HDFC, SBI, ICICI, and Axis Bank.
- **No Multi-Store Price Comparison**: Traditional aggregators do not warn you if Flipkart or Croma is cheaper than Amazon for the same product.

## The GoCoupon Advantage: 24/7 API Ingestion

GoCoupon synchronizes with merchant affiliate APIs every hour, testing and pruning expired vouchers automatically. When you browse GoCoupon, validity is 100% verified.`,
    status: "Published",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    views: 2180,
  },
  {
    id: "blog-3",
    slug: "swiggy-vs-zomato-fee-structure-coupon-breakdown",
    title: "Swiggy vs Zomato: Fee Structure & Coupon Breakdown",
    category: "Food & Dining",
    author: "Savings Strategist",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80",
    bannerLink: "/stores/swiggy",
    shortDescription: "A line-by-line comparison of delivery fees, packaging charges, restaurant commissions, and secret promo code stacking on food delivery apps.",
    excerpt: "A line-by-line comparison of delivery fees, packaging charges, and coupon stacking.",
    content: `## Decoding the Delivery Bill

Between packaging charges, surge fees, and platform handling fees, food delivery costs have risen substantially. Here is how to use verified promo codes and payment wallets to save 20-30% on every order.`,
    status: "Published",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    views: 890,
  },
];

function loadBlogs(): BlogPost[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BLOGS_FILE)) {
      fs.writeFileSync(BLOGS_FILE, JSON.stringify(SEED_BLOGS, null, 2), "utf-8");
      return [...SEED_BLOGS];
    }
    const raw = fs.readFileSync(BLOGS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...SEED_BLOGS];
  } catch (err) {
    console.error("[Blogs DB] Error reading blogs.json:", err);
    return [...SEED_BLOGS];
  }
}

function saveBlogs(blogs: BlogPost[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2), "utf-8");
  } catch (err) {
    console.error("[Blogs DB] Error saving blogs.json:", err);
  }
}

import { blogsDb } from "../services/db.js";

export const blogsRouter = Router();

/**
 * GET /api/blogs
 * Public & admin listing of blog articles
 */
blogsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const category = (req.query.category as string) || "";
    const status = (req.query.status as string) || "";
    const q = (req.query.q as string || "").toLowerCase().trim();

    const includeDrafts = status === "all" || status.toLowerCase() === "draft";
    let results = await blogsDb.getBlogs(includeDrafts);

    if (status && status !== "all") {
      results = results.filter((b) => b.status.toLowerCase() === status.toLowerCase());
    }

    if (category && category !== "all") {
      results = results.filter((b) => b.category.toLowerCase() === category.toLowerCase());
    }

    if (q) {
      results = results.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.slug.toLowerCase().includes(q) ||
          (b.excerpt && b.excerpt.toLowerCase().includes(q)) ||
          (b.content && b.content.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      total: results.length,
      data: results,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/blogs/:slug
 * Fetch single article by slug
 */
blogsRouter.get("/:slug", async (req: Request, res: Response) => {
  try {
    const rawSlug = String(req.params.slug).toLowerCase();

    // Strict slug validation — only allow alphanumeric + hyphens (no traversal, no special chars)
    if (!/^[a-z0-9][a-z0-9-]{0,199}$/.test(rawSlug)) {
      res.status(400).json({ success: false, error: "Invalid slug format." });
      return;
    }

    const slug = rawSlug;
    const blog = await blogsDb.getBlogBySlug(slug);

    if (!blog) {
      res.status(404).json({ success: false, error: `Blog post '${slug}' not found.` });
      return;
    }

    // Increment view counter asynchronously
    blogsDb.incrementViews(slug).catch((e) => console.warn("[Blog View Count Warning]:", e.message));
    blog.views = (blog.views || 0) + 1;

    res.json({ success: true, data: blog });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/blogs
 * Create new blog article
 */
blogsRouter.post("/", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const {
      title,
      slug: customSlug,
      category,
      author,
      readTime,
      image,
      bannerLink,
      shortDescription,
      content,
      status,
    } = req.body || {};

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, error: "Article title is required." });
      return;
    }

    const baseSlug = (customSlug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const allBlogs = await blogsDb.getBlogs(true);
    let finalSlug = baseSlug;
    let counter = 1;
    while (allBlogs.some((b) => b.slug === finalSlug)) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    const newBlog: BlogPost = {
      id: `blog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      slug: finalSlug,
      title: title.trim(),
      category: category || "Shopping Guide",
      author: author || "GoCoupon Editorial",
      readTime: readTime || "4 min read",
      image: image || "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80",
      bannerLink: bannerLink || "/offers",
      shortDescription: shortDescription || "",
      excerpt: shortDescription || (content ? content.slice(0, 160) + "..." : ""),
      content: content || "",
      status: status === "Draft" ? "Draft" : "Published",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
    };

    const savedBlog = await blogsDb.createBlog(newBlog);
    res.status(201).json({ success: true, data: savedBlog, message: "Blog post published successfully!" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/blogs/:slug
 * Update existing article
 */
blogsRouter.put("/:slug", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug).toLowerCase();
    const existing = await blogsDb.getBlogBySlug(slug);

    if (!existing) {
      res.status(404).json({ success: false, error: `Blog post '${slug}' not found.` });
      return;
    }

    const b = req.body || {};
    const updatedFields: Partial<BlogPost> = {
      title: b.title !== undefined ? b.title.trim() : existing.title,
      category: b.category !== undefined ? b.category : existing.category,
      author: b.author !== undefined ? b.author : existing.author,
      readTime: b.readTime !== undefined ? b.readTime : existing.readTime,
      image: b.image !== undefined ? b.image : existing.image,
      bannerLink: b.bannerLink !== undefined ? b.bannerLink : existing.bannerLink,
      shortDescription: b.shortDescription !== undefined ? b.shortDescription : existing.shortDescription,
      excerpt: b.shortDescription !== undefined ? b.shortDescription : existing.excerpt,
      content: b.content !== undefined ? b.content : existing.content,
      status: b.status !== undefined ? b.status : existing.status,
    };

    if (b.slug && b.slug.trim().toLowerCase() !== existing.slug) {
      updatedFields.slug = b.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }

    const updatedBlog = await blogsDb.updateBlog(existing.id, updatedFields);
    res.json({ success: true, data: updatedBlog, message: "Blog post updated successfully!" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/blogs/:slug
 * Delete article
 */
blogsRouter.delete("/:slug", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug).toLowerCase();
    const existing = await blogsDb.getBlogBySlug(slug);

    if (!existing) {
      res.status(404).json({ success: false, error: `Blog post '${slug}' not found.` });
      return;
    }

    await blogsDb.deleteBlog(existing.id);
    res.json({ success: true, message: `Blog post '${slug}' removed.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
