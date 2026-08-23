import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "../dist");
const indexHtmlPath = path.join(distDir, "index.html");

if (!fs.existsSync(indexHtmlPath)) {
  console.error("Error: dist/index.html not found! Run vite build first.");
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexHtmlPath, "utf-8");

const routes = [
  "privacy",
  "terms",
  "help",
  "contact",
  "about",
  "security",
  "disclosure",
  "how-it-works",
  "extension",
  "faq",
  "stores",
  "categories",
  "deals",
  "welcome",
  "uninstall",
  "press",
  "resources",
  "cashback-rewards",
  "sitemap",
  "amazon-coupons",
  "flipkart-coupons",
  "myntra-coupons",
  "meesho-coupons",
  // Supercharged Buyhatke + Flash Power Routes
  "compare",
  "price-history",
  "ask",
  "watchlist",
  "collections",
  "collections/best-wireless-headphones-under-30000",
  "collections/best-flagship-laptops-india",
  "product/prod_sony_wh1000xm5",
  "product/prod_apple_macbook_air_m3",
  "product/prod_boat_airdopes_141",
  "product/prod_samsung_s24_ultra",
  "product/prod_minimalist_vit_c",
  "product/prod_nike_air_force_1",
  "blog",
  // Blog posts
  "blog/best-coupon-codes-for-flipkart-2026",
  "blog/how-to-save-money-on-amazon-india",
  "blog/myntra-coupon-codes-that-actually-work",
  "blog/meesho-discount-codes-today",
  "blog/chrome-extension-to-automatically-apply-coupons-india",
  "blog/why-coupons-fail-at-checkout",
  "blog/stack-coupons-bank-offers-flipkart",
  "blog/amazon-india-lightning-deals",
  "blog/gocoupon-2-4-faster-checkout",
  "blog/myntra-insider-pricing-explained",
  "blog/cashback-myths-explained",
  "blog/new-year-sale-coupons-india-2026",
  "blog/republic-day-sale-coupons-2026",
  "blog/diwali-coupons-2026-stack-guide",
  "blog/best-coupon-extensions-chrome-2026",
  "blog/amazon-great-indian-festival-hacks-2026",
  "blog/best-amazon-electronics-tech-deals-2026",
];

console.log(`Generating static route files in ${distDir}...`);

let count = 0;
for (const route of routes) {
  // 1. Write /route.html
  const flatHtmlPath = path.join(distDir, `${route}.html`);
  const flatDir = path.dirname(flatHtmlPath);
  if (!fs.existsSync(flatDir)) {
    fs.mkdirSync(flatDir, { recursive: true });
  }
  fs.writeFileSync(flatHtmlPath, indexHtml, "utf-8");

  // 2. Write /route/index.html
  const routeDir = path.join(distDir, route);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  fs.writeFileSync(path.join(routeDir, "index.html"), indexHtml, "utf-8");
  count += 2;
}

// Also generate a 404.html that renders index.html so Vercel can fallback cleanly
fs.writeFileSync(path.join(distDir, "404.html"), indexHtml, "utf-8");

console.log(`Successfully generated ${count} route files and 404.html for static hosting!`);
