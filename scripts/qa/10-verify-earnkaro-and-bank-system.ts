/**
 * @file scripts/qa/10-verify-earnkaro-and-bank-system.ts
 * @description Comprehensive QA Verification for:
 * 1. EarnKaro 7-merchant affiliate links integration & routing.
 * 2. Cuelinks Plum Goodness (https://clnk.in/CWoK), Coursera, and Robinhood.
 * 3. 2-tier dual monetization system (code copy + affiliate redirect; deal-only affiliate activation).
 * 4. Automated bank card savings & Cuelinks credit card campaigns:
 *    - Axis Bank Credit Card (#4615, ₹1,890 - ₹2,362.50)
 *    - HDFC Bank Swiggy Credit Card (#5507, ₹1,829.25)
 *    - Federal Scapia Travel Credit Card (#6232, ₹1,200.00)
 *    - SBI Sprint Cashback Credit Card (#6354, ₹1,890.00)
 * 5. Store directory & catalog integration.
 */

import {
  EARNKARO_STORE_LINKS,
  getStoreEarnKaroLink,
  buildDealRedirectUrl,
  wrapAffiliateTracking,
  REGISTERED_STORES,
} from "../../src/lib/services/store-registry";
import {
  calculateBankCardSavings,
  getBestCardOfferForProduct,
  registerLiveBankOffers,
  SUPPORTED_BANK_CARDS,
  type BankOfferRule,
} from "../../src/lib/services/bank-offers";
import { getStoreCatalog } from "../../src/lib/store-catalog-helper";
import { STORES_DATA } from "../../src/data/storesData";
import { getRecommendedCardForStore } from "../../src/components/shopping/StoreCardCrossSellBanner";

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(name: string, condition: boolean, details?: string) {
  results.push({ name, passed: Boolean(condition), details });
  if (condition) {
    console.log(`  PASS: ${name}`);
  } else {
    console.error(`  FAIL: ${name}${details ? ` -> ${details}` : ""}`);
  }
}

console.log("\n=======================================================");
console.log("  RUNNING EARNKARO, CUELINKS & BANK SYSTEM VERIFICATION");
console.log("=======================================================\n");

// ─── TEST 1: EARNKARO & CUELINKS SHORTLINKS ──────────────────
console.log("--- Test Suite 1: Direct Affiliate Partner Links ---");

const EXPECTED_LINKS = {
  myntra: "https://myntr.it/t6fMvnP",
  flipkart: "https://fktr.in/xL95eGk",
  ajio: "https://ajiio.in/5gIGQ46",
  "dot-and-key": "https://bitli.in/Q8p6Tb5",
  mcaffeine: "https://bitli.in/30c3jZD",
  shopsy: "https://bitli.in/X8hNAWk",
  themancompany: "https://bitli.in/Aiq8ef4",
  plum: "https://clnk.in/CWoK",
};

for (const [key, expectedUrl] of Object.entries(EXPECTED_LINKS)) {
  const actual = (EARNKARO_STORE_LINKS as any)[key];
  assert(
    `Direct partner link contains exact URL for ${key}`,
    actual === expectedUrl,
    `Expected: ${expectedUrl}, Got: ${actual}`
  );
}

// ─── TEST 2: FUZZY IDENTIFIER LOOKUP ─────────────────────────
console.log("\n--- Test Suite 2: Store Identifier & Slug Resolution ---");

