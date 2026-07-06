import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import enAuth from "./locales/en/auth.json";
import enDashboard from "./locales/en/dashboard.json";
import enShipments from "./locales/en/shipments.json";
import enSettings from "./locales/en/settings.json";
import frCommon from "./locales/fr/common.json";    
import frAuth from "./locales/fr/auth.json";
import frDashboard from "./locales/fr/dashboard.json";
import frShipments from "./locales/fr/shipments.json";
import frSettings from "./locales/fr/settings.json";
import esCommon from "./locales/es/common.json";
import esAuth from "./locales/es/auth.json";
import esDashboard from "./locales/es/dashboard.json";
import esShipments from "./locales/es/shipments.json";
import esSettings from "./locales/es/settings.json";        


const savedLanguage =
  typeof window !== "undefined"
    ? localStorage.getItem("language") || "en"
    : "en";
i18n.use(initReactI18next).init({
  lng: savedLanguage,
  fallbackLng: "en",
  defaultNS: "common",

  interpolation: {
    escapeValue: false,
  },

  resources: {
    en: {
      common: enCommon,
      auth: enAuth,
      dashboard: enDashboard,
      shipments: enShipments,
      settings: enSettings,
    },
    fr: {
      common: frCommon,
      auth: frAuth,
      dashboard: frDashboard,
      shipments: frShipments,
      settings: frSettings,
    },
    es: {
      common: esCommon,
      auth: esAuth,
      dashboard: esDashboard,
      shipments: esShipments,
      settings: esSettings,
    },
  },
});

export default i18n;