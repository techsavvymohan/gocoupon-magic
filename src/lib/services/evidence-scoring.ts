/**
 * @file evidence-scoring.ts
 * @description Evidence scoring engine and Flash-style collection retrieval.
 */

import { CURATED_COLLECTIONS, type CuratedCollection } from "@/data/collectionsData";
import { CANONICAL_EVIDENCE } from "@/data/canonicalCatalogData";
import type { ProductEvidence, CategoryRecommendation } from "./canonical-types";

/**
 * Returns all curated Flash collections.
 */
export function getAllCollections(): CuratedCollection[] {
  return CURATED_COLLECTIONS;
}

/**
 * Finds a collection by its URL slug.
 */
export function getCollectionBySlug(slug: string): CuratedCollection | undefined {
  return CURATED_COLLECTIONS.find((c) => c.slug === slug);
}

/**
 * Returns all evidence entries for a specific product ID.
 */
export function getProductEvidence(productId: string): ProductEvidence[] {
  return CANONICAL_EVIDENCE.filter((e) => e.productId === productId);
}

/**
 * Returns top-scoring products across all collections.
 */
export function getFeaturedRecommendations(): CategoryRecommendation[] {
  return CURATED_COLLECTIONS.flatMap((c) => c.items).sort((a, b) => b.overallScore - a.overallScore);
}
