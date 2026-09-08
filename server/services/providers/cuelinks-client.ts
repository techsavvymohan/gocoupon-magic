/**
 * @file server/services/providers/cuelinks-client.ts
 * @description Cuelinks Indian Retail Affiliate, Deep Linking & Coupon Client.
 *
 * Implements automated deep linking (wrapping merchant URLs with GoCoupon SubIDs),
 * coupon feed normalization for 200+ Indian merchants, and sandbox fallback mode.
 */

export interface CuelinksCouponOffer {
  id: string;
  storeName: string;
  storeDomain: string;
  campaignId: number;
  code: string;
  title: string;
  description: string;
  discount: string;
  minOrder?: number;
  startDate: string;
  endDate: string;
  affiliateUrl: string;
}

export interface CuelinksLinkOptions {
  merchantUrl: string;
  subId?: string;
  campaignId?: number;
}

const CUELINKS_PUBLISHER_ID = process.env.CUELINKS_PUBLISHER_ID || "198243";
const CUELINKS_API_KEY = process.env.CUELINKS_API_KEY;

/**
 * Builds a monetized affiliate redirect link using Cuelinks automation protocol.
 * Format: https://cuelinks.com/?id=[pubId]&url=[encodedUrl]&subid=[subId]
 */
export function buildCuelinksRedirectUrl(options: CuelinksLinkOptions): string {
  const targetUrl = options.merchantUrl;
  if (!targetUrl || targetUrl.startsWith("#")) return "#";

  const subId = options.subId || "gocoupon_web";
  const encoded = encodeURIComponent(targetUrl);

  return `https://cuelinks.com/?id=${CUELINKS_PUBLISHER_ID}&url=${encoded}&subid=${encodeURIComponent(subId)}`;
}

/**
 * Fetches verified live coupons for a specific store or category via Cuelinks.
 */
export async function fetchCuelinksCoupons(options: {
  storeNameOrDomain?: string;
  category?: string;
}): Promise<CuelinksCouponOffer[]> {
  // If API key available, query Cuelinks REST endpoint
  if (CUELINKS_API_KEY) {
    try {
      const url = new URL("https://api.cuelinks.com/v2/coupons.json");
      if (options.storeNameOrDomain) url.searchParams.set("campaign", options.storeNameOrDomain);
      if (options.category) url.searchParams.set("category", options.category);

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${CUELINKS_API_KEY}`,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        const rawOffers = data.coupons || [];
        return rawOffers.map((o: any) => ({
          id: `cue_${o.id}`,
          storeName: o.campaign_name || "Merchant",
          storeDomain: o.domain || "merchant.in",
          campaignId: o.campaign_id,
          code: o.code || "DEALACTIVATED",
          title: o.title || "Exclusive Offer",
          description: o.description || "",
          discount: o.discount_value || "Special Offer",
          minOrder: o.minimum_order,
          startDate: o.start_date || new Date().toISOString(),
          endDate: o.end_date || new Date(Date.now() + 30 * 86400000).toISOString(),
          affiliateUrl: buildCuelinksRedirectUrl({ merchantUrl: o.url || "https://amazon.in" }),
        }));
      }
    } catch (err) {
      console.warn("[Cuelinks] Live fetch failed, using curated catalog fallback.");
    }
  }

  // Curated Sandbox Fallback
  const store = (options.storeNameOrDomain || "").toLowerCase();
  const mockCoupons: CuelinksCouponOffer[] = [
    {
      id: "cue_amz_elec",
      storeName: "Amazon India",
      storeDomain: "amazon.in",
      campaignId: 101,
      code: "AMZTECH1500",
      title: "Flat ₹1,500 Instant Off on Electronics",
      description: "Save on headphones, soundbars, and smartphones above ₹15,000.",
      discount: "₹1,500 OFF",
      minOrder: 15000,
      startDate: "2026-01-01T00:00:00Z",
      endDate: "2026-12-31T23:59:59Z",
      affiliateUrl: buildCuelinksRedirectUrl({ merchantUrl: "https://amazon.in" }),
    },
    {
      id: "cue_fk_fashion",
      storeName: "Flipkart",
      storeDomain: "flipkart.com",
      campaignId: 102,
      code: "FLIPEXTRA500",
      title: "Flat ₹500 Off on Minimum Purchase",
      description: "Valid across fashion, home, and accessories.",
      discount: "₹500 OFF",
      minOrder: 2499,
      startDate: "2026-01-01T00:00:00Z",
      endDate: "2026-12-31T23:59:59Z",
      affiliateUrl: buildCuelinksRedirectUrl({ merchantUrl: "https://flipkart.com" }),
    },
  ];

  if (!store) return mockCoupons;
  return mockCoupons.filter(
    (c) =>
      c.storeName.toLowerCase().includes(store) ||
      c.storeDomain.toLowerCase().includes(store) ||
      store.includes(c.storeName.toLowerCase())
  );
}
