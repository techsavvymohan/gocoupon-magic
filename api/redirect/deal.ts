import type { IncomingMessage, ServerResponse } from "node:http";

export interface VercelApiRequest extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string>;
  body?: unknown;
}

export interface VercelApiResponse extends ServerResponse {
  status?: (code: number) => VercelApiResponse;
  json?: (body: unknown) => void;
  send?: (body: unknown) => void;
  redirect?: (statusOrUrl: string | number, url?: string) => void;
}

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

const KNOWN_MERCHANT_HOMEPAGES: Record<string, string> = {
  boat: "https://www.boat-lifestyle.com",
  "boat-lifestyle": "https://www.boat-lifestyle.com",
  boatlifestyle: "https://www.boat-lifestyle.com",
  hostinger: "https://www.hostinger.in",
  meesho: "https://www.meesho.com",
  croma: "https://www.croma.com",
  "tata-cliq": "https://www.tatacliq.com",
  tatacliq: "https://www.tatacliq.com",
  "1mg": "https://www.1mg.com",
  tata1mg: "https://www.1mg.com",
  "tata-1mg": "https://www.1mg.com",
  nykaa: "https://www.nykaa.com",
  myntra: "https://www.myntra.com",
  flipkart: "https://www.flipkart.com",
  amazon: "https://www.amazon.in",
  ajio: "https://www.ajio.com",
  swiggy: "https://www.swiggy.com",
  zomato: "https://www.zomato.com",
  dominos: "https://www.dominos.co.in",
  pizzahut: "https://www.pizzahut.co.in",
  mamaearth: "https://www.mamaearth.in",
  makemytrip: "https://www.makemytrip.com",
  goibibo: "https://www.goibibo.com",
  easemytrip: "https://www.easemytrip.com",
  booking: "https://www.booking.com",
  agoda: "https://www.agoda.com",
  dell: "https://www.dell.com",
  samsung: "https://www.samsung.com",
  lenovo: "https://www.lenovo.com",
  hp: "https://www.hp.com",
  puma: "https://in.puma.com",
  adidas: "https://www.adidas.co.in",
  nike: "https://www.nike.com/in",
  firstcry: "https://www.firstcry.com",
  pepperfry: "https://www.pepperfry.com",
  bewakoof: "https://www.bewakoof.com",
  netmeds: "https://www.netmeds.com",
  pharmeasy: "https://www.pharmeasy.in",
  mivi: "https://www.mivi.in",
  palmonas: "https://palmonas.com",
  gonoise: "https://www.gonoise.com",
  noise: "https://www.gonoise.com",
  jockey: "https://www.jockey.in",
  aliexpress: "https://www.aliexpress.com",
  udemy: "https://www.udemy.com",
  coursera: "https://www.coursera.org",
  namecheap: "https://www.namecheap.com",
  godaddy: "https://www.godaddy.com",
  kinguin: "https://www.kinguin.net",
  g2a: "https://www.g2a.com",
  dhgate: "https://www.dhgate.com",
  alibaba: "https://www.alibaba.com",
  ashford: "https://www.ashford.com",
  // EarnKaro stores
  "dot-and-key": "https://www.dotandkey.com",
  dotandkey: "https://www.dotandkey.com",
  mcaffeine: "https://www.mcaffeine.com",
  "m-caffeine": "https://www.mcaffeine.com",
  shopsy: "https://www.shopsy.in",
  themancompany: "https://www.themancompany.com",
  "the-man-company": "https://www.themancompany.com",
  plum: "https://plumgoodness.com",
  plumgoodness: "https://plumgoodness.com",
  "plum-goodness": "https://plumgoodness.com",
  // Admitad campaigns
  acer: "https://www.acer.com",
  asus: "https://www.asus.com",
  walmart: "https://www.walmart.com",
  raynatours: "https://www.raynatours.com",
  "rayna-tours": "https://www.raynatours.com",
  chicme: "https://www.chicme.com",
  wondershare: "https://www.wondershare.com",
  hellomolly: "https://www.hellomolly.com",
  "hello-molly": "https://www.hellomolly.com",
  // Popular brands & merchants
  lenskart: "https://www.lenskart.com",
  purplle: "https://www.purplle.com",
  sugar: "https://in.sugarcosmetics.com",
  beyoung: "https://www.beyoung.in",
  snitch: "https://www.snitch.co.in",
  xyxx: "https://xyxxcrew.com",
  marksandspencer: "https://www.marksandspencer.in",
  lifestyle: "https://www.lifestylestores.com",
  shoppersstop: "https://www.shoppersstop.com",
  titan: "https://www.titan.co.in",
  fastrack: "https://www.fastrack.in",
  casio: "https://www.casioindiashop.com",
  boult: "https://www.boultaudio.com",
  hammer: "https://hammeronline.in",
  portronics: "https://www.portronics.com",
  zepto: "https://www.zeptonow.com",
  blinkit: "https://www.blinkit.com",
  bigbasket: "https://www.bigbasket.com",
  reliancedigital: "https://www.reliancedigital.in",
  vijaysales: "https://www.vijaysales.com",
  wakefit: "https://www.wakefit.co",
  urbanladder: "https://www.urbanladder.com",
  semrush: "https://www.semrush.com",
  envato: "https://elements.envato.com",
  sephora: "https://sephora.nnnow.com",
  crocs: "https://www.crocs.in",
};

