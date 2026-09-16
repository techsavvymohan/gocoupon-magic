/**
 * @file src/lib/cloudinary.ts
 * @description Cloudinary client SDK configuration, URL generation, and admin media upload helpers.
 */

import { Cloudinary } from "@cloudinary/url-gen";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { format, quality } from "@cloudinary/url-gen/actions/delivery";
import { getAdminAuthHeaders } from "@/context/AdminAuthContext";

export const CLOUDINARY_CLOUD_NAME =
  (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || "pgzfcjir";

/**
 * Singleton instance of Cloudinary configured for GoCoupon.
 */
export const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUDINARY_CLOUD_NAME,
  },
  url: {
    secure: true,
  },
});

export interface TransformOptions {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string | number;
  format?: string;
}

/**
 * Converts a raw image URL or Cloudinary public ID into an optimized CDN URL.
 * Automatically injects f_auto, q_auto for maximum compression & WebP/AVIF delivery.
 */
export function getOptimizedImageUrl(
  imageSrc: string | null | undefined,
  options: TransformOptions = {}
): string {
  if (!imageSrc) return "";

  const src = imageSrc.trim();

  // If already a Cloudinary res.cloudinary.com URL
  if (src.includes("res.cloudinary.com")) {
    // If it already has f_auto or q_auto, or if it's already transformed, return
    if (src.includes("/upload/f_auto") || src.includes("/upload/q_auto")) {
      return src;
    }
    // Inject f_auto,q_auto right after /upload/
    const parts = src.split("/upload/");
    if (parts.length === 2) {
      const transforms: string[] = ["f_auto", "q_auto"];
      if (options.width) transforms.push(`w_${options.width}`);
      if (options.height) transforms.push(`h_${options.height}`);
      if (options.crop) transforms.push(`c_${options.crop}`);
      return `${parts[0]}/upload/${transforms.join(",")}/${parts[1]}`;
    }
    return src;
  }

  // If it's a relative path or third-party URL (e.g. Unsplash, external CDN)
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src;
  }

  // Otherwise treat as a Cloudinary publicId
  try {
    const img = cld.image(src);
    img.delivery(format("auto")).delivery(quality("auto"));
    if (options.width) {
      img.resize(auto().width(options.width));
    }
    return img.toURL();
  } catch {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${src}`;
  }
}

export interface UploadResult {
  success: boolean;
  url: string;
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
  optimized_url?: string;
}

/**
 * Upload an image file or base64 data to Cloudinary via backend admin endpoint.
 * Requires admin session.
 */
export async function uploadToCloudinary(
  fileOrData: File | string,
  folder = "gocoupon/blogs"
): Promise<UploadResult> {
  let base64String: string;

  if (typeof fileOrData === "string") {
    base64String = fileOrData;
  } else if (fileOrData instanceof File) {
    base64String = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrData);
    });
  } else {
    throw new Error("Invalid file provided. Must be a File object or base64 data string.");
  }

  const authHeaders = getAdminAuthHeaders();

  const response = await fetch("/api/admin/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify({
      image: base64String,
      folder,
    }),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error || "Failed to upload image to Cloudinary.");
  }

  return json.data;
}
