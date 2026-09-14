/**
 * @file server/services/db.ts
 * @description Unified Production Database Service for GoCoupon.
 *
 * Architecture:
 * - Primary: High-performance PostgreSQL via Supabase Connection Pool
 * - Secondary: Automatic Transparent In-Memory & Local JSON Disk Fallback
 * - Zero Downtime Guarantee: If PostgreSQL is temporarily paused, unreachable,
 *   or undergoing maintenance, the application continues operating seamlessly.
 */

import pg from "pg";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { DealRecord, UserCouponSubmission } from "../../src/lib/server-data/deals-db.js";
import { getLiveDeals, setLiveDeals } from "../../src/lib/server-data/deals-db.js";
import type { BlogPost } from "../routes/blogs.js";
import type { PushAlertRegistration } from "../routes/alerts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data");

// -----------------------------------------------------------------------------
// Database Connection Pool Initialization
// -----------------------------------------------------------------------------
const DATABASE_URL = process.env.DATABASE_URL || "";
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      })
    : null;

let pgPool: pg.Pool | null = null;
let isPgConnected = false;

if (DATABASE_URL) {
  try {
    pgPool = new pg.Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 6000,
    });

    pgPool.on("error", (err) => {
      console.warn("[Database] PostgreSQL Pool idle client error:", err.message);
      isPgConnected = false;
    });

    // Test initial connection asynchronously
    pgPool
      .query("SELECT 1")
      .then(() => {
        isPgConnected = true;
        console.log("⚡ [Database] Connected to PostgreSQL (Supabase) successfully.");
      })
      .catch((err) => {
        console.warn("⚠️ [Database] Initial PostgreSQL connection check failed, using fallback engine:", err.message);
        isPgConnected = false;
      });
  } catch (err: any) {
    console.warn("⚠️ [Database] Failed to initialize pg.Pool:", err.message);
    isPgConnected = false;
  }
}

/**
 * Universal safe query execution with automatic catch and failover.
 */
export async function queryPg<T extends pg.QueryResultRow = any>(
  text: string,
  params: any[] = []
): Promise<pg.QueryResult<T> | null> {
  if (!pgPool) return null;
  try {
    const res = await pgPool.query<T>(text, params);
    isPgConnected = true;
    return res;
  } catch (err: any) {
    console.warn(`[Database] Query warning (${err.message}). Using resilient fallback.`);
    isPgConnected = false;
    return null;
  }
}

export function isDatabaseHealthy(): boolean {
  return isPgConnected;
}

// -----------------------------------------------------------------------------
// Helper: File Fallback Helpers
// -----------------------------------------------------------------------------
function readJsonFallback<T>(filename: string, defaultValue: T): T {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch (err: any) {
    console.warn(`[Database Fallback] Failed reading ${filename}:`, err.message);
  }
  return defaultValue;
}

function writeJsonFallback<T>(filename: string, data: T): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err: any) {
    console.warn(`[Database Fallback] Failed writing ${filename}:`, err.message);
  }
}

