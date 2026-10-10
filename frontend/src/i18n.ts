import i18n, { type ResourceKey } from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";

import enCommon from "./locales/en/common.json";
import enAuth from "./locales/en/auth.json";
import enDashboard from "./locales/en/dashboard.json";
import enShipments from "./locales/en/shipments.json";
import enSettings from "./locales/en/settings.json";
import enLanding from "./locales/en/landing.json";

const supportedLanguages = ["en", "fr", "es"] as const;
type SupportedLanguage = (typeof supportedLanguages)[number];

const namespaces = ["common", "auth", "dashboard", "shipments", "settings", "landing"] as const;

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

// Every locale except English is its own chunk, fetched the first time that
// language is needed — at startup for a non-English visitor, or on a switch.
const lazyLocales = import.meta.glob<{ default: ResourceKey }>([
  "./locales/*/*.json",
  "!./locales/en/*.json",
]);

i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      const load = lazyLocales[`./locales/${language}/${namespace}.json`];
      return load
        ? load()
        : Promise.reject(new Error(`No "${namespace}" locale for "${language}"`));
    }),
  )
  .init({
    lng: getInitialLanguage(),
    fallbackLng: "en",
    supportedLngs: supportedLanguages,
    ns: namespaces,
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
    },
    partialBundledLanguages: true,

    // Render the bundled English copy while another language loads instead of
    // suspending; components re-render once their namespace arrives.
    react: {
      useSuspense: false,
    },
  });

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language || "en";
  i18n.on("languageChanged", (lng: string) => {
    document.documentElement.lang = lng;
  });
}

export default i18n;
