/**
 * @file src/lib/access-control.ts
 * @description Role-based access control and admin permission definitions for GoCoupon.
 */

export type PermissionKey =
  | "dashboard"
  | "offers"
  | "submissions"
  | "stores"
  | "products"
  | "brand-assets"
  | "categories"
  | "blogs"
  | "events"
  | "hero"
  | "sections"
  | "users"
  | "settings";

export type RoleType = "admin" | "editor" | "viewer";

export interface PermissionItem {
  key: PermissionKey;
  label: string;
  href: string;
  description?: string;
}

export const PERMISSIONS: PermissionItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin" },
  { key: "offers", label: "Offers & Coupons", href: "/admin/offers" },
  { key: "submissions", label: "Submitted Coupons", href: "/admin/submissions" },
  { key: "stores", label: "Stores Directory", href: "/admin/stores" },
  { key: "products", label: "Products Catalog", href: "/admin/products", description: "Manage product comparison & live price floor" },
  { key: "brand-assets", label: "Brand Assets & Logos", href: "/admin/brand-assets", description: "Manage Cloudinary merchant logos & branding" },
  { key: "categories", label: "Categories", href: "/admin/categories" },
  { key: "blogs", label: "Blog & Guides", href: "/admin/blogs" },
  { key: "events", label: "Events & Festivals", href: "/admin/events" },
  { key: "hero", label: "Hero & Banner", href: "/admin/hero" },
  { key: "sections", label: "Homepage Sections", href: "/admin/sections" },
  { key: "users", label: "Admin Users", href: "/admin/users" },
  { key: "settings", label: "Settings & SEO", href: "/admin/settings" },
];

export const ROLE_LABELS: Record<RoleType, string> = {
  admin: "Super Administrator",
  editor: "Content Editor",
  viewer: "Read-Only Viewer",
};

export const ROLE_PERMISSIONS: Record<RoleType, PermissionKey[]> = {
  admin: [
    "dashboard",
    "offers",
    "submissions",
    "stores",
    "products",
    "brand-assets",
    "categories",
    "blogs",
    "events",
    "hero",
    "sections",
    "users",
    "settings",
  ],
  editor: [
    "dashboard",
    "offers",
    "submissions",
    "stores",
    "products",
    "brand-assets",
    "categories",
    "blogs",
    "events",
    "hero",
    "sections",
  ],
  viewer: ["dashboard", "offers", "submissions", "stores", "products", "brand-assets", "categories", "blogs"],
};

export function canAccessPermission(userPermissions: string[] | undefined, permissionKey: string): boolean {
  if (!userPermissions) return false;
  return userPermissions.includes(permissionKey);
}

export function getPermissionsForRole(role?: string, customPermissions?: string[]): string[] {
  if (role === "admin") return ROLE_PERMISSIONS.admin;
  if (Array.isArray(customPermissions) && customPermissions.length > 0) return customPermissions;
  if (role === "editor") return ROLE_PERMISSIONS.editor;
  return ROLE_PERMISSIONS.viewer;
}
