/**
 * @file BankLogos.tsx
 * @description Authentic, precision vector SVG brand logos for top Indian & US banks and credit cards.
 * Provides crisp, real SVG icons for Chase, Amex, Capital One, Citi, Affirm, HDFC, SBI, ICICI, Axis, Kotak, and IndusInd.
 */

import React from "react";

interface BankLogoProps {
  className?: string;
}

export function ChaseLogo({ className = "h-4 w-4" }: BankLogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Chase Bank">
      {/* White rounded squircle container */}
      <rect width="100" height="100" rx="18" fill="#FFFFFF" />
      {/* 4 Precision Pinwheel Trapezoids of Chase Octagon */}
      <g fill="#1170CF">
        <polygon points="38,12 65,12 88,35 38,35" />
        <polygon points="88,38 88,65 65,88 65,38" />
        <polygon points="62,88 35,88 12,65 62,65" />
        <polygon points="12,62 12,35 35,12 35,62" />
      </g>
      {/* Subtle outer container border */}
      <rect x="0.5" y="0.5" width="99" height="99" rx="17.5" stroke="#000000" strokeOpacity="0.08" strokeWidth="1" fill="none" />
    </svg>
  );
}

export function AmexLogo({ className = "h-4 w-4" }: BankLogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="American Express">
      {/* Blue rounded squircle container */}
      <rect width="100" height="100" rx="18" fill="#006FCF" />
      {/* AMEX Typography Outline & Fill */}
      <g fill="#006FCF" stroke="#FFFFFF" strokeWidth="5" strokeLinejoin="miter" strokeMiterlimit="3">
        {/* 'A' */}
        <path d="M 28 50 L 44 18 H 54 L 70 50 H 59 L 55.5 42 H 42.5 L 39 50 Z" />
        {/* 'M' */}
        <path d="M 64 50 V 18 H 73 L 80 34 L 87 18 H 96 V 50 H 88 V 28 L 82.5 40 H 77.5 L 72 28 V 50 Z" />
        {/* 'E' */}
        <path d="M 40 82 V 52 H 67 V 60 H 50 V 63.5 H 63 V 70.5 H 50 V 74 H 67 V 82 Z" />
        {/* 'X' */}
        <path d="M 72 82 L 81 67 L 73 52 H 82 L 85.5 59 L 89 52 H 98 L 90 67 L 99 82 H 90 L 85.5 75 L 81 82 Z" />
      </g>
      {/* Inner White Cutouts */}
      <g fill="#FFFFFF">
        <polygon points="49,27 45.5,35 52.5,35" />
      </g>
      {/* Subtle outer container border */}
      <rect x="0.5" y="0.5" width="99" height="99" rx="17.5" stroke="#000000" strokeOpacity="0.12" strokeWidth="1" fill="none" />
    </svg>
  );
}

export function CapitalOneLogo({ className = "h-4 w-4" }: BankLogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Capital One">
      {/* White rounded squircle container */}
      <rect width="100" height="100" rx="18" fill="#FFFFFF" />
      {/* Capital One Iconic Red Swoosh */}
      <path
        d="M 54 88 C 64 80 82 52 87 29 C 90 15 76 10 52 14 C 36 17 24 22 20 23 C 34 19 60 15 78 17 C 88 18 87 28 80 43 C 73 57 59 78 54 88 Z"
        fill="#D03027"
      />
      {/* Capital Wordmark (Heavy Italic Sans) */}
      <text
        x="6"
        y="68"
        fill="#004977"
        fontSize="21"
        fontWeight="900"
        fontStyle="italic"
        fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
        letterSpacing="-0.5"
      >
        Capital
      </text>
      {/* One Wordmark (Flowing Italic Serif) */}
      <text
        x="67"
        y="68"
        fill="#004977"
        fontSize="21"
        fontWeight="600"
        fontStyle="italic"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="-0.2"
      >
        One
      </text>
      {/* Subtle outer container border */}
      <rect x="0.5" y="0.5" width="99" height="99" rx="17.5" stroke="#000000" strokeOpacity="0.08" strokeWidth="1" fill="none" />
    </svg>
  );
}

