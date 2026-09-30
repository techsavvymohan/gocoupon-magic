/**
 * @file server/services/brand-assets-service.ts
 * @description Canonical Brand Asset Registry & Cloudinary Logo Management for GoCoupon.
 *
 * Single Source of Truth for brand logos:
 * - Maps brand slugs to Cloudinary URLs or verified CDN logos
 * - Automatically stamps canonical logos onto live deals and store records
 * - Persists to server/data/brand-assets.json and syncs with Supabase stores
 */

import fs from "node:fs";
import path from "node:path";
import { uploadImageToCloudinary } from "./cloudinary.js";
import { globalCache } from "../../src/lib/services/cache-service.js";

export interface BrandAsset {
  slug: string;
  name: string;
  domain?: string;
  logoUrl: string;
  source: "cloudinary" | "local" | "auto-fetch" | "manual";
  affiliateSource?: "cuelinks" | "admitad" | "other" | "manual";
  updatedAt: string;
  width?: number;
  height?: number;
  format?: string;
}

const DATA_FILE = path.resolve(process.cwd(), "server/data/brand-assets.json");

// Pre-seeded known logos
const INITIAL_SEED_LOGOS: Record<string, { name: string; domain: string; logoUrl: string; source: "local" | "cloudinary"; affiliateSource?: "cuelinks" | "admitad" | "other" | "manual" }> = {
  amazon: { name: "Amazon", domain: "amazon.in", logoUrl: "/Brand logos/Amazon_logo.svg.webp", source: "local", affiliateSource: "other" },
  flipkart: { name: "Flipkart", domain: "flipkart.com", logoUrl: "/Brand logos/flipkart.webp", source: "local", affiliateSource: "cuelinks" },
  myntra: { name: "Myntra", domain: "myntra.com", logoUrl: "/Brand logos/myntra.webp", source: "local", affiliateSource: "cuelinks" },
  croma: { name: "Croma", domain: "croma.com", logoUrl: "/Brand logos/croma.svg", source: "local", affiliateSource: "cuelinks" },
  reliance: { name: "Reliance Digital", domain: "reliancedigital.in", logoUrl: "/Brand logos/reliance.svg", source: "local", affiliateSource: "cuelinks" },
  tatacliq: { name: "Tata CLiQ", domain: "tatacliq.com", logoUrl: "/Brand logos/Tata-cliq.webp", source: "local", affiliateSource: "cuelinks" },
  ajio: { name: "AJIO", domain: "ajio.com", logoUrl: "/Brand logos/Ajio.webp", source: "local", affiliateSource: "cuelinks" },
  nykaa: { name: "Nykaa", domain: "nykaa.com", logoUrl: "/Brand logos/Nykaa.webp", source: "local", affiliateSource: "cuelinks" },
  meesho: { name: "Meesho", domain: "meesho.com", logoUrl: "/Brand logos/Meesho_logo.webp", source: "local", affiliateSource: "cuelinks" },
  firstcry: { name: "FirstCry", domain: "firstcry.com", logoUrl: "/Brand logos/FirstCry_logo.svg.webp", source: "local", affiliateSource: "cuelinks" },
  gonoise: { name: "Noise", domain: "gonoise.com", logoUrl: "/Brand logos/gonoise.svg", source: "local", affiliateSource: "cuelinks" },
  noise: { name: "Noise", domain: "gonoise.com", logoUrl: "/Brand logos/gonoise.svg", source: "local", affiliateSource: "cuelinks" },
  soulflower: { name: "Soulflower", domain: "soulflower.biz", logoUrl: "/Brand logos/soulflower.svg", source: "local", affiliateSource: "cuelinks" },
  rareism: { name: "Rareism", domain: "rare-ism.com", logoUrl: "/Brand logos/rareism.svg", source: "local", affiliateSource: "cuelinks" },
  jaypore: { name: "Jaypore", domain: "jaypore.com", logoUrl: "/Brand logos/jaypore.svg", source: "local", affiliateSource: "cuelinks" },
  asaya: { name: "Asaya", domain: "asaya.in", logoUrl: "/Brand logos/asaya.svg", source: "local", affiliateSource: "cuelinks" },
  bestbuy: { name: "Best Buy", domain: "bestbuy.com", logoUrl: "/Brand logos/bestbuy.svg", source: "local", affiliateSource: "other" },
  diesel: { name: "Diesel", domain: "diesel.com", logoUrl: "/Brand logos/diesel.png", source: "local", affiliateSource: "other" },
  target: { name: "Target", domain: "target.com", logoUrl: "/Brand logos/target.svg", source: "local", affiliateSource: "other" },
};

