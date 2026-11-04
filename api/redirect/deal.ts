import type { IncomingMessage, ServerResponse } from "node:http";

const CUELINKS_PUB_ID = process.env.CUELINKS_PUBLISHER_ID || process.env.VITE_CUELINKS_PUB_ID || "272970";
const CUELINKS_CHANNEL_ID = process.env.CUELINKS_CHANNEL_ID || process.env.VITE_CUELINKS_CHANNEL_ID || "318931";
const AMAZON_IN_TAG = process.env.VITE_AMAZON_IN_PARTNER_TAG || "gocoupon0e-21";
const AMAZON_US_TAG = process.env.VITE_AMAZON_US_PARTNER_TAG || "gocouponus-20";

const EARNKARO_DIRECT_LINKS: Record<string, string> = {
  flipkart: "https://fktr.in/xL95eGk",
  ajio: "https://ajiio.in/5gIGQ46",
  "dot-and-key": "https://bitli.in/Q8p6Tb5",
  dotandkey: "https://bitli.in/Q8p6Tb5",
  mcaffeine: "https://bitli.in/30c3jZD",
  shopsy: "https://bitli.in/X8hNAWk",
  themancompany: "https://bitli.in/Aiq8ef4",
  "the-man-company": "https://bitli.in/Aiq8ef4",
};

const ADMITAD_DIRECT_CAMPAIGNS: Record<string, string> = {
  palmonas: "https://tjzuh.com/g/cozq2t2pxu9fa8ccb53848f53de592/",
  bewakoof: "https://tjzuh.com/g/el5arbwari9fa8ccb5388f3bde6dea/",
  mivi: "https://tjzuh.com/g/grfndh30zw9fa8ccb538a184524636/",
  acer: "https://tjzuh.com/g/67hxm0ezhv9fa8ccb538759e60847d/",
  asus: "https://tjzuh.com/g/9d2vnaf4jq9fa8ccb53803be1d2ce2/",
  aliexpress: "https://rzekl.com/g/1e8d1144949fa8ccb53816525dc3e8/",
  alibaba: "https://rzekl.com/g/pm1aev55cl9fa8ccb538219aa26f6f/",
  walmart: "https://bednari.com/g/4jg2ecwjgp9fa8ccb538bef27d4341/",
  raynatours: "https://xpuvo.com/g/ofc53p8nis9fa8ccb538e94db72a90/",
  chicme: "https://rzekl.com/g/gf807z8tar9fa8ccb538312b8f391a/",
  wondershare: "https://kjuzv.com/g/8u3trxihmw9fa8ccb538ef655e4ac9/",
  "hello-molly": "https://ntzgd.com/g/v4mbsetakj9fa8ccb5385fd6c9cc83/",
  hellomolly: "https://ntzgd.com/g/v4mbsetakj9fa8ccb5385fd6c9cc83/",
};

function extractMerchantDestination(rawUrl: string): string {
  if (!rawUrl || rawUrl === "#" || rawUrl.startsWith("javascript:")) return "https://gocoupon.io";
  let cleanUrl = rawUrl.trim();
  if (cleanUrl.includes("linksredirect.com") || cleanUrl.includes("clnk.in")) {
    try {
      const parsed = new URL(cleanUrl);
      const embeddedUrl = parsed.searchParams.get("url") || parsed.searchParams.get("target");
      if (embeddedUrl && /^https?:\/\//i.test(embeddedUrl)) {
        cleanUrl = decodeURIComponent(embeddedUrl);
      }
    } catch {}
  }
  if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = `https://${cleanUrl}`;
  return cleanUrl;
}

