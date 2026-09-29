"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getAdminAuthHeaders } from "@/context/AdminAuthContext";
import { broadcastFestiveBannerUpdate } from "@/lib/hero-banner";

const initialHeroState = {
  eyebrow: "Exclusive Daily Deals",
  titleLineOne: "Smart Shopping,",
  titleAccent: "Better Saving",
  description: "Unlock verified discounts from the world's leading brands. The smarter way to checkout.",
  searchPlaceholder: "Search stores, coupons, deals",
  searchButtonLabel: "Search Offers",
  memberCountText: "Join 126k+ members saving daily",
  slides: [],
  festiveBanner: {
    enabled: true,
    badgeTitle: "Festive Mega-Sales 2026:",
    message: "Amazon Great Indian Festival & Flipkart Big Billion Days verified codes live!",
    linkText: "Explore Deals",
    linkUrl: "/featured-deals",
    colorScheme: "amber",
    showPingDot: true,
    expiresAt: "",
  },
};

const festiveTemplates = [
  {
    name: "Amazon & Flipkart Mega Sale",
    badgeTitle: "Festive Mega-Sales 2026:",
    message: "Amazon Great Indian Festival & Flipkart Big Billion Days verified codes live!",
    linkText: "Explore Deals",
    linkUrl: "/featured-deals",
    colorScheme: "amber",
  },
  {
    name: "Diwali Dhamaka Offers",
    badgeTitle: "Diwali Dhamaka Offers:",
    message: "Exclusive festive gift vouchers, electronics discounts & extra 15% cashback live!",
    linkText: "Shop Diwali Deals",
    linkUrl: "/offers",
    colorScheme: "amber",
  },
  {
    name: "Black Friday & Cyber Week",
    badgeTitle: "Black Friday Mega Sale:",
    message: "Up to 80% OFF on 240+ international & national stores with auto-apply codes!",
    linkText: "Claim Discounts",
    linkUrl: "/featured-deals",
    colorScheme: "rose",
  },
  {
    name: "Super Savers Cashback Week",
    badgeTitle: "Super Savers Week:",
    message: "Double cashback rewards & tested promo codes on travel, fashion and food!",
    linkText: "View Offers",
    linkUrl: "/offers",
    colorScheme: "emerald",
  },
  {
    name: "Prime Tech & Electronics Fest",
    badgeTitle: "Prime Electronics Fest:",
    message: "Lowest prices of the year on laptops, smartphones & audio gear guaranteed!",
    linkText: "Explore Tech Deals",
    linkUrl: "/categories",
    colorScheme: "indigo",
  },
];