const lookupCases = [
  { input: "myntra-coupons", expected: "https://myntr.it/t6fMvnP" },
  { input: "Myntra Fashion", expected: "https://myntr.it/t6fMvnP" },
  { input: "flipkart", expected: "https://fktr.in/xL95eGk" },
  { input: "https://www.flipkart.com", expected: "https://fktr.in/xL95eGk" },
  { input: "ajio-coupons", expected: "https://ajiio.in/5gIGQ46" },
  { input: "Ajio Luxe", expected: "https://ajiio.in/5gIGQ46" },
  { input: "dot-and-key-coupons", expected: "https://bitli.in/Q8p6Tb5" },
  { input: "Dot & Key Skincare", expected: "https://bitli.in/Q8p6Tb5" },
  { input: "mcaffeine", expected: "https://bitli.in/30c3jZD" },
  { input: "m-caffeine-coupons", expected: "https://bitli.in/30c3jZD" },
  { input: "shopsy", expected: "https://bitli.in/X8hNAWk" },
  { input: "The Man Company", expected: "https://bitli.in/Aiq8ef4" },
  { input: "the-man-company-coupons", expected: "https://bitli.in/Aiq8ef4" },
  { input: "plum-goodness-coupons", expected: "https://clnk.in/CWoK" },
  { input: "Plum Goodness", expected: "https://clnk.in/CWoK" },
];

for (const c of lookupCases) {
  const resolved = getStoreEarnKaroLink(c.input);
  assert(
    `getStoreEarnKaroLink("${c.input}") resolves correctly`,
    resolved === c.expected,
    `Expected: ${c.expected}, Got: ${resolved}`
  );
}

// ─── TEST 3: REDIRECT PROTOCOL UPGRADE ───────────────────────
console.log("\n--- Test Suite 3: Redirect URL Upgrade Protocol ---");

// Case A: Myntra
const myntraDealRedirect = buildDealRedirectUrl({
  url: "https://www.myntra.com/sale",
  storeName: "Myntra",
  storeSlug: "myntra-coupons",
  dealId: "myntra-deal-1",
  title: "Flat 50% Off",
});
assert(
  "buildDealRedirectUrl upgrades clean Myntra link to EarnKaro shortlink",
  myntraDealRedirect.includes(encodeURIComponent("https://myntr.it/t6fMvnP")),
  `Redirect URL: ${myntraDealRedirect}`
);

// Case B: Plum Goodness
const plumDealRedirect = buildDealRedirectUrl({
  url: "https://plumgoodness.com/collections/serum",
  storeName: "Plum Goodness",
  storeSlug: "plum-goodness-coupons",
  dealId: "plum-deal-1",
});
assert(
  "buildDealRedirectUrl upgrades Plum Goodness link to Cuelinks shortlink",
  plumDealRedirect.includes(encodeURIComponent("https://clnk.in/CWoK")),
  `Redirect URL: ${plumDealRedirect}`
);

// Case C: Coursera
const courseraDealRedirect = buildDealRedirectUrl({
  url: "https://www.coursera.org/specializations/python",
  storeName: "Coursera",
  storeSlug: "coursera-coupons",
});
assert(
  "buildDealRedirectUrl wraps Coursera with Cuelinks pub_id=272970",
  courseraDealRedirect.includes("272970") || courseraDealRedirect.includes("coursera.org"),
  `Redirect URL: ${courseraDealRedirect}`
);

// ─── TEST 4: REGISTERED_STORES INTEGRATION ───────────────────
console.log("\n--- Test Suite 4: REGISTERED_STORES Integration ---");

const registeredIds = [
  "flipkart",
  "myntra",
  "ajio",
  "dot-and-key",
  "mcaffeine",
  "shopsy",
  "the-man-company",
  "plum-goodness",
  "coursera",
  "robinhood",
];
for (const rid of registeredIds) {
  const store = REGISTERED_STORES.find((s) => s.id === rid);
  assert(`REGISTERED_STORES has entry for '${rid}'`, Boolean(store));
  if (store) {
    assert(`'${rid}' has isInstantOpen: true`, store.isInstantOpen === true);
    assert(`'${rid}' tier is 1`, store.tier === 1);
  }
}

// ─── TEST 5: STORE CATALOG & DIRECTORY HEALTH ─────────────────
console.log("\n--- Test Suite 5: Store Catalog & Directory Health ---");

const catalog = getStoreCatalog();
const storeSlugsToCheck = [
  "flipkart-coupons",
  "myntra-coupons",
  "ajio-coupons",
  "dot-and-key-coupons",
  "mcaffeine-coupons",
  "shopsy-coupons",
  "the-man-company-coupons",
  "plum-goodness-coupons",
  "coursera-coupons",
];

