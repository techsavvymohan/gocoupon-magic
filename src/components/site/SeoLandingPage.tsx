import { Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";

type SeoLandingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaTo: string;
  bullets: string[];
  faqs: Array<{ q: string; a: string }>;
  breadcrumb: Array<{ name: string; path: string }>;
};

export function SeoLandingPage(props: SeoLandingPageProps) {
  const { eyebrow, title, description, primaryCtaLabel, primaryCtaTo, bullets, faqs, breadcrumb } =
    props;

  return (
    <SiteShell>
      <section className="border-b border-border px-6 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-7xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            {breadcrumb.map((item, index) => (
              <span key={item.path}>
                {index > 0 && <span className="mx-2">/</span>}
                {index === breadcrumb.length - 1 ? (
                  <span className="text-foreground">{item.name}</span>
                ) : (
                  <Link to={item.path} className="hover:text-foreground">
                    {item.name}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </div>
          <h1 className="max-w-4xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-base text-muted-foreground sm:text-lg">{description}</p>
          <div className="mt-8">
            <Link
              to={primaryCtaTo}
              className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-shadow hover:shadow-[var(--shadow-accent)]"
            >
              {primaryCtaLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why shoppers use goCoupon
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {bullets.map((item) => (
              <li key={item} className="rounded-xl border border-border bg-card p-5 text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-8 divide-y divide-border border-y border-border">
            {faqs.map((item) => (
              <details key={item.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-lg font-semibold text-foreground">
                  <span>{item.q}</span>
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
