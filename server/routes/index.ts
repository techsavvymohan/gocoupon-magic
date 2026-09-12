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
import { priceHistoryRouter } from "./price-history.js";
import { searchRouter } from "./search.js";
import { affiliatesRouter } from "./affiliates.js";
import { alertsRouter } from "./alerts.js";
import { categoriesRouter } from "./categories.js";
import { stackRouter, bankOffersRouter } from "./stack.js";
import { extensionRouter } from "./extension-config.js";
import { contactRouter } from "./contact.js";
import { cuelinksRouter } from "./cuelinks.js";

export const apiRouter = Router();

apiRouter.use("/stores", storesRouter);
apiRouter.use("/deals", dealsRouter);
apiRouter.use("/coupons", couponsRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/compare", compareRouter);
apiRouter.use("/shopping", shoppingRouter);
apiRouter.use("/searxng", searxngRouter);
apiRouter.use("/resolve", resolveRouter);
apiRouter.use("/price-history", priceHistoryRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/affiliates", affiliatesRouter);
apiRouter.use("/alerts", alertsRouter);
apiRouter.use("/contact", contactRouter);
apiRouter.use("/stack", stackRouter);
apiRouter.use("/bank-offers", bankOffersRouter);
apiRouter.use("/extension", extensionRouter);
apiRouter.use("/cuelinks", cuelinksRouter);
