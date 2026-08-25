import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PILLAR_KEYS = ["syllabus", "ai", "video", "progress"] as const;

export function Home() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-2xl">
        <h1 className="font-sans text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
          {t("home.heroTitle")}
        </h1>
        <p className="mt-5 text-lg text-ink-soft dark:text-paper/70">
          {t("home.heroSubtitle")}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/student/login"
            className="rounded-full bg-turmeric px-5 py-2.5 font-medium text-ink hover:bg-turmeric-dark transition-colors"
          >
            {t("home.ctaStudent")}
          </Link>
          <Link
            to="/admin/login"
            className="rounded-full border border-ink/20 dark:border-paper/25 px-5 py-2.5 font-medium hover:border-ink/40 dark:hover:border-paper/50 transition-colors"
          >
            {t("home.ctaAdmin")}
          </Link>
        </div>
      </div>

      <dl className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        {PILLAR_KEYS.map((key, i) => (
          <div key={key} className="flex gap-3 border-t border-ink/10 dark:border-paper/10 pt-4">
            <dt className="font-mono text-sm text-turmeric-dark dark:text-turmeric shrink-0 pt-0.5">
              {String(i + 1).padStart(2, "0")}
            </dt>
            <dd className="text-ink-soft dark:text-paper/75">{t(`home.pillars.${key}`)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
