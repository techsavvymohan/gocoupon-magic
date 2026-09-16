"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/ui/AppModal";
import { X } from "lucide-react";

function CopyIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
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

export default function AdminSubmissionsManager() {
  const [submissions, setSubmissions] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [editForm, setEditForm] = useState({
    storeName: "",
    code: "",
    discount: "",
    category: "General",
    url: "",
    terms: "",
    expiryDate: "",
  });

  // Rejection dialog state
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("Expired or invalid discount code.");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/submissions", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setSubmissions(json.data || []);
        if (json.counts) {
          setCounts(json.counts);
        }
      }
    } catch (err) {
      toast.error("Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied code: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleQuickApprove = async (sub) => {
    const toastId = toast.loading(`Approving coupon "${sub.code}"...`);
    try {
      const res = await fetch(`/api/admin/submissions/${sub.id}/approve`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Coupon approved and published to live pool!", { id: toastId });
        fetchSubmissions();
      } else {
        toast.error(json.error || "Approval failed.", { id: toastId });
      }
    } catch (err) {
      toast.error("Network error during approval.", { id: toastId });
    }
  };

  const handleOpenEdit = (sub) => {
    setEditingSub(sub);
    setEditForm({
      storeName: sub.storeName || "",
      code: sub.code || "",
      discount: sub.discount || "",
      category: sub.category || "General",
      url: sub.url || "",
      terms: sub.terms || "",
      expiryDate: sub.expiryDate || "",
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async (andApprove = false) => {
    if (!editingSub) return;
    try {
      const res = await fetch(`/api/admin/submissions/${editingSub.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (json.success) {
        if (andApprove) {
          await handleQuickApprove({ ...editingSub, ...editForm });
        } else {
          toast.success("Submission details updated.");
          fetchSubmissions();
        }
        setEditOpen(false);
      } else {
        toast.error(json.error || "Update failed.");
      }
    } catch {
      toast.error("Error updating submission.");
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    try {
      const res = await fetch(`/api/admin/submissions/${rejectTarget.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Submission marked as rejected.");
        setRejectOpen(false);
        setRejectTarget(null);
        fetchSubmissions();
      } else {
        toast.error(json.error || "Reject failed.");
      }
    } catch {
      toast.error("Error rejecting submission.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/submissions/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Submission removed.");
        setDeleteTarget(null);
        fetchSubmissions();
      }
    } catch {
      toast.error("Error deleting submission.");
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      if (activeTab !== "all" && item.status !== activeTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchStore = item.storeName?.toLowerCase().includes(q);
        const matchCode = item.code?.toLowerCase().includes(q);
        const matchEmail = item.email?.toLowerCase().includes(q);
        const matchDiscount = item.discount?.toLowerCase().includes(q);
        return matchStore || matchCode || matchEmail || matchDiscount;
      }
      return true;
    });
  }, [submissions, activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white">Community Submitted Coupons</CardTitle>
            </div>
            <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              Review visitor-submitted coupon codes and deals. Approved offers publish instantly to GoCoupon's live deal feed.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSubmissions}
              disabled={loading}
              className="rounded-xl border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 gap-1.5 cursor-pointer"
            >
              <RefreshIcon />
              <span>{loading ? "Refreshing..." : "Refresh Queue"}</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Total Submissions</span>
          <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{counts.all}</p>
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Visitor community</span>
        </div>

        <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Pending Review</span>
            {counts.pending > 0 && <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />}
          </div>
          <p className="text-2xl font-black text-amber-900 dark:text-amber-300 mt-1">{counts.pending}</p>
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Awaiting verification</span>
        </div>

        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Approved Live</span>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-300 mt-1">{counts.approved}</p>
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Active in feed</span>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Rejected / Spam</span>
          <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{counts.rejected}</p>
          <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">Filtered out</span>
        </div>
      </div>

      {/* Main Review Desk Table Card */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 text-xs font-semibold border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                activeTab === "all"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs"
                  : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                activeTab === "pending"
                  ? "bg-amber-500 text-white shadow-2xs"
                  : "text-amber-800 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40"
              }`}
            >
              Pending ({counts.pending})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("approved")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                activeTab === "approved"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              }`}
            >
              Approved ({counts.approved})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("rejected")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                activeTab === "rejected"
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              }`}
            >
              Rejected ({counts.rejected})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store, code, email..."
              className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
            />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50/80 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Store / Merchant</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Promo Code</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Offer / Discount</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Category</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Submitter</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Status</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 text-right">Review Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((sub) => {
                    const isPending = sub.status === "pending";
                    const isApproved = sub.status === "approved";
                    const isRejected = sub.status === "rejected";

                    return (
                      <TableRow key={sub.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition border-b border-zinc-100 dark:border-zinc-800/60">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${sub.storeName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com&sz=128`}
                              alt={sub.storeName}
                              className="h-7 w-7 rounded-lg border border-zinc-200 dark:border-zinc-700 p-0.5 object-contain bg-white dark:bg-zinc-800"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <div>
                              <p className="font-bold text-xs text-zinc-900 dark:text-white">{sub.storeName}</p>
                              {sub.url && (
                                <a
                                  href={sub.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[160px] block font-mono"
                                >
                                  {sub.url.replace(/^https?:\/\//, "")}
                                </a>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700">
                            <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">{sub.code}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(sub.code)}
                              title="Copy code"
                              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                            >
                              {copiedCode === sub.code ? <CheckIcon className="h-3 w-3 text-emerald-600" /> : <CopyIcon className="h-3 w-3" />}
                            </button>
                          </div>
                        </TableCell>

                        <TableCell>
                          <p className="text-xs font-bold text-zinc-900 dark:text-white max-w-xs">{sub.discount || "Verified Deal"}</p>
                          {sub.terms && <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-xs">{sub.terms}</p>}
                        </TableCell>

                        <TableCell>
                          <span className="inline-block rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
                            {sub.category || "General"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{sub.email || "Anonymous Guest"}</p>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                            {new Date(sub.submittedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </TableCell>

                        <TableCell>
                          <span
                            className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              isApproved
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : isRejected
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <Button
                                size="sm"
                                onClick={() => handleQuickApprove(sub)}
                                className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg cursor-pointer shadow-2xs"
                                title="Approve and publish to live deals feed"
                              >
                                Approve
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(sub)}
                              className="h-7 px-2.5 text-xs rounded-lg cursor-pointer"
                            >
                              Review &amp; Edit
                            </Button>
                            {isPending && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenReject(sub)}
                                className="h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs rounded-lg cursor-pointer"
                              >
                                Reject
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(sub.id)}
                              className="h-7 px-2 text-zinc-400 hover:text-rose-600 text-xs rounded-lg cursor-pointer"
                              title="Delete permanently"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-zinc-500 dark:text-zinc-400 text-xs">
                      {loading ? "Loading community submissions..." : "No coupon submissions found matching criteria."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit & Approve Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-xl max-h-[calc(100dvh-3rem)] flex flex-col p-0 overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-2xl">
          {/* Fixed Header */}
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <DialogTitle className="text-base font-bold text-zinc-900 dark:text-white">Review &amp; Edit Submission</DialogTitle>
              <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-xs">
                Adjust coupon code, discount text, or expiry date before approving to live GoCoupon feed.
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 shrink-0 cursor-pointer"
              onClick={() => setEditOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Store Name
                <Input
                  value={editForm.storeName}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, storeName: e.target.value }))}
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs"
                />
              </label>

              <label className="grid gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Coupon Code
                <Input
                  value={editForm.code}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs font-mono font-bold"
                />
              </label>
            </div>

            <label className="grid gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Discount Description
              <Input
                value={editForm.discount}
                onChange={(e) => setEditForm((prev) => ({ ...prev, discount: e.target.value }))}
                placeholder="Flat 20% OFF or ₹500 Discount"
                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Category
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-white"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Home">Home</option>
                  <option value="Recharge">Recharge</option>
                  <option value="General">General</option>
                </select>
              </label>

              <label className="grid gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Expiry Date
                <Input
                  type="date"
                  value={editForm.expiryDate}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs"
                />
              </label>
            </div>

            <label className="grid gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Destination URL
              <Input
                value={editForm.url}
                onChange={(e) => setEditForm((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://..."
                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs font-mono"
              />
            </label>

            <label className="grid gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Terms &amp; Conditions
              <Input
                value={editForm.terms}
                onChange={(e) => setEditForm((prev) => ({ ...prev, terms: e.target.value }))}
                placeholder="Min order value, select items only"
                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs"
              />
            </label>
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center justify-end gap-2.5">
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(false)} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleSaveEdit(false)} className="text-xs font-semibold cursor-pointer">
              Save Changes
            </Button>
            <Button size="sm" onClick={() => handleSaveEdit(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer">
              Save &amp; Approve to Live Pool
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-white">Reject Submission</DialogTitle>
            <DialogDescription className="text-zinc-600 dark:text-zinc-400 text-xs">
              Provide an optional reason for archiving this coupon submission.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <label className="grid gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Rejection Reason
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2.5 text-xs text-zinc-900 dark:text-white resize-none"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 mt-5">
            <Button variant="ghost" size="sm" onClick={() => setRejectOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmReject} className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs">
              Confirm Rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Community Submission?"
        description={`Are you sure you want to permanently delete submission for "${deleteTarget?.storeName}"? This action cannot be undone.`}
        confirmText="Delete Submission"
        confirmVariant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
