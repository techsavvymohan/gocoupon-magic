/**
 * @file src/data/categoriesData.ts
 * @description Centralized category taxonomy and metadata powering dedicated category pages,
 * breadcrumbs, internal linking graphs, and search engine prerendering.
 */

export interface CategoryDetail {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  lead: string;
  directAnswer: string;
  iconName: string;
  avgSavings: string;
  topDiscount: string;
  primaryStores: Array<{
    name: string;
    slug?: string;
    domain: string;
    discountBadge: string;
    healthScore: number;
    activeCodes: number;
    popularCode: string;
  }>;
  savingTips: Array<{
    title: string;
    description: string;
  }>;
  bankOffers: Array<{
    bank: string;
    offer: string;
    code: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  relatedGuides: Array<{
    title: string;
    slug: string;
    readTime: string;
  }>;
}

export const CATEGORIES_TAXONOMY: CategoryDetail[] = [
  {
    slug: "electronics",
    name: "Electronics & Mobiles",
    shortName: "Electronics",
    tagline: "Smartphones, Laptops, Audio Gear & 4K Smart TVs",
    seoTitle: "Electronics & Mobile Coupons (2026) | GoCoupon",
    seoDescription: "Save up to 45% on smartphones, laptops & audio with verified Amazon, Flipkart & Croma coupons. Auto-apply the highest discounts at checkout.",
    h1: "Verified Electronics & Mobile Coupon Codes (2026)",
    lead: "Compare live store discounts, stackable bank card offers, and verified promo codes across top consumer electronics retailers.",
    directAnswer: "Save on electronics by combining merchant coupon codes with HDFC, ICICI, or SBI credit card instant discounts and checking 30-day price history graphs before checkout.",
    iconName: "Smartphone",
    avgSavings: "15% – 45% OFF",
    topDiscount: "Up to ₹15,000 OFF",
    primaryStores: [
      {
        name: "Amazon India",
        slug: "amazon-coupons",
        domain: "amazon.in",
        discountBadge: "Up to 75% OFF",
        healthScore: 95,
        activeCodes: 68,
        popularCode: "AMZSAVE15",
      },
      {
        name: "Flipkart",
        slug: "flipkart-coupons",
        domain: "flipkart.com",
        discountBadge: "Up to 80% OFF",
        healthScore: 92,
        activeCodes: 52,
        popularCode: "FKFEST2026",
      },
      {
        name: "Croma Retail",
        slug: "croma-coupons",
        domain: "croma.com",
        discountBadge: "Up to 50% OFF",
        healthScore: 90,
        activeCodes: 28,
        popularCode: "CRMA2026",
      },
      {
        name: "boAt Lifestyle",
        slug: "boat-coupons",
        domain: "boat-lifestyle.com",
        discountBadge: "Extra 15% OFF",
        healthScore: 96,
        activeCodes: 34,
        popularCode: "BOATHEAD15",
      },
      {
        name: "Tata CLiQ",
        slug: "tata-cliq-coupons",
        domain: "tatacliq.com",
        discountBadge: "Up to 60% OFF",
        healthScore: 89,
        activeCodes: 24,
        popularCode: "CLIQTECH10",
      },
    ],
    savingTips: [
      {
        title: "Stack Bank EMI & Full-Swipe Offers",
        description: "HDFC, ICICI, and SBI frequently partner with Amazon and Flipkart for 10% instant checkout discounts. Always choose eligible card checkout over UPI when deals are active.",
      },
      {
        title: "Inspect 30-Day Historical Price Graphs",
        description: "Consumer electronics often see artificial price markups right before seasonal sales. Use GoCoupon's price tracking to confirm genuine drops.",
      },
      {
        title: "Exchange Bonus Stacking",
        description: "Combine old device trade-in bonuses with brand promo vouchers to slash up to ₹8,000 additional off flagship smartphone purchases.",
      },
    ],
    bankOffers: [
      { bank: "HDFC Bank", offer: "10% Instant Discount up to ₹1,750 on Credit Cards", code: "AUTO-APPLY" },
      { bank: "ICICI Bank", offer: "Flat ₹1,500 off on Laptops & Smart TVs above ₹25,000", code: "ICICITECH" },
      { bank: "SBI Card", offer: "Extra ₹750 off on Mobile purchases with SBI Credit", code: "SBISAVE" },
    ],
    faqs: [
      {
        question: "How do I find working coupon codes for electronics?",
        answer: "Install the free GoCoupon Chrome extension or browse this category page. GoCoupon runs parallel tests on checkout forms in under 850ms, applying the single voucher that yields the highest rupee discount.",
      },
      {
        question: "Can I combine electronics coupons with exchange bonuses?",
        answer: "Yes! Most major retailers including Amazon and Flipkart allow store promo vouchers to stack with device trade-in discounts and bank card cashbacks.",
      },
      {
        question: "When is the cheapest time of year to purchase electronics?",
        answer: "Big Billion Days, Amazon Great Indian Festival, and Diwali week (September–November) offer the steepest price reductions, followed by Prime Day in July.",
      },
      {
        question: "Are refurbished electronics coupon codes valid on GoCoupon?",
        answer: "Yes, we regularly verify certified refurbished laptop and smartphone discounts on Amazon Renewed, Flipkart Refurbished, and Cashify.",
      },
    ],
    relatedGuides: [
      {
        title: "Best Flagship Laptops in India (2026 Guide)",
        slug: "best-flagship-laptops-india",
        readTime: "6 min read",
      },
      {
        title: "Best Wireless Headphones Under ₹30k",
        slug: "best-wireless-headphones-under-30000",
        readTime: "5 min read",
      },
      {
        title: "Why Other Coupon Apps Fail (And How GoCoupon Saves Thousands)",
        slug: "why-other-coupon-apps-fail-and-how-gocoupon-saves-thousands",
        readTime: "5 min read",
      },
    ],
  },
  {
    slug: "fashion",
    name: "Fashion & Lifestyle",
    shortName: "Fashion",
    tagline: "Designer Apparel, Footwear, Handbags & Luxury Watches",
    seoTitle: "Fashion & Apparel Promo Codes (2026) | GoCoupon",
    seoDescription: "Discover working promo codes for Myntra, Ajio, Meesho & Flipkart Fashion. Save up to 60% on apparel & footwear with verified vouchers.",
    h1: "Verified Fashion & Apparel Coupon Codes (2026)",
    lead: "Save on authentic designer brands, casual streetwear, ethnic wear, and footwear with verified vouchers and reward stacking.",
    directAnswer: "Maximize fashion savings by applying brand voucher codes at cart checkout, redeeming loyalty points (like Myntra Insider), and shopping during monthly End of Season sales.",
    iconName: "Shirt",
    avgSavings: "25% – 60% OFF",
    topDiscount: "Flat 65% OFF",
    primaryStores: [
      {
        name: "Myntra",
        slug: "myntra-coupons",
        domain: "myntra.com",
        discountBadge: "Up to 70% OFF",
        healthScore: 96,
        activeCodes: 58,
        popularCode: "MYNTRA200",
      },
      {
        name: "Meesho",
        slug: "meesho-coupons",
        domain: "meesho.com",
        discountBadge: "Up to 80% OFF",
        healthScore: 91,
        activeCodes: 36,
        popularCode: "MEESHO100",
      },
      {
        name: "Flipkart Fashion",
        slug: "flipkart-coupons",
        domain: "flipkart.com",
        discountBadge: "Up to 75% OFF",
        healthScore: 92,
        activeCodes: 44,
        popularCode: "STYLE2026",
      },
      {
        name: "Tata CLiQ Luxury",
        slug: "tata-cliq-coupons",
        domain: "tatacliq.com",
        discountBadge: "Up to 50% OFF",
        healthScore: 89,
        activeCodes: 22,
        popularCode: "LUXURY15",
      },
    ],
    savingTips: [
      {
        title: "Stack First-Time App Coupons",
        description: "Retailers like Myntra and Ajio offer ₹200 to ₹400 off for first-time purchases. Combine these with active brand clearance discounts.",
      },
      {
        title: "Redeem Insider Tier Points",
        description: "Convert loyalty points to coupon codes for an extra 10–15% discount on top of ongoing seasonal promotions.",
      },
      {
        title: "Shop Midweek Flash Sales",
        description: "Fashion retailers frequently launch 4-hour flash sales on Wednesday and Thursday evenings with deeper markdowns than weekend peaks.",
      },
    ],
    bankOffers: [
      { bank: "Kotak Mahindra", offer: "Flat 10% Instant Savings on Myntra Fashion", code: "KOTAKFASHION" },
      { bank: "Axis Bank", offer: "Up to ₹500 off on apparel orders above ₹2,499", code: "AXISSTYLE" },
    ],
    faqs: [
      {
        question: "How do I apply coupon codes on Myntra and Ajio?",
        answer: "When checking out, GoCoupon's browser assistant detects the promo code field and auto-tests all available vouchers to select the highest savings in under 850ms.",
      },
      {
        question: "Can I return items bought with discount coupons?",
        answer: "Yes, standard return and refund policies apply. Refunds are processed based on the actual discounted amount paid at checkout.",
      },
      {
        question: "Do coupons work on luxury fashion brands?",
        answer: "Select luxury brands allow store-wide promo codes, while others restrict promotions. GoCoupon automatically checks eligibility for your exact cart contents.",
      },
    ],
    relatedGuides: [
      {
        title: "Why Other Coupon Apps Fail (And How GoCoupon Rescues Your Budget)",
        slug: "why-other-coupon-apps-fail-and-how-gocoupon-saves-thousands",
        readTime: "5 min read",
      },
      {
        title: "Best Flagship Laptops in India",
        slug: "best-flagship-laptops-india",
        readTime: "6 min read",
      },
    ],
  },
  {
    slug: "beauty",
    name: "Beauty & Personal Care",
    shortName: "Beauty",
    tagline: "Authentic Skincare, Luxury Perfumes & Haircare",
    seoTitle: "Beauty & Skincare Promo Codes (2026) | GoCoupon",
    seoDescription: "Get up to 50% off cosmetics, Korean skincare & perfumes with verified Nykaa, Mamaearth & Amazon Beauty coupon codes. Verified in 850ms.",
    h1: "Verified Beauty & Personal Care Coupon Codes (2026)",
    lead: "Pamper yourself for less with verified coupon codes for top skincare, makeup, and wellness brands.",
    directAnswer: "Save on cosmetics and skincare by utilizing brand-specific introductory codes, free gift-with-purchase vouchers, and Nykaa Pink Friday seasonal discounts.",
    iconName: "Heart",
    avgSavings: "20% – 50% OFF",
    topDiscount: "Buy 1 Get 1 FREE",
    primaryStores: [
      {
        name: "Nykaa",
        slug: "nykaa-coupons",
        domain: "nykaa.com",
        discountBadge: "Up to 50% OFF",
        healthScore: 94,
        activeCodes: 42,
        popularCode: "NYKAANEW",
      },
      {
        name: "Amazon Beauty",
        slug: "amazon-coupons",
        domain: "amazon.in",
        discountBadge: "Up to 60% OFF",
        healthScore: 95,
        activeCodes: 50,
        popularCode: "GLOW2026",
      },
      {
        name: "Myntra Beauty",
        slug: "myntra-coupons",
        domain: "myntra.com",
        discountBadge: "Up to 55% OFF",
        healthScore: 96,
        activeCodes: 38,
        popularCode: "BEAUTY15",
      },
    ],
    savingTips: [
      {
        title: "Look for Free Gift-with-Purchase (GWP) Vouchers",
        description: "Beauty brands often bundle deluxe travel miniatures worth ₹500–₹1,500 on qualifying cart thresholds.",
      },
      {
        title: "Combine BOGO Midweek Specials",
        description: "Tuesdays and Thursdays often feature Buy 1 Get 1 or Buy 2 Get 1 promotions across personal care categories.",
      },
    ],
    bankOffers: [
      { bank: "Standard Chartered", offer: "15% Cashback on Beauty Orders above ₹2,000", code: "SCBEAUTY" },
      { bank: "Paytm UPI", offer: "Flat ₹100 Cashback on Nykaa & Mamaearth", code: "PAYTMPERSONAL" },
    ],
    faqs: [
      {
        question: "Are beauty coupons valid on international brands?",
        answer: "Yes, GoCoupon monitors authorized distributors for The Ordinary, Clinique, MAC, and Korean skincare brands to verify applicable promo vouchers.",
      },
      {
        question: "When is the biggest beauty sale of the year?",
        answer: "The Nykaa Pink Friday Sale in late November and Amazon Beauty Summer Festival offer the deepest discounts of up to 60% off.",
      },
    ],
    relatedGuides: [
      {
        title: "Why Other Coupon Apps Fail",
        slug: "why-other-coupon-apps-fail-and-how-gocoupon-saves-thousands",
        readTime: "5 min read",
      },
    ],
  },
  {
    slug: "travel",
    name: "Travel, Flights & Hotels",
    shortName: "Travel",
    tagline: "Domestic & International Flights, Boutique Resorts & Trains",
    seoTitle: "Travel & Flight Booking Coupons (2026) | GoCoupon",
    seoDescription: "Save ₹1,200 to ₹5,000 on flights, luxury hotels & holidays with verified MakeMyTrip, Cleartrip & airline promo codes. Zero extra fees.",
    h1: "Verified Flight & Hotel Booking Coupons (2026)",
    lead: "Explore the world without overspending. Access verified airline promo codes, resort discounts, and credit card fee waivers.",
    directAnswer: "Book flights and hotel stays during Tuesday fare windows, use bank card promo vouchers for instant fee waivers, and apply corporate coupon codes for free cancellation.",
    iconName: "Plane",
    avgSavings: "₹1,200 – ₹5,000 OFF",
    topDiscount: "Flat ₹6,500 OFF",
    primaryStores: [
      {
        name: "MakeMyTrip",
        domain: "makemytrip.com",
        discountBadge: "Up to ₹5,000 OFF",
        healthScore: 92,
        activeCodes: 30,
        popularCode: "MMTTRIP",
      },
      {
        name: "Cleartrip",
        domain: "cleartrip.com",
        discountBadge: "Up to ₹3,500 OFF",
        healthScore: 89,
        activeCodes: 24,
        popularCode: "CTFLY",
      },
    ],
    savingTips: [
      {
        title: "Book Flights on Tuesday Mornings",
        description: "Historical fare telemetry confirms airlines release competitive route discounts early in the week between 08:00 and 11:00 AM IST.",
      },
      {
        title: "Zero Convenience Fee Card Offers",
        description: "Look for bank vouchers that waive the standard ₹350–₹700 platform convenience fees on roundtrip bookings.",
      },
    ],
    bankOffers: [
      { bank: "ICICI Bank", offer: "Flat 12% off on Domestic Flights above ₹5,000", code: "FLYICICI" },
      { bank: "HDFC Bank", offer: "Up to ₹4,000 off on International Hotel Bookings", code: "HDFCTRAVEL" },
    ],
    faqs: [
      {
        question: "Can I use flight coupons for roundtrip bookings?",
        answer: "Yes, many promo codes provide higher discounts on roundtrip itineraries compared to single one-way tickets.",
      },
      {
        question: "Do travel coupons cover baggage and meal fees?",
        answer: "Most coupons apply directly to base fare and airline surcharges. Ancillary services like extra baggage are typically excluded.",
      },
    ],
    relatedGuides: [
      {
        title: "Why Other Coupon Apps Fail",
        slug: "why-other-coupon-apps-fail-and-how-gocoupon-saves-thousands",
        readTime: "5 min read",
      },
    ],
  },
  {
    slug: "food-dining",
    name: "Food Delivery & Dining",
    shortName: "Food & Dining",
    tagline: "Late-Night Delivery, Cloud Kitchens & Restaurant Dining",
    seoTitle: "Food Delivery & Dining Promo Codes | GoCoupon",
    seoDescription: "Auto-apply working promo codes for Swiggy, Zomato & Domino's Pizza. Save up to 50% on gourmet meals & weekend dining with verified vouchers.",
    h1: "Verified Food Delivery & Dining Coupons (2026)",
    lead: "Never order at full price. Find verified promo codes and payment discounts for Swiggy, Zomato, Domino's, and local cloud kitchens.",
    directAnswer: "Get cheaper food delivery by combining restaurant-specific percentage coupons with bank payment offers (Paytm, Cred, Axis) and free delivery membership perks.",
    iconName: "Utensils",
    avgSavings: "30% – 50% OFF",
    topDiscount: "Flat 50% OFF",
    primaryStores: [
      {
        name: "Swiggy",
        domain: "swiggy.com",
        discountBadge: "Up to 50% OFF",
        healthScore: 93,
        activeCodes: 45,
        popularCode: "SWIGGY50",
      },
      {
        name: "Zomato",
        domain: "zomato.com",
        discountBadge: "Up to 60% OFF",
        healthScore: 91,
        activeCodes: 40,
        popularCode: "ZOMATOFEAST",
      },
      {
        name: "Domino's Pizza",
        domain: "dominos.co.in",
        discountBadge: "Flat ₹150 OFF",
        healthScore: 95,
        activeCodes: 26,
        popularCode: "DOM150",
      },
    ],
    savingTips: [
      {
        title: "Stack Free Delivery Subscriptions with Brand Codes",
        description: "Services like Swiggy One and Zomato Gold eliminate delivery fees, allowing your coupon discount to apply purely to food costs.",
      },
      {
        title: "Check Payment Wallet Scratchcards",
        description: "Amazon Pay, Cred UPI, and Paytm regularly offer ₹50–₹100 cashback on meal orders when selected as the final payment gateway.",
      },
    ],
    bankOffers: [
      { bank: "Axis Bank", offer: "Flat ₹120 off on orders above ₹499 via Axis Cards", code: "AXISFOOD" },
      { bank: "Cred Pay", offer: "Up to ₹100 Cashback on dining checkout", code: "CREDDINE" },
    ],
    faqs: [
      {
        question: "Can I stack restaurant coupons with food delivery bank offers?",
        answer: "Yes, you can apply restaurant-specific coupons (e.g. 40% off up to ₹100) and then select an eligible bank card or wallet at payment for dual savings.",
      },
      {
        question: "Why do some food coupons fail at checkout?",
        answer: "Food coupons usually enforce minimum order values (MOV) and restaurant-specific participation criteria. GoCoupon tests each code to confirm it meets your exact order threshold.",
      },
    ],
    relatedGuides: [
      {
        title: "Why Other Coupon Apps Fail",
        slug: "why-other-coupon-apps-fail-and-how-gocoupon-saves-thousands",
        readTime: "5 min read",
      },
    ],
  },
  {
    slug: "home",
    name: "Home, Kitchen & Decor",
    shortName: "Home & Kitchen",
    tagline: "Ergonomic Furniture, Smart Cookware & Modern Bedding",
    seoTitle: "Home & Kitchen Appliance Coupons | GoCoupon",
    seoDescription: "Save up to 70% on cookware, air fryers & furniture with verified Amazon Home, Flipkart & Meesho promo codes. No-cost EMI & instant discounts.",
    h1: "Verified Home & Kitchen Appliance Coupons (2026)",
    lead: "Transform your living spaces for less with verified coupon codes on appliances, ergonomic furnishings, and kitchenware.",
    directAnswer: "Save on home renovation and appliances by shopping during festival makeover events, checking historical lowest price graphs, and leveraging no-cost EMI bank waivers.",
    iconName: "Home",
    avgSavings: "25% – 70% OFF",
    topDiscount: "Flat 60% OFF",
    primaryStores: [
      {
        name: "Amazon Home",
        slug: "amazon-coupons",
        domain: "amazon.in",
        discountBadge: "Up to 70% OFF",
        healthScore: 95,
        activeCodes: 55,
        popularCode: "HOMEFEST",
      },
      {
        name: "Flipkart Home",
        slug: "flipkart-coupons",
        domain: "flipkart.com",
        discountBadge: "Up to 65% OFF",
        healthScore: 92,
        activeCodes: 46,
        popularCode: "FURNISH26",
      },
      {
        name: "Meesho Home Decor",
        slug: "meesho-coupons",
        domain: "meesho.com",
        discountBadge: "Up to 80% OFF",
        healthScore: 91,
        activeCodes: 30,
        popularCode: "DECOR100",
      },
    ],
    savingTips: [
      {
        title: "Take Advantage of No-Cost EMI Waivers",
        description: "Major home appliances often offer 6–12 month zero-interest EMI financing, saving ₹2,000–₹6,000 in interest charges.",
      },
      {
        title: "Shop During Festive Makeover Sales",
        description: "Diwali (September–November) features the deepest furniture and appliance markdowns of the entire calendar year.",
      },
    ],
    bankOffers: [
      { bank: "SBI Card", offer: "Flat ₹2,000 Instant Off on Home Appliances above ₹30,000", code: "SBISAVEHOME" },
    ],
    faqs: [
      {
        question: "Do home appliance coupons include free delivery and installation?",
        answer: "Most large appliances come with free standard delivery and manufacturer installation. Look for retailer badges indicating included setup.",
      },
    ],
    relatedGuides: [
      {
        title: "Best Flagship Laptops in India",
        slug: "best-flagship-laptops-india",
        readTime: "6 min read",
      },
    ],
  },
];
