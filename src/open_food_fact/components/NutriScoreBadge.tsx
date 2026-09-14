/**
 * @file src/open_food_fact/components/NutriScoreBadge.tsx
 * @description Visual badge rendering Nutri-Score (A-E) and NOVA classification groups
 * according to official international nutritional standards.
 */

import React from "react";
import type { NutriScoreGrade, NovaGroup } from "../types.js";

interface NutriScoreBadgeProps {
  grade?: NutriScoreGrade;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const NUTRI_COLORS: Record<NutriScoreGrade, { bg: string; text: string; label: string; desc: string }> = {
  a: {
    bg: "bg-[#038141] text-white",
    text: "text-[#038141]",
    label: "A",
    desc: "Very Good Nutritional Quality",
  },
  b: {
    bg: "bg-[#85bb2f] text-white",
    text: "text-[#85bb2f]",
    label: "B",
    desc: "Good Nutritional Quality",
  },
  c: {
    bg: "bg-[#fecb02] text-zinc-950 font-bold",
    text: "text-[#d9a700]",
    label: "C",
    desc: "Average Nutritional Quality",
  },
  d: {
    bg: "bg-[#ee8100] text-white",
    text: "text-[#ee8100]",
    label: "D",
    desc: "Poor Nutritional Quality",
  },
  e: {
    bg: "bg-[#e63e11] text-white",
    text: "text-[#e63e11]",
    label: "E",
    desc: "Very Poor Nutritional Quality",
  },
  unknown: {
    bg: "bg-zinc-400 text-white",
    text: "text-zinc-500",
    label: "?",
    desc: "Nutri-Score Not Available",
  },
};

export const NutriScoreBadge: React.FC<NutriScoreBadgeProps> = ({
  grade = "unknown",
  size = "md",
  showLabel = true,
}) => {
  const normGrade = (grade.toLowerCase() as NutriScoreGrade) in NUTRI_COLORS ? (grade.toLowerCase() as NutriScoreGrade) : "unknown";
  const conf = NUTRI_COLORS[normGrade];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold rounded",
    md: "px-2.5 py-1 text-xs font-bold rounded-md",
    lg: "px-3.5 py-1.5 text-sm font-extrabold rounded-lg",
  };

  return (
    <div className="inline-flex items-center gap-1.5" title={`Nutri-Score: ${conf.desc}`}>
      <span className={`inline-flex items-center uppercase tracking-wide shadow-sm ${conf.bg} ${sizeClasses[size]}`}>
        Nutri-Score {conf.label}
      </span>
      {showLabel && size !== "sm" && (
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium hidden sm:inline">
          {conf.desc}
        </span>
      )}
    </div>
  );
};

interface NovaBadgeProps {
  group?: NovaGroup;
  size?: "sm" | "md";
}

const NOVA_DESCRIPTIONS: Record<number, { label: string; desc: string; color: string }> = {
  1: { label: "NOVA 1", desc: "Unprocessed or minimally processed", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  2: { label: "NOVA 2", desc: "Processed culinary ingredients", color: "bg-lime-500/15 text-lime-600 dark:text-lime-400 border-lime-500/30" },
  3: { label: "NOVA 3", desc: "Processed foods", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  4: { label: "NOVA 4", desc: "Ultra-processed food and drink products", color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" },
};

export const NovaBadge: React.FC<NovaBadgeProps> = ({ group, size = "md" }) => {
  if (!group || !NOVA_DESCRIPTIONS[group]) return null;

  const info = NOVA_DESCRIPTIONS[group];
  const sizeClasses = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${info.color} ${sizeClasses}`}
      title={`NOVA Group ${group}: ${info.desc}`}
    >
      {info.label}
    </span>
  );
};
