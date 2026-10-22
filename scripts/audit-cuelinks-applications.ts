import { getCuelinksConfig } from "../server/services/providers/cuelinks-client.js";

interface AuditResult {
  merchant: string;
  campaignId: number;
  campaignName: string;
  domain: string;
  payout: string;
  type: string;
  status: "open" | "approved" | "pending" | "not_applied" | "rejected" | "blocked" | "not_found";
  deepLinkAllowed: boolean;
  category: string;
  applyUrl: string;
}

async function fetchCampaign(keyword: string): Promise<any | null> {
  const config = getCuelinksConfig();
  const url = `https://developers.cuelinks.com/pub_api/v3/campaigns?q=${encodeURIComponent(keyword)}&per_page=10`;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Token ${config.apiKey}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const campaigns = json.data || [];
    if (campaigns.length === 0) return null;

    // Prioritize best match by domain or exact name
    const match = campaigns.find((c: any) => 
      c.name.toLowerCase().trim() === keyword.toLowerCase().trim() ||
      c.domain.toLowerCase().includes(keyword.toLowerCase().replace(/[^a-z0-9]/g, ""))
    ) || campaigns[0];

    return match;
  } catch {
    return null;
  }
}

async function runAudit() {
  console.log("=========================================================================");
  console.log(" 🔍 Cuelinks Campaign Approval Status Audit for GoCoupon (Pub ID: 272970)");
  console.log("=========================================================================\n");

  const candidates = [
    { name: "Flipkart", cat: "General / Electronics", search: "Flipkart" },
    { name: "Myntra", cat: "Fashion & Lifestyle", search: "Myntra" },
    { name: "Ajio", cat: "Fashion & Lifestyle", search: "Ajio" },
    { name: "Croma", cat: "Electronics & Appliances", search: "Croma" },
    { name: "Tata CLiQ", cat: "General / Electronics", search: "Tata Cliq" },
    { name: "Nykaa", cat: "Beauty & Cosmetics", search: "Nykaa" },
    { name: "boAt Lifestyle", cat: "Audio & Wearables", search: "boAt" },
    { name: "Bewakoof", cat: "Fashion & Apparel", search: "Bewakoof" },
    { name: "Levi's India", cat: "Fashion & Denim", search: "Levi" },
    { name: "Marks & Spencer", cat: "Fashion & Luxury", search: "Marks & Spencer" },
    { name: "H&M India", cat: "Fashion & Apparel", search: "H&M" },
    { name: "FirstCry", cat: "Baby & Kids", search: "Firstcry" },
    { name: "Netmeds", cat: "Pharmacy & Health", search: "Netmeds" },
    { name: "Tata 1mg", cat: "Pharmacy & Healthcare", search: "1mg" },
    { name: "PharmEasy", cat: "Pharmacy & Healthcare", search: "Pharmeasy" },
    { name: "Pepperfry", cat: "Furniture & Home", search: "Pepperfry" },
    { name: "Urban Ladder", cat: "Furniture & Decor", search: "Urban Ladder" },
    { name: "MakeMyTrip", cat: "Travel & Hotels", search: "MakeMyTrip" },
    { name: "Cleartrip", cat: "Travel & Flights", search: "Cleartrip" },
    { name: "Agoda", cat: "Travel & Accommodations", search: "Agoda" },
    { name: "Booking.com", cat: "Travel & Accommodations", search: "Booking.com" },
    { name: "Klook", cat: "Tours & Attractions", search: "Klook" },
    { name: "Lenovo India", cat: "Laptops & Computing", search: "Lenovo India" },
    { name: "Dell India", cat: "Laptops & Computing", search: "Dell" },
    { name: "Samsung India", cat: "Mobiles & Tech", search: "Samsung India" },
    { name: "OnePlus India", cat: "Smartphones & Audio", search: "OnePlus" },
    { name: "Xiaomi India", cat: "Smartphones & Smart Devices", search: "Xiaomi" },
    { name: "Hostinger", cat: "Web Hosting & Domains", search: "Hostinger" },
    { name: "GoDaddy", cat: "Domains & Hosting", search: "GoDaddy" },
    { name: "Coursera", cat: "EdTech & Courses", search: "Coursera" },
    { name: "Udemy", cat: "EdTech & Courses", search: "Udemy" },
    { name: "Domino's Pizza", cat: "Food & Dining", search: "Dominos" },
    { name: "Swiggy", cat: "Food Delivery & Cards", search: "Swiggy" },
    { name: "Zomato", cat: "Food Delivery", search: "Zomato" },
    { name: "Puma India", cat: "Sportswear & Shoes", search: "Puma India" },
    { name: "Adidas India", cat: "Sportswear & Shoes", search: "Adidas" },
    { name: "Shoppers Stop", cat: "Department Store", search: "Shoppers Stop" },
    { name: "Mamaearth", cat: "Beauty & Personal Care", search: "Mamaearth" },
    { name: "The Derma Co", cat: "Skincare", search: "Derma Co" },
  ];

  const results: AuditResult[] = [];

  for (const c of candidates) {
    const raw = await fetchCampaign(c.search);
    if (raw) {
      results.push({
        merchant: c.name,
        campaignId: raw.id,
        campaignName: raw.name,
        domain: raw.domain,
        payout: `${raw.payout_currency === "INR" ? "₹" : raw.payout_currency || ""} ${raw.payout}`.trim(),
        type: raw.payout_type || "CPS",
        status: raw.access_status || "not_applied",
        deepLinkAllowed: Boolean(raw.deeplink_allowed ?? true),
        category: c.cat,
        applyUrl: `https://www.cuelinks.com/campaigns/${raw.id}`,
      });
    } else {
      results.push({
        merchant: c.name,
        campaignId: 0,
        campaignName: "Not Found",
        domain: "-",
        payout: "-",
        type: "-",
        status: "not_found",
        deepLinkAllowed: false,
        category: c.cat,
        applyUrl: "https://www.cuelinks.com/campaigns",
      });
    }
  }

  const needsApplication = results.filter((r) => r.status === "not_applied");
  const alreadyOpen = results.filter((r) => r.status === "open" || r.status === "approved");
  const pending = results.filter((r) => r.status === "pending");

  console.log(`\n🔴 ACTION REQUIRED: Stores that MUST BE APPLIED via Dashboard (${needsApplication.length} stores):\n`);
  console.table(
    needsApplication.map((s) => ({
      Merchant: s.merchant,
      "Campaign ID": s.campaignId,
      "Campaign Name": s.campaignName,
      Payout: s.payout,
      Type: s.type,
      "Cuelinks URL": s.applyUrl,
    }))
  );

  console.log(`\n🟢 INSTANT ACTIVE: Stores ALREADY APPROVED / OPEN (${alreadyOpen.length} stores):\n`);
  console.table(
    alreadyOpen.map((s) => ({
      Merchant: s.merchant,
      "Campaign ID": s.campaignId,
      "Campaign Name": s.campaignName,
      Payout: s.payout,
      Type: s.type,
    }))
  );

  if (pending.length > 0) {
    console.log(`\n🟡 PENDING APPROVAL: Stores currently under review (${pending.length} stores):\n`);
    console.table(pending);
  }
}

runAudit().catch(console.error);
