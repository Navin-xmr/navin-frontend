import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import enAuth from "./locales/en/auth.json";
import enDashboard from "./locales/en/dashboard.json";
import enShipments from "./locales/en/shipments.json";
import enSettings from "./locales/en/settings.json";

const supportedLanguages = ["en", "fr", "es"] as const;
type SupportedLanguage = (typeof supportedLanguages)[number];

const namespaces = ["common", "auth", "dashboard", "shipments", "settings"] as const;

const isSupportedLanguage = (value: string): value is SupportedLanguage =>
  (supportedLanguages as readonly string[]).includes(value);

const detectBrowserLanguage = (): SupportedLanguage => {
  if (typeof navigator === "undefined") return "en";

  const candidates = [
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const base = candidate.toLowerCase().split("-")[0];
    if (isSupportedLanguage(base)) return base;
  }

  return "en";
};

const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("language");
    if (saved && isSupportedLanguage(saved)) return saved;
  }

  return detectBrowserLanguage();
};

const loadLocaleResources = async (language: SupportedLanguage) => {
  const modules = await Promise.all(
    namespaces.map((ns) => import(`./locales/${language}/${ns}.json`)),
  );

  return namespaces.reduce<Record<string, unknown>>((acc, ns, index) => {
    acc[ns] = modules[index].default ?? modules[index];
    return acc;
  }, {});
};

import enLanding from "./locales/en/landing.json";
import frCommon from "./locales/fr/common.json";
import frAuth from "./locales/fr/auth.json";
import frDashboard from "./locales/fr/dashboard.json";
import frShipments from "./locales/fr/shipments.json";
import frSettings from "./locales/fr/settings.json";
import frLanding from "./locales/fr/landing.json";
import esCommon from "./locales/es/common.json";
import esAuth from "./locales/es/auth.json";
import esDashboard from "./locales/es/dashboard.json";
import esShipments from "./locales/es/shipments.json";
import esSettings from "./locales/es/settings.json";
import esLanding from "./locales/es/landing.json";


i18n.use(initReactI18next).init({
  lng: getInitialLanguage(),
  fallbackLng: "en",
  supportedLngs: supportedLanguages,
  defaultNS: "common",

  interpolation: {
    escapeValue: false,
  },

  // English stays bundled so the fallback is available without a network round-trip.
  resources: {
    en: {
      common: enCommon,
      auth: enAuth,
      dashboard: enDashboard,
      shipments: enShipments,
      settings: enSettings,
      landing: enLanding,
    },
    fr: {
      common: frCommon,
      auth: frAuth,
      dashboard: frDashboard,
      shipments: frShipments,
      settings: frSettings,
      landing: frLanding,
    },
    es: {
      common: esCommon,
      auth: esAuth,
      dashboard: esDashboard,
      shipments: esShipments,
      settings: esSettings,
      landing: esLanding,
    },
  },

  partialBundledLanguages: true,
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language || "en";
  i18n.on("languageChanged", (lng: string) => {
    document.documentElement.lang = lng;
  });
}

// Lazy-load the active language's namespaces when it is not the bundled fallback.
const activeLanguage = i18n.language as SupportedLanguage;
if (activeLanguage !== "en" && isSupportedLanguage(activeLanguage)) {
  loadLocaleResources(activeLanguage).then((resources) => {
    i18n.addResourceBundle(activeLanguage, "common", resources.common, true, true);
    i18n.addResourceBundle(activeLanguage, "auth", resources.auth, true, true);
    i18n.addResourceBundle(activeLanguage, "dashboard", resources.dashboard, true, true);
    i18n.addResourceBundle(activeLanguage, "shipments", resources.shipments, true, true);
    i18n.addResourceBundle(activeLanguage, "settings", resources.settings, true, true);
  });
}

export default i18n;