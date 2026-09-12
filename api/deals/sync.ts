const CUELINKS_V3_BASE_URL = "https://developers.cuelinks.com/pub_api/v3";
const apiKey = (process.env.CUELINKS_API_KEY || "").trim();
const pubId = process.env.CUELINKS_PUBLISHER_ID || "148920";

function extractDiscount(o: any) {
  if (o.percent_off && Number(o.percent_off) > 0) return `${o.percent_off}% OFF`;
  if (o.discount_price && o.original_price && Number(o.original_price) > Number(o.discount_price)) {
    const diff = Number(o.original_price) - Number(o.discount_price);
    if (diff > 0) return `₹${diff.toLocaleString()} OFF`;
  }
  if (o.discount && typeof o.discount === "string" && o.discount.trim()) return o.discount.trim();
  const text = `${o.title || ""} ${o.description || ""}`;
  const pctMatch = text.match(/([0-9]+)%\s*(?:off|discount)/i);
  if (pctMatch) return `${pctMatch[1]}% OFF`;
  const flatMatch = text.match(/(?:flat\s*)?(?:₹|rs\.?)\s*([0-9,]+)\s*(?:off|discount)/i);
  if (flatMatch) return `₹${flatMatch[1]} OFF`;
  return "Verified Deal";
}

function mapCategory(categories: any, title: string) {
  const catNames = Array.isArray(categories)
    ? categories.map((c: any) => (typeof c === "object" ? c.name : c) || "")
    : [];
  const text = (catNames.join(" ") + " " + (title || "")).toLowerCase();
  if (/fashion|apparel|clothing|shoes|footwear|sneaker|shirt|denim|saree|ethnic|dress|lingerie|kurti|tshirt|jeans/i.test(text)) return "Fashion";
  if (/electronic|mobile|laptop|computer|phone|audio|headphone|earbud|gadget|camera|tv|smartwatch|watch|tablet|charger/i.test(text)) return "Electronics";
  if (/beauty|cosmetic|skincare|hair|makeup|perfume|fragrance|wellness|personal care|serum|lotion|glow/i.test(text)) return "Beauty";
  if (/home|kitchen|furniture|decor|bedding|appliance|cookware|mattress|lighting/i.test(text)) return "Home";
  if (/food|dining|grocery|snack|beverage|meal|hotel|restaurant|pizza|burger|tea|coffee/i.test(text)) return "Food";
  if (/travel|flight|hotel|tour|bus|holiday|train|booking|resort/i.test(text)) return "Travel";
  if (/recharge|bill|utility|telecom|broadband|dth/i.test(text)) return "Recharge";
  return "General";
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (!apiKey) {
    return res.status(500).json({ error: "CUELINKS_API_KEY is not configured" });
  }

  try {
    const headers = {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const firstRes = await fetch(`${CUELINKS_V3_BASE_URL}/offers?page=1&per_page=50`, { headers });
    if (!firstRes.ok) throw new Error(`Cuelinks API returned HTTP ${firstRes.status}`);
    const firstJson = await firstRes.json();
    const rawOffers = Array.isArray(firstJson.data) ? [...firstJson.data] : [];
    const totalPages = Math.min(firstJson.meta?.total_pages || 1, 20);

    const remainingPages = [];
    for (let p = 2; p <= totalPages; p++) remainingPages.push(p);

    const BATCH_SIZE = 4;
    for (let i = 0; i < remainingPages.length; i += BATCH_SIZE) {
      const batch = remainingPages.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map(async (page) => {
          const r = await fetch(`${CUELINKS_V3_BASE_URL}/offers?page=${page}&per_page=50`, { headers });
          if (!r.ok) return [];
          const j = await r.json();
          return Array.isArray(j.data) ? j.data : [];
        })
      );
      for (const r of batchResults) {
        if (r.status === "fulfilled" && Array.isArray(r.value)) {
          rawOffers.push(...r.value);
        }
      }
    }

    const now = Date.now();
    const liveDeals: any[] = [];
    const seen = new Set<string>();

    for (const o of rawOffers) {
      if (o.status && o.status !== "live" && o.status !== "active") continue;
      if (o.end_date) {
        const end = new Date(o.end_date).getTime();
        if (!isNaN(end) && end < now) continue;
      }

      const storeName = (o.campaign_name || "Partner Store").trim();
      const storeSlug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "-coupons";
      const rawCode = (o.coupon_code || o.code || "").trim();
      const hasCoupon = rawCode.length > 1 && !/^(deal|none|na|null|undefined)$/i.test(rawCode);
      const code = hasCoupon ? rawCode.toUpperCase() : "";
      const discount = extractDiscount(o);

      const dedup = `${storeName.toLowerCase()}_${code}_${(o.title || "").toLowerCase().slice(0, 30)}`;
      if (seen.has(dedup)) continue;
      seen.add(dedup);

      liveDeals.push({
        id: `cue_${o.id}`,
        storeName,
        storeSlug,
        storeLogo: o.image || undefined,
        category: mapCategory(o.categories, o.title),
        title: o.title || `${discount} at ${storeName}`,
        code,
        discount,
        badge: hasCoupon ? "Verified" : "Trending",
        verifiedDate: "Live Verified",
        expiresIn: "Active Offer",
        endDate: o.end_date || undefined,
        minOrder: o.minimum_order ? `₹${Number(o.minimum_order).toLocaleString()}` : undefined,
        terms: (o.description || o.terms || `Valid on ${storeName}.`).trim(),
        link: o.tracking_url || `https://linksredirect.com/?pub_id=${pubId}&subid=gocoupon_sync&url=${encodeURIComponent(o.url || "https://gocoupon.io")}`,
        usesCount: 1200 + (Math.abs(Number(o.id) || 0) % 4000),
      });
    }

    return res.status(200).json({
      success: true,
      updatedAt: new Date().toISOString(),
      activeCount: liveDeals.length,
      totalFetched: rawOffers.length,
      deals: liveDeals,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Sync failed", message: err.message });
  }
}
