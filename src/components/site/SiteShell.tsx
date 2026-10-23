import { useEffect, type ReactNode } from "react";
import { Particles } from "@/components/Particles";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { CookieConsent } from "@/components/site/CookieConsent";
import { MobileStickyCta } from "@/components/site/MobileStickyCta";
import { ExtensionStickyTopBar } from "@/components/site/ExtensionStickyTopBar";
import { ExtensionExitIntentModal } from "@/components/site/ExtensionExitIntentModal";
import { useRevealOnScroll } from "@/hooks/use-reveal";

type SiteShellProps = {
  children: ReactNode;
  showParticles?: boolean;
  hideFooterCta?: boolean;
};

export function SiteShell({
  children,
  showParticles = true,
  hideFooterCta = false,
}: SiteShellProps) {
  useRevealOnScroll();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const a = t?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")?.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Fixed background layer for ambient particles (desktop only, disabled on mobile screens) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block"
        aria-hidden
      >
        {showParticles && <Particles count={30} />}
      </div>

      {/* Sticky Chrome Extension Promo Top Bar */}
      <ExtensionStickyTopBar />

      <Navbar />
      {/* Main content layer positioned above background particles (z-10) */}
      <div className="relative z-10 overflow-x-clip" style={{ overflowX: "clip" }}>
        <main>{children}</main>
        <Footer hideCtaBanner={hideFooterCta} />
      </div>

      {/* Conversion & Compliance Floating Elements */}
      <MobileStickyCta />
      <CookieConsent />
      <ExtensionExitIntentModal />
    </div>
  );
}

