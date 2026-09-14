/**
 * @file scripts/migrate-db.ts
 * @description Database Migration and Baseline Seed Runner for GoCoupon PostgreSQL.
 *
 * Runs the schema DDL against PostgreSQL (Supabase) and populates initial tables
 * from existing baseline files (blogs.json, live-deals.json, admin-submissions.json).
 */

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL environment variable is not defined in .env");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  console.log("🚀 Connecting to PostgreSQL Database...");
  const client = await pool.connect();

  try {
    console.log("📄 Reading server/data/schema.sql...");
    const schemaSql = fs.readFileSync(path.join(ROOT_DIR, "server", "data", "schema.sql"), "utf-8");

    console.log("⚙️  Applying Schema DDL to Database...");
    await client.query(schemaSql);
    console.log("✅ Schema DDL applied successfully!");

    // -------------------------------------------------------------------------
    // 1. Seed Blogs
    // -------------------------------------------------------------------------
    const blogsPath = path.join(ROOT_DIR, "server", "data", "blogs.json");
    if (fs.existsSync(blogsPath)) {
      const blogs = JSON.parse(fs.readFileSync(blogsPath, "utf-8"));
      if (Array.isArray(blogs) && blogs.length > 0) {
        console.log(`📦 Seeding ${blogs.length} editorial blogs...`);
        for (const b of blogs) {
          await client.query(
            `INSERT INTO gocoupon_blogs (
              id, slug, title, category, author, read_time, image, banner_link,
              short_description, excerpt, content, status, views, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            ON CONFLICT (slug) DO UPDATE SET
              title = EXCLUDED.title,
              content = EXCLUDED.content,
              category = EXCLUDED.category,
              updated_at = NOW();`,
            [
              b.id || `blog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              b.slug,
              b.title,
              b.category || "Savings Guide",
              b.author || "GoCoupon Consumer Advocacy Team",
              b.readTime || "5 min read",
              b.image || null,
              b.bannerLink || null,
              b.shortDescription || null,
              b.excerpt || null,
              b.content || "",
              b.status || "Published",
              b.views || 0,
              b.createdAt ? new Date(b.createdAt) : new Date(),
              b.updatedAt ? new Date(b.updatedAt) : new Date(),
            ]
          );
        }
        console.log("✅ Blogs seeded successfully!");
      }
    }

    // -------------------------------------------------------------------------
    // 2. Seed Community Submissions
    // -------------------------------------------------------------------------
    const submissionsPath = path.join(ROOT_DIR, "server", "data", "admin-submissions.json");
    if (fs.existsSync(submissionsPath)) {
      const submissions = JSON.parse(fs.readFileSync(submissionsPath, "utf-8"));
      if (Array.isArray(submissions) && submissions.length > 0) {
        console.log(`📦 Seeding ${submissions.length} user submissions...`);
        for (const s of submissions) {
          await client.query(
            `INSERT INTO gocoupon_submissions (
              id, store_name, code, discount, category, url, terms, email, status,
              rejection_reason, submitted_at, reviewed_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (id) DO UPDATE SET
              status = EXCLUDED.status,
              rejection_reason = EXCLUDED.rejection_reason;`,
            [
              s.id,
              s.storeName || s.store_name || "Online Store",
              s.code,
              s.discount || null,
              s.category || "General",
              s.url || null,
              s.terms || null,
              s.email || null,
              s.status || "pending",
              s.rejectionReason || s.rejection_reason || null,
              s.submittedAt ? new Date(s.submittedAt) : new Date(),
              s.reviewedAt ? new Date(s.reviewedAt) : null,
            ]
          );
        }
        console.log("✅ Submissions seeded successfully!");
      }
    }

    // -------------------------------------------------------------------------
    // 3. Seed Live Deals (Batched for High-Performance Network Insertion)
    // -------------------------------------------------------------------------
    const liveDealsPath = path.join(ROOT_DIR, "src", "data", "live-deals.json");
    if (fs.existsSync(liveDealsPath)) {
      const liveData = JSON.parse(fs.readFileSync(liveDealsPath, "utf-8"));
      const deals = liveData.deals || [];
      if (Array.isArray(deals) && deals.length > 0) {
        console.log(`📦 Seeding ${deals.length} verified deals into PostgreSQL in batches...`);
        const BATCH_SIZE = 50;
        for (let i = 0; i < deals.length; i += BATCH_SIZE) {
          const batch = deals.slice(i, i + BATCH_SIZE);
          const values: any[] = [];
          const rowPlaceholders: string[] = [];

          batch.forEach((d: any, rowIdx: number) => {
            const offset = rowIdx * 22;
            const placeholders = Array.from({ length: 22 }, (_, k) => `$${offset + k + 1}`).join(", ");
            rowPlaceholders.push(`(${placeholders})`);

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

          await client.query(query, values);
          process.stdout.write(`   ↳ Seeded deals ${Math.min(i + BATCH_SIZE, deals.length)} / ${deals.length}\r`);
        }
        console.log("\n✅ Live deals seeded successfully!");
      }
    }

    // -------------------------------------------------------------------------
    // 4. Seed Stores
    // -------------------------------------------------------------------------
    try {
      const storesDbModule = await import("../src/lib/server-data/stores-db.js");
      const stores = storesDbModule.STORES_DB || [];
      if (Array.isArray(stores) && stores.length > 0) {
        console.log(`📦 Seeding ${stores.length} store profiles into PostgreSQL...`);
        for (const s of stores) {
          await client.query(
            `INSERT INTO gocoupon_stores (
              id, name, slug, logo, category, tagline, cashback_rate,
              affiliate_url_template, trust_score, is_featured, coupons_count, offers_count
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (slug) DO UPDATE SET
              name = EXCLUDED.name,
              logo = EXCLUDED.logo,
              category = EXCLUDED.category,
              cashback_rate = EXCLUDED.cashback_rate,
              updated_at = NOW();`,
            [
              s.id || `store-${s.slug}`,
              s.name,
              s.slug,
              s.logo || null,
              s.category || "General",
              s.description || null,
              s.cashbackRate || null,
              s.link || null,
              s.rating || 4.8,
              Boolean(s.badge),
              s.couponsCount || 0,
              10,
            ]
          );
        }
        console.log("✅ Stores seeded successfully!");
      }
    } catch (e: any) {
      console.warn("Stores seed notice:", e.message);
    }

    // -------------------------------------------------------------------------
    // 4. Verify Record Counts in Database
    // -------------------------------------------------------------------------
    console.log("\n📊 Verification of Database Tables:");
    const tables = [
      "gocoupon_deals",
      "gocoupon_stores",
      "gocoupon_submissions",
      "gocoupon_blogs",
      "gocoupon_alerts",
      "gocoupon_price_snapshots",
    ];

    for (const tbl of tables) {
      const countRes = await client.query(`SELECT COUNT(*) FROM ${tbl}`);
      console.log(`   - ${tbl}: ${countRes.rows[0].count} records`);
    }

    console.log("\n🎉 Database migration and seeding finished successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
