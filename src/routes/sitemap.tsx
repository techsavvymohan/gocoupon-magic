import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { posts } from "@/data/posts";
import {
  Map,
  Home,
  Store,
  Tag,
  BookOpen,
  Shield,
  HelpCircle,
  FileText,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/sitemap")({
  component: SitemapPage,
  head: () =>
    createSeoHead({
      title: "HTML Sitemap & Navigation Index – goCoupon",
      description:
        "Comprehensive site directory and index of all pages, store guides, category hubs, blog articles, tools, and legal documentation on goCoupon.",
      path: "/sitemap",
      keywords: "gocoupon sitemap, website directory, all pages index, html sitemap",
    }),
});

interface SiteLink {
  label: string;
  to?: string;
  href?: string;
  isExternal?: boolean;
  desc: string;
}

function SitemapPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "HTML Sitemap", path: "/sitemap" },
  ]);

  const siteSections: Array<{
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    links: SiteLink[];
  }> = [
    {
      title: "Core & Product",
      icon: Home,
      links: [
        { label: "Homepage", to: "/", desc: "Auto-apply coupons and cashback extension" },
        { label: "How It Works", to: "/how-it-works", desc: "Step-by-step coupon testing workflow" },
        { label: "Chrome Extension", to: "/extension", desc: "Install free browser extension" },
        { label: "Cashback Rewards", to: "/cashback-rewards", desc: "Cashback rates and payout guides" },
        { label: "Extension Welcome Guide", to: "/welcome", desc: "Post-installation 3-step setup" },
        { label: "Uninstall Survey", to: "/uninstall", desc: "Offboarding feedback and suggestions" },
      ],
    },
    {
      title: "Deals & Discovery",
      icon: Tag,
      links: [
        {
          label: "goCoupon Deals Hub",
          href: "https://deals.gocoupon.io",
          isExternal: true,
          desc: "Dedicated deals & coupon codes portal on deals.gocoupon.io",
        },
        { label: "All Stores Directory", to: "/stores", desc: "200+ global & regional shopping brands" },
        { label: "Shopping Categories", to: "/categories", desc: "Electronics, Fashion, Food, Travel & More" },
      ],
    },
    {
      title: "Store Landing Pages",
      icon: Store,
      links: [
        { label: "Flipkart Coupons", to: "/flipkart-coupons", desc: "Flipkart deals, SuperCoins, bank offers" },
        { label: "Amazon India Coupons", to: "/amazon-coupons", desc: "Amazon Prime codes, Lightning deals" },
        { label: "Myntra Coupons", to: "/myntra-coupons", desc: "Fashion coupons and Insider discounts" },
        { label: "Meesho Coupons", to: "/meesho-coupons", desc: "Lowest price ethnic and apparel vouchers" },
      ],
    },
    {
      title: "Company & Resources",
      icon: BookOpen,
      links: [
        { label: "About Us", to: "/about", desc: "Our mission, remote-first team, and story" },
        { label: "Blog & Savings Guides", to: "/blog", desc: "Shopping tips and festival sale analysis" },
        { label: "Free Resources & Tools", to: "/resources", desc: "Calculators and e-commerce cheat sheets" },
        { label: "Press Kit & Media", to: "/press", desc: "Brand assets, logos, and media contact" },
        { label: "Help & Troubleshooting", to: "/help", desc: "Support knowledge base and answers" },
        { label: "Contact Us", to: "/contact", desc: "Send an inquiry or open a ticket" },
      ],
    },
    {
      title: "Trust, Security & Legal",
      icon: Shield,
      links: [
        { label: "Privacy Policy", to: "/privacy", desc: "Data protection and extension permissions" },
        { label: "Terms of Service", to: "/terms", desc: "Legal agreement and usage license" },
        { label: "Affiliate Disclosure", to: "/disclosure", desc: "Amazon & merchant commission transparency" },
        { label: "Security & Trust Center", to: "/security", desc: "Manifest V3 sandbox & zero-data-selling pledge" },
      ],
    },
  ];

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Hero Header */}
      <section className="relative border-b border-border px-6 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <Map className="h-3.5 w-3.5" />
            Website Directory
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            HTML Sitemap
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            A comprehensive index of every page, store guide, article, and legal document on goCoupon.io.
          </p>
        </div>
      </section>

      {/* Sections Grid */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl space-y-12">
          {siteSections.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl border border-border bg-card p-8 shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <section.icon className="h-5 w-5" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {section.title}
                </h2>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.links.map((link) => {
                  if (link.isExternal && link.href) {
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group rounded-2xl border border-border/80 bg-background p-4 transition-all hover:border-primary hover:shadow-md"
                      >
                        <div className="flex items-center justify-between font-display text-sm font-bold text-foreground group-hover:text-primary">
                          <span>{link.label}</span>
                          <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{link.desc}</p>
                        <span className="mt-2 inline-block font-mono text-[10px] text-primary/80">
                          {link.href}
                        </span>
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={link.to}
                      to={link.to as any}
                      className="group rounded-2xl border border-border/80 bg-background p-4 transition-all hover:border-primary hover:shadow-md"
                    >
                      <div className="flex items-center justify-between font-display text-sm font-bold text-foreground group-hover:text-primary">
                        <span>{link.label}</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{link.desc}</p>
                      <span className="mt-2 inline-block font-mono text-[10px] text-primary/80">
                        {link.to}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Blog Articles Index */}
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Published Blog Articles &amp; Guides
                </h2>
                <p className="text-xs text-muted-foreground">
                  {posts.length} editorial posts on global e-commerce coupons &amp; shopping hacks
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group rounded-2xl border border-border/80 bg-background p-4 transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="font-display text-sm font-bold text-foreground group-hover:text-primary line-clamp-2">
                    {post.title}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span>{post.read}</span>
                    <span className="text-primary group-hover:underline">Read article →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
