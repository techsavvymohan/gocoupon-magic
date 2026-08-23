# Web Interface Guidelines

Concise rules for building accessible, fast, and delightful UIs. Follow MUST/SHOULD/NEVER to guide decisions.

## Interactions

### Keyboard & Focus
- **MUST**: Full keyboard support per [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/).
- **MUST**: Visible, unobscured focus rings (`:focus-visible`; group with `:focus-within`); sticky/fixed elements never cover focus.
- **MUST**: Manage focus (trap, move, return) per APG patterns.
- **NEVER**: `outline: none` without visible focus replacement (`focus-visible:ring-2`).

### Targets & Inputs
- **MUST**: Hit target ≥24px (mobile ≥44px); if visual <24px, expand hit area.
- **MUST**: Mobile `<input>` font-size ≥16px to prevent iOS auto-zoom on focus.
- **NEVER**: Disable browser zoom (`user-scalable=no`, `maximum-scale=1`).
- **MUST**: `touch-action: manipulation` to prevent double-tap zoom delay on interactive controls.
- **SHOULD**: Set `-webkit-tap-highlight-color` to match brand design.

### Forms
- **MUST**: Hydration-safe inputs (no lost focus or values).
- **NEVER**: Block paste in `<input>` / `<textarea>`.
- **MUST**: Loading buttons show spinner and keep original label.
- **MUST**: Enter submits focused input; in `<textarea>`, ⌘/Ctrl+Enter submits.
- **MUST**: Keep submit enabled until request starts; then disable with spinner.
- **MUST**: Accept free text, validate after—don't block typing.
- **MUST**: Allow incomplete form submission to surface field-level validation.
- **MUST**: Errors inline next to fields; on submit, focus first error.
- **MUST**: `autocomplete` + meaningful `name`; correct `type` and `inputmode`.
- **SHOULD**: Disable spellcheck for emails/codes/usernames (`spellCheck={false}`).
- **SHOULD**: Placeholders end with `…` and show example pattern.
- **MUST**: Warn on unsaved changes before navigation.
- **MUST**: Compatible with password managers & 2FA; allow pasting codes.
- **MUST**: Trim values to handle text expansion trailing spaces.
- **MUST**: No dead zones on checkboxes/radios; label + control share one hit target.

### State & Navigation
- **MUST**: URL reflects state (deep-link filters/tabs/pagination/expanded panels).
- **MUST**: Back/Forward restores scroll position.
- **MUST**: Links use `<a>` / `<Link>` for navigation (support Cmd/Ctrl/middle-click).
- **NEVER**: Use `<div onClick>` for navigation.

### Feedback
- **SHOULD**: Optimistic UI; reconcile on response; on failure rollback or offer Undo.
- **MUST**: Confirm destructive actions or provide Undo window.
- **MUST**: Use polite `aria-live` for toasts/inline validation.
- **SHOULD**: Ellipsis (`…`) for options opening follow-ups ("Rename…") and loading states ("Loading…").

### Touch & Drag
- **MUST**: Generous targets, clear affordances; avoid finicky interactions.
- **MUST**: Delay first tooltip; subsequent peers instant.
- **MUST**: `overscroll-behavior: contain` in modals/drawers.
- **MUST**: During drag, disable text selection and set `inert` on dragged elements.
- **MUST**: Drag/swipe/pinch/path gestures have a tap/click and keyboard alternative.
- **MUST**: If it looks clickable, it must be clickable.

## Animation
- **MUST**: Honor `prefers-reduced-motion` (provide reduced variant or disable).
- **SHOULD**: Prefer CSS > Web Animations API > JS libraries.
- **MUST**: Animate compositor-friendly props (`transform`, `opacity`) only.
- **NEVER**: Animate layout props (`top`, `left`, `width`, `height`).
- **NEVER**: `transition: all` — list properties explicitly.
- **SHOULD**: Animate only to clarify cause/effect or add deliberate delight.
- **SHOULD**: Choose easing to match the change (exponential ease-out, e.g. `cubic-bezier(0.22, 1, 0.36, 1)`).
- **MUST**: Animations interruptible and input-driven; autoplay only for muted, non-essential loops.
- **MUST**: Autoplay motion >5s alongside other content has pause, stop, or hide controls.
- **MUST**: Correct `transform-origin` (motion starts where it physically should).
- **MUST**: SVG transforms on `<g>` wrapper with `transform-box: fill-box; transform-origin: center`.

## Typography & Content
- **MUST**: Use actual ellipsis character `…` over three periods `...`.
- **MUST**: Prefer curly quotes `“` `”` over straight quotes.
- **MUST**: Non-breaking spaces `&nbsp;` for units (`10&nbsp;MB`), shortcuts (`⌘&nbsp;K`), and brand names.
- **MUST**: `font-variant-numeric: tabular-nums` for price comparison tables and number columns.
- **MUST**: Use `text-wrap: balance` / `text-balance` on headings to prevent widows and orphans.
- **MUST**: Text containers handle long content (`truncate`, `line-clamp-*`, `break-words`).
- **MUST**: Flex children need `min-w-0` to allow text truncation.

## Performance & Images
- **MUST**: Explicit `width` and `height` on images or parent containers to prevent CLS.
- **MUST**: Below-fold images set `loading="lazy"`.
- **MUST**: Above-fold critical images set `fetchpriority="high"`.
- **MUST**: Virtualize or chunk large lists (>50 items).
- **MUST**: Zero layout reads in render loops (`getBoundingClientRect`, `offsetHeight`).
