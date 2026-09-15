"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/AppModal";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, useDialogA11yIds } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PERMISSIONS, ROLE_LABELS, ROLE_PERMISSIONS } from "@/lib/access-control";
import { cn } from "@/lib/utils";

const defaultForm = {
  id: null,
  name: "",
  email: "",
  password: "",
  role: "editor",
  permissions: ROLE_PERMISSIONS.editor.filter((item) => item !== "dashboard"),
  isActive: true,
};

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" className="stroke-current opacity-25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" className="stroke-current" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function AdminUsersManager() {
  const [users, setUsers] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const { titleId, descriptionId } = useDialogA11yIds();

  const isEditing = Boolean(form.id);
  const permissionOptions = useMemo(() => PERMISSIONS.filter((item) => item.key !== "dashboard"), []);

  async function loadUsers() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired or invalid. Please sign out and sign in again.");
        }
        throw new Error(payload.error || "Unable to load users.");
      }

      setUsers(payload.data || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function openCreateDialog() {
    setForm(defaultForm);
    setDialogOpen(true);
  }

  function openEditDialog(user) {
    setForm({
      id: user.id,
      name: user.name || "",
      email: user.email,
      password: "",
      role: user.role,
      permissions: (user.permissions || []).filter((item) => item !== "dashboard"),
      isActive: user.isActive,
    });
    setDialogOpen(true);
  }

  function handleRoleChange(role) {
    setForm((current) => ({
      ...current,
      role,
      permissions: ROLE_PERMISSIONS[role].filter((item) => item !== "dashboard"),
    }));
  }

  function togglePermission(permission) {
    setForm((current) => {
      const active = current.permissions.includes(permission);
      return {
        ...current,
        permissions: active
          ? current.permissions.filter((item) => item !== permission)
          : [...current.permissions, permission],
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        permissions: ["dashboard", ...form.permissions],
        isActive: form.isActive,
      };

      if (form.password) {
        payload.password = form.password;
      }

      if (!isEditing && !payload.password) {
        throw new Error("Password is required for new users.");
      }

      const response = await fetch(isEditing ? `/api/admin/users/${form.id}` : "/api/admin/users", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to save user.");
      }

      toast.success(isEditing ? "User updated successfully!" : "User created successfully!");
      setDialogOpen(false);
      setForm(defaultForm);
      await loadUsers();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function openDeleteModal(user) {
    setDeleteTarget(user);
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to delete user.");
      }

      toast.success("User deleted successfully.");
      setDeleteTarget(null);
      await loadUsers();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Admin Users & Access Roles</h3>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Accounts created here are saved in database and grant access to login to Admin Panel.
            </p>
          </div>
          <Button
            type="button"
            onClick={openCreateDialog}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2"
          >
            + Create New User
          </Button>
        </div>

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center text-xs font-semibold text-zinc-500">
            Loading users database...
          </div>
        ) : users.length ? (
          <div className="overflow-x-auto rounded-xl border border-zinc-200/80 dark:border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-800/60">
                <TableRow>
                  <TableHead className="text-zinc-700 dark:text-zinc-300 font-bold text-xs">User Profile</TableHead>
                  <TableHead className="text-zinc-700 dark:text-zinc-300 font-bold text-xs">Role</TableHead>
                  <TableHead className="text-zinc-700 dark:text-zinc-300 font-bold text-xs">Access Permissions</TableHead>
                  <TableHead className="text-zinc-700 dark:text-zinc-300 font-bold text-xs">Status</TableHead>
                  <TableHead className="text-right text-zinc-700 dark:text-zinc-300 font-bold text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black text-xs">
                          {(user.name || user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-zinc-900 dark:text-white">{user.name || "Unnamed User"}</p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      <span className="inline-flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        onClick={() =>
                          setExpandedUserId((current) => (current === user.id ? null : user.id))
                        }
                      >
                        <span>{buildAccessSummary(user.permissions || [])}</span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          ({expandedUserId === user.id ? "Hide" : "View Details"})
                        </span>
                      </button>
                      {expandedUserId === user.id && (
                        <div className="mt-2 flex flex-wrap gap-1 bg-zinc-50 dark:bg-zinc-800/80 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700">
                          {(user.permissions || []).map((p) => (
                            <span key={p} className="text-[10px] font-semibold bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? "success" : "warning"}
                        size="sm"
                        className={cn(
                          "font-bold text-[10px]",
                          user.isActive
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                            : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                        )}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                          className="h-8 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => openDeleteModal(user)}
                          className="h-8 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </tr>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30 px-6 py-12 text-center">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No Admin Users Found</h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Create the first user account to manage admin panel access.
            </p>
            <Button
              type="button"
              onClick={openCreateDialog}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2"
            >
              + Create First User
            </Button>
          </div>
        )}
      </div>

      {/* User Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-labelledby={titleId} aria-describedby={descriptionId} className="max-w-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
          <DialogHeader>
            <DialogTitle id={titleId} className="text-base font-bold text-zinc-900 dark:text-white">
              {isEditing ? "Edit Admin Account" : "Create New Admin User"}
            </DialogTitle>
            <DialogDescription id={descriptionId} className="text-xs text-zinc-500 dark:text-zinc-400">
              Set credentials, account status, and dashboard access permissions.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Full Name</label>
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="e.g. Syed Munir"
                  required
                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email Address (Login)</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="admin@gocoupon.com"
                  required
                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {isEditing ? "New Password (Optional)" : "Password"}
                </label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder={isEditing ? "Leave blank to keep password" : "Minimum 8 characters"}
                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Account Role</label>
                <select
                  className="flex h-9 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-xs text-zinc-900 dark:text-white outline-none"
                  value={form.role}
                  onChange={(event) => handleRoleChange(event.target.value)}
                >
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Admin Module Permissions</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Dashboard is automatically included.</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                    className="accent-emerald-600"
                  />
                  Active Account
                </label>
              </div>

              <div className="grid gap-2 md:grid-cols-2 pt-2">
                {permissionOptions.map((permission) => {
                  const checked =
                    form.role === "admin" ? true : form.permissions.includes(permission.key);

                  return (
                    <label
                      key={permission.key}
                      className={cn(
                        "flex items-start gap-2.5 rounded-xl border p-2.5 text-xs transition cursor-pointer",
                        checked
                          ? "bg-white dark:bg-zinc-800 border-emerald-500/40 text-zinc-900 dark:text-white font-semibold shadow-2xs"
                          : "border-zinc-200 dark:border-zinc-700/60 text-zinc-500 dark:text-zinc-400"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={form.role === "admin"}
                        onChange={() => togglePermission(permission.key)}
                        className="mt-0.5 accent-emerald-600"
                      />
                      <span>
                        <span className="block font-bold">{permission.label}</span>
                        <span className="block text-[10px] text-zinc-400">{permission.href}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2"
              >
                {isSubmitting ? <Spinner /> : null}
                {isEditing ? "Save Changes" : "Create Account"}
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
        title="Delete User Account"
        description={deleteTarget ? `Are you sure you want to remove ${deleteTarget.email}? They will no longer be able to log in.` : ""}
        confirmLabel="Delete User"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirmed}
        isSubmitting={isDeleting}
      />
    </div>
  );
}

function shortPermissionLabel(label) {
  const map = {
    Dashboard: "Dash",
    Stores: "Stores",
    "Coupons & Deals": "Offers",
    Categories: "Cats",
    Blogs: "Blogs",
    Settings: "Settings",
  };

  return map[label] || label;
}

function buildAccessSummary(permissions) {
  const labels = permissions
    .map((permission) => {
      const item = PERMISSIONS.find((entry) => entry.key === permission);
      return shortPermissionLabel(item?.label || permission);
    })
    .filter(Boolean);

  if (!labels.length) {
    return "No access";
  }

  if (labels.length === 1) {
    return labels[0];
  }

  return `${labels[0]} +${labels.length - 1}`;
}
