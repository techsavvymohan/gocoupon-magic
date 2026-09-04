import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

function searxngDevPlugin() {
  return {
    name: "vite-plugin-searxng-dev",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url?.startsWith("/api/shopping")) {
          try {
            const urlObj = new URL(req.url, "http://localhost:8080");
            const q = urlObj.searchParams.get("q")?.trim();
            if (!q) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Query 'q' is required" }));
              return;
            }

            // Check in-memory cache (15 min TTL)
            const cacheKey = q.toLowerCase();
            const cached = (globalThis as any).__shoppingCache?.get(cacheKey);
            if (cached && cached.expiry > Date.now()) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify(cached.data));
              return;
            }

            const apiKey = process.env.SERPAPI_API_KEY || process.env.SERPAPI_KEY || "";
            if (!apiKey) {
              console.warn("SERPAPI_API_KEY not set in environment. Returning empty shopping results.");
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify({ shopping_results: [] }));
              return;
            }

            const serpUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(
              q
            )}&gl=in&hl=en&api_key=${apiKey}&num=20`;

            const upstream = await fetch(serpUrl, { signal: AbortSignal.timeout(12000) });
            if (upstream.ok) {
              const data = await upstream.json();
              if (data.shopping_results && data.shopping_results.length > 0) {
                if (!(globalThis as any).__shoppingCache) {
                  (globalThis as any).__shoppingCache = new Map();
                }
                (globalThis as any).__shoppingCache.set(cacheKey, {
                  data,
                  expiry: Date.now() + 15 * 60 * 1000,
                });
              }
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify(data));
              return;
            }
          } catch (err: any) {
            console.warn("Shopping dev proxy error:", err.message);
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.end(JSON.stringify({ shopping_results: [] }));
          return;
        }

        if (!req.url?.startsWith("/api/searxng")) {
          return next();
        }
        try {
          const urlObj = new URL(req.url, "http://localhost:8080");
          const q = urlObj.searchParams.get("q");
          if (!q) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Query 'q' is required" }));
            return;
          }

          const categories = urlObj.searchParams.get("categories") || "general";
          const language = urlObj.searchParams.get("language") || "en";
          const pageno = urlObj.searchParams.get("pageno") || "1";

          const instances = [
            process.env.SEARXNG_URL,
            "https://search.mectov.my.id",
            "https://etsi.me",
            "https://sx.xo.st",
          ].filter(Boolean) as string[];

          for (const instance of instances) {
            try {
              const target = new URL(`${instance.replace(/\/+$/, "")}/search`);
              target.searchParams.set("q", q);
              target.searchParams.set("format", "json");
              target.searchParams.set("categories", categories);
              target.searchParams.set("language", language);
              target.searchParams.set("pageno", pageno);

              const upstream = await fetch(target.toString(), {
                headers: {
                  Accept: "application/json",
                  "User-Agent": "Mozilla/5.0 (compatible; goCoupon/2.0)",
                },
                signal: AbortSignal.timeout(4500),
              });

              if (upstream.ok && upstream.headers.get("content-type")?.includes("json")) {
                const data = await upstream.json();
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.end(JSON.stringify(data));
                return;
              }
            } catch {
              // Try next instance
            }
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ query: q, number_of_results: 0, results: [], suggestions: [], fallback: true }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    searxngDevPlugin(),
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
  ],
  server: {
    port: 8080,
    host: true,
    watch: {
      ignored: ["**/docs/**"],
    },
  },
  optimizeDeps: {
    entries: ["index.html", "src/**/*.{ts,tsx}"],
    exclude: ["solid-js", "svelte", "vue", "caramel-ui"],
  },
  build: {
    outDir: "dist",
    // esbuild is Vite's default minifier — fast, no extra devDep required.
    // Swap to 'terser' once `terser` is installed (npm i -D terser) for slightly
    // smaller output at the cost of build speed.
    minify: "esbuild",
    cssMinify: true,
    sourcemap: false,
    target: "es2020",
    // Split vendor + feature chunks so first paint ships less JS and caching is long-lived.
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          const normalized = id.replace(/\\/g, "/");

          // 1. Heavy application data modules
          if (normalized.includes("/src/data/posts")) {
            return "data-posts";
          }
          if (normalized.includes("/src/data/")) {
            return "data-catalog";
          }

          // 2. Heavy feature page route modules
          if (normalized.includes("/src/routes/blog/")) {
            return "page-blog";
          }
          if (normalized.includes("/src/routes/compare")) {
            return "page-compare";
          }
          if (normalized.includes("/src/routes/price-history")) {
            return "page-price-history";
          }
          if (normalized.includes("/src/routes/product/")) {
            return "page-product";
          }
          if (normalized.includes("/src/routes/collections/")) {
            return "page-collections";
          }

          // 3. Third-party vendor dependencies
          if (normalized.includes("node_modules")) {
            if (
              normalized.includes("react-dom") ||
              normalized.includes("/react/") ||
              normalized.includes("scheduler")
            ) {
              return "vendor-react";
            }
            if (normalized.includes("@tanstack")) {
              return "vendor-tanstack";
            }
            if (normalized.includes("@radix-ui")) {
              return "vendor-radix";
            }
            if (normalized.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (
              normalized.includes("recharts") ||
              normalized.includes("embla-carousel") ||
              normalized.includes("d3-")
            ) {
              return "vendor-charts";
            }
            if (
              normalized.includes("react-hook-form") ||
              normalized.includes("@hookform") ||
              normalized.includes("zod")
            ) {
              return "vendor-forms";
            }
            if (normalized.includes("@supabase")) {
              return "vendor-supabase";
            }
            if (
              normalized.includes("clsx") ||
              normalized.includes("tailwind-merge") ||
              normalized.includes("class-variance-authority") ||
              normalized.includes("sonner")
            ) {
              return "vendor-ui";
            }
            return "vendor";
          }

          return undefined;
        },
      },
    },
  },
});
