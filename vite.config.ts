import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
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
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("three") || id.includes("@react-three")) {
            return "vendor-three";
          }
          if (id.includes("react-dom") || id.includes("/react/") || id.includes("scheduler")) {
            return "vendor-react";
          }
          if (id.includes("@tanstack")) return "vendor-tanstack";
          if (id.includes("@radix-ui")) return "vendor-radix";
          if (id.includes("lucide-react")) return "vendor-icons";
          if (id.includes("recharts") || id.includes("embla-carousel")) return "vendor-charts";
          if (id.includes("react-hook-form") || id.includes("@hookform") || id.includes("zod")) {
            return "vendor-forms";
          }
          return "vendor";
        },
      },
    },
  },
});