export function CitiLogo({ className = "h-4 w-4" }: BankLogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Citi Bank">
      {/* White rounded squircle container */}
      <rect width="100" height="100" rx="18" fill="#FFFFFF" />
      {/* Iconic Citi Red Arc */}
      <path
        d="M 35 34 C 44 14 84 14 94 34"
        stroke="#ED1C24"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      {/* citi typography in Navy Blue */}
      <g fill="#003B70">
        {/* 'c' */}
        <path d="M 33 54 C 30 46 24 43 18 43 C 8 43 2 52 2 69 C 2 86 8 95 18 95 C 24 95 30 92 33 84 L 25 80 C 23 85 21 87 18 87 C 12 87 9 81 9 69 C 9 57 12 51 18 51 C 21 51 23 53 25 58 Z" />
        {/* first 'i' */}
        <rect x="39" y="44" width="8" height="50" rx="1" />
        {/* 't' */}
        <path d="M 59 28 H 67 V 44 H 74 V 51 H 67 V 86 C 67 89 69 91 72 91 H 74 V 95 C 71 95 67 95 64 94 C 60 92 59 88 59 83 V 51 H 53 V 44 H 59 Z" />
        {/* second 'i' */}
        <rect x="83" y="44" width="8" height="50" rx="1" />
      </g>
      {/* Subtle outer container border */}
      <rect x="0.5" y="0.5" width="99" height="99" rx="17.5" stroke="#000000" strokeOpacity="0.08" strokeWidth="1" fill="none" />
    </svg>
  );
}

export function AffirmLogo({ className = "h-4 w-4" }: BankLogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Affirm">
      {/* White rounded squircle container */}
      <rect width="100" height="100" rx="18" fill="#FFFFFF" />

      {/* Affirm Vibrant Blue Arch */}
      <path
        d="M 14.03 78.36 A 40.00 40.00 0 1 1 85.97 78.36 L 76.97 78.36 A 32.20 32.20 0 1 0 23.03 78.36 Z"
        fill="#4A4AF4"
      />

      {/* Affirm Iconic Custom Lowercase 'a' in Pure Black */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 34.26 47.36 L 37.57 54.39 L 38.74 53.41 L 40.17 52.41 L 41.54 51.61 L 43.14 50.84 L 44.54 50.30 L 45.86 49.90 L 47.31 49.59 L 48.83 49.41 L 50.34 49.41 L 51.74 49.56 L 52.97 49.84 L 53.97 50.27 L 54.77 50.84 L 55.23 51.36 L 55.63 52.10 L 55.86 53.10 L 55.83 54.07 L 55.49 54.96 L 54.89 55.61 L 54.03 56.13 L 53.31 56.39 L 52.43 56.59 L 49.03 56.96 L 45.54 57.56 L 43.34 58.10 L 41.54 58.67 L 39.66 59.44 L 37.80 60.44 L 36.23 61.59 L 35.00 62.81 L 34.43 63.56 L 33.83 64.56 L 33.20 66.13 L 32.97 67.07 L 32.83 68.13 L 32.83 70.04 L 32.97 71.19 L 33.20 72.19 L 33.74 73.64 L 34.63 75.13 L 35.11 75.73 L 35.89 76.50 L 37.14 77.44 L 38.43 78.13 L 39.34 78.50 L 40.77 78.93 L 42.49 79.24 L 44.17 79.39 L 45.71 79.39 L 47.26 79.22 L 48.91 78.81 L 49.94 78.44 L 51.26 77.81 L 52.46 77.07 L 53.51 76.24 L 54.57 75.22 L 55.40 74.22 L 56.29 72.84 L 56.31 78.33 L 65.80 78.33 L 65.80 54.27 L 65.69 52.90 L 65.31 50.93 L 64.97 49.81 L 64.57 48.84 L 64.00 47.76 L 63.57 47.10 L 62.80 46.13 L 61.94 45.27 L 60.86 44.41 L 59.49 43.59 L 57.94 42.90 L 56.23 42.36 L 54.77 42.04 L 52.80 41.79 L 50.49 41.67 L 48.91 41.73 L 47.03 41.96 L 45.40 42.27 L 43.06 42.90 L 41.31 43.50 L 39.20 44.39 L 37.49 45.24 L 35.89 46.19 Z M 55.66 62.87 L 55.63 63.90 L 55.43 65.16 L 54.94 66.73 L 54.43 67.81 L 53.97 68.56 L 53.23 69.50 L 52.29 70.39 L 51.31 71.04 L 50.20 71.56 L 49.17 71.84 L 47.80 71.99 L 46.69 71.93 L 45.66 71.73 L 44.69 71.36 L 43.91 70.81 L 43.57 70.44 L 43.34 70.10 L 43.06 69.41 L 42.94 68.70 L 43.00 67.67 L 43.23 66.81 L 43.54 66.19 L 43.97 65.61 L 44.57 65.04 L 45.29 64.56 L 45.94 64.22 L 47.06 63.79 L 48.23 63.47 L 49.40 63.24 L 50.91 63.04 L 52.77 62.90 L 54.34 62.84 Z"
        fill="#000000"
      />

      {/* Subtle outer container border */}
      <rect x="0.5" y="0.5" width="99" height="99" rx="17.5" stroke="#000000" strokeOpacity="0.08" strokeWidth="1" fill="none" />
    </svg>
  );
}

