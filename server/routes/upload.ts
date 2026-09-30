/**
 * @file server/routes/upload.ts
 * @description Cloudinary Media Upload API Routes for Admin & Content Creators.
 */

import { Router, type Request, type Response } from "express";
import { requireAdminAuth } from "./admin.js";
import { uploadImageToCloudinary } from "../services/cloudinary.js";
import { cloudinary } from "../services/cloudinary.js";

export const uploadRouter = Router();

/**
 * GET /api/admin/upload/status
 * Check Cloudinary connection status and configuration.
 */
uploadRouter.get("/upload/status", requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "pgzfcjir";
    const apiKey = process.env.CLOUDINARY_API_KEY || "518138255589751";
    res.json({
      success: true,
      configured: Boolean(cloudName && apiKey),
      cloudName,
      provider: "Cloudinary",
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to check Cloudinary status" });
  }
});

/**
 * POST /api/admin/upload
 * Securely uploads an image to Cloudinary.
 * Accepts: { image: string (base64 or URL), folder?: string, tags?: string[] }
 */
uploadRouter.post("/upload", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { image, folder = "gocoupon/blogs", tags = ["gocoupon", "admin-upload"], public_id } = req.body;

    if (!image || typeof image !== "string") {
      res.status(400).json({
        success: false,
        error: "Missing required 'image' field (must be base64 data URI or image URL).",
      });
      return;
    }

    const result = await uploadImageToCloudinary(image, {
      folder,
      tags,
      public_id,
    });

    res.json({
      success: true,
      data: {
        ...result,
        secureUrl: result.secure_url,
      },
      message: "Image uploaded successfully to Cloudinary.",
    });
  } catch (error: any) {
    console.error("[Upload API] Cloudinary upload error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to upload image to Cloudinary.",
    });
  }
});

/**
 * POST /api/uploads/banner-image or /api/admin/uploads/banner-image
 * Dedicated endpoint for Admin Hero Manager and Homepage Sections promo banners.
 */
uploadRouter.post("/banner-image", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { image, file } = req.body || {};
    const imgData = image || file;

    if (!imgData || typeof imgData !== "string") {
      res.status(400).json({
        success: false,
        error: "Missing required 'image' field (must be base64 data URI or image URL).",
      });
      return;
    }

    const result = await uploadImageToCloudinary(imgData, {
      folder: "gocoupon/banners",
      tags: ["gocoupon", "hero-banner", "promo"],
    });

    res.json({
      success: true,
      data: {
        ...result,
        secureUrl: result.secure_url,
      },
      message: "Banner image uploaded successfully.",
    });
  } catch (error: any) {
    console.error("[Upload API] Banner upload error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to upload banner image.",
    });
  }
});

/**
 * POST /api/uploads/product-image or /api/admin/uploads/product-image
 * Dedicated endpoint for Admin Products Manager.
 */
uploadRouter.post("/product-image", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { image, file, slug } = req.body || {};
    const imgData = image || file;

    if (!imgData || typeof imgData !== "string") {
      res.status(400).json({
        success: false,
        error: "Missing required 'image' field (must be base64 data URI or image URL).",
      });
      return;
    }

    const result = await uploadImageToCloudinary(imgData, {
      folder: "gocoupon/products",
      tags: ["gocoupon", "products"],
      public_id: slug ? `prod_${slug}` : undefined,
    });

    res.json({
      success: true,
      data: {
        ...result,
        secureUrl: result.secure_url,
      },
      message: "Product image uploaded successfully.",
    });
  } catch (error: any) {
    console.error("[Upload API] Product image upload error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to upload product image.",
    });
  }
});

