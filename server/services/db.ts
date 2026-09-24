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
import { STORES_DB } from "../../src/lib/server-data/stores-db.js";
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
      .then(async () => {
        isPgConnected = true;
        console.log("⚡ [Database] Connected to PostgreSQL (Supabase) successfully.");
        // Ensure gocoupon_clicks table and indexes exist
        await pgPool?.query(`
          CREATE TABLE IF NOT EXISTS gocoupon_clicks (
            id TEXT PRIMARY KEY,
            deal_id TEXT NOT NULL,
            deal_title TEXT NOT NULL,
            store_name TEXT NOT NULL,
            store_slug TEXT,
            coupon_code TEXT,
            destination_url TEXT NOT NULL,
            source TEXT DEFAULT 'offers',
            device TEXT,
            ip TEXT,
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS idx_clicks_deal_id ON gocoupon_clicks(deal_id);
          CREATE INDEX IF NOT EXISTS idx_clicks_store_name ON gocoupon_clicks(store_name);
          CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON gocoupon_clicks(created_at DESC);
          ALTER TABLE gocoupon_clicks ENABLE ROW LEVEL SECURITY;
        `).catch((e) => console.warn("[Database] Could not verify gocoupon_clicks table:", e.message));

        // Ensure gocoupon_deals table has columns for featured deals and admin immunity
        await pgPool?.query(`
          ALTER TABLE gocoupon_deals ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
          ALTER TABLE gocoupon_deals ADD COLUMN IF NOT EXISTS featured_priority INTEGER DEFAULT 100;
          ALTER TABLE gocoupon_deals ADD COLUMN IF NOT EXISTS campaign_source TEXT DEFAULT 'manual';
          ALTER TABLE gocoupon_deals ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'verified';
          CREATE INDEX IF NOT EXISTS idx_deals_is_featured ON gocoupon_deals(is_featured);
        `).catch((e) => console.warn("[Database] Could not verify gocoupon_deals featured columns:", e.message));

        // Hydrate live deals pool from Supabase PostgreSQL to prevent any loss across deployments
        pgPool
          ?.query(`
            SELECT 
              id, store_name AS "storeName", store_slug AS "storeSlug", store_logo AS "storeLogo",
              title, code, discount, category, badge, verified, verified_date AS "verifiedDate",
              expires_in AS "expiresIn", end_date AS "endDate", min_order AS "minOrder",
              terms, link, uses_count AS "usesCount", rating, votes_count AS "votesCount",
              source, status, type,
              COALESCE(is_featured, false) AS "isFeatured",
              COALESCE(featured_priority, 100) AS "featuredPriority",
              COALESCE(campaign_source, 'manual') AS "campaignSource",
              COALESCE(verification_status, 'verified') AS "verificationStatus"
            FROM gocoupon_deals
            WHERE status = 'active' AND (
              is_featured = true OR 
              source = 'admin' OR 
              campaign_source = 'manual' OR 
              id LIKE 'ac-%' OR 
              id LIKE 'offer-%' OR 
              id LIKE 'admin-%' OR 
              end_date IS NULL OR 
              end_date > NOW()
            )
          `)
          .then((res) => {
            if (res && res.rows.length > 0) {
              console.log(`📦 [Database] Hydrated ${res.rows.length} verified deals from Supabase PostgreSQL into live pool.`);
              const current = getLiveDeals();
              const cloudIds = new Set(res.rows.map((r: any) => String(r.id)));
              const merged = [...res.rows, ...current.filter((d: any) => !cloudIds.has(String(d.id)))];
              setLiveDeals(merged);
            }
          })
          .catch((e) => console.warn("[Database] Could not hydrate cloud deals:", e.message));

        // Hydrate stores from Supabase PostgreSQL into STORES_DB
        pgPool
          ?.query(`
            SELECT 
              id, name, slug, logo, category, tagline AS description,
              cashback_rate AS "cashbackRate", affiliate_url_template AS link,
              trust_score AS rating, is_featured AS "isFeatured",
              coupons_count AS "couponsCount", offers_count AS "offersCount"
            FROM gocoupon_stores
          `)
          .then((res) => {
            if (res && res.rows.length > 0) {
              console.log(`🏢 [Database] Hydrated ${res.rows.length} stores from Supabase PostgreSQL.`);
              for (const s of res.rows) {
                const idx = STORES_DB.findIndex((cur) => cur.slug === s.slug || cur.id === s.id);
                if (idx >= 0) {
                  STORES_DB[idx] = { ...STORES_DB[idx], ...s };
                } else {
                  STORES_DB.unshift({
                    id: s.id,
                    name: s.name,
                    slug: s.slug,
                    category: s.category || "General",
                    logo: s.logo,
                    fallbackIcon: "🛍️",
                    rating: Number(s.rating) || 4.8,
                    couponsCount: Number(s.couponsCount) || 0,
                    maxDiscount: "Special Offer",
                    cashbackRate: s.cashbackRate || "Available",
                    description: s.description || "",
                    features: [],
                    popularCoupon: { code: "", description: "Latest offers", discount: "Verified Deal" },
                    link: s.link || "",
                  });
                }
              }
            }
          })
          .catch((e) => console.warn("[Database] Could not hydrate stores:", e.message));

        // Hydrate admin users from Supabase PostgreSQL into local fallback
        pgPool
          ?.query(`
            SELECT 
              id, name, email, password_hash AS "passwordHash", role,
              permissions, is_active AS "isActive",
              created_at AS "createdAt", updated_at AS "updatedAt"
            FROM gocoupon_admin_users
            ORDER BY created_at ASC
          `)
          .then((res) => {
            if (res && res.rows.length > 0) {
              console.log(`👤 [Database] Hydrated ${res.rows.length} admin user(s) from Supabase PostgreSQL.`);
              const users = res.rows.map((r) => ({
                ...r,
                permissions: typeof r.permissions === "string" ? JSON.parse(r.permissions) : r.permissions || [],
              }));
              writeJsonFallback("admin-users.json", users);
            }
          })
          .catch((e) => console.warn("[Database] Could not hydrate admin users:", e.message));

        // Hydrate settings from Supabase PostgreSQL into local fallbacks
        pgPool
          ?.query("SELECT key, value FROM gocoupon_settings")
          .then((res) => {
            if (res && res.rows.length > 0) {
              console.log(`⚙️ [Database] Hydrated ${res.rows.length} settings records from Supabase PostgreSQL.`);
              for (const row of res.rows) {
                writeJsonFallback(`admin-${row.key}.json`, row.value);
              }
            }
          })
          .catch((e) => console.warn("[Database] Could not hydrate settings:", e.message));
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
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<DealRecord[]> {
    const conditions: string[] = [
      "status = 'active'",
      "(is_featured = true OR source = 'admin' OR campaign_source = 'manual' OR id LIKE 'ac-%' OR id LIKE 'offer-%' OR id LIKE 'admin-%' OR end_date IS NULL OR end_date > NOW())"
    ];
    const params: any[] = [];
    let pIdx = 1;

    if (options?.featured !== undefined) {
      if (options.featured) {
        conditions.push("(is_featured = true OR id LIKE 'ac-%')");
      } else {
        conditions.push("(is_featured = false AND id NOT LIKE 'ac-%')");
      }
    }

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
        source, status, type,
        COALESCE(is_featured, false) AS "isFeatured",
        COALESCE(featured_priority, 100) AS "featuredPriority",
        COALESCE(campaign_source, 'manual') AS "campaignSource",
        COALESCE(verification_status, 'verified') AS "verificationStatus"
      FROM gocoupon_deals
      WHERE ${conditions.join(" AND ")}
      ORDER BY is_featured DESC, featured_priority ASC, verified DESC, uses_count DESC, created_at DESC
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
    if (options?.featured !== undefined) {
      deals = deals.filter((d) =>
        options.featured
          ? Boolean(d.isFeatured) || String(d.id).startsWith("ac-")
          : !Boolean(d.isFeatured) && !String(d.id).startsWith("ac-")
      );
    }
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
        source, status, type,
        COALESCE(is_featured, false) AS "isFeatured",
        COALESCE(featured_priority, 100) AS "featuredPriority",
        COALESCE(campaign_source, 'manual') AS "campaignSource",
        COALESCE(verification_status, 'verified') AS "verificationStatus"
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
            const offset = idx * 26;
            rowPlaceholders.push(`(${Array.from({ length: 26 }, (_, k) => `$${offset + k + 1}`).join(", ")})`);

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
              d.type || "coupon",
              Boolean(d.isFeatured),
              d.featuredPriority ? Number(d.featuredPriority) : 100,
              d.campaignSource || "manual",
              d.verificationStatus || "verified"
            );
          });

          const query = `
            INSERT INTO gocoupon_deals (
              id, store_name, store_slug, store_logo, title, code, discount, category,
              badge, verified, verified_date, expires_in, end_date, min_order, terms,
              link, uses_count, rating, votes_count, source, status, type,
              is_featured, featured_priority, campaign_source, verification_status
            ) VALUES ${rowPlaceholders.join(",\n")}
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              code = EXCLUDED.code,
              discount = EXCLUDED.discount,
              uses_count = EXCLUDED.uses_count,
              verified = EXCLUDED.verified,
              is_featured = EXCLUDED.is_featured,
              featured_priority = EXCLUDED.featured_priority,
              campaign_source = EXCLUDED.campaign_source,
              verification_status = EXCLUDED.verification_status,
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
    data: Omit<UserCouponSubmission, "id" | "submittedAt" | "status"> & { id?: string }
  ): Promise<UserCouponSubmission> {
    const id = data.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
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
        id, name, slug, domain, logo, category, tagline AS description,
        cashback_rate AS "cashbackRate", affiliate_url_template AS link,
        trust_score AS rating, is_featured AS "isFeatured",
        coupons_count AS "couponsCount", offers_count AS "offersCount"
      FROM gocoupon_stores
      ORDER BY is_featured DESC, coupons_count DESC, name ASC
    `);
    if (res && res.rows.length > 0) return res.rows;
    return [];
  },

  /**
   * Retrieves a single store by slug.
   */
  async getStoreBySlug(slug: string): Promise<any | null> {
    const res = await queryPg(
      `SELECT 
        id, name, slug, domain, logo, category, tagline AS description,
        cashback_rate AS "cashbackRate", affiliate_url_template AS link,
        trust_score AS rating, is_featured AS "isFeatured",
        coupons_count AS "couponsCount", offers_count AS "offersCount"
      FROM gocoupon_stores WHERE slug = $1 LIMIT 1`,
      [slug.toLowerCase()]
    );
    if (res && res.rows.length > 0) return res.rows[0];
    return null;
  },

  /**
   * Upserts a store into Supabase PostgreSQL gocoupon_stores.
   */
  async upsertStore(store: any): Promise<any> {
    const slug = (store.slug || store.name || "store").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const id = store.id || slug;
    const name = store.name || "Merchant Store";
    const logo = store.logo || store.logoImage || null;
    const category = store.category || "General";
    const description = store.description || store.tagline || "";
    const cashbackRate = store.cashbackRate || "Available";
    const link = store.link || store.affiliateLink || store.affiliate_url_template || "";
    const rating = Number(store.rating || store.trust_score || 4.8);
    const isFeatured = store.isFeatured === true || store.is_featured === true;
    const couponsCount = Number(store.couponsCount || store.coupons_count || 0);
    const offersCount = Number(store.offersCount || store.offers_count || 0);

    await queryPg(`
      INSERT INTO gocoupon_stores (
        id, name, slug, domain, logo, category, tagline, cashback_rate,
        affiliate_url_template, trust_score, is_featured, coupons_count, offers_count, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        logo = COALESCE(EXCLUDED.logo, gocoupon_stores.logo),
        category = EXCLUDED.category,
        tagline = EXCLUDED.tagline,
        cashback_rate = EXCLUDED.cashback_rate,
        affiliate_url_template = EXCLUDED.affiliate_url_template,
        trust_score = EXCLUDED.trust_score,
        is_featured = EXCLUDED.is_featured,
        updated_at = NOW();
    `, [
      id, name, slug, store.domain || null, logo, category, description,
      cashbackRate, link, rating, isFeatured, couponsCount, offersCount
    ]);

    return { ...store, id, slug, name, logo, category, description, link };
  },

  /**
   * Batch upserts stores into Supabase PostgreSQL.
   */
  async upsertStores(stores: any[]): Promise<number> {
    let count = 0;
    for (const s of stores) {
      await this.upsertStore(s).catch((err) => console.warn(`[storesDb] Could not upsert store ${s.name}:`, err.message));
      count++;
    }
    return count;
  },

  /**
   * Deletes a store by slug or ID from Supabase PostgreSQL.
   */
  async deleteStore(slugOrId: string): Promise<boolean> {
    const slug = slugOrId.toLowerCase();
    await queryPg("DELETE FROM gocoupon_stores WHERE slug = $1 OR id = $1", [slug]);
    return true;
  },
};