export function HdfcLogo({ className = "h-4 w-4" }: BankLogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="HDFC Bank">
      {/* White rounded squircle container */}
      <rect width="100" height="100" rx="18" fill="#FFFFFF" />
      {/* 4 Precision Red L-Brackets */}
      <path
        d="M18 0H44V19H19V44H0V18A18 18 0 0 1 18 0ZM56 0H82A18 18 0 0 1 100 18V44H81V19H56V0ZM100 56V82A18 18 0 0 1 82 100H56V81H81V56H100ZM44 100H18A18 18 0 0 1 0 82V56H19V81H44V100Z"
        fill="#ED1C24"
      />
      {/* Center Solid Blue Square */}
      <rect x="34" y="34" width="32" height="32" fill="#004C8F" />
      {/* Subtle outer container border */}
      <rect x="0.5" y="0.5" width="99" height="99" rx="17.5" stroke="#000000" strokeOpacity="0.08" strokeWidth="1" fill="none" />
    </svg>
  );
}

export function SbiLogo({ className = "h-4 w-4" }: BankLogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="SBI Card">
      {/* White rounded squircle container */}
      <rect width="100" height="100" rx="18" fill="#FFFFFF" />
      {/* SBI Vibrant Blue Circle with Keyhole Cutout */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 50 12
           A 38 38 0 1 0 45.5 87.73
           V 62.2
           A 13 13 0 1 1 54.5 62.2
           V 87.73
           A 38 38 0 0 0 50 12 Z"
        fill="#00A5EC"
      />
      {/* Subtle outer container border */}
      <rect x="0.5" y="0.5" width="99" height="99" rx="17.5" stroke="#000000" strokeOpacity="0.08" strokeWidth="1" fill="none" />
    </svg>
  );
}

export function IciciLogo({ className = "h-4 w-4" }: BankLogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="ICICI Bank">
      {/* White rounded squircle container */}
      <rect width="100" height="100" rx="18" fill="#FFFFFF" />
      {/* Orange Flame Crescent (offset bottom-left) */}
      <ellipse cx="45" cy="53" rx="22" ry="38" transform="rotate(-33 45 53)" fill="#F58220" />
      {/* Burgundy Flame Body */}
      <ellipse cx="52" cy="46" rx="22" ry="38" transform="rotate(-33 52 46)" fill="#9C1D26" />
      {/* Tilted White Dot of the 'i' */}
      <ellipse cx="64" cy="27" rx="5.5" ry="8" transform="rotate(-33 64 27)" fill="#FFFFFF" />
      {/* Stylized White Trunk/Stem of the 'i' with Left Spur */}
      <path
        d="M 57 38 C 58 40 57 46 55 54 C 53 64 52 74 53 84 H 42 C 46 72 47 62 47 54 C 44 54 41 52 38 49 C 42 43 50 39 57 38 Z"
        fill="#FFFFFF"
      />
      {/* Subtle outer container border */}
      <rect x="0.5" y="0.5" width="99" height="99" rx="17.5" stroke="#000000" strokeOpacity="0.08" strokeWidth="1" fill="none" />
    </svg>
  );
}