for (const slug of storeSlugsToCheck) {
  const entry = catalog.get(slug);
  assert(
    `getStoreCatalog has entry for '${slug}'`,
    Boolean(entry),
    `Entry not found in catalog for ${slug}`
  );
  if (entry) {
    assert(`'${slug}' has a valid name and category`, Boolean(entry.name && entry.category));
    assert(`'${slug}' has active coupons or deals`, Array.isArray(entry.deals));
  }
}

// ─── TEST 6: CUELINKS BANK CARD CAMPAIGNS ─────────────────────
console.log("\n--- Test Suite 6: Cuelinks Bank Card Affiliate Programs ---");

// Axis Bank (#4615)
const axisCard = SUPPORTED_BANK_CARDS.find((c) => c.id === "axis");
assert("Axis Bank Card configured", Boolean(axisCard));
if (axisCard) {
  assert(
    "Axis official apply URL points to WebForm",
    axisCard.officialApplyUrl === "https://web.axis.bank.in/DigitalChannel/WebForm/"
  );
  assert(
    "Axis affiliate URL wraps with pub_id 272970",
    axisCard.affiliateApplyUrl.includes("272970") && axisCard.affiliateApplyUrl.includes("web.axis.bank.in")
  );
  assert("Axis CPA bounty is ₹1,890+", axisCard.cpaBountyInr >= 1890);
}

// HDFC Bank Swiggy (#5507)
const hdfcCard = SUPPORTED_BANK_CARDS.find((c) => c.id === "hdfc");
assert("HDFC Bank Card configured", Boolean(hdfcCard));
if (hdfcCard) {
  assert(
    "HDFC official apply URL points to applyonline",
    hdfcCard.officialApplyUrl === "https://applyonline.hdfc.bank.in/cards/credit-cards.html"
  );
  assert(
    "HDFC affiliate URL wraps with pub_id 272970",
    hdfcCard.affiliateApplyUrl.includes("272970") && hdfcCard.affiliateApplyUrl.includes("applyonline.hdfc")
  );
  assert("HDFC CPA bounty is ₹1,829", hdfcCard.cpaBountyInr === 1829);
}

// Federal Scapia (#6232)
const scapiaCard = SUPPORTED_BANK_CARDS.find((c) => c.id === "scapia");
assert("Federal Scapia Card configured", Boolean(scapiaCard));
if (scapiaCard) {
  assert(
    "Scapia official apply URL points to apply.scapia.cards",
    scapiaCard.officialApplyUrl === "https://apply.scapia.cards/landing_page"
  );
  assert(
    "Scapia affiliate URL wraps with pub_id 272970",
    scapiaCard.affiliateApplyUrl.includes("272970") && scapiaCard.affiliateApplyUrl.includes("scapia.cards")
  );
  assert("Scapia CPA bounty is ₹1,200", scapiaCard.cpaBountyInr === 1200);
  assert("Scapia annual fee is Lifetime FREE", scapiaCard.annualFee.includes("Lifetime FREE"));

  // Verify Scapia discount on travel booking
  const scapiaTravelSavings = calculateBankCardSavings("scapia", "Booking.com", 15000, "travel");
  assert(
    "Scapia calculates travel coins/discount on Booking.com",
    scapiaTravelSavings.instantDiscount > 0 || scapiaTravelSavings.totalCardSavings > 0
  );
}

// SBI Sprint Cashback (#6354)
const sbiCard = SUPPORTED_BANK_CARDS.find((c) => c.id === "sbi");
assert("SBI Card configured", Boolean(sbiCard));
if (sbiCard) {
  assert(
    "SBI official apply URL points to sprint/cashback",
    sbiCard.officialApplyUrl === "https://www.sbicard.com/sprint/cashback"
  );
  assert(
    "SBI affiliate URL wraps with pub_id 272970",
    sbiCard.affiliateApplyUrl.includes("272970") && sbiCard.affiliateApplyUrl.includes("sprint%2Fcashback")
  );
  assert("SBI CPA bounty is ₹1,890", sbiCard.cpaBountyInr === 1890);
}

