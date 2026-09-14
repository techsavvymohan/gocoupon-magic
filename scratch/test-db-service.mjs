import { 
  getDatabaseDiagnostics, 
  dealsDb, 
  blogsDb, 
  submissionsDb, 
  storesDb 
} from "../server/services/db.js";

async function test() {
  console.log("Testing server/services/db.ts...");
  // Give pool 500ms to establish initial connection
  await new Promise(r => setTimeout(r, 600));

  const diag = await getDatabaseDiagnostics();
  console.log("Diagnostics:", JSON.stringify(diag, null, 2));

  const deals = await dealsDb.getDeals({ limit: 3 });
  console.log(`Fetched ${deals.length} deals:`, deals.map(d => ({ id: d.id, title: d.title, store: d.storeName })));

  const blogs = await blogsDb.getBlogs();
  console.log(`Fetched ${blogs.length} blogs:`, blogs.map(b => ({ id: b.id, slug: b.slug, title: b.title })));

  const subs = await submissionsDb.getSubmissions();
  console.log(`Fetched ${subs.length} submissions:`, subs.map(s => ({ id: s.id, store: s.storeName, code: s.code, status: s.status })));

  const stores = await storesDb.getStores();
  console.log(`Fetched ${stores.length} stores:`, stores.slice(0, 3).map(s => ({ name: s.name, slug: s.slug })));

  console.log("✅ All service tests passed!");
  process.exit(0);
}

test().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
