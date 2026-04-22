export type PostSection =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string; cite?: string };

export type Post = {
  slug: string;
  tag: string;
  date: string;
  title: string;
  excerpt: string;
  read: string;
  author: string;
  cover?: string;
  body: PostSection[];
};

export const posts: Post[] = [
  {
    slug: "stack-coupons-bank-offers-flipkart",
    tag: "Guides",
    date: "Apr 12, 2026",
    title: "How to stack coupons and bank offers on Flipkart",
    excerpt:
      "A practical walkthrough of combining coupon codes with card discounts to squeeze the maximum off your cart — without the trial-and-error.",
    read: "5 min read",
    author: "goCoupon Team",
    body: [
      {
        type: "p",
        text: "Flipkart's checkout looks simple, but the savings stack you never see is usually hiding behind three layers: product-level discounts, platform coupons, and bank/instrument offers. Get the order right and you routinely save another 7–14% on top of the sticker price.",
      },
      { type: "h2", text: "The three layers of a Flipkart discount" },
      {
        type: "ul",
        items: [
          "Product discount — the strikethrough price vs listed price.",
          "Coupon code — the promo field at review/payment screen.",
          "Bank/card offer — applied only on the final payment step.",
        ],
      },
      {
        type: "p",
        text: "The golden rule: coupons apply on the cart subtotal, while most bank offers apply on the post-coupon total. That means entering the coupon first almost always wins — but only if the coupon is actually valid for that category.",
      },
      { type: "h2", text: "A clean 4-step stack" },
      {
        type: "ul",
        items: [
          "1. Add everything to the cart, then open Review order.",
          "2. Let goCoupon try every publicly working coupon for this category.",
          "3. Keep the highest cart-level discount that passes.",
          "4. Choose the bank offer that applies to the post-coupon value.",
        ],
      },
      { type: "h3", text: "When bank offers beat coupons" },
      {
        type: "p",
        text: "For electronics above ₹25,000, bank card offers typically cap at a flat amount (e.g. ₹1,500 off with HDFC). Below ₹10,000, a 10% coupon will almost always beat any flat-amount card offer. goCoupon surfaces both numbers side by side so you don't have to run the math in your head.",
      },
      {
        type: "quote",
        text: "The coupon is the only thing between you and the real price.",
        cite: "Our most-quoted test run",
      },
      { type: "h2", text: "Things to avoid" },
      {
        type: "ul",
        items: [
          "Don't remove items to pass a minimum-cart condition — coupons requiring ≥ ₹1,999 usually return lower absolute savings than the item you'd drop.",
          "Don't apply a coupon before choosing an EMI plan — many EMIs silently void the coupon.",
          "Don't rely on 'best offer' banners; they're platform-wide, not cart-specific.",
        ],
      },
      {
        type: "p",
        text: "Do this once manually and it clicks. After that, let the extension do the boring parts — testing every code, picking the winner, and telling you the exact bank offer combo to use.",
      },
    ],
  },
  {
    slug: "amazon-india-lightning-deals",
    tag: "Deals",
    date: "Apr 03, 2026",
    title: "The truth about Amazon India lightning deals",
    excerpt:
      "We tracked 1,200 lightning deals over 30 days. Here's when prices actually drop, and how goCoupon catches the best window automatically.",
    read: "7 min read",
    author: "goCoupon Deals Desk",
    body: [
      {
        type: "p",
        text: "Lightning deals feel like urgency wrapped in a progress bar. But most of them follow patterns you can predict. We scraped 1,200 deals across 30 days to find out when Amazon India actually sells at the best price — and it's almost never when the banner screams the loudest.",
      },
      { type: "h2", text: "What we measured" },
      {
        type: "ul",
        items: [
          "Price at deal start, midpoint and end.",
          "Time to 'Claimed' on capped deals.",
          "Follow-up price in the 48 hours after the deal ended.",
        ],
      },
      { type: "h2", text: "Three patterns worth knowing" },
      { type: "h3", text: "1. The pre-claim window" },
      {
        type: "p",
        text: "For deals that sell out, ~62% were fully claimed within the first 9 minutes. If a product is still available at the 15-minute mark, it usually lasts the full deal window — but the price rarely moves further.",
      },
      { type: "h3", text: "2. The ghost reset" },
      {
        type: "p",
        text: "Roughly 1 in 5 lightning deals returned to an equal or lower price within 48 hours as part of a coupon or subscribe-and-save bundle. These are the deals you should not rush.",
      },
      { type: "h3", text: "3. The bank-offer cliff" },
      {
        type: "p",
        text: "Bank offers disappear faster than deal pricing. The most common pattern: the 10% bank discount is pulled 2 hours before the deal ends, but the product itself stays discounted.",
      },
      { type: "h2", text: "What goCoupon does automatically" },
      {
        type: "ul",
        items: [
          "Tracks if a product has been the same or cheaper in the last 30 days.",
          "Flags 'rush' deals that historically sell out in under 10 minutes.",
          "Checks if a working coupon or subscribe-and-save beats the lightning price.",
        ],
      },
      {
        type: "p",
        text: "The result: you stop reacting to banners and start reacting to the actual curve.",
      },
    ],
  },
  {
    slug: "gocoupon-2-4-faster-checkout",
    tag: "Product",
    date: "Mar 24, 2026",
    title: "Inside goCoupon 2.4 — faster checkout, smarter codes",
    excerpt:
      "Our latest release tests coupons 3× faster and supports Myntra Insider pricing. A short look at what shipped and what's next.",
    read: "4 min read",
    author: "goCoupon Product",
    body: [
      {
        type: "p",
        text: "2.4 is our biggest checkout-performance release. The team rewrote the coupon runner from the ground up and shipped first-class support for Myntra Insider pricing. Here's the short version.",
      },
      { type: "h2", text: "A parallel coupon runner" },
      {
        type: "p",
        text: "Previously we tested codes one by one. 2.4 tests up to five candidate codes in parallel, with a smart scoring system that stops early when we're confident we've found the best discount. On average, checkout now completes 3× faster.",
      },
      { type: "h2", text: "Myntra Insider support" },
      {
        type: "p",
        text: "Insider tiers are now detected automatically. If you're Silver or above, goCoupon will prefer insider-exclusive codes when they result in a larger absolute saving than the public coupon set.",
      },
      { type: "h2", text: "Smaller wins" },
      {
        type: "ul",
        items: [
          "Toast messages now show the exact saving vs the runner-up code.",
          "We removed ~180 outdated codes from our catalog.",
          "Dark mode on the popup — by popular demand.",
        ],
      },
      { type: "h2", text: "What's next" },
      {
        type: "p",
        text: "We're testing a 'best time to buy' badge powered by our price history. Expect a beta in 2.5 for Amazon and Flipkart first.",
      },
    ],
  },
  {
    slug: "myntra-insider-pricing-explained",
    tag: "Guides",
    date: "Mar 15, 2026",
    title: "Myntra Insider pricing, explained (with math)",
    excerpt:
      "Is Myntra Insider actually cheaper? We broke down the tiers, the bonus-point value, and when to ignore insider prices entirely.",
    read: "6 min read",
    author: "goCoupon Team",
    body: [
      {
        type: "p",
        text: "Myntra Insider is marketed as a loyalty program, but its real effect is a second price grid. We ran the numbers across six categories and here's how insider pricing actually works.",
      },
      { type: "h2", text: "What you're really getting" },
      {
        type: "ul",
        items: [
          "Early access to End of Reason Sale (EORS).",
          "Insider-only coupons, usually category-specific.",
          "Bonus points worth 0.5–1% of your spend.",
        ],
      },
      { type: "h2", text: "The break-even math" },
      {
        type: "p",
        text: "A Silver member spending ₹1,500/month earns about ₹120 in points per year. If even one insider coupon saves you ₹200, you've already covered the program for the year. For Gold and Platinum users, the break-even happens on the first order of most months.",
      },
      { type: "h2", text: "When to ignore insider prices" },
      {
        type: "p",
        text: "Large appliances and premium beauty sometimes carry insider-only prices that are higher than the platform's standard coupon stack. goCoupon checks both grids and always shows the cheaper path.",
      },
    ],
  },
  {
    slug: "why-coupons-fail-at-checkout",
    tag: "Guides",
    date: "Mar 02, 2026",
    title: "Why coupons silently fail at checkout (and how to fix it)",
    excerpt:
      "Half the coupons on the internet don't apply. Here are the five most common reasons — and a checklist to avoid them.",
    read: "5 min read",
    author: "goCoupon Team",
    body: [
      {
        type: "p",
        text: "You copy a code, paste it, and nothing happens. Or worse, the field turns green for half a second and then quietly resets. Here are the five reasons coupons fail, ranked by how often they actually do.",
      },
      { type: "h2", text: "1. Wrong cart value" },
      {
        type: "p",
        text: "The most common failure: minimum cart requirements hidden in the T&Cs. Most coupons bind to a subtotal, not the final post-discount value.",
      },
      { type: "h2", text: "2. Category lock" },
      {
        type: "p",
        text: "Fashion coupons don't apply on smartphones. If a code was scraped from a general deal site, odds are it's category-locked and you won't see it in the error.",
      },
      { type: "h2", text: "3. Stacked promo exclusion" },
      {
        type: "p",
        text: "If the product is already part of a bundle or subscribe-and-save, most platforms silently block an additional coupon.",
      },
      { type: "h2", text: "4. Regional" },
      {
        type: "p",
        text: "Some codes are pincode-locked to test markets. The extension detects this instantly and moves on — humans usually don't.",
      },
      { type: "h2", text: "5. Expired but cached" },
      {
        type: "p",
        text: "Coupon listicles don't update. We remove codes from our index the moment they fail twice in a row, globally.",
      },
      { type: "h2", text: "A 30-second self-check" },
      {
        type: "ul",
        items: [
          "Does your cart meet the minimum?",
          "Is there a bundle or SnS discount already attached?",
          "Did you try the code before choosing EMI?",
          "Have you refreshed the page once?",
        ],
      },
      {
        type: "p",
        text: "If you've answered yes to all four and the code still fails, it's dead — move on. goCoupon does this check automatically on every cart.",
      },
    ],
  },
  {
    slug: "cashback-myths-explained",
    tag: "Deals",
    date: "Feb 20, 2026",
    title: "Five cashback myths we finally put to rest",
    excerpt:
      "Is cashback always worth it? We ran the numbers against coupon-only savings and the result surprised even us.",
    read: "6 min read",
    author: "goCoupon Deals Desk",
    body: [
      {
        type: "p",
        text: "Cashback sounds like free money. Sometimes it is; often it's a mechanism to slow down your savings. We compared 400 real checkouts to measure how cashback actually stacks against a well-applied coupon.",
      },
      { type: "h2", text: "Myth 1 — More cashback always wins" },
      {
        type: "p",
        text: "A 10% cashback on ₹2,000 returns ₹200 — but only once cleared. A 15% coupon returns ₹300 immediately. Coupons beat cashback in 72% of small-ticket checkouts.",
      },
      { type: "h2", text: "Myth 2 — Cashback is risk-free" },
      {
        type: "p",
        text: "Tracking failures are the silent tax. On average, 6–8% of cashback sessions don't track properly and need a manual escalation. Coupons can't fail this way.",
      },
      { type: "h2", text: "Myth 3 — You can always stack" },
      {
        type: "p",
        text: "You usually can't. Most platforms require you to reach their site via an affiliate link for cashback to register. Clicking a coupon site first can void the cashback on the same session.",
      },
      { type: "h2", text: "Myth 4 — All categories cashback equally" },
      {
        type: "p",
        text: "Electronics cashback is often capped at ₹150–₹300. Fashion cashback can float to 8–10% of the order value with no hard cap.",
      },
      { type: "h2", text: "Myth 5 — Cashback and coupons fight each other" },
      {
        type: "p",
        text: "On goCoupon we pick the winning combo for you. When cashback pays more, we route you through the cashback session. When coupons pay more, we silently skip cashback and just apply the code.",
      },
    ],
  },
  {
    slug: "new-year-sale-coupons-india-2026",
    tag: "Deals",
    date: "Jan 02, 2026",
    title: "New Year Sale Coupons India 2026: best deals this week",
    excerpt:
      "A practical list of New Year sale coupon opportunities across Amazon, Flipkart and Myntra, with a quick method to avoid expired offers.",
    read: "5 min read",
    author: "goCoupon Deals Desk",
    body: [
      {
        type: "p",
        text: "New Year sale windows in India are short and noisy. The biggest mistake shoppers make is chasing viral coupon screenshots instead of checkout-validated codes.",
      },
      { type: "h2", text: "Where New Year coupon demand is highest" },
      {
        type: "ul",
        items: [
          "Amazon: electronics and appliances.",
          "Flipkart: smartphones and accessories.",
          "Myntra: fashion and beauty bundles.",
        ],
      },
      { type: "h2", text: "How to avoid expired coupon pages" },
      {
        type: "p",
        text: "Use pages that are updated during sale week and verify at checkout. goCoupon does this in real-time by testing codes on your actual cart instead of showing static lists.",
      },
    ],
  },
  {
    slug: "republic-day-sale-coupons-2026",
    tag: "Deals",
    date: "Jan 18, 2026",
    title: "Republic Day Sale 2026 coupons: what to apply first",
    excerpt:
      "A simple Republic Day strategy: coupon first, bank offer second, then cashback. Includes category-wise guidance for electronics and fashion.",
    read: "6 min read",
    author: "goCoupon Team",
    body: [
      {
        type: "p",
        text: "Republic Day week drives one of the largest coupon spikes in Q1. But sequencing matters: apply percentage coupon first, then card offer, then check cashback eligibility.",
      },
      { type: "h2", text: "Best sequence for Republic Day checkout" },
      {
        type: "ul",
        items: [
          "Validate cart coupon for your category.",
          "Pick payment method with strongest eligible bank offer.",
          "Confirm final payable before and after cashback projection.",
        ],
      },
      {
        type: "p",
        text: "This flow avoids the common issue where selecting EMI or wallet too early invalidates otherwise working promo codes.",
      },
    ],
  },
  {
    slug: "diwali-coupons-2026-stack-guide",
    tag: "Guides",
    date: "Oct 04, 2026",
    title: "Diwali 2026 coupon stacking guide for maximum savings",
    excerpt:
      "Diwali is the highest-intent shopping season in India. This guide shows how to stack coupon codes, flash deals and bank benefits safely.",
    read: "8 min read",
    author: "goCoupon Team",
    body: [
      {
        type: "p",
        text: "Diwali deal pages are built for urgency, not clarity. A better approach is to decide your stack logic before checkout opens.",
      },
      { type: "h2", text: "The Diwali stack checklist" },
      {
        type: "ul",
        items: [
          "Check if coupon applies on sale-tagged products.",
          "Compare card offers by net amount, not percentage label.",
          "Track if cashback requires a separate clickout session.",
          "Keep one fallback code in case inventory or terms change.",
        ],
      },
      { type: "h2", text: "High-frequency mistakes during Diwali sales" },
      {
        type: "p",
        text: "Most failed checkouts come from code-entry order, not code quality. Running automated validation on the actual cart solves this quickly.",
      },
    ],
  },
  {
    slug: "best-coupon-extensions-chrome-2026",
    tag: "Guides",
    date: "Nov 06, 2026",
    title: "Top coupon extensions for Chrome in 2026 (India focus)",
    excerpt:
      "What to evaluate before installing a coupon extension: store coverage, validation quality, browser impact and cashback transparency.",
    read: "7 min read",
    author: "goCoupon Editorial",
    body: [
      {
        type: "p",
        text: "Not all coupon extensions behave the same. Some show long lists of stale codes, while others validate in checkout context and prioritize net savings.",
      },
      { type: "h2", text: "What makes an extension actually useful" },
      {
        type: "ul",
        items: [
          "Checkout-level code validation, not static archives.",
          "Coverage on top Indian stores you use weekly.",
          "Clear data practices and low browser overhead.",
          "Transparent cashback status tracking.",
        ],
      },
      {
        type: "p",
        text: "For power shoppers, the best extension is the one that minimizes failed attempts and confirms the strongest payable amount quickly.",
      },
    ],
  },
];

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
