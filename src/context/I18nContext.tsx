import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export type LanguageCode = "en" | "hi" | "es" | "de" | "fr" | "ar";

export interface LanguageMeta {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  dir: "ltr" | "rtl";
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", dir: "ltr" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", dir: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇦🇪", dir: "rtl" },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    "nav.offers": "Offers",
    "nav.compare": "Compare",
    "nav.stores": "Stores",
    "nav.ask": "Ask AI",
    "nav.extension": "Extension",
    "nav.blog": "Blog",
    "nav.about": "About",
    "nav.security": "Security",
    "nav.disclosure": "Disclosure",
    "nav.privacy": "Privacy",
    "nav.contact": "Contact",
    "nav.addToChrome": "Add to Chrome — Free",

    "common.verified": "Verified",
    "common.exclusive": "Exclusive Deal",
    "common.realBargain": "Real Bargain",
    "common.fairDeal": "Fair Deal",
    "common.fakeDiscount": "Fake Discount Alert",
    "common.save": "Save",
    "common.copyCode": "Copy Code",
    "common.copied": "Copied!",
    "common.getDeal": "Get Deal",
    "common.bestPrice": "Best Price",
    "common.priceDrop": "Price Drop",
    "common.historyTracker": "30-Day Price Tracker",
    "common.activeDeals": "Active Verified Deals",
    "common.storesCovered": "200+ Stores Covered",
    "common.freeForever": "100% Free Forever",

