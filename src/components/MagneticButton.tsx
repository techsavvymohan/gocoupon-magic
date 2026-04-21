import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  as?: "button" | "a";
  href?: string;
}

/**
 * Magnetic pull within 80px radius, max 12px translate.
 * Spring-like return on mouse leave.
 */
export function MagneticButton({
  children,
  className,
  style,
  onClick,
  as = "button",
  href,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < 80) {
        const strength = (1 - dist / 80) * 12;
        const ax = (dx / Math.max(dist, 1)) * strength;
        const ay = (dy / Math.max(dist, 1)) * strength;
        el.style.transform = `translate(${ax}px, ${ay}px)`;
      } else {
        el.style.transform = "translate(0,0)";
      }
    };
    const onLeave = () => {
      el.style.transition = "transform .5s cubic-bezier(.2,.9,.3,1.4)";
      el.style.transform = "translate(0,0)";
      window.setTimeout(() => {
        if (el) el.style.transition = "";
      }, 500);
    };

    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  if (as === "a") {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={className}
        style={style}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      className={className}
      style={style}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
