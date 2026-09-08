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

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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

  function handleDailyCurrentAffairs() {
    navigate("/student/current-affairs");
  }

  function handleDailyNewspaper() {
    navigate("/student/daily-newspaper");
  }

  function handleQuickRevision() {
    navigate("/student/quick-revision");
  }

  function handleAskAI() {
    navigate("/student/ask");
  }

  function handleVocabulary() {
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
      {/* =========================================================
          HEADER
      ========================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
          {/* BRAND */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-lg font-black text-white shadow-lg shadow-blue-500/20">
              V
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                VIDYZEN
              </p>

              <p className="hidden text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:block">
                Learn smarter. Grow faster.
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />

            {/* USER */}
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-md">
                {studentName.charAt(0).toUpperCase()}
              </div>

              <div className="max-w-[190px] text-left">
                <p className="truncate text-sm font-semibold">
                  {studentName}
                </p>

                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user?.email || ""}
                </p>
              </div>
            </div>

            {/* MENU */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label={t("dashboard.openMenu")}
                aria-expanded={menuOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                ⋮
              </button>

              {menuOpen && (
                <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                  {/* PROFILE */}
                  <button
                    type="button"
                    onClick={handleProfile}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span className="text-lg">👤</span>

                    <span>
                      <span className="block">
                        {t("dashboard.menu.profile")}
                      </span>

                      <span className="text-xs font-normal text-slate-400">
                        {t("dashboard.menu.profileDesc")}
                      </span>
                    </span>
                  </button>

                  {/* THEME */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span className="text-lg">
                      {theme === "dark" ? "☀️" : "🌙"}
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

                  {/* LOGOUT */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <span className="text-lg">🚪</span>
                    <span>{t("common.logout")}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN
      ========================================================== */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {/* =======================================================
            TRENDY QUOTE
        ======================================================== */}
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-5 flex items-center gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                Today's Mindset
              </span>
            </div>

            <blockquote className="max-w-4xl text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
              “Small progress every day becomes big success over time.”
            </blockquote>

            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              Keep learning. Keep revising. Keep moving forward.
            </p>
          </div>
        </section>

        {/* =======================================================
            WELCOME
        ======================================================== */}
        <section className="mt-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white shadow-xl shadow-indigo-500/10 sm:p-10">
            <div className="relative z-10 max-w-3xl">
              <p className="text-sm font-semibold text-blue-100">
                👋 Welcome back
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {studentName}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                Your learning space is ready. Revise faster, stay updated
                with current affairs and use AI to learn smarter.
              </p>

              <button
                type="button"
                onClick={handleQuickRevision}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                ⚡ Fast Revision
                <span>→</span>
              </button>
            </div>

            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 right-10 h-52 w-52 rounded-full bg-violet-300/20 blur-3xl" />

            <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 text-[120px] opacity-10 md:block lg:text-[160px]">
              🧠
            </div>
          </div>
        </section>

        {/* =======================================================
            FAST REVISION
        ======================================================== */}
        <section className="mt-10">
          <SectionHeading
            title="Fast Revision"
            description="Revise important topics quickly and test your preparation."
          />

          <div className="mt-5">
            <button
              type="button"
              onClick={handleQuickRevision}
              className="group relative w-full overflow-hidden rounded-[2rem] border border-purple-200 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-purple-900/50 dark:from-purple-950/30 dark:via-violet-950/30 dark:to-indigo-950/30 sm:p-8"
            >
              <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-3xl text-white shadow-lg">
                      ⚡
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                        Smart Practice
                      </p>

                      <h2 className="text-2xl font-black sm:text-3xl">
                        Fast Revision
                      </h2>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                    Pick a subject or topic and start a quick revision
                    session. Practice questions, identify weak areas and
                    improve every day.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/80 px-3 py-2 text-xs font-bold text-purple-700 shadow-sm dark:bg-slate-900/60 dark:text-purple-300">
                      🤖 Smart Questions
                    </span>

                    <span className="rounded-full bg-white/80 px-3 py-2 text-xs font-bold text-purple-700 shadow-sm dark:bg-slate-900/60 dark:text-purple-300">
                      📚 Topic Wise
                    </span>

                    <span className="rounded-full bg-white/80 px-3 py-2 text-xs font-bold text-purple-700 shadow-sm dark:bg-slate-900/60 dark:text-purple-300">
                      ⚡ Quick Practice
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition group-hover:bg-purple-700">
                    Start Revision
                    <span>→</span>
                  </span>
                </div>
              </div>

              <div className="absolute -bottom-10 -right-6 text-[150px] leading-none opacity-10 transition duration-300 group-hover:scale-110">
                ⚡
              </div>
            </button>
          </div>
        </section>

        {/* =======================================================
            DAILY CURRENT AFFAIRS
        ======================================================== */}
        <section className="mt-10">
          <SectionHeading
            title="Daily Current Affairs"
            description="Stay updated with the latest events that matter for your exams."
          />

          <div className="mt-5">
            <DashboardCard
              icon="🗞️"
              title="Daily Current Affairs"
              description="Read important current affairs, understand what happened and prepare with exam-focused information."
              action="Read Today's Current Affairs →"
              badge="FREE"
              badgeClass="bg-green-600"
              className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-900/50 dark:from-green-950/30 dark:to-emerald-950/20"
              actionClass="text-green-700 dark:text-green-400"
              onClick={handleDailyCurrentAffairs}
            />
          </div>
        </section>

        {/* =======================================================
            DAILY NEWSPAPER
        ======================================================== */}
        <section className="mt-10">
          <SectionHeading
            title="Daily Newspaper"
            description="Read the latest newspaper updates and stay informed every day."
          />

          <div className="mt-5">
            <DashboardCard
              icon="📰"
              title="Daily Newspaper"
              description="Read daily newspaper updates in a simple, student-friendly format and stay connected with important national and international news."
              action="Read Today's Newspaper →"
              badge="DAILY"
              badgeClass="bg-blue-600"
              className="border-blue-200 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 dark:border-blue-900/50 dark:from-blue-950/30 dark:via-sky-950/30 dark:to-cyan-950/20"
              actionClass="text-blue-700 dark:text-blue-400"
              onClick={handleDailyNewspaper}
            />
          </div>
        </section>

        {/* =======================================================
            WHAT'S IN NEWS + WHY IMPORTANT
        ======================================================== */}
        <section className="mt-10">
          <SectionHeading
            title="What's in News"
            description="Know not just what happened, but why it matters."
          />

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <DashboardCard
              icon="📰"
              title="What's in News"
              description="Get a quick and simple understanding of important events, developments and issues making headlines."
              action="Explore News →"
              badge="LATEST"
              badgeClass="bg-blue-600"
              className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:border-blue-900/50 dark:from-blue-950/30 dark:to-cyan-950/20"
              actionClass="text-blue-700 dark:text-blue-400"
              onClick={handleDailyCurrentAffairs}
            />

            <DashboardCard
              icon="💡"
              title="Why Important?"
              description="Understand why a news event is important for exams, society, economy, government and the country."
              action="Understand Why →"
              badge="EXAM FOCUS"
              badgeClass="bg-amber-500"
              className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-orange-950/20"
              actionClass="text-amber-700 dark:text-amber-400"
              onClick={handleDailyCurrentAffairs}
            />
          </div>
        </section>

        {/* =======================================================
            ASK AI
        ======================================================== */}
        <section className="mt-10">
          <SectionHeading
            title="Ask AI"
            description="Stuck on a concept? Ask, understand and learn."
          />

          <div className="mt-5">
            <button
              type="button"
              onClick={handleAskAI}
              className="group relative w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 text-left text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-8"
            >
              <div className="relative z-10 flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 text-3xl shadow-lg shadow-blue-500/20">
                      🤖
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
                        AI Learning Assistant
                      </p>

                      <h2 className="text-2xl font-black sm:text-3xl">
                        Ask Vidhya
                      </h2>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-slate-300 sm:text-base">
                    Ask questions in your own words and get clear,
                    student-friendly explanations to understand difficult
                    concepts faster.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-blue-100">
                      💬 Ask Anything
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-blue-100">
                      🧠 Easy Explanations
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-blue-100">
                      📖 Study Help
                    </span>
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-lg transition group-hover:-translate-y-0.5">
                  Ask Vidhya
                  <span>→</span>
                </span>
              </div>

              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
            </button>
          </div>
        </section>

        {/* =======================================================
            ENGLISH VOCABULARY
        ======================================================== */}
        <section className="mt-10">
          <SectionHeading
            title="English Vocabulary"
            description="Build stronger vocabulary and improve your English every day."
          />

          <div className="mt-5">
            <DashboardCard
              icon="📚"
              title="Learn English with Vocab-Bhaiya"
              description="Improve your vocabulary, learn useful words and strengthen your English skills through interactive learning."
              action="Start Learning →"
              badge="EXTERNAL"
              badgeClass="bg-indigo-600"
              className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-blue-950/20"
              actionClass="text-indigo-700 dark:text-indigo-400"
              onClick={handleVocabulary}
            />
          </div>
        </section>

        {/* =======================================================
            VIDEO — COMING SOON
        ======================================================== */}
        <section className="mt-10">
          <SectionHeading
            title="Video Learning"
            description="Video-based learning experiences are coming soon."
          />

          <div className="mt-5">
            <DashboardCard
              icon="🎥"
              title="Video Classes"
              description="Learn through engaging video lessons designed to make difficult concepts easier to understand."
              action="Coming Soon"
              badge="COMING SOON"
              badgeClass="bg-slate-600"
              className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              actionClass="text-slate-500 dark:text-slate-400"
              onClick={() => alert(t("common.comingSoon"))}
            />
          </div>
        </section>

        {/* =======================================================
            ABOUT
        ======================================================== */}
        <section className="mt-10 pb-10">
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-black text-white shadow-lg">
                  V
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    About
                  </p>

                  <h2 className="text-2xl font-black">
                    About VIDYZEN
                  </h2>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                VIDYZEN is built to make exam preparation simpler, smarter
                and more focused. From daily current affairs and daily
                newspaper reading to fast revision, AI-powered learning and
                vocabulary building, everything is designed to help students
                learn consistently.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                  🎯 Exam Focused
                </span>

                <span className="rounded-full bg-purple-50 px-4 py-2 text-xs font-bold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                  🤖 AI Powered
                </span>

                <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-bold text-green-700 dark:bg-green-950/50 dark:text-green-300">
                  📚 Student Friendly
                </span>
              </div>
            </div>

            <div className="absolute -bottom-20 -right-10 text-[180px] font-black leading-none text-blue-600/5">
              V
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            VIDYZEN
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-500">
            Learn smarter. Grow faster.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ===============================================================
   SECTION HEADING
================================================================ */

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
      <h2 className="text-xl font-black tracking-tight sm:text-2xl">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* ===============================================================
   DASHBOARD CARD
================================================================ */

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
      className={`group relative w-full overflow-hidden rounded-[2rem] border p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7 ${className}`}
    >
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-3xl shadow-sm dark:bg-slate-900/60">
          {icon}
        </div>

        {badge && (
          <span
            className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white ${badgeClass}`}
          >
            {badge}
          </span>
        )}
      </div>

      <h3 className="relative z-10 mt-6 text-xl font-black tracking-tight text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="relative z-10 mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
        {description}
      </p>

      <span
        className={`relative z-10 mt-5 inline-flex items-center gap-2 text-sm font-black ${actionClass}`}
      >
        {action}
      </span>

      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white/20 transition duration-500 group-hover:scale-150 dark:bg-white/5" />
    </button>
  );
}

export default StudentDashboard;
```
