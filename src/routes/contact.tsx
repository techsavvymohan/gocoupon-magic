import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { ContactForm } from "@/components/site/ContactForm";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () =>
    createSeoHead({
      title: "Contact Us – goCoupon Support & Inquiries",
      description:
        "Get in touch with goCoupon team in Bangalore. Have questions about coupon auto-apply, cashback, or merchant partnerships? Contact us today.",
      path: "/contact",
      keywords: "contact gocoupon, gocoupon support, coupon extension help, cashback support india",
    }),
});

function ContactPage() {
  return (
    <SiteShell>
      <div className="pt-8">
        <ContactForm />
      </div>
    </SiteShell>
  );
}
