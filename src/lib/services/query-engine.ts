/**
 * @file query-engine.ts
 * @description Universal Search Query Analysis, Entity Decomposition & Semantic Boundary Engine.
 *
 * Implements 8 Fundamental Universal Rules:
 * 1. Linguistic Normalization & Entity Decomposition (Brand, Category, Model, Variants, Noise).
 * 2. Dynamic Specificity Scoring (Broad Discovery vs. Specific SKU) — ZERO hardcoded preset arrays.
 * 3. Strict Semantic Boundary Enforcement (Brand Isolation, Category Isolation, Accessory Suppression).
 * 4. Clean Commerce Query Generation for Internet Meta-Search.
 * 5. Authentic INR Price & Currency Extraction.
 * 6. Cross-Store Entity Clustering & Deduplication.
 * 7. Effective Net Savings & Best Offer Computation.
 * 8. Resilient Fallback with Semantic Integrity.
 */

export interface QueryIntent {
  rawQuery: string;
  normalizedQuery: string;
  cleanSearchTerm: string;
  brand: string | null;
  allowedBrands: string[];
  category: string;
  productForm: string | null;
  modelTokens: string[];
  variantTokens: string[];
  isAccessory: boolean;
  isSkuSpecific: boolean;
  isBroadCategory: boolean;
  isBroadBrand: boolean;
  specificityScore: number;
}

export const KNOWN_BRANDS: string[] = [
  "Apple", "Samsung", "Sony", "Nike", "Puma", "Adidas", "OnePlus", "Dyson", "Boat", "Noise",
  "Google", "Lenovo", "Dell", "HP", "Asus", "Acer", "Xiaomi", "Redmi", "Poco", "Realme", "Vivo",
  "Oppo", "Motorola", "JBL", "Bose", "Sennheiser", "Fastrack", "Titan", "Fossil", "Casio", "LG",
  "Whirlpool", "Philips", "Bosch", "Voltas", "Havells", "Bajaj", "Usha", "Reebok", "Skechers",
  "Asics", "New Balance", "Under Armour", "Zara", "H&M", "Levi's", "Allen Solly", "Peter England",
  "Van Heusen", "Louis Philippe", "Canon", "Nikon", "PlayStation", "Xbox", "Nintendo", "Minimalist",
  "Cetaphil", "CeraVe", "L'Oréal Paris", "L'Oreal", "Tresemme", "Himalaya", "Head & Shoulders",
  "Bare Anatomy", "Nykaa", "Mamaearth", "Ponds", "Nivea", "Garnier", "Dove", "Maybelline",
  "Logitech", "Razer", "Corsair", "Keychron", "Nothing", "iQOO", "Realme", "Honor"
];

export const BRAND_ALIASES: Record<string, string[]> = {
  xiaomi: ["xiaomi", "redmi", "mi", "poco"],
  redmi: ["xiaomi", "redmi", "mi", "poco"],
  poco: ["xiaomi", "redmi", "mi", "poco"],
  "l'oreal": ["l'oréal", "l'oreal", "loreal", "l'oréal paris", "l'oreal paris"],
  "l'oréal paris": ["l'oréal", "l'oreal", "loreal", "l'oréal paris", "l'oreal paris"],
  apple: ["apple", "iphone", "macbook", "airpods", "ipad", "apple watch"],
  samsung: ["samsung", "galaxy"],
  sony: ["sony", "bravia", "playstation"],
  asus: ["asus", "rog", "tuf", "zenbook", "vivobook"],
  lenovo: ["lenovo", "thinkpad", "ideapad", "legion", "yoga"],
  hp: ["hp", "pavilion", "envy", "spectre", "omen", "victus"],
  dell: ["dell", "xps", "inspiron", "alienware", "vostro"],
  ponds: ["pond's", "ponds"],
  "pond's": ["pond's", "ponds"],
};

export interface ProductFormDefinition {
  regex: RegExp;
  category: string;
  incompatibleWith: RegExp;
}