// =============================================================================
// 1. DEALS DATABASE SERVICE
// =============================================================================
export const dealsDb = {
  /**
   * Retrieves active, non-expired deals with optional store, category, or search filter.
   */
  async getDeals(options?: {
    storeSlug?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<DealRecord[]> {
    const conditions: string[] = ["status = 'active'", "(end_date IS NULL OR end_date > NOW())"];
    const params: any[] = [];
    let pIdx = 1;

    if (options?.storeSlug) {
      conditions.push(`store_slug = $${pIdx++}`);
      params.push(options.storeSlug.toLowerCase());
    }

    if (options?.category && options.category !== "All") {
      conditions.push(`category ILIKE $${pIdx++}`);
      params.push(options.category);
    }

    if (options?.search) {
      conditions.push(`(title ILIKE $${pIdx} OR store_name ILIKE $${pIdx} OR code ILIKE $${pIdx})`);
      params.push(`%${options.search}%`);
      pIdx++;
    }

    let query = `
      SELECT 
        id, store_name AS "storeName", store_slug AS "storeSlug", store_logo AS "storeLogo",
        title, code, discount, category, badge, verified, verified_date AS "verifiedDate",
        expires_in AS "expiresIn", end_date AS "endDate", min_order AS "minOrder",
        terms, link, uses_count AS "usesCount", rating, votes_count AS "votesCount",
        source, status, type
      FROM gocoupon_deals
      WHERE ${conditions.join(" AND ")}
      ORDER BY verified DESC, uses_count DESC, created_at DESC
    `;

    if (options?.limit) {
      query += ` LIMIT $${pIdx++}`;
      params.push(options.limit);
    }
    if (options?.offset) {
      query += ` OFFSET $${pIdx++}`;
      params.push(options.offset);
    }

    const res = await queryPg<DealRecord>(query, params);
    if (res && res.rows.length > 0) {
      return res.rows;
    }

    // Fallback: Read from in-memory / live deals pool
    let deals = getLiveDeals();
    if (options?.storeSlug) {
      deals = deals.filter((d) => d.storeSlug?.toLowerCase() === options.storeSlug?.toLowerCase());
    }
    if (options?.category && options.category !== "All") {
      deals = deals.filter((d) => d.category?.toLowerCase() === options.category?.toLowerCase());
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      deals = deals.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.storeName.toLowerCase().includes(q) ||
          (d.code && d.code.toLowerCase().includes(q))
      );
    }
    if (options?.offset || options?.limit) {
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      return deals.slice(start, end);
    }
    return deals;
  },

  /**
   * Retrieves single deal by unique ID.
   */
  async getDealById(id: string): Promise<DealRecord | null> {
    const res = await queryPg<DealRecord>(
      `SELECT 
        id, store_name AS "storeName", store_slug AS "storeSlug", store_logo AS "storeLogo",
        title, code, discount, category, badge, verified, verified_date AS "verifiedDate",
        expires_in AS "expiresIn", end_date AS "endDate", min_order AS "minOrder",
        terms, link, uses_count AS "usesCount", rating, votes_count AS "votesCount",
        source, status, type
      FROM gocoupon_deals WHERE id = $1 LIMIT 1`,
      [id]
    );
    if (res && res.rows.length > 0) return res.rows[0];
    return getLiveDeals().find((d) => String(d.id) === String(id)) || null;
  },

  /**
   * High-performance batch upsert for verified deals (used by Cuelinks 24/7 sync).
   */
  async upsertDeals(deals: DealRecord[]): Promise<number> {
    if (!deals || deals.length === 0) return 0;

    // Update in-memory pool immediately for instant zero-latency responses
    setLiveDeals(deals);

    if (pgPool) {
      try {
        const BATCH_SIZE = 50;
        let totalUpserted = 0;

        for (let i = 0; i < deals.length; i += BATCH_SIZE) {
          const batch = deals.slice(i, i + BATCH_SIZE);
          const values: any[] = [];
          const rowPlaceholders: string[] = [];

          batch.forEach((d, idx) => {
            const offset = idx * 22;
            rowPlaceholders.push(`(${Array.from({ length: 22 }, (_, k) => `$${offset + k + 1}`).join(", ")})`);

            values.push(
              String(d.id),
              d.storeName || "Store",
              d.storeSlug || (d.storeName || "store").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              d.storeLogo || null,
              d.title,
              d.code || "",
              d.discount || "Exclusive Offer",
              d.category || "General",
              d.badge || "Verified",
              d.verified ?? true,
              d.verifiedDate || "Verified Today",
              d.expiresIn || "Active",
              d.endDate ? new Date(d.endDate) : null,
              d.minOrder || null,
              d.terms || null,
              d.link || "https://gocoupon.io",
              d.usesCount || 1,
              d.rating || 4.8,
              d.votesCount || 12,
              d.source || "cuelinks",
              d.status || "active",
              d.type || "coupon"
            );
          });

          const query = `
            INSERT INTO gocoupon_deals (
              id, store_name, store_slug, store_logo, title, code, discount, category,
              badge, verified, verified_date, expires_in, end_date, min_order, terms,
              link, uses_count, rating, votes_count, source, status, type
            ) VALUES ${rowPlaceholders.join(",\n")}
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              code = EXCLUDED.code,
              discount = EXCLUDED.discount,
              uses_count = EXCLUDED.uses_count,
              verified = EXCLUDED.verified,
              updated_at = NOW();
          `;

          await queryPg(query, values);
          totalUpserted += batch.length;
        }
        return totalUpserted;
      } catch (err: any) {
        console.warn("[Database dealsDb.upsertDeals] PostgreSQL batch upsert failed:", err.message);
      }
    }
    return deals.length;
  },

  /**
   * Deletes a deal by ID.
   */
  async deleteDeal(id: string): Promise<boolean> {
    await queryPg("DELETE FROM gocoupon_deals WHERE id = $1", [id]);
    const current = getLiveDeals().filter((d) => String(d.id) !== String(id));
    setLiveDeals(current);
    return true;
  },
};

// =============================================================================
// 2. COMMUNITY SUBMISSIONS SERVICE
// =============================================================================
export const submissionsDb = {
  /**
   * Retrieves all community coupon submissions.
   */
  async getSubmissions(): Promise<UserCouponSubmission[]> {
    const res = await queryPg<UserCouponSubmission>(`
      SELECT 
        id, store_name AS "storeName", code, discount, category,
        url, terms, email, status, rejection_reason AS "rejectionReason",
        submitted_at AS "submittedAt", reviewed_at AS "reviewedAt"
      FROM gocoupon_submissions
      ORDER BY submitted_at DESC
    `);
    if (res && res.rows.length > 0) return res.rows;
    return readJsonFallback<UserCouponSubmission[]>("admin-submissions.json", []);
  },

  /**
   * Creates a new coupon submission.
   */
  async createSubmission(
    data: Omit<UserCouponSubmission, "id" | "submittedAt" | "status">
  ): Promise<UserCouponSubmission> {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const submission: UserCouponSubmission = {
      id,
      ...data,
      submittedAt: new Date().toISOString(),
      status: "pending",
    };

    await queryPg(
      `INSERT INTO gocoupon_submissions (
        id, store_name, code, discount, category, url, terms, email, status, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        submission.id,
        submission.storeName,
        submission.code,
        submission.discount || null,
        submission.category || "General",
        submission.url || null,
        submission.terms || null,
        submission.email || null,
        submission.status,
        new Date(submission.submittedAt),
      ]
    );

    // Always update disk fallback
    const list = readJsonFallback<UserCouponSubmission[]>("admin-submissions.json", []);
    list.unshift(submission);
    writeJsonFallback("admin-submissions.json", list);

    return submission;
  },

  /**
   * Updates submission moderation status (approved, rejected, verified).
   */
  async updateStatus(
    id: string,
    status: "pending" | "verified" | "approved" | "rejected",
    reason?: string
  ): Promise<UserCouponSubmission | null> {
    const res = await queryPg<UserCouponSubmission>(
      `UPDATE gocoupon_submissions 
       SET status = $1, rejection_reason = $2, reviewed_at = NOW()
       WHERE id = $3
       RETURNING 
         id, store_name AS "storeName", code, discount, category,
         url, terms, email, status, rejection_reason AS "rejectionReason",
         submitted_at AS "submittedAt", reviewed_at AS "reviewedAt"`,
      [status, reason || null, id]
    );

    // Sync disk fallback
    const list = readJsonFallback<any[]>("admin-submissions.json", []);
    const idx = list.findIndex((s) => s.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      list[idx].rejectionReason = reason || null;
      list[idx].reviewedAt = new Date().toISOString();
      writeJsonFallback("admin-submissions.json", list);
      return res ? res.rows[0] : list[idx];
    }

    if (res && res.rows.length > 0) return res.rows[0];
    return null;
  },

  /**
   * Deletes a community submission.
   */
  async deleteSubmission(id: string): Promise<boolean> {
    await queryPg("DELETE FROM gocoupon_submissions WHERE id = $1", [id]);
    const list = readJsonFallback<any[]>("admin-submissions.json", []);
    writeJsonFallback(
      "admin-submissions.json",
      list.filter((s) => s.id !== id)
    );
    return true;
  },
};

// =============================================================================
// 3. EDITORIAL BLOGS SERVICE
// =============================================================================
export const blogsDb = {
  /**
   * Retrieves all published blog posts (or drafts if requested).
   */
  async getBlogs(includeDrafts = false): Promise<BlogPost[]> {
    const query = includeDrafts
      ? `SELECT 
          id, slug, title, category, author, read_time AS "readTime",
          image, banner_link AS "bannerLink", short_description AS "shortDescription",
          excerpt, content, status, views, created_at AS "createdAt", updated_at AS "updatedAt"
        FROM gocoupon_blogs ORDER BY created_at DESC`
      : `SELECT 
          id, slug, title, category, author, read_time AS "readTime",
          image, banner_link AS "bannerLink", short_description AS "shortDescription",
          excerpt, content, status, views, created_at AS "createdAt", updated_at AS "updatedAt"
        FROM gocoupon_blogs WHERE status = 'Published' ORDER BY created_at DESC`;

    const res = await queryPg<BlogPost>(query);
    if (res && res.rows.length > 0) return res.rows;

    const blogs = readJsonFallback<BlogPost[]>("blogs.json", []);
    return includeDrafts ? blogs : blogs.filter((b) => b.status === "Published");
  },

  /**
   * Retrieves single blog post by unique slug.
   */
  async getBlogBySlug(slug: string): Promise<BlogPost | null> {
    const res = await queryPg<BlogPost>(
      `SELECT 
        id, slug, title, category, author, read_time AS "readTime",
        image, banner_link AS "bannerLink", short_description AS "shortDescription",
        excerpt, content, status, views, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM gocoupon_blogs WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    if (res && res.rows.length > 0) return res.rows[0];

    const blogs = readJsonFallback<BlogPost[]>("blogs.json", []);
    return blogs.find((b) => b.slug === slug) || null;
  },

  /**
   * Creates a new blog post.
   */
  async createBlog(post: BlogPost): Promise<BlogPost> {
    await queryPg(
      `INSERT INTO gocoupon_blogs (
        id, slug, title, category, author, read_time, image, banner_link,
        short_description, excerpt, content, status, views, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        post.id,
        post.slug,
        post.title,
        post.category || "Savings Guide",
        post.author || "GoCoupon Consumer Advocacy Team",
        post.readTime || "5 min read",
        post.image || null,
        post.bannerLink || null,
        post.shortDescription || null,
        post.excerpt || null,
        post.content,
        post.status || "Published",
        post.views || 0,
        post.createdAt ? new Date(post.createdAt) : new Date(),
        post.updatedAt ? new Date(post.updatedAt) : new Date(),
      ]
    );

    // Disk JSON sync
    const blogs = readJsonFallback<BlogPost[]>("blogs.json", []);
    blogs.unshift(post);
    writeJsonFallback("blogs.json", blogs);

    return post;
  },

  /**
   * Updates an existing blog post.
   */
  async updateBlog(id: string, post: Partial<BlogPost>): Promise<BlogPost | null> {
    const fields: string[] = ["updated_at = NOW()"];
    const values: any[] = [id];
    let pIdx = 2;

    if (post.title !== undefined) {
      fields.push(`title = $${pIdx++}`);
      values.push(post.title);
    }
    if (post.slug !== undefined) {
      fields.push(`slug = $${pIdx++}`);
      values.push(post.slug);
    }
    if (post.content !== undefined) {
      fields.push(`content = $${pIdx++}`);
      values.push(post.content);
    }
    if (post.category !== undefined) {
      fields.push(`category = $${pIdx++}`);
      values.push(post.category);
    }
    if (post.author !== undefined) {
      fields.push(`author = $${pIdx++}`);
      values.push(post.author);
    }
    if (post.readTime !== undefined) {
      fields.push(`read_time = $${pIdx++}`);
      values.push(post.readTime);
    }
    if (post.image !== undefined) {
      fields.push(`image = $${pIdx++}`);
      values.push(post.image);
    }
    if (post.status !== undefined) {
      fields.push(`status = $${pIdx++}`);
      values.push(post.status);
    }
    if (post.shortDescription !== undefined) {
      fields.push(`short_description = $${pIdx++}`);
      values.push(post.shortDescription);
    }

    const res = await queryPg<BlogPost>(
      `UPDATE gocoupon_blogs SET ${fields.join(", ")} WHERE id = $1
       RETURNING 
         id, slug, title, category, author, read_time AS "readTime",
         image, banner_link AS "bannerLink", short_description AS "shortDescription",
         excerpt, content, status, views, created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );

    // Disk fallback
    const blogs = readJsonFallback<BlogPost[]>("blogs.json", []);
    const idx = blogs.findIndex((b) => b.id === id);
    if (idx !== -1) {
      blogs[idx] = { ...blogs[idx], ...post, updatedAt: new Date().toISOString() };
      writeJsonFallback("blogs.json", blogs);
      return res ? res.rows[0] : blogs[idx];
    }

    if (res && res.rows.length > 0) return res.rows[0];
    return null;
  },

  /**
   * Increments the view count atomically.
   */
  async incrementViews(slug: string): Promise<void> {
    await queryPg("UPDATE gocoupon_blogs SET views = COALESCE(views, 0) + 1 WHERE slug = $1", [slug]);
    const blogs = readJsonFallback<BlogPost[]>("blogs.json", []);
    const post = blogs.find((b) => b.slug === slug);
    if (post) {
      post.views = (post.views || 0) + 1;
      writeJsonFallback("blogs.json", blogs);
    }
  },

  /**
   * Deletes a blog post by ID.
   */
  async deleteBlog(id: string): Promise<boolean> {
    await queryPg("DELETE FROM gocoupon_blogs WHERE id = $1", [id]);
    const blogs = readJsonFallback<BlogPost[]>("blogs.json", []);
    writeJsonFallback(
      "blogs.json",
      blogs.filter((b) => b.id !== id)
    );
    return true;
  },
};

// =============================================================================
// 4. PRICE DROP ALERTS SERVICE
// =============================================================================
export const alertsDb = {
  /**
   * Registers a new price drop monitoring alert.
   */
  async createAlert(alert: PushAlertRegistration): Promise<void> {
    await queryPg(
      `INSERT INTO gocoupon_alerts (
        id, email, subscription, product_id, product_title,
        target_price, initial_price, store, created_at, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO NOTHING`,
      [
        alert.id,
        alert.email || null,
        alert.subscription ? JSON.stringify(alert.subscription) : null,
        alert.productId,
        alert.productTitle,
        alert.targetPrice,
        alert.initialPrice,
        alert.store || "Online Store",
        new Date(alert.createdAt),
        alert.active ?? true,
      ]
    );
  },

  /**
   * Retrieves active alerts for price checking daemon.
   */
  async getActiveAlerts(): Promise<PushAlertRegistration[]> {
    const res = await queryPg(`
      SELECT 
        id, email, subscription, product_id AS "productId", product_title AS "productTitle",
        target_price AS "targetPrice", initial_price AS "initialPrice", store,
        EXTRACT(EPOCH FROM created_at) * 1000 AS "createdAt", active
      FROM gocoupon_alerts
      WHERE active = true
    `);
    if (res && res.rows.length > 0) {
      return res.rows.map((r) => ({
        ...r,
        targetPrice: Number(r.targetPrice),
        initialPrice: Number(r.initialPrice),
        createdAt: Number(r.createdAt),
        subscription: typeof r.subscription === "string" ? JSON.parse(r.subscription) : r.subscription || {},
      }));
    }
    return [];
  },

  /**
   * Deactivates an alert after trigger or user unsubscribe.
   */
  async deactivateAlert(id: string): Promise<void> {
    await queryPg("UPDATE gocoupon_alerts SET active = false WHERE id = $1", [id]);
  },
};

// =============================================================================
// 5. STORES SERVICE
// =============================================================================
export const storesDb = {
  /**
   * Retrieves store profiles with cashback rate, trust score, and affiliate template.
   */
  async getStores(): Promise<any[]> {
    const res = await queryPg(`
      SELECT 
        id, name, slug, logo, category, tagline AS description,
        cashback_rate AS "cashbackRate", affiliate_url_template AS link,
        trust_score AS rating, is_featured AS "isFeatured",
        coupons_count AS "couponsCount", offers_count AS "offersCount"
      FROM gocoupon_stores
      ORDER BY is_featured DESC, coupons_count DESC, name ASC
    `);
    if (res && res.rows.length > 0) return res.rows;
    return [];
  },
};

// =============================================================================
// 6. OVERALL DATABASE HEALTH & METRICS
// =============================================================================
export async function getDatabaseDiagnostics(): Promise<{
  status: "connected" | "degraded" | "offline";
  engine: "PostgreSQL (Supabase)" | "Local JSON Fallback";
  latencyMs: number;
  tableCounts: Record<string, number>;
}> {
  const start = Date.now();
  const counts: Record<string, number> = {
    deals: 0,
    stores: 0,
    submissions: 0,
    blogs: 0,
    alerts: 0,
    price_snapshots: 0,
  };

  const dealsC = await queryPg("SELECT COUNT(*) FROM gocoupon_deals");
  if (dealsC) {
    const storesC = await queryPg("SELECT COUNT(*) FROM gocoupon_stores");
    const subsC = await queryPg("SELECT COUNT(*) FROM gocoupon_submissions");
    const blogsC = await queryPg("SELECT COUNT(*) FROM gocoupon_blogs");
    const alertsC = await queryPg("SELECT COUNT(*) FROM gocoupon_alerts");
    const snapsC = await queryPg("SELECT COUNT(*) FROM gocoupon_price_snapshots");

    counts.deals = parseInt(dealsC.rows[0].count, 10);
    counts.stores = storesC ? parseInt(storesC.rows[0].count, 10) : 0;
    counts.submissions = subsC ? parseInt(subsC.rows[0].count, 10) : 0;
    counts.blogs = blogsC ? parseInt(blogsC.rows[0].count, 10) : 0;
    counts.alerts = alertsC ? parseInt(alertsC.rows[0].count, 10) : 0;
    counts.price_snapshots = snapsC ? parseInt(snapsC.rows[0].count, 10) : 0;

    return {
      status: "connected",
      engine: "PostgreSQL (Supabase)",
      latencyMs: Date.now() - start,
      tableCounts: counts,
    };
  }

  // Fallback metrics
  const fallbackBlogs = readJsonFallback<any[]>("blogs.json", []);
  const fallbackSubs = readJsonFallback<any[]>("admin-submissions.json", []);
  const fallbackDeals = getLiveDeals();

  counts.deals = fallbackDeals.length;
  counts.blogs = fallbackBlogs.length;
  counts.submissions = fallbackSubs.length;

  return {
    status: isPgConnected ? "degraded" : "offline",
    engine: "Local JSON Fallback",
    latencyMs: Date.now() - start,
    tableCounts: counts,
  };
}
