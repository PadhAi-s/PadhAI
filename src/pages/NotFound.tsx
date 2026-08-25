import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold">{t("notFound.title")}</h1>
      <p className="mt-2 text-ink-soft dark:text-paper/70">{t("notFound.body")}</p>
      <div className="mt-8">
        <Link to="/" className="text-peacock dark:text-turmeric hover:underline">
          {t("notFound.cta")}
        </Link>
      </div>
    </div>
  );
}
