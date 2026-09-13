"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialHeroState = {
  eyebrow: "Exclusive Daily Deals",
  titleLineOne: "Smart Shopping,",
  titleAccent: "Better Saving",
  description: "Unlock verified discounts from the world's leading brands. The smarter way to checkout.",
  searchPlaceholder: "Search stores, coupons, deals",
  searchButtonLabel: "Search Offers",
  memberCountText: "Join 126k+ members saving daily",
  slides: [],
};

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
          setHero(payload.data);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to save hero settings.");
      }

      setHero(payload.data);
      toast.success("All Hero Banners saved and updated live!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        Loading hero slider manager...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Homepage Hero Banners & Slider Control</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">
            Manage promotional banner cards, images, discount tags, and slide ordering for the main homepage slider.
          </p>
        </div>

        <Button
          type="button"
          onClick={saveHero}
          disabled={isSaving}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition cursor-pointer"
        >
          {isSaving ? "Saving Banners..." : "Save All Hero Banners"}
        </Button>
      </div>

      <div className="grid gap-6">

        {/* SLIDER BANNERS */}
        <SettingsSection
          title="Homepage Hero Slider Banners"
          description="Manage promotional banner cards, upload banner images from your device, set links, and reorder slides."
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">Active Slides ({hero.slides?.length || 0})</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Upload banner images directly, or paste external URLs.</p>
            </div>
            <Button type="button" onClick={addHeroSlide} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 cursor-pointer">
              + Add New Banner Slide
            </Button>
          </div>

          <div className="space-y-6">
            {(hero.slides || []).map((slide, index) => (
              <div key={slide.id || index} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 p-5 shadow-2xs">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-zinc-200/60 dark:border-zinc-800 pb-3 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Slide #{index + 1}: {slide.title || "Untitled Banner"}</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-semibold dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                      onClick={() => moveHeroSlide(index, -1)}
                      disabled={index === 0}
                    >
                      Move Up
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-semibold dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
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
                              <span className="max-w-[140px] sm:max-w-[180px] truncate text-[9.5px] font-mono bg-black/70 backdrop-blur-xs text-zinc-300 border border-white/15 px-2 py-0.5 rounded-full shrink-0" title={slide.link}>
                                🔗 {slide.link.replace(/^https?:\/\//, '')}
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
