/**
 * @file src/admin/components/AdminBrandAssetsManager.jsx
 * @description Enterprise Brand Asset & Cloudinary Logo Management Suite for GoCoupon.io.
 *
 * Provides:
 * 1. Brand logo catalog & coverage analytics
 * 2. Instant Cloudinary link provision & validation
 * 3. Drag-and-Drop / direct file upload to Cloudinary CDN
 * 4. 1-Click Domain Auto-Fetch & Cloudinary Ingestion
 * 5. Instant synchronization across all live deals, stores, and site touchpoints
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  Search,
  Upload,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { getAdminAuthHeaders } from "@/context/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminBrandAssetsManager() {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'missing' | 'cloudinary' | 'local'
  const [editingSlug, setEditingSlug] = useState(null);
  const [inputUrlMap, setInputUrlMap] = useState({});
  const [uploadingSlug, setUploadingSlug] = useState(null);
  const [autoFetchingSlug, setAutoFetchingSlug] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);

  const fileInputRef = useRef(null);
  const [targetUploadBrand, setTargetUploadBrand] = useState(null);

  // Fetch all brand assets
  async function fetchBrandAssets() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/brand-assets", {
        headers: getAdminAuthHeaders(),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.brands)) {
        setBrands(data.brands);
        // Pre-fill inputUrlMap with existing URLs
        const urlMap = {};
        for (const b of data.brands) {
          urlMap[b.slug] = b.logoUrl || "";
        }
        setInputUrlMap(urlMap);
      } else {
        toast.error(data.error || "Failed to load brand assets.");
      }
    } catch (err) {
      toast.error("Network error while loading brand assets.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchBrandAssets();
  }, []);

  // Filtered brand list
  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        brand.name.toLowerCase().includes(q) ||
        brand.slug.toLowerCase().includes(q) ||
        (brand.domain && brand.domain.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (filterTab === "missing") return !brand.hasLogo;
      if (filterTab === "cloudinary") return brand.source === "cloudinary" || (brand.logoUrl && brand.logoUrl.includes("cloudinary.com"));
      if (filterTab === "local") return brand.source === "local";

      return true;
    });
  }, [brands, searchQuery, filterTab]);

  // Analytics
  const stats = useMemo(() => {
    const total = brands.length;
    const withLogos = brands.filter((b) => b.hasLogo).length;
    const missing = total - withLogos;
    const cloudinary = brands.filter((b) => b.source === "cloudinary" || (b.logoUrl && b.logoUrl.includes("cloudinary.com"))).length;
    const coverage = total > 0 ? Math.round((withLogos / total) * 100) : 0;
    return { total, withLogos, missing, cloudinary, coverage };
  }, [brands]);

  // Save / Update Brand Logo from pasted URL
  async function handleSaveUrl(brand) {
    const newUrl = (inputUrlMap[brand.slug] || "").trim();
    if (!newUrl) {
      toast.error("Please enter a valid image or Cloudinary URL.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/brand-assets/${encodeURIComponent(brand.slug)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({
          name: brand.name,
          domain: brand.domain,
          logoUrl: newUrl,
          source: newUrl.includes("cloudinary.com") ? "cloudinary" : "manual",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Logo updated for ${brand.name}!`);
        setBrands((prev) =>
          prev.map((b) => (b.slug === brand.slug ? { ...b, logoUrl: newUrl, hasLogo: true, source: data.data.source } : b))
        );
        setEditingSlug(null);
      } else {
        toast.error(data.error || "Failed to update logo.");
      }
    } catch (err) {
      toast.error("Error saving brand logo.");
    }
  }

  // Handle direct file upload to Cloudinary
  async function handleFileUpload(file, brand) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, SVG, WEBP, or JPG).");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error("File size exceeds 3MB limit.");
      return;
    }

    try {
      setUploadingSlug(brand.slug);
      toast.info(`Uploading logo for ${brand.name} to Cloudinary...`);

      const reader = new FileReader();
      const base64Data = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 1. Upload to Cloudinary via backend endpoint
      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({
          image: base64Data,
          folder: "gocoupon/brands",
          public_id: `brand_${brand.slug}`,
          tags: ["gocoupon", "brand-logo", brand.slug],
        }),
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.error || "Cloudinary upload failed.");
      }

      const secureUrl = uploadData.data?.secure_url || uploadData.data?.url;

      // 2. Persist to Brand Registry
      const saveRes = await fetch(`/api/admin/brand-assets/${encodeURIComponent(brand.slug)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({
          name: brand.name,
          domain: brand.domain,
          logoUrl: secureUrl,
          source: "cloudinary",
        }),
      });

      const saveData = await saveRes.json();
      if (saveData.success) {
        toast.success(`Cloudinary logo published for ${brand.name}!`);
        setBrands((prev) =>
          prev.map((b) => (b.slug === brand.slug ? { ...b, logoUrl: secureUrl, hasLogo: true, source: "cloudinary" } : b))
        );
        setInputUrlMap((prev) => ({ ...prev, [brand.slug]: secureUrl }));
      }
    } catch (err) {
      toast.error(err.message || "Failed to upload logo.");
    } finally {
      setUploadingSlug(null);
      setTargetUploadBrand(null);
    }
  }

  // 1-Click Auto-Fetch Logo from domain
  async function handleAutoFetch(brand) {
    try {
      setAutoFetchingSlug(brand.slug);
      toast.info(`Auto-fetching logo for ${brand.name}...`);

      const res = await fetch("/api/admin/brand-assets/auto-fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({
          name: brand.name,
          domain: brand.domain || `${brand.slug}.com`,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.logoUrl) {
        toast.success(`Retrieved & uploaded Cloudinary logo for ${brand.name}!`);
        setBrands((prev) =>
          prev.map((b) => (b.slug === brand.slug ? { ...b, logoUrl: data.data.logoUrl, hasLogo: true, source: "cloudinary" } : b))
        );
        setInputUrlMap((prev) => ({ ...prev, [brand.slug]: data.data.logoUrl }));
      } else {
        toast.error(data.error || "Could not auto-fetch logo. Try uploading a file or pasting a URL.");
      }
    } catch (err) {
      toast.error("Auto-fetch request failed.");
    } finally {
      setAutoFetchingSlug(null);
    }
  }

  // Reset or delete brand logo
  async function handleResetLogo(brand) {
    if (!window.confirm(`Reset logo for ${brand.name}?`)) return;
    try {
      const res = await fetch(`/api/admin/brand-assets/${encodeURIComponent(brand.slug)}`, {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Logo reset for ${brand.name}`);
        setBrands((prev) =>
          prev.map((b) => (b.slug === brand.slug ? { ...b, logoUrl: "", hasLogo: false, source: "manual" } : b))
        );
        setInputUrlMap((prev) => ({ ...prev, [brand.slug]: "" }));
      }
    } catch (err) {
      toast.error("Failed to reset logo.");
    }
  }

  // Copy Cloudinary Link
  function handleCopy(slug, url) {
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    toast.success("Cloudinary URL copied to clipboard!");
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Hidden file input for direct file upload */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && targetUploadBrand) {
            handleFileUpload(file, targetUploadBrand);
          }
          e.target.value = "";
        }}
      />

      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground">Brand Assets & Logo Hub</h1>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold">
              Cloudinary Powered
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Centralized registry for merchant logos. Logos configured here automatically propagate to all coupons, store vaults, and homepage carousels on <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">gocoupon.io</code>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBrandAssets}
            disabled={isLoading}
            className="rounded-xl border-border font-bold text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Brands</p>
          <p className="mt-1 text-2xl font-black text-foreground">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Across stores & live deals</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">With Active Logos</p>
          <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">{stats.withLogos}</p>
          <p className="text-[10px] text-emerald-600/80 mt-0.5">{stats.coverage}% catalog coverage</p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Missing Logos</p>
          <p className="mt-1 text-2xl font-black text-amber-700 dark:text-amber-300">{stats.missing}</p>
          <p className="text-[10px] text-amber-600/80 mt-0.5">Using CSS monograms</p>
        </div>

        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">Cloudinary CDN</p>
          <p className="mt-1 text-2xl font-black text-sky-700 dark:text-sky-300">{stats.cloudinary}</p>
          <p className="text-[10px] text-sky-600/80 mt-0.5">Optimized with f_auto,q_auto</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Logo Coverage</p>
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${stats.coverage}%` }}
              />
            </div>
            <span className="text-xs font-black text-foreground">{stats.coverage}%</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Goal: 100% brand coverage</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border/80 p-3 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search brands by name, slug, or domain (e.g. Nike, amazon)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-border/80 rounded-xl text-xs h-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              filterTab === "all"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All Brands ({stats.total})
          </button>

          <button
            onClick={() => setFilterTab("missing")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              filterTab === "missing"
                ? "bg-amber-600 text-white"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
            }`}
          >
            Missing Logos ({stats.missing})
          </button>

          <button
            onClick={() => setFilterTab("cloudinary")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              filterTab === "cloudinary"
                ? "bg-sky-600 text-white"
                : "bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20"
            }`}
          >
            Cloudinary ({stats.cloudinary})
          </button>

          <button
            onClick={() => setFilterTab("local")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              filterTab === "local"
                ? "bg-violet-600 text-white"
                : "bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20"
            }`}
          >
            Local Assets
          </button>
        </div>
      </div>

      {/* Brands List Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/80 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">Logo</th>
                <th className="py-3.5 px-4">Brand / Merchant</th>
                <th className="py-3.5 px-4">Status & Source</th>
                <th className="py-3.5 px-4 min-w-[320px]">Cloudinary / Image Link</th>
                <th className="py-3.5 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading brand catalog...
                  </td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2 opacity-80" />
                    <p className="font-bold text-sm text-foreground">No brands matched your criteria</p>
                    <p className="text-xs text-muted-foreground mt-1">Try clearing your search query or switching filters.</p>
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => {
                  const isUploading = uploadingSlug === brand.slug;
                  const isAutoFetching = autoFetchingSlug === brand.slug;
                  const currentInput = inputUrlMap[brand.slug] ?? brand.logoUrl ?? "";
                  const hasUnsavedChanges = currentInput.trim() !== (brand.logoUrl || "").trim();
                  const isCloudinary = brand.logoUrl && brand.logoUrl.includes("cloudinary.com");

                  return (
                    <tr key={brand.slug} className="hover:bg-muted/30 transition-colors">
                      {/* Logo Preview */}
                      <td className="py-3 px-4 text-center">
                        <div className="mx-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background/95 p-1 shadow-2xs overflow-hidden">
                          {brand.hasLogo && brand.logoUrl ? (
                            <img
                              src={brand.logoUrl}
                              alt={brand.name}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="font-mono font-bold text-[11px] text-muted-foreground uppercase">
                              {brand.name.slice(0, 2)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Brand Info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground flex items-center gap-1.5">
                          <span>{brand.name}</span>
                          {brand.dealCount > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                              {brand.dealCount} deals
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">{brand.slug}</code>
                          {brand.domain && (
                            <span className="flex items-center gap-0.5 text-zinc-500 hover:text-foreground">
                              {brand.domain}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status & Source Badge */}
                      <td className="py-3 px-4">
                        {isCloudinary ? (
                          <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 font-bold text-[10px] flex items-center gap-1 w-fit">
                            <CheckCircle2 className="h-3 w-3" />
                            Cloudinary Verified
                          </Badge>
                        ) : brand.hasLogo ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold text-[10px] flex items-center gap-1 w-fit">
                            <CheckCircle2 className="h-3 w-3" />
                            {brand.source === "local" ? "Local Asset" : "External URL"}
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold text-[10px] flex items-center gap-1 w-fit">
                            <AlertCircle className="h-3 w-3" />
                            Missing Logo
                          </Badge>
                        )}
                      </td>

                      {/* URL Input & Quick Save */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <div className="relative flex-1">
                            <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              value={currentInput}
                              onChange={(e) =>
                                setInputUrlMap((prev) => ({ ...prev, [brand.slug]: e.target.value }))
                              }
                              placeholder="Paste https://res.cloudinary.com/... or public image link"
                              className="pl-8 text-[11px] h-8 bg-background border-border/80 font-mono"
                            />
                          </div>

                          {hasUnsavedChanges && (
                            <Button
                              size="sm"
                              onClick={() => handleSaveUrl(brand)}
                              className="h-8 rounded-lg px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0"
                            >
                              Save
                            </Button>
                          )}

                          {brand.hasLogo && isCloudinary && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(brand.slug, brand.logoUrl)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground shrink-0"
                              title="Copy Cloudinary Link"
                            >
                              {copiedSlug === brand.slug ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons: Direct File Upload & 1-Click Auto-Fetch */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct File Upload to Cloudinary */}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUploading || isAutoFetching}
                            onClick={() => {
                              setTargetUploadBrand(brand);
                              fileInputRef.current?.click();
                            }}
                            className="h-8 text-xs font-bold rounded-lg border-border hover:border-primary/50 text-foreground"
                            title="Upload local PNG/SVG/WEBP file directly to Cloudinary"
                          >
                            <Upload className={`h-3.5 w-3.5 mr-1 ${isUploading ? "animate-bounce" : ""}`} />
                            {isUploading ? "Uploading..." : "Upload File"}
                          </Button>

                          {/* 1-Click Auto-Fetch */}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUploading || isAutoFetching}
                            onClick={() => handleAutoFetch(brand)}
                            className="h-8 text-xs font-bold rounded-lg border-border hover:border-violet-500/50 text-violet-600 dark:text-violet-400 bg-violet-500/5 hover:bg-violet-500/10"
                            title="Auto-fetch high resolution logo from brand domain into Cloudinary"
                          >
                            <Sparkles className={`h-3.5 w-3.5 mr-1 ${isAutoFetching ? "animate-spin text-violet-500" : ""}`} />
                            {isAutoFetching ? "Fetching..." : "Auto-Fetch"}
                          </Button>

                          {/* Reset Button */}
                          {brand.hasLogo && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResetLogo(brand)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500 shrink-0"
                              title="Reset brand logo"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
