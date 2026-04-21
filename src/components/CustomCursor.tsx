import { useEffect, useRef } from "react";

/**
 * Custom magnetic cursor with 6-dot trail.
 * - Lerp follow at 0.12
 * - Expands on hover over [data-cursor="hover"] or buttons/links
 * - Pure JS, no external deps. Disabled on touch devices.
 */
export function CustomCursor() {
  const orbRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const orb = { x: target.x, y: target.y };
    const trails = trailRefs.current.map(() => ({ x: target.x, y: target.y }));

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el || !orbRef.current) return;
      const isInteractive = !!el.closest('a, button, [role="button"], [data-cursor="hover"]');
      orbRef.current.classList.toggle("is-hover", isInteractive);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);

    let raf = 0;
    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

    const tick = () => {
      orb.x = lerp(orb.x, target.x, 0.18);
      orb.y = lerp(orb.y, target.y, 0.18);
      if (orbRef.current) {
        orbRef.current.style.transform = `translate3d(${orb.x}px, ${orb.y}px, 0) translate(-50%, -50%)`;
      }
      // Trails: each follows the previous with progressively slower lerp
      let prev = orb;
      trails.forEach((t, i) => {
        const factor = 0.18 - i * 0.025;
        t.x = lerp(t.x, prev.x, Math.max(factor, 0.04));
        t.y = lerp(t.y, prev.y, Math.max(factor, 0.04));
        const node = trailRefs.current[i];
        if (node) {
          const scale = 1 - i * 0.12;
          node.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) translate(-50%, -50%) scale(${scale})`;
          node.style.opacity = String(Math.pow(0.6, i + 1));
        }
        prev = t;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          className="cursor-trail"
          aria-hidden
        />
      ))}
      <div ref={orbRef} className="cursor-orb" aria-hidden>
        <span className="cursor-orb-label">click</span>
      </div>
    </>
  );
}