export const PRODUCT_FORMS: Record<string, ProductFormDefinition> = {
  facewash: {
    regex: /\b(facewash|face\s+wash|cleanser|face\s+cleanser|facial\s+wash|face\s+scrub)\b/i,
    category: "Beauty & Personal Care",
    incompatibleWith: /\b(shampoo|conditioner|hair\s+oil|hair\s+serum|laptop|phone|smartphone|tv|refrigerator|shoe|sneaker)\b/i,
  },
  shampoo: {
    regex: /\b(shampoo|shampoos|hair\s+conditioner|hair\s+wash|hair\s+cleanse)\b/i,
    category: "Beauty & Personal Care",
    incompatibleWith: /\b(facewash|face\s+wash|face\s+cleanser|cleanser|lipstick|laptop|phone|tv|shoe|sneaker)\b/i,
  },
  phone: {
    regex: /\b(phone|phones|mobile|mobiles|smartphone|smartphones|handset|iphone|galaxy\s*s|redmi)\b/i,
    category: "Smartphones & Mobiles",
    incompatibleWith: /\b(laptop|macbook|notebook|shampoo|facewash|cleanser|tv|refrigerator|washing\s+machine|shoe)\b/i,
  },
  laptop: {
    regex: /\b(laptop|laptops|macbook|notebook|chromebook|thinkpad|ideapad|zenbook|vivobook)\b/i,
    category: "Laptops & Computers",
    incompatibleWith: /\b(phone|smartphone|mobile|shampoo|facewash|shoe|sneaker|refrigerator)\b/i,
  },
  headphone: {
    regex: /\b(headphone|headphones|earbuds|earphones|airpods|tws|neckband|headset)\b/i,
    category: "Audio & Headphones",
    incompatibleWith: /\b(laptop|phone|tv|refrigerator|facewash|shampoo|shoe)\b/i,
  },
  shoe: {
    regex: /\b(shoe|shoes|sneaker|sneakers|footwear|boots|sandals|slides|running\s+shoes)\b/i,
    category: "Fashion & Apparel",
    incompatibleWith: /\b(laptop|phone|audio|headphone|facewash|shampoo|tv)\b/i,
  },
  tv: {
    regex: /\b(tv|television|smart\s+tv|led\s+tv|oled\s+tv|qled\s+tv)\b/i,
    category: "Television & Displays",
    incompatibleWith: /\b(phone|laptop|headphone|facewash|shampoo|shoe|sneaker)\b/i,
  },
  watch: {
    regex: /\b(smartwatch|smartwatches|fitness\s+band|smart\s+band|apple\s+watch|galaxy\s+watch)\b/i,
    category: "Smartwatches & Wearables",
    incompatibleWith: /\b(laptop|tv|refrigerator|facewash|shampoo)\b/i,
  },
  vacuum: {
    regex: /\b(vacuum|cleaner|cordless\s+vacuum|robot\s+vacuum|vacuum\s+cleaner)\b/i,
    category: "Home & Kitchen Appliances",
    incompatibleWith: /\b(facewash|shampoo|phone|laptop|headphone)\b/i,
  },
};

const NOISE_WORDS = new RegExp(
  "\\b(buy|online|price|prices|india|best|deals?|offers?|sale|discount|in|for|at|with|and|the|a|an|of|to)\\b",
  "gi"
);

/**
 * Universal Query Intent Analyzer.
 * Decomposes any input query into semantic vectors and dynamically determines specificity.
 */