    "footer.tagline": "The intelligent shopping assistant that tests verified coupon codes in 850ms, tracks 30-day price drops, and guarantees authentic savings across 200+ stores worldwide.",
    "footer.quickLinks": "Quick Links",
    "footer.legal": "Trust & Legal",
    "footer.privacyPolicy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.affiliateDisclosure": "Affiliate Disclosure",
    "footer.securityCenter": "Security Center",
    "footer.allRights": "All rights reserved.",
  },

  hi: {
    "nav.offers": "ऑफ़र्स",
    "nav.compare": "कीमत तुलना",
    "nav.stores": "दुकानें",
    "nav.ask": "शॉपिंग AI",
    "nav.extension": "एक्सटेंशन",
    "nav.blog": "ब्लॉग",
    "nav.about": "हमारे बारे में",
    "nav.security": "सुरक्षा",
    "nav.disclosure": "पारदर्शिता",
    "nav.privacy": "गोपनीयता",
    "nav.contact": "संपर्क",
    "nav.addToChrome": "Chrome में जोड़ें — मुफ्त",

    "common.verified": "सत्यापित",
    "common.exclusive": "विशेष डील",
    "common.realBargain": "सच्ची बचत",
    "common.fairDeal": "उचित सौदा",
    "common.fakeDiscount": "नकली छूट अलर्ट",
    "common.save": "बचत करें",
    "common.copyCode": "कोड कॉपी करें",
    "common.copied": "कॉपी हो गया!",
    "common.getDeal": "डील प्राप्त करें",
    "common.bestPrice": "सर्वोत्तम मूल्य",
    "common.priceDrop": "कीमत में गिरावट",
    "common.historyTracker": "30-दिन मूल्य ट्रैकर",
    "common.activeDeals": "सक्रिय सत्यापित डील्स",
    "common.storesCovered": "200+ समर्थित ऑनलाइन स्टोर्स",
    "common.freeForever": "100% हमेशा के लिए मुफ्त",

    "footer.tagline": "स्मार्ट शॉपिंग सहायक जो 850ms में कूपन कोड जांचता है, 30-दिनों की मूल्य गिरावट ट्रैक करता है, और दुनिया भर के 200+ स्टोर्स पर प्रामाणिक बचत सुनिश्चित करता है।",
    "footer.quickLinks": "त्वरित लिंक",
    "footer.legal": "विश्वास और कानूनी",
    "footer.privacyPolicy": "गोपनीयता नीति",
    "footer.terms": "सेवा की शर्तें",
    "footer.affiliateDisclosure": "एफिलिएट प्रकटीकरण",
    "footer.securityCenter": "सुरक्षा केंद्र",
    "footer.allRights": "सर्वाधिकार सुरक्षित।",
  },

  es: {
    "nav.offers": "Ofertas",
    "nav.compare": "Comparar",
    "nav.stores": "Tiendas",
    "nav.ask": "Asistente IA",
    "nav.extension": "Extensión",
    "nav.blog": "Blog",
    "nav.about": "Nosotros",
    "nav.security": "Seguridad",
    "nav.disclosure": "Divulgación",
    "nav.privacy": "Privacidad",
    "nav.contact": "Contacto",
    "nav.addToChrome": "Añadir a Chrome — Gratis",

    "common.verified": "Verificado",
    "common.exclusive": "Oferta Exclusiva",
    "common.realBargain": "Auténtica Ganga",
    "common.fairDeal": "Buen Precio",
    "common.fakeDiscount": "Alerta de Falso Descuento",
    "common.save": "Ahorra",
    "common.copyCode": "Copiar Código",
    "common.copied": "¡Copiado!",
    "common.getDeal": "Ver Oferta",
    "common.bestPrice": "Mejor Precio",
    "common.priceDrop": "Bajada de Precio",
    "common.historyTracker": "Historial de 30 Días",
    "common.activeDeals": "Ofertas Verificadas",
    "common.storesCovered": "Más de 200 Tiendas",
    "common.freeForever": "100% Gratis Siempre",

    "footer.tagline": "El asistente inteligente de compras que prueba cupones en 850ms, rastrea caídas de precios de 30 días y garantiza ahorros reales en más de 200 tiendas globales.",
    "footer.quickLinks": "Enlaces Rápidos",
    "footer.legal": "Seguridad y Legal",
    "footer.privacyPolicy": "Política de Privacidad",
    "footer.terms": "Términos de Servicio",
    "footer.affiliateDisclosure": "Divulgación de Afiliados",
    "footer.securityCenter": "Centro de Seguridad",
    "footer.allRights": "Todos los derechos reservados.",
  },

  de: {
    "nav.offers": "Angebote",
    "nav.compare": "Vergleichen",
    "nav.stores": "Shops",
    "nav.ask": "Einkaufs-KI",
    "nav.extension": "Erweiterung",
    "nav.blog": "Blog",
    "nav.about": "Über uns",
    "nav.security": "Sicherheit",
    "nav.disclosure": "Transparenz",
    "nav.privacy": "Datenschutz",
    "nav.contact": "Kontakt",
    "nav.addToChrome": "Zu Chrome hinzufügen — Kostenlos",

    "common.verified": "Verifiziert",
    "common.exclusive": "Exklusives Angebot",
    "common.realBargain": "Echtes Schnäppchen",
    "common.fairDeal": "Faires Angebot",
    "common.fakeDiscount": "Fake-Rabatt-Warnung",
    "common.save": "Sparen",
    "common.copyCode": "Code kopieren",
    "common.copied": "Kopiert!",
    "common.getDeal": "Deal ansehen",
    "common.bestPrice": "Bester Preis",
    "common.priceDrop": "Preissenkung",
    "common.historyTracker": "30-Tage Preisverlauf",
    "common.activeDeals": "Aktive geprüfte Deals",
    "common.storesCovered": "Über 200 Shops weltweit",
    "common.freeForever": "100% Dauerhaft kostenlos",

    "footer.tagline": "Der intelligente Einkaufsassistent, der Gutscheincodes in 850 ms testet, 30-tägige Preissenkungen verfolgt und echte Ersparnisse in über 200 Shops garantiert.",
    "footer.quickLinks": "Schnellzugriff",
    "footer.legal": "Rechtliches & Vertrauen",
    "footer.privacyPolicy": "Datenschutzerklärung",
    "footer.terms": "Nutzungsbedingungen",
    "footer.affiliateDisclosure": "Partnerhinweis",
    "footer.securityCenter": "Sicherheitscenter",
    "footer.allRights": "Alle Rechte vorbehalten.",
  },

  fr: {
    "nav.offers": "Offres",
    "nav.compare": "Comparer",
    "nav.stores": "Boutiques",
    "nav.ask": "Assistant IA",
    "nav.extension": "Extension",
    "nav.blog": "Blog",
    "nav.about": "À propos",
    "nav.security": "Sécurité",
    "nav.disclosure": "Transparence",
    "nav.privacy": "Confidentialité",
    "nav.contact": "Contact",
    "nav.addToChrome": "Ajouter à Chrome — Gratuit",

    "common.verified": "Vérifié",
    "common.exclusive": "Offre Exclusive",
    "common.realBargain": "Vraie Affaire",
    "common.fairDeal": "Prix Juste",
    "common.fakeDiscount": "Alerte Fausse Promo",
    "common.save": "Économisez",
    "common.copyCode": "Copier le code",
    "common.copied": "Copié !",
    "common.getDeal": "Voir l'offre",
    "common.bestPrice": "Meilleur prix",
    "common.priceDrop": "Baisse de prix",
    "common.historyTracker": "Historique 30 jours",
    "common.activeDeals": "Offres vérifiées actives",
    "common.storesCovered": "Plus de 200 boutiques",
    "common.freeForever": "100% Gratuit pour toujours",

    "footer.tagline": "L'assistant d'achat intelligent qui teste les codes promo en 850 ms, suit les baisses de prix sur 30 jours et garantit des économies authentiques dans plus de 200 boutiques.",
    "footer.quickLinks": "Accès Rapide",
    "footer.legal": "Confiance & Légal",
    "footer.privacyPolicy": "Politique de Confidentialité",
    "footer.terms": "Conditions d'Utilisation",
    "footer.affiliateDisclosure": "Divulgation d'Affiliation",
    "footer.securityCenter": "Centre de Sécurité",
    "footer.allRights": "Tous droits réservés.",
  },

  ar: {
    "nav.offers": "العروض",
    "nav.compare": "مقارنة الأسعار",
    "nav.stores": "المتاجر",
    "nav.ask": "المساعد الذكي",
    "nav.extension": "الإضافة",
    "nav.blog": "المدونة",
    "nav.about": "من نحن",
    "nav.security": "الأمان",
    "nav.disclosure": "الشفافية",
    "nav.privacy": "الخصوصية",
    "nav.contact": "اتصل بنا",
    "nav.addToChrome": "أضف إلى Chrome — مجاناً",

    "common.verified": "تم التحقق",
    "common.exclusive": "عرض حصري",
    "common.realBargain": "صفقة حقيقية",
    "common.fairDeal": "سعر عادل",
    "common.fakeDiscount": "تنبيه تخفيض وهمي",
    "common.save": "وفر",
    "common.copyCode": "نسخ الكود",
    "common.copied": "تم النسخ!",
    "common.getDeal": "الحصول على العرض",
    "common.bestPrice": "أفضل سعر",
    "common.priceDrop": "انخفاض السعر",
    "common.historyTracker": "مخطط الأسعار لـ 30 يوماً",
    "common.activeDeals": "عروض نشطة ومؤكدة",
    "common.storesCovered": "أكثر من 200 متجر عالمي",
    "common.freeForever": "100% مجاني دائماً",

    "footer.tagline": "مساعد التسوق الذكي الذي يختبر كوبونات الخصم في 850 مللي ثانية، ويتبع انخفاض الأسعار على مدار 30 يوماً ويضمن توفيراً حقيقياً عبر أكثر من 200 متجر عالمي.",
    "footer.quickLinks": "روابط سريعة",
    "footer.legal": "الأمان واللوائح",
    "footer.privacyPolicy": "سياسة الخصوصية",
    "footer.terms": "شروط الخدمة",
    "footer.affiliateDisclosure": "إفصاح الشراكة",
    "footer.securityCenter": "مركز الأمان",
    "footer.allRights": "جميع الحقوق محفوظة.",
  },
};

