/**
 * @file src/lib/access-control.ts
 * @description Role-based access control, unified sections, and admin permission definitions for GoCoupon.
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
  | "settings"
  | "content"
  | "homepage";

export type RoleType = "admin" | "editor" | "viewer";

export interface PermissionItem {
  key: PermissionKey;
  label: string;
  href: string;
  description?: string;
}

export interface AdminSubTab {
  key: PermissionKey;
  label: string;
  shortLabel?: string;
  description: string;
  badgeType?: "pending_submissions";
}

export interface AdminSection {
  id: string;
  label: string;
  iconName: string;
  description: string;
  defaultTab: PermissionKey;
  subTabs: AdminSubTab[];
}

export const ADMIN_SECTIONS: AdminSection[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    iconName: "LayoutDashboard",
    description: "Real-time operations, deal synchronization & platform vitals",
    defaultTab: "dashboard",
    subTabs: [
      {
        key: "dashboard",
        label: "Operations Overview",
        shortLabel: "Overview",
        description: "High-level KPIs, deal sync status & live click tracking",
      },
    ],
  },
  {
    id: "offers",
    label: "Coupons & Deals",
    iconName: "Tag",
    description: "Unified discounts workspace — manage promo codes, submissions & product deals",
    defaultTab: "offers",
    subTabs: [
      {
        key: "offers",
        label: "All Coupons & Deals",
        shortLabel: "Coupons",
        description: "Active, featured, and expired promo codes across all affiliate networks",
      },
      {
        key: "submissions",
        label: "Community Submissions",
        shortLabel: "Submissions",
        description: "Review and approve shopper-submitted promo codes",
        badgeType: "pending_submissions",
      },
      {
        key: "products",
        label: "Product Deals",
        shortLabel: "Products",
        description: "Curate featured product discounts & price tracking",
      },
    ],
  },
  {
    id: "stores",
    label: "Stores & Brands",
    iconName: "Store",
    description: "Merchants directory, affiliate tracking URLs & Cloudinary brand assets",
    defaultTab: "stores",
    subTabs: [
      {
        key: "stores",
        label: "Store Directory",
        shortLabel: "Stores",
        description: "Manage store profiles, affiliate tracking links & SEO copy",
      },
      {
        key: "brand-assets",
        label: "Brand Assets & Logos",
        shortLabel: "Brand Assets",
        description: "Cloudinary CDN sync, domain logo auto-grabber & coverage analytics",
      },
    ],
  },
  {
    id: "homepage",
    label: "Homepage & Layout",
    iconName: "LayoutTemplate",
    description: "Storefront presentation, marquee tickers & promotional showcases",
    defaultTab: "hero",
    subTabs: [
      {
        key: "hero",
        label: "Hero & Top Banner",
        shortLabel: "Hero Banner",
        description: "Main search headline, background slides & top festive announcement",
      },
      {
        key: "sections",
        label: "Sections & Marquee",
        shortLabel: "Sections",
        description: "Deal ticker marquee, floating promotional toast & store showcases",
      },
    ],
  },
  {
    id: "content",
    label: "Content & Editorial",
    iconName: "BookOpen",
    description: "Publish shopping guides, store taxonomy & seasonal festival sales",
    defaultTab: "blogs",
    subTabs: [
      {
        key: "blogs",
        label: "Blog Posts & Guides",
        shortLabel: "Blog",
        description: "Author and publish SEO shopping guides and saving strategies",
      },
      {
        key: "categories",
        label: "Shopping Categories",
        shortLabel: "Categories",
        description: "Organize stores by shopping category and custom badges",
      },
      {
        key: "events",
        label: "Sale Events & Festivals",
        shortLabel: "Festivals",
        description: "Schedule mega-sale events like Black Friday, Diwali & Prime Day",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings & Team",
    iconName: "Settings",
    description: "Platform configuration, Google Search Console & admin permissions",
    defaultTab: "settings",
    subTabs: [
      {
        key: "settings",
        label: "Platform Settings & SEO",
        shortLabel: "Settings",
        description: "Google Search Console, meta tags, robots.txt & legal compliance",
      },
      {
        key: "users",
        label: "Admin Team & Roles",
        shortLabel: "Team",
        description: "Invite administrators and configure role-based access permissions",
      },
    ],
  },
];

export function getSectionForTab(tabKey: string): AdminSection {
  const found = ADMIN_SECTIONS.find(
    (sec) => sec.id === tabKey || sec.subTabs.some((sub) => sub.key === tabKey)
  );
  return found || ADMIN_SECTIONS[0];
}

export function getSubTabInfo(tabKey: string): { section: AdminSection; subTab: AdminSubTab } {
  for (const section of ADMIN_SECTIONS) {
    const subTab = section.subTabs.find((s) => s.key === tabKey);
    if (subTab) {
      return { section, subTab };
    }
  }
  return {
    section: ADMIN_SECTIONS[0],
    subTab: ADMIN_SECTIONS[0].subTabs[0],
  };
}

export const PERMISSIONS: PermissionItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin" },
  { key: "offers", label: "Coupons & Deals", href: "/admin?tab=offers" },
  { key: "submissions", label: "Submitted Coupons", href: "/admin?tab=submissions" },
  { key: "stores", label: "Stores Directory", href: "/admin?tab=stores" },
  { key: "products", label: "Products Catalog", href: "/admin?tab=products", description: "Manage product comparison & live price floor" },
  { key: "brand-assets", label: "Brand Assets & Logos", href: "/admin?tab=brand-assets", description: "Manage Cloudinary merchant logos & branding" },
  { key: "categories", label: "Categories", href: "/admin?tab=categories" },
  { key: "blogs", label: "Blog & Guides", href: "/admin?tab=blogs" },
  { key: "events", label: "Events & Festivals", href: "/admin?tab=events" },
  { key: "hero", label: "Hero & Banner", href: "/admin?tab=hero" },
  { key: "sections", label: "Homepage Sections", href: "/admin?tab=sections" },
  { key: "users", label: "Admin Users", href: "/admin?tab=users" },
  { key: "settings", label: "Settings & SEO", href: "/admin?tab=settings" },
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
    "content",
    "homepage",
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
    "content",
    "homepage",
  ],
  viewer: [
    "dashboard",
    "offers",
    "submissions",
    "stores",
    "products",
    "brand-assets",
    "categories",
    "blogs",
    "content",
    "homepage",
  ],
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
