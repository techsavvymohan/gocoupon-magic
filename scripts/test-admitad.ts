/**
 * @file scripts/test-admitad.ts
 * @description Diagnostic script to test Admitad API OAuth2 authentication and live connectivity.
 */

async function testAdmitad() {
  console.log("\n=======================================================");
  console.log(" 🌐 GoCoupon — Admitad / Mitgo Global API Diagnostic");
  console.log("=======================================================\n");

  const clientId = process.env.ADMITAD_CLIENT_ID || "WTuJJKIiFNj2ZnibEj23HScasY0fTk";
  const base64Header = process.env.ADMITAD_BASE64_HEADER || "V1R1SkpLSWlGTmoyWm5pYkVqMjNIU2Nhc1kwZlRrOnllZUl5ZDlKTGIxZHlwbERrMnlJYmZqSmh5M0ViaQ==";

  console.log(`📌 Client ID:     ${clientId}`);
  console.log(`🔑 Base64 Header: ${base64Header.slice(0, 10)}...${base64Header.slice(-10)}\n`);

  console.log("--- 1. Requesting OAuth2 Access Token (POST https://api.admitad.com/token/) ---");

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", clientId);
    params.append("scope", "coupons advcampaigns banners deeplink_generator");

    const tokenRes = await fetch("https://api.admitad.com/token/", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${base64Header}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: params.toString(),
    });

    const tokenData = await tokenRes.json();
    console.log(`HTTP Status:  ${tokenRes.status} ${tokenRes.statusText}`);

    if (!tokenRes.ok) {
      console.log("⚠️ OAuth2 Response Error:", tokenData);
      return;
    }

    console.log("✅ SUCCESS: Received Admitad OAuth2 Access Token!");
    console.log(`Access Token: ${tokenData.access_token ? `${tokenData.access_token.slice(0, 6)}...${tokenData.access_token.slice(-6)}` : "None"}`);
    console.log(`Token Type:   ${tokenData.token_type}`);
    console.log(`Expires In:   ${tokenData.expires_in}s (${(tokenData.expires_in / 3600).toFixed(1)} hours)`);
    console.log(`Scopes:       ${tokenData.scope || "N/A"}`);

    // Test 2: Fetching Coupons/Offers with this token
    if (tokenData.access_token) {
      console.log("\n--- 2. Testing Live Coupons & Promo Codes Feed (/coupons/) ---");
      const couponsRes = await fetch("https://api.admitad.com/coupons/?limit=5", {
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
          "Accept": "application/json",
        },
      });

      console.log(`Coupons HTTP Status: ${couponsRes.status} ${couponsRes.statusText}`);
      if (couponsRes.ok) {
        const couponsData = await couponsRes.json();
        console.log(`✅ Retrieved ${couponsData.results?.length || 0} coupons from Admitad (Total available: ${couponsData._meta?.count || 0})`);
      }

      console.log("\n--- 3. Testing Global Merchant Campaigns (/advcampaigns/) ---");
      const campaignsRes = await fetch("https://api.admitad.com/advcampaigns/?limit=5", {
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
          "Accept": "application/json",
        },
      });
      console.log(`Campaigns HTTP Status: ${campaignsRes.status} ${campaignsRes.statusText}`);
      if (campaignsRes.ok) {
        const campData = await campaignsRes.json();
        console.log(`✅ Retrieved ${campData.results?.length || 0} global campaigns (Total in Admitad: ${campData._meta?.count || 0})`);
        if (campData.results && campData.results.length > 0) {
          campData.results.forEach((c: any, i: number) => {
            console.log(`  [#${i + 1}] ID: ${c.id} | ${c.name} | Site: ${c.site_url} | Rating: ${c.rating || "N/A"}`);
          });
        }
      }
    }

  } catch (err: any) {
    console.error("❌ Connection failed:", err.message);
  }
}

testAdmitad();
