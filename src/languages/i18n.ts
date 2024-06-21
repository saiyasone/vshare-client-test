import i18n from "i18next";
import enTranslation from "languages/en.json";
import laTranslation from "languages/la.json";
import { initReactI18next } from "react-i18next";

const resources = {
  en: enTranslation,
  la: laTranslation,
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});
