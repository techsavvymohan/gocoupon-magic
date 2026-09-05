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

const baseIndexHtml = fs.readFileSync(indexHtmlPath, "utf-8");

// Rich Route Definitions for Pre-Rendering & Googlebot Crawlability
const routeConfigs = [
  {
    path: "",
    title: "GoCoupon: Coupons, Price Comparison & Cashback Extension",
    description: "GoCoupon is the free shopping extension for working coupons, live price comparison, 90-day price history and cashback across online stores worldwide.",
    h1: "GoCoupon: Compare Prices, Track Drops & Auto-Apply Coupons Across 200+ Stores",
    lead: "GoCoupon is the official free Chrome extension and shopping intelligence platform for online shoppers worldwide. Compare prices, track 90-day price history, find working coupons, and apply the best available savings at checkout.",
  },
  {
    path: "flipkart-coupons",
    title: "Flipkart Coupon Codes (Working Today, 2026) – Flat ₹500 Off & Cashback",
    description: "Looking for 100% verified working Flipkart coupon codes? Find active promo codes, instant bank discounts, and up to 8.5% cashback on fashion, mobiles, and electronics with goCoupon.",
    h1: "Flipkart Coupon Codes & Cashback Offers (Verified Today)",
    lead: "Save up to ₹500 on Flipkart orders with verified coupon codes, bank card discounts, and up to 8.5% cashback auto-applied at checkout.",
  },
  {
    path: "amazon-coupons",
    title: "Amazon India Coupon Codes (Verified 2026) – Promo Codes & Deals",
    description: "Verified Amazon India coupon codes, lighting deals, and credit card promo discounts. Auto-apply the best working promo codes and get up to 7% cashback with goCoupon.",
    h1: "Amazon India Promo Codes & Working Coupons (2026)",
    lead: "Discover active Amazon India promo codes, lightning deals, and credit card instant discounts on electronics, fashion, and home appliances.",
  },
  {
    path: "myntra-coupons",
    title: "Myntra Coupon Codes (Verified Today, 2026) – Flat ₹400 Off Codes",
    description: "Get 100% verified working Myntra promo codes, first order discounts, and 6.2% cashback on fashion, shoes, and beauty products with goCoupon.",
    h1: "Myntra Coupon Codes & Promo Offers (Working Today)",
    lead: "Auto-apply working Myntra promo codes for flat ₹400 off, first-order savings, and 6.2% cashback on top fashion and beauty brands.",
  },
  {
    path: "meesho-coupons",
    title: "Meesho Promo Codes (Working 2026) – ₹100 Off Coupon Codes",
    description: "Save more on Meesho with goCoupon. Auto-test and apply valid Meesho coupon codes at checkout and unlock available cashback offers on fashion, home & daily essentials.",
    h1: "Meesho Coupon Codes & Discount Offers (2026)",
    lead: "Verified Meesho promo codes, first order discounts, and everyday budget shopping deals across India.",
  },
  {
    path: "compare",
    title: "Price Comparison: Compare Prices & Find Cheaper Products Across Stores – GoCoupon",
    description: "Compare live prices, stackable coupons, delivery fees, and discounts across Amazon, Walmart, Target, Flipkart, and 200+ retailers. Find cheaper products and save instantly.",
    h1: "Cross-Store Live Price Comparison & Cheaper Products Finder",
    lead: "Compare prices, delivery estimates, stackable coupon savings, and deals across major retailers in real-time to find the cheapest store.",
  },
  {
    path: "price-history",
    title: "Price Tracking: 90-Day Price Tracker & Historical Low Checker – GoCoupon",
    description: "Track 90-day price trends across Amazon, Walmart, Target, and Flipkart. Spot fake pre-sale discount hikes, set instant price drop alerts, and buy at the all-time lowest price.",
    h1: "90-Day Price History Tracker & Fake Discount Anomaly Detector",
    lead: "Analyze historical daily price snapshots across 90 days, identify all-time lowest prices, and detect artificial pre-sale price markups.",
  },
  {
    path: "ask",
    title: "Ask goCoupon Shopping Assistant – AI Shopping Intelligence Dossier",
    description: "Search any product to get an instant shopping intelligence report: lowest store price, working coupons, all-time price trends, and best buying recommendations.",
    h1: "Ask goCoupon Shopping Intelligence Assistant",
    lead: "Search any gadget or product to generate a real-time price comparison dossier, coupon savings breakdown, and deal verdict.",
  },
  {
    path: "stores",
    title: "Top 200+ Online Stores Coupons & Deals Directory (2026) – GoCoupon",
    description: "Browse verified working coupon codes, promo codes, and up to 10% cashback across 200+ top online shopping stores worldwide including Amazon, Walmart, Target, Flipkart, Myntra, and more.",
    h1: "All Stores & Retailers Coupon Directory Worldwide",
    lead: "Browse verified working coupon codes, discounts, and cashback rates across 200+ top online stores worldwide.",
  },
  {
    path: "categories",
    title: "Browse Coupons by Category – Fashion, Electronics, Travel & Food | GoCoupon",
    description: "Find the best coupon codes organized by shopping category. Save on electronics, fashion, food delivery, flight bookings, beauty, and hosting worldwide.",
    h1: "Browse Discount Coupons by Category",
    lead: "Explore verified promo codes and cashback offers categorized for fashion, tech, food delivery, travel, and beauty.",
  },
  {
    path: "deals",
    title: "Today's Best Online Deals, Discounts & Price Drops – GoCoupon",
    description: "Explore hand-verified online shopping deals, 30-75% discounts, and all-time low price drops across Amazon, Walmart, Target, Flipkart, and more with GoCoupon.",
    h1: "Today's Verified Deals, Price Drops & Online Discounts",
    lead: "Hand-tested lightning deals, verified promo codes, and all-time low price alerts updated continuously across major online retailers.",
  },
  {
    path: "how-it-works",
    title: "How goCoupon Works – Automated Coupon Testing & Price Tracking Guide",
    description: "Learn how the goCoupon Chrome extension tests promo codes in parallel, unlocks cashback, and tracks 90-day price trends at zero cost.",
    h1: "How goCoupon Auto-Applies Coupons & Tracks Prices",
    lead: "Step-by-step guide on how goCoupon detects coupon boxes, tests codes in parallel, applies the biggest discount, and unlocks cashback.",
  },
  {
    path: "chrome-extension",
    title: "GoCoupon Chrome Extension: Automatically Find Working Coupons",
    description: "Download the official GoCoupon Chrome Extension. Automatically tests working coupons, clips Amazon green vouchers, and compares prices across 200+ stores worldwide.",
    h1: "GoCoupon Chrome Extension",
    lead: "Add GoCoupon to your browser for free. Never search for coupon codes or wonder if you got the best price again.",
  },
  {
    path: "extension",
    title: "GoCoupon Chrome Extension – Free Auto-Apply Coupons & Cashback Assistant",
    description: "Install the free GoCoupon Chrome extension for Google Chrome, Brave, Edge & Opera. Auto-apply working coupons and track price history in 1 click.",
    h1: "Free GoCoupon Chrome Extension for Smart Online Shoppers",
    lead: "Add GoCoupon to your browser for free. Never search for coupon codes or wonder if you got the best price again.",
  },
  {
    path: "collections",
    title: "Curated Shopping Shortlists & Best Tech Gadgets – GoCoupon",
    description: "Expert product shortlists with price comparison, 90-day price history graphs, and verified coupon codes for top headphones, laptops, and phones.",
    h1: "Curated Shopping Shortlists & Buying Guides",
    lead: "Researched shortlists and product comparisons backed by 90-day price tracker evidence, review sentiment, and live store availability.",
  },
  {
    path: "watchlist",
    title: "My Price Drop Watchlist & Deal Alerts – goCoupon",
    description: "Track your favorite products, monitor price drops across Amazon and Flipkart, and receive instant alerts when prices hit all-time lows.",
    h1: "Price Drop Watchlist & Target Price Alerts",
    lead: "Monitor your tracked items across Amazon and Flipkart and get notified the moment prices drop to your target price.",
  },
  {
    path: "blog",
    title: "goCoupon Shopping Insights & Deal Hacks Blog",
    description: "Guides, coupon hacks, sale calendars, and smart shopping tutorials to help online shoppers worldwide maximize savings and avoid fake discounts.",
    h1: "goCoupon Deals, Coupon Hacks & Shopping Guides",
    lead: "In-depth shopping strategies, verified coupon application guides, sale calendars, and price tracking tips from the goCoupon team.",
  },
  {
    path: "cashback-rewards",
    title: "goCoupon Cashback Rewards – Earn Real Cashback on Every Online Order",
    description: "Earn up to 10% real cashback when shopping at Amazon, Flipkart, Myntra, Ajio, and 200+ partner stores. 100% free with instant tracking.",
    h1: "Cashback Rewards Program & Stacking Guide",
    lead: "Combine store coupons, bank credit card discounts, and up to 10% goCoupon cashback on every online order.",
  },
  {
    path: "about",
    title: "About GoCoupon: The Official Coupon & Price Comparison Platform",
    description: "Learn about GoCoupon (https://gocoupon.io/), the official coupon and price comparison platform. Discover our mission, supported stores worldwide, privacy standards, and team.",
    h1: "About GoCoupon",
    lead: "GoCoupon is the official free Chrome extension and shopping intelligence platform built for online shoppers worldwide.",
  },
  {
    path: "security",
    title: "Security & Privacy Architecture – goCoupon",
    description: "Learn how goCoupon protects your privacy with Manifest V3, zero browsing history collection, and local data sandboxing.",
    h1: "Security, Privacy & Data Protection at goCoupon",
    lead: "We do not track your browsing history or sell your personal data. Read our Manifest V3 privacy architecture.",
  },
  {
    path: "disclosure",
    title: "Affiliate & Advertising Disclosure – goCoupon",
    description: "Transparent disclosure of goCoupon's affiliate partnerships with Amazon Associates, Flipkart, and Cuelinks networks.",
    h1: "Affiliate Partnership & Transparency Disclosure",
    lead: "goCoupon is free for shoppers. We may earn a small referral commission when you purchase through our links at zero extra cost to you.",
  },
  {
    path: "terms",
    title: "Terms of Service – goCoupon",
    description: "Terms and conditions for using the goCoupon website, extensions, and shopping tools.",
    h1: "Terms of Service",
    lead: "Please read these terms carefully before using goCoupon web services or browser extensions.",
  },
  {
    path: "privacy",
    title: "Privacy Policy – goCoupon",
    description: "Comprehensive privacy policy outlining our strict zero-personal-data retention and Manifest V3 compliance.",
    h1: "Privacy Policy",
    lead: "Your privacy is our priority. Discover how we protect your information while finding the best shopping deals.",
  },
  {
    path: "faq",
    title: "Frequently Asked Questions & Help Center – goCoupon",
    description: "Answers to common questions about installing the extension, auto-applying coupons, cashback payout, and price tracking.",
    h1: "Frequently Asked Questions",
    lead: "Everything you need to know about using goCoupon, auto-applying promo codes, and claiming cashback.",
  },
  {
    path: "thank-you",
    title: "Thank You – goCoupon Official Confirmation",
    description: "Thank you for contacting goCoupon. Our team has received your message and will respond promptly. Explore top coupons, live price comparison, and browser extension savings.",
    h1: "Thank You for Reaching Out to GoCoupon!",
    lead: "Our support team has received your message and will reply within 2 hours during active business hours.",
  },
];

