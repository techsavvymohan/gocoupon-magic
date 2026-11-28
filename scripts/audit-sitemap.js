import fs from "node:fs";

async function main() {
  const sitemapPath = "dist/sitemap.xml";
  if (!fs.existsSync(sitemapPath)) {
    console.log("No dist/sitemap.xml found.");
    return;
  }
  const sitemap = fs.readFileSync(sitemapPath, "utf-8");
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  console.log(`Checking ${urls.length} URLs in sitemap against local server...`);

  const redirects = [];
  const notFound = [];
  const errors = [];
  let okCount = 0;

  for (const url of urls) {
    const pathname = new URL(url).pathname;
    try {
      const res = await fetch(`http://127.0.0.1:3000${pathname}`, {
        method: "HEAD",
        redirect: "manual",
      });

      if (res.status >= 300 && res.status < 400) {
        redirects.push({ url, status: res.status, location: res.headers.get("location") });
      } else if (res.status === 404) {
        notFound.push({ url, status: 404 });
      } else if (res.status >= 400) {
        errors.push({ url, status: res.status });
      } else {
        okCount++;
      }
    } catch (err) {
      errors.push({ url, error: err.message });
    }
  }

  console.log("=== SITEMAP AUDIT SUMMARY ===");
  console.log("Total Checked:", urls.length);
  console.log("200 OK:", okCount);
  console.log("Redirects (301/302):", redirects.length);
  if (redirects.length > 0) {
    console.log("Redirects:", JSON.stringify(redirects.slice(0, 20), null, 2));
  }
  console.log("404 Not Found:", notFound.length);
  if (notFound.length > 0) {
    console.log("404s:", JSON.stringify(notFound.slice(0, 20), null, 2));
  }
  console.log("Other Errors:", errors.length);
}

main().catch(console.error);
