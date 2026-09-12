import React, { useState, useEffect } from "react";
import {
  resolveStoreLogo,
  getStoreInitials,
  getStoreGradient,
} from "@/lib/services/store-logo-resolver";

interface StoreLogoProps {
  storeName: string;
  storeLogo?: string;
  trackingUrl?: string;
  className?: string;
  imageClassName?: string;
  alt?: string;
}

export function StoreLogo({
  storeName,
  storeLogo,
  trackingUrl,
  className = "h-8 w-8",
  imageClassName = "max-h-full max-w-full object-contain",
  alt,
}: StoreLogoProps) {
  const [hasError, setHasError] = useState(false);

  const resolvedUrl = React.useMemo(() => {
    return resolveStoreLogo(storeName, trackingUrl, undefined, storeLogo);
  }, [storeName, trackingUrl, storeLogo]);

  // Reset error when storeName or resolvedUrl changes
  useEffect(() => {
    setHasError(false);
  }, [resolvedUrl, storeName]);

  const initials = getStoreInitials(storeName);
  const gradientClass = getStoreGradient(storeName);

  if (hasError || !resolvedUrl) {
    return (
      <div
        className={`shrink-0 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center font-mono font-bold shadow-xs select-none ${className}`}
        title={storeName}
        aria-label={storeName}
      >
        <span className="text-[10px] tracking-wider leading-none uppercase">{initials}</span>
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 rounded-xl border border-border/80 bg-background/90 p-1 flex items-center justify-center shadow-xs overflow-hidden ${className}`}
    >
      <img
        src={resolvedUrl}
        alt={alt || `${storeName} Logo`}
        className={imageClassName}
        loading="lazy"
        decoding="async"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