export function AxisLogo({ className = "h-4 w-4" }: BankLogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Axis Bank">
      {/* White rounded squircle container */}
      <rect width="100" height="100" rx="18" fill="#FFFFFF" />
      {/* Axis Stylized Triangle Chevron 'A' */}
      <g fill="#97144D">
        <path d="M 50 14 L 10 86 H 34 L 50 59 L 62.5 36.5 Z" />
        <path d="M 50 59 H 75 L 90 86 H 66 Z" />
      </g>
      {/* Subtle outer container border */}
      <rect x="0.5" y="0.5" width="99" height="99" rx="17.5" stroke="#000000" strokeOpacity="0.08" strokeWidth="1" fill="none" />
    </svg>
  );
}

export function KotakLogo({ className = "h-4 w-4" }: BankLogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Kotak Mahindra Bank">
      {/* White rounded squircle container */}
      <rect width="100" height="100" rx="18" fill="#FFFFFF" />
      {/* Deep Blue Circular Emblem */}
      <circle cx="50" cy="50" r="41" fill="#003D7A" />
      {/* Red Vertical Center Spine */}
      <rect x="44.5" y="21" width="11" height="58" rx="1.5" fill="#ED1C24" />
      {/* White Stylized Devanagari 'क' Infinity Ribbon */}
      <path
        d="M 81 44
           C 77 37 72 34 65 34
           C 57 34 52 42 50 50
           C 48 58 43 66 33 66
           C 24 66 17 59 17 50
           C 17 41 24 34 33 34
           C 42 34 47 43 50 50
           C 53 58 58 66 65 66
           C 72 66 77 63 81 56"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="9.5"
        strokeLinecap="butt"
        strokeLinejoin="round"
      />
      {/* Subtle outer container border */}
      <rect x="0.5" y="0.5" width="99" height="99" rx="17.5" stroke="#000000" strokeOpacity="0.08" strokeWidth="1" fill="none" />
    </svg>
  );
}

