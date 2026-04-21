import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { CustomCursor } from "@/components/CustomCursor";
import { Particles } from "@/components/Particles";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { LogoMarquee } from "@/components/site/LogoMarquee";
import { Stats } from "@/components/site/Stats";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Features } from "@/components/site/Features";
import { Testimonials } from "@/components/site/Testimonials";
import { Pricing } from "@/components/site/Pricing";
import { FAQ } from "@/components/site/FAQ";
import { Blog } from "@/components/site/Blog";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";
import { useRevealOnScroll } from "@/hooks/use-reveal";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "goCoupon — Auto-apply the best coupon at checkout" },
      {
        name: "description",
        content:
          "goCoupon is a free Chrome extension that finds and applies the best coupon code at checkout on Flipkart, Amazon, Myntra and Meesho — and earns you cashback.",
      },
      { property: "og:title", content: "goCoupon — Save on every order, automatically" },
      {
        property: "og:description",
        content:
          "Auto-apply coupons + earn cashback on Flipkart, Amazon, Myntra & Meesho. Free Chrome extension.",
      },
    ],
  }),
});

function Index() {
  useRevealOnScroll();

  // Smooth scroll for in-page anchors
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
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <CustomCursor />
      {/* Global drifting particles backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Particles count={40} />
      </div>

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <LogoMarquee />
          <Stats />
          <HowItWorks />
          <Features />
          <Testimonials />
          <Pricing />
          <FAQ />
          <Blog />
          <CTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}