interface I18nContextType {
  language: LanguageCode;
  currentLanguage: LanguageMeta;
  languages: LanguageMeta[];
  dir: "ltr" | "rtl";
  isRTL: boolean;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, defaultText?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY_LANGUAGE = "gocoupon_language";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(STORAGE_KEY_LANGUAGE) as LanguageCode;
      if (cached && TRANSLATIONS[cached]) return cached;

      // Detect browser language
      try {
        const navLang = (navigator.language || "").toLowerCase().slice(0, 2);
        if (navLang === "hi") return "hi";
        if (navLang === "es") return "es";
        if (navLang === "de") return "de";
        if (navLang === "fr") return "fr";
        if (navLang === "ar") return "ar";
      } catch {}
    }
    return "en";
  });

  const currentLanguage = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const dir = currentLanguage.dir;
  const isRTL = dir === "rtl";

  // Sync document language and direction
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
    }
  }, [language, dir]);

  const setLanguage = useCallback((newLang: LanguageCode) => {
    if (!TRANSLATIONS[newLang]) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY_LANGUAGE, newLang);
    } catch {}
  }, []);

  const t = useCallback(
    (key: string, defaultText?: string): string => {
      const langDict = TRANSLATIONS[language];
      if (langDict && langDict[key]) {
        return langDict[key];
      }
      // Fallback to English
      const enDict = TRANSLATIONS.en;
      if (enDict && enDict[key]) {
        return enDict[key];
      }
      return defaultText || key;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      currentLanguage,
      languages: SUPPORTED_LANGUAGES,
      dir,
      isRTL,
      setLanguage,
      t,
    }),
    [language, currentLanguage, dir, isRTL, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