// Add collection routes
const collectionRoutes = [
  {
    path: "collections/best-wireless-headphones-under-30000",
    title: "Best Wireless ANC Headphones Under ₹30,000 in India (Feb 2026) – goCoupon",
    description: "Compare Sony WH-1000XM5 vs Bose QC Ultra vs Sennheiser Momentum 4 with 90-day price history and lowest store prices.",
    h1: "Best Wireless Noise-Cancelling Headphones Under ₹30,000",
    lead: "Comprehensive comparison of flagship wireless headphones featuring 90-day price trends, active coupon discounts, and store availability.",
  },
  {
    path: "collections/best-flagship-laptops-india",
    title: "Best Flagship Laptops in India 2026 – MacBook Air M3, Dell XPS, ThinkPad | goCoupon",
    description: "Find the lowest prices, student discounts, and credit card cashback offers on top premium laptops in India.",
    h1: "Best Flagship Laptops in India (2026 Guide)",
    lead: "Compare MacBook Air M3, Dell XPS, and Lenovo ThinkPad prices across Amazon, Flipkart, and Croma with active promo codes.",
  },
];

// Add product routes (dynamic at runtime)
const productRoutes = [];

// Dynamically load all blog routes from src/data/posts.ts for complete 100% SEO indexation
const postsFilePath = path.resolve(__dirname, "../src/data/posts.ts");
const blogRoutes = [];
if (fs.existsSync(postsFilePath)) {
  const postsContent = fs.readFileSync(postsFilePath, "utf-8");
  const postRegex = /slug:\s*"([^"]+)",[\s\S]*?tag:\s*"([^"]+)",[\s\S]*?date:\s*"([^"]+)",[\s\S]*?title:\s*"([^"]+)",[\s\S]*?excerpt:\s*"([^"]+)"/g;
  let m;
  const seen = new Set();
  while ((m = postRegex.exec(postsContent)) !== null) {
    const slug = m[1];
    if (!seen.has(slug)) {
      seen.add(slug);
      blogRoutes.push({
        path: `blog/${slug}`,
        title: `${m[4]} – GoCoupon Deals & Shopping Blog`,
        description: m[5].replace(/\s+/g, " ").trim().slice(0, 160),
        h1: m[4],
        lead: m[5].replace(/\s+/g, " ").trim(),
      });
    }
  }
}

