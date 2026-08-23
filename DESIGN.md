# Design System: GoCoupon

## Typography
- **Display Headings**: `Outfit` (weights 600, 700, 800) — clean geometric character, distinct proportions.
- **Body & Controls**: `Manrope` (weights 400, 500, 600, 700) — optimal readability for complex commerce data and prices.
- **Data & Metrics**: `JetBrains Mono` (weights 400, 500) — high-precision numerical price points, savings deltas, timestamps.

## Color System
- **Light Theme**:
  - Background: `#f8fafc` (Porcelain Slate)
  - Foreground: `#020617` (High-contrast Slate 950)
  - Primary: `#4f46e5` (Cyber Indigo)
  - Accent / Best Deal: `#10b981` (Emerald Green)
  - Card Surface: `#ffffff` with subtle elevation shadow
- **Dark Theme**:
  - Background: `#090d16` (Deep Midnight Obsidian)
  - Foreground: `#f8fafc`
  - Primary: `#6366f1`
  - Card Surface: `#0f172a` (Slate 900)

## Component Patterns
- **Buttons**: Real physics momentum return (`cubic-bezier(0.22, 1, 0.36, 1)`), no bounce/elastic slop.
- **Cards**: Single-level elevation, subtle border contrast (`border-border/80`), no decorative colored side-tabs or nested card clutter.
- **Badges**: Crisp semantic badges with solid background tints and clear typography.
- **Motion**: Purposeful entrance transitions, reduced motion safety, disabled heavy WebGL on mobile devices.