function extractMerchantDestination(rawUrl: string): string {
  if (!rawUrl || rawUrl === "#" || rawUrl.startsWith("javascript:")) return "https://gocoupon.io";
  let cleanUrl = rawUrl.trim();

  // If this is an internal redirect wrapper (/api/redirect/deal or /out), unwrap the target URL
  if (cleanUrl.startsWith("/api/redirect/deal") || cleanUrl.startsWith("/out") || cleanUrl.includes("/api/redirect/deal?")) {
    try {
      const parsed = new URL(cleanUrl, "https://gocoupon.io");
      const embeddedUrl = parsed.searchParams.get("url") || parsed.searchParams.get("target") || parsed.searchParams.get("dest");
      if (embeddedUrl && /^https?:\/\//i.test(embeddedUrl)) {
        cleanUrl = decodeURIComponent(embeddedUrl);
      }
    } catch {}
  }

  if (cleanUrl.includes("linksredirect.com") || cleanUrl.includes("clnk.in")) {
    try {
      const parsed = new URL(cleanUrl);
      const embeddedUrl = parsed.searchParams.get("url") || parsed.searchParams.get("target");
      if (embeddedUrl && /^https?:\/\//i.test(embeddedUrl)) {
        cleanUrl = decodeURIComponent(embeddedUrl);
      }
    } catch {
      // Ignore URL parsing failure and fall back to raw URL
    }
  }
  if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = `https://${cleanUrl}`;
  return cleanUrl;
}

function isHomepageUrl(url?: string | null): boolean {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    const p = parsed.pathname.trim().toLowerCase();
    return (
      p === "" ||
      p === "/" ||
      p === "/index.html" ||
      p === "/home" ||
      p === "/home/" ||
      p === "/in" ||
      p === "/in/"
    );
  } catch {
    return false;
  }
}

function extractSearchQuery(title?: string | null, storeName = ""): string {
  if (!title) return "";
  let clean = title.trim();
  if (storeName && storeName.length > 2) {
    const escaped = storeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    clean = clean.replace(new RegExp(`\\b${escaped}\\b`, "gi"), " ");
  }
  clean = clean.replace(
    /\b(tatacliq|tata\s*cliq|croma|nykaa|myntra|firstcry|pepperfry|bewakoof|flipkart|amazon|boat|meesho|coursera|makemytrip)\b/gi,
    " "
  );
  clean = clean.replace(
    /\b(flat|extra|save|upto|up\s+to|get|min|minimum|max|maximum)\s*(₹|rs\.?|inr|\$)?\s*\d+(\s*(%|percent|k|lac|lakh))?(\s*off)?\b/gi,
    " "
  );
  clean = clean.replace(/(\b|\d+)%\s*off\b/gi, " ");
  clean = clean.replace(/\b(₹|rs\.?|inr|\$)\s*\d+(\s*off)?\b/gi, " ");
  clean = clean.replace(/\b\d+%\b/gi, " ");
  clean = clean.replace(/\b\d+\s*(off|discount|cashback)\b/gi, " ");
  clean = clean.replace(
    /\b(above|orders?\s*above|min\s*order|purchase\s*above|worth)\s*(₹|rs\.?|inr|\$)?\s*\d+\b/gi,
    " "
  );
  clean = clean.replace(
    /\b(save|saving|savings|extra|upto|up\s*to|flat|get|enjoy|avail|buy|coupon|deal|deals|code|offers?|promo|voucher|exclusive|fest|festival|sale|today|verified|instant|discount|cashback|free\s*shipping|free\s*delivery)\b/gi,
    " "
  );
  clean = clean.replace(
    /\b(first\s*order|first\s*purchase|first\s*user|sitewide|storewide|selected\s*products?|all\s*orders?|with\s+neupass|with\s+card)\b/gi,
    " "
  );
  clean = clean.replace(/\b(on|at|with|for|and|or|in|to|from|by|your|across|eligible)\b/gi, " ");
  clean = clean.replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
  const tokens = clean.split(/\s+/).filter((w) => w.length >= 2);
  if (tokens.length === 0) return "";
  return tokens.slice(0, 4).join(" ");
}

