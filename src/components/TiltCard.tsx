import { useEffect, useRef, type ReactNode } from "react";

/**
 * 3D tilt card: ±15deg X/Y, smooth spring-back. Children get parallax via
 * `data-z` (translateZ in px) on any descendant — handled by CSS classes.
 * Also tracks mouse for the radial shine overlay.
 */
export function TiltCard({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const card = cardRef.current;
    if (!scene || !card) return;

    let raf = 0;
    let targetRX = 0;
    let targetRY = 0;
    let rx = 0;
    let ry = 0;

    const onMove = (e: MouseEvent) => {
      const rect = scene.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height;
      targetRY = (px - 0.5) * 30; // -15..15 deg (Y axis)
      targetRX = -(py - 0.5) * 30; // -15..15 deg (X axis)
      card.style.setProperty("--mx", `${px * 100}%`);
      card.style.setProperty("--my", `${py * 100}%`);
      card.style.transition = "transform .15s ease-out";
    };
    const onLeave = () => {
      targetRX = 0;
      targetRY = 0;
      card.style.transition = "transform .6s cubic-bezier(.2,.7,.2,1)";
    };

    const tick = () => {
      rx += (targetRX - rx) * 0.12;
      ry += (targetRY - ry) * 0.12;
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    scene.addEventListener("mousemove", onMove);
    scene.addEventListener("mouseleave", onLeave);
    return () => {
      scene.removeEventListener("mousemove", onMove);
      scene.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={sceneRef} className={`tilt-scene ${className ?? ""}`}>
      <div ref={cardRef} className={`tilt-card ${innerClassName ?? ""}`}>
        {children}
        <div className="tilt-shine" />
      </div>
    </div>
  );
}
