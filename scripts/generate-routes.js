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
    title: "goCoupon™ – Auto-Apply Working Coupons & Live Price Tracker (Save Up to 40%)",
    description: "Never search for coupon codes again. goCoupon automatically tests and applies the best working promo codes, tracks 90-day price drops, and unlocks cashback on Amazon, Flipkart, Myntra & 200+ stores.",
    h1: "Auto-Apply Working Coupons & 90-Day Live Price Tracker in India",
    lead: "goCoupon tests every working coupon code at checkout in under 850 milliseconds and compares live prices across Amazon, Flipkart, Myntra, and Croma so you always pay the absolute lowest price.",
  },
  {
    path: "flipkart-coupons",
    title: "Flipkart Coupon Codes (Working Today, Feb 2026) – Flat ₹500 Off & Cashback",
    description: "Looking for 100% verified working Flipkart coupon codes? Find active promo codes, instant bank discounts, and up to 8.5% cashback on fashion, mobiles, and electronics with goCoupon.",
    h1: "Flipkart Coupon Codes & Cashback Offers (Verified Today)",
    lead: "Save up to ₹500 on Flipkart orders with verified coupon codes, bank card discounts, and up to 8.5% cashback auto-applied at checkout.",
  },
  {
    path: "amazon-coupons",
    title: "Amazon India Coupon Codes (Verified Feb 2026) – Promo Codes & Deals",
    description: "Verified Amazon India coupon codes, lighting deals, and credit card promo discounts. Auto-apply the best working promo codes and get up to 7% cashback with goCoupon.",
    h1: "Amazon India Promo Codes & Working Coupons (Feb 2026)",
    lead: "Discover active Amazon India promo codes, lightning deals, and credit card instant discounts on electronics, fashion, and home appliances.",
  },
  {
    path: "myntra-coupons",
    title: "Myntra Coupon Codes (Verified Today, Feb 2026) – Flat ₹400 Off Codes",
    description: "Get 100% verified working Myntra promo codes, first order discounts, and 6.2% cashback on fashion, shoes, and beauty products with goCoupon.",
    h1: "Myntra Coupon Codes & Promo Offers (Working Today)",
    lead: "Auto-apply working Myntra promo codes for flat ₹400 off, first-order savings, and 6.2% cashback on top fashion and beauty brands.",
  },
  {
    path: "meesho-coupons",
    title: "Meesho Promo Codes (Working Feb 2026) – ₹100 Off Coupon Codes",
    description: "Save more on Meesho with goCoupon. Auto-test and apply valid Meesho coupon codes at checkout and unlock available cashback offers on fashion, home & daily essentials.",
    h1: "Meesho Coupon Codes & Discount Offers (Feb 2026)",
    lead: "Verified Meesho promo codes, first order discounts, and everyday budget shopping deals across India.",
  },
  {
    path: "compare",
    title: "Live Price Comparison India – Compare Amazon, Flipkart & Croma in 1-Click",
    description: "Compare live prices, stackable coupons, delivery fees, and cashback across Amazon, Flipkart, Myntra, Croma, and Tata CLiQ with goCoupon's instant comparison engine.",
    h1: "Cross-Store Live Price Comparison & Best Deal Detector",
    lead: "Compare prices, delivery estimates, stackable coupon savings, and cashback across Amazon.in, Flipkart, Myntra, and Croma in real-time.",
  },
  {
    path: "price-history",
    title: "Price History Tracker India – Amazon & Flipkart 90-Day Graph Tracker",
    description: "Track 90-day price history graphs on Amazon & Flipkart. Spot fake pre-sale discount hikes, set instant price drop alerts, and buy at the all-time lowest price in India.",
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
    title: "Top 200+ Indian Stores Coupons & Deals Directory (Feb 2026) – goCoupon",
    description: "Browse verified working coupon codes, promo codes, and up to 10% cashback across 200+ top Indian shopping stores including Flipkart, Amazon, Myntra, Meesho, Nykaa, and Swiggy.",
    h1: "All Stores & Retailers Coupon Directory in India",
    lead: "Browse verified working coupon codes, discounts, and cashback rates across 200+ top online stores in India.",
  },
  {
    path: "categories",
    title: "Browse Coupons by Category – Fashion, Electronics, Travel & Food | goCoupon",
    description: "Find the best coupon codes organized by shopping category. Save on electronics, fashion, food delivery, flight bookings, beauty, and hosting in India.",
    h1: "Browse Discount Coupons by Category",
    lead: "Explore verified promo codes and cashback offers categorized for fashion, tech, food delivery, travel, and beauty.",
  },
  {
    path: "deals",
    title: "Trending Deals & Verified Promo Codes Today (Feb 2026) – goCoupon",
    description: "Hand-picked live deals, price drops, and verified coupon codes updated daily across Amazon, Flipkart, Myntra, Croma, and boAt.",
    h1: "Today's Verified Deals & Price Drops in India",
    lead: "Hand-tested discounts, lightning deals, and all-time low price alerts updated continuously across major Indian retailers.",
  },
  {
    path: "how-it-works",
    title: "How goCoupon Works – Automated Coupon Testing & Price Tracking Guide",
    description: "Learn how the goCoupon Chrome extension tests promo codes in parallel, unlocks cashback, and tracks 90-day price trends at zero cost.",
    h1: "How goCoupon Auto-Applies Coupons & Tracks Prices",
    lead: "Step-by-step guide on how goCoupon detects coupon boxes, tests codes in parallel, applies the biggest discount, and unlocks cashback.",
  },
  {
    path: "extension",
    title: "goCoupon Chrome Extension – Free Auto-Apply Coupons & Cashback Assistant",
    description: "Install the free goCoupon Chrome extension for Google Chrome, Brave, Edge & Opera. Auto-apply working coupons and track price history in 1 click.",
    h1: "Free goCoupon Chrome Extension for Smart Online Shoppers",
    lead: "Add goCoupon to your browser for free. Never search for coupon codes or wonder if you got the best price again.",
  },
  {
    path: "collections",
    title: "Curated Shopping Shortlists & Best Tech Gadgets India – goCoupon",
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
    description: "Guides, coupon hacks, sale calendars, and smart shopping tutorials to help Indian online shoppers maximize savings and avoid fake discounts.",
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
    title: "About goCoupon – Mission, Technology & Team",
    description: "Learn about goCoupon's mission to make online shopping in India transparent, automated, and genuinely affordable with AI price intelligence.",
    h1: "About goCoupon Shopping Intelligence",
    lead: "Built in Bengaluru, goCoupon helps millions of shoppers save time and money by automating coupon testing and eliminating fake discounts.",
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

// Add product routes
const productRoutes = [
  {
    path: "product/prod_sony_wh1000xm5",
    title: "Sony WH-1000XM5 Price History & Live Best Deal – goCoupon",
    description: "Track Sony WH-1000XM5 90-day price trends in India. Compare Amazon, Flipkart, Croma & Tata CLiQ prices and auto-apply AMZSAVE promo code.",
    h1: "Sony WH-1000XM5 Wireless Headphones Price Comparison & 90-Day History",
    lead: "Compare live prices, delivery times, and coupon savings for Sony WH-1000XM5 across Amazon, Flipkart, Croma, and Tata CLiQ.",
  },
  {
    path: "product/prod_apple_macbook_air_m3",
    title: "Apple MacBook Air M3 (13-inch) Lowest Price & History – goCoupon",
    description: "Compare MacBook Air M3 prices across Flipkart, Amazon India, and Croma. Check 90-day price drops and active bank offers.",
    h1: "Apple MacBook Air M3 Price Comparison & 90-Day Price Tracker",
    lead: "Live cross-store price comparison and discount analysis for Apple MacBook Air M3 (13-inch, 8GB, 256GB SSD).",
  },
  {
    path: "product/prod_boat_airdopes_141",
    title: "boAt Airdopes 141 Price Tracker & Coupon Codes – goCoupon",
    description: "Compare boAt Airdopes 141 true wireless earbuds prices on Amazon, Flipkart, and boAt Lifestyle with working promo codes.",
    h1: "boAt Airdopes 141 True Wireless Earbuds Price History & Coupons",
    lead: "Find the lowest verified price and auto-apply active coupon codes for boAt Airdopes 141 TWS Earbuds.",
  },
  {
    path: "product/prod_samsung_s24_ultra",
    title: "Samsung Galaxy S24 Ultra 5G Price History & Deals – goCoupon",
    description: "Track Samsung Galaxy S24 Ultra 5G prices in India across Amazon and Flipkart with instant bank discount calculations.",
    h1: "Samsung Galaxy S24 Ultra 5G Live Price Comparison & Tracker",
    lead: "Monitor real-time prices, exchange bonuses, and bank card offers for Samsung Galaxy S24 Ultra 5G in India.",
  },
  {
    path: "product/prod_minimalist_vit_c",
    title: "Minimalist 10% Vitamin C Serum Price & Coupons – goCoupon",
    description: "Compare Minimalist 10% Vitamin C Face Serum prices across Nykaa, Amazon, and Myntra with instant coupon application.",
    h1: "Minimalist 10% Vitamin C Serum Price Comparison & Discounts",
    lead: "Live discount comparison and coupon codes for Minimalist 10% Vitamin C Face Serum.",
  },
  {
    path: "product/prod_nike_air_force_1",
    title: "Nike Air Force 1 '07 Sneakers Price & Offers – goCoupon",
    description: "Compare Nike Air Force 1 '07 prices across Myntra, Ajio, and Nike India with verified promo codes and cashback.",
    h1: "Nike Air Force 1 '07 Sneakers Price Comparison & Offers",
    lead: "Check verified prices and available promo codes for Nike Air Force 1 '07 Classic White Sneakers.",
  },
];

// Add blog routes
const blogRoutes = [
  {
    path: "blog/myntra-coupon-codes-that-actually-work",
    title: "Myntra Coupon Codes That Actually Work (Verified Feb 2026) – goCoupon",
    description: "Step-by-step guide to finding 100% verified working Myntra coupon codes, stacking Myntra Insider points, and getting flat ₹400 off.",
    h1: "Myntra Coupon Codes That Actually Work (Feb 2026 Guide)",
    lead: "Stop copying expired codes from random listicles. Here is how to unlock 100% working Myntra promo codes and stack discounts.",
  },
  {
    path: "blog/best-coupon-codes-for-flipkart-2026",
    title: "Best Flipkart Coupon Codes & Sale Hacks 2026 – goCoupon",
    description: "How to find working Flipkart coupon codes, stack SuperCoins, and maximize instant bank discounts on electronics and fashion.",
    h1: "Best Working Flipkart Coupon Codes & Sale Hacks (2026)",
    lead: "Master Flipkart savings with verified coupon codes, SuperCoin redemption, and bank credit card discount stacking.",
  },
  {
    path: "blog/how-to-save-money-on-amazon-india",
    title: "How to Save Maximum Money on Amazon India – goCoupon",
    description: "Secrets to unlocking hidden Amazon India coupons, lightning deal alerts, Prime savings, and credit card cashback.",
    h1: "How to Save Maximum Money on Amazon India (Pro Shopping Guide)",
    lead: "Comprehensive guide to combining Amazon lightning deals, collectible coupons, and bank card discounts.",
  },
  {
    path: "blog/meesho-discount-codes-today",
    title: "Meesho Discount Codes Today – Flat Discounts & First Order Hacks | goCoupon",
    description: "Learn how to find working Meesho promo codes, first-order discounts, and free shipping hacks on clothing and household items.",
    h1: "Meesho Discount Codes & First-Order Savings Guide",
    lead: "Everything you need to know about getting the lowest price on Meesho with active promo codes.",
  },
  {
    path: "blog/why-coupons-fail-at-checkout",
    title: "Why Do Coupon Codes Fail at Checkout? 5 Hidden Reasons Explained – goCoupon",
    description: "Understand why promo codes return 'Invalid Code' or 'Expired' and how goCoupon's automated scanner solves coupon failure.",
    h1: "Why Do Coupon Codes Fail at Checkout? (And How to Fix It)",
    lead: "Category locks, minimum cart constraints, seller exclusions, and how automated coupon testing guarantees verified discounts.",
  },
  {
    path: "blog/stack-coupons-bank-offers-flipkart",
    title: "How to Stack Coupons and Bank Offers on Flipkart – goCoupon",
    description: "Learn the exact checkout order to combine Flipkart cart coupons with HDFC, ICICI, and Axis Bank instant card discounts.",
    h1: "How to Stack Coupons with Bank Card Offers on Flipkart",
    lead: "Step-by-step walkthrough on stacking cart promo codes and bank credit card discounts without voiding either offer.",
  },
];

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
