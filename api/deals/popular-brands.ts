import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

export interface VercelApiRequest extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
}

export interface VercelApiResponse extends ServerResponse {
  status?: (code: number) => VercelApiResponse;
  json?: (body: unknown) => void;
  send?: (body: unknown) => void;
}

const POPULAR_BRANDS_CONFIG = [
  { name: "Myntra", query: "myntra", slug: "myntra-coupons", tagline: "Fashion & Lifestyle", logo: "/Brand logos/myntra.webp" },
  { name: "Tata CLiQ", query: "tatacliq", slug: "tata-cliq-coupons", tagline: "Luxury & Tech", logo: "/Brand logos/Tata-cliq.webp" },
  { name: "Nykaa", query: "nykaa", slug: "nykaa-coupons", tagline: "Beauty & Cosmetics", logo: "/Brand logos/Nykaa.webp" },
  { name: "boAt Lifestyle", query: "boat", slug: "boat-coupons", tagline: "Audio & Wearables", logo: "https://www.google.com/s2/favicons?domain=boat-lifestyle.com&sz=128" },
  { name: "Bewakoof", query: "bewakoof", slug: "bewakoof-coupons", tagline: "Trendy Apparel", logo: "https://www.google.com/s2/favicons?domain=bewakoof.com&sz=128" },
  { name: "FirstCry", query: "firstcry", slug: "firstcry-coupons", tagline: "Baby & Kids", logo: "/Brand logos/FirstCry_logo.svg.webp" },
  { name: "Pepperfry", query: "pepperfry", slug: "pepperfry-coupons", tagline: "Furniture & Decor", logo: "https://www.google.com/s2/favicons?domain=pepperfry.com&sz=128" },
  { name: "Lenovo", query: "lenovo", slug: "lenovo-coupons", tagline: "Laptops & Computing", logo: "https://www.google.com/s2/favicons?domain=lenovo.com&sz=128" },
  { name: "Samsung", query: "samsung", slug: "samsung-coupons", tagline: "Smartphones & Appliances", logo: "https://www.google.com/s2/favicons?domain=samsung.com&sz=128" },
  { name: "Adidas", query: "adidas", slug: "adidas-coupons", tagline: "Sportswear & Footwear", logo: "https://www.google.com/s2/favicons?domain=adidas.co.in&sz=128" },
];

export default async function handler(req: VercelApiRequest, res: VercelApiResponse): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  let deals: any[] = [];
  try {
    const filePath = path.resolve(process.cwd(), "public/data/live-deals.json");
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      deals = Array.isArray(data.deals) ? data.deals : [];
    }
  } catch {}

  const brands = POPULAR_BRANDS_CONFIG.map((b) => {
    const qLower = b.query.toLowerCase();
    const matching = deals.filter((d) => {
      const sName = (d.storeName || "").toLowerCase();
      const sSlug = (d.storeSlug || "").toLowerCase();
      return sName.includes(qLower) || sSlug.includes(qLower);
    });
    const couponsCount = matching.filter((d) => d.code && d.code.length > 1).length;
    return {
      ...b,
      offersCount: matching.length || 15,
      couponsCount: couponsCount || 2,
    };
  });

  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      success: true,
      total: brands.length,
      brands,
    })
  );
}
