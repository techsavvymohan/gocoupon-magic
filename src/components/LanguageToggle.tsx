import React, { useState, useRef, useEffect } from "react";
import { useI18n, SUPPORTED_LANGUAGES, LanguageCode } from "@/context/I18nContext";
import { Globe, Check, ChevronDown } from "lucide-react";

interface LanguageToggleProps {
  className?: string;
  variant?: "default" | "compact" | "footer";
}

export function LanguageToggle({ className = "", variant = "default" }: LanguageToggleProps) {
  const { language, setLanguage, currentLanguage, isRTL } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Change language. Current: ${currentLanguage.name}`}
        className={`group inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-2xs backdrop-blur-md transition-all duration-200 hover:border-border hover:bg-accent active:scale-95 cursor-pointer touch-manipulation focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
          variant === "footer"
            ? "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
            : ""
        }`}
      >
        <Globe className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="font-mono uppercase tracking-wider">{currentLanguage.code}</span>
        <ChevronDown
          className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select language"
          className={`absolute z-50 mt-2 w-52 rounded-2xl border border-border bg-card p-1.5 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
            isRTL ? "left-0" : "right-0"
          }`}
        >
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/50 mb-1">
            <Globe className="h-3 w-3" />
            <span>Select Language</span>
          </div>

          <div className="space-y-0.5 max-h-64 overflow-y-auto">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-muted font-mono text-[10px] font-bold uppercase text-foreground/80 shrink-0"
                      aria-hidden="true"
                    >
                      {lang.code}
                    </span>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="font-medium">{lang.nativeName}</span>
                      <span className="text-[10px] text-muted-foreground">{lang.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {lang.dir === "rtl" && (
                      <span className="rounded-sm bg-muted px-1 py-0.5 text-[9px] font-mono text-muted-foreground">
                        RTL
                      </span>
                    )}
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageToggle;
