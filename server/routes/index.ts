/**
 * @file server/routes/index.ts
 * @description Central API Router for GoCoupon Express Server.
 */

import { Router } from "express";
import { storesRouter } from "./stores.js";
import { dealsRouter } from "./deals.js";
import { couponsRouter } from "./coupons.js";
import { compareRouter } from "./compare.js";
import { shoppingRouter } from "./shopping.js";
import { searxngRouter } from "./searxng.js";
import { resolveRouter } from "./resolve.js";
import { searchRouter } from "./search.js";
import { affiliatesRouter } from "./affiliates.js";
import { alertsRouter } from "./alerts.js";
import { categoriesRouter } from "./categories.js";
import { stackRouter, bankOffersRouter } from "./stack.js";
import { extensionRouter } from "./extension-config.js";
import { contactRouter } from "./contact.js";
import { cuelinksRouter } from "./cuelinks.js";
import { internationalDealsRouter } from "./international-deals.js";
import { adminRouter } from "./admin.js";
import { blogsRouter } from "./blogs.js";
import { openFoodFactRouter } from "../../src/open_food_fact/api-route.js";
import {
  getAdmitadConfig,
  getAdmitadAccessToken,
  getAdmitadSyncStatus,
  syncAdmitadDeals,
} from "../services/providers/admitad-client.js";
import { Router as ExpressRouter } from "express";

// ── Lightweight Admitad Status Router ─────────────────────────────────────────
const admitadRouter = ExpressRouter();

admitadRouter.get("/status", async (_req, res) => {
  const config = getAdmitadConfig();
  const token = config.isConfigured ? await getAdmitadAccessToken() : null;
  const syncStatus = getAdmitadSyncStatus();
  res.json({
    provider: "admitad",
    configured: config.isConfigured,
    connected: Boolean(token),
    ...syncStatus,
    timestamp: new Date().toISOString(),
  });
});

admitadRouter.post("/sync", async (_req, res) => {
  try {
    const result = await syncAdmitadDeals();
    res.json({ success: true, ...result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// ──────────────────────────────────────────────────────────────────────────────

export const apiRouter = Router();

apiRouter.use("/admin", adminRouter);
apiRouter.use("/blogs", blogsRouter);
apiRouter.use("/admin/blogs", blogsRouter);
apiRouter.use("/offers", dealsRouter);
apiRouter.use("/homepage", adminRouter);
apiRouter.use("/events", adminRouter);

apiRouter.get("/public/countries", (_req, res) => {
  res.json({
    success: true,
    data: [
      { code: "IN", name: "India" },
      { code: "US", name: "United States" },
      { code: "GB", name: "United Kingdom" },
      { code: "AE", name: "United Arab Emirates" },
      { code: "SG", name: "Singapore" },
      { code: "CA", name: "Canada" },
      { code: "AU", name: "Australia" },
    ],
  });
});

apiRouter.use("/stores", storesRouter);
apiRouter.use("/deals", dealsRouter);
apiRouter.use("/coupons", couponsRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/compare", compareRouter);
apiRouter.use("/shopping", shoppingRouter);
apiRouter.use("/searxng", searxngRouter);
apiRouter.use("/resolve", resolveRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/affiliates", affiliatesRouter);
apiRouter.use("/alerts", alertsRouter);
apiRouter.use("/contact", contactRouter);
apiRouter.use("/stack", stackRouter);
apiRouter.use("/bank-offers", bankOffersRouter);
apiRouter.use("/extension", extensionRouter);
apiRouter.use("/cuelinks", cuelinksRouter);
apiRouter.use("/international-deals", internationalDealsRouter);
apiRouter.use("/admitad", admitadRouter);
apiRouter.use("/open-food-fact", openFoodFactRouter);

