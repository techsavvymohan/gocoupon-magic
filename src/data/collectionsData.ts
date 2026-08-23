/**
 * @file collectionsData.ts
 * @description Curated Flash-style evidence-backed category shortlists with rubric scores.
 */

import { CANONICAL_PRODUCTS } from "./canonicalCatalogData";
import type { CategoryRecommendation } from "@/lib/services/canonical-types";

export interface CuratedCollection {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  budgetCapLabel: string;
  updatedDate: string;
  rubricVersion: string;
  methodologySummary: string;
  items: CategoryRecommendation[];
}

export const CURATED_COLLECTIONS: CuratedCollection[] = [
  {
    slug: "best-wireless-headphones-under-30000",
    title: "The 3 Best Noise-Cancelling Headphones in India (2026 Ranked)",
    subtitle:
      "Vetted across 42 lab reviews, airline engine noise benchmarks, battery drain tests, and 14,000+ verified buyer ratings.",
    category: "Electronics",
    budgetCapLabel: "Under ₹30,000",
    updatedDate: "August 2026",
    rubricVersion: "v2.4-Audio",
    methodologySummary:
      "Ranked strictly on active noise cancellation attenuation (30%), audio clarity & soundstage (25%), continuous battery life (20%), long-term comfort (15%), and stackable coupon value (10%).",
    items: [
      {
        id: "rec_sony_xm5",
        collectionSlug: "best-wireless-headphones-under-30000",
        collectionTitle: "The 3 Best Noise-Cancelling Headphones in India (2026 Ranked)",
        category: "Electronics",
        productId: "prod_sony_wh1000xm5",
        product: CANONICAL_PRODUCTS[0],
        rank: 1,
        overallScore: 9.5,
        rubricBreakdown: {
          pillar1: { label: "Noise Cancellation (ANC)", score: 9.8, maxScore: 10 },
          pillar2: { label: "Sound Quality & Hi-Res", score: 9.4, maxScore: 10 },
          pillar3: { label: "Battery Life & Charge", score: 9.5, maxScore: 10 },
          pillar4: { label: "Comfort & Fit", score: 9.2, maxScore: 10 },
          pillar5: { label: "Value & Discounts", score: 9.6, maxScore: 10 },
        },
        verdictSummary:
          "The undisputed gold standard for frequent flyers and remote professionals. Exceptional 30-hour battery, class-leading microphone clarity, and unmatched low-frequency rumble cancellation.",
        keyPros: [
          "Attenuates 92% of ambient office chatter & cabin rumble",
          "30-hour battery with ultra-fast 3-minute USB-PD top up",
          "Seamless multipoint switching between laptop and phone",
        ],
        keyCons: [
          "Earcups fold flat but do not collapse into headband like XM4",
          "Touch controls take 1-2 days of muscle memory to master",
        ],
        bestFor: "Frequent flyers, open-plan office workers, and audiophiles seeking top ANC.",
        rubricVersion: "v2.4-Audio",
      },
      {
        id: "rec_boat_141",
        collectionSlug: "best-wireless-headphones-under-30000",
        collectionTitle: "The 3 Best Noise-Cancelling Headphones in India (2026 Ranked)",
        category: "Electronics",
        productId: "prod_boat_airdopes_141",
        product: CANONICAL_PRODUCTS[2],
        rank: 2,
        overallScore: 8.8,
        rubricBreakdown: {
          pillar1: { label: "Noise Cancellation (ANC)", score: 8.4, maxScore: 10 },
          pillar2: { label: "Sound Quality & Bass", score: 8.7, maxScore: 10 },
          pillar3: { label: "Battery Life & Case", score: 9.2, maxScore: 10 },
          pillar4: { label: "Ergonomics & IPX5", score: 8.8, maxScore: 10 },
          pillar5: { label: "Value & Discounts", score: 9.9, maxScore: 10 },
        },
        verdictSummary:
          "Best sub-₹2,000 budget champion. Delivers surprising 32dB active noise cancellation with 42 hours total playtime and punchy bass tuning tailored for Indian pop & hip-hop.",
        keyPros: [
          "Unbeatable value under ₹1,500 with stackable coupons",
          "42-hour combined battery life with ASAP Charge",
          "IPX5 sweat resistance ideal for gym and daily commute",
        ],
        keyCons: [
          "Microphone struggles in high-wind outdoor environments",
          "Bass-forward tuning may feel heavy for acoustic purists",
        ],
        bestFor: "Students, fitness enthusiasts, and daily commuters on a tight budget.",
        rubricVersion: "v2.4-Audio",
      },
    ],
  },
  {
    slug: "best-flagship-laptops-india",
    title: "Top Laptops for Creators & Professionals (2026 Verified)",
    subtitle: "Evaluated for sustained performance, battery longevity, keyboard ergonomics, and thermals.",
    category: "Electronics",
    budgetCapLabel: "Premium & Pro",
    updatedDate: "August 2026",
    rubricVersion: "v3.1-Compute",
    methodologySummary:
      "Benchmarked with real 4K video render loops, thermal throttling under fanless conditions, display color accuracy, and real-world battery endurance.",
    items: [
      {
        id: "rec_mac_m3",
        collectionSlug: "best-flagship-laptops-india",
        collectionTitle: "Top Laptops for Creators & Professionals (2026 Verified)",
        category: "Electronics",
        productId: "prod_apple_macbook_air_m3",
        product: CANONICAL_PRODUCTS[1],
        rank: 1,
        overallScore: 9.7,
        rubricBreakdown: {
          pillar1: { label: "Sustained CPU/GPU Speed", score: 9.6, maxScore: 10 },
          pillar2: { label: "Display & Color Fidelity", score: 9.8, maxScore: 10 },
          pillar3: { label: "Battery Life (18h)", score: 9.9, maxScore: 10 },
          pillar4: { label: "Build & Portability", score: 9.8, maxScore: 10 },
          pillar5: { label: "Value & Exchange Offers", score: 9.4, maxScore: 10 },
        },
        verdictSummary:
          "The ultimate everyday laptop for 95% of users. Whisper-quiet fanless design, class-leading 18-hour battery, premium Liquid Retina panel, and seamless hardware-accelerated ray tracing.",
        keyPros: [
          "True 16+ hour real-world battery life without battery anxiety",
          "Silent operation with zero fan noise even under heavy multitasking",
          "MagSafe 3 magnetic charging frees up both Thunderbolt ports",
        ],
        keyCons: [
          "Base 16GB cannot be upgraded after purchase",
          "Supports only up to two external displays with laptop lid closed",
        ],
        bestFor: "Software developers, university students, and creative freelancers.",
        rubricVersion: "v3.1-Compute",
      },
    ],
  },
];