class BrandAssetsService {
  private assets: Map<string, BrandAsset> = new Map();
  private initialized = false;

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        const list: BrandAsset[] = JSON.parse(raw);
        for (const item of list) {
          if (item?.slug) {
            this.assets.set(item.slug.toLowerCase().trim(), item);
          }
        }
      }
    } catch (err: any) {
      console.warn("[BrandAssetsService] Failed to read data file, initializing empty:", err.message);
    }

    // Seed defaults if empty
    for (const [slug, item] of Object.entries(INITIAL_SEED_LOGOS)) {
      if (!this.assets.has(slug)) {
        this.assets.set(slug, {
          slug,
          name: item.name,
          domain: item.domain,
          logoUrl: item.logoUrl,
          source: item.source,
          affiliateSource: item.affiliateSource,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    this.initialized = true;
    this.saveToDisk();
  }

  private saveToDisk() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const list = Array.from(this.assets.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
    } catch (err: any) {
      console.error("[BrandAssetsService] Failed to write data file:", err.message);
    }
  }

  /**
   * Normalize brand slug
   */
  public normalizeSlug(nameOrSlug: string): string {
    return (nameOrSlug || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Retrieves all brand assets
   */
  public getAll(): BrandAsset[] {
    return Array.from(this.assets.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Retrieves a single brand asset by slug or normalized name with resilient suffix-stripping
   */
  public get(slugOrName: string): BrandAsset | undefined {
    const slug = this.normalizeSlug(slugOrName);
    if (!slug) return undefined;
    if (this.assets.has(slug)) return this.assets.get(slug);

    // Try stripping common suffixes: -coupons, -store, -offers, -deals, -india, -global
    const cleaned = slug.replace(/-(coupons|store|offers|deals|india|global)$/, "");
    if (cleaned !== slug && this.assets.has(cleaned)) {
      return this.assets.get(cleaned);
    }

    // Try appending -coupons if stored with -coupons
    if (this.assets.has(`${slug}-coupons`)) {
      return this.assets.get(`${slug}-coupons`);
    }

    // Try fuzzy match by name
    for (const asset of this.assets.values()) {
      const assetSlug = this.normalizeSlug(asset.name);
      if (assetSlug === slug || assetSlug === cleaned) {
        return asset;
      }
    }

    return undefined;
  }

  /**
   * Get brand logo URL or empty string
   */
  public getLogoUrl(slugOrName: string): string {
    const asset = this.get(slugOrName);
    return asset?.logoUrl || "";
  }

  /**
   * Upsert or update a brand asset
   */
  public async upsert(data: {
    slug: string;
    name: string;
    domain?: string;
    logoUrl: string;
    source?: "cloudinary" | "local" | "auto-fetch" | "manual";
    affiliateSource?: "cuelinks" | "admitad" | "other" | "manual";
    width?: number;
    height?: number;
    format?: string;
  }): Promise<BrandAsset> {
    const slug = this.normalizeSlug(data.slug || data.name);
    const existing = this.assets.get(slug);

    const asset: BrandAsset = {
      slug,
      name: data.name || existing?.name || slug,
      domain: data.domain || existing?.domain || `${slug}.com`,
      logoUrl: data.logoUrl.trim(),
      source: data.source || (data.logoUrl.includes("cloudinary.com") ? "cloudinary" : "manual"),
      affiliateSource: data.affiliateSource || existing?.affiliateSource,
      updatedAt: new Date().toISOString(),
      width: data.width ?? existing?.width,
      height: data.height ?? existing?.height,
      format: data.format ?? existing?.format,
    };

    this.assets.set(slug, asset);
    this.saveToDisk();

    // Invalidate caches
    await globalCache.deletePrefix("stores:");
    await globalCache.deletePrefix("deals:");

    return asset;
  }

  /**
   * Remove a brand asset
   */
  public async delete(slugOrName: string): Promise<boolean> {
    const slug = this.normalizeSlug(slugOrName);
    const existed = this.assets.delete(slug);
    if (existed) {
      this.saveToDisk();
      await globalCache.deletePrefix("stores:");
      await globalCache.deletePrefix("deals:");
    }
    return existed;
  }

  /**
   * Auto-fetches brand logo by domain and uploads directly to Cloudinary
   */
  public async autoFetchAndUpload(
    name: string,
    domain?: string,
    affiliateSource?: "cuelinks" | "admitad" | "other" | "manual"
  ): Promise<BrandAsset> {
    const cleanName = name.trim();
    const slug = this.normalizeSlug(cleanName);
    const cleanDomain = (domain || `${slug}.com`).toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");

    // High quality brand logo sources in priority order:
    // 1. Google S2 256px HD Favicon (100% uptime, zero rate limits)
    // 2. Unavatar (aggregates multiple CDNs)
    // 3. Icon Horse
    // 4. Clearbit
    const candidateUrls = [
      `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=256`,
      `https://unavatar.io/${cleanDomain}?fallback=false`,
      `https://icon.horse/icon/${cleanDomain}`,
      `https://logo.clearbit.com/${cleanDomain}?size=256`,
    ];

    let uploadedResult: any = null;
    let lastError: any = null;

    for (const url of candidateUrls) {
      try {
        uploadedResult = await uploadImageToCloudinary(url, {
          folder: "gocoupon/brands",
          tags: ["gocoupon", "brand-logo", slug, affiliateSource || "affiliate"],
          public_id: `brand_${slug}`,
        });
        if (uploadedResult?.secure_url) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        continue;
      }
    }

    if (!uploadedResult?.secure_url) {
      throw new Error(`Failed to auto-fetch brand logo for ${cleanName} (${cleanDomain}): ${lastError?.message || "No image could be retrieved"}`);
    }

    return this.upsert({
      slug,
      name: cleanName,
      domain: cleanDomain,
      logoUrl: uploadedResult.secure_url,
      source: "cloudinary",
      affiliateSource,
      width: uploadedResult.width,
      height: uploadedResult.height,
      format: uploadedResult.format,
    });
  }
}

export const brandAssetsService = new BrandAssetsService();
