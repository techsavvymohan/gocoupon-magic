import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "@/admin/compat";
import { ConfirmModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, MousePointerClick, TrendingUp, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { getAdminAuthHeaders } from "@/context/AdminAuthContext";
import BulkCouponImportDialog from "./BulkCouponImportDialog";

const initialForm = {
  title: "",
  description: "",
  type: "Coupon",
  storeSlug: "",
  storeName: "",
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
  const [filterTab, setFilterTab] = useState("all");
  const activeFilterTab = filterFromUrl || filterTab;

  const [offers, setOffers] = useState([]);
  const [stores, setStores] = useState([]);
  const [clickCounts, setClickCounts] = useState({});
  const [sortByClicks, setSortByClicks] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
    setStores(storesPayload.data || []);
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
        setStores(storesPayload.data || []);
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
    setForm({
      title: offer.title || "",
      description: offer.description || "",
      type: offer.type || "Coupon",
      storeSlug: offer.storeSlug || "",
      storeName: offer.storeName || "",
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
      const matchedStore = stores.find((store) => store.slug === value);
      nextState.storeName = matchedStore?.name || "";
      if (!affiliateEditedRef.current && matchedStore?.affiliateLink) {
        nextState.affiliateLink = matchedStore.affiliateLink;
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

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const endpoint = editingOffer ? `/api/offers?id=${encodeURIComponent(editingOffer.id)}` : "/api/offers";
    const method = editingOffer ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json", ...getAdminAuthHeaders() },
      body: JSON.stringify(form),
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "Unable to save offer.");
      toast.error(payload.error || "Unable to save offer.");
      setIsSubmitting(false);
      return;
    }

    toast.success(editingOffer ? "Offer updated successfully" : "New offer created successfully");
    await loadData();
    setOpen(false);
    setForm(initialForm);
    setEditingOffer(null);
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
                  const storeLogo = storeLogoMap[offer.storeSlug];
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

      {/* ── Coupon Add / Edit Dialog (Redesigned with Fixed Header, Scrollable Body, Sticky Footer) ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[calc(100dvh-3rem)] flex flex-col p-0 overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-2xl">
          {/* Modal Header - Fixed Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800 shrink-0 bg-zinc-50/80 dark:bg-zinc-850">
            <div className="pr-6">
              <DialogTitle className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>{editingOffer ? "Edit Coupon / Deal" : "Add Coupon / Deal"}</span>
                {editingOffer && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {editingOffer.code || editingOffer.type || "Offer"}
                  </span>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {editingOffer ? "Update discount parameters, store link, and promotion status." : "Create a new coupon code or discount deal in the database catalog."}
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form with Scrollable Body and Sticky Footer */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold md:col-span-2">
                  Title
                  <Input name="title" value={form.title} onChange={handleChange} placeholder="20% off premium supplements" className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white" required />
                </label>
                <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold md:col-span-2">
                  Description
                  <textarea
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white outline-none transition placeholder:text-zinc-400 focus:border-emerald-600"
                    placeholder="Short description for the offer."
                  />
                </label>
                <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
                  Type
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option>Coupon</option>
                    <option>Deal</option>
                  </select>
                </label>
                <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
                  Store
                  <select
                    name="storeSlug"
                    value={form.storeSlug}
                    onChange={handleChange}
                    className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="">Select store</option>
                    {stores.map((store) => (
                      <option key={store.slug} value={store.slug}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
                  Affiliate Link
                  <Input
                    name="affiliateLink"
                    value={form.affiliateLink}
                    onChange={handleChange}
                    placeholder="Auto-filled from selected store, or paste custom URL"
                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs"
                  />
                </label>
                <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
                  Expiry Date
                  <Input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs" />
                </label>
                <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
                  Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option>Active</option>
                    <option>Scheduled</option>
                    <option>Ending soon</option>
                    <option>Expired</option>
                  </select>
                </label>
                <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
                  Source
                  <select
                    name="source"
                    value={form.source}
                    onChange={handleChange}
                    className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option>Manual</option>
                    <option>Network</option>
                  </select>
                </label>
                <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold md:col-span-2">
                  {form.type === "Deal" ? "Deal Code (Optional)" : "Coupon Code"}
                  <Input
                    name="code"
                    value={form.code}
                    onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder={form.type === "Deal" ? "Optional for direct deals" : "SAVE20"}
                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono font-bold"
                  />
                </label>

                {/* ── Featured Merchandising Controls ── */}
                <div className="md:col-span-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <span>Featured Deal Merchandising</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold">
                          /featured-deals
                        </span>
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Control promotion to the permanent global featured deals hub.
                      </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={Boolean(form.isFeatured)}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 accent-amber-600 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">
                        Promote to Featured Deals
                      </span>
                    </label>
                  </div>

                  {form.isFeatured && (
                    <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-amber-500/20">
                      <label className="grid gap-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                        Display Priority (1 = Top priority)
                        <Input
                          type="number"
                          name="featuredPriority"
                          value={form.featuredPriority}
                          onChange={handleChange}
                          min={1}
                          max={100}
                          className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs h-9"
                        />
                      </label>
                      <label className="grid gap-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                        Campaign Source
                        <select
                          name="campaignSource"
                          value={form.campaignSource}
                          onChange={handleChange}
                          className="h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-600"
                        >
                          <option value="analytics_clouds">Analytics Clouds Partner Campaign</option>
                          <option value="manual">Manual Admin Feature</option>
                          <option value="partner">Brand Network Partner</option>
                        </select>
                      </label>
                      <label className="grid gap-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                        Featured Badge
                        <select
                          name="badge"
                          value={form.badge}
                          onChange={handleChange}
                          className="h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-600"
                        >
                          <option value="Best Saving">Best Saving</option>
                          <option value="Featured Partner">Featured Partner</option>
                          <option value="Popular Travel Deal">Popular Travel Deal</option>
                          <option value="Verified Offer">Verified Offer</option>
                          <option value="India Eligible">India Eligible</option>
                        </select>
                      </label>
                      <label className="grid gap-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                        Target Region
                        <select
                          name="targetCountry"
                          value={form.targetCountry}
                          onChange={handleChange}
                          className="h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-600"
                        >
                          <option value="India Eligible">India Eligible</option>
                          <option value="Global">Worldwide / Global</option>
                          <option value="US Eligible">US Eligible</option>
                        </select>
                      </label>
                    </div>
                  )}
                </div>
                {error ? <p className="text-xs text-rose-600 md:col-span-2 font-medium">{error}</p> : null}
              </div>
            </div>

            {/* Modal Footer - Fixed Sticky Bottom Bar */}
            <div className="shrink-0 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 px-6 py-3.5">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[200px]">
                {editingOffer ? `ID: ${editingOffer.id}` : "New catalog entry"}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-xs font-semibold h-9 px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-5 shadow-xs transition cursor-pointer"
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
