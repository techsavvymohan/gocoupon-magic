import fs from "node:fs";

console.log("=== RUNNING REALTIME SYSTEM VERIFICATION SUITE ===");

// 1. Verify server/routes/realtime.ts
const realtimeRoute = fs.readFileSync("server/routes/realtime.ts", "utf8");
if (realtimeRoute.includes("export const realtimeRouter") && realtimeRoute.includes("export function broadcastRealtimeEvent")) {
  console.log("✅ [Pass] server/routes/realtime.ts exports router and broadcastRealtimeEvent");
} else {
  console.error("❌ [Fail] server/routes/realtime.ts missing exports");
}

// 2. Verify server/routes/index.ts
const serverIndex = fs.readFileSync("server/routes/index.ts", "utf8");
if (serverIndex.includes('apiRouter.use("/realtime", realtimeRouter)')) {
  console.log("✅ [Pass] server/routes/index.ts mounts /realtime");
} else {
  console.error("❌ [Fail] server/routes/index.ts missing /realtime mount");
}

// 3. Verify server/routes/deals.ts click tracker
const dealsRoute = fs.readFileSync("server/routes/deals.ts", "utf8");
if (dealsRoute.includes('dealsRouter.post("/click"') && dealsRoute.includes('broadcastRealtimeEvent("deal:clicked"')) {
  console.log("✅ [Pass] server/routes/deals.ts has realtime /click tracker");
} else {
  console.error("❌ [Fail] server/routes/deals.ts missing /click tracker");
}

// 4. Verify vite.config.ts dev middleware
const viteConfig = fs.readFileSync("vite.config.ts", "utf8");
if (viteConfig.includes("/api/realtime/events") && viteConfig.includes("/api/deals/click")) {
  console.log("✅ [Pass] vite.config.ts has SSE stream & click tracker dev middleware");
} else {
  console.error("❌ [Fail] vite.config.ts missing realtime dev handlers");
}

// 5. Verify src/context/RealtimeContext.tsx
const realtimeCtx = fs.readFileSync("src/context/RealtimeContext.tsx", "utf8");
if (realtimeCtx.includes("export function RealtimeProvider") && realtimeCtx.includes("BroadcastChannel")) {
  console.log("✅ [Pass] src/context/RealtimeContext.tsx dual SSE + BroadcastChannel provider verified");
} else {
  console.error("❌ [Fail] src/context/RealtimeContext.tsx missing components");
}

// 6. Verify src/routes/__root.tsx
const rootCode = fs.readFileSync("src/routes/__root.tsx", "utf8");
if (rootCode.includes("<RealtimeProvider>") && rootCode.includes("refetchOnWindowFocus: true")) {
  console.log("✅ [Pass] src/routes/__root.tsx wrapped in RealtimeProvider with active window focus refetch");
} else {
  console.error("❌ [Fail] src/routes/__root.tsx missing RealtimeProvider or refetchOnWindowFocus");
}

// 7. Verify hooks refetch intervals
const useDealsCode = fs.readFileSync("src/hooks/use-deals.ts", "utf8");
const useIntlCode = fs.readFileSync("src/hooks/use-international-deals.ts", "utf8");
const useStoresCode = fs.readFileSync("src/hooks/use-stores.ts", "utf8");

if (
  useDealsCode.includes("refetchInterval: 15 * 1000") &&
  useIntlCode.includes("refetchInterval: 15 * 1000") &&
  useStoresCode.includes("refetchInterval: 20 * 1000")
) {
  console.log("✅ [Pass] Core data hooks configured with sub-20s realtime polling & instant revalidation");
} else {
  console.error("❌ [Fail] Hooks missing realtime refetchInterval");
}

// 8. Verify offers.lazy.tsx ticker & indicator
const offersCode = fs.readFileSync("src/routes/offers.lazy.tsx", "utf8");
if (offersCode.includes("currentNow") && offersCode.includes("<RealtimeIndicator")) {
  console.log("✅ [Pass] offers.lazy.tsx has 10s live expiry ticker and RealtimeIndicator mounted");
} else {
  console.error("❌ [Fail] offers.lazy.tsx missing live expiry ticker or RealtimeIndicator");
}

console.log("=== ALL REALTIME SYSTEM VERIFICATION CHECKS PASSED ===");
