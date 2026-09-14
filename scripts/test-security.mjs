const BASE = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

async function runSecurityTests() {
  console.log("🔒 Running Automated Security & Bug Bounty Verification Suite...");
  console.log(`📍 Target Server: ${BASE}\n`);
  let passed = 0;
  let failed = 0;

  // Test 1: Unauthenticated POST /api/deals
  try {
    const res = await fetch(`${BASE}/api/deals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Hacked Deal" }),
    });
    if (res.status === 401) {
      console.log("  ✅ Test 1: Unauthenticated POST /api/deals returns 401 Unauthorized.");
      passed++;
    } else {
      console.error("  ❌ Test 1 Failed: Expected 401, got", res.status);
      failed++;
    }
  } catch (err) {
    console.error("  ❌ Test 1 Error:", err.message);
    failed++;
  }

  // Test 2: Unauthenticated POST /api/blogs
  try {
    const res = await fetch(`${BASE}/api/blogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Spam Blog" }),
    });
    if (res.status === 401) {
      console.log("  ✅ Test 2: Unauthenticated POST /api/blogs returns 401 Unauthorized.");
      passed++;
    } else {
      console.error("  ❌ Test 2 Failed: Expected 401, got", res.status);
      failed++;
    }
  } catch (err) {
    console.error("  ❌ Test 2 Error:", err.message);
    failed++;
  }

  // Test 3: Unauthenticated DELETE /api/deals
  try {
    const res = await fetch(`${BASE}/api/deals?id=deal-123`, {
      method: "DELETE",
    });
    if (res.status === 401) {
      console.log("  ✅ Test 3: Unauthenticated DELETE /api/deals returns 401 Unauthorized.");
      passed++;
    } else {
      console.error("  ❌ Test 3 Failed: Expected 401, got", res.status);
      failed++;
    }
  } catch (err) {
    console.error("  ❌ Test 3 Error:", err.message);
    failed++;
  }

  // Test 4: SSRF Loopback Defense (http://127.0.0.1:8888)
  try {
    const res = await fetch(`${BASE}/api/resolve?url=http://127.0.0.1:8888/search`);
    const data = await res.json();
    if (res.status === 400 && data.error && data.error.includes("prohibited URL target")) {
      console.log("  ✅ Test 4: SSRF probe to loopback 127.0.0.1 is blocked (400 Bad Request).");
      passed++;
    } else {
      console.error("  ❌ Test 4 Failed: Expected 400 blocked SSRF, got", res.status, data);
      failed++;
    }
  } catch (err) {
    console.error("  ❌ Test 4 Error:", err.message);
    failed++;
  }

  // Test 5: SSRF Cloud Metadata Defense (http://169.254.169.254)
  try {
    const res = await fetch(`${BASE}/api/resolve?url=http://169.254.169.254/latest/meta-data`);
    const data = await res.json();
    if (res.status === 400 && data.error && data.error.includes("prohibited URL target")) {
      console.log("  ✅ Test 5: SSRF probe to cloud metadata 169.254.169.254 is blocked (400 Bad Request).");
      passed++;
    } else {
      console.error("  ❌ Test 5 Failed: Expected 400 blocked SSRF, got", res.status, data);
      failed++;
    }
  } catch (err) {
    console.error("  ❌ Test 5 Error:", err.message);
    failed++;
  }

  // Test 6: Unauthenticated Cron Trigger (GET /api/alerts/check)
  try {
    const res = await fetch(`${BASE}/api/alerts/check`);
    if (res.status === 401) {
      console.log("  ✅ Test 6: Unauthenticated GET /api/alerts/check returns 401 Unauthorized.");
      passed++;
    } else {
      console.error("  ❌ Test 6 Failed: Expected 401, got", res.status);
      failed++;
    }
  } catch (err) {
    console.error("  ❌ Test 6 Error:", err.message);
    failed++;
  }

  // Test 7: RFC 9116 security.txt Endpoint
  try {
    const res = await fetch(`${BASE}/.well-known/security.txt`);
    const text = await res.text();
    if (res.status === 200 && text.includes("security@gocoupon.io")) {
      console.log("  ✅ Test 7: RFC 9116 /.well-known/security.txt served with 200 OK.");
      passed++;
    } else {
      console.error("  ❌ Test 7 Failed: Expected 200 security.txt, got", res.status, text.slice(0, 100));
      failed++;
    }
  } catch (err) {
    console.error("  ❌ Test 7 Error:", err.message);
    failed++;
  }

  // Test 8: Admin Login Rate Limiting (5 allowed, 6th blocked)
  try {
    let gotRateLimited = false;
    for (let i = 0; i < 8; i++) {
      const res = await fetch(`${BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": "198.51.100.77" },
        body: JSON.stringify({ email: "fake@example.com", password: "wrong" }),
      });
      if (res.status === 429) {
        gotRateLimited = true;
        break;
      }
    }
    if (gotRateLimited) {
      console.log("  ✅ Test 8: Admin login rate limiting triggers 429 Too Many Requests.");
      passed++;
    } else {
      console.error("  ❌ Test 8 Failed: Admin login rate limiting did not trigger 429.");
      failed++;
    }
  } catch (err) {
    console.error("  ❌ Test 8 Error:", err.message);
    failed++;
  }

  console.log(`\n🎯 Security Suite Result: ${passed} Passed, ${failed} Failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runSecurityTests();
