/**
 * @file server/services/search-accuracy.ts
 * @description Search Result Accuracy Evaluation & Verification Engine.
 *
 * Implements multi-factor accuracy verification:
 * 1. Semantic Intent Alignment (Brand, Category, Product Form)
 * 2. Token Precision & SKU Exactness (Model number, variant match)
 * 3. Accessory Contamination Detection (Filters cases/cables when searching for devices)
 * 4. Price Plausibility & Sanity Checks
 * 5. Accuracy Grading (EXACT_MATCH, HIGH_ACCURACY, MODERATE_RELEVANCE, LOW_CONFIDENCE)
 * 6. Query-level Accuracy Batch Audits
 */

import { analyzeQueryIntent, type QueryIntent } from "../../src/lib/services/query-engine.js";

export type AccuracyGrade = "EXACT_MATCH" | "HIGH_ACCURACY" | "MODERATE_RELEVANCE" | "LOW_CONFIDENCE";

export interface SearchAccuracyResult {
  score: number; // 0 to 100
  grade: AccuracyGrade;
  isVerified: boolean;
  brandMatch: boolean;
  categoryMatch: boolean;
  isAccessoryConflict: boolean;
  relevanceReasons: string[];
}

export interface CandidateSearchItem {
  id?: string;
  title: string;
  brand?: string;
  category?: string;
  price?: number;
  tags?: string[];
  storeName?: string;
}

export interface SearchAccuracyAuditSummary {
  averageAccuracyScore: number;
  exactMatchesCount: number;
  highAccuracyCount: number;
  moderateAccuracyCount: number;
  lowAccuracyCount: number;
  confidenceRating: "HIGH" | "MODERATE" | "LOW";
  detectedIntent: {
    brand: string | null;
    category: string;
    productForm: string | null;
    isSkuSpecific: boolean;
  };
}

/**
 * Evaluates the accuracy and relevance of an individual search result candidate
 * against the parsed user query intent.
 */
