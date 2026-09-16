/**
 * @file server/services/cloudinary.ts
 * @description Cloudinary Media Storage & Image Transformation Service for GoCoupon.
 */

import { v2 as cloudinary, type UploadApiResponse, type UploadApiOptions } from "cloudinary";

// Initialize Cloudinary with environment credentials
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "pgzfcjir";
const apiKey = process.env.CLOUDINARY_API_KEY || "518138255589751";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "nWAFFF2TZ2EuTCvul75fE41VWHk";

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export { cloudinary };

export interface UploadImageOptions {
  folder?: string;
  tags?: string[];
  transformation?: any[];
  public_id?: string;
}

/**
 * Uploads an image (base64 data URI, local path, or remote URL) to Cloudinary.
 */
export async function uploadImageToCloudinary(
  fileOrUrl: string,
  options: UploadImageOptions = {}
): Promise<{
  success: boolean;
  url: string;
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  optimized_url: string;
}> {
  try {
    const uploadOptions: UploadApiOptions = {
      folder: options.folder || "gocoupon/blogs",
      resource_type: "image",
      tags: options.tags || ["gocoupon", "blog"],
      overwrite: true,
      invalidate: true,
    };

    if (options.public_id) {
      uploadOptions.public_id = options.public_id;
    }

    const result: UploadApiResponse = await cloudinary.uploader.upload(fileOrUrl, uploadOptions);

    // Generate auto-optimized CDN URL with f_auto, q_auto
    const optimized_url = cloudinary.url(result.public_id, {
      secure: true,
      quality: "auto",
      fetch_format: "auto",
    });

    return {
      success: true,
      url: result.url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      optimized_url,
    };
  } catch (error: any) {
    console.error("[Cloudinary] Upload failed:", error?.message || error);
    throw new Error(error?.message || "Failed to upload image to Cloudinary.");
  }
}
