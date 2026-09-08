import { useTranslation } from "react-i18next";

type Language = "en" | "hi" | "hinglish";

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const currentLanguage: Language =
    i18n.resolvedLanguage === "hi"
      ? "hi"
      : i18n.resolvedLanguage === "hinglish"
        ? "hinglish"
        : "en";

  const changeLanguage = (language: Language) => {
    i18n.changeLanguage(language);
    localStorage.setItem("vidyzen-language", language);
  };

  return (
    <div
      className="flex items-center rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => changeLanguage("en")}
        aria-pressed={currentLanguage === "en"}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
          currentLanguage === "en"
            ? "bg-white text-blue-600 shadow dark:bg-slate-700 dark:text-blue-400"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        }`}
      >
        English
      </button>

      <button
        type="button"
        onClick={() => changeLanguage("hi")}
        aria-pressed={currentLanguage === "hi"}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
          currentLanguage === "hi"
            ? "bg-white text-blue-600 shadow dark:bg-slate-700 dark:text-blue-400"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        }`}
      >
        हिंदी
      </button>

      <button
        type="button"
        onClick={() => changeLanguage("hinglish")}
        aria-pressed={currentLanguage === "hinglish"}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
          currentLanguage === "hinglish"
            ? "bg-white text-blue-600 shadow dark:bg-slate-700 dark:text-blue-400"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        }`}
      >
        Hinglish
      </button>
    </div>
  );
}

export default LanguageToggle;
