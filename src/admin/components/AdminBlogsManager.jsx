"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { uploadToCloudinary } from "@/lib/cloudinary";

const initialForm = {
  title: "",
  slug: "",
  category: "Shopping Guide",
  author: "GoCoupon Editorial",
  readTime: "5 min read",
  image: "",
  bannerLink: "/offers",
  shortDescription: "",
  content: "",
  status: "Published",
};

const BLOG_CATEGORIES = [
  "Shopping Guide",
  "Comparison",
  "Expense Saviour",
  "Food & Dining",
  "Electronics",
  "Fashion",
  "Bank & Credit Cards",
  "Festival Sales",
];

function ExternalLinkIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminBlogsManager() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Link helper modal states
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const textareaRef = useRef(null);
  const coverFileInputRef = useRef(null);
  const inlineFileInputRef = useRef(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);

  async function handleCoverFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      toast.loading("Uploading cover image to Cloudinary...", { id: "cover-upload" });
      const res = await uploadToCloudinary(file, "gocoupon/blogs/covers");
      setForm((prev) => ({ ...prev, image: res.secure_url || res.url }));
      toast.success("Cover image uploaded to Cloudinary!", { id: "cover-upload" });
    } catch (err) {
      toast.error(err?.message || "Failed to upload cover image.", { id: "cover-upload" });
    } finally {
      setUploadingCover(false);
      if (e.target) e.target.value = "";
    }
  }

  async function handleInlineImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingInline(true);
      toast.loading("Uploading image to Cloudinary...", { id: "inline-upload" });
      const res = await uploadToCloudinary(file, "gocoupon/blogs/content");
      const url = res.secure_url || res.url;
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      const markdownImg = `\n\n![${fileNameWithoutExt}](${url})\n\n`;

      setForm((current) => {
        const fullText = current.content || "";
        let start = fullText.length;
        if (textareaRef.current) {
          start = textareaRef.current.selectionStart || fullText.length;
        }
        const newContent = fullText.substring(0, start) + markdownImg + fullText.substring(start);
        return {
          ...current,
          content: newContent,
        };
      });

      toast.success("Image inserted into blog article!", { id: "inline-upload" });
    } catch (err) {
      toast.error(err?.message || "Failed to upload image.", { id: "inline-upload" });
    } finally {
      setUploadingInline(false);
      if (e.target) e.target.value = "";
    }
  }

  async function loadBlogs() {
    try {
      setLoading(true);
      const res = await fetch("/api/blogs", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBlogs(json.data);
      }
    } catch (err) {
      toast.error("Failed to load blog articles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlogs();
  }, []);

  function handleOpenCreate() {
    setEditingBlog(null);
    setForm(initialForm);
    setError("");
    setOpen(true);
  }

  function handleOpenEdit(blog) {
    setEditingBlog(blog);
    setForm({
      title: blog.title || "",
      slug: blog.slug || "",
      category: blog.category || "Shopping Guide",
      author: blog.author || "GoCoupon Editorial",
      readTime: blog.readTime || "5 min read",
      image: blog.image || "",
      bannerLink: blog.bannerLink || "",
      shortDescription: blog.shortDescription || blog.excerpt || "",
      content: blog.content || "",
      status: blog.status || "Published",
    });
    setError("");
    setOpen(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    const nextState = { ...form, [name]: value };

    if (name === "title" && !editingBlog) {
      nextState.slug = slugify(value);
    }

    setForm(nextState);
  }

  function handleOpenLinkModal() {
    let selectedText = "";
    let start = 0;
    let end = 0;

    if (textareaRef.current) {
      start = textareaRef.current.selectionStart;
      end = textareaRef.current.selectionEnd;
      selectedText = textareaRef.current.value.substring(start, end);
    }

    setSelectionRange({ start, end });
    setLinkText(selectedText || "Link Text");
    setLinkUrl("");
    setLinkModalOpen(true);
  }

  function handleInsertLinkConfirm(e) {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    const urlToUse = linkUrl.trim();
    const labelToUse = linkText.trim() || "Link";
    const markdownLink = `[${labelToUse}](${urlToUse})`;

    setForm((current) => {
      const fullText = current.content || "";
      const { start, end } = selectionRange;

      let newContent = "";
      if (start !== undefined && end !== undefined && start !== end) {
        newContent = fullText.substring(0, start) + markdownLink + fullText.substring(end);
      } else {
        newContent = fullText.substring(0, start) + markdownLink + fullText.substring(start);
      }

      return {
        ...current,
        content: newContent,
      };
    });

    setLinkModalOpen(false);
    setLinkText("");
    setLinkUrl("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const imgUrl = (form.image || "").trim();
    if (!imgUrl) {
      setError("Cloudinary Cover Image is required. Please upload an image or enter a Cloudinary URL.");
      toast.error("Cloudinary cover image is required.");
      return;
    }

    if (imgUrl.includes("unsplash.com")) {
      setError("Unsplash URLs are not accepted. Please use your Cloudinary URL or click 'Upload to Cloudinary'.");
      toast.error("Unsplash URLs not allowed. Please use Cloudinary.");
      return;
    }

    if (!imgUrl.includes("cloudinary.com") && !imgUrl.startsWith("data:") && !imgUrl.startsWith("/")) {
      setError("Invalid image host. Please provide a valid Cloudinary URL (https://res.cloudinary.com/...) or click 'Upload to Cloudinary'.");
      toast.error("Please provide a valid Cloudinary URL.");
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = editingBlog ? `/api/blogs/${editingBlog.slug}` : "/api/blogs";
      const method = editingBlog ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save blog post.");
      }

      toast.success(editingBlog ? "Article updated successfully!" : "New article published!");
      setOpen(false);
      setEditingBlog(null);
      setForm(initialForm);
      loadBlogs();
    } catch (err) {
      setError(err.message || "Failed to submit blog post.");
      toast.error(err.message || "Save failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/blogs/${deleteTarget.slug}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Deleted article: ${deleteTarget.title}`);
        setDeleteTarget(null);
        loadBlogs();
      } else {
        toast.error(json.error || "Delete failed.");
      }
    } catch {
      toast.error("Error deleting blog article.");
    }
  }

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      if (selectedStatus !== "all" && b.status !== selectedStatus) {
        return false;
      }
      if (selectedCategory !== "all" && b.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = b.title?.toLowerCase().includes(q);
        const matchSlug = b.slug?.toLowerCase().includes(q);
        const matchAuthor = b.author?.toLowerCase().includes(q);
        return matchTitle || matchSlug || matchAuthor;
      }
      return true;
    });
  }, [blogs, selectedStatus, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white">Blog &amp; Shopping Guides</CardTitle>
            <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              Create, edit, and publish savings guides, competitor reviews, and shopping advice. All articles appear on <code>/blog</code>.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadBlogs}
              disabled={loading}
              className="rounded-xl border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 gap-1.5 cursor-pointer"
            >
              <RefreshIcon />
              <span>{loading ? "Loading..." : "Refresh"}</span>
            </Button>
            <Button
              onClick={handleOpenCreate}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              + Create New Article
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filter and Search Bar */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 text-xs font-semibold border border-zinc-200 dark:border-zinc-700">
              {["all", "Published", "Draft"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer capitalize ${
                    selectedStatus === st
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs"
                      : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {st === "all" ? `All (${blogs.length})` : st}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-white cursor-pointer"
            >
              <option value="all">All Categories</option>
              {BLOG_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search article title or slug..."
              className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
            />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50/80 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Article Title &amp; Cover</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Category</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Author</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Read Time</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Status</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBlogs.length > 0 ? (
                  filteredBlogs.map((blog) => (
                    <TableRow key={blog.id || blog.slug} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition border-b border-zinc-100 dark:border-zinc-800/60">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-2xs">
                            {blog.image ? (
                              <img src={blog.image} alt={blog.title} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-400">BLOG</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-900 dark:text-white text-xs truncate max-w-md">{blog.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">/blog/{blog.slug}</span>
                              <a
                                href={`/blog/${blog.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                title="View live article on storefront"
                              >
                                <span>View Live</span>
                                <ExternalLinkIcon className="h-2.5 w-2.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="inline-block rounded-md bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                          {blog.category || "Shopping Guide"}
                        </span>
                      </TableCell>

                      <TableCell className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {blog.author || "Editorial"}
                      </TableCell>

                      <TableCell className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                        {blog.readTime || "5 min read"}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            blog.status === "Published"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          {blog.status || "Published"}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEdit(blog)}
                            className="h-7 px-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteTarget(blog)}
                            className="h-7 px-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-zinc-500 dark:text-zinc-400 text-xs">
                      {loading ? "Loading articles..." : "No articles found matching filters."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Article Editor Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-white text-lg font-bold">
              {editingBlog ? "Edit Blog Article" : "Create New Blog Article"}
            </DialogTitle>
            <DialogDescription className="text-zinc-600 dark:text-zinc-400 text-xs">
              Publish shopping guides, store discount reviews, and comparison articles to GoCoupon.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
            <label className="grid gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Article Title
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Why GoCoupon Beats Traditional Coupon Extensions"
                required
                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="grid gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                URL Slug
                <Input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="article-slug"
                  required
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs font-mono"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Category
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-white"
                >
                  {BLOG_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="grid gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Author
                <Input
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  placeholder="GoCoupon Editorial"
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Read Time
                <Input
                  name="readTime"
                  value={form.readTime}
                  onChange={handleChange}
                  placeholder="5 min read"
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs font-mono"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Publish Status
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </label>
            </div>

            <div className="grid gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>Cloudinary Cover Image URL</span>
                  <span className="text-rose-500 font-bold">*</span>
                  <span className="text-[10px] font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                    Cloudinary Required
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={coverFileInputRef}
                    onChange={handleCoverFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingCover}
                    onClick={() => coverFileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 hover:bg-sky-100 dark:hover:bg-sky-900/60"
                  >
                    <span>☁️ {uploadingCover ? "Uploading to Cloudinary..." : "Upload to Cloudinary"}</span>
                  </button>
                </div>
              </div>
              <Input
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://res.cloudinary.com/pgzfcjir/image/upload/..."
                className={`bg-zinc-50 dark:bg-zinc-800 border text-xs font-mono ${
                  form.image?.includes("unsplash.com")
                    ? "border-rose-500 text-rose-600 focus:border-rose-500"
                    : "border-zinc-200 dark:border-zinc-700"
                }`}
              />
              {form.image?.includes("unsplash.com") ? (
                <p className="text-[11px] text-rose-500 font-semibold">
                  ⚠️ Unsplash URLs are no longer accepted. Please use your Cloudinary URL or click "Upload to Cloudinary".
                </p>
              ) : (
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">
                  Provide a direct Cloudinary URL (e.g. https://res.cloudinary.com/pgzfcjir/...) or use the upload button above.
                </p>
              )}
            </div>

            {form.image && (
              <div className="h-28 w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 relative">
                <img src={form.image} alt="Cover preview" className="h-full w-full object-cover" />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] text-white font-bold">
                  Cover Preview
                </span>
              </div>
            )}

            <label className="grid gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Excerpt / Summary
              <Input
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                placeholder="Short summary displayed in article cards and Google search results"
                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs"
              />
            </label>

            <div className="grid gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center justify-between">
                <span>Article Body (Markdown Supported)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={inlineFileInputRef}
                    onChange={handleInlineImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingInline}
                    onClick={() => inlineFileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <span>☁️ {uploadingInline ? "Uploading..." : "Insert Cloudinary Image"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenLinkModal}
                    className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🔗 Insert Link</span>
                  </button>
                </div>
              </div>
              <textarea
                ref={textareaRef}
                name="content"
                rows={10}
                value={form.content}
                onChange={handleChange}
                placeholder="Write your article in Markdown. E.g. ## Heading, 1. List item, **Bold text**."
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3 text-xs text-zinc-900 dark:text-white font-mono outline-none focus:border-emerald-500 resize-y"
              />
            </div>

            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                {isSubmitting ? "Saving..." : editingBlog ? "Update Article" : "Publish Article"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Insert Link Popup Modal */}
      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">🔗 Insert Hyperlink</DialogTitle>
            <DialogDescription className="text-xs text-zinc-600 dark:text-zinc-400">
              Insert a clickable affiliate link or internal store URL into your article.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInsertLinkConfirm} className="space-y-3.5 pt-2">
            <label className="grid gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Display Text
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="e.g. Myntra promo codes"
                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs"
              />
            </label>

            <label className="grid gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Destination URL
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                required
                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs font-mono"
              />
            </label>

            <div className="flex items-center justify-end gap-2 pt-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => setLinkModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                Insert Markdown Link
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Blog Article?"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete Article"
        confirmVariant="destructive"
        onConfirm={handleDeleteConfirmed}
      />
    </div>
  );
}
