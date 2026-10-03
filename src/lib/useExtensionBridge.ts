/**
 * @file src/lib/useExtensionBridge.ts
 * @description React hook connecting GoCoupon Web App with the GoCoupon Chrome Extension.
 *
 * Provides:
 * - isInstalled: boolean state indicating if the GoCoupon extension is active
 * - version: string extension version
 * - openStoreWithExtension: opens store and primes auto-apply
 */

import { useState, useEffect } from "react";

export interface ExtensionStatus {
  isInstalled: boolean;
  version: string | null;
  openStoreWithExtension: (storeUrl: string, couponCode?: string) => void;
}

export function useExtensionBridge(): ExtensionStatus {
  const [isInstalled, setIsInstalled] = useState(false);
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check DOM marker injected by content bridge
    const checkDomMarker = () => {
      const el = document.getElementById("gocoupon-extension-installed");
      if (el) {
        setIsInstalled(true);
        setVersion(el.getAttribute("data-version") || "1.2.0");
        return true;
      }
      return false;
    };

    if (checkDomMarker()) return;

    // 2. Poll briefly on load
    const interval = setInterval(() => {
      if (checkDomMarker()) {
        clearInterval(interval);
      }
    }, 500);

    const timer = setTimeout(() => clearInterval(interval), 3000);

    // 3. Listen for dynamic detection event
    const handleExtensionReady = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsInstalled(true);
      if (customEvent.detail?.version) {
        setVersion(customEvent.detail.version);
      }
    };

    window.addEventListener("gocoupon-extension-ready", handleExtensionReady);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      window.removeEventListener("gocoupon-extension-ready", handleExtensionReady);
    };
  }, []);

  const openStoreWithExtension = (storeUrl: string, couponCode?: string) => {
    // Dispatch event to content bridge
    window.dispatchEvent(
      new CustomEvent("gocoupon-trigger-autoapply", {
        detail: { storeUrl, couponCode },
      })
    );
    // Also open the URL in a new window/tab
    window.open(storeUrl, "_blank", "noopener,noreferrer");
  };

  return {
    isInstalled,
    version,
    openStoreWithExtension,
  };
}