// =============================================================================
// 6. DEAL CLICKS & CONVERSION TRACKING SERVICE
// =============================================================================
export interface DealClickRecord {
  id: string;
  dealId: string;
  dealTitle: string;
  storeName: string;
  storeSlug?: string;
  couponCode?: string;
  destinationUrl: string;
  source?: string;
  device?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export const clicksDb = {
  /**
   * Records a user click on an offer/coupon and updates deal uses count.
   */
  async recordClick(click: Omit<DealClickRecord, "id" | "createdAt"> & { id?: string; createdAt?: string }): Promise<DealClickRecord> {
    const record: DealClickRecord = {
      id: click.id || `clk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      dealId: click.dealId || "unknown",
      dealTitle: click.dealTitle || "Exclusive Offer",
      storeName: click.storeName || "Partner Store",
      storeSlug: click.storeSlug || "",
      couponCode: click.couponCode || "",
      destinationUrl: click.destinationUrl,
      source: click.source || "offers",
      device: click.device || "desktop",
      ip: click.ip || "",
      userAgent: click.userAgent || "",
      createdAt: click.createdAt || new Date().toISOString(),
    };

    // 1. Try PostgreSQL insertion
    await queryPg(`
      INSERT INTO gocoupon_clicks (
        id, deal_id, deal_title, store_name, store_slug,
        coupon_code, destination_url, source, device, ip, user_agent, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      record.id, record.dealId, record.dealTitle, record.storeName, record.storeSlug,
      record.couponCode, record.destinationUrl, record.source, record.device,
      record.ip, record.userAgent, record.createdAt
    ]);

    // Increment uses_count in gocoupon_deals if deal exists
    if (record.dealId && record.dealId !== "unknown") {
      await queryPg(
        "UPDATE gocoupon_deals SET uses_count = COALESCE(uses_count, 0) + 1 WHERE id = $1",
        [record.dealId]
      ).catch(() => {});
    }

    // 2. Resilient local disk sync
    try {
      const clicks = readJsonFallback<DealClickRecord[]>("admin-clicks.json", []);
      clicks.unshift(record);
      if (clicks.length > 5000) clicks.length = 5000;
      writeJsonFallback("admin-clicks.json", clicks);
    } catch (e: any) {
      console.warn("[clicksDb] Disk write error:", e?.message);
    }

    return record;
  },

  /**
   * Retrieves aggregated click analytics, top deals, and recent click events.
   */
  async getClickAnalytics(): Promise<{
    totalClicksToday: number;
    totalClicks7d: number;
    totalClicks30d: number;
    totalClicksAllTime: number;
    topDeals: Array<{
      dealId: string;
      dealTitle: string;
      storeName: string;
      couponCode: string;
      clickCount: number;
      lastClickedAt: string;
    }>;
    topStores: Array<{
      storeName: string;
      clickCount: number;
    }>;
    recentClicks: DealClickRecord[];
    clicksByDay: Array<{ date: string; clicks: number }>;
  }> {
    // 1. Try PostgreSQL aggregation first
    const pgRes = await queryPg(`
      SELECT 
        COUNT(*) AS total_all_time,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) AS total_today,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS total_7d,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS total_30d
      FROM gocoupon_clicks
    `);

    if (pgRes && pgRes.rows.length > 0) {
      const topDealsRes = await queryPg(`
        SELECT 
          deal_id AS "dealId",
          deal_title AS "dealTitle",
          store_name AS "storeName",
          coupon_code AS "couponCode",
          COUNT(*) AS "clickCount",
          MAX(created_at) AS "lastClickedAt"
        FROM gocoupon_clicks
        GROUP BY deal_id, deal_title, store_name, coupon_code
        ORDER BY "clickCount" DESC
        LIMIT 25
      `);

      const topStoresRes = await queryPg(`
        SELECT store_name AS "storeName", COUNT(*) AS "clickCount"
        FROM gocoupon_clicks
        GROUP BY store_name
        ORDER BY "clickCount" DESC
        LIMIT 10
      `);

      const recentRes = await queryPg(`
        SELECT 
          id, deal_id AS "dealId", deal_title AS "dealTitle",
          store_name AS "storeName", store_slug AS "storeSlug",
          coupon_code AS "couponCode", destination_url AS "destinationUrl",
          source, device, ip, user_agent AS "userAgent", created_at AS "createdAt"
        FROM gocoupon_clicks
        ORDER BY created_at DESC
        LIMIT 50
      `);

      const dailyRes = await queryPg(`
        SELECT 
          TO_CHAR(created_at, 'YYYY-MM-DD') AS date,
          COUNT(*) AS clicks
        FROM gocoupon_clicks
        WHERE created_at >= NOW() - INTERVAL '14 days'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
        ORDER BY date ASC
      `);

      const r = pgRes.rows[0];
      return {
        totalClicksToday: Number(r.total_today) || 0,
        totalClicks7d: Number(r.total_7d) || 0,
        totalClicks30d: Number(r.total_30d) || 0,
        totalClicksAllTime: Number(r.total_all_time) || 0,
        topDeals: (topDealsRes?.rows || []).map((d) => ({
          ...d,
          clickCount: Number(d.clickCount),
        })),
        topStores: (topStoresRes?.rows || []).map((s) => ({
          ...s,
          clickCount: Number(s.clickCount),
        })),
        recentClicks: recentRes?.rows || [],
        clicksByDay: (dailyRes?.rows || []).map((d) => ({
          date: d.date,
          clicks: Number(d.clicks),
        })),
      };
    }

    // 2. Fallback to local JSON disk data
    const clicks = readJsonFallback<DealClickRecord[]>("admin-clicks.json", []);
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    let today = 0;
    let past7d = 0;
    let past30d = 0;

    const dealMap: Record<string, { dealId: string; dealTitle: string; storeName: string; couponCode: string; clickCount: number; lastClickedAt: string }> = {};
    const storeMap: Record<string, number> = {};
    const dayMap: Record<string, number> = {};

    for (const c of clicks) {
      const time = new Date(c.createdAt).getTime();
      if (time >= oneDayAgo) today++;
      if (time >= sevenDaysAgo) past7d++;
      if (time >= thirtyDaysAgo) past30d++;

      const dKey = c.dealId || c.dealTitle;
      if (!dealMap[dKey]) {
        dealMap[dKey] = {
          dealId: c.dealId,
          dealTitle: c.dealTitle,
          storeName: c.storeName,
          couponCode: c.couponCode || "",
          clickCount: 0,
          lastClickedAt: c.createdAt,
        };
      }
      dealMap[dKey].clickCount++;

      const sKey = c.storeName || "Unknown";
      storeMap[sKey] = (storeMap[sKey] || 0) + 1;

      const dayStr = c.createdAt ? c.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
      dayMap[dayStr] = (dayMap[dayStr] || 0) + 1;
    }

    const topDeals = Object.values(dealMap).sort((a, b) => b.clickCount - a.clickCount).slice(0, 25);
    const topStores = Object.entries(storeMap)
      .map(([storeName, clickCount]) => ({ storeName, clickCount }))
      .sort((a, b) => b.clickCount - a.clickCount)
      .slice(0, 10);

    const clicksByDay = Object.entries(dayMap)
      .map(([date, clicks]) => ({ date, clicks }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);

    return {
      totalClicksToday: today,
      totalClicks7d: past7d,
      totalClicks30d: past30d,
      totalClicksAllTime: clicks.length,
      topDeals,
      topStores,
      recentClicks: clicks.slice(0, 50),
      clicksByDay,
    };
  },

  /**
   * Retrieves click count for a specific deal ID.
   */
  async getClicksForDeal(dealId: string): Promise<number> {
    const res = await queryPg("SELECT COUNT(*) FROM gocoupon_clicks WHERE deal_id = $1", [dealId]);
    if (res && res.rows.length > 0) {
      return parseInt(res.rows[0].count, 10);
    }
    const clicks = readJsonFallback<DealClickRecord[]>("admin-clicks.json", []);
    return clicks.filter((c) => c.dealId === dealId).length;
  },

  /**
   * Returns a dictionary of dealId -> clickCount for fast bulk lookup.
   */
  async getAllDealClickCounts(): Promise<Record<string, number>> {
    const res = await queryPg("SELECT deal_id, COUNT(*) as count FROM gocoupon_clicks GROUP BY deal_id");
    const counts: Record<string, number> = {};
    if (res && res.rows.length > 0) {
      for (const r of res.rows) {
        counts[r.deal_id] = parseInt(r.count, 10);
      }
      return counts;
    }
    const clicks = readJsonFallback<DealClickRecord[]>("admin-clicks.json", []);
    for (const c of clicks) {
      if (c.dealId) {
        counts[c.dealId] = (counts[c.dealId] || 0) + 1;
      }
    }
    return counts;
  },
};

// =============================================================================
// 7. ADMIN USERS DATABASE SERVICE
// =============================================================================
export interface StoredAdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: "admin" | "editor" | "viewer";
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const adminUsersDb = {
  /**
   * Retrieves all registered admin users.
   */
  async getUsers(): Promise<StoredAdminUser[]> {
    const res = await queryPg<any>(`
      SELECT 
        id, name, email, password_hash AS "passwordHash", role,
        permissions, is_active AS "isActive",
        created_at AS "createdAt", updated_at AS "updatedAt"
      FROM gocoupon_admin_users
      ORDER BY created_at ASC
    `);
    if (res && res.rows.length > 0) {
      const users: StoredAdminUser[] = res.rows.map((r) => ({
        ...r,
        permissions: typeof r.permissions === "string" ? JSON.parse(r.permissions) : r.permissions || [],
      }));
      writeJsonFallback("admin-users.json", users);
      return users;
    }
    return readJsonFallback<StoredAdminUser[]>("admin-users.json", []);
  },

  /**
   * Retrieves an admin user by email (for authentication).
   */
  async getUserByEmail(email: string): Promise<StoredAdminUser | null> {
    const cleanEmail = email.toLowerCase().trim();
    const res = await queryPg<any>(
      `SELECT 
        id, name, email, password_hash AS "passwordHash", role,
        permissions, is_active AS "isActive",
        created_at AS "createdAt", updated_at AS "updatedAt"
      FROM gocoupon_admin_users
      WHERE LOWER(email) = $1
      LIMIT 1`,
      [cleanEmail]
    );

    if (res && res.rows.length > 0) {
      const r = res.rows[0];
      return {
        ...r,
        permissions: typeof r.permissions === "string" ? JSON.parse(r.permissions) : r.permissions || [],
      };
    }
    const local = readJsonFallback<StoredAdminUser[]>("admin-users.json", []);
    return local.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  /**
   * Retrieves an admin user by ID.
   */
  async getUserById(id: string): Promise<StoredAdminUser | null> {
    const res = await queryPg<any>(
      `SELECT 
        id, name, email, password_hash AS "passwordHash", role,
        permissions, is_active AS "isActive",
        created_at AS "createdAt", updated_at AS "updatedAt"
      FROM gocoupon_admin_users
      WHERE id = $1
      LIMIT 1`,
      [id]
    );

    if (res && res.rows.length > 0) {
      const r = res.rows[0];
      return {
        ...r,
        permissions: typeof r.permissions === "string" ? JSON.parse(r.permissions) : r.permissions || [],
      };
    }
    const local = readJsonFallback<StoredAdminUser[]>("admin-users.json", []);
    return local.find((u) => u.id === id) || null;
  },

  /**
   * Creates a new admin user in PostgreSQL and local fallback.
   */
  async createUser(user: StoredAdminUser): Promise<StoredAdminUser> {
    await queryPg(
      `INSERT INTO gocoupon_admin_users (
        id, name, email, password_hash, role, permissions, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        permissions = EXCLUDED.permissions,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()`,
      [
        user.id,
        user.name,
        user.email.toLowerCase().trim(),
        user.passwordHash || "",
        user.role || "editor",
        JSON.stringify(user.permissions || []),
        user.isActive ?? true,
        user.createdAt ? new Date(user.createdAt) : new Date(),
      ]
    );

    const users = readJsonFallback<StoredAdminUser[]>("admin-users.json", []);
    const idx = users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    writeJsonFallback("admin-users.json", users);
    return user;
  },

  /**
   * Updates an admin user in PostgreSQL and local fallback.
   */
  async updateUser(id: string, updates: Partial<StoredAdminUser>): Promise<StoredAdminUser | null> {
    const fields: string[] = ["updated_at = NOW()"];
    const values: any[] = [id];
    let pIdx = 2;

    if (updates.name !== undefined) {
      fields.push(`name = $${pIdx++}`);
      values.push(updates.name);
    }
    if (updates.email !== undefined) {
      fields.push(`email = $${pIdx++}`);
      values.push(updates.email.toLowerCase().trim());
    }
    if (updates.passwordHash !== undefined) {
      fields.push(`password_hash = $${pIdx++}`);
      values.push(updates.passwordHash);
    }
    if (updates.role !== undefined) {
      fields.push(`role = $${pIdx++}`);
      values.push(updates.role);
    }
    if (updates.permissions !== undefined) {
      fields.push(`permissions = $${pIdx++}`);
      values.push(JSON.stringify(updates.permissions));
    }
    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${pIdx++}`);
      values.push(updates.isActive);
    }

    const res = await queryPg<any>(
      `UPDATE gocoupon_admin_users
      SET ${fields.join(", ")}
      WHERE id = $1
      RETURNING 
        id, name, email, password_hash AS "passwordHash", role,
        permissions, is_active AS "isActive",
        created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );

    const users = readJsonFallback<StoredAdminUser[]>("admin-users.json", []);
    const idx = users.findIndex((u) => u.id === id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
      writeJsonFallback("admin-users.json", users);
      return users[idx];
    }
    if (res && res.rows.length > 0) return res.rows[0];
    return null;
  },

  /**
   * Deletes an admin user by ID.
   */
  async deleteUser(id: string): Promise<boolean> {
    await queryPg("DELETE FROM gocoupon_admin_users WHERE id = $1", [id]);
    const users = readJsonFallback<StoredAdminUser[]>("admin-users.json", []);
    writeJsonFallback(
      "admin-users.json",
      users.filter((u) => u.id !== id)
    );
    return true;
  },
};

// =============================================================================
// 8. SITE SETTINGS & CONFIGURATION SERVICE
// =============================================================================
export const settingsDb = {
  /**
   * Retrieves a configuration setting by key.
   */
  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    const res = await queryPg(
      "SELECT value FROM gocoupon_settings WHERE key = $1 LIMIT 1",
      [key]
    );
    if (res && res.rows.length > 0) {
      const val = res.rows[0].value;
      writeJsonFallback(`admin-${key}.json`, val);
      return val as T;
    }
    return readJsonFallback<T>(`admin-${key}.json`, defaultValue);
  },

  /**
   * Saves a configuration setting to PostgreSQL and local disk fallback.
   */
  async setSetting<T>(key: string, value: T): Promise<T> {
    await queryPg(
      `INSERT INTO gocoupon_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET
         value = EXCLUDED.value,
         updated_at = NOW()`,
      [key, JSON.stringify(value)]
    );
    writeJsonFallback(`admin-${key}.json`, value);
    return value;
  },
};

// =============================================================================
// 9. OVERALL DATABASE HEALTH & METRICS
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
    clicks: 0,
    admin_users: 0,
    settings: 0,
  };

  const dealsC = await queryPg("SELECT COUNT(*) FROM gocoupon_deals");
  if (dealsC) {
    const storesC = await queryPg("SELECT COUNT(*) FROM gocoupon_stores");
    const subsC = await queryPg("SELECT COUNT(*) FROM gocoupon_submissions");
    const blogsC = await queryPg("SELECT COUNT(*) FROM gocoupon_blogs");
    const alertsC = await queryPg("SELECT COUNT(*) FROM gocoupon_alerts");
    const snapsC = await queryPg("SELECT COUNT(*) FROM gocoupon_price_snapshots");
    const clicksC = await queryPg("SELECT COUNT(*) FROM gocoupon_clicks");
    const usersC = await queryPg("SELECT COUNT(*) FROM gocoupon_admin_users");
    const settingsC = await queryPg("SELECT COUNT(*) FROM gocoupon_settings");

    counts.deals = parseInt(dealsC.rows[0].count, 10);
    counts.stores = storesC ? parseInt(storesC.rows[0].count, 10) : 0;
    counts.submissions = subsC ? parseInt(subsC.rows[0].count, 10) : 0;
    counts.blogs = blogsC ? parseInt(blogsC.rows[0].count, 10) : 0;
    counts.alerts = alertsC ? parseInt(alertsC.rows[0].count, 10) : 0;
    counts.price_snapshots = snapsC ? parseInt(snapsC.rows[0].count, 10) : 0;
    counts.clicks = clicksC ? parseInt(clicksC.rows[0].count, 10) : 0;
    counts.admin_users = usersC ? parseInt(usersC.rows[0].count, 10) : 0;
    counts.settings = settingsC ? parseInt(settingsC.rows[0].count, 10) : 0;

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
  const fallbackClicks = readJsonFallback<any[]>("admin-clicks.json", []);
  const fallbackUsers = readJsonFallback<any[]>("admin-users.json", []);

  counts.deals = fallbackDeals.length;
  counts.blogs = fallbackBlogs.length;
  counts.submissions = fallbackSubs.length;
  counts.clicks = fallbackClicks.length;
  counts.admin_users = fallbackUsers.length;

  return {
    status: isPgConnected ? "degraded" : "offline",
    engine: "Local JSON Fallback",
    latencyMs: Date.now() - start,
    tableCounts: counts,
  };
}
