import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language?.startsWith("hi")
    ? "hi"
    : "en";

  function changeLanguage(language: "hi" | "en") {
    i18n.changeLanguage(language);
    localStorage.setItem("padhai-language", language);
  }

  return (
    <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 p-1 shadow-sm">
      <button
        type="button"
        onClick={() => changeLanguage("hi")}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          currentLanguage === "hi"
            ? "bg-white text-slate-900 shadow"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        हिंदी
      </button>

      <button
        type="button"
        onClick={() => changeLanguage("en")}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          currentLanguage === "en"
            ? "bg-white text-slate-900 shadow"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        English
      </button>
    </div>
  );
}