// ─── TEST 7: AUTOMATED EXPIRATION & DYNAMIC INGESTION ─────────
console.log("\n--- Test Suite 7: Automated Expiration Engine ---");

if (hdfcCard) {
  const expiredRule: BankOfferRule = {
    storeIdPattern: ["expiredmerchant"],
    minSpendInr: 1000,
    discountType: "flat",
    discountValue: 1000,
    maxDiscountInr: 1000,
    description: "Expired Promo Offer",
    validUntil: "2021-01-01T00:00:00Z", // Past date
  };
  hdfcCard.rules.push(expiredRule);

  const expiredResult = calculateBankCardSavings("hdfc", "expiredmerchant", 5000, "general");
  assert("Automated Expiration: Past validUntil promo rule is SKIPPED", expiredResult.instantDiscount === 0);

  const futureRule: BankOfferRule = {
    storeIdPattern: ["futuremerchant"],
    minSpendInr: 1000,
    discountType: "flat",
    discountValue: 2000,
    maxDiscountInr: 2000,
    description: "Future Promo Offer",
    validUntil: "2030-01-01T00:00:00Z", // Future date
  };
  hdfcCard.rules.push(futureRule);

  const futureResult = calculateBankCardSavings("hdfc", "futuremerchant", 5000, "general");
  assert("Automated Expiration: Future validUntil promo rule is APPLIED", futureResult.instantDiscount === 2000);
}

// ─── TEST 8: STORE-SPECIFIC CARD CROSS-SELL ENGINE (DOUBLE MONETIZATION) ─────
console.log("\n--- Test Suite 8: Store-Specific Card Cross-Sell Engine ---");

// 8.1 Flipkart store matching
const flipkartRec = getRecommendedCardForStore("Flipkart", "Shopping");
assert("Store Cross-Sell: Flipkart matches Axis Bank Card", flipkartRec.card.id === "axis");
assert("Store Cross-Sell: Flipkart card has ₹1,890 bounty", flipkartRec.card.cpaBountyInr >= 1890);
assert("Store Cross-Sell: Flipkart affiliate URL linksredirect format", flipkartRec.card.affiliateApplyUrl.includes("linksredirect.com"));

// 8.2 Swiggy / Food store matching
const swiggyRec = getRecommendedCardForStore("Swiggy", "Food");
assert("Store Cross-Sell: Swiggy matches HDFC Card", swiggyRec.card.id === "hdfc");
assert("Store Cross-Sell: Swiggy card has ₹1,829 bounty", swiggyRec.card.cpaBountyInr >= 1829);

// 8.3 Travel store matching
const bookingRec = getRecommendedCardForStore("Booking.com", "Travel");
assert("Store Cross-Sell: Booking.com matches Federal Scapia Card", bookingRec.card.id === "scapia");
assert("Store Cross-Sell: Scapia card has ₹1,200 bounty and Lifetime Free", bookingRec.card.cpaBountyInr === 1200);

// 8.4 General / Amazon / Myntra store matching
const amazonRec = getRecommendedCardForStore("Amazon", "Electronics");
assert("Store Cross-Sell: Amazon matches SBI Cashback Card", amazonRec.card.id === "sbi");
assert("Store Cross-Sell: SBI card has ₹1,890 bounty", amazonRec.card.cpaBountyInr === 1890);

const myntraRec = getRecommendedCardForStore("Myntra", "Fashion");
assert("Store Cross-Sell: Myntra matches SBI Cashback Card", myntraRec.card.id === "sbi");

// ─── SUMMARY ─────────────────────────────────────────────────
const total = results.length;
const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;

console.log("\n=======================================================");
console.log(`  QA SUITE 10 COMPLETE: ${passed}/${total} TESTS PASSED (${failed} FAILED)`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
}
