import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { LanguageToggle } from "../../components/LanguageToggle";

export function StudentDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  async function handleLogout() {
    setMenuOpen(false);

    await signOut();

    navigate("/student/login");
  }

  function handleProfile() {
    setMenuOpen(false);
    navigate("/student/profile");
  }

  function handleSyllabus() {
    setMenuOpen(false);
    navigate("/student/syllabus");
  }

  function handleDailyNewspaper() {
    navigate("/student/daily-newspaper");
  }

  function handleCurrentAffairs() {
    navigate("/student/current-affairs");
  }

  function handleQuickRevision() {
    navigate("/student/quick-revision");
  }

  function handleAskPadhAI() {
    navigate("/student/ask");
  }

  function handleVocabBhaiya() {
    window.open(
      "https://vocabbhaiya.netlify.app/",
      "_blank",
      "noopener,noreferrer",
    );
  }

  const studentName =
    profile?.full_name ||
    user?.email?.split("@")[0] ||
    t("common.student");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* DASHBOARD HEADER */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          {/* LEFT */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              PadhAI Student
            </p>

            <h1 className="mt-1 text-xl font-bold sm:text-2xl">
              {t("dashboard.subtitle")}
            </h1>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            <LanguageToggle />

            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
                {studentName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="text-left">
                <p className="text-sm font-semibold">
                  {studentName}
                </p>

                <p className="max-w-[180px] truncate text-xs text-slate-500 dark:text-slate-400">
                  {user?.email || ""}
                </p>
              </div>
            </div>

            {/* MENU */}
            <div
              className="relative"
              ref={menuRef}
            >
              <button
                type="button"
                onClick={() =>
                  setMenuOpen((open) => !open)
                }
                aria-label={t("dashboard.openMenu")}
                aria-expanded={menuOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                ⋮
              </button>

              {menuOpen && (
                <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={handleSyllabus}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span className="text-lg">
                      📚
                    </span>

                    <span>
                      <span className="block">
                        {t("dashboard.menu.syllabus")}
                      </span>

                      <span className="text-xs font-normal text-slate-400">
                        {t("dashboard.menu.syllabusDesc")}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProfile}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span className="text-lg">
                      👤
                    </span>

                    <span>
                      <span className="block">
                        {t("dashboard.menu.profile")}
                      </span>

                      <span className="text-xs font-normal text-slate-400">
                        {t("dashboard.menu.profileDesc")}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span className="text-lg">
                      {theme === "dark"
                        ? "☀️"
                        : "🌙"}
                    </span>

                    <span>
                      <span className="block">
                        {theme === "dark"
                          ? t("dashboard.menu.lightMode")
                          : t("dashboard.menu.darkMode")}
                      </span>

                      <span className="text-xs font-normal text-slate-400">
                        {t("dashboard.menu.changeAppearance")}
                      </span>
                    </span>
                  </button>

                  <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <span className="text-lg">
                      🚪
                    </span>

                    <span>
                      {t("common.logout")}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white shadow-xl sm:p-10">
          <div className="relative z-10 max-w-2xl">
            <p className="text-sm font-semibold text-blue-100">
              👋 Welcome back
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              {studentName}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
              Continue your learning journey with
              PadhAI. Practice, revise and improve
              your knowledge every day.
            </p>

            <button
              type="button"
              onClick={handleQuickRevision}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              ⚡ Start Quick Revision
              <span>→</span>
            </button>
          </div>

          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

          <div className="absolute -bottom-16 right-10 h-48 w-48 rounded-full bg-violet-300/20 blur-2xl" />

          <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 text-8xl opacity-20 md:block">
            🎓
          </div>
        </section>

        {/* LEARNING TOOLS */}
        <section className="mt-10">
          <SectionHeading
            title="Learning Tools"
            description="Explore important study resources and stay updated."
          />

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {/* DAILY NEWSPAPER */}
            <DashboardCard
              icon="📰"
              title={t(
                "dashboard.cards.newspaper.title",
              )}
              description={t(
                "dashboard.cards.newspaper.description",
              )}
              action={t(
                "dashboard.cards.newspaper.action",
              )}
              badge={t("common.premium")}
              badgeClass="bg-amber-500"
              className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-orange-950/20"
              actionClass="text-amber-700 dark:text-amber-400"
              onClick={handleDailyNewspaper}
            />

            {/* CURRENT AFFAIRS */}
            <DashboardCard
              icon="🗞️"
              title={t(
                "dashboard.cards.currentAffairs.title",
              )}
              description={t(
                "dashboard.cards.currentAffairs.description",
              )}
              action={t(
                "dashboard.cards.currentAffairs.action",
              )}
              badge={t("common.free")}
              badgeClass="bg-green-600"
              className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-900/50 dark:from-green-950/30 dark:to-emerald-950/20"
              actionClass="text-green-700 dark:text-green-400"
              onClick={handleCurrentAffairs}
            />
          </div>
        </section>

        {/* QUICK REVISION FEATURED */}
        <section className="mt-10">
          <div className="relative overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 p-6 shadow-sm dark:border-purple-900/50 dark:from-purple-950/30 dark:via-violet-950/30 dark:to-indigo-950/30 sm:p-8">
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-3xl text-white shadow-lg">
                  ⚡
                </div>

                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Smart Learning
                  </p>

                  <h2 className="text-2xl font-bold sm:text-3xl">
                    Quick Revision
                  </h2>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                Practice AI-powered questions topic-wise.
                Choose any subject or topic and start a
                fast revision session whenever you want.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm dark:bg-slate-900/60 dark:text-purple-300">
                  🤖 AI Questions
                </span>

                <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm dark:bg-slate-900/60 dark:text-purple-300">
                  📚 Topic Wise
                </span>

                <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm dark:bg-slate-900/60 dark:text-purple-300">
                  ⚡ Fast Practice
                </span>
              </div>

              <button
                type="button"
                onClick={handleQuickRevision}
                className="mt-7 rounded-xl bg-purple-600 px-6 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-purple-700 hover:shadow-xl"
              >
                Start Quick Revision →
              </button>
            </div>

            <div className="absolute -right-8 bottom-0 hidden text-[170px] opacity-10 md:block">
              ⚡
            </div>
          </div>
        </section>

        {/* AI & SKILLS */}
        <section className="mt-10">
          <SectionHeading
            title="AI & Skills"
            description="Learn smarter with AI and improve your skills."
          />

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {/* ASK PADHAI */}
            <DashboardCard
              icon="🤖"
              title={t(
                "dashboard.cards.ask.title",
              )}
              description={t(
                "dashboard.cards.ask.description",
              )}
              action={t(
                "dashboard.cards.ask.action",
              )}
              className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:border-blue-900/50 dark:from-blue-950/30 dark:to-cyan-950/20"
              actionClass="text-blue-700 dark:text-blue-400"
              onClick={handleAskPadhAI}
            />

            {/* VOCAB BHAIYA */}
            <DashboardCard
              icon="📚"
              title="Learn English with Vocab-Bhaiya"
              description="Improve your vocabulary and English skills with interactive learning."
              action="Start Learning →"
              badge={t("common.external")}
              badgeClass="bg-indigo-600"
              className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-blue-950/20"
              actionClass="text-indigo-700 dark:text-indigo-400"
              onClick={handleVocabBhaiya}
            />
          </div>
        </section>

        {/* MORE LEARNING */}
        <section className="mt-10 pb-8">
          <SectionHeading
            title="More Learning"
            description="More learning experiences are coming soon."
          />

          <div className="mt-5">
            <DashboardCard
              icon="🎥"
              title={t(
                "dashboard.cards.videos.title",
              )}
              description={t(
                "dashboard.cards.videos.description",
              )}
              action={t("common.comingSoon")}
              badge={t("common.comingSoon")}
              badgeClass="bg-slate-600"
              className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              actionClass="text-slate-600 dark:text-slate-400"
              onClick={() =>
                alert(t("common.comingSoon"))
              }
            />
          </div>
        </section>
      </main>
    </div>
  );
}

interface SectionHeadingProps {
  title: string;
  description: string;
}

function SectionHeading({
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div>
      <h2 className="text-xl font-bold sm:text-2xl">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

interface DashboardCardProps {
  icon: string;
  title: string;
  description: string;
  action: string;
  className: string;
  actionClass: string;
  onClick: () => void;
  badge?: string;
  badgeClass?: string;
}

function DashboardCard({
  icon,
  title,
  description,
  action,
  className,
  actionClass,
  onClick,
  badge,
  badgeClass,
}: DashboardCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-2xl border p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl ${className}`}
    >
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-3xl shadow-sm dark:bg-slate-900/60">
          {icon}
        </div>

        {badge && (
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white ${badgeClass}`}
          >
            {badge}
          </span>
        )}
      </div>

      <h3 className="relative z-10 mt-6 text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="relative z-10 mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
        {description}
      </p>

      <span
        className={`relative z-10 mt-5 inline-flex items-center gap-2 text-sm font-bold ${actionClass}`}
      >
        {action}
      </span>

      <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white/20 transition duration-300 group-hover:scale-150 dark:bg-white/5" />
    </button>
  );
}

export default StudentDashboard;
