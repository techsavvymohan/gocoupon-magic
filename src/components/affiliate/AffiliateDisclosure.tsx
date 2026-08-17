/**
 * @file AffiliateDisclosure.tsx
 * @description Provider-independent affiliate disclosure component.
 *
 * Must be displayed near affiliate content per Amazon Associates program
 * requirements and FTC guidelines.
 *
 * Usage:
 *   <AffiliateDisclosure providers={["amazon"]} />
 *
 * The component renders nothing when no real providers are active.
 * It automatically shows/hides based on which providers are passed.
 */

import type { ReactNode } from "react";

interface ProviderDisclosure {
  text: string;
  /** Icon/logo element — optional */
  icon?: ReactNode;
}

const PROVIDER_DISCLOSURES: Record<string, ProviderDisclosure> = {
  amazon: {
    text: "As an Amazon Associate, GoCoupon earns from qualifying purchases.",
  },
  impact: {
    text: "GoCoupon participates in affiliate programs through Impact. We may earn commissions from qualifying purchases.",
  },
  awin: {
    text: "GoCoupon participates in affiliate programs through Awin. We may earn commissions from qualifying purchases.",
  },
  cj: {
    text: "GoCoupon participates in the CJ Affiliate program. We may earn commissions from qualifying purchases.",
  },
  sharesale: {
    text: "GoCoupon participates in the ShareASale affiliate program. We may earn commissions from qualifying purchases.",
  },
};

const GENERIC_DISCLOSURE =
  "GoCoupon may earn commissions from qualifying purchases made through affiliate links on this page.";

interface AffiliateDisclosureProps {
  /**
   * List of active provider slugs to show disclosure for.
   * Pass [] or omit to show generic disclosure.
   * Pass ["mock"] to render nothing (dev only).
   */
  providers?: string[];
  /** Additional CSS class names */
  className?: string;
  /** Compact single-line mode (default: false) */
  compact?: boolean;
}

export function AffiliateDisclosure({
  providers = [],
  className = "",
  compact = false,
}: AffiliateDisclosureProps) {
  // Never show disclosure for mock-only data
  const realProviders = providers.filter((p) => p !== "mock");
  if (realProviders.length === 0) return null;

  const disclosures = realProviders
    .map((p) => PROVIDER_DISCLOSURES[p.toLowerCase()])
    .filter(Boolean) as ProviderDisclosure[];

  // If no specific disclosure found, use generic
  const texts =
    disclosures.length > 0 ? disclosures.map((d) => d.text) : [GENERIC_DISCLOSURE];

  if (compact) {
    return (
      <p
        className={`text-[11px] text-muted-foreground/70 ${className}`}
        aria-label="Affiliate disclosure"
      >
        {texts[0]}
      </p>
    );
  }

  return (
    <aside
      className={`rounded-xl border border-border/50 bg-muted/30 px-4 py-3 ${className}`}
      aria-label="Affiliate disclosure"
    >
      <div className="flex items-start gap-2">
        {/* Info icon */}
        <svg
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
        </svg>
        <div className="space-y-1">
          {texts.map((text) => (
            <p key={text} className="text-[11px] leading-relaxed text-muted-foreground/70">
              {text}
            </p>
          ))}
        </div>
      </div>
    </aside>
  );
}
