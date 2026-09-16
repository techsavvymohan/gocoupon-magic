"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/AppModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, useDialogA11yIds } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and URL-friendly."),
  description: z.string().trim().max(180, "Description must stay under 180 characters.").optional().or(z.literal("")),
});

const defaultValues = {
  name: "",
  slug: "",
  description: "",
};

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

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [isHydrating, setIsHydrating] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const slugEditedRef = useRef(false);
  const { titleId, descriptionId } = useDialogA11yIds();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  const watchedName = watch("name");
  const watchedSlug = watch("slug");
  const watchedDescription = watch("description");

  const categoryStoreCounts = useMemo(
    () =>
      stores.reduce((accumulator, store) => {
        const key = store.categorySlug || slugify(store.category || "");
        accumulator[key] = (accumulator[key] || 0) + 1;
        return accumulator;
      }, {}),
    [stores]
  );

  async function loadData(showRefreshState = false) {
    if (showRefreshState) {
      setIsRefreshing(true);
    } else {
      setIsHydrating(true);
    }

    try {
      const [categoriesResponse, storesResponse] = await Promise.all([
        fetch("/api/categories", { cache: "no-store" }),
        fetch("/api/stores", { cache: "no-store" }),
      ]);
      const [categoriesPayload, storesPayload] = await Promise.all([categoriesResponse.json(), storesResponse.json()]);

      setCategories(categoriesPayload.data || []);
      setStores(storesPayload.data || []);
    } finally {
      setIsHydrating(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!slugEditedRef.current) {
      setValue("slug", slugify(watchedName || ""), { shouldValidate: true });
    }
  }, [setValue, watchedName]);

  function openCreateModal() {
    slugEditedRef.current = false;
    setEditingCategory(null);
    reset(defaultValues);
    setOpen(true);
  }

  function openEditModal(category) {
    slugEditedRef.current = false;
    setEditingCategory(category);
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
    });
    setOpen(true);
  }

  async function submitCategory(values) {
    const endpoint = editingCategory ? `/api/categories/${editingCategory.slug}` : "/api/categories";
    const method = editingCategory ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await response.json();

    if (!response.ok) {
      toast.error(payload.error || "Unable to save category.");
      return;
    }

    await loadData();
    setOpen(false);
    setEditingCategory(null);
    slugEditedRef.current = false;
    reset(defaultValues);
    toast.success(editingCategory ? "Category updated." : "Category created.");
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/categories/${deleteTarget.slug}`, { method: "DELETE" });
      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error || "Unable to delete category.");
        return;
      }

      await loadData();
      setDeleteTarget(null);
      toast.success("Category deleted.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Categories Management</CardTitle>
            <CardDescription>Manage store taxonomy, categories, and URL slugs for catalog routing.</CardDescription>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-0"
              onClick={() => loadData(true)}
              aria-label="Refresh categories"
              disabled={isRefreshing}
            >
              <RefreshIcon />
            </Button>
            <Button type="button" onClick={openCreateModal} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 shadow-xs">
              + Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50/80 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800">
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Category</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Slug</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Description</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Linked Stores</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.slug} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition border-b border-zinc-100 dark:border-zinc-800/60">
                    <TableCell>
                      <p className="font-bold text-zinc-900 dark:text-white text-xs">{category.name}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 inline-block">
                        /{category.slug}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[320px] text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {category.description || "No description set"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-block rounded-md bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700">
                        {category.storeCount || 0} stores
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition cursor-pointer"
                          onClick={() => openEditModal(category)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                          onClick={() => setDeleteTarget(category)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {!categories.length && !isHydrating ? (
            <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 px-5 py-6 text-xs text-center text-zinc-500 dark:text-zinc-400">
              No categories found. Create your first category to structure store taxonomy.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          titleId={titleId}
          descriptionId={descriptionId}
          className="max-w-2xl max-h-[calc(100dvh-3rem)] overflow-y-auto bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white p-6"
        >
          <DialogHeader className="mb-4">
            <DialogTitle id={titleId} className="text-zinc-900 dark:text-white">{editingCategory ? "Update Category" : "Add New Category"}</DialogTitle>
            <DialogDescription id={descriptionId} className="text-zinc-600 dark:text-zinc-400">
              Keep store taxonomy consistent across the dashboard and public storefront.
            </DialogDescription>
          </DialogHeader>

          <form className="grid gap-4" onSubmit={handleSubmit(submitCategory)}>
            <label className="grid gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Category Name
              <Input placeholder="Fashion" className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white" {...register("name")} />
              {errors.name ? <span className="text-xs text-rose-600">{errors.name.message}</span> : null}
            </label>

            <label className="grid gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Slug
              <Input
                placeholder="fashion"
                className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                {...register("slug", {
                  onChange: () => {
                    slugEditedRef.current = true;
                  },
                })}
              />
              <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">Used in route paths like /category/[slug]</span>
              {errors.slug ? <span className="text-xs text-rose-600">{errors.slug.message}</span> : null}
            </label>

            <label className="grid gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Description
              <textarea
                rows={3}
                maxLength={180}
                className="w-full resize-none rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white outline-none transition placeholder:text-zinc-400 focus:border-emerald-600"
                placeholder="Notes about the stores that belong to this category."
                {...register("description")}
              />
              {errors.description ? <span className="text-xs text-rose-600">{errors.description.message}</span> : null}
            </label>

            <div className="flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting} className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                disabled={isSubmitting}
                leadingIcon={isSubmitting ? <Spinner /> : null}
              >
                {isSubmitting ? (editingCategory ? "Updating..." : "Saving...") : editingCategory ? "Update Category" : "Save Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setDeleteTarget(null);
          }
        }}
        title="Delete category"
        description={
          deleteTarget
            ? `Delete ${deleteTarget.name}? This will be blocked automatically if any stores are still linked to it.`
            : ""
        }
        confirmLabel="Delete Category"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirmed}
        isSubmitting={isDeleting}
      />
    </>
  );
}
