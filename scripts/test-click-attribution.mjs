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
      url: "https://linksredirect.com/?pub_id=148920&subid=deal_123&url=https%3A%2F%2Fwww.boat-lifestyle.com",
      store: "boAt Lifestyle",
      slug: "boat",
      code: "BOATHEAD",
    },
    expectedDomain: "linksredirect.com",
    expectedPublisherTag: "148920",
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
    expectedPublisherTag: "148920",
  },
  {
    name: "5. EarnKaro Direct Partner Store (Myntra)",
    input: {
      url: "https://www.myntra.com/sale",
      store: "Myntra",
      slug: "myntra",
      code: "MYNTRA500",
    },
    expectedDomain: "myntr.it",
  },
  {
    name: "6. Amazon India Partner Tag",
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

  if (statusCode === 302 && domainMatch && pubMatch && wrapperClean) {
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
} else {
  process.exit(1);
}
