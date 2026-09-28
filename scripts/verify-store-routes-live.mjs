import https from "https";

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const h1Match = data.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        const titleMatch = data.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const canonMatch = data.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
        const schemaCount = (data.match(/application\/ld\+json/g) || []).length;
        
        resolve({
          url,
          status: res.statusCode,
          title: titleMatch ? titleMatch[1].trim() : "None",
          h1: h1Match ? h1Match[1].replace(/<[^>]+>/g, "").trim() : "None",
          canonical: canonMatch ? canonMatch[1].trim() : "None",
          schemaCount,
          sizeBytes: data.length,
        });
      });
    }).on("error", (err) => resolve({ url, error: err.message }));
  });
}

async function verify() {
  console.log("--- TESTING LIVE PROGRAMMATIC STORE ROUTES ---");
  const testUrls = [
    "https://gocoupon.io/api/health",
    "https://gocoupon.io/bewakoof-coupons",
    "https://gocoupon.io/healthkart-coupons",
    "https://gocoupon.io/klook-coupons",
    "https://gocoupon.io/firstcry-coupons",
    "https://gocoupon.io/vijay-sales-coupons",
  ];

  for (const u of testUrls) {
    const res = await fetchUrl(u);
    console.log(JSON.stringify(res, null, 2));
  }

  // Check sitemap URL count
  const sitemapRes = await new Promise((resolve) => {
    https.get("https://gocoupon.io/sitemap.xml", (res) => {
      let xml = "";
      res.on("data", (c) => (xml += c));
      res.on("end", () => {
        const count = (xml.match(/<loc>/g) || []).length;
        resolve({ status: res.statusCode, totalUrlsInSitemap: count });
      });
    });
  });
  console.log("\n--- LIVE SITEMAP.XML STATUS ---");
  console.log(JSON.stringify(sitemapRes, null, 2));
}

verify();