function buildSmartDeepLink(merchantUrl: string, storeOrSlug = "", dealTitle = ""): string {
  if (!merchantUrl || !isHomepageUrl(merchantUrl)) return merchantUrl;
  const query = extractSearchQuery(dealTitle, storeOrSlug);
  if (!query || query.length < 3) return merchantUrl;
  const qNorm = encodeURIComponent(query);
  const sNorm = `${storeOrSlug} ${merchantUrl}`.toLowerCase();

  if (sNorm.includes("tatacliq")) return `https://www.tatacliq.com/search/?searchCategory=all&text=${qNorm}`;
  if (sNorm.includes("croma")) return `https://www.croma.com/searchB?q=${qNorm}`;
  if (sNorm.includes("nykaa")) return `https://www.nykaa.com/search/result/?q=${qNorm}`;
  if (sNorm.includes("firstcry")) return `https://www.firstcry.com/search?q=${qNorm}`;
  if (sNorm.includes("pepperfry")) return `https://www.pepperfry.com/site_product/search?q=${qNorm}`;
  if (sNorm.includes("boat")) return `https://www.boat-lifestyle.com/search?q=${qNorm}`;
  if (sNorm.includes("bewakoof")) return `https://www.bewakoof.com/search/${qNorm}`;
  if (sNorm.includes("1mg")) return `https://www.1mg.com/search/all?name=${qNorm}`;
  if (sNorm.includes("netmeds")) return `https://www.netmeds.com/catalogsearch/result?q=${qNorm}`;
  if (sNorm.includes("lenovo")) return `https://www.lenovo.com/in/en/search?fq=&text=${qNorm}`;
  if (sNorm.includes("meesho")) return `https://www.meesho.com/search?q=${qNorm}`;
  if (sNorm.includes("coursera")) return `https://www.coursera.org/search?query=${qNorm}`;
  if (sNorm.includes("myntra")) return `https://www.myntra.com/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, "-"))}`;
  if (sNorm.includes("flipkart")) return `https://www.flipkart.com/search?q=${qNorm}`;
  if (sNorm.includes("ajio")) return `https://www.ajio.com/search/?text=${qNorm}`;
  if (sNorm.includes("amazon.in")) return `https://www.amazon.in/s?k=${qNorm}`;

  return merchantUrl;
}

