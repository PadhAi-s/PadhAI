import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ComingSoonProps {
  title: string;
  subtitle: string;
  phaseNote: string;
}

/**
 * Used for routes that exist (so navigation/links don't 404) but whose
 * real implementation lands in a later phase. Intentionally honest about
 * that instead of showing a form that doesn't actually do anything.
 */
export function ComingSoon({ title, subtitle, phaseNote }: ComingSoonProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-ink-soft dark:text-paper/70">{subtitle}</p>
      <p className="mt-6 inline-block rounded-full bg-paper-dim dark:bg-ink-soft/40 px-4 py-1.5 text-sm text-ink-soft dark:text-paper/70">
        {t("common.comingSoon")} — {phaseNote}
      </p>
      <div className="mt-8">
        <Link to="/" className="text-peacock dark:text-turmeric hover:underline">
          {t("common.backToHome")}
        </Link>
      </div>
    </div>
  );
}
