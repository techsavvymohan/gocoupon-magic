import { useEffect } from "react";

/**
 * Mounts a single IntersectionObserver that toggles `.is-visible`
 * on every element with class `.reveal`. Stagger via inline transition-delay.
 */
export function useRevealOnScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const revealAll = () => {
      document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
        el.classList.add("is-visible");
      });
    };

    revealAll();

    const observer = new MutationObserver(() => {
      revealAll();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);
}