const allRoutes = [...routeConfigs, ...collectionRoutes, ...productRoutes, ...blogRoutes];
console.log(`Generating high-SEO pre-rendered static routes in ${distDir}...`);

let generatedCount = 0;

for (const route of allRoutes) {
  const canonicalUrl = `https://gocoupon.io/${route.path ? route.path : ""}`;

  // 1. Update Title
  let pageHtml = baseIndexHtml.replace(/<title>.*?<\/title>/i, `<title>${route.title}</title>`);

  // 2. Update Meta Description (handles multiline)
  pageHtml = pageHtml.replace(
    /<meta\s+name="description"[\s\S]*?>/i,
    `<meta name="description" content="${route.description}">`
  );

  // 3. Update Canonical URL (handles multiline)
  pageHtml = pageHtml.replace(
    /<link\s+rel="canonical"[\s\S]*?>/i,
    `<link rel="canonical" href="${canonicalUrl}">`
  );

  // 4. Update OpenGraph Title
  pageHtml = pageHtml.replace(
    /<meta\s+property="og:title"[\s\S]*?>/i,
    `<meta property="og:title" content="${route.title}">`
  );

  // 5. Update OpenGraph Description
  pageHtml = pageHtml.replace(
    /<meta\s+property="og:description"[\s\S]*?>/i,
    `<meta property="og:description" content="${route.description}">`
  );

  // 6. Update OpenGraph URL
  pageHtml = pageHtml.replace(
    /<meta\s+property="og:url"[\s\S]*?>/i,
    `<meta property="og:url" content="${canonicalUrl}">`
  );

  // 7. Inject Route-Specific JSON-LD Structured Data in <head>
  const routeSchema = `
    <!-- Per-Route Structured Data for Googlebot & Rich Results -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "${route.title.replace(/"/g, '\\"')}",
        "description": "${route.description.replace(/"/g, '\\"')}",
        "url": "${canonicalUrl}",
        "publisher": {
          "@type": "Organization",
          "name": "goCoupon",
          "url": "https://gocoupon.io/",
          "logo": "https://gocoupon.io/gc-logo.webp"
        }
      }
    </script>
  `;
  pageHtml = pageHtml.replace("</head>", `${routeSchema}\n  </head>`);

  // 8. Add Crawler-friendly <noscript> fallback after <div id="root"></div>
  // This is completely invisible to real users (JS enabled), but fully parsed by text-only bots & search engines.
  const noscriptFallback = `
    <noscript>
      <div style="background-color: #090d16; color: #f1f5f9; padding: 32px; font-family: system-ui, sans-serif;">
        <h1>${route.h1}</h1>
        <p>${route.lead}</p>
        <p>Visit <a href="https://gocoupon.io/" style="color: #38bdf8;">goCoupon.io</a> to access working coupon codes, auto-apply discounts, and live 90-day price tracking across Amazon, Flipkart, Myntra, and 200+ stores in India.</p>
      </div>
    </noscript>
  `;
  pageHtml = pageHtml.replace('<div id="root"></div>', `<div id="root"></div>\n${noscriptFallback}`);

  if (route.path === "") {
    // Write root index.html
    fs.writeFileSync(indexHtmlPath, pageHtml, "utf-8");
    generatedCount++;
  } else {
    // 1. Write /route.html
    const flatHtmlPath = path.join(distDir, `${route.path}.html`);
    const flatDir = path.dirname(flatHtmlPath);
    if (!fs.existsSync(flatDir)) {
      fs.mkdirSync(flatDir, { recursive: true });
    }
    fs.writeFileSync(flatHtmlPath, pageHtml, "utf-8");

    // 2. Write /route/index.html
    const routeDir = path.join(distDir, route.path);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    fs.writeFileSync(path.join(routeDir, "index.html"), pageHtml, "utf-8");
    generatedCount += 2;
  }
}

