import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "@/admin/compat";
import { ConfirmModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, MousePointerClick, TrendingUp, Search, X, ChevronLeft, ChevronRight, Image as ImageIcon, Info, Tag, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";
import { getAdminAuthHeaders } from "@/context/AdminAuthContext";
import BulkCouponImportDialog from "./BulkCouponImportDialog";

const CATEGORY_OPTIONS = [
  "General",
  "Electronics",
  "Fashion",
  "Health",
  "Nutrition",
  "Travel",
  "Perfumes",
  "Beauty",
  "Food & Grocery",
  "Education",
  "Home & Living",
  "Finance",
];

const initialForm = {
  title: "",
  description: "",
  type: "Coupon",
  storeSlug: "",
  storeName: "",
  storeLogo: "",
  category: "General",
  affiliateLink: "",
  merchantUrl: "",
  source: "Manual",
  campaignSource: "manual",
  expiryDate: "",
  status: "Active",
  code: "",
  discount: "",
  badge: "Verified Offer",
  targetCountry: "India Eligible",
  terms: "",
  isFeatured: false,
  featuredPriority: 10,
};

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

export default function AdminOffersManager() {
  const searchParams = useSearchParams();
  const filterFromUrl = searchParams.get("filter");
  const queryFromUrl = searchParams.get("q") || searchParams.get("search") || "";
  const [filterTab, setFilterTab] = useState("all");
  const activeFilterTab = filterFromUrl || filterTab;

  const [offers, setOffers] = useState([]);
  const [stores, setStores] = useState([]);
  const [clickCounts, setClickCounts] = useState({});
  const [sortByClicks, setSortByClicks] = useState(false);
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);

  useEffect(() => {
    if (queryFromUrl) {
      setSearchQuery(queryFromUrl);
    }
  }, [queryFromUrl]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;
  const [open, setOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedOfferIds, setSelectedOfferIds] = useState([]);
  const [error, setError] = useState("");
  const [isCustomStore, setIsCustomStore] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoFileInputRef = useRef(null);
  const affiliateEditedRef = useRef(false);

  async function loadData() {
    const [offersResponse, storesResponse, clicksResponse] = await Promise.all([
      fetch("/api/offers?includeExpired=true", { cache: "no-store" }),
      fetch("/api/stores", { cache: "no-store" }),
      fetch("/api/admin/clicks/counts", { headers: getAdminAuthHeaders(), cache: "no-store" }).catch(() => null),
    ]);

    const [offersPayload, storesPayload] = await Promise.all([offersResponse.json(), storesResponse.json()]);
    if (clicksResponse && clicksResponse.ok) {
      try {
        const clicksPayload = await clicksResponse.json();
        setClickCounts(clicksPayload.counts || {});
      } catch {}
    }
    setOffers(offersPayload.data || []);
    setStores(storesPayload.data || storesPayload.stores || []);
    setSelectedOfferIds((current) => current.filter((id) => (offersPayload.data || []).some((offer) => offer.id === id)));
  }

  useEffect(() => {
    let active = true;

    async function hydrateData() {
      const [offersResponse, storesResponse, clicksResponse] = await Promise.all([
        fetch("/api/offers?includeExpired=true", { cache: "no-store" }),
        fetch("/api/stores", { cache: "no-store" }),
        fetch("/api/admin/clicks/counts", { headers: getAdminAuthHeaders(), cache: "no-store" }).catch(() => null),
      ]);

      const [offersPayload, storesPayload] = await Promise.all([offersResponse.json(), storesResponse.json()]);

      if (active) {
        if (clicksResponse && clicksResponse.ok) {
          try {
            const clicksPayload = await clicksResponse.json();
            setClickCounts(clicksPayload.counts || {});
          } catch {}
        }
        setOffers(offersPayload.data || []);
        setStores(storesPayload.data || storesPayload.stores || []);
        setSelectedOfferIds([]);
      }
    }

    hydrateData();

    return () => {
      active = false;
    };
  }, []);

  function handleOpenCreate() {
    setEditingOffer(null);
    setForm(initialForm);
    setIsCustomStore(false);
    affiliateEditedRef.current = false;
    setError("");
    setOpen(true);
  }

  function handleOpenEdit(offer) {
    setEditingOffer(offer);
    let cleanExpiry = offer.expiryDate || offer.endDate || "";
    if (cleanExpiry && cleanExpiry.includes("T")) {
      cleanExpiry = cleanExpiry.split("T")[0];
    }
    const isKnown = stores.some((s) => s.slug === offer.storeSlug);
    setIsCustomStore(!isKnown && Boolean(offer.storeSlug));

    setForm({
      title: offer.title || "",
      description: offer.description || "",
      type: offer.type || "Coupon",
      storeSlug: offer.storeSlug || "",
      storeName: offer.storeName || "",
      storeLogo: offer.storeLogo || offer.logoUrl || offer.imageUrl || offer.logo || "",
      category: offer.category || "General",
      affiliateLink: offer.affiliateLink || offer.link || "",
      merchantUrl: offer.merchantUrl || "",
      source: offer.source || "Manual",
      campaignSource: offer.campaignSource || "manual",
      expiryDate: cleanExpiry,
      status: offer.status || "Active",
      code: offer.code || "",
      discount: offer.discount || "",
      badge: offer.badge || "Verified Offer",
      targetCountry: offer.targetCountry || "India Eligible",
      terms: offer.terms || "",
      isFeatured: Boolean(offer.isFeatured),
      featuredPriority: offer.featuredPriority !== undefined ? offer.featuredPriority : 10,
    });
    affiliateEditedRef.current = Boolean(offer.affiliateLink || offer.link);
    setError("");
    setOpen(true);
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    const nextState = { ...form, [name]: type === "checkbox" ? checked : value };

    if (name === "storeSlug") {
      if (value === "__other__") {
        setIsCustomStore(true);
        setForm((prev) => ({
          ...prev,
          storeSlug: "",
          storeName: "",
        }));
        return;
      }
      setIsCustomStore(false);
      const matchedStore = stores.find((store) => store.slug === value);
      nextState.storeName = matchedStore?.name || "";
      if (!affiliateEditedRef.current && matchedStore?.affiliateLink) {
        nextState.affiliateLink = matchedStore.affiliateLink;
      }
      if (!nextState.storeLogo && (matchedStore?.logo || matchedStore?.storeLogo)) {
        nextState.storeLogo = matchedStore?.logo || matchedStore?.storeLogo;
      }
      if (matchedStore?.category && (!nextState.category || nextState.category === "General")) {
        nextState.category = matchedStore.category;
      }
    }

    if (name === "affiliateLink") {
      affiliateEditedRef.current = String(value).trim().length > 0;
    }

    setForm(nextState);
  }

  async function handleToggleFeatured(offer) {
    const nextFeatured = !offer.isFeatured;
    try {
      const response = await fetch(`/api/offers?id=${encodeURIComponent(offer.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAdminAuthHeaders() },
        body: JSON.stringify({
          ...offer,
          isFeatured: nextFeatured,
          featuredPriority: offer.featuredPriority || 10,
        }),
      });
      if (response.ok) {
        setOffers((prev) =>
          prev.map((o) => (o.id === offer.id ? { ...o, isFeatured: nextFeatured } : o))
        );
        toast.success(nextFeatured ? `Promoted "${offer.title}" to Featured Deals` : `Removed "${offer.title}" from Featured Deals`);
      } else {
        toast.error("Failed to update featured status");
      }
    } catch (err) {
      console.error("Toggle featured failed:", err);
      toast.error("Network error updating featured status");
    }
  }

  async function handleBulkToggleFeatured(featuredState) {
    if (!selectedOfferIds.length) return;
    try {
      await Promise.all(
        selectedOfferIds.map(async (id) => {
          const offer = offers.find((o) => o.id === id);
          if (!offer) return;
          await fetch(`/api/offers?id=${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...getAdminAuthHeaders() },
            body: JSON.stringify({
              ...offer,
              isFeatured: featuredState,
              featuredPriority: offer.featuredPriority || 10,
            }),
          });
        })
      );
      setOffers((prev) =>
        prev.map((o) => (selectedOfferIds.includes(o.id) ? { ...o, isFeatured: featuredState } : o))
      );
      toast.success(featuredState ? `Marked ${selectedOfferIds.length} offers as Featured` : `Removed ${selectedOfferIds.length} offers from Featured`);
    } catch (err) {
      console.error("Bulk toggle featured failed:", err);
      toast.error("Failed to update selected offers");
    }
  }

  async function handleLogoFileUpload(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG, SVG, WEBP, or JPG).");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image file must be under 3MB.");
      return;
    }

    try {
      setIsUploadingLogo(true);
      toast.info("Uploading brand logo to Cloudinary...");
      const reader = new FileReader();
      const base64Data = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const targetSlug =
        form.storeSlug ||
        (form.storeName || "brand")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({
          image: base64Data,
          folder: "gocoupon/brands",
          public_id: `brand_${targetSlug}`,
          tags: ["gocoupon", "brand-logo", targetSlug],
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to upload logo to Cloudinary.");
      }

      const secureUrl = payload.data?.secure_url || payload.data?.url;
      setForm((prev) => ({ ...prev, storeLogo: secureUrl }));
      toast.success("Logo uploaded to Cloudinary successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to upload logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const cleanStoreName = (form.storeName || "").trim();
    if (!cleanStoreName) {
      setError("Store / brand name is required.");
      toast.error("Store / brand name is required.");
      setIsSubmitting(false);
      return;
    }

    const finalStoreSlug = (form.storeSlug || cleanStoreName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const cleanLogo = (form.storeLogo || "").trim();
    const cleanCategory = form.category || "General";
    const cleanLink = form.affiliateLink || form.merchantUrl || `/store/${finalStoreSlug}`;

    const submissionPayload = {
      ...form,
      storeName: cleanStoreName,
      storeSlug: finalStoreSlug,
      storeLogo: cleanLogo,
      imageUrl: cleanLogo || form.imageUrl || "",
      category: cleanCategory,
    };

    // Auto-upsert store directly to /api/stores so it immediately updates the website's Stores Directory
    if (isCustomStore || !stores.some((s) => s.slug === finalStoreSlug)) {
      try {
        const storePayload = {
          id: finalStoreSlug,
          slug: finalStoreSlug,
          name: cleanStoreName,
          logo: cleanLogo,
          logoImage: cleanLogo,
          category: cleanCategory,
          link: cleanLink,
          affiliateLink: cleanLink,
          description: form.description || `Verified promo codes, deals, and vouchers for ${cleanStoreName}.`,
          badge: "Verified Partner",
          rating: 4.8,
          couponsCount: 1,
          maxDiscount: form.discount || "Special Offer",
          cashbackRate: "Available",
          popularCoupon: {
            code: form.code || "",
            description: form.title || "Featured discount offer",
            discount: form.discount || "Special Offer",
          },
        };

        const storeRes = await fetch("/api/stores", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAdminAuthHeaders() },
          body: JSON.stringify(storePayload),
        });

        if (storeRes.ok) {
          const storeData = await storeRes.json();
          const registeredStore = storeData.data || storePayload;
          setStores((prev) => [registeredStore, ...prev.filter((s) => s.slug !== finalStoreSlug)]);
        }
      } catch (storeErr) {
        console.warn("Could not register store via /api/stores:", storeErr);
      }
    }

    const endpoint = editingOffer ? `/api/offers?id=${encodeURIComponent(editingOffer.id)}` : "/api/offers";
    const method = editingOffer ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json", ...getAdminAuthHeaders() },
      body: JSON.stringify(submissionPayload),
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "Unable to save offer.");
      toast.error(payload.error || "Unable to save offer.");
      setIsSubmitting(false);
      return;
    }

    toast.success(editingOffer ? "Offer updated successfully" : "New offer created successfully");

    // Automatically sync logo to Brand Registry so all other deals & store cards inherit this logo
    if (cleanLogo && finalStoreSlug) {
      fetch(`/api/admin/brand-assets/${encodeURIComponent(finalStoreSlug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAdminAuthHeaders() },
        body: JSON.stringify({
          name: cleanStoreName,
          domain: `${finalStoreSlug}.com`,
          logoUrl: cleanLogo,
          source: cleanLogo.includes("cloudinary.com") ? "cloudinary" : "manual",
        }),
      }).catch((assetErr) => {
        console.warn("Could not sync brand asset from offer manager:", assetErr);
      });
    }

    await loadData();
    setOpen(false);
    setForm(initialForm);
    setEditingOffer(null);
    setIsCustomStore(false);
    affiliateEditedRef.current = false;
    setIsSubmitting(false);
  }

  function openDeleteModal(offer) {
    setDeleteTarget(offer);
  }

  function toggleOfferSelection(offerId) {
    setSelectedOfferIds((current) =>
      current.includes(offerId) ? current.filter((id) => id !== offerId) : [...current, offerId]
    );
  }

  function toggleSelectAll() {
    const visibleIds = paginatedOffers.map((offer) => offer.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedOfferIds.includes(id));
    if (allVisibleSelected) {
      setSelectedOfferIds((current) => current.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedOfferIds((current) => Array.from(new Set([...current, ...visibleIds])));
    }
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget && !selectedOfferIds.length) {
      return;
    }

    setIsDeleting(true);
    const idsToDelete = deleteTarget?.id === "__bulk__" ? selectedOfferIds : deleteTarget ? [deleteTarget.id] : selectedOfferIds;
    const responses = await Promise.all(idsToDelete.map((id) => fetch(`/api/offers/${id}`, { method: "DELETE" })));

    if (responses.some((response) => !response.ok)) {
      setIsDeleting(false);
      return;
    }

    setDeleteTarget(null);
    setSelectedOfferIds([]);
    setIsDeleting(false);
    await loadData();
  }

  // Helper to find store logo
  const storeLogoMap = useMemo(() => {
    return stores.reduce((acc, store) => {
      acc[store.slug] = store.logoImage;
      return acc;
    }, {});
  }, [stores]);

  // Compute offer expiration status
  const processedOffers = useMemo(() => {
    const now = new Date();
    return (offers || []).map((offer) => {
      let isExpired = offer?.status === "Expired";
      const rawExp = offer?.expiryDate || offer?.endDate;
      if (rawExp) {
        const expiry = new Date(rawExp);
        if (!isNaN(expiry.getTime())) {
          expiry.setHours(23, 59, 59, 999);
          if (now > expiry) {
            isExpired = true;
          }
        }
      }
      return {
        ...offer,
        isExpired,
        displayStatus: isExpired ? "Expired" : (offer?.status || "Active"),
      };
    });
  }, [offers]);

  // Filtered view based on tab and search query
  const filteredOffers = useMemo(() => {
    let list = processedOffers;
    if (activeFilterTab === "expired") {
      list = list.filter((o) => o.isExpired);
    } else if (activeFilterTab === "active") {
      list = list.filter((o) => !o.isExpired);
    } else if (activeFilterTab === "featured") {
      list = list.filter((o) => Boolean(o.isFeatured));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((o) =>
        (o.title && o.title.toLowerCase().includes(q)) ||
        (o.code && o.code.toLowerCase().includes(q)) ||
        (o.storeName && o.storeName.toLowerCase().includes(q)) ||
        (o.storeSlug && o.storeSlug.toLowerCase().includes(q)) ||
        (o.description && o.description.toLowerCase().includes(q))
      );
    }

    return list;
  }, [processedOffers, activeFilterTab, searchQuery]);

  // Sorted offers (by clicks if sortByClicks is active)
  const sortedOffers = useMemo(() => {
    if (!sortByClicks) return filteredOffers;
    return [...filteredOffers].sort((a, b) => {
      const aClicks = clickCounts[a.id] || 0;
      const bClicks = clickCounts[b.id] || 0;
      return bClicks - aClicks;
    });
  }, [filteredOffers, sortByClicks, clickCounts]);

  const totalOffers = sortedOffers.length;
  const totalPages = Math.max(1, Math.ceil(totalOffers / pageSize));
  const paginatedOffers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedOffers.slice(start, start + pageSize);
  }, [sortedOffers, currentPage, pageSize]);

  const expiredCount = processedOffers.filter((o) => o.isExpired).length;
  const featuredCount = processedOffers.filter((o) => Boolean(o.isFeatured)).length;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <CardTitle>Coupons & Deals Management</CardTitle>
                <a
                  href="/featured-deals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition"
                  title="View live /featured-deals page in a new tab"
                >
                  <span>Live /featured-deals</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <CardDescription>Manage verified promo codes, discount deals, featured campaigns, and redemption clicks.</CardDescription>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 p-0 cursor-pointer"
                onClick={loadData}
                aria-label="Refresh offers"
                title="Refresh Catalog Data"
              >
                <RefreshIcon />
              </Button>
              <Button
                type="button"
                onClick={handleOpenCreate}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 shadow-xs cursor-pointer"
              >
                + Add Coupon / Deal
              </Button>
            </div>
          </div>

          {/* Search Bar & Filter Controls Bar */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between pt-2">
            {/* Real-Time Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by title, coupon code, store name..."
                className="pl-9.5 pr-8 h-9.5 text-xs rounded-xl bg-zinc-50/80 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 text-xs cursor-pointer"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Tabs & Bulk Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-1 text-xs font-semibold border border-zinc-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => { setFilterTab("all"); setSortByClicks(false); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${filterTab === "all" && !sortByClicks ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
                >
                  All ({offers.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterTab("featured"); setSortByClicks(false); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${filterTab === "featured" && !sortByClicks ? "bg-amber-600 text-white shadow-2xs" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
                >
                  Featured ({featuredCount})
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterTab("active"); setSortByClicks(false); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${filterTab === "active" && !sortByClicks ? "bg-emerald-600 text-white shadow-2xs" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
                >
                  Active ({offers.length - expiredCount})
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterTab("expired"); setSortByClicks(false); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${filterTab === "expired" && !sortByClicks ? "bg-rose-600 text-white shadow-2xs" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
                >
                  Expired ({expiredCount})
                </button>
                <button
                  type="button"
                  onClick={() => { setSortByClicks((prev) => !prev); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                    sortByClicks
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                  title="Sort offers by user clicks and popularity"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Most Clicked</span>
                </button>
              </div>

              {selectedOfferIds.length ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-semibold h-8"
                    onClick={() => handleBulkToggleFeatured(true)}
                    title="Mark selected offers as featured"
                  >
                    ★ Feature ({selectedOfferIds.length})
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs font-semibold h-8"
                    onClick={() => handleBulkToggleFeatured(false)}
                    title="Remove featured status from selected offers"
                  >
                    Unfeature ({selectedOfferIds.length})
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold h-8"
                    onClick={() => setDeleteTarget({ id: "__bulk__", title: `${selectedOfferIds.length} selected offers` })}
                  >
                    Delete ({selectedOfferIds.length})
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="overflow-x-auto rounded-xl border border-zinc-200/80 dark:border-zinc-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50/80 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800">
                  <TableHead className="w-14">
                    <label className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 accent-emerald-600 cursor-pointer"
                        checked={paginatedOffers.length > 0 && paginatedOffers.every((offer) => selectedOfferIds.includes(offer.id))}
                        onChange={toggleSelectAll}
                        aria-label="Select all visible offers"
                      />
                    </label>
                  </TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Offer Title</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Promo Code / Tag</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Type</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Store</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Expiry Date</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Status</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Clicks</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOffers.map((offer) => {
                  const storeLogo = offer.storeLogo || offer.logoUrl || offer.imageUrl || offer.logo || storeLogoMap[offer.storeSlug];
                  const displayStatus = offer.displayStatus;

                  return (
                    <TableRow key={offer.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition border-b border-zinc-100 dark:border-zinc-800/60">
                      <TableCell>
                        <label className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 accent-emerald-600 cursor-pointer"
                            checked={selectedOfferIds.includes(offer.id)}
                            onChange={() => toggleOfferSelection(offer.id)}
                            aria-label={`Select ${offer.title}`}
                          />
                        </label>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-2xs">
                            {storeLogo ? (
                              <img src={storeLogo} alt={offer.storeName} className="h-6 w-6 object-contain" />
                            ) : (
                              <span className="text-xs font-black text-zinc-700 dark:text-zinc-300">{offer.storeName?.charAt(0) || "S"}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-bold text-zinc-900 dark:text-white text-xs truncate max-w-sm">{offer.title}</p>
                              {offer.isFeatured ? (
                                <span className="inline-flex items-center rounded-md bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">
                                  Featured #{offer.featuredPriority || 1}
                                </span>
                              ) : null}
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-xs">{offer.description || "Active promotion"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 inline-block">
                          {offer.code || "DEAL-ACTIVATED"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            offer.type === "Coupon"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          }`}
                        >
                          {offer.type || "Coupon"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-block rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                          {offer.storeName || offer.storeSlug || "General"}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        {offer.expiryDate || "Ongoing"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            displayStatus === "Expired"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-350 border border-rose-200 dark:border-rose-900"
                              : displayStatus === "Active"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : displayStatus === "Scheduled"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          {displayStatus}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                          <MousePointerClick className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{(clickCounts[offer.id] || 0).toLocaleString()}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={`h-8 px-2.5 text-xs font-semibold transition cursor-pointer ${
                              offer.isFeatured
                                ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                                : "text-zinc-500 hover:text-amber-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            }`}
                            onClick={() => handleToggleFeatured(offer)}
                            title={offer.isFeatured ? "Remove from Featured Deals" : "Mark as Featured Deal"}
                          >
                            {offer.isFeatured ? "Featured ★" : "Feature"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 hover:border-emerald-600 transition cursor-pointer"
                            onClick={() => handleOpenEdit(offer)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                            onClick={() => openDeleteModal(offer)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {!sortedOffers.length ? (
            <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 px-5 py-8 text-xs text-center text-zinc-500 dark:text-zinc-400">
              {searchQuery ? (
                <div>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">No offers matched "{searchQuery}"</p>
                  <p className="mt-1 text-zinc-500">Try adjusting your search terms or clearing the filter.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="mt-3 text-xs"
                  >
                    Clear Search
                  </Button>
                </div>
              ) : filterTab === "expired" ? (
                "No expired offers found."
              ) : (
                "No offers added yet. Use the button above to add coupons and deals."
              )}
            </div>
          ) : null}

          {/* Table Pagination Controls */}
          {totalOffers > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
              <div>
                Showing <span className="font-bold text-zinc-900 dark:text-white">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                <span className="font-bold text-zinc-900 dark:text-white">{Math.min(currentPage * pageSize, totalOffers)}</span> of{" "}
                <span className="font-bold text-zinc-900 dark:text-white">{totalOffers}</span> offers
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-3 text-xs gap-1 dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </Button>
                <div className="px-2 font-semibold text-zinc-700 dark:text-zinc-300">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 px-3 text-xs gap-1 dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Coupon Add / Edit Dialog (Redesigned with Sleek Dark Theme, Cloudinary Brand Logo & Live Preview) ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 text-white shadow-2xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900 shrink-0 pr-14">
            <div>
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                <span>{editingOffer ? "Edit Coupon / Deal" : "Add Coupon / Deal"}</span>
                {editingOffer && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {editingOffer.code || editingOffer.type || "Offer"}
                  </span>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                {editingOffer ? "Update discount parameters, brand assets, and merchandising status." : "Create a new coupon code or discount deal with brand logo & live preview."}
              </DialogDescription>
            </div>
          </div>

          {/* Form with Scrollable Body and Sticky Footer */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Section 1: Offer & Brand Identity */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2.5">
                  <Tag className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">1. Offer & Brand Identity</span>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-xs text-zinc-300 font-semibold sm:col-span-2">
                    <span>Title <span className="text-rose-400">*</span></span>
                    <Input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. 50% Off On All Orders | Special Festive Deal"
                      className="bg-zinc-800/90 border-zinc-700 text-white placeholder:text-zinc-500 h-9 text-xs"
                      required
                    />
                  </label>

                  <label className="grid gap-1.5 text-xs text-zinc-300 font-semibold">
                    <span className="flex items-center justify-between">
                      <span>Store / Brand <span className="text-rose-400">*</span></span>
                      {isCustomStore && (
                        <span className="text-[10px] text-emerald-400 font-bold">New Store Mode</span>
                      )}
                    </span>
                    <select
                      name="storeSlug"
                      value={isCustomStore ? "__other__" : form.storeSlug}
                      onChange={handleChange}
                      className="h-9 rounded-xl border border-zinc-700 bg-zinc-800/90 px-3 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer font-medium"
                      required={!isCustomStore}
                    >
                      <option value="">Select store / brand</option>
                      <option value="__other__" className="font-bold text-emerald-400 bg-zinc-900 py-1">
                        ➕ Other (Add New Store)
                      </option>
                      <optgroup label="── Registered Stores ──">
                        {stores.map((store) => (
                          <option key={store.slug} value={store.slug}>
                            {store.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-xs text-zinc-300 font-semibold">
                    <span>Category <span className="text-rose-400">*</span></span>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="h-9 rounded-xl border border-zinc-700 bg-zinc-800/90 px-3 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* New Store Registration Panel (when 'Other' is selected) */}
                  {isCustomStore && (
                    <div className="sm:col-span-2 rounded-xl border border-emerald-500/50 bg-emerald-950/30 p-4 space-y-3.5 shadow-inner">
                      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-emerald-900/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black">
                            +
                          </span>
                          <span className="text-xs font-bold text-emerald-300">
                            Register Brand-New Store
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Auto-syncs to Stores Directory
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomStore(false);
                            setForm((prev) => ({ ...prev, storeSlug: "", storeName: "" }));
                          }}
                          className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
                        >
                          ✕ Pick Existing Store
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-1.5 text-xs text-zinc-300 font-semibold">
                          <span className="flex items-center justify-between">
                            <span>New Store Name <span className="text-rose-400">*</span></span>
                            <span className="text-[10px] text-zinc-400">e.g. Zara, Sephora, Croma</span>
                          </span>
                          <Input
                            name="customStoreName"
                            value={form.storeName}
                            onChange={(e) => {
                              const name = e.target.value;
                              const autoSlug = name
                                .toLowerCase()
                                .trim()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-+|-+$/g, "");
                              setForm((prev) => ({
                                ...prev,
                                storeName: name,
                                storeSlug: autoSlug,
                              }));
                            }}
                            placeholder="Enter store name"
                            className="bg-zinc-800/90 border-zinc-700 text-white placeholder:text-zinc-500 text-xs h-9 focus:border-emerald-500"
                            required={isCustomStore}
                          />
                        </label>

                        <label className="grid gap-1.5 text-xs text-zinc-300 font-semibold">
                          <span className="flex items-center justify-between">
                            <span>Store Slug (Directory URL identifier) <span className="text-rose-400">*</span></span>
                            <span className="text-[10px] text-zinc-400">Auto-slugified</span>
                          </span>
                          <div className="flex items-center rounded-xl border border-zinc-700 bg-zinc-800/90 px-3 text-xs text-white">
                            <span className="text-zinc-500 text-[11px] font-mono shrink-0">/store/</span>
                            <input
                              type="text"
                              name="customStoreSlug"
                              value={form.storeSlug}
                              onChange={(e) => {
                                const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
                                setForm((prev) => ({ ...prev, storeSlug: slug }));
                              }}
                              placeholder="store-slug"
                              className="w-full bg-transparent py-2 pl-1 text-xs text-emerald-400 font-mono outline-none"
                              required={isCustomStore}
                            />
                          </div>
                        </label>
                      </div>

                      <div className="flex items-start gap-2 text-[11px] text-emerald-300/90 bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-900/60">
                        <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          This store will auto-publish into the website&apos;s <strong>Stores Directory (/stores)</strong> with your selected <strong>Category</strong>, entered <strong>Store Name</strong>, and <strong>Cloudinary Logo URL</strong> below.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Brand Logo URL with Live Preview & Cloudinary Support */}
                  <div className="sm:col-span-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-bold text-zinc-200">Brand Logo URL (Cloudinary / Direct Image Link)</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Cloudinary Supported
                        </span>
                      </div>
                      {isCustomStore ? (
                        <span className="text-[11px] text-emerald-400 font-semibold">
                          ★ Saved as Store Directory Logo
                        </span>
                      ) : (
                        form.storeSlug && stores.find(s => s.slug === form.storeSlug)?.logo && form.storeLogo !== stores.find(s => s.slug === form.storeSlug)?.logo && (
                          <button
                            type="button"
                            onClick={() => {
                              const s = stores.find(st => st.slug === form.storeSlug);
                              if (s?.logo) setForm(prev => ({ ...prev, storeLogo: s.logo }));
                            }}
                            className="text-[11px] text-emerald-400 hover:underline font-semibold cursor-pointer"
                          >
                            Use Store Default Logo
                          </button>
                        )
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Live Logo Preview Box */}
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-white p-1.5 overflow-hidden shadow-xs relative">
                        {form.storeLogo ? (
                          <img
                            src={form.storeLogo}
                            alt={form.storeName || "Brand Logo"}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              // @ts-ignore
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-zinc-400">
                            <ImageIcon className="h-4 w-4 text-zinc-400" />
                            <span className="text-[9px] font-bold text-zinc-500">No Logo</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <input
                          type="file"
                          ref={logoFileInputRef}
                          className="hidden"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoFileUpload(file);
                            e.target.value = "";
                          }}
                        />

                        <div className="flex items-center gap-2">
                          <Input
                            name="storeLogo"
                            value={form.storeLogo}
                            onChange={handleChange}
                            placeholder="https://res.cloudinary.com/... or https://..."
                            className="bg-zinc-800/90 border-zinc-700 text-white placeholder:text-zinc-500 text-xs h-9 flex-1 font-mono text-[11px]"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUploadingLogo}
                            onClick={() => logoFileInputRef.current?.click()}
                            className="h-9 px-3 text-xs font-bold border-zinc-700 bg-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-700 shrink-0"
                          >
                            <Upload className={`h-3.5 w-3.5 mr-1 ${isUploadingLogo ? "animate-bounce text-emerald-400" : ""}`} />
                            {isUploadingLogo ? "Uploading..." : "Upload File"}
                          </Button>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span>Paste Cloudinary URL or click Upload File (auto-saved to Cloudinary)</span>
                          {form.storeLogo && (
                            <button
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, storeLogo: "" }))}
                              className="text-rose-400 hover:underline text-[10px] font-semibold cursor-pointer"
                            >
                              Clear Logo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <label className="grid gap-1.5 text-xs text-zinc-300 font-semibold sm:col-span-2">
                    <span>Description</span>
                    <textarea
                      name="description"
                      rows={2}
                      value={form.description}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-800/90 px-3.5 py-2 text-xs text-white outline-none placeholder:text-zinc-500 focus:border-emerald-500 resize-none"
                      placeholder="Brief summary of the offer, e.g. Valid on all products across app and web."
                    />
                  </label>
                </div>
              </div>

              {/* Section 2: Codes, Discount & Redemption Link */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2.5">
                  <Tag className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">2. Coupon Codes & Redemption Link</span>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-xs text-zinc-300 font-semibold">
                    <span>Offer Type</span>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="h-9 rounded-xl border border-zinc-700 bg-zinc-800/90 px-3 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option>Coupon</option>
                      <option>Deal</option>
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-xs text-zinc-300 font-semibold">
                    <span>{form.type === "Deal" ? "Deal Code (Optional)" : "Coupon Code"}</span>
                    <Input
                      name="code"
                      value={form.code}
                      onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder={form.type === "Deal" ? "Optional for direct deals" : "e.g. SAVE50"}
                      className="bg-zinc-800/90 border-zinc-700 text-emerald-400 font-mono font-bold text-xs h-9 tracking-wider"
                    />
                  </label>

                  <label className="grid gap-1.5 text-xs text-zinc-300 font-semibold">
                    <span>Discount Text</span>
                    <Input
                      name="discount"
                      value={form.discount}
                      onChange={handleChange}
                      placeholder="e.g. 50% OFF, Flat ₹200 Off"
                      className="bg-zinc-800/90 border-zinc-700 text-white placeholder:text-zinc-500 text-xs h-9"
                    />
                  </label>

                  <label className="grid gap-1.5 text-xs text-zinc-300 font-semibold">
                    <span>Expiry Date</span>
                    <Input
                      name="expiryDate"
                      type="date"
                      value={form.expiryDate}
                      onChange={handleChange}
                      className="bg-zinc-800/90 border-zinc-700 text-white text-xs h-9"
                    />
                  </label>

                  <label className="grid gap-1.5 text-xs text-zinc-300 font-semibold sm:col-span-2">
                    <span>Affiliate / Merchant Deep Link</span>
                    <Input
                      name="affiliateLink"
                      value={form.affiliateLink}
                      onChange={handleChange}
                      placeholder="https://... (auto-filled from store or custom tracking URL)"
                      className="bg-zinc-800/90 border-zinc-700 text-white placeholder:text-zinc-500 text-xs h-9 font-mono"
                    />
                  </label>
                </div>
              </div>

              {/* Section 3: Lifecycle & Status */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">3. Status & Terms</span>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-xs text-zinc-300 font-semibold">
                    <span>Status</span>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="h-9 rounded-xl border border-zinc-700 bg-zinc-800/90 px-3 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option>Active</option>
                      <option>Scheduled</option>
                      <option>Ending soon</option>
                      <option>Expired</option>
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-xs text-zinc-300 font-semibold">
                    <span>Source</span>
                    <select
                      name="source"
                      value={form.source}
                      onChange={handleChange}
                      className="h-9 rounded-xl border border-zinc-700 bg-zinc-800/90 px-3 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option>Manual</option>
                      <option>Network</option>
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-xs text-zinc-300 font-semibold sm:col-span-2">
                    <span>Terms & Conditions</span>
                    <Input
                      name="terms"
                      value={form.terms}
                      onChange={handleChange}
                      placeholder="Standard merchant terms apply. Valid on app and web."
                      className="bg-zinc-800/90 border-zinc-700 text-white placeholder:text-zinc-500 text-xs h-9"
                    />
                  </label>
                </div>
              </div>

              {/* Section 4: Featured Merchandising Controls */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Featured Deal Merchandising</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                        /featured-deals
                      </span>
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Promote directly to the permanent Featured Deals hub with priority ranking.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={Boolean(form.isFeatured)}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-zinc-700 accent-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-amber-300">
                      Promote to Featured Deals
                    </span>
                  </label>
                </div>

                {form.isFeatured && (
                  <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-amber-500/20">
                    <label className="grid gap-1 text-[11px] font-semibold text-zinc-300">
                      Display Priority (1 = Top priority)
                      <Input
                        type="number"
                        name="featuredPriority"
                        value={form.featuredPriority}
                        onChange={handleChange}
                        min={1}
                        max={100}
                        className="bg-zinc-800/90 border-zinc-700 text-white text-xs h-9"
                      />
                    </label>
                    <label className="grid gap-1 text-[11px] font-semibold text-zinc-300">
                      Campaign Source
                      <select
                        name="campaignSource"
                        value={form.campaignSource}
                        onChange={handleChange}
                        className="h-9 rounded-xl border border-zinc-700 bg-zinc-800/90 px-3 text-xs text-white outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="analytics_clouds">Analytics Clouds Partner Campaign</option>
                        <option value="manual">Manual Admin Feature</option>
                        <option value="partner">Brand Network Partner</option>
                      </select>
                    </label>
                    <label className="grid gap-1 text-[11px] font-semibold text-zinc-300">
                      Featured Badge
                      <select
                        name="badge"
                        value={form.badge}
                        onChange={handleChange}
                        className="h-9 rounded-xl border border-zinc-700 bg-zinc-800/90 px-3 text-xs text-white outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="Best Saving">Best Saving</option>
                        <option value="Featured Partner">Featured Partner</option>
                        <option value="Popular Travel Deal">Popular Travel Deal</option>
                        <option value="Verified Offer">Verified Offer</option>
                        <option value="India Eligible">India Eligible</option>
                      </select>
                    </label>
                    <label className="grid gap-1 text-[11px] font-semibold text-zinc-300">
                      Target Region
                      <select
                        name="targetCountry"
                        value={form.targetCountry}
                        onChange={handleChange}
                        className="h-9 rounded-xl border border-zinc-700 bg-zinc-800/90 px-3 text-xs text-white outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="India Eligible">India Eligible</option>
                        <option value="Global">Worldwide / Global</option>
                        <option value="US Eligible">US Eligible</option>
                      </select>
                    </label>
                  </div>
                )}
              </div>

              {error ? <p className="text-xs text-rose-400 font-medium">{error}</p> : null}
            </div>

            {/* Modal Footer - Fixed Sticky Bottom Bar */}
            <div className="shrink-0 flex items-center justify-between border-t border-zinc-800 bg-zinc-900 px-6 py-3.5">
              <div className="text-xs text-zinc-400 font-medium truncate max-w-[200px]">
                {editingOffer ? `ID: ${editingOffer.id}` : "New catalog entry"}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 text-xs font-semibold h-9 px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-5 shadow-xs transition cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Saving...
                    </span>
                  ) : editingOffer ? (
                    "Save Changes"
                  ) : (
                    "Create Offer"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <BulkCouponImportDialog
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        stores={stores}
        offers={offers}
        onImported={loadData}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title={deleteTarget?.id === "__bulk__" ? "Delete selected offers" : "Delete offer"}
        description={
          deleteTarget?.id === "__bulk__"
            ? `Delete ${selectedOfferIds.length} selected offers from the catalog?`
            : deleteTarget
              ? `Delete "${deleteTarget.title}" from the catalog?`
              : ""
        }
        confirmLabel={deleteTarget?.id === "__bulk__" ? "Delete Selected" : "Delete Offer"}
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirmed}
        isSubmitting={isDeleting}
      />
    </>
  );
}
