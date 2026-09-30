import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminUsersManager from "./AdminUsersManager";
import { cn } from "@/lib/utils";
import { getAdminAuthHeaders } from "@/context/AdminAuthContext";

const initialState = {
  general: {
    siteName: "GoCoupon",
    tagline: "Auto Coupon Applier & Verified Discounts",
    supportEmail: "support@gocoupon.io",
    copyrightText: "© 2026 GoCoupon. All rights reserved.",
  },
  social: {
    facebook: "",
    instagram: "",
    x: "",
    telegram: "",
    youtube: "",
    defaultShareText: "Verified coupons, Amazon affiliate deals, and free Auto Coupon Applier from Gocoupon.",
  },
  seo: {
    titleTemplate: "%s | Gocoupon",
    metaDescription: "Verified coupons, Amazon affiliate deals, and Gocoupon Auto Coupon Applier Chrome Extension.",
    ogTitle: "Gocoupon - Auto Coupon Applier & Verified Discounts",
    ogDescription: "Discover verified coupons, Amazon affiliate deals, and use our free Gocoupon Chrome extension.",
    robots: "index,follow",
    autoGenerateStoreMetadata: true,
    storeMetaTitleTemplate: "%store% %best_discount%% Off Discount & Coupon Codes %year%",
    storeMetaDescriptionTemplate:
      "Save with %offers_count% verified %store% coupon codes and deals on Gocoupon. Best current offer: %best_offer%. Updated for %year%.",
    googleSiteVerification: "",
    bingSiteVerification: "",
    yandexSiteVerification: "",
    customMetaTags: `<meta name="keywords" content="coupons, deals, discounts, promo codes, savings, store vouchers" />\n<meta name="author" content="Gocoupon Team" />`,
  },
  pages: {
    privacy: {
      heroBadge: "Data Protection & Privacy",
      heroTitle: "Privacy Policy",
      heroSubtitle: "Transparent, secure, and user-first data practices. Learn how we safeguard your personal information and shopping choices.",
      lastUpdated: "July 2026",
      sections: [
        { id: "sec-1", icon: "🛡️", title: "1. Overview & Commitment", content: `At Gocoupon, we are committed to upholding the highest standards of data privacy and transparency. This Privacy Policy outlines how we handle information when you visit our website, browse verified store offers, interact with coupon codes, or subscribe to our daily deal updates. Your trust is our highest priority, and we never sell your personal information to third-party advertisers.` },
        { id: "sec-2", icon: "📊", title: "2. Information We Collect", content: `We collect minimal data necessary to provide a smooth, personalized savings experience:\n\n• Voluntary Information: Email address provided when subscribing to deal newsletters or creating an account.\n• Usage & Analytics: Aggregated data such as pages visited, coupon codes clicked, store referral links followed, browser type, and device category.\n• Cookies & Session Data: Essential cookies to keep track of your preferences, affiliate referral attribution, and search queries.` },
        { id: "sec-3", icon: "⚙️", title: "3. How We Use Your Data", content: `The data we collect is strictly used to enhance your shopping experience and optimize our coupon verification algorithms:\n\n• Delivering verified daily coupon alerts and personalized store recommendations.\n• Attributing affiliate rewards and cashbacks when you redeem offers via our store partner links.\n• Improving website performance, page load speeds, and search accuracy.\n• Preventing fraudulent activity, automated bot queries, and security threats.` },
        { id: "sec-4", icon: "🔗", title: "4. Third-Party Links & Affiliate Partners", content: `Gocoupon partners with major affiliate networks (such as CJ, Rakuten, Impact) and retail merchants. When you click on a store deal or copy a coupon code, you may be redirected to the merchant's external website. We do not control merchant websites, and their respective privacy policies will govern your interactions with them.` },
        { id: "sec-5", icon: "🔐", title: "5. Data Security & Retention", content: `We employ enterprise-grade encryption (TLS/SSL), secure database storage, and strict access controls. Your data is retained only as long as necessary to fulfill the services requested or comply with legal requirements.` },
        { id: "sec-6", icon: "⚖️", title: "6. Your Rights & Choices", content: `Regardless of your location, Gocoupon grants you full control over your personal data under GDPR and CCPA guidelines:\n\n• Access & Export: Request a copy of the personal information we hold about you.\n• Rectification & Erasure: Request corrections or complete deletion of your email address and data.\n• Unsubscribe Anytime: Opt out of marketing emails instantly via the single-click 'Unsubscribe' link at the bottom of any email.` },
        { id: "sec-7", icon: "💬", title: "7. Contact Privacy Team", content: `If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to our dedicated Data Protection Desk:` }
      ],
    },
    terms: {
      heroBadge: "User Agreement & Governance",
      heroTitle: "Terms of Service",
      heroSubtitle: "Please review the rules, responsibilities, and operational guidelines that govern your use of Gocoupon.",
      lastUpdated: "July 2026",
      sections: [
        { id: "tsec-1", icon: "📜", title: "1. Acceptance of Terms", content: `By accessing or using the website Gocoupon, its mobile interface, or associated coupon recommendation services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not access or use our platform.` },
        { id: "tsec-2", icon: "🏷️", title: "2. Description of Services", content: `Gocoupon is a promotional discovery platform that aggregates verified store coupons, cashback offers, discount voucher codes, and affiliate product links. All services provided on our platform are free for individual non-commercial use.` },
        { id: "tsec-3", icon: "✅", title: "3. Coupon Accuracy & Availability", content: `While our verification desk tests and updates coupon codes daily, discount terms, promotional expiration dates, and merchant availability are controlled exclusively by third-party retailers. Gocoupon does not guarantee that every code will be accepted at checkout by third-party merchants at all times.` },
        { id: "tsec-4", icon: "🤝", title: "4. Affiliate Partnerships & Disclosure", content: `Gocoupon participates in affiliate marketing programs. When you click on a store deal or redeem a promotional coupon via our referral links, we may earn an affiliate commission from the merchant at no additional cost to you. This enables us to keep all savings services 100% free for users.` },
        { id: "tsec-5", icon: "💡", title: "5. Intellectual Property", content: `All original text content, design graphics, software code, custom logos, and brand elements on Gocoupon are the exclusive property of Gocoupon. Store brand names, logos, and trademarks displayed belong to their respective corporate owners and are used strictly for identification and comparative discount reporting purposes.` },
        { id: "tsec-6", icon: "⚠️", title: "6. Limitation of Liability", content: `In no event shall Gocoupon, its owners, or team members be liable for any indirect, incidental, or consequential damages resulting from your use or inability to use merchant coupon codes, price changes, or purchase transactions on third-party sites.` },
        { id: "tsec-7", icon: "📩", title: "7. Governance & Questions", content: `These terms shall be governed in accordance with international commercial software standard regulations. For legal inquiries or support, please contact our administrative desk:` }
      ],
    },
    cookies: {
      heroBadge: "Cookie Management & Preferences",
      heroTitle: "Cookie Policy",
      heroSubtitle: "Understand how cookies and affiliate tracking technologies power your savings on Gocoupon.",
      lastUpdated: "July 2026",
      sections: [
        { id: "csec-1", icon: "🍪", title: "1. What Are Cookies?", content: `Cookies are small text files placed on your device when you browse websites. They help websites recognize your browser, remember your active preferences, store affiliate coupon tracking tokens, and ensure smooth navigation.` },
        { id: "csec-2", icon: "🧩", title: "2. Types of Cookies We Use", content: `Gocoupon uses three essential categories of cookies:\n\n• Strictly Necessary Cookies: Required for core website navigation, search functions, and security features.\n• Affiliate & Attribution Cookies: Used to record when you click a merchant coupon link so our store partners can credit Gocoupon.\n• Analytics & Preference Cookies: Help us measure aggregate traffic metrics, page load performance, and popular store searches.` },
        { id: "csec-3", icon: "🌐", title: "3. Third-Party & Partner Cookies", content: `When you click out to an affiliate retailer site (e.g. Amazon, Nike, Flipkart), third-party cookies or web beacons may be set by the merchant or affiliate network to track successful checkout redemptions. We encourage you to consult the cookie policies of merchant partner sites.` },
        { id: "csec-4", icon: "⚙️", title: "4. How to Control & Disable Cookies", content: `You can control, block, or clear cookies directly through your web browser settings:\n\n• Google Chrome: Settings → Privacy and Security → Cookies and other site data\n• Mozilla Firefox: Options → Privacy & Security → Cookies and Site Data\n• Apple Safari: Preferences → Privacy → Block all cookies\n• Microsoft Edge: Settings → Site Permissions → Cookies and site data` },
        { id: "csec-5", icon: "🔄", title: "5. Policy Updates & Inquiries", content: `We may update our Cookie Policy periodically to reflect technological or regulatory changes. If you have questions regarding cookie usage on Gocoupon, feel free to contact us:` }
      ],
    },
    imprint: {
      heroBadge: "Legal Information",
      heroTitle: "Imprint",
      heroSubtitle: "Legal disclosure and company information for Gocoupon as required by applicable law.",
      lastUpdated: "July 2026",
      sections: [
        { id: "isec-1", icon: "🏢", title: "1. Information According to § 5 TMG", content: `Company Name: Gocoupon Ltd.\nRegistered Address: 123 Commerce Street, London, EC1A 1BB, United Kingdom\nCompany Type: Private Limited Company\nRegistration Number: UK12345678\nVAT ID: GB 123 456 789` },
        { id: "isec-2", icon: "📞", title: "2. Contact Information", content: `General Support: support@gocoupon.com\nPartnership Inquiries: partners@gocoupon.com\nTrust & Safety: trust@gocoupon.com` },
        { id: "isec-3", icon: "📝", title: "3. Responsible for Content", content: `Editorial Responsibility: Gocoupon Editorial Team\nAddress: 123 Commerce Street, London, EC1A 1BB, United Kingdom\nJurisdiction: England & Wales` },
        { id: "isec-4", icon: "⚖️", title: "4. Legal Disclaimers & Copyright", content: `Liability for Content: The contents of our pages have been created with the utmost care.\nLiability for Links: Our offer contains links to external websites of third parties, on whose contents we have no influence.\nAffiliate Disclosure: Gocoupon participates in affiliate marketing programs.\nCopyright: Duplication or distribution beyond copyright scope requires prior written consent.` }
      ],
    },
  },
};