export function evaluateSearchAccuracy(
  query: string | QueryIntent,
  candidate: CandidateSearchItem
): SearchAccuracyResult {
  const intent = typeof query === "string" ? analyzeQueryIntent(query) : query;
  const cTitle = (candidate.title || "").toLowerCase();
  const cBrand = (candidate.brand || "").toLowerCase();
  const cCategory = (candidate.category || "").toLowerCase();
  const cTags = (candidate.tags || []).join(" ").toLowerCase();
  const fullText = `${cTitle} ${cBrand} ${cCategory} ${cTags}`;

  let score = 0;
  const relevanceReasons: string[] = [];

  // ── 1. Brand Alignment (Weight: 25 pts) ──────────────────────────────────
  let brandMatch = false;
  if (intent.brand) {
    const isAllowedBrand =
      intent.allowedBrands.includes(cBrand) ||
      intent.allowedBrands.some((b) => cBrand.includes(b) || cTitle.includes(b));

    if (isAllowedBrand) {
      score += 25;
      brandMatch = true;
      relevanceReasons.push(`Brand '${intent.brand}' confirmed in candidate`);
    } else {
      // User explicitly asked for a brand and candidate belongs to a competing brand -> severe penalty
      score -= 20;
      relevanceReasons.push(`Brand mismatch: expected '${intent.brand}'`);
    }
  } else {
    // Neutral brand search (e.g. "running shoes")
    score += 15;
    brandMatch = true;
  }

  // ── 2. Product Form & Category Alignment (Weight: 25 pts) ───────────────
  let categoryMatch = false;
  if (intent.productForm) {
    const formRegex = new RegExp(`\\b${intent.productForm}\\b`, "i");
    if (formRegex.test(fullText)) {
      score += 25;
      categoryMatch = true;
      relevanceReasons.push(`Product form '${intent.productForm}' matched`);
    } else {
      score += 10;
    }
  } else if (intent.category) {
    if (cCategory.includes(intent.category.toLowerCase()) || fullText.includes(intent.category.toLowerCase())) {
      score += 20;
      categoryMatch = true;
      relevanceReasons.push(`Category '${intent.category}' matched`);
    } else {
      score += 10;
    }
  } else {
    score += 15;
    categoryMatch = true;
  }

  // ── 3. Token Overlap & SKU Exactness (Weight: 35 pts) ───────────────────
  const queryWords = intent.cleanSearchTerm
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["buy", "online", "india", "price", "best"].includes(w));

  if (queryWords.length > 0) {
    const matchedWords = queryWords.filter((w) => cTitle.includes(w) || fullText.includes(w));
    const overlapRatio = matchedWords.length / queryWords.length;
    const tokenPoints = Math.round(overlapRatio * 25);
    score += tokenPoints;

    if (matchedWords.length === queryWords.length) {
      score += 10; // Exact full phrase match bonus
      relevanceReasons.push(`All ${queryWords.length} query tokens matched`);
    } else if (matchedWords.length > 0) {
      relevanceReasons.push(`${matchedWords.length}/${queryWords.length} query tokens matched`);
    }
  }

  // Check specific model tokens (e.g. "WH-1000XM5", "M3", "15 Pro")
  if (intent.modelTokens.length > 0) {
    const matchedModel = intent.modelTokens.filter((m) => cTitle.includes(m.toLowerCase()));
    if (matchedModel.length > 0) {
      score += 15;
      relevanceReasons.push(`Model SKU tokens confirmed: [${matchedModel.join(", ")}]`);
    }
  }

  // ── 4. Accessory Conflict Detection (Negative Filter) ───────────────────
  let isAccessoryConflict = false;
  if (!intent.isAccessory) {
    const isDeviceSearch =
      (intent.productForm && ["phone", "laptop", "tv", "headphone", "watch"].includes(intent.productForm)) ||
      intent.modelTokens.length > 0 ||
      intent.isSkuSpecific;

    if (isDeviceSearch) {
      const isAccessory = /\b(case|cover|pouch|skin|screen\s*guard|screen\s*protector|tempered\s*glass|cable|adapter|charger|strap|band)\b/i.test(
        cTitle
      );
      if (isAccessory) {
        isAccessoryConflict = true;
        score -= 40; // Heavy penalty: user searched for device, not case
        relevanceReasons.push("Accessory conflict: Candidate is an accessory for the requested device");
      }
    }
  }

  // ── 5. Price Plausibility (Weight: 10 pts) ──────────────────────────────
  if (candidate.price && candidate.price > 0) {
    // Check reasonable price ranges
    if (intent.productForm === "laptop" && candidate.price < 5000) {
      score -= 20; // Suspiciously low price for a laptop
      relevanceReasons.push("Price anomaly: Unrealistically low for product category");
    } else if (intent.productForm === "phone" && candidate.price < 2000 && !cTitle.includes("feature")) {
      score -= 15;
    } else {
      score += 10;
    }
  }

  // Normalize final score to 0–100
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));

  // Determine Quality Grade
  let grade: AccuracyGrade = "LOW_CONFIDENCE";
  if (normalizedScore >= 90) {
    grade = "EXACT_MATCH";
  } else if (normalizedScore >= 75) {
    grade = "HIGH_ACCURACY";
  } else if (normalizedScore >= 50) {
    grade = "MODERATE_RELEVANCE";
  }

  const isVerified = normalizedScore >= 70 && !isAccessoryConflict;

  return {
    score: normalizedScore,
    grade,
    isVerified,
    brandMatch,
    categoryMatch,
    isAccessoryConflict,
    relevanceReasons,
  };
}

/**
 * Performs an aggregate accuracy audit on an entire batch of search results for a given query.
 */
export function auditSearchAccuracyBatch(
  query: string,
  candidates: CandidateSearchItem[]
): SearchAccuracyAuditSummary {
  const intent = analyzeQueryIntent(query);

  if (!candidates || candidates.length === 0) {
    return {
      averageAccuracyScore: 0,
      exactMatchesCount: 0,
      highAccuracyCount: 0,
      moderateAccuracyCount: 0,
      lowAccuracyCount: 0,
      confidenceRating: "LOW",
      detectedIntent: {
        brand: intent.brand,
        category: intent.category,
        productForm: intent.productForm,
        isSkuSpecific: intent.isSkuSpecific,
      },
    };
  }

  let totalScore = 0;
  let exact = 0;
  let high = 0;
  let moderate = 0;
  let low = 0;

  for (const item of candidates) {
    const evalResult = evaluateSearchAccuracy(intent, item);
    totalScore += evalResult.score;

    if (evalResult.grade === "EXACT_MATCH") exact++;
    else if (evalResult.grade === "HIGH_ACCURACY") high++;
    else if (evalResult.grade === "MODERATE_RELEVANCE") moderate++;
    else low++;
  }

  const avg = Math.round(totalScore / candidates.length);
  const confidenceRating: "HIGH" | "MODERATE" | "LOW" =
    avg >= 80 ? "HIGH" : avg >= 60 ? "MODERATE" : "LOW";

  return {
    averageAccuracyScore: avg,
    exactMatchesCount: exact,
    highAccuracyCount: high,
    moderateAccuracyCount: moderate,
    lowAccuracyCount: low,
    confidenceRating,
    detectedIntent: {
      brand: intent.brand,
      category: intent.category,
      productForm: intent.productForm,
      isSkuSpecific: intent.isSkuSpecific,
    },
  };
}