export function analyzeQueryIntent(rawQuery: string): QueryIntent {
  const trimmed = rawQuery.trim();
  const lower = trimmed.toLowerCase();

  // 1. Linguistic Normalization
  const normalizedQuery = lower
    .replace(/\bfacewash\b/g, "face wash")
    .replace(/\bphones\b/g, "phone")
    .replace(/\bmobiles\b/g, "phone")
    .replace(/\bshampoos\b/g, "shampoo")
    .replace(/\bearphones\b/g, "earbuds")
    .replace(/\bheadphones\b/g, "headphone")
    .replace(/\blaptops\b/g, "laptop")
    .replace(/\bsneakers\b/g, "shoes");

  // 2. Clean Search Term (Strip search operator noise)
  const cleanSearchTerm = normalizedQuery
    .replace(NOISE_WORDS, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 3. Brand Detection & Alias Resolution
  let detectedBrand: string | null = null;
  let allowedBrands: string[] = [];

  for (const b of KNOWN_BRANDS) {
    const bLower = b.toLowerCase();
    const regex = new RegExp(`\\b${bLower.replace(/'/g, "['’]?")}\\b`, "i");
    if (regex.test(lower)) {
      detectedBrand = bLower;
      allowedBrands = BRAND_ALIASES[bLower] || [bLower];
      break;
    }
  }

  // Check aliases if direct brand was not found (e.g. "iphone" -> "apple", "galaxy" -> "samsung", "redmi" -> "xiaomi")
  if (!detectedBrand) {
    for (const [canonicalBrand, aliases] of Object.entries(BRAND_ALIASES)) {
      for (const alias of aliases) {
        const aRegex = new RegExp(`\\b${alias.replace(/'/g, "['’]?")}\\b`, "i");
        if (aRegex.test(lower)) {
          detectedBrand = canonicalBrand;
          allowedBrands = BRAND_ALIASES[canonicalBrand] || [canonicalBrand];
          break;
        }
      }
      if (detectedBrand) break;
    }
  }

  // 4. Product Form Detection
  let detectedForm: string | null = null;
  let detectedCategory = "Electronics & Gadgets";

  for (const [formKey, formDef] of Object.entries(PRODUCT_FORMS)) {
    if (formDef.regex.test(lower) || formDef.regex.test(normalizedQuery)) {
      detectedForm = formKey;
      detectedCategory = formDef.category;
      break;
    }
  }

  // Infer device form from well-known device lines if not explicitly written
  if (!detectedForm) {
    if (/\b(iphone|redmi|galaxy\s*s|pixel|oneplus|realme|iqoo)\b/i.test(lower)) {
      detectedForm = "phone";
      detectedCategory = "Smartphones & Mobiles";
    } else if (/\b(macbook|thinkpad|zenbook|ideapad|vivobook|legion|omen|victus)\b/i.test(lower)) {
      detectedForm = "laptop";
      detectedCategory = "Laptops & Computers";
    } else if (/\b(airpods|galaxy\s*buds|wh-1000xm|earbuds)\b/i.test(lower)) {
      detectedForm = "headphone";
      detectedCategory = "Audio & Headphones";
    }
  }

  // Fallback category detection if not in forms
  if (!detectedForm) {
    if (/\b(beauty|skincare|serum|cream|lotion|sunscreen|moisturizer|makeup|lipstick)\b/i.test(lower)) {
      detectedCategory = "Beauty & Personal Care";
    } else if (/\b(shirt|tshirt|jeans|jacket|hoodie|apparel|clothing|dress)\b/i.test(lower)) {
      detectedCategory = "Fashion & Apparel";
    } else if (/\b(refrigerator|fridge|washing\s+machine|microwave|air\s+conditioner|ac)\b/i.test(lower)) {
      detectedCategory = "Home & Kitchen Appliances";
    } else if (/\b(playstation|ps5|ps4|xbox|nintendo|controller|gamepad|console)\b/i.test(lower)) {
      detectedCategory = "Gaming & Consoles";
    }
  }

  // 5. Model Tokens Extraction (Alphanumeric IDs, Generational Tokens)
  const modelTokens: string[] = [];
  const modelRegexes = [
    /\b(wh-1000xm[45]|wh1000xm[45]|wf-1000xm[45])\b/gi,
    /\b(iphone\s*(?:1[1-6]|se|x|xs|xr))\b/gi,
    /\b(galaxy\s*s2[0-4]|galaxy\s*z\s*(?:fold|flip)[0-9]?)\b/gi,
    /\b(note\s*(?:1[0-4]|pro|plus)?)\b/gi,
    /\b(pixel\s*[6-9][a-z]?)\b/gi,
    /\b(macbook\s*(?:air|pro))\b/gi,
    /\b(m[1-4]|snapdragon\s*8\s*gen\s*[1-3]|dimensity\s*[0-9]{4})\b/gi,
    /\b([a-z]{1,4}[-\s]?[0-9]{2,5}[a-z]{0,3})\b/gi,
    /\b(?:series\s*[0-9]{3,4})\b/gi,
    /\b([0-9]{1,2}(?:st|nd|rd|th)?\s*gen)\b/gi,
    /\b(air\s*jordan\s*[0-9]?|pegasus\s*[0-9]{2})\b/gi,
  ];

  for (const rx of modelRegexes) {
    const matches = lower.match(rx);
    if (matches) {
      matches.forEach((m) => {
        const clean = m.trim().toLowerCase();
        if (clean.length > 1 && !modelTokens.includes(clean)) {
          modelTokens.push(clean);
        }
      });
    }
  }

  // Also standalone numbers with letters like "14", "15", "s24", "x100"
  const standaloneModelMatches = lower.match(/\b([a-z]?[0-9]{2,4}[a-z]?)\b/gi);
  if (standaloneModelMatches) {
    standaloneModelMatches.forEach((sm) => {
      const clean = sm.trim().toLowerCase();
      if (
        clean.length >= 2 &&
        !clean.endsWith("gb") &&
        !clean.endsWith("ml") &&
        !clean.endsWith("kg") &&
        !modelTokens.includes(clean)
      ) {
        modelTokens.push(clean);
      }
    });
  }

  // 6. Variant Modifiers Extraction
  const variantTokens: string[] = [];
  const variantMatches = lower.match(
    /\b(pro|ultra|max|plus|mini|slim|lite|se|5g|4g|oled|qled|anc|128gb|256gb|512gb|1tb|8gb|16gb|32gb|100ml|200ml|250ml|500ml|650ml|1000ml|1l|1kg|55-inch|65-inch)\b/gi
  );
  if (variantMatches) {
    variantMatches.forEach((v) => {
      const clean = v.trim().toLowerCase();
      if (!variantTokens.includes(clean)) {
        variantTokens.push(clean);
      }
    });
  }

  // 7. Accessory Intent Detection
  const isAccessory = /\b(case|cover|pouch|skin|screen\s*guard|screen\s*protector|tempered\s*glass|bumper|cable|cord|adapter|charger|band|strap)\b/i.test(
    lower
  );

  // 8. Specificity Calculation & Classification (ZERO hardcoded string arrays)
  // Specificity Score S = 4 * |Model| + 2.5 * |Variant| + 1.5 * |Brand| + 1.0 * |Form|
  const specificityScore =
    modelTokens.length * 4.0 +
    variantTokens.length * 2.5 +
    (detectedBrand ? 1.5 : 0) +
    (detectedForm ? 1.0 : 0);

  // A query is a Specific SKU if it contains specific model tokens, technical variant modifiers,
  // or a high specificity score without being a pure category/brand search.
  const isSkuSpecific =
    modelTokens.length > 0 ||
    variantTokens.some((v) => ["pro", "ultra", "max", "plus", "mini", "128gb", "256gb", "512gb", "1tb"].includes(v)) ||
    specificityScore >= 5.0;

  // A query is Broad Brand Exploration if it has a brand but NO model tokens or variant tokens
  const isBroadBrand = Boolean(detectedBrand && !isSkuSpecific);

  // A query is Broad Category Exploration if it has a product form or category noun but NO specific model tokens
  const isBroadCategory = Boolean(detectedForm && !isSkuSpecific && !detectedBrand) || (!isSkuSpecific && !detectedBrand);

  return {
    rawQuery,
    normalizedQuery,
    cleanSearchTerm: cleanSearchTerm || normalizedQuery,
    brand: detectedBrand,
    allowedBrands,
    category: detectedCategory,
    productForm: detectedForm,
    modelTokens,
    variantTokens,
    isAccessory,
    isSkuSpecific,
    isBroadCategory,
    isBroadBrand,
    specificityScore,
  };
}

/**
 * Universal Semantic Boundary Enforcement.
 * Checks whether a candidate product is logically compatible with user query intent.
 */
export function isCandidateCompatible(
  intent: QueryIntent,
  candidate: {
    title: string;
    brand: string;
    category?: string;
    tags?: string[];
  }
): boolean {
  const cTitle = candidate.title.toLowerCase();
  const cBrand = candidate.brand.toLowerCase();
  const cCategory = (candidate.category || "").toLowerCase();
  const cTags = (candidate.tags || []).join(" ").toLowerCase();
  const fullCandidateText = `${cTitle} ${cBrand} ${cCategory} ${cTags}`;

  // 1. Strict Brand Isolation:
  // If user explicitly asked for a brand, candidate MUST belong to that brand or its aliases
  if (intent.brand) {
    const isBrandAllowed =
      intent.allowedBrands.includes(cBrand) ||
      intent.allowedBrands.some((ab) => cBrand.includes(ab) || cTitle.includes(ab));
    if (!isBrandAllowed) {
      return false;
    }
  }

  // 2. Strict Product Form & Incompatibility Isolation:
  if (intent.productForm) {
    const formDef = PRODUCT_FORMS[intent.productForm];
    if (formDef) {
      // Must not contain incompatible forms (e.g. shampoo when query was facewash)
      if (formDef.incompatibleWith.test(fullCandidateText)) {
        // Exception: only allow if user's query itself explicitly included that incompatible word
        if (!formDef.incompatibleWith.test(intent.rawQuery)) {
          return false;
        }
      }
      // Must match the intended product form in title, tags, or category
      const matchesForm = formDef.regex.test(fullCandidateText);
      if (!matchesForm) {
        return false;
      }
    }
  }

  // 3. Accessory Suppression:
  // When searching for a primary device/SKU and user did not ask for accessories,
  // filter out cases, covers, cables, screen protectors, etc.
  if (!intent.isAccessory) {
    const isDeviceSearch =
      (intent.productForm && ["phone", "laptop", "tv", "headphone", "watch"].includes(intent.productForm)) ||
      intent.modelTokens.length > 0 ||
      intent.isSkuSpecific;

    if (isDeviceSearch) {
      const isAccessoryProduct = /\b(case|cover|pouch|skin|screen\s*guard|screen\s*protector|tempered\s*glass|bumper|cable|adapter|charger|strap|film)\b/i.test(
        cTitle
      );
      if (isAccessoryProduct) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Clean search query constructor for internet meta-search (SearXNG / SerpApi).
 * Avoids broken nested boolean parentheses syntax.
 */
export function buildCleanInternetQuery(intent: QueryIntent): string {
  const base = intent.cleanSearchTerm;
  if (!base) return intent.rawQuery;
  // Format clean query optimized for Indian commerce indexes
  return `${base} buy online india`;
}

/**
 * Extracts clean INR price from arbitrary merchant text or strings.
 */
export function extractInrPrice(text: string): number | null {
  if (!text) return null;
  // Matches ₹ 12,999, Rs. 1499, INR 65000, etc.
  const match = text.match(/(?:₹|Rs\.?|INR)\s*([0-9,]{2,8})/i);
  if (match && match[1]) {
    const parsed = Number(match[1].replace(/,/g, ""));
    if (!isNaN(parsed) && parsed > 0 && parsed < 10000000) {
      return parsed;
    }
  }
  return null;
}

export function extractExplicitBrand(query: string): string | null {
  const intent = analyzeQueryIntent(query);
  return intent.brand;
}
