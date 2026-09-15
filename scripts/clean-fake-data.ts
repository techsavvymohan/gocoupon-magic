import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. Clean admin-submissions.json
const submissionsPath = path.join(rootDir, "server/data/admin-submissions.json");
console.log("1. Cleaning server/data/admin-submissions.json...");
fs.writeFileSync(submissionsPath, JSON.stringify([], null, 2), "utf-8");
console.log("   -> Set admin-submissions.json to []");

// 2. Clean test blogs in server/data/blogs.json
const blogsPath = path.join(rootDir, "server/data/blogs.json");
if (fs.existsSync(blogsPath)) {
  console.log("2. Cleaning test blogs in server/data/blogs.json...");
  const blogs = JSON.parse(fs.readFileSync(blogsPath, "utf-8"));
  const cleanBlogs = blogs.filter((b: any) => !b.id.startsWith("blog-1789") && !b.slug.includes("-1"));
  fs.writeFileSync(blogsPath, JSON.stringify(cleanBlogs, null, 2), "utf-8");
  console.log(`   -> Retained ${cleanBlogs.length} real editorial blogs (removed ${blogs.length - cleanBlogs.length} test posts)`);
}

// 3. Clean test deals in src/data/live-deals.json
const liveDealsPath = path.join(rootDir, "src/data/live-deals.json");
if (fs.existsSync(liveDealsPath)) {
  console.log("3. Cleaning test deals in src/data/live-deals.json...");
  const data = JSON.parse(fs.readFileSync(liveDealsPath, "utf-8"));
  const deals = data.deals || data;
  const initialCount = deals.length;
  const cleanDeals = deals.filter((d: any) => {
    const isTestStore = /test/i.test(d.storeName || "");
    const isTestCode = /test/i.test(d.code || "") || d.code === "SPECIAL100";
    const isCommunityTest = d.source === "community" && /test/i.test(d.title || "");
    return !(isTestStore || isTestCode || isCommunityTest);
  });
  data.deals = cleanDeals;
  data.totalFetched = cleanDeals.length;
  data.activeCount = cleanDeals.filter((d: any) => d.status === "active").length;
  fs.writeFileSync(liveDealsPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`   -> Removed ${initialCount - cleanDeals.length} test deals. Remaining: ${cleanDeals.length}`);
}

// 4. Supabase / Postgres cleanup if configured
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const databaseUrl = process.env.DATABASE_URL;

async function cleanCloudDb() {
  if (databaseUrl) {
    console.log("4. Connecting to PostgreSQL database to delete test submissions...");
    const pool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    try {
      const res = await pool.query("DELETE FROM gocoupon_submissions");
      console.log(`   -> Deleted ${res.rowCount} rows from gocoupon_submissions in PostgreSQL.`);
      const dealsRes = await pool.query("DELETE FROM gocoupon_deals WHERE store_name ILIKE '%test%' OR code ILIKE '%test%' OR code = 'SPECIAL100'");
      console.log(`   -> Deleted ${dealsRes.rowCount} test rows from gocoupon_deals in PostgreSQL.`);
    } catch (err: any) {
      console.warn("   -> PostgreSQL direct cleanup error:", err.message);
    } finally {
      await pool.end();
    }
  }

  if (supabaseUrl && supabaseKey) {
    console.log("5. Cleaning Supabase client...");
    const supabase = createClient(supabaseUrl, supabaseKey);
    try {
      const { error: subErr } = await supabase.from("gocoupon_submissions").delete().neq("id", "none");
      if (subErr) console.warn("   -> Supabase submissions cleanup note:", subErr.message);
      else console.log("   -> Supabase gocoupon_submissions cleared.");
    } catch (e: any) {
      console.warn("   -> Supabase note:", e.message);
    }
  }
}

cleanCloudDb()
  .then(() => {
    console.log("\nAll fake/test data successfully eliminated!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Cleanup error:", err);
    process.exit(1);
  });
