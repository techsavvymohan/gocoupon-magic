import { MagneticButton } from "../MagneticButton";

const links = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#blog" },
];

export function Navbar() {
  return (
    <header
      className="sticky top-0 z-[100] w-full border-b border-border/60"
      style={{
        background: "rgba(8,8,8,0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2.5">
          <span
            className="grid h-8 w-8 place-items-center rounded-md font-display text-sm font-bold"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            CX
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            goCoupon
          </span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <MagneticButton
          as="a"
          href="#cta"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-shadow hover:shadow-[0_0_30px_rgba(200,255,0,0.35)]"
        >
          Add to Chrome — Free
        </MagneticButton>
      </nav>
    </header>
  );
}
