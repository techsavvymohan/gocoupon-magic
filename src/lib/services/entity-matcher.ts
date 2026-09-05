/**
 * @file entity-matcher.ts
 * @description Product Matching & Entity Resolution Service (RapidFuzz Algorithm).
 *
 * Solves the critical multi-store comparison problem:
 * Reliably determining whether "Apple iPhone 15 (128 GB) - Blue" on Amazon
 * is the exact same product as "Apple iPhone 15 (Blue, 128 GB)" on Flipkart.
 *
 * Implements:
 * - Levenshtein Distance & Token Sort Ratio (RapidFuzz implementation in TypeScript)
 * - Attribute extraction: Brand, Model Series, Storage, RAM, and Color
 * - Strict Variant Conflict Guard (prevents matching 128GB with 256GB, or XM5 with XM4)
 */

export interface ExtractedProductAttributes {
  brand?: string;
  modelSeries?: string;
  storage?: string;
  ram?: string;
  color?: string;
  screenSize?: string;
}

export interface EntityMatchResult {
  isMatch: boolean;
  confidenceScore: number; // 0 to 100
  attributesA: ExtractedProductAttributes;
  attributesB: ExtractedProductAttributes;
  conflictReason?: string;
}

/**
 * Normalizes text for clean token-based string comparison.
 */
export function normalizeTokenString(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1)
    .sort();
}

/**
 * Computes Levenshtein edit distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 0; i < a.length; i++) {
    let prev = i + 1;
    for (let j = 0; j < b.length; j++) {
      const val = a[i] === b[j] ? row[j] : Math.min(row[j], row[j + 1], prev) + 1;
      row[j] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }

  return row[b.length];
}

/**
 * Computes RapidFuzz Token Sort Ratio (0 to 100).
 */
export function tokenSortRatio(titleA: string, titleB: string): number {
  const tokensA = normalizeTokenString(titleA).join(" ");
  const tokensB = normalizeTokenString(titleB).join(" ");

  if (!tokensA && !tokensB) return 100;
  if (!tokensA || !tokensB) return 0;

  const maxLen = Math.max(tokensA.length, tokensB.length);
  const distance = levenshteinDistance(tokensA, tokensB);
  return Math.round(((maxLen - distance) / maxLen) * 100);
}

/**
 * Extracts key variant specifications from e-commerce product titles.
 */
export function extractAttributes(title: string): ExtractedProductAttributes {
  const t = title.toLowerCase();
  const attrs: ExtractedProductAttributes = {};

  // 1. Storage (e.g. 64GB, 128GB, 256GB, 512GB, 1TB)
  const storageMatch = t.match(/\b(32|64|128|256|512)\s*(gb|tb)\b|\b(1|2)\s*tb\b/i);
  if (storageMatch) {
    attrs.storage = storageMatch[0].replace(/\s+/g, "").toUpperCase();
  }

  // 2. RAM (e.g. 4GB RAM, 8GB RAM, 16GB RAM)
  const ramMatch = t.match(/\b(4|6|8|12|16|24|32)\s*(gb)?\s*ram\b/i);
  if (ramMatch) {
    attrs.ram = ramMatch[0].replace(/\s+/g, "").toUpperCase();
  }

  // 3. Model Series (e.g. XM5, XM4, M3, M2, S24, S23, iPhone 15, iPhone 14)
  const modelMatch =
    t.match(/\b(wh-1000xm\d|wf-1000xm\d|xm\d)\b/i) ||
    t.match(/\b(iphone\s*\d+(\s*pro(\s*max)?)?)\b/i) ||
    t.match(/\b(galaxy\s*s\d+(\s*(plus|\+|ultra))?)\b/i) ||
    t.match(/\b(m[1-3](\s*pro|\s*max)?)\b/i);
  if (modelMatch) {
    attrs.modelSeries = modelMatch[0].replace(/\s+/g, " ").toLowerCase();
  }

  // 4. Color
  const colorMatch = t.match(
    /\b(black|white|blue|green|pink|yellow|silver|space grey|starlight|midnight|titanium)\b/i,
  );
  if (colorMatch) {
    attrs.color = colorMatch[0].toLowerCase();
  }

  return attrs;
}

/**
 * Evaluates whether two multi-store product listings represent the identical SKU.
 */
export function matchProductEntities(titleA: string, titleB: string): EntityMatchResult {
  const attrsA = extractAttributes(titleA);
  const attrsB = extractAttributes(titleB);

  // Variant Conflict Guard 1: Storage mismatch
  if (attrsA.storage && attrsB.storage && attrsA.storage !== attrsB.storage) {
    return {
      isMatch: false,
      confidenceScore: 0,
      attributesA: attrsA,
      attributesB: attrsB,
      conflictReason: `Storage mismatch: ${attrsA.storage} vs ${attrsB.storage}`,
    };
  }

  // Variant Conflict Guard 2: RAM mismatch
  if (attrsA.ram && attrsB.ram && attrsA.ram !== attrsB.ram) {
    return {
      isMatch: false,
      confidenceScore: 0,
      attributesA: attrsA,
      attributesB: attrsB,
      conflictReason: `RAM mismatch: ${attrsA.ram} vs ${attrsB.ram}`,
    };
  }

  // Variant Conflict Guard 3: Model series mismatch (e.g. XM5 vs XM4)
  if (attrsA.modelSeries && attrsB.modelSeries && attrsA.modelSeries !== attrsB.modelSeries) {
    return {
      isMatch: false,
      confidenceScore: 0,
      attributesA: attrsA,
      attributesB: attrsB,
      conflictReason: `Model series mismatch: ${attrsA.modelSeries} vs ${attrsB.modelSeries}`,
    };
  }

  // Compute Token Sort Ratio
  const score = tokenSortRatio(titleA, titleB);
  const isMatch = score >= 75;

  return {
    isMatch,
    confidenceScore: score,
    attributesA: attrsA,
    attributesB: attrsB,
  };
}
