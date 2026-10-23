/**
 * @file src/lib/services/seo-title-formatter.ts
 * @description High-intent SEO title & keyword generator for coupons and deals.
 * Transforms raw affiliate network feeds (verified partner networks, CJ, Admitad, etc.) into the canonical
 * Google search format: "{Store Name} Coupon Code: {Code} – {Discount} ({Detail})".
 */

export function cleanHtmlEntities(str?: string): string {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[\uFFFD\u00BF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function cleanStoreName(name?: string): string {
  if (!name) return "Store";
  let s = cleanHtmlEntities(name).trim();
  // Capitalize properly if all-lowercase or all-uppercase
  if (s === s.toLowerCase() || (s === s.toUpperCase() && s.length > 4)) {
    s = s
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  return s;
}

export function extractCleanDetail(rawTitle?: string, storeName?: string, discount?: string): string {
  let text = cleanHtmlEntities(rawTitle || "");
  const store = cleanStoreName(storeName);

  // 1. Strip raw affiliate campaign prefix junk
  text = text.replace(/^(?:[A-Z0-9]{2,}\s*)?Campaign[-_\s:]+/i, "");
  text = text.replace(/^[A-Z]{2,4}\s*Campaign[-_\s:]+/i, "");
  text = text.replace(/^QR\s*Campaign[-_\s:]*/i, "");

  // Strip international locale tokens (e.g. "Cambodia (KH)/(EN)-", "Malaysia (MY)/ (EN) - ", "Japan (JP)EN-")
  text = text.replace(/(?:[A-Za-z\s]+)?\([A-Z]{2}\)\s*(?:\/\s*\([A-Z]{2}\))?(?:[A-Z]{2})?[-_\s:]*/g, " ");
  text = text.replace(
    /[-_\s/]*(?:\([A-Z]{2}\)|\b(?:KH|EN|MY|JP|ZH|VN|IN|PK|BD|AU|IE|MT|TR|RS|NL|DE|GR|TH|SG|RO|HU|IT|US|GB|UK|CA|AE)\b)(?:\/[-_\s]*(?:\([A-Z]{2}\)|\b(?:KH|EN|MY|JP|ZH|VN|IN|PK|BD|AU|IE|MT|TR|RS|NL|DE|GR|TH|SG|RO|HU|IT|US|GB|UK|CA|AE)\b))*[-_\s:]*/g,
    " "
  );
  text = text.replace(/\b(?:APAC|EMEA|LATAM|NA)\s+(?:Winter|Summer|Spring|Fall|Phase\s*\d*)[-_\s:]*/gi, "");
  text = text.replace(/\bPromocode\b/gi, "");

  // 2. Strip repeated store name from the start
  const sRegex = new RegExp("^" + store.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&") + "[:\\s–-]+", "i");
  text = text.replace(sRegex, "");

  // 3. Strip generic marketing fluff prefixes
  text = text.replace(
    /^(?:FLASH SALE|SPECIAL OFFER|LIMITED TIME OFFER|EXCLUSIVE OFFER|BEST DEAL|ENJOY|SAVE|GET|SCORE|UNLOCK|GRAB|HOT DEAL)[:\s–-]+/i,
    ""
  );

  // 4. Strip redundant discount prefix if it matches the discount string
  if (discount) {
    const num = discount.match(/([0-9]+%?)/);
    if (num) {
      const discRegex = new RegExp("^(?:up to\\s*)?" + num[1] + "\\s*(?:off|discount|savings)[:\\s–-]+", "i");
      text = text.replace(discRegex, "");
    }
  }

  // 5. Clean punctuation & non-latin garbage
  text = text
    .replace(/[?*]+/g, "")
    .replace(/^[-–:,\s|/]+|[-–:,\s|/]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // If text became too short or empty, provide sensible fallback
  if (!text || text.length < 3) {
    text = discount ? `${discount} Sitewide Savings` : "Verified Discount Offer";
  } else {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  return text;
}

/**
 * Returns a high-CTR, Google SEO search-optimized title that matches queries like
 * "hostinger coupon code", "boat coupon code", "croma coupon code", etc.
 */
export function formatSeoCouponTitle(
  storeName?: string,
  rawCode?: string,
  discount?: string,
  rawTitle?: string
): string {
  const store = cleanStoreName(storeName);
  const existingTitle = cleanHtmlEntities(rawTitle || "");

  // If the title already adheres to the canonical "[Store] Coupon Code" format, preserve it
  const canonicalCheck = new RegExp(`^${store.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\s+Coupon Code`, "i");
  if (canonicalCheck.test(existingTitle)) {
    return existingTitle;
  }

  const hasCode =
    Boolean(rawCode) &&
    (rawCode || "").length > 1 &&
    !/^(deal|none|na|null|undefined|deal activated|activateoffer)$/i.test(rawCode || "");
  const code = hasCode ? (rawCode || "").toUpperCase().trim() : "";
  const detail = extractCleanDetail(existingTitle, store, discount);
  const disc = discount && discount !== "Verified Deal" ? discount : "";

  let finalTitle = "";
  if (code) {
    if (disc) {
      finalTitle = `${store} Coupon Code: ${code} – ${disc} (${detail})`;
    } else {
      finalTitle = `${store} Coupon Code: ${code} – ${detail}`;
    }
  } else {
    if (disc) {
      finalTitle = `${store} Coupon Code: ${disc} – ${detail}`;
    } else {
      finalTitle = `${store} Coupon Code & Promo: ${detail}`;
    }
  }

  // Cap at 95 characters for search engine title tag and card display sanity
  if (finalTitle.length > 95) {
    const budget = 95 - `${store} Coupon Code: ${code ? `${code} – ` : ""}${disc ? `${disc} ` : ""}()`.length;
    if (budget > 10) {
      let trimmed = detail.slice(0, budget).trim();
      const lastSpace = trimmed.lastIndexOf(" ");
      if (lastSpace > 8) trimmed = trimmed.slice(0, lastSpace);
      finalTitle = code
        ? `${store} Coupon Code: ${code} – ${disc ? `${disc} ` : ""}(${trimmed}...)`
        : `${store} Coupon Code: ${disc ? `${disc} – ` : ""}${trimmed}...`;
    } else {
      finalTitle = code
        ? `${store} Coupon Code: ${code} – ${disc || "Verified"}`
        : `${store} Coupon Code: ${disc || "Verified"} Offer`;
    }
  }

  return finalTitle;
}

/**
 * Generates an exhaustive list of high-intent Google search keywords for SEO & local search indexing.
 */
export function generateSeoKeywords(storeName?: string, rawCode?: string): string[] {
  const store = cleanStoreName(storeName).toLowerCase();
  const code = rawCode && rawCode.length > 1 && !/^(deal|none|na|null|undefined)$/i.test(rawCode)
    ? rawCode.toUpperCase().trim()
    : null;

  const keywords = [
    `${store} coupon code`,
    `${store} coupon`,
    `${store} coupons`,
    `${store} promo code`,
    `${store} promo codes`,
    `${store} discount code`,
    `${store} discount coupon`,
    `coupon code for ${store}`,
    `promo code for ${store}`,
    `${store} vouchers`,
    `${store} offers today`,
    `${store} promo code 2026`,
  ];

  if (code) {
    keywords.push(
      `${code.toLowerCase()} coupon code`,
      `coupon code ${code.toLowerCase()}`,
      `${store} code ${code.toLowerCase()}`,
      `${store} coupon ${code.toLowerCase()}`
    );
  }

  return keywords;
}