// Also generate a 404.html
fs.writeFileSync(path.join(distDir, "404.html"), baseIndexHtml, "utf-8");

console.log(`Successfully generated ${generatedCount} rich pre-rendered static route files!`);

// Generate comprehensive, verified sitemap.xml
const sitemapUrls = allRoutes.map((r) => {
  let priority = "0.8";
  let changefreq = "weekly";
  if (r.path === "") {
    priority = "1.0";
    changefreq = "daily";
  } else if (
    [
      "compare",
      "price-history",
      "deals",
      "stores",
      "ask",
      "flipkart-coupons",
      "amazon-coupons",
      "myntra-coupons",
    ].includes(r.path)
  ) {
    priority = "0.95";
    changefreq = "daily";
  } else if (r.path.startsWith("blog/")) {
    priority = "0.85";
    changefreq = "weekly";
  }
  return `  <url>\n    <loc>https://gocoupon.io/${r.path ? r.path : ""}</loc>\n    <lastmod>2026-09-05</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
});

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join(
  "\n"
)}\n</urlset>\n`;

fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemapXml, "utf-8");
fs.writeFileSync(path.resolve(__dirname, "../public/sitemap.xml"), sitemapXml, "utf-8");
console.log(`Successfully updated sitemap.xml with all ${allRoutes.length} indexed URLs!`);

