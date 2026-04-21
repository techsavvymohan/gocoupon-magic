import { useMemo, useState, useEffect } from "react";

/** Accent-colored particles drifting upward via pure CSS keyframes. Reduced on mobile. */
export function Particles({ count = 40 }: { count?: number }) {
  const [effectiveCount, setEffectiveCount] = useState(count);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) setEffectiveCount(0);
    else if (isCoarse) setEffectiveCount(Math.min(count, 14));
  }, [count]);

  const items = useMemo(
    () =>
      Array.from({ length: effectiveCount }).map((_, i) => {
        const left = Math.random() * 100;
        const duration = 15 + Math.random() * 25; // 15-40s
        const delay = -Math.random() * duration;
        const opacity = 0.08 + Math.random() * 0.12; // 8-20%
        const drift = (Math.random() - 0.5) * 80;
        const size = Math.random() < 0.15 ? 3 : 2;
        return { i, left, duration, delay, opacity, drift, size };
      }),
    [effectiveCount],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {items.map((p) => (
        <span
          key={p.i}
          className="particle"
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              ["--p-op" as never]: p.opacity,
              ["--p-drift" as never]: `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
