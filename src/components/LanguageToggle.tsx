import { useTranslation } from "react-i18next";
import type { SupportedLanguage } from "../utils/i18n";

export function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const current = i18n.language as SupportedLanguage;

  function select(lang: SupportedLanguage) {
    if (lang !== current) i18n.changeLanguage(lang);
  }

  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      className="inline-flex rounded-full border border-ink/15 dark:border-paper/20 p-0.5 text-sm"
    >
      {(["hi", "en"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => select(lang)}
          aria-pressed={current === lang}
          className={`rounded-full px-3 py-1 transition-colors ${
            current === lang
              ? "bg-turmeric text-ink font-medium"
              : "text-ink-soft dark:text-paper/70 hover:text-ink dark:hover:text-paper"
          }`}
        >
          {lang === "hi" ? "हिंदी" : "English"}
        </button>
      ))}
    </div>
  );
}