export function IndusIndLogo({ className = "h-4 w-4" }: BankLogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="IndusInd Bank">
      {/* White rounded squircle container */}
      <rect width="100" height="100" rx="18" fill="#FFFFFF" />

      {/* Blue Segmented Globe Ring */}
      <g>
        {/* Outer Globe Ellipse */}
        <ellipse cx="50" cy="50" rx="42" ry="34" fill="#0090D0" />
        {/* Inner Ellipse Cutout */}
        <ellipse cx="50" cy="50" rx="27" ry="21" fill="#FFFFFF" />

        {/* 8 Segment Dividing Channels (White) */}
        <g stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round">
          {/* Equator Left & Right */}
          <line x1="7" y1="50" x2="24.5" y2="50" />
          <line x1="75.5" y1="50" x2="93" y2="50" />
          {/* Vertical Meridians (Top & Bottom Poles) */}
          <line x1="50" y1="15" x2="50" y2="29.5" />
          <line x1="50" y1="70.5" x2="50" y2="85" />
          {/* Top Diagonals (radiating from top pole) */}
          <line x1="50" y1="16" x2="22" y2="32" />
          <line x1="50" y1="16" x2="78" y2="32" />
          {/* Bottom Diagonals (radiating from bottom pole) */}
          <line x1="50" y1="84" x2="22" y2="68" />
          <line x1="50" y1="84" x2="78" y2="68" />
        </g>
      </g>

      {/* Indus Valley Zebu Bull Emblem (Terracotta Crimson #961C23) */}
      <g fill="#961C23">
        {/* Bull Body Silhouette (Hump, Back, Rump, Legs, Hooves, Dewlap) */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M 60 41
             C 58 35 56.5 30 58 28.5
             C 59.2 28.5 60.5 32 61.5 37
             C 62.5 31.5 66 28 67.5 29
             C 68.5 30.5 67 35 64.5 41
             C 66 43 68 47 66.5 51
             C 65 54 62 55 60.5 53
             C 62 56 64 60 63.5 64
             C 62.8 68 60 70 57.5 70.5
             L 57 66
             C 56 68 55 70.5 53.5 70.5
             L 53 66
             C 51.5 66.5 49 65 47 63.5
             L 44 65
             C 43 67 41 70.5 39 70.5
             L 38.5 66
             C 37 68 36 70.5 34.5 70.5
             L 34 65
             C 33 63 32.5 57 32 50
             C 31 52 30.5 62 31 66
             C 31.5 68 32.5 69 32 69.5
             C 31.5 70 30 68 30 64
             C 30.5 56 31.5 49 33 46
             C 35 44 38 45 42 45
             C 46 45 49 42 52 40
             C 54 38.5 56 40 57 42
             C 58 41 59 41 60 41 Z
             M 39 48
             C 43 47 47 48 51 51
             C 53 53 53 57 52 61
             C 50 63 47 62 45 60
             L 42 62
             C 39 62 37 57 37 54
             C 37 50 38 48 39 48 Z"
        />
        {/* Ornate Dewlap Wavy Folds */}
        <path d="M 60 52 C 63 54 65 57 64 61 C 63 65 61 68 58 69 C 59.5 67 61 64 60.5 60 C 60 56 58 54 60 52 Z" />
        <path d="M 62 55 C 64 58 65 62 63.5 66 C 62.5 65 62 62 61 60 C 60 58 61 56 62 55 Z" />
      </g>

      {/* White Face Profile Cutout */}
      <path
        d="M 61 42 C 63 42 65 44 65 47 C 65 49 64 51 62 52 C 61 51 60 48 60 45 C 60 43 60.5 42 61 42 Z"
        fill="#FFFFFF"
      />
      {/* Red Eye Slit inside white face */}
      <circle cx="62.5" cy="46" r="0.9" fill="#961C23" />

      {/* Subtle outer container border */}
      <rect x="0.5" y="0.5" width="99" height="99" rx="17.5" stroke="#000000" strokeOpacity="0.08" strokeWidth="1" fill="none" />
    </svg>
  );
}

export function AllCardsLogo({ className = "h-4 w-4" }: BankLogoProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="All Cards">
      <rect width="32" height="32" rx="6" fill="currentColor" fillOpacity="0.1" />
      <rect x="9" y="8" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="7" y="13" width="16" height="11" rx="2.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/**
 * Dispatches the corresponding SVG logo for any card ID.
 */
export function BankLogoIcon({ cardId, className = "h-4 w-4 shrink-0" }: { cardId: string; className?: string }) {
  const norm = (cardId || "").toLowerCase();

  switch (norm) {
    case "chase":
      return <ChaseLogo className={className} />;
    case "amex":
      return <AmexLogo className={className} />;
    case "capitalone":
      return <CapitalOneLogo className={className} />;
    case "citi":
      return <CitiLogo className={className} />;
    case "affirm":
      return <AffirmLogo className={className} />;
    case "hdfc":
      return <HdfcLogo className={className} />;
    case "sbi":
      return <SbiLogo className={className} />;
    case "icici":
      return <IciciLogo className={className} />;
    case "axis":
      return <AxisLogo className={className} />;
    case "kotak":
      return <KotakLogo className={className} />;
    case "indusind":
      return <IndusIndLogo className={className} />;
    default:
      return <AllCardsLogo className={className} />;
  }
}
