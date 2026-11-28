import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

export interface VercelApiRequest extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string>;
  body?: Record<string, unknown>;
}

export interface VercelApiResponse extends ServerResponse {
  status?: (code: number) => VercelApiResponse;
  json?: (body: unknown) => void;
  send?: (body: unknown) => void;
}

let _storesCache: any[] | null = null;

function loadStores(): any[] {
  if (_storesCache) return _storesCache;
  try {
    const filePath = path.resolve(process.cwd(), "src/data/unified-stores.json");
    if (fs.existsSync(filePath)) {
      _storesCache = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return _storesCache!;
    }
  } catch (err) {
    console.warn("[Stores Serverless] Failed to load unified-stores.json:", err);
  }
  return [];
}

export default async function handler(req: VercelApiRequest, res: VercelApiResponse): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const query = req.query || (req.url ? Object.fromEntries(new URL(req.url, "http://localhost").searchParams.entries()) : {});
  const category = String(query.category || "").toLowerCase().trim();
  const q = String(query.q || "").toLowerCase().trim();
  const sortBy = String(query.sortBy || "popularity").toLowerCase().trim();
  const order = String(query.order || "desc").toLowerCase().trim();
  const rawLimit = parseInt(String(query.limit || "200"), 10);
  const limit = isNaN(rawLimit) ? 200 : Math.min(Math.max(1, rawLimit), 500);
  const rawOffset = parseInt(String(query.offset || "0"), 10);
  const offset = isNaN(rawOffset) ? 0 : Math.max(0, rawOffset);

  let stores = [...loadStores()];

  if (category && category !== "all") {
    stores = stores.filter((s) => {
      const c = String(s.category || "").toLowerCase();
      return c === category || c.includes(category) || category.includes(c);
    });
  }

  if (q) {
    stores = stores.filter((s) => {
      const name = String(s.name || "").toLowerCase();
      const slug = String(s.slug || "").toLowerCase();
      const desc = String(s.description || "").toLowerCase();
      const code = String(s.popularCoupon?.code || "").toLowerCase();
      return name.includes(q) || slug.includes(q) || desc.includes(q) || code.includes(q);
    });
  }

  stores.sort((a, b) => {
    let comp = 0;
    if (sortBy === "name") {
      comp = String(a.name || "").localeCompare(String(b.name || ""));
    } else if (sortBy === "rating") {
      comp = (Number(a.rating) || 0) - (Number(b.rating) || 0);
    } else if (sortBy === "couponscount") {
      comp = (Number(a.couponsCount) || 0) - (Number(b.couponsCount) || 0);
    } else {
      // popularity
      comp = (Number(a.couponsCount) || 0) + (Number(a.rating) || 0) * 10 - ((Number(b.couponsCount) || 0) + (Number(b.rating) || 0) * 10);
    }
    return order === "asc" ? comp : -comp;
  });

  const total = stores.length;
  const paginated = stores.slice(offset, offset + limit);

  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      stores: paginated,
      total,
      count: paginated.length,
      page: Math.floor(offset / limit) + 1,
      hasMore: offset + limit < total,
      cached: false,
      meta: {
        category: category || "all",
        q: q || null,
        limit,
        offset,
      },
    })
  );
}
