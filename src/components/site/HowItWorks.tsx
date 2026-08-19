import { useEffect, useRef } from "react";

const steps = [
  {
    n: "01",
    title: "Install in 10 seconds",
    body: "Add GoCoupon to Chrome for free. No signup, no password, and no credit card required.",
  },
  {
    n: "02",
    title: "Shop online as usual",
    body: "Browse Amazon, Flipkart, or your favorite stores. We auto-click hidden green coupon boxes for you.",
  },
  {
    n: "03",
    title: "1-Click savings at checkout",
    body: "At checkout, click 'Apply Savings'. GoCoupon tests every code and applies the biggest discount.",
  },
];

const STAGGER = [0, 0.15, 0.3];

export function HowItWorks() {
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      cardRefs.current.forEach((el) => el?.classList.add("hiw-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("hiw-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    cardRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="how" className="relative px-6 py-32">
      {/* Inline styles: self-contained, no external class deps */}
      <style>{`
        .hiw-card {
          opacity: 0;
          transform: translateY(40px) scale(0.96);
          transition:
            opacity 0.6s ease,
            transform 0.6s ease,
            border-color 0.25s ease,
            box-shadow 0.25s ease;
          will-change: transform, opacity;
        }
        .hiw-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Hover — desktop only */
        @media (hover: hover) and (pointer: fine) {
          .hiw-card:hover {
            transform: translateY(-8px) scale(1.02);
            border-color: var(--primary) !important;
          }
          html.light .hiw-card:hover {
            box-shadow: 0 10px 30px rgba(37,99,235,0.15);
          }
          html.dark .hiw-card:hover {
            box-shadow: 0 10px 30px rgba(200,255,0,0.08);
          }
          /* Inner content: title slides, description fades in */
          .hiw-card:hover .hiw-title {
            transform: translateX(6px);
          }
          .hiw-card:hover .hiw-desc {
            opacity: 1;
          }
          /* Number scale */
          .hiw-card:hover .hiw-num {
            transform: scale(1.1);
            opacity: 0.25;
          }
          /* Bottom accent line expands */
          .hiw-card:hover .hiw-line {
            transform: scaleX(1);
          }
        }

        .hiw-title {
          transition: transform 0.25s ease;
          will-change: transform;
        }
        .hiw-desc {
          opacity: 0.8;
          transition: opacity 0.25s ease;
        }
        .hiw-num {
          opacity: 0.15;
          transition: transform 0.25s ease, opacity 0.25s ease;
          will-change: transform, opacity;
        }
        .hiw-line {
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.4s ease;
          will-change: transform;
        }
      `}</style>

      <div className="mx-auto max-w-7xl">
        <div className="reveal mb-20 max-w-2xl">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            How it works
          </p>
          <h2 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
            Three steps. Then never think about it again.
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <article
              key={s.n}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="hiw-card relative rounded-2xl border border-border bg-card/40 p-8"
              style={{ transitionDelay: `${STAGGER[i]}s` }}
            >
              {/* Step number */}
              <div
                className="hiw-num font-mono text-5xl font-bold leading-none"
                style={{ color: "var(--primary)" }}
                aria-hidden
              >
                {s.n}
              </div>

              {/* Title */}
              <h3 className="hiw-title mt-4 font-display text-xl font-bold text-foreground">
                {s.title}
              </h3>

              {/* Body */}
              <p className="hiw-desc mt-3 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>

              {/* Bottom accent line */}
              <div
                aria-hidden
                className="hiw-line mt-8 h-px w-full"
                style={{ background: "var(--primary)" }}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
