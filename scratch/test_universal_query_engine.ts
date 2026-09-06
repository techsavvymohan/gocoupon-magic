import {
  analyzeQueryIntent,
  isCandidateCompatible,
  buildCleanInternetQuery,
  extractInrPrice,
} from "../src/lib/services/query-engine";
import { searchProductsAcrossPlatforms } from "../src/lib/services/multi-platform-search";

async function runTestSuite() {
  console.log("=================================================");
  console.log("UNIVERSAL SEARCH QUERY ENGINE & RETRIEVAL TESTS");
  console.log("=================================================\n");

  let passes = 0;
  let failures = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passes++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failures++;
    }
  }

  // --- TEST SUITE 1: Query Intent Decomposition & Dynamic Specificity ---
  console.log("--- TEST SUITE 1: Universal Intent Parsing & Dynamic Specificity ---");

  const qXiaomi = analyzeQueryIntent("xiaomi");
  assert(qXiaomi.brand === "xiaomi", "Detects 'xiaomi' brand");
  assert(qXiaomi.isBroadBrand === true, "'xiaomi' is classified as Broad Brand");
  assert(qXiaomi.isSkuSpecific === false, "'xiaomi' is NOT marked as SKU specific");

  const qXiaomiPhones = analyzeQueryIntent("xiaomi phones");
  assert(qXiaomiPhones.brand === "xiaomi", "Detects 'xiaomi' brand in 'xiaomi phones'");
  assert(qXiaomiPhones.productForm === "phone", "Detects 'phone' form in 'xiaomi phones'");
  assert(qXiaomiPhones.isSkuSpecific === false, "'xiaomi phones' is NOT marked as SKU specific");

  const qVivo = analyzeQueryIntent("vivo");
  assert(qVivo.brand === "vivo", "Detects 'vivo' brand");
  assert(qVivo.isBroadBrand === true, "'vivo' is Broad Brand");

  const qFacewash = analyzeQueryIntent("facewash");
  assert(qFacewash.productForm === "facewash", "Detects 'facewash' form");
  assert(qFacewash.category === "Beauty & Personal Care", "'facewash' belongs to Beauty & Personal Care");
  assert(qFacewash.isBroadCategory === true, "'facewash' is Broad Category");
  assert(qFacewash.isSkuSpecific === false, "'facewash' is NOT SKU specific");

  const qShampoo = analyzeQueryIntent("shampoo");
  assert(qShampoo.productForm === "shampoo", "Detects 'shampoo' form");
  assert(qShampoo.category === "Beauty & Personal Care", "'shampoo' belongs to Beauty & Personal Care");
  assert(qShampoo.isBroadCategory === true, "'shampoo' is Broad Category");

  const qIPhone15Pro = analyzeQueryIntent("iPhone 15 Pro 128GB");
  assert(qIPhone15Pro.brand === "apple", "Detects 'apple' brand in 'iPhone 15 Pro'");
  assert(qIPhone15Pro.modelTokens.length > 0, "Extracts model token for iPhone 15");
  assert(qIPhone15Pro.isSkuSpecific === true, "'iPhone 15 Pro 128GB' is classified as SKU specific");

  const qSonyXm5 = analyzeQueryIntent("Sony WH-1000XM5");
  assert(qSonyXm5.brand === "sony", "Detects 'sony' brand");
  assert(qSonyXm5.modelTokens.includes("wh-1000xm5"), "Extracts model token 'wh-1000xm5'");
  assert(qSonyXm5.isSkuSpecific === true, "'Sony WH-1000XM5' is SKU specific");

  const qNikeShoes = analyzeQueryIntent("Nike Pegasus 40 running shoes");
  assert(qNikeShoes.brand === "nike", "Detects 'nike' brand");
  assert(qNikeShoes.productForm === "shoe", "Detects 'shoe' form");
  assert(qNikeShoes.isSkuSpecific === true, "'Nike Pegasus 40 running shoes' is SKU specific");

  // --- TEST SUITE 2: Strict Semantic Boundary & Category Isolation ---
  console.log("\n--- TEST SUITE 2: Strict Semantic Boundary & Anti-Contamination ---");

  // Rule 2.1: Brand Isolation
  assert(
    isCandidateCompatible(qXiaomi, { title: "Apple iPhone 15", brand: "Apple" }) === false,
    "Xiaomi query strictly rejects Apple iPhone"
  );
  assert(
    isCandidateCompatible(qXiaomi, { title: "Vivo X100 Pro", brand: "Vivo" }) === false,
    "Xiaomi query strictly rejects Vivo phone"
  );
  assert(
    isCandidateCompatible(qXiaomi, { title: "Redmi Note 13 Pro 5G", brand: "Xiaomi" }) === true,
    "Xiaomi query accepts Redmi (valid alias of Xiaomi)"
  );

  // Rule 2.2: Product Form Isolation
  assert(
    isCandidateCompatible(qFacewash, {
      title: "L'Oreal Paris Total Repair 5 Shampoo 650ml",
      brand: "L'Oreal",
    }) === false,
    "Facewash query strictly rejects Shampoo"
  );
  assert(
    isCandidateCompatible(qFacewash, {
      title: "Cetaphil Gentle Skin Cleanser Wash 250ml",
      brand: "Cetaphil",
    }) === true,
    "Facewash query accepts Cetaphil cleanser"
  );
  assert(
    isCandidateCompatible(qShampoo, {
      title: "Himalaya Purifying Neem Face Wash",
      brand: "Himalaya",
    }) === false,
    "Shampoo query strictly rejects Face Wash"
  );
  assert(
    isCandidateCompatible(qShampoo, {
      title: "Tresemme Keratin Smooth Shampoo",
      brand: "Tresemme",
    }) === true,
    "Shampoo query accepts Tresemme Shampoo"
  );

  // Rule 2.3: Accessory Suppression
  const qPhone = analyzeQueryIntent("Xiaomi 14");
  assert(
    isCandidateCompatible(qPhone, {
      title: "Xiaomi 14 Shockproof Armor Case Cover",
      brand: "Xiaomi",
    }) === false,
    "Primary phone search suppresses accessory case cover"
  );
  assert(
    isCandidateCompatible(qPhone, {
      title: "Xiaomi 14 5G (Black, 512GB)",
      brand: "Xiaomi",
    }) === true,
    "Primary phone search accepts the actual smartphone"
  );

  const qAccessoryQuery = analyzeQueryIntent("Xiaomi 14 case cover");
  assert(
    isCandidateCompatible(qAccessoryQuery, {
      title: "Xiaomi 14 Shockproof Armor Case Cover",
      brand: "Xiaomi",
    }) === true,
    "Explicit accessory search accepts case cover"
  );

  // --- TEST SUITE 3: Clean Commerce Query Construction ---
  console.log("\n--- TEST SUITE 3: Clean Commerce Query Construction ---");
  const cleanXiaomi = buildCleanInternetQuery(qXiaomi);
  assert(cleanXiaomi === "xiaomi buy online india", `Clean query for xiaomi: '${cleanXiaomi}'`);

  const cleanFacewash = buildCleanInternetQuery(qFacewash);
  assert(
    cleanFacewash === "face wash buy online india",
    `Clean query for facewash: '${cleanFacewash}'`
  );

  // --- TEST SUITE 4: Authentic INR Price Extraction ---
  console.log("\n--- TEST SUITE 4: Authentic INR Price Extraction ---");
  assert(extractInrPrice("Price: ₹69,999 with free delivery") === 69999, "Extracts ₹69,999");
  assert(extractInrPrice("Special deal Rs. 1499 only") === 1499, "Extracts Rs. 1499");
  assert(extractInrPrice("Starts at INR 249") === 249, "Extracts INR 249");
  assert(extractInrPrice("No price given here") === null, "Returns null when no price is present");

  // --- TEST SUITE 5: End-to-End Multi-Platform Search Integration ---
  console.log("\n--- TEST SUITE 5: End-to-End Multi-Platform Search Execution ---");
  const testQueries = [
    "xiaomi",
    "vivo",
    "facewash",
    "shampoo",
    "Sony WH-1000XM5",
    "iPhone 15",
  ];

  for (const query of testQueries) {
    const res = await searchProductsAcrossPlatforms(query);
    console.log(`\nQuery: "${query}" => Total Found: ${res.totalFound}`);
    if (res.products && res.products.length > 0) {
      const top = res.products[0];
      console.log(`  Top Hit: "${top.title}" [Store: ${top.primaryStore}, Price: ₹${top.price}, Offers: ${top.offers.length}]`);
      // Validate no cross-brand leaks
      const intent = analyzeQueryIntent(query);
      for (const r of res.products) {
        const isOk = isCandidateCompatible(intent, {
          title: r.title,
          brand: r.brand || "Unknown",
          category: r.category,
          tags: r.tags || [],
        });
        if (!isOk) {
          console.error(`  ⚠️ CONTAMINATION DETECTED: "${r.title}" (brand: ${r.brand}) for query "${query}"`);
          failures++;
        }
      }
    }
    assert(res.totalFound > 0, `Search returned valid results for '${query}'`);
  }

  console.log("\n=================================================");
  console.log(`RESULTS: ${passes} PASSED, ${failures} FAILED`);
  console.log("=================================================");

  if (failures > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