const tabs = [
  { key: "general", label: "General & Branding" },
  { key: "pages", label: "Legal & Policy Pages" },
  { key: "seo", label: "SEO & Technical Files" },
  { key: "users", label: "Users & Roles" },
];

const policyPageOptions = [
  { key: "privacy", label: "Privacy Policy (/privacy)" },
  { key: "terms", label: "Terms & Conditions (/terms)" },
  { key: "cookies", label: "Cookie Policy (/cookies)" },
  { key: "imprint", label: "Imprint (/imprint)" },
];

function SectionField({ label, children, hint }) {
  return (
    <label className="grid gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">{hint}</span> : null}
    </label>
  );
}

function SettingsSection({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs">
      <div className="mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">{title}</h3>
        {description ? <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

export default function AdminSettingsPanel() {
  const [settings, setSettings] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [savingSection, setSavingSection] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const [selectedPolicyPage, setSelectedPolicyPage] = useState("privacy");

  // Technical Files State
  const [seoFiles, setSeoFiles] = useState([]);
  const [editingFile, setEditingFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load settings.");
        }

        if (active) {
          setSettings((prev) => ({
            ...prev,
            ...payload.data,
            general: { ...prev.general, ...payload.data?.general },
            social: { ...prev.social, ...payload.data?.social },
            seo: { ...prev.seo, ...payload.data?.seo },
            pages: {
              privacy: { ...initialState.pages.privacy, ...payload.data?.pages?.privacy },
              terms: { ...initialState.pages.terms, ...payload.data?.pages?.terms },
              cookies: { ...initialState.pages.cookies, ...payload.data?.pages?.cookies },
              imprint: { ...initialState.pages.imprint, ...payload.data?.pages?.imprint },
            },
          }));
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadSettings();
    fetchSeoFiles();

    return () => {
      active = false;
    };
  }, []);

  async function fetchSeoFiles() {
    try {
      const res = await fetch("/api/admin/seo-files", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.files) {
        setSeoFiles(data.files);
      }
    } catch {
      // silently handle
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const content = await file.text();

      const res = await fetch("/api/admin/seo-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({
          fileName: file.name,
          content,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      toast.success(`File ${data.fileName} uploaded successfully!`);
      await fetchSeoFiles();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  async function saveFileContent() {
    if (!editingFile) return;

    try {
      setIsUploading(true);
      const res = await fetch("/api/admin/seo-files", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({
          fileName: editingFile.name,
          content: fileContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update file");

      toast.success(`File ${editingFile.name} updated successfully!`);
      await fetchSeoFiles();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function deleteSeoFile(fileName) {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) return;

    try {
      const res = await fetch(`/api/admin/seo-files?fileName=${encodeURIComponent(fileName)}`, {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      toast.success(`File ${fileName} deleted!`);
      if (editingFile?.name === fileName) {
        setEditingFile(null);
        setFileContent("");
      }
      await fetchSeoFiles();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function selectFileForEditing(file) {
    setEditingFile(file);
    setFileContent(file.content || "");
  }

  function updateSection(section, field, value) {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  }

  function updatePolicyHeader(pageKey, field, value) {
    setSettings((current) => ({
      ...current,
      pages: {
        ...current.pages,
        [pageKey]: {
          ...(current.pages?.[pageKey] || {}),
          [field]: value,
        },
      },
    }));
  }

  function updatePolicySection(pageKey, index, field, value) {
    setSettings((current) => {
      const pageData = current.pages?.[pageKey] || initialState.pages[pageKey];
      const nextSections = [...(pageData.sections || [])];
      nextSections[index] = { ...nextSections[index], [field]: value };

      return {
        ...current,
        pages: {
          ...current.pages,
          [pageKey]: {
            ...pageData,
            sections: nextSections,
          },
        },
      };
    });
  }

  function addPolicySection(pageKey) {
    setSettings((current) => {
      const pageData = current.pages?.[pageKey] || initialState.pages[pageKey];
      const nextSections = [
        ...(pageData.sections || []),
        {
          id: `sec-${Date.now()}`,
          icon: "📄",
          title: "New Policy Section",
          content: "Enter section content description here...",
        },
      ];

      return {
        ...current,
        pages: {
          ...current.pages,
          [pageKey]: {
            ...pageData,
            sections: nextSections,
          },
        },
      };
    });
  }

  function removePolicySection(pageKey, index) {
    setSettings((current) => {
      const pageData = current.pages?.[pageKey] || initialState.pages[pageKey];
      const nextSections = (pageData.sections || []).filter((_, i) => i !== index);

      return {
        ...current,
        pages: {
          ...current.pages,
          [pageKey]: {
            ...pageData,
            sections: nextSections,
          },
        },
      };
    });
  }

  async function saveSection(sectionKey, sectionName) {
    try {
      setSavingSection(sectionKey);
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({ [sectionKey]: settings[sectionKey] }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to save settings.");
      }

      setSettings((prev) => ({ ...prev, ...payload.data }));
      toast.success(`${sectionName} settings saved successfully!`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingSection("");
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        Loading platform settings...
      </div>
    );
  }

  const activePolicyData = settings.pages?.[selectedPolicyPage] || initialState.pages[selectedPolicyPage];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Navigation Tab Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 shadow-xs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={cn(
              "rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer",
              activeTab === tab.key
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
            )}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: GENERAL & BRANDING */}
      {activeTab === "general" && (
        <div className="grid gap-6">
          <SettingsSection title="Brand Basics & Support" description="Primary site identity, support contact, and footer copyright information.">
            <div className="grid gap-4 md:grid-cols-2">
              <SectionField label="Site Name">
                <Input
                  value={settings.general?.siteName || ""}
                  onChange={(e) => updateSection("general", "siteName", e.target.value)}
                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </SectionField>
              <SectionField label="Site Tagline">
                <Input
                  value={settings.general?.tagline || ""}
                  onChange={(e) => updateSection("general", "tagline", e.target.value)}
                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </SectionField>
              <SectionField label="Support Email Address">
                <Input
                  type="email"
                  value={settings.general?.supportEmail || ""}
                  onChange={(e) => updateSection("general", "supportEmail", e.target.value)}
                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </SectionField>
              <SectionField label="Footer Copyright Text">
                <Input
                  value={settings.general?.copyrightText || ""}
                  onChange={(e) => updateSection("general", "copyrightText", e.target.value)}
                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </SectionField>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={() => saveSection("general", "General")}
                disabled={savingSection === "general"}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 shadow-xs"
              >
                {savingSection === "general" ? "Saving..." : "Save General Settings"}
              </Button>
            </div>
          </SettingsSection>
        </div>
      )}

      {/* TAB 2: LEGAL & POLICY PAGES EDITOR */}
      {activeTab === "pages" && (
        <div className="grid gap-6">
          <SettingsSection
            title="Footer Legal & Policy Pages Editor"
            description="Manage exact titles, subtitles, dates, and section cards for Privacy, Terms, Cookies, and Imprint pages without altering the frontend UI."
          >
            {/* Page Selection Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              {policyPageOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSelectedPolicyPage(opt.key)}
                  className={cn(
                    "rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer border",
                    selectedPolicyPage === opt.key
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-2xs"
                      : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-600"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="grid gap-6">
              {/* Header Settings */}
              <div className="grid gap-4 md:grid-cols-2 bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                <SectionField label="Top Badge Tag">
                  <Input
                    value={activePolicyData?.heroBadge || ""}
                    onChange={(e) => updatePolicyHeader(selectedPolicyPage, "heroBadge", e.target.value)}
                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </SectionField>
                <SectionField label="Main Hero Title">
                  <Input
                    value={activePolicyData?.heroTitle || ""}
                    onChange={(e) => updatePolicyHeader(selectedPolicyPage, "heroTitle", e.target.value)}
                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold"
                  />
                </SectionField>
                <SectionField label="Last Updated Date">
                  <Input
                    value={activePolicyData?.lastUpdated || ""}
                    onChange={(e) => updatePolicyHeader(selectedPolicyPage, "lastUpdated", e.target.value)}
                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    placeholder="July 2026"
                  />
                </SectionField>
                <SectionField label="Hero Subtitle Paragraph">
                  <Input
                    value={activePolicyData?.heroSubtitle || ""}
                    onChange={(e) => updatePolicyHeader(selectedPolicyPage, "heroSubtitle", e.target.value)}
                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </SectionField>
              </div>

              {/* Sections List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Policy Section Cards ({activePolicyData?.sections?.length || 0})
                  </h4>
                  <Button
                    type="button"
                    onClick={() => addPolicySection(selectedPolicyPage)}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-1.5"
                  >
                    + Add Section Card
                  </Button>
                </div>

                {(activePolicyData?.sections || []).map((sec, idx) => (
                  <div key={sec.id || idx} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-700 pb-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={sec.icon || "📄"}
                          onChange={(e) => updatePolicySection(selectedPolicyPage, idx, "icon", e.target.value)}
                          className="h-8 w-12 text-center text-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                        />
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">Section #{idx + 1}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        onClick={() => removePolicySection(selectedPolicyPage, idx)}
                      >
                        Remove
                      </Button>
                    </div>

                    <SectionField label="Section Title">
                      <Input
                        value={sec.title || ""}
                        onChange={(e) => updatePolicySection(selectedPolicyPage, idx, "title", e.target.value)}
                        className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-semibold text-xs"
                      />
                    </SectionField>

                    <SectionField label="Section Paragraph Text">
                      <textarea
                        rows={4}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-600 leading-relaxed"
                        value={sec.content || ""}
                        onChange={(e) => updatePolicySection(selectedPolicyPage, idx, "content", e.target.value)}
                      />
                    </SectionField>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={() => saveSection("pages", "Legal Policy Pages")}
                disabled={savingSection === "pages"}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 shadow-xs"
              >
                {savingSection === "pages" ? "Saving..." : "Save Policy Page Settings"}
              </Button>
            </div>
          </SettingsSection>
        </div>
      )}

      {/* TAB 3: SEO & TECHNICAL FILES */}
      {activeTab === "seo" && (
        <div className="grid gap-6">
          {/* SEO Custom Meta Tags & Webmaster Verifications */}
          <SettingsSection title="Custom Meta Tags & SEO Header Scripts" description="Paste custom meta tags, keywords, OpenGraph tags, Google Console tokens, and custom scripts to inject into website <head>.">
            
            {/* Custom Raw Meta Tags Input Box */}
            <div className="mb-6 space-y-2">
              <SectionField
                label="Custom SEO Meta Tags (<meta> tags)"
                hint="Paste custom <meta name='...' content='...' /> tags here (e.g. keywords, author, canonical, social og tags). They will be automatically rendered in site <head>."
              >
                <textarea
                  rows={5}
                  value={settings.seo?.customMetaTags || ""}
                  onChange={(e) => updateSection("seo", "customMetaTags", e.target.value)}
                  className="w-full font-mono text-xs bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-xl p-3.5 outline-none focus:border-emerald-600 leading-relaxed"
                  placeholder={`<meta name="keywords" content="coupons, deals, discounts" />\n<meta name="author" content="Gocoupon" />`}
                />
              </SectionField>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <SectionField label="Global Meta Title Template">
                <Input
                  value={settings.seo?.titleTemplate || ""}
                  onChange={(e) => updateSection("seo", "titleTemplate", e.target.value)}
                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </SectionField>
              <SectionField label="Robots Directive Header">
                <Input
                  value={settings.seo?.robots || ""}
                  onChange={(e) => updateSection("seo", "robots", e.target.value)}
                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                />
              </SectionField>
              <div className="md:col-span-2">
                <SectionField label="Store Meta Title Token Template" hint="Tokens: %store%, %best_discount%, %best_offer%, %offers_count%, %year%.">
                  <Input
                    value={settings.seo?.storeMetaTitleTemplate || ""}
                    onChange={(e) => updateSection("seo", "storeMetaTitleTemplate", e.target.value)}
                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </SectionField>
              </div>
              <div className="md:col-span-2">
                <SectionField label="Store Meta Description Token Template">
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs text-zinc-900 dark:text-white outline-none transition focus:border-emerald-600"
                    value={settings.seo?.storeMetaDescriptionTemplate || ""}
                    onChange={(e) => updateSection("seo", "storeMetaDescriptionTemplate", e.target.value)}
                  />
                </SectionField>
              </div>
            </div>

            {/* Webmaster Verification Codes */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5 mt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-4">
                Search Engine Verification Tokens
              </h4>
              <div className="grid gap-4 md:grid-cols-3">
                <SectionField label="Google Site Verification Code">
                  <Input
                    value={settings.seo?.googleSiteVerification || ""}
                    onChange={(e) => updateSection("seo", "googleSiteVerification", e.target.value)}
                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono text-xs"
                    placeholder="e.g. 4zX7kL9..."
                  />
                </SectionField>
                <SectionField label="Bing Webmaster Code (msvalidate.01)">
                  <Input
                    value={settings.seo?.bingSiteVerification || ""}
                    onChange={(e) => updateSection("seo", "bingSiteVerification", e.target.value)}
                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono text-xs"
                    placeholder="e.g. B8A92F..."
                  />
                </SectionField>
                <SectionField label="Yandex Verification Code">
                  <Input
                    value={settings.seo?.yandexSiteVerification || ""}
                    onChange={(e) => updateSection("seo", "yandexSiteVerification", e.target.value)}
                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono text-xs"
                    placeholder="e.g. yandex123..."
                  />
                </SectionField>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5 mt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-4">Social Media Profile Links</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <SectionField label="Facebook Page URL">
                  <Input
                    value={settings.social?.facebook || ""}
                    onChange={(e) => updateSection("social", "facebook", e.target.value)}
                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    placeholder="https://facebook.com/gocoupon"
                  />
                </SectionField>
                <SectionField label="Instagram Profile URL">
                  <Input
                    value={settings.social?.instagram || ""}
                    onChange={(e) => updateSection("social", "instagram", e.target.value)}
                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    placeholder="https://instagram.com/gocoupon"
                  />
                </SectionField>
                <SectionField label="Twitter / X Profile URL">
                  <Input
                    value={settings.social?.x || ""}
                    onChange={(e) => updateSection("social", "x", e.target.value)}
                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    placeholder="https://x.com/gocoupon"
                  />
                </SectionField>
                <SectionField label="Telegram Channel URL">
                  <Input
                    value={settings.social?.telegram || ""}
                    onChange={(e) => updateSection("social", "telegram", e.target.value)}
                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    placeholder="https://t.me/gocoupon"
                  />
                </SectionField>
                <SectionField label="YouTube Channel URL">
                  <Input
                    value={settings.social?.youtube || ""}
                    onChange={(e) => updateSection("social", "youtube", e.target.value)}
                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    placeholder="https://youtube.com/@gocoupon"
                  />
                </SectionField>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  saveSection("seo", "SEO");
                  saveSection("social", "Social Media");
                }}
                disabled={savingSection === "seo"}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 shadow-xs"
              >
                {savingSection === "seo" ? "Saving..." : "Save SEO & Meta Tags"}
              </Button>
            </div>
          </SettingsSection>

          {/* Technical Files Upload & Live Code Editor Section */}
          <SettingsSection
            title="Technical SEO Files & Webmaster Uploads"
            description="Upload and edit working live files like robots.txt, sitemap.xml, or Google HTML site verification files (e.g. google1234.html)."
          >
            <div className="space-y-6">
              {/* File Upload Box */}
              <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30 p-5 text-center">
                <p className="text-xs font-bold text-zinc-900 dark:text-white mb-1">
                  Upload SEO / Verification File
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3">
                  Upload <code className="text-emerald-600 font-mono">robots.txt</code>, <code className="text-emerald-600 font-mono">sitemap.xml</code>, or HTML verification files (e.g. <code className="text-emerald-600 font-mono">google123.html</code>).
                </p>
                <label className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold px-4 py-2 cursor-pointer hover:bg-emerald-600 dark:hover:bg-emerald-500 transition shadow-2xs">
                  <span>{isUploading ? "Uploading File..." : "Choose File to Upload"}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".txt,.xml,.html"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>

              {/* Uploaded Files Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Active Live SEO Files ({seoFiles.length})
                </h4>

                {seoFiles.length === 0 ? (
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-center text-xs text-zinc-500">
                    No technical files uploaded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-800/50">
                    {seoFiles.map((file) => (
                      <div key={file.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                            {file.name.endsWith(".xml") ? "XML" : file.name.endsWith(".html") ? "HTML" : "TXT"}
                          </span>
                          <div>
                            <a
                              href={file.path}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-zinc-900 dark:text-white hover:text-emerald-600 hover:underline"
                            >
                              {file.name}
                            </a>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {(file.size / 1024).toFixed(1)} KB · Live URL: <code className="text-emerald-600">{file.path}</code>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => selectFileForEditing(file)}
                            className="h-8 text-xs font-bold text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                          >
                            Edit File Code
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSeoFile(file.name)}
                            className="h-8 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Code Editor for Selected File */}
              {editingFile && (
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-950 p-4 space-y-3 text-white">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Editing: {editingFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingFile(null)}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      Close Editor
                    </button>
                  </div>

                  <textarea
                    rows={10}
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                    className="w-full font-mono text-xs bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-lg p-3 outline-none focus:border-emerald-500 leading-relaxed"
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      onClick={saveFileContent}
                      disabled={isUploading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2"
                    >
                      {isUploading ? "Saving..." : `Save ${editingFile.name} Content`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </SettingsSection>
        </div>
      )}

      {/* TAB 4: USERS & ROLES */}
      {activeTab === "users" && <AdminUsersManager />}
    </div>
  );
}
