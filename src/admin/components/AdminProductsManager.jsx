import { Image } from "@/admin/compat";
import { useEffect, useMemo, useState } from "react";
import { ConfirmModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const initialForm = {
  title: "",
  description: "",
  image: "",
  price: "",
  originalPrice: "",
  ctaLabel: "View Product",
  status: "Active",
  storeSlug: "",
  storeName: "",
};

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" className="stroke-current opacity-25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" className="stroke-current" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function AdminProductsManager() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStoreFilter, setSelectedStoreFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");

  const visibleProducts = useMemo(() => {
    if (selectedStoreFilter === "all") {
      return products;
    }
    return products.filter((product) => product.storeSlug === selectedStoreFilter);
  }, [products, selectedStoreFilter]);

  async function loadData() {
    const [productsResponse, storesResponse] = await Promise.all([
      fetch("/api/products", { cache: "no-store" }),
      fetch("/api/stores", { cache: "no-store" }),
    ]);

    const [productsPayload, storesPayload] = await Promise.all([productsResponse.json(), storesResponse.json()]);
    setProducts(productsPayload.data || []);
    setStores(storesPayload.data || []);
  }

  useEffect(() => {
    let active = true;

    async function hydrateData() {
      const [productsResponse, storesResponse] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/stores", { cache: "no-store" }),
      ]);

      const [productsPayload, storesPayload] = await Promise.all([productsResponse.json(), storesResponse.json()]);

      if (active) {
        setProducts(productsPayload.data || []);
        setStores(storesPayload.data || []);
      }
    }

    hydrateData();

    return () => {
      active = false;
    };
  }, []);

  function handleOpenCreate() {
    setEditingProduct(null);
    setForm(initialForm);
    setError("");
    setOpen(true);
  }

  function handleOpenEdit(product) {
    setEditingProduct(product);
    setForm({
      title: product.title,
      description: product.description || "",
      image: product.image || "",
      price: String(product.price ?? ""),
      originalPrice: product.originalPrice == null ? "" : String(product.originalPrice),
      ctaLabel: product.ctaLabel || "View Product",
      status: product.status || "Active",
      storeSlug: product.storeSlug,
      storeName: product.storeName,
    });
    setError("");
    setOpen(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const nextState = { ...form, [name]: value };

    if (name === "storeSlug") {
      const matchedStore = stores.find((store) => store.slug === value);
      nextState.storeName = matchedStore?.name || "";
    }

    setForm(nextState);
  }

  function validateImageFile(file) {
    if (!file) return "Please choose a product image.";
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return "Product image must be PNG, JPG, WEBP, or SVG.";
    if (file.size > MAX_IMAGE_SIZE) return "Product image must be 2MB or smaller.";
    return null;
  }

  async function handleImageSelection(file) {
    const validationMessage = validateImageFile(file);

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setIsUploadingImage(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "slug",
        `${form.storeSlug || "product"}-${form.title || file.name}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );

      const response = await fetch("/api/uploads/product-image", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to upload product image.");
      }

      setForm((current) => ({
        ...current,
        image: payload.data.secureUrl,
      }));
    } catch (uploadError) {
      setError(uploadError.message || "Unable to upload product image.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const endpoint = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
    const method = editingProduct ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "Unable to save product.");
      setIsSubmitting(false);
      return;
    }

    await loadData();
    setOpen(false);
    setForm(initialForm);
    setEditingProduct(null);
    setIsSubmitting(false);
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const response = await fetch(`/api/products/${deleteTarget.id}`, { method: "DELETE" });

    if (!response.ok) {
      setIsDeleting(false);
      return;
    }

    setDeleteTarget(null);
    setIsDeleting(false);
    await loadData();
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Products Management</CardTitle>
            <CardDescription>Manage store-linked products and beauty items rendered on store pages.</CardDescription>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={selectedStoreFilter}
              onChange={(e) => setSelectedStoreFilter(e.target.value)}
              className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none shadow-2xs"
            >
              <option value="all">All Store Catalogs</option>
              {stores.map((store) => (
                <option key={store.slug} value={store.slug}>
                  {store.name}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-0"
              onClick={loadData}
              aria-label="Refresh products"
            >
              <RefreshIcon />
            </Button>
            <Button type="button" onClick={handleOpenCreate} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 shadow-xs">
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/80 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800">
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Product Title</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Store</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Price</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Status</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition border-b border-zinc-100 dark:border-zinc-800/60">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-2xs">
                        {product.image ? (
                          <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-black text-zinc-600 dark:text-zinc-400">{product.title?.charAt(0) || "P"}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-900 dark:text-white text-xs truncate">{product.title}</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-xs">{product.description || "No description set"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-block rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {product.storeName || product.storeSlug || "General"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {product.originalPrice ? (
                      <div className="flex items-baseline gap-1.5 font-mono text-xs">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">${product.price}</span>
                        <span className="text-zinc-400 dark:text-zinc-500 line-through text-[11px]">${product.originalPrice}</span>
                      </div>
                    ) : (
                      <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">${product.price || "0.00"}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        product.status === "Active"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : product.status === "Draft"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                      }`}
                    >
                      {product.status || "Active"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 hover:border-emerald-600 transition"
                        onClick={() => handleOpenEdit(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                        onClick={() => setDeleteTarget(product)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!visibleProducts.length ? (
            <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 px-5 py-6 text-xs text-center text-zinc-500 dark:text-zinc-400">
              No products found. Add products and assign them to stores from the admin panel.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-white">{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription className="text-zinc-600 dark:text-zinc-400">Create store-linked products that appear after offers on public store pages.</DialogDescription>
          </DialogHeader>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold md:col-span-2">
              Product Title
              <Input name="title" value={form.title} onChange={handleChange} placeholder="Nike Air Max 2026" className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white" />
            </label>
            <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold md:col-span-2">
              Description
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white outline-none transition placeholder:text-zinc-400 focus:border-emerald-600"
                placeholder="Short product description for the store page."
              />
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
              Status
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-600"
              >
                <option>Active</option>
                <option>Draft</option>
                <option>Out of stock</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
              Price ($)
              <Input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="99.99" className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white" />
            </label>
            <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
              Original Price ($)
              <Input name="originalPrice" type="number" min="0" step="0.01" value={form.originalPrice} onChange={handleChange} placeholder="129.99" className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white" />
            </label>
            <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold md:col-span-2">
              Product Image
              <div className="grid gap-3">
                {form.image ? (
                  <div className="relative h-40 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                    <img src={form.image} alt="Product preview" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-500 dark:text-zinc-400">
                    No product image uploaded yet.
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer">
                    <input
                      type="file"
                      accept={ACCEPTED_IMAGE_TYPES.join(",")}
                      className="hidden"
                      onChange={(event) => handleImageSelection(event.target.files?.[0])}
                    />
                    <span className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-4 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition hover:bg-zinc-200 dark:hover:bg-zinc-700">
                      {isUploadingImage ? "Uploading..." : "Upload Cloudinary Image"}
                    </span>
                  </label>
                  {form.image ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs"
                      onClick={() => setForm((current) => ({ ...current, image: "" }))}
                      disabled={isUploadingImage}
                    >
                      Remove Image
                    </Button>
                  ) : null}
                </div>
                <Input name="image" value={form.image} onChange={handleChange} placeholder="Or paste image URL manually" className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white" />
              </div>
            </label>
            <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold md:col-span-2">
              CTA Label
              <Input name="ctaLabel" value={form.ctaLabel} onChange={handleChange} placeholder="View Product" className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white" />
            </label>
            {error ? <p className="text-xs text-rose-600 md:col-span-2">{error}</p> : null}
            <div className="flex gap-3 md:col-span-2 md:justify-end pt-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploadingImage} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" leadingIcon={isSubmitting ? <Spinner /> : null}>
                {isSubmitting ? "Saving Product..." : editingProduct ? "Update Product" : "Save Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Delete product"
        description={deleteTarget ? `Delete "${deleteTarget.title}" from the catalog?` : ""}
        confirmLabel="Delete Product"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirmed}
        isSubmitting={isDeleting}
      />
    </>
  );
}
