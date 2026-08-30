import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PILLAR_KEYS = ["syllabus", "ai", "video", "progress"] as const;

export function Home() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="max-w-2xl">
        <h1 className="font-sans text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {t("home.heroTitle")}
        </h1>

        <p className="mt-5 text-lg text-ink-soft dark:text-paper/70">
          {t("home.heroSubtitle")}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/student/login"
            className="rounded-full bg-turmeric px-5 py-2.5 font-medium text-ink transition-colors hover:bg-turmeric-dark"
          >
            {t("home.ctaStudent")}
          </Link>
        </div>
      </div>

      <dl className="mt-20 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        {PILLAR_KEYS.map((key, i) => (
          <div
            key={key}
            className="flex gap-3 border-t border-ink/10 pt-4 dark:border-paper/10"
          >
            <dt className="shrink-0 pt-0.5 font-mono text-sm text-turmeric-dark dark:text-turmeric">
              {String(i + 1).padStart(2, "0")}
            </dt>

            <dd className="text-ink-soft dark:text-paper/75">
              {t(`home.pillars.${key}`)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default Home;
