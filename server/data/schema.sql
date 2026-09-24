-- =============================================================================
-- GoCoupon PostgreSQL Database Schema
-- Compatible with Supabase PostgreSQL 15+
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. DEALS & COUPONS TABLE (gocoupon_deals)
-- Stores live verified discount coupons, deals, promo codes, and offers.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gocoupon_deals (
    id TEXT PRIMARY KEY,
    store_name TEXT NOT NULL,
    store_slug TEXT NOT NULL,
    store_logo TEXT,
    title TEXT NOT NULL,
    code TEXT DEFAULT '',
    discount TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    badge TEXT DEFAULT 'Verified',
    verified BOOLEAN DEFAULT true,
    verified_date TEXT,
    expires_in TEXT DEFAULT 'Active',
    end_date TIMESTAMP WITH TIME ZONE,
    min_order TEXT,
    terms TEXT,
    link TEXT NOT NULL,
    uses_count INTEGER DEFAULT 1,
    rating NUMERIC DEFAULT 4.8,
    votes_count INTEGER DEFAULT 12,
    source TEXT DEFAULT 'cuelinks',
    status TEXT DEFAULT 'active',
    type TEXT DEFAULT 'coupon',
    is_featured BOOLEAN DEFAULT false,
    featured_priority INTEGER DEFAULT 100,
    campaign_source TEXT DEFAULT 'manual',
    verification_status TEXT DEFAULT 'verified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deals_store_slug ON gocoupon_deals(store_slug);
CREATE INDEX IF NOT EXISTS idx_deals_category ON gocoupon_deals(category);
CREATE INDEX IF NOT EXISTS idx_deals_status ON gocoupon_deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_verified ON gocoupon_deals(verified);
CREATE INDEX IF NOT EXISTS idx_deals_is_featured ON gocoupon_deals(is_featured);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON gocoupon_deals(created_at DESC);

-- -----------------------------------------------------------------------------
-- 2. STORES DIRECTORY TABLE (gocoupon_stores)
-- Stores merchant metadata, cashback rates, trust scores, and affiliate links.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gocoupon_stores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    domain TEXT,
    logo TEXT,
    category TEXT DEFAULT 'General',
    tagline TEXT,
    cashback_rate TEXT,
    affiliate_url_template TEXT,
    trust_score NUMERIC DEFAULT 4.8,
    is_featured BOOLEAN DEFAULT false,
    coupons_count INTEGER DEFAULT 0,
    offers_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_slug ON gocoupon_stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_featured ON gocoupon_stores(is_featured);

-- -----------------------------------------------------------------------------
-- 3. COMMUNITY COUPON SUBMISSIONS (gocoupon_submissions)
-- User-submitted discount codes queued for editorial / admin moderation.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gocoupon_submissions (
    id TEXT PRIMARY KEY,
    store_name TEXT NOT NULL,
    code TEXT NOT NULL,
    discount TEXT,
    category TEXT DEFAULT 'General',
    url TEXT,
    terms TEXT,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'approved', 'rejected')),
    rejection_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON gocoupon_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON gocoupon_submissions(submitted_at DESC);

