import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "@/admin/compat";
import { ConfirmModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import BulkCouponImportDialog from "./BulkCouponImportDialog";

const initialForm = {
  title: "",
  description: "",
  type: "Coupon",
  storeSlug: "",
  storeName: "",
  affiliateLink: "",
  source: "Manual",
  expiryDate: "",
  status: "Active",
  code: "",
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
    const [offersResponse, storesResponse] = await Promise.all([
      fetch("/api/offers?includeExpired=true", { cache: "no-store" }),
      fetch("/api/stores", { cache: "no-store" }),
    ]);

    const [offersPayload, storesPayload] = await Promise.all([offersResponse.json(), storesResponse.json()]);
    setOffers(offersPayload.data || []);
    setStores(storesPayload.data || []);
    setSelectedOfferIds((current) => current.filter((id) => (offersPayload.data || []).some((offer) => offer.id === id)));
  }

  useEffect(() => {
    let active = true;

    async function hydrateData() {
      const [offersResponse, storesResponse] = await Promise.all([
        fetch("/api/offers?includeExpired=true", { cache: "no-store" }),
        fetch("/api/stores", { cache: "no-store" }),
      ]);

      const [offersPayload, storesPayload] = await Promise.all([offersResponse.json(), storesResponse.json()]);

      if (active) {
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
    setForm({
      title: offer.title,
      description: offer.description || "",
      type: offer.type,
      storeSlug: offer.storeSlug,
      storeName: offer.storeName,
      affiliateLink: offer.affiliateLink || "",
      source: offer.source,
      expiryDate: offer.expiryDate,
      status: offer.status,
      code: offer.code || "",
    });
    affiliateEditedRef.current = Boolean(offer.affiliateLink);
    setError("");
    setOpen(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const nextState = { ...form, [name]: value };

    if (name === "storeSlug") {
      const matchedStore = stores.find((store) => store.slug === value);
      nextState.storeName = matchedStore?.name || "";
      if (!affiliateEditedRef.current) {
        nextState.affiliateLink = matchedStore?.affiliateLink || "";
      }
    }

    if (name === "affiliateLink") {
      affiliateEditedRef.current = value.trim().length > 0;
    }

    setForm(nextState);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const endpoint = editingOffer ? `/api/offers/${editingOffer.id}` : "/api/offers";
    const method = editingOffer ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "Unable to save offer.");
      setIsSubmitting(false);
      return;
    }

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
    setSelectedOfferIds((current) => (current.length === filteredOffers.length ? [] : filteredOffers.map((offer) => offer.id)));
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

  // Filtered view based on tab
  const filteredOffers = activeFilterTab === "expired"
    ? processedOffers.filter((o) => o.isExpired)
    : activeFilterTab === "active"
    ? processedOffers.filter((o) => !o.isExpired)
    : processedOffers;

  const expiredCount = processedOffers.filter((o) => o.isExpired).length;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Coupons & Deals Management</CardTitle>
            <CardDescription>Manage verified promo codes, discount deals, and store offer coverage.</CardDescription>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Filter Tabs */}
            <div className="flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 text-xs font-semibold border border-zinc-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${filterTab === "all" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
              >
                All ({offers.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("active")}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${filterTab === "active" ? "bg-emerald-600 text-white shadow-2xs" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
              >
                Active ({offers.length - expiredCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("expired")}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${filterTab === "expired" ? "bg-rose-600 text-white shadow-2xs" : "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"}`}
              >
                Expired ({expiredCount})
              </button>
            </div>

            {selectedOfferIds.length ? (
              <Button type="button" variant="outline" className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-rose-600 dark:text-rose-400" onClick={() => setDeleteTarget({ id: "__bulk__", title: `${selectedOfferIds.length} selected offers` })}>
                Delete Selected ({selectedOfferIds.length})
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-0"
              onClick={loadData}
              aria-label="Refresh offers"
            >
              <RefreshIcon />
            </Button>
            <Button type="button" onClick={handleOpenCreate} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 shadow-xs">
              Add Coupon / Deal
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/80 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800">
                <TableHead className="w-14">
                  <label className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 accent-emerald-600 cursor-pointer"
                      checked={filteredOffers.length > 0 && selectedOfferIds.length === filteredOffers.length}
                      onChange={toggleSelectAll}
                      aria-label="Select all offers"
                    />
                  </label>
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Offer Title</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Promo Code / Tag</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Type</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Store</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Expiry Date</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Status</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOffers.map((offer) => {
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
                          <p className="font-bold text-zinc-900 dark:text-white text-xs truncate max-w-sm">{offer.title}</p>
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 hover:border-emerald-600 transition"
                          onClick={() => handleOpenEdit(offer)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
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

          {!filteredOffers.length ? (
            <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 px-5 py-6 text-xs text-center text-zinc-500 dark:text-zinc-400">
              {filterTab === "expired" ? "No expired offers found." : "No offers added yet. Use the button above to add coupons and deals."}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-white">{editingOffer ? "Edit Coupon / Deal" : "Add Coupon / Deal"}</DialogTitle>
            <DialogDescription className="text-zinc-600 dark:text-zinc-400">Create or update coupon codes and discount deals in the database catalog.</DialogDescription>
          </DialogHeader>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold md:col-span-2">
              Title
              <Input name="title" value={form.title} onChange={handleChange} placeholder="20% off premium supplements" className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white" />
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
                className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-600"
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
                className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-600"
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
                className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </label>
            <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
              Expiry Date
              <Input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white" />
            </label>
            <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
              Status
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-600"
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
                className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-600"
              >
                <option>Manual</option>
                <option>Network</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold md:col-span-2">
              {form.type === "Deal" ? "Deal Code Optional" : "Coupon Code"}
              <Input name="code" value={form.code} onChange={handleChange} placeholder={form.type === "Deal" ? "Optional for direct deals" : "SAVE20"} className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono" />
            </label>
            {error ? <p className="text-xs text-rose-600 md:col-span-2">{error}</p> : null}
            <div className="flex gap-3 md:col-span-2 md:justify-end pt-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                {isSubmitting ? "Saving..." : editingOffer ? "Update Coupon / Deal" : "Save Coupon / Deal"}
              </Button>
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
