/**
 * @file scripts/migrate-cloud-schema.mjs
 * @description Applies missing RLS policies, creates admin users and settings tables in Supabase.
 */

import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in environment.");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    console.log("Connecting to Supabase PostgreSQL...");

    // 1. Missing Public price snapshots insert policy
    console.log("Applying missing RLS policies on gocoupon_price_snapshots...");
    await pool.query(`
      DROP POLICY IF EXISTS "Public price snapshots insert policy" ON gocoupon_price_snapshots;
      CREATE POLICY "Public price snapshots insert policy" ON gocoupon_price_snapshots FOR INSERT WITH CHECK (true);
    `);
    console.log("✅ Public price snapshots insert policy applied.");

    // 2. Admin Users Table
    console.log("Ensuring gocoupon_admin_users table exists...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gocoupon_admin_users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'editor',
        permissions JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      ALTER TABLE gocoupon_admin_users ENABLE ROW LEVEL SECURITY;
      CREATE INDEX IF NOT EXISTS idx_admin_users_email ON gocoupon_admin_users(email);
    `);
    console.log("✅ gocoupon_admin_users table verified.");

    // 3. Settings Table
    console.log("Ensuring gocoupon_settings table exists...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gocoupon_settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      ALTER TABLE gocoupon_settings ENABLE ROW LEVEL SECURITY;
    `);
    console.log("✅ gocoupon_settings table verified.");

    // 4. Seed initial admin users if table is empty
    const userCheck = await pool.query("SELECT COUNT(*) FROM gocoupon_admin_users");
    const count = parseInt(userCheck.rows[0].count, 10);
    if (count === 0) {
      console.log("Seeding initial admin users (Surya & Mohan)...");
      await pool.query(`
        INSERT INTO gocoupon_admin_users (id, name, email, password_hash, role, permissions, is_active, created_at)
        VALUES 
          ('usr-surya', 'Surya', 'surya@gocoupon.io', 'b8ea855a7e7dde790609366079cdc175:a54f59ac44f2a95cf87ac319eea58b479e921f622c699ed266def7964ab35a350daf10cc7aeb8af55a16f5bf092c319aa8f7ccc082cfddd66aecc3c57bdec9c8', 'admin', '["dashboard","offers","stores","categories","products","blogs","events","hero","sections","users","settings"]', true, NOW()),
          ('usr-mohan', 'Mohan', 'mohan@gocoupon.io', '775abcc661a77c8a794bf554d2c0eb81:ea5c6d70a9b7617e75ebe7d1f5ebd2d50d6e3ce8b10f5cb1ab165829bb67a664685edc9a3e4fed29f5f121c0527ceaea6d30eae03a86e924b0bf0207fb28ff5c', 'admin', '["dashboard","offers","stores","categories","products","blogs","events","hero","sections","users","settings"]', true, NOW())
        ON CONFLICT (email) DO NOTHING;
      `);
      console.log("✅ Seeded initial admin users.");
    } else {
      console.log(`ℹ️ gocoupon_admin_users already has ${count} user(s).`);
    }

    console.log("🎉 All Supabase migrations completed successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