-- -----------------------------------------------------------------------------
-- 4. EDITORIAL BLOGS & GUIDES (gocoupon_blogs)
-- Shopping guides, expense savings strategies, and consumer advocacy articles.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gocoupon_blogs (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Savings Guide',
    author TEXT NOT NULL DEFAULT 'GoCoupon Consumer Advocacy Team',
    read_time TEXT DEFAULT '5 min read',
    image TEXT,
    banner_link TEXT,
    short_description TEXT,
    excerpt TEXT,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Published', 'Draft')),
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blogs_slug ON gocoupon_blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON gocoupon_blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON gocoupon_blogs(created_at DESC);

-- -----------------------------------------------------------------------------
-- 5. PRICE DROP ALERTS (gocoupon_alerts)
-- Push notifications and email alerts registered by users on price drops.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gocoupon_alerts (
    id TEXT PRIMARY KEY,
    email TEXT,
    subscription JSONB,
    product_id TEXT NOT NULL,
    product_title TEXT NOT NULL,
    target_price NUMERIC NOT NULL,
    initial_price NUMERIC NOT NULL,
    store TEXT DEFAULT 'Online Store',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT true
);

-- Ensure subscription column exists if table was pre-created
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gocoupon_alerts' AND column_name = 'subscription'
    ) THEN 
        ALTER TABLE gocoupon_alerts ADD COLUMN subscription JSONB; 
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_alerts_active ON gocoupon_alerts(active);
CREATE INDEX IF NOT EXISTS idx_alerts_product_id ON gocoupon_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_alerts_email ON gocoupon_alerts(email);

-- -----------------------------------------------------------------------------
-- 6. 90-DAY PRICE HISTORY SNAPSHOTS (gocoupon_price_snapshots)
-- Daily price points recorded across stores to chart history & detect fake sales.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gocoupon_price_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    product_title TEXT NOT NULL,
    store_name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    effective_net_price NUMERIC NOT NULL,
    coupon_code TEXT,
    currency TEXT DEFAULT 'INR',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deal BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_price_snapshots_product ON gocoupon_price_snapshots(product_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_snapshots_recorded_at ON gocoupon_price_snapshots(recorded_at DESC);

-- -----------------------------------------------------------------------------
-- 7. ADMIN CONFIG & SETTINGS (gocoupon_settings)
-- Dynamic banner settings, featured festival campaigns, and global toggle flags.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gocoupon_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. ADMIN USERS & ACCESS CONTROL (gocoupon_admin_users)
-- Secured admin credentials, roles, and granular permission sets.
-- -----------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON gocoupon_admin_users(email);

-- -----------------------------------------------------------------------------
-- 9. DEAL CLICKS & REDEMPTIONS (gocoupon_clicks)
-- Live user click tracking on offers, coupon copies, and outbound store visits.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Row-Level Security (RLS) Policies
-- Public read access for published deals, stores, and blogs.
-- -----------------------------------------------------------------------------
ALTER TABLE gocoupon_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE gocoupon_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE gocoupon_blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gocoupon_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gocoupon_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gocoupon_price_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE gocoupon_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gocoupon_admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gocoupon_clicks ENABLE ROW LEVEL SECURITY;

-- Allow public read of active deals
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public deals read policy" ON gocoupon_deals;
    CREATE POLICY "Public deals read policy" ON gocoupon_deals FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Public stores read policy" ON gocoupon_stores;
    CREATE POLICY "Public stores read policy" ON gocoupon_stores FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public blogs read policy" ON gocoupon_blogs;
    CREATE POLICY "Public blogs read policy" ON gocoupon_blogs FOR SELECT USING (status = 'Published');

    DROP POLICY IF EXISTS "Public price snapshots read policy" ON gocoupon_price_snapshots;
    CREATE POLICY "Public price snapshots read policy" ON gocoupon_price_snapshots FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public price snapshots insert policy" ON gocoupon_price_snapshots;
    CREATE POLICY "Public price snapshots insert policy" ON gocoupon_price_snapshots FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Public submissions insert policy" ON gocoupon_submissions;
    CREATE POLICY "Public submissions insert policy" ON gocoupon_submissions FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Public alerts insert policy" ON gocoupon_alerts;
    CREATE POLICY "Public alerts insert policy" ON gocoupon_alerts FOR INSERT WITH CHECK (true);

    -- Protected telemetry for deal clicks: allow public insert if needed, deny public read/update/delete
    DROP POLICY IF EXISTS "Public clicks insert policy" ON gocoupon_clicks;
    CREATE POLICY "Public clicks insert policy" ON gocoupon_clicks FOR INSERT WITH CHECK (true);
END $$;

