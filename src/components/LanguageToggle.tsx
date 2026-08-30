import { useTranslation } from "react-i18next";

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const language = i18n.language?.startsWith("hi") ? "hi" : "en";

  async function changeLanguage(nextLanguage: "hi" | "en") {
    await i18n.changeLanguage(nextLanguage);
  }

  return (
    <div className="flex items-center rounded-full border border-slate-300 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => changeLanguage("hi")}
        className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
          language === "hi"
            ? "bg-amber-500 text-white shadow"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        हिंदी
      </button>

      <button
        type="button"
        onClick={() => changeLanguage("en")}
        className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
          language === "en"
            ? "bg-amber-500 text-white shadow"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        English
      </button>
    </div>
  );
}

export default LanguageToggle;