export default async function handler(req: any, res: any) {
  const query = req.query || {};
  let rawUrl = String(query.url || query.target || query.link || query.to || query.dest || "").trim();
  const dealId = String(query.dealId || query.id || "unknown").trim();
  const title = String(query.title || "GoCoupon Deal").trim();
  const store = String(query.store || query.storeName || "Partner Store").trim();
  const slug = String(query.slug || query.storeSlug || "").trim();
  const code = String(query.code || "").trim();
  const source = String(query.source || "offers").trim();

  if (!rawUrl || rawUrl === "#" || rawUrl === "about:blank" || rawUrl.startsWith("javascript:")) {
    if (slug && /^[a-z0-9-]+$/i.test(slug)) {
      rawUrl = `https://www.${slug.replace(/^www\./, "")}.com`;
    } else {
      res.writeHead(302, { Location: "/offers" });
      return res.end();
    }
  }

  const cleanMerchant = extractMerchantDestination(rawUrl);
  const normTarget = `${slug} ${store} ${cleanMerchant} ${rawUrl}`.toLowerCase();
  const clickId = `clk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const subid1 = source || "gocoupon_web";
  const subid2 = slug || store.toLowerCase().replace(/\s+/g, "-");
  const subid3 = dealId && dealId !== "unknown" ? dealId : (code || "deal");
  const subid4 = clickId;
  const subid5 = "web";

  let targetUrl = rawUrl;

  let matchedEarnKaro: string | null = null;
  if (normTarget.includes("flipkart") || normTarget.includes("fktr.in")) matchedEarnKaro = EARNKARO_DIRECT_LINKS.flipkart;
  else if (normTarget.includes("ajio") || normTarget.includes("ajiio.in")) matchedEarnKaro = EARNKARO_DIRECT_LINKS.ajio;
  else if (normTarget.includes("dot") && normTarget.includes("key")) matchedEarnKaro = EARNKARO_DIRECT_LINKS["dot-and-key"];
  else if (normTarget.includes("mcaffeine") || normTarget.includes("caffeine")) matchedEarnKaro = EARNKARO_DIRECT_LINKS.mcaffeine;
  else if (normTarget.includes("shopsy")) matchedEarnKaro = EARNKARO_DIRECT_LINKS.shopsy;
  else if (normTarget.includes("themancompany") || (normTarget.includes("man") && normTarget.includes("company"))) {
    matchedEarnKaro = EARNKARO_DIRECT_LINKS.themancompany;
  }

  let matchedAdmitad: string | null = null;
  for (const [key, gotolink] of Object.entries(ADMITAD_DIRECT_CAMPAIGNS)) {
    if (normTarget.includes(key)) {
      matchedAdmitad = gotolink;
      break;
    }
  }

  const isAdmitad =
    rawUrl.includes("admitad.com") ||
    rawUrl.includes("alitems.com") ||
    rawUrl.includes("rzekl.com") ||
    rawUrl.includes("tjzuh.com") ||
    rawUrl.includes("bednari.com") ||
    rawUrl.includes("kjuzv.com") ||
    rawUrl.includes("hxbok.com") ||
    rawUrl.includes("ntzgd.com") ||
    rawUrl.includes("ali.click");

  const isCj =
    rawUrl.includes("tkqlhce.com") ||
    rawUrl.includes("anrdoezrs.net") ||
    rawUrl.includes("dpbolvw.net") ||
    rawUrl.includes("jdoqocy.com") ||
    rawUrl.includes("kqzyfj.com") ||
    rawUrl.includes("cj.com");

  const isCuelinks =
    rawUrl.includes("linksredirect.com") ||
    rawUrl.includes("clnk.in") ||
    rawUrl.includes("cuelinks");

  if (matchedEarnKaro) {
    targetUrl = matchedEarnKaro;
  } else if (isAdmitad || matchedAdmitad) {
    const base = isAdmitad ? rawUrl : matchedAdmitad!;
    const sep = base.includes("?") ? "&" : "?";
    targetUrl = `${base}${sep}subid=${encodeURIComponent(clickId)}&subid1=${encodeURIComponent(subid1)}&subid2=${encodeURIComponent(subid2)}&subid3=${encodeURIComponent(subid3)}`;
  } else if (isCj) {
    const sep = rawUrl.includes("?") ? "&" : "?";
    targetUrl = `${rawUrl}${sep}sid=${encodeURIComponent(clickId)}`;
  } else if (rawUrl.includes("amazon.in") || cleanMerchant.includes("amazon.in")) {
    const sep = rawUrl.includes("?") ? "&" : "?";
    targetUrl = `${rawUrl}${sep}tag=${AMAZON_IN_TAG}&ascsubtag=${encodeURIComponent(clickId)}`;
  } else if (rawUrl.includes("amazon.com") || cleanMerchant.includes("amazon.com")) {
    const sep = rawUrl.includes("?") ? "&" : "?";
    targetUrl = `${rawUrl}${sep}tag=${AMAZON_US_TAG}&ascsubtag=${encodeURIComponent(clickId)}`;
  } else if (isCuelinks) {
    try {
      const u = new URL(rawUrl);
      if (!u.searchParams.has("pub_id") && !u.searchParams.has("pub")) {
        u.searchParams.set("pub_id", CUELINKS_PUB_ID);
      }
      if (!u.searchParams.has("cid")) {
        u.searchParams.set("cid", CUELINKS_CHANNEL_ID);
      }
      if (!u.searchParams.has("subid") && subid1) u.searchParams.set("subid", subid1);
      if (!u.searchParams.has("subid2") && subid2) u.searchParams.set("subid2", subid2);
      if (!u.searchParams.has("subid3") && subid3) u.searchParams.set("subid3", subid3);
      u.searchParams.set("subid4", clickId);
      targetUrl = u.toString();
    } catch {
      targetUrl = rawUrl;
    }
  } else if (/^https?:\/\//i.test(targetUrl)) {
    const encoded = encodeURIComponent(targetUrl);
    targetUrl = `https://linksredirect.com/?pub_id=${CUELINKS_PUB_ID}&cid=${CUELINKS_CHANNEL_ID}&subid=${encodeURIComponent(subid1)}&subid2=${encodeURIComponent(subid2)}&subid3=${encodeURIComponent(subid3)}&subid4=${encodeURIComponent(clickId)}&url=${encoded}`;
  }

  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.writeHead(302, { Location: targetUrl });
  res.end();
}

