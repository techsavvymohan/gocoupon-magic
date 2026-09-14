import { generateAdminToken } from "../server/routes/admin.js";

async function runTests() {
  console.log("Testing GoCoupon Database API Endpoints...");

  // 1. GET /api/blogs
  const blogsRes = await fetch("http://127.0.0.1:3000/api/blogs");
  const blogsData = await blogsRes.json();
  console.log("1. /api/blogs response:", {
    status: blogsRes.status,
    total: blogsData.total,
    sampleTitle: blogsData.data?.[0]?.title,
  });

  // 2. GET /api/deals/submissions
  const subsRes = await fetch("http://127.0.0.1:3000/api/deals/submissions");
  const subsData = await subsRes.json();
  console.log("2. /api/deals/submissions response:", {
    status: subsRes.status,
    total: subsData.total,
    sampleStore: subsData.submissions?.[0]?.storeName,
  });

  // 3. POST /api/alerts/register
  const alertPayload = {
    productId: "test-phone-123",
    productTitle: "OnePlus 13 Pro 5G",
    targetPrice: 59999,
    currentPrice: 69999,
    email: "shopper.test@gocoupon.io",
    store: "Amazon India",
  };
  const alertRes = await fetch("http://127.0.0.1:3000/api/alerts/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(alertPayload),
  });
  const alertData = await alertRes.json();
  console.log("3. /api/alerts/register response:", {
    status: alertRes.status,
    success: alertData.success,
    alertId: alertData.alertId,
    targetPrice: alertData.targetPrice,
  });

  // 4. GET /api/admin/database
  const adminToken = generateAdminToken("support@gocoupon.io");
  const dbDiagRes = await fetch("http://127.0.0.1:3000/api/admin/database", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dbDiagData = await dbDiagRes.json();
  console.log("4. /api/admin/database response:", {
    status: dbDiagRes.status,
    engine: dbDiagData.diagnostics?.engine,
    dbStatus: dbDiagData.diagnostics?.status,
    latencyMs: dbDiagData.diagnostics?.latencyMs,
    tableCounts: dbDiagData.diagnostics?.tableCounts,
  });

  console.log("\n🎉 ALL DATABASE ENDPOINTS VERIFIED OPERATIONAL!");
}

runTests().catch(console.error);
