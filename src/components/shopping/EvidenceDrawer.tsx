/**
 * @file EvidenceDrawer.tsx
 * @description Slide-Over Drawer for Traceable Product Evidence & Review Excerpts.
 */

import type { ProductEvidence } from "@/lib/services/canonical-types";
import { X, ExternalLink, ShieldCheck, Video, FileText, Users, Award } from "lucide-react";

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: ProductEvidence[];
  productTitle: string;
}

export function EvidenceDrawer({ isOpen, onClose, evidence, productTitle }: EvidenceDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex justify-end bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-border bg-card p-6 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-primary uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Evidence &amp; Citations
            </div>
            <h3 className="mt-1 font-display text-lg font-bold text-foreground">
              {productTitle}
            </h3>
            <p className="text-xs text-muted-foreground">
              {evidence.length} external reviews, lab benchmarks, and community consensus data points.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Evidence List */}
        <div className="mt-6 space-y-4">
          {evidence.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border/80 bg-muted/20 p-4 transition-all hover:border-primary/40"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {item.sourceType === "Lab Benchmark" ? (
                    <Award className="h-4 w-4 text-amber-500" />
                  ) : item.sourceType === "Tech Reviewer" ? (
                    <Video className="h-4 w-4 text-rose-500" />
                  ) : (
                    <Users className="h-4 w-4 text-primary" />
                  )}
                  <span className="font-mono text-xs font-bold text-foreground">
                    {item.authorOrChannel}
                  </span>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                  {item.claimType}
                </span>
              </div>

              <blockquote className="mt-3 border-l-2 border-primary/40 pl-3 text-xs italic leading-relaxed text-muted-foreground">
                &ldquo;{item.claimExcerpt}&rdquo;
              </blockquote>

              <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]">
                <span className="text-muted-foreground font-mono">
                  Confidence: <strong className="text-emerald-500">{Math.round(item.confidenceScore * 100)}%</strong>
                </span>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline font-mono"
                >
                  <span>{item.sourceTitle}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
