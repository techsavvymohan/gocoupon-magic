/**
 * @file src/open_food_fact/store-matcher.ts
 * @description Matches Open Food Facts products to verified retailer links,
 * instant delivery services, and active GoCoupon promotional coupon codes.
 */

import type { FoodProduct, GroceryStoreOffer, FoodProductComparison } from "./types.js";

/**
 * Clean and build search keywords from a FoodProduct
 */
export function buildProductSearchQuery(product: FoodProduct): string {
  const parts: string[] = [];
  
  if (product.brands && !product.brands.toLowerCase().includes("generic") && !product.brands.toLowerCase().includes("brand verified")) {
    // Take the primary brand
    const primaryBrand = product.brands.split(",")[0].trim();
    parts.push(primaryBrand);
  }
  
  if (product.product_name) {
    parts.push(product.product_name);
  }

  if (product.quantity) {
    // Clean up quantity like "400 g e" -> "400g"
    const cleanQty = product.quantity.replace(/\s*e\s*$/i, "").trim();
    if (cleanQty && !parts.join(" ").includes(cleanQty)) {
      parts.push(cleanQty);
    }
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Generate multi-store grocery delivery & price discovery offers with GoCoupon codes
 */
export function matchStoreOffers(product: FoodProduct): GroceryStoreOffer[] {
  const query = buildProductSearchQuery(product);
  const encodedQuery = encodeURIComponent(query);

  const offers: GroceryStoreOffer[] = [
    {
      storeId: "amazon",
      storeName: "Amazon Fresh",
      logo: "/Brand logos/Amazon_logo.svg.webp",
      fallbackIcon: "📦",
      domain: "amazon.com",
      couponCode: "AMZSAVE15",
      couponDiscount: "15% OFF",
      couponDescription: "15% instant savings with Subscribe & Save / Prime Pantry",
      affiliateUrl: `https://www.amazon.com/s?k=${encodedQuery}&i=amazonfresh&tag=gocoupon-20`,
      deliveryTime: "Same-Day / 2-Hour Prime Delivery",
      inStock: true,
      badge: "Top Choice",
    },
    {
      storeId: "walmart",
      storeName: "Walmart Grocery",
      logo: "/icons/WMT-Wordmark-Small-TrueBlue-RGB.png",
      fallbackIcon: "🛒",
      domain: "walmart.com",
      couponCode: "WALMART10",
      couponDiscount: "$10 OFF",
      couponDescription: "$10 off your first 3 grocery pickup or delivery orders above $50",
      affiliateUrl: `https://www.walmart.com/search?q=${encodedQuery}&facet=fulfillment_method%3APickup`,
      deliveryTime: "Free Curbside Pickup or Same-Day Delivery",
      inStock: true,
      badge: "Rollback Savings",
    },
    {
      storeId: "target",
      storeName: "Target Grocery",
      logo: "/icons/target.svg",
      fallbackIcon: "🎯",
      domain: "target.com",
      couponCode: "CIRCLE20",
      couponDiscount: "20% OFF",
      couponDescription: "Target Circle 20% off grocery & pantry favorites",
      affiliateUrl: `https://www.target.com/s?searchTerm=${encodedQuery}`,
      deliveryTime: "Drive Up / Order Pickup in 2 Hours",
      inStock: true,
      badge: "Circle Deals",
    },
    {
      storeId: "flipkart",
      storeName: "Flipkart Grocery",
      logo: "/Brand logos/flipkart.webp",
      fallbackIcon: "🛍️",
      domain: "flipkart.com",
      couponCode: "GROCERY50",
      couponDiscount: "Flat ₹50 OFF",
      couponDescription: "Flat ₹50 off on essential grocery staples above ₹499",
      affiliateUrl: `https://www.flipkart.com/search?q=${encodedQuery}&marketplace=GROCERY`,
      deliveryTime: "Next-Day Delivery Slot",
      inStock: true,
      badge: "Supermart Deals",
    },
    {
      storeId: "blinkit",
      storeName: "Blinkit (Quick Commerce)",
      logo: "/gc-logo.webp",
      fallbackIcon: "⚡",
      domain: "blinkit.com",
      couponCode: "BLINKIT100",
      couponDiscount: "₹100 OFF",
      couponDescription: "₹100 discount for new & returning customers on instant grocery carts",
      affiliateUrl: `https://blinkit.com/s/?q=${encodedQuery}`,
      deliveryTime: "10-15 Min Instant Delivery",
      inStock: true,
      badge: "Instant 10-Min",
    },
  ];

  return offers;
}

/**
 * Fetch verified real-world store prices from the Open Prices API
 */
export async function fetchVerifiedOpenPrices(barcode: string): Promise<GroceryStoreOffer[]> {
  if (!barcode) return [];
  try {
    const res = await fetch(
      `https://prices.openfoodfacts.org/api/v1/prices?product_code=${barcode}&size=10&order_by=-date`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.items || [];
    const verifiedOffers: GroceryStoreOffer[] = [];

    for (const item of items) {
      if (typeof item.price !== "number" || item.price <= 0) continue;
      const storeName =
        item.location?.osm_brand ||
        item.location?.name ||
        item.location?.osm_name ||
        "Verified Retailer";
      const city = item.location?.osm_address_city || item.location?.city || "";
      const currency = item.currency || "EUR";
      const logo =
        item.location?.osm_brand_logo_url ||
        (storeName.toLowerCase().includes("carrefour")
          ? "https://raw.githubusercontent.com/openfoodfacts/brand-images/refs/heads/main/xx/stores/carrefour.png"
          : "/gc-logo.webp");

      verifiedOffers.push({
        storeId: `openprice_${item.id || Math.random().toString(36).slice(2, 7)}`,
        storeName: city ? `${storeName} (${city})` : storeName,
        logo,
        fallbackIcon: "🏪",
        domain: "prices.openfoodfacts.org",
        price: item.price,
        estimatedPrice: `${currency} ${item.price.toFixed(2)}`,
        currency,
        couponCode: item.price_is_discounted ? "VERIFIED_DEAL" : undefined,
        couponDiscount: item.price_is_discounted ? "Special In-Store Promotion" : undefined,
        couponDescription: `Verified price on ${item.date || "recent scan"} by Open Food Facts community`,
        affiliateUrl: `https://prices.openfoodfacts.org/prices/${item.id}`,
        deliveryTime: "In-Store Verified Shelf Price",
        inStock: true,
        badge: "Verified Shelf Price",
      });
    }

    return verifiedOffers;
  } catch (err) {
    console.warn("Open Prices lookup failed:", err);
    return [];
  }
}

/**
 * Build a full FoodProductComparison payload with verified live prices
 */
export async function buildFoodProductComparison(
  product: FoodProduct,
  barcode?: string
): Promise<FoodProductComparison> {
  const code = barcode || product.barcode;
  const verifiedPrices = await fetchVerifiedOpenPrices(code);
  const onlineOffers = matchStoreOffers(product);

  // Combine verified in-store prices with online delivery store links
  const allOffers = [...verifiedPrices, ...onlineOffers];

  // If verified prices exist, sort them so the lowest price is first
  const pricedOffers = allOffers.filter((o) => typeof o.price === "number");
  if (pricedOffers.length > 0) {
    pricedOffers.sort((a, b) => (a.price || 0) - (b.price || 0));
    pricedOffers[0].isLowest = true;
    pricedOffers[0].badge = "Lowest Verified Price";
  }

  const lowestOffer = pricedOffers.length > 0 ? pricedOffers[0] : allOffers[0];

  return {
    product,
    offers: allOffers,
    lowestOffer,
    availableCouponsCount: allOffers.filter((o) => !!o.couponCode).length,
    timestamp: new Date().toISOString(),
  };
}
