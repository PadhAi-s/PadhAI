import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../translations/en.json";
import hi from "../translations/hi.json";

export const SUPPORTED_LANGUAGES = ["en", "hi"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = "padhai:language";

function getStoredLanguage(): SupportedLanguage {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) {
    return stored as SupportedLanguage;
  }
  return "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: getStoredLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Keep <html lang> in sync for accessibility/screen readers, and persist
// the choice so it survives a reload (student.language_pref in the DB
// takes over once auth ships in Phase 2 — this is the logged-out default).
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  localStorage.setItem(STORAGE_KEY, lng);
});
document.documentElement.lang = i18n.language;

export default i18n;
