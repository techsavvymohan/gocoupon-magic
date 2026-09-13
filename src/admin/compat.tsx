/**
 * @file src/admin/compat.tsx
 * @description Next.js to TanStack Router & React Compatibility Layer for GoCoupon Admin.
 */

import * as React from "react";
import { Link as TanstackLink, useLocation, useNavigate } from "@tanstack/react-router";
import { useAdminAuth } from "@/context/AdminAuthContext";

export function Link({
  href,
  children,
  className,
  onClick,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler;
  [key: string]: any;
}) {
  return (
    <TanstackLink
      to={href}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </TanstackLink>
  );
}

export function usePathname(): string {
  const location = useLocation();
  return location.pathname;
}

export function useSearchParams() {
  const location = useLocation();
  return React.useMemo(() => {
    return new URLSearchParams(location.search || (typeof window !== "undefined" ? window.location.search : ""));
  }, [location.search]);
}

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (url: string) => navigate({ to: url }),
    replace: (url: string) => navigate({ to: url, replace: true }),
    back: () => window.history.back(),
  };
}

export function useSession() {
  const { session } = useAdminAuth();
  return session;
}

export function signOut(options?: { callbackUrl?: string }) {
  if (typeof window !== "undefined") {
    localStorage.removeItem("gocoupon_admin_session_v2");
    window.location.href = options?.callbackUrl || "/admin";
  }
}

export function Image({
  src,
  alt = "",
  width,
  height,
  className,
  priority,
  ...props
}: {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  priority?: boolean;
  [key: string]: any;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      {...props}
    />
  );
}

export function Logo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <div className="flex items-center gap-2">
      <img src="/gc-logo.webp" alt="GoCoupon" className={`dark:hidden ${className}`} />
      <img src="/gc-logo-dark.webp" alt="GoCoupon" className={`hidden dark:block ${className}`} />
    </div>
  );
}