const colorSchemes = [
  { id: "amber", label: "Amber / Gold", bg: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
  { id: "rose", label: "Rose / Hot Deals", bg: "bg-rose-500", text: "text-rose-700 dark:text-rose-400" },
  { id: "emerald", label: "Emerald Savers", bg: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
  { id: "indigo", label: "Indigo Tech", bg: "bg-indigo-500", text: "text-indigo-700 dark:text-indigo-400" },
  { id: "purple", label: "Royal Purple", bg: "bg-purple-500", text: "text-purple-700 dark:text-purple-400" },
];

function SectionField({ label, children, hint }) {
  return (
    <label className="grid gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">{hint}</span> : null}
    </label>
  );
}

function SettingsSection({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs">
      <div className="mb-5 border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">{title}</h3>
        {description ? <p className="mt-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

export default function AdminHeroManager() {
  const [hero, setHero] = useState(initialHeroState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadHero() {
      try {
        const response = await fetch("/api/homepage/hero", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load hero settings.");
        }

        if (active && payload?.data) {
          setHero({
            ...initialHeroState,
            ...payload.data,
            festiveBanner: {
              ...initialHeroState.festiveBanner,
              ...(payload.data.festiveBanner || {}),
            },
          });
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadHero();

    return () => {
      active = false;
    };
  }, []);

  function updateFestiveBanner(field, value) {
    setHero((current) => ({
      ...current,
      festiveBanner: {
        ...(current.festiveBanner || initialHeroState.festiveBanner),
        [field]: value,
      },
    }));
  }

  function applyFestiveTemplate(tpl) {
    setHero((current) => ({
      ...current,
      festiveBanner: {
        ...(current.festiveBanner || initialHeroState.festiveBanner),
        badgeTitle: tpl.badgeTitle,
        message: tpl.message,
        linkText: tpl.linkText,
        linkUrl: tpl.linkUrl,
        colorScheme: tpl.colorScheme,
        enabled: true,
      },
    }));
    toast.success(`Loaded "${tpl.name}" template.`);
  }

  function updateHeroSlide(index, field, value) {
    setHero((current) => ({
      ...current,
      slides: current.slides.map((slide, slideIndex) => (slideIndex === index ? { ...slide, [field]: value } : slide)),
    }));
  }

  async function handleBannerUpload(index, file) {
    if (!file) return;
    setUploadingIndex(index);
    const toastId = toast.loading("Uploading banner image...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads/banner-image", {
        method: "POST",
        headers: getAdminAuthHeaders(),
        body: formData,
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to upload image.");

      const imageUrl = payload.data.secureUrl;
      updateHeroSlide(index, "image", imageUrl);
      toast.success("Banner image uploaded successfully!", { id: toastId });
    } catch (err) {
      toast.error(err.message || "Failed to upload banner image.", { id: toastId });
    } finally {
      setUploadingIndex(null);
    }
  }

  function addHeroSlide() {
    setHero((current) => ({
      ...current,
      slides: [
        ...current.slides,
        {
          id: `hero-slide-${Date.now()}`,
          image: "",
          badge: "PROMO DEAL • LIVE NOW",
          kicker: "SPECIAL OFFER",
          title: "New Promo Campaign",
          description: "Description of your promotional campaign.",
          discount: "-30% OFF",
          code: "DEAL30",
          link: "/stores",
        },
      ],
    }));
  }

  function removeHeroSlide(index) {
    setHero((current) => ({
      ...current,
      slides: current.slides.filter((_, slideIndex) => slideIndex !== index),
    }));
  }

  function moveHeroSlide(index, direction) {
    setHero((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.slides.length) return current;

      const nextSlides = [...current.slides];
      const [movedSlide] = nextSlides.splice(index, 1);
      nextSlides.splice(nextIndex, 0, movedSlide);

      return {
        ...current,
        slides: nextSlides,
      };
    });
  }

  async function saveHero() {
    try {
      setIsSaving(true);
      const response = await fetch("/api/homepage/hero", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({ hero }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to save hero settings.");
      }

      const updated = payload.data || hero;
      setHero((prev) => ({
        ...prev,
        ...updated,
        festiveBanner: {
          ...prev.festiveBanner,
          ...(updated.festiveBanner || {}),
        },
      }));

      // Broadcast real-time update to homepage
      if (hero.festiveBanner) {
        broadcastFestiveBannerUpdate(hero.festiveBanner);
      }

      toast.success("Hero settings and festive banner updated live!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        Loading hero settings & festive banner manager...
      </div>
    );
  }

  const fb = hero.festiveBanner || initialHeroState.festiveBanner;

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Homepage Hero & Festive Banner Control</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">
            Manage the dynamic festive announcement banner (turn ON during festivals, turn OFF when ended) and carousel slides.
          </p>
        </div>

        <Button
          type="button"
          onClick={saveHero}
          disabled={isSaving}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition cursor-pointer"
        >
          {isSaving ? "Saving Settings..." : "Save All Hero Settings"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* ── 1. FESTIVE & SEASONAL ANNOUNCEMENT BANNER (Hero Pill) ── */}
        <SettingsSection
          title="Festive & Seasonal Announcement Banner (Hero Pill)"
          description="Control the festive promotional pill banner displayed on the homepage Hero. Turn it ON during festivals and mega-sales (Diwali, Amazon GIF, Flipkart BBD, Black Friday), customize title, message, link, and theme, or turn it OFF when not in season."
        >
          <div className="space-y-6">
            {/* Status & Toggle Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
              <div className="flex items-center gap-3">
                <Switch
                  checked={Boolean(fb.enabled)}
                  onCheckedChange={(val) => updateFestiveBanner("enabled", val)}
                  id="festive-banner-toggle"
                />
                <div>
                  <label htmlFor="festive-banner-toggle" className="text-sm font-bold text-zinc-900 dark:text-white cursor-pointer block">
                    {fb.enabled ? "Festive Banner is ACTIVE" : "Festive Banner is DISABLED"}
                  </label>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    {fb.enabled
                      ? "The festive announcement pill is currently displayed live above the hero headline."
                      : "The banner is completely hidden on the homepage (ideal when no festival is active)."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {fb.enabled ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE ON HOMEPAGE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
                    <span className="h-2 w-2 rounded-full bg-zinc-400" />
                    HIDDEN
                  </span>
                )}
              </div>
            </div>

            {/* Interactive Live Homepage Preview */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-950/60 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">Live Homepage Preview</span>
              {fb.enabled ? (
                <div
                  className={`inline-flex flex-wrap items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs sm:text-sm font-medium shadow-2xs backdrop-blur-xs transition-all ${
                    fb.colorScheme === "rose"
                      ? "border-rose-500/30 bg-rose-500/10 text-zinc-900 dark:text-zinc-100"
                      : fb.colorScheme === "emerald"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-zinc-900 dark:text-zinc-100"
                      : fb.colorScheme === "indigo"
                      ? "border-indigo-500/30 bg-indigo-500/10 text-zinc-900 dark:text-zinc-100"
                      : fb.colorScheme === "purple"
                      ? "border-purple-500/30 bg-purple-500/10 text-zinc-900 dark:text-zinc-100"
                      : "border-amber-500/30 bg-amber-500/10 text-zinc-900 dark:text-zinc-100"
                  }`}
                >
                  {fb.showPingDot && (
                    <span
                      className={`flex h-2 w-2 rounded-full animate-ping ${
                        fb.colorScheme === "rose"
                          ? "bg-rose-500"
                          : fb.colorScheme === "emerald"
                          ? "bg-emerald-500"
                          : fb.colorScheme === "indigo"
                          ? "bg-indigo-500"
                          : fb.colorScheme === "purple"
                          ? "bg-purple-500"
                          : "bg-amber-500"
                      }`}
                    />
                  )}
                  <span>
                    {fb.badgeTitle && (
                      <strong
                        className={`font-bold mr-1 ${
                          fb.colorScheme === "rose"
                            ? "text-rose-700 dark:text-rose-400"
                            : fb.colorScheme === "emerald"
                            ? "text-emerald-700 dark:text-emerald-400"
                            : fb.colorScheme === "indigo"
                            ? "text-indigo-700 dark:text-indigo-400"
                            : fb.colorScheme === "purple"
                            ? "text-purple-700 dark:text-purple-400"
                            : "text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {fb.badgeTitle}
                      </strong>
                    )}
                    {fb.message || "Your festival announcement text here..."}
                  </span>
                  {fb.linkText && (
                    <span
                      className={`font-bold underline underline-offset-2 ml-0.5 inline-flex items-center gap-0.5 ${
                        fb.colorScheme === "rose"
                          ? "text-rose-700 dark:text-rose-300"
                          : fb.colorScheme === "emerald"
                          ? "text-emerald-700 dark:text-emerald-300"
                          : fb.colorScheme === "indigo"
                          ? "text-indigo-700 dark:text-indigo-300"
                          : fb.colorScheme === "purple"
                          ? "text-purple-700 dark:text-purple-300"
                          : "text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {fb.linkText} →
                    </span>
                  )}
                </div>
              ) : (
                <div className="py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  🚫 Festive banner is currently disabled. Toggle ON to display it on the homepage.
                </div>
              )}
            </div>

            {/* Quick 1-Click Festival Templates */}
            <div>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-2">
                ⚡ 1-Click Festival Templates:
              </span>
              <div className="flex flex-wrap gap-2">
                {festiveTemplates.map((tpl) => (
                  <button
                    key={tpl.name}
                    type="button"
                    onClick={() => applyFestiveTemplate(tpl)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-2xs"
                  >
                    <span>{tpl.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <SectionField label="Festival Badge Title" hint="e.g. Festive Mega-Sales 2026: or Diwali Dhamaka:">
                <Input
                  value={fb.badgeTitle || ""}
                  onChange={(e) => updateFestiveBanner("badgeTitle", e.target.value)}
                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  placeholder="Festive Mega-Sales 2026:"
                />
              </SectionField>

              <SectionField label="Announcement Message" hint="Description of verified festive sales and deals">
                <Input
                  value={fb.message || ""}
                  onChange={(e) => updateFestiveBanner("message", e.target.value)}
                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  placeholder="Amazon Great Indian Festival & Flipkart Big Billion Days verified codes live!"
                />
              </SectionField>

              <SectionField label="CTA Button Text" hint="e.g. Explore Deals, Claim Coupons">
                <Input
                  value={fb.linkText || ""}
                  onChange={(e) => updateFestiveBanner("linkText", e.target.value)}
                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  placeholder="Explore Deals"
                />
              </SectionField>

              <SectionField label="CTA Target URL" hint="e.g. /featured-deals or /offers">
                <Input
                  value={fb.linkUrl || ""}
                  onChange={(e) => updateFestiveBanner("linkUrl", e.target.value)}
                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  placeholder="/featured-deals"
                />
              </SectionField>
            </div>

            {/* Color Scheme Selector */}
            <div>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-2">Banner Color Theme:</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {colorSchemes.map((cs) => {
                  const isSelected = fb.colorScheme === cs.id;
                  return (
                    <button
                      key={cs.id}
                      type="button"
                      onClick={() => updateFestiveBanner("colorScheme", cs.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-2xs"
                          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50"
                      }`}
                    >
                      <span className={`h-3.5 w-3.5 rounded-full ${cs.bg} shrink-0`} />
                      <span className="truncate">{cs.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Animation and Auto-Expiry Controls */}
            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <Switch
                  checked={Boolean(fb.showPingDot)}
                  onCheckedChange={(val) => updateFestiveBanner("showPingDot", val)}
                  id="ping-dot-toggle"
                />
                <label htmlFor="ping-dot-toggle" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  Show Animated Pulsing Ping Dot
                </label>
              </div>

              <SectionField label="Auto-Expiry Date (Optional)" hint="Automatically hides the banner after this date">
                <Input
                  type="date"
                  value={fb.expiresAt || ""}
                  onChange={(e) => updateFestiveBanner("expiresAt", e.target.value)}
                  className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </SectionField>
            </div>

            {/* Section Action Button */}
            <div className="flex justify-end pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                type="button"
                onClick={saveHero}
                disabled={isSaving}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-semibold text-white cursor-pointer shadow-xs"
              >
                {isSaving ? "Saving Banner..." : "Save Festive Banner"}
              </Button>
            </div>
          </div>
        </SettingsSection>

        {/* ── 2. HOMEPAGE HERO CAROUSEL SLIDES ── */}
        <SettingsSection
          title="Homepage Hero Slider Banners"
          description="Manage promotional banner cards, upload banner images from your device, set links, and reorder slides."
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">Active Slides ({hero.slides?.length || 0})</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Upload banner images directly, or paste external URLs.</p>
            </div>
            <Button
              type="button"
              onClick={addHeroSlide}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 cursor-pointer"
            >
              + Add New Banner Slide
            </Button>
          </div>

          <div className="space-y-6">
            {(hero.slides || []).map((slide, index) => (
              <div key={slide.id || index} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 p-5 shadow-2xs">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-zinc-200/60 dark:border-zinc-800 pb-3 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      Slide #{index + 1}: {slide.title || "Untitled Banner"}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-semibold dark:bg-zinc-800 dark:border-zinc-700 dark:text-white cursor-pointer"
                      onClick={() => moveHeroSlide(index, -1)}
                      disabled={index === 0}
                    >
                      Move Up
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-semibold dark:bg-zinc-800 dark:border-zinc-700 dark:text-white cursor-pointer"
                      onClick={() => moveHeroSlide(index, 1)}
                      disabled={index === (hero.slides?.length || 0) - 1}
                    >
                      Move Down
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                      onClick={() => removeHeroSlide(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                  {/* Visual Card Preview */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Card Preview</span>
                    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-white relative">
                      <div className="relative aspect-[2.1/1] p-4 flex flex-col justify-between">
                        {slide.image ? (
                          <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${slide.image})` }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-zinc-500 bg-zinc-900">
                            No image selected
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        <div className="relative z-10 flex items-center justify-between">
                          <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-zinc-900 shadow-xs">
                            {slide.badge || "PROMO DEAL"}
                          </span>
                        </div>

                        <div className="relative z-10 space-y-1">
                          <h3 className="text-base font-black text-white leading-tight truncate">{slide.title || "Banner Title"}</h3>

                          <div className="flex items-center justify-between pt-1 gap-2">
                            <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs shrink-0">
                              {slide.discount || "-50% OFF"}
                            </span>
                            {slide.link && (
                              <span
                                className="max-w-[140px] sm:max-w-[180px] truncate text-[9.5px] font-mono bg-black/70 backdrop-blur-xs text-zinc-300 border border-white/15 px-2 py-0.5 rounded-full shrink-0"
                                title={slide.link}
                              >
                                🔗 {slide.link.replace(/^https?:\/\//, "")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <div className="grid gap-3.5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <SectionField label="Banner Image (Upload file or paste URL)">
                        <div className="flex items-center gap-2">
                          <Input
                            value={slide.image || ""}
                            onChange={(e) => updateHeroSlide(index, "image", e.target.value)}
                            className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                            placeholder="https://... or /banners/banner-1.png"
                          />
                          <label className="shrink-0 cursor-pointer rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs px-3 py-2 transition shadow-xs">
                            {uploadingIndex === index ? "Uploading..." : "Upload Image"}
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/svg+xml"
                              className="hidden"
                              onChange={(e) => handleBannerUpload(index, e.target.files?.[0])}
                            />
                          </label>
                        </div>
                      </SectionField>
                    </div>

                    <SectionField label="Target Link URL" hint="e.g. /stores or /stores/fashion/nike">
                      <Input
                        value={slide.link || ""}
                        onChange={(e) => updateHeroSlide(index, "link", e.target.value)}
                        className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                        placeholder="/stores"
                      />
                    </SectionField>

                    <SectionField label="Banner Title">
                      <Input
                        value={slide.title || ""}
                        onChange={(e) => updateHeroSlide(index, "title", e.target.value)}
                        className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                      />
                    </SectionField>

                    <SectionField label="Discount Tag" hint="e.g. UP TO 70% OFF">
                      <Input
                        value={slide.discount || ""}
                        onChange={(e) => updateHeroSlide(index, "discount", e.target.value)}
                        className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                      />
                    </SectionField>

                    <SectionField label="Top Badge" hint="e.g. FLASH SALE">
                      <Input
                        value={slide.badge || ""}
                        onChange={(e) => updateHeroSlide(index, "badge", e.target.value)}
                        className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                      />
                    </SectionField>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
