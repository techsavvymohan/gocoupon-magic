/**
 * @file src/context/AdminAuthContext.tsx
 * @description Secure Admin Session & Authentication Context for GoCoupon.
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { type RoleType, getPermissionsForRole } from "@/lib/access-control";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  permissions: string[];
}

export function getAdminAuthHeaders(): Record<string, string> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("gocoupon_admin_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
  session: { data: { user: AdminUser | null } | null; status: "authenticated" | "unauthenticated" | "loading" };
}

const STORAGE_KEY = "gocoupon_admin_session_v3";
const TOKEN_KEY = "gocoupon_admin_token";

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedUser && savedToken) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.email) {
          setUser(parsed);
          setToken(savedToken);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }

    // Automatically inject Bearer token into all /api/admin fetch requests made while in Admin suite
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;
      if (
        typeof url === "string" &&
        (url.startsWith("/api/") || url.includes("/api/")) &&
        !url.includes("/api/admin/login")
      ) {
        const currentToken = localStorage.getItem(TOKEN_KEY);
        if (currentToken) {
          const headers = new Headers(init?.headers || {});
          if (!headers.has("Authorization")) {
            headers.set("Authorization", `Bearer ${currentToken}`);
          }
          init = { ...init, headers };
        }
      }
      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: "Please enter both email and password." };
    }

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setToken(data.token || null);
        try {
          if (data.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
        } catch {}
        return { success: true };
      }
      return { success: false, error: data.error || "Invalid admin credentials." };
    } catch {
      return { success: false, error: "Unable to connect to authentication server." };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  };

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : getAdminAuthHeaders();
  };

  const session = {
    data: user ? { user } : null,
    status: loading ? ("loading" as const) : user ? ("authenticated" as const) : ("unauthenticated" as const),
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        token,
        login,
        logout,
        getAuthHeaders,
        session,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
