import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load environment variables from .env
const envPath = path.join(projectRoot, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const dealsSnapshotPath = path.join(projectRoot, 'src/data/live-deals.json');
const snapshot = JSON.parse(fs.readFileSync(dealsSnapshotPath, 'utf-8'));

const FEATURED_DEALS_COLLECTION = [
  {
    id: "ac-medibuddy-30",
    brandName: "MediBuddy",
    brandSlug: "medibuddy",
    campaignId: "ac-1685",
    category: "Health",
    couponCode: "ACMB30",
    discountText: "30% OFF",
    subTitle: "Doctor consultations, medicines & health checkups",
    merchantUrl: "https://www.medibuddy.in",
    affiliateUrl: "https://www.medibuddy.in",
    targetCountry: "India Eligible",
    badge: "Best Saving",
    priorityLevel: 1,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Valid on online doctor consultations, lab tests, medicine delivery, and annual health checkup plans.",
    topPriority: true,
  },
  {
    id: "ac-flixbus-16",
    brandName: "FlixBus",
    brandSlug: "flixbus",
    campaignId: "ac-1686",
    category: "Travel",
    couponCode: "FLXCNNXT2E",
    discountText: "16.5% OFF",
    subTitle: "Intercity luxury bus booking across India",
    merchantUrl: "https://www.flixbus.in",
    affiliateUrl: "https://www.flixbus.in",
    targetCountry: "India Eligible",
    badge: "Popular Travel Deal",
    priorityLevel: 2,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Valid on confirmed bus bookings made via the official FlixBus app and website. No minimum fare required.",
    topPriority: true,
  },
  {
    id: "ac-jbl-10",
    brandName: "JBL",
    brandSlug: "jbl",
    campaignId: "ac-1687",
    category: "Electronics",
    couponCode: "FKM23R9GEWF8T",
    discountText: "10% OFF",
    subTitle: "Headphones, wireless earbuds & portable soundbars",
    merchantUrl: "https://www.jbl.com",
    affiliateUrl: "https://www.jbl.com",
    targetCountry: "India Eligible",
    badge: "Featured Partner",
    priorityLevel: 3,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Valid on eligible audio products, Bluetooth speakers, and gaming headsets on official store.",
    topPriority: true,
  },
  {
    id: "ac-pure-nutrition-10",
    brandName: "Pure Nutrition",
    brandSlug: "pure-nutrition",
    campaignId: "ac-1688",
    category: "Nutrition",
    couponCode: "CMPURE10AC",
    discountText: "10% OFF",
    subTitle: "Vitamins, organic supplements & immunity boosters",
    merchantUrl: "https://purenutrition.in",
    affiliateUrl: "https://purenutrition.in",
    targetCountry: "India Eligible",
    badge: "Verified Offer",
    priorityLevel: 4,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Valid on premium vitamins, collagen, herbal powders, and daily health supplements.",
    topPriority: true,
  },
  {
    id: "ac-ajmal-10",
    brandName: "Ajmal Perfumes",
    brandSlug: "ajmal-perfumes",
    campaignId: "ac-1689",
    category: "Perfumes",
    couponCode: "ACAJMAL10",
    discountText: "10% OFF",
    subTitle: "Artisanal Oudh, EDP sprays & luxury perfumes",
    merchantUrl: "https://ajmalperfume.com",
    affiliateUrl: "https://ajmalperfume.com",
    targetCountry: "India Eligible",
    badge: "Verified Offer",
    priorityLevel: 5,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Valid across all luxury fragrances, gift sets, concentrated perfume oils, and oriental perfumes.",
    topPriority: true,
  },
  {
    id: "ac-nasher-miles-7",
    brandName: "Nasher Miles",
    brandSlug: "nasher-miles",
    campaignId: "ac-1690",
    category: "Travel",
    couponCode: "CLINK07",
    discountText: "7% OFF",
    subTitle: "Hard-side luggage trolleys, backpacks & sets",
    merchantUrl: "https://www.nashermiles.com",
    affiliateUrl: "https://www.nashermiles.com",
    targetCountry: "India Eligible",
    badge: "India Eligible",
    priorityLevel: 6,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Valid on polycarbonate trolley luggage, travel duffels, and laptop backpacks.",
    topPriority: true,
  },
  {
    id: "ac-sarkar-perfumes",
    brandName: "Sarkar Perfumes",
    brandSlug: "sarkar-perfumes",
    campaignId: "ac-1691",
    category: "Perfumes",
    couponCode: "SARKAR10",
    discountText: "10% OFF",
    subTitle: "Handcrafted pure attars & concentrated oils",
    merchantUrl: "https://sarkarperfumes.com",
    affiliateUrl: "https://sarkarperfumes.com",
    targetCountry: "India Eligible",
    badge: "Featured Partner",
    priorityLevel: 7,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Valid on handcrafted non-alcoholic attars, oriental blends, and luxury reed diffusers.",
  },
  {
    id: "ac-oliveboard",
    brandName: "Oliveboard",
    brandSlug: "oliveboard",
    campaignId: "ac-1692",
    category: "Education",
    couponCode: "OBMAGIC",
    discountText: "Special Savings",
    subTitle: "Banking, SSC & Government exam mock tests",
    merchantUrl: "https://www.oliveboard.in",
    affiliateUrl: "https://www.oliveboard.in",
    targetCountry: "India Eligible",
    badge: "Verified Offer",
    priorityLevel: 8,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Valid on test passes, video courses, and all-India test series for banking and regulatory exams.",
  },
  {
    id: "ac-kleenest",
    brandName: "Kleenest",
    brandSlug: "kleenest",
    campaignId: "ac-1693",
    category: "Beauty",
    couponCode: "KLEEN10",
    discountText: "Special Offer",
    subTitle: "Eco-conscious home hygiene & clean living",
    merchantUrl: "https://kleenest.in",
    affiliateUrl: "https://kleenest.in",
    targetCountry: "India Eligible",
    badge: "Verified Offer",
    priorityLevel: 9,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Valid on eco-conscious home cleaners, hygiene essentials, and safe personal care products.",
  },
  {
    id: "ac-the-formal-club",
    brandName: "The Formal Club",
    brandSlug: "the-formal-club",
    campaignId: "ac-1694",
    category: "Fashion",
    couponCode: "TFCFORMAL",
    discountText: "10% OFF",
    subTitle: "Tailored business shirts & formal menswear",
    merchantUrl: "https://theformalclub.in",
    affiliateUrl: "https://theformalclub.in",
    targetCountry: "India Eligible",
    badge: "Verified Offer",
    priorityLevel: 10,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Valid on 100% Giza cotton formal shirts, linen collections, and executive essentials.",
  },
  {
    id: "ac-qnt-sports",
    brandName: "QNT Sports India",
    brandSlug: "qnt-sports",
    campaignId: "ac-1695",
    category: "Sports Nutrition",
    couponCode: "QNTGC",
    discountText: "7% OFF",
    subTitle: "Get 7% off your order at QNT Sports India using exclusive code QNTGC",
    merchantUrl: "https://www.qntsport.in/",
    affiliateUrl: "https://www.qntsport.in/",
    targetCountry: "India Eligible",
    badge: "Verified Offer",
    priorityLevel: 11,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Get 7% off your order at QNT Sports India using the exclusive GoCoupon code QNTGC. Shop sports nutrition products and save on your purchase.",
  },
  {
    id: "ac-redbus",
    brandName: "RedBus",
    brandSlug: "redbus",
    campaignId: "ac-1696",
    category: "Travel",
    couponCode: "REDBUSAC",
    discountText: "Special Savings",
    subTitle: "Express bus & Volvo seat reservations",
    merchantUrl: "https://www.redbus.in",
    affiliateUrl: "https://www.redbus.in",
    targetCountry: "India Eligible",
    badge: "Popular Travel Deal",
    priorityLevel: 12,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Valid across certified private bus operators and government state transport corporations.",
  },
  {
    id: "ac-nakpro",
    brandName: "Nakpro Nutrition",
    brandSlug: "nakpro-nutrition",
    campaignId: "ac-1697",
    category: "Nutrition",
    couponCode: "NAKPROFIT",
    discountText: "Verified Savings",
    subTitle: "Certified pure whey isolate & lean nutrition",
    merchantUrl: "https://nakpro.com",
    affiliateUrl: "https://nakpro.com",
    targetCountry: "India Eligible",
    badge: "Verified Offer",
    priorityLevel: 13,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Valid on all unflavoured and flavoured whey protein isolates, creatine, and glutamine.",
  },
  {
    id: "ac-as-it-is",
    brandName: "AS-IT-IS Nutrition",
    brandSlug: "as-it-is-nutrition",
    campaignId: "ac-1698",
    category: "Nutrition",
    couponCode: "ASITISDEAL",
    discountText: "Coupon Available",
    subTitle: "Pure, lab-tested raw sports nutrition",
    merchantUrl: "https://asitisnutrition.com",
    affiliateUrl: "https://asitisnutrition.com",
    targetCountry: "India Eligible",
    badge: "Verified Offer",
    priorityLevel: 14,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Valid on pure whey protein, raw supplements, and essential amino acids at official store checkout.",
  },
  {
    id: "ac-svastika-10",
    brandName: "Svastika",
    brandSlug: "svastika",
    campaignId: "4923",
    category: "Pooja Essentials",
    couponCode: "SVBRASS10",
    discountText: "10% OFF",
    subTitle: "Handcrafted brass idols, diyas & sacred pooja essentials",
    merchantUrl: "https://svastika.in/",
    affiliateUrl: "https://svastika.in/",
    targetCountry: "India Eligible",
    badge: "Exclusive Partner",
    priorityLevel: 15,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Get 10% off your purchase at Svastika using the exclusive GoCoupon code SVBRASS10. Shop Pooja Essentials and save on your order.",
  },
  {
    id: "ac-nobero-500",
    brandName: "Nobero",
    brandSlug: "nobero",
    campaignId: "4696",
    category: "Fashion",
    couponCode: "CCN500",
    discountText: "₹500 OFF",
    subTitle: "Get ₹500 off on eligible orders above ₹2,199 with code CCN500",
    merchantUrl: "https://nobero.com/",
    affiliateUrl: "https://nobero.com/",
    targetCountry: "India Eligible",
    badge: "Special Savings",
    priorityLevel: 16,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Valid on orders above ₹2,199. Get ₹500 off your Nobero order using the exclusive GoCoupon code CCN500.",
  },
  {
    id: "ac-ezee-perfume-15",
    brandName: "Ezee Perfume",
    brandSlug: "ezee-perfume",
    campaignId: "4967",
    category: "Perfumes",
    couponCode: "GC15",
    discountText: "15% OFF",
    subTitle: "Luxury long-lasting EDP perfumes & fine fragrances",
    merchantUrl: "https://ezeperfume.com/",
    affiliateUrl: "https://ezeperfume.com/",
    targetCountry: "India Eligible",
    badge: "Verified Offer",
    priorityLevel: 17,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Get 15% off your Ezee Perfume order using the exclusive GoCoupon code GC15. Discover fragrances and save 15% on your purchase.",
  },
  {
    id: "ac-pant-project-6",
    brandName: "The Pant Project",
    brandSlug: "the-pant-project",
    campaignId: "4742",
    category: "Fashion",
    couponCode: "CZANIA100",
    discountText: "6.3% OFF",
    subTitle: "Custom-tailored pants, stretch chinos & executive menswear",
    merchantUrl: "https://pantproject.com/",
    affiliateUrl: "https://pantproject.com/",
    targetCountry: "India Eligible",
    badge: "Verified Offer",
    priorityLevel: 18,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Get 6.3% off your purchase at The Pant Project using the exclusive GoCoupon code CZANIA100. Shop men's pants and fashion essentials while saving on your order.",
  },
  {
    id: "ac-ace-blend-10",
    brandName: "Ace Blend",
    brandSlug: "ace-blend",
    campaignId: "3482",
    category: "Nutrition",
    couponCode: "GC10",
    discountText: "10% OFF",
    subTitle: "100% natural superfood smoothies, plant protein & gut health",
    merchantUrl: "https://aceblend.com/",
    affiliateUrl: "https://aceblend.com/",
    targetCountry: "India Eligible",
    badge: "Clean Nutrition",
    priorityLevel: 19,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Get 10% off your Ace Blend order using the exclusive GoCoupon code GC10. Shop nutrition products and save 10% on your purchase.",
  },
  {
    id: "ac-decode-age-10",
    brandName: "Decode Age",
    brandSlug: "decode-age",
    campaignId: "4917",
    category: "Health",
    couponCode: "DEEPIKAC",
    discountText: "10% OFF",
    subTitle: "Longevity supplements, NMN, biological age & gut health tests",
    merchantUrl: "https://decodeage.com/",
    affiliateUrl: "https://decodeage.com/",
    targetCountry: "India Eligible",
    badge: "Longevity Science",
    priorityLevel: 20,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Get 10% off your Decode Age order using the exclusive GoCoupon code DEEPIKAC. Shop health and wellness products and save 10% on your purchase.",
  },
  {
    id: "ac-saadaa-10",
    brandName: "Saadaa",
    brandSlug: "saadaa",
    campaignId: "4932",
    category: "Fashion",
    couponCode: "GC10",
    discountText: "10% OFF",
    subTitle: "Minimalist everyday clothing, organic cotton tees & casual wear",
    merchantUrl: "https://saadaa.in/",
    affiliateUrl: "https://saadaa.in/",
    targetCountry: "India Eligible",
    badge: "Sustainable Fashion",
    priorityLevel: 21,
    campaignSource: "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: "Today",
    terms: "Get 10% off your Saadaa order using the exclusive GoCoupon code GC10. Shop Saadaa's fashion collection and save 10% on your purchase.",
  },
];

const converted = FEATURED_DEALS_COLLECTION.map(item => ({
  id: item.id,
  storeName: item.brandName,
  storeSlug: item.brandSlug,
  category: item.category,
  title: `${item.discountText}: ${item.subTitle}`,
  code: item.couponCode,
  discount: item.discountText,
  badge: item.badge,
  verifiedDate: "Live Verified",
  expiresIn: "30 days left",
  endDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
  terms: item.terms,
  link: item.affiliateUrl,
  url: item.affiliateUrl,
  merchantUrl: item.merchantUrl,
  logoUrl: null,
  storeLogo: null,
  logo: null,
  usesCount: 150,
  source: "analytics_clouds",
  campaignSource: "analytics_clouds",
  isFeatured: true,
  featuredPriority: item.priorityLevel,
  targetCountry: item.targetCountry,
  verificationStatus: item.verificationStatus,
  verified: item.verificationStatus === "verified",
  status: "active",
  type: "Coupon"
}));

// Non-destructive upsert: update matching IDs from collection, keep any manual deals intact
const convertedMap = new Map(converted.map(c => [c.id, c]));
const updatedExisting = (snapshot.deals || []).map(d => {
  if (convertedMap.has(d.id)) {
    const fresh = convertedMap.get(d.id);
    convertedMap.delete(d.id);
    return { ...d, ...fresh };
  }
  return d;
});
// Prepend newly added deals that weren't in snapshot yet
snapshot.deals = [...convertedMap.values(), ...updatedExisting];
snapshot.activeCount = snapshot.deals.length;
snapshot.updatedAt = new Date().toISOString();

fs.writeFileSync(dealsSnapshotPath, JSON.stringify(snapshot, null, 2), "utf-8");
console.log("SEEDED_TO_DISK_SUCCESSFULLY:", converted.length);

// Sync directly to Supabase PostgreSQL database if configured
async function syncToSupabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log("ℹ️ DATABASE_URL not set in .env; skipping Supabase PostgreSQL cloud sync.");
    return;
  }

  try {
    const pool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    });
    console.log("⚡ Connecting to Supabase PostgreSQL to sync featured deals...");
    const client = await pool.connect();
    try {
      let count = 0;
      for (const d of converted) {
        await client.query(`
          INSERT INTO gocoupon_deals (
            id, store_name, store_slug, title, code, discount, category,
            badge, verified, verified_date, expires_in, end_date, terms,
            link, uses_count, source, status, type
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            code = EXCLUDED.code,
            discount = EXCLUDED.discount,
            uses_count = EXCLUDED.uses_count,
            verified = EXCLUDED.verified,
            updated_at = NOW();
        `, [
          d.id,
          d.storeName,
          d.storeSlug,
          d.title,
          d.code || "",
          d.discount,
          d.category || "General",
          d.badge || "Verified",
          d.verified ?? true,
          d.verifiedDate || "Live Verified",
          d.expiresIn || "30 days left",
          d.endDate ? new Date(d.endDate) : null,
          d.terms || null,
          d.link || "https://gocoupon.io",
          d.usesCount || 150,
          d.source || "analytics_clouds",
          d.status || "active",
          d.type || "Coupon",
        ]);
        count++;
      }
      console.log(`✅ Synced ${count} featured deals directly into Supabase PostgreSQL (gocoupon_deals)!`);
    } finally {
      client.release();
      await pool.end();
    }
  } catch (err) {
    console.warn("⚠️ Could not sync featured deals to Supabase database:", err.message);
  }
}

syncToSupabase().catch((err) => console.error("Sync error:", err));