export default async function handler(req: VercelApiRequest, res: VercelApiResponse): Promise<void> {
  const query = req.query || (req.url ? Object.fromEntries(new URL(req.url, "http://localhost").searchParams.entries()) : {});
  let rawUrl = String(query.url || query.target || query.link || query.to || query.dest || "").trim();
  const dealId = String(query.dealId || query.id || "unknown").trim();
  let title = String(query.title || "GoCoupon Deal").trim();
  let store = String(query.store || query.storeName || "Partner Store").trim();
  let slug = String(query.slug || query.storeSlug || "").trim();
  let code = String(query.code || "").trim();
  const source = String(query.source || "offers").trim();

  // If rawUrl is missing, attempt to resolve directly from dealId in live pool
  if ((!rawUrl || rawUrl === "#" || rawUrl === "about:blank" || /^(javascript|data|vbscript|file):/i.test(rawUrl)) && dealId && dealId !== "unknown") {
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const dealsPath = path.resolve(process.cwd(), "src/data/live-deals.json");
      if (fs.existsSync(dealsPath)) {
        const payload = JSON.parse(fs.readFileSync(dealsPath, "utf-8"));
        const deals = Array.isArray(payload) ? payload : payload.deals || [];
        const matched = deals.find((d: any) => String(d.id) === String(dealId));
        if (matched) {
          rawUrl = (matched.link || matched.affiliateUrl || matched.targetUrl || matched.url || "").trim();
          if (!store || store === "Partner Store") store = matched.storeName || store;
          if (!slug) slug = matched.storeSlug || slug;
          if (!code) code = matched.code || code;
          if (!title || title === "GoCoupon Deal") title = matched.title || title;
        }
      }
    } catch {}
  }

  if (!rawUrl || rawUrl === "#" || rawUrl === "about:blank" || /^(javascript|data|vbscript|file):/i.test(rawUrl)) {
    const storeQuery = `${slug} ${store}`.toLowerCase().trim();
    let resolvedFallback: string | null = null;
    for (const [key, homeUrl] of Object.entries(KNOWN_MERCHANT_HOMEPAGES)) {
      if (storeQuery.includes(key)) {
        resolvedFallback = homeUrl;
        break;
      }
    }

    if (resolvedFallback) {
      rawUrl = resolvedFallback;
    } else {
      const candidateName = (slug || store)
        .toLowerCase()
        .replace(/^www\./, "")
        .replace(/-(coupons?|offers?|deals?|store|shop|online)$/i, "")
        .replace(/[^a-z0-9]/g, "")
        .trim();

      if (candidateName && candidateName !== "unknown" && candidateName !== "partnerstore" && candidateName.length >= 2) {
        rawUrl = `https://www.${candidateName}.com`;
      } else {
        res.writeHead(302, { Location: "/offers" });
        res.end();
        return;
      }
    }
  }

  const cleanMerchant = extractMerchantDestination(rawUrl);
  const normTarget = `${slug} ${store} ${cleanMerchant} ${rawUrl}`.toLowerCase();
  const smartMerchant = isHomepageUrl(cleanMerchant) && title
    ? extractMerchantDestination(buildSmartDeepLink(cleanMerchant, slug || store, title))
    : cleanMerchant;
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
    const dest = smartMerchant || cleanMerchant;
    const ulpParam = dest && !base.includes("ulp=") ? `&ulp=${encodeURIComponent(dest)}` : "";
    targetUrl = `${base}${sep}subid=${encodeURIComponent(clickId)}&subid1=${encodeURIComponent(subid1)}&subid2=${encodeURIComponent(subid2)}&subid3=${encodeURIComponent(subid3)}${ulpParam}`;
  } else if (isCj) {
    const sep = rawUrl.includes("?") ? "&" : "?";
    targetUrl = `${rawUrl}${sep}sid=${encodeURIComponent(clickId)}`;
  } else if (rawUrl.includes("amazon.in") || cleanMerchant.includes("amazon.in")) {
    const dest = smartMerchant.includes("amazon.in") ? smartMerchant : rawUrl;
    try {
      const u = new URL(dest);
      u.searchParams.set("tag", AMAZON_IN_TAG);
      u.searchParams.set("ascsubtag", clickId);
      targetUrl = u.toString();
    } catch {
      const sep = dest.includes("?") ? "&" : "?";
      targetUrl = `${dest}${sep}tag=${AMAZON_IN_TAG}&ascsubtag=${encodeURIComponent(clickId)}`;
    }
  } else if (rawUrl.includes("amazon.com") || cleanMerchant.includes("amazon.com")) {
    const dest = smartMerchant.includes("amazon.com") ? smartMerchant : rawUrl;
    try {
      const u = new URL(dest);
      u.searchParams.set("tag", AMAZON_US_TAG);
      u.searchParams.set("ascsubtag", clickId);
      targetUrl = u.toString();
    } catch {
      const sep = dest.includes("?") ? "&" : "?";
      targetUrl = `${dest}${sep}tag=${AMAZON_US_TAG}&ascsubtag=${encodeURIComponent(clickId)}`;
    }
  } else if (isCuelinks || /^https?:\/\//i.test(targetUrl)) {
    // Universal Cuelinks wrapping: ALWAYS redirect to linksredirect.com with destination
    const destination = smartMerchant || cleanMerchant;
    const encoded = encodeURIComponent(destination);
    targetUrl = `https://linksredirect.com/?pub_id=${CUELINKS_PUB_ID}&cid=${CUELINKS_CHANNEL_ID}&subid=${encodeURIComponent(subid1)}&subid2=${encodeURIComponent(subid2)}&subid3=${encodeURIComponent(subid3)}&subid4=${encodeURIComponent(clickId)}&url=${encoded}`;
  }

  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = "https://gocoupon.io";
  }

  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  res.writeHead(302, { Location: targetUrl });
  res.end();
}

