import { handleDealRedirect, extractMerchantDestination } from "../server/routes/redirect.ts";

console.log("\n=======================================================");
console.log("   🎯 MULTI-NETWORK AFFILIATE CLICK ATTRIBUTION AUDIT");
console.log("=======================================================\n");

const tests = [
  {
    name: "1. CJ (Commission Junction) Deal Tracking",
    input: {
      url: "https://www.tkqlhce.com/click-101896072-17350043",
      store: "Ashford",
      slug: "ashford",
      code: "SAVE20",
    },
    expectedDomain: "tkqlhce.com",
    expectedPublisherTag: "101896072",
    forbiddenWrapper: "linksredirect.com",
  },
  {
    name: "2. Admitad Global / AliExpress Tracking",
    input: {
      url: "https://alitems.com/g/1e8d11449419b486940816525dc3e8/",
      store: "AliExpress",
      slug: "aliexpress",
      code: "CHOICE70",
    },
    expectedDomain: "alitems.com",
    forbiddenWrapper: "linksredirect.com",
  },
  {
    name: "3. Cuelinks Pre-Wrapped Deal",
    input: {
      url: "https://linksredirect.com/?pub_id=272970&subid=deal_123&url=https%3A%2F%2Fwww.boat-lifestyle.com",
      store: "boAt Lifestyle",
      slug: "boat",
      code: "BOATHEAD",
    },
    expectedDomain: "linksredirect.com",
    expectedPublisherTag: "272970",
  },
  {
    name: "4. Clean Merchant URL (Auto-Wrapped by Cuelinks)",
    input: {
      url: "https://www.tatacliq.com/deals",
      store: "Tata CLiQ",
      slug: "tata-cliq",
      code: "IDBITCF",
    },
    expectedDomain: "linksredirect.com",
    expectedPublisherTag: "272970",
  },
  {
    name: "5. EarnKaro Direct Partner Store (Flipkart)",
    input: {
      url: "https://www.flipkart.com/sale",
      store: "Flipkart",
      slug: "flipkart",
      code: "FLIPEXTRA",
    },
    expectedDomain: "fktr.in",
  },
  {
    name: "6. Cuelinks Approved Live Partner (Myntra)",
    input: {
      url: "https://www.myntra.com/sale",
      store: "Myntra",
      slug: "myntra",
      code: "MYNTRA500",
    },
    expectedDomain: "linksredirect.com",
    expectedPublisherTag: "272970",
  },
  {
    name: "7. Amazon India Partner Tag",
    input: {
      url: "https://www.amazon.in/dp/B09G9FPHY6",
      store: "Amazon",
      slug: "amazon",
      code: "PRIME",
    },
    expectedDomain: "amazon.in",
    expectedPublisherTag: "gocoupon0e-21",
    forbiddenWrapper: "linksredirect.com",
  },
  {
    name: "8. Smart Deep-Linking for Tata CLiQ (Homepage -> Search Deep Link)",
    input: {
      url: "https://www.tatacliq.com/",
      store: "Tata CLiQ",
      slug: "tata-cliq",
      title: "Flat ₹500 Off on Audio & Earbuds at Tata CLiQ",
      code: "AUDIO500",
    },
    expectedDomain: "linksredirect.com",
    expectedPublisherTag: "272970",
    expectedKeyword: "searchCategory%3Dall%26text%3DAudio%2520Earbuds",
  },
  {
    name: "9. Smart Deep-Linking for Croma (Homepage -> Search Deep Link)",
    input: {
      url: "https://www.croma.com",
      store: "Croma",
      slug: "croma",
      title: "Save up to 40% on Sony Headphones at Croma",
      code: "SONY40",
    },
    expectedDomain: "linksredirect.com",
    expectedPublisherTag: "272970",
    expectedKeyword: "searchB%3Fq%3DSony%2520Headphones",
  },
];

let allPassed = true;

for (const t of tests) {
  let redirectedTo = "";
  let statusCode = 0;

  const mockReq = {
    query: t.input,
    headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    socket: { remoteAddress: "127.0.0.1" },
  };

  const mockRes = {
    setHeader: () => {},
    redirect: (code, url) => {
      statusCode = code;
      redirectedTo = url;
    },
  };

  await handleDealRedirect(mockReq, mockRes);

  const domainMatch = redirectedTo.includes(t.expectedDomain);
  const pubMatch = !t.expectedPublisherTag || redirectedTo.includes(t.expectedPublisherTag);
  const wrapperClean = !t.forbiddenWrapper || !redirectedTo.includes(t.forbiddenWrapper);
  const keywordMatch = !t.expectedKeyword || redirectedTo.includes(t.expectedKeyword);

  if (statusCode === 302 && domainMatch && pubMatch && wrapperClean && keywordMatch) {
    console.log(`✅ [PASS] ${t.name}`);
    console.log(`    ↳ Destination: ${redirectedTo}\n`);
  } else {
    console.error(`❌ [FAIL] ${t.name}`);
    console.error(`    ↳ Got: ${redirectedTo}`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log("🎉 ALL MULTI-NETWORK ATTRIBUTION TESTS PASSED (100% RELIABILITY)");
  process.exit(0);
} else {
  process.exit(1);
}
