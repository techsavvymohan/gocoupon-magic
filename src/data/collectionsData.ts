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
    items: [],
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
    items: [],
  },
];
