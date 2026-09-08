import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { LanguageToggle } from "../../components/LanguageToggle";
import { mindsetQuotes } from "../../data/mindsetQuotes";

export function StudentDashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [today, setToday] = useState(() => new Date());

  const menuRef = useRef<HTMLDivElement>(null);

  /*
   * ---------------------------------------------------------
   * 365-DAY TODAY'S MINDSET SYSTEM
   * ---------------------------------------------------------
   *
   * Jan 1      -> Quote 1
   * Jan 2      -> Quote 2
   * ...
   * Dec 31     -> Quote 365
   *
   * Leap years:
   * The 366th calendar day is mapped back into the
   * 365-quote cycle.
   */

  function getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);

    const diff =
      date.getTime() -
      start.getTime();

    const oneDay = 1000 * 60 * 60 * 24;

    return Math.floor(diff / oneDay);
  }

  function getTodayMindsetIndex(date: Date): number {
    if (mindsetQuotes.length === 0) {
      return 0;
    }

    const dayOfYear = getDayOfYear(date);

    return (dayOfYear - 1) % mindsetQuotes.length;
  }

  const mindsetIndex = getTodayMindsetIndex(today);

  const mindset =
    mindsetQuotes[mindsetIndex] ??
    mindsetQuotes[0];

  const currentLanguage =
    i18n.resolvedLanguage === "hi"
      ? "hi"
      : i18n.resolvedLanguage === "hinglish"
        ? "hinglish"
        : "en";

  const todayQuote =
    mindset?.[currentLanguage] ??
    mindset?.en ??
    "";

  /*
   * ---------------------------------------------------------
   * UPDATE AUTOMATICALLY AT MIDNIGHT
   * ---------------------------------------------------------
   *
   * If student keeps dashboard open overnight,
   * the quote automatically changes after local midnight.
   */

  useEffect(() => {
    const now = new Date();

    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      1,
      0,
    );

    const timeout = window.setTimeout(() => {
      setToday(new Date());
    }, nextMidnight.getTime() - now.getTime());

    return () => {
      window.clearTimeout(timeout);
    };
  }, [today]);

  /*
   * ---------------------------------------------------------
   * CLOSE MENU WHEN CLICKING OUTSIDE
   * ---------------------------------------------------------
   */

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

  /*
   * ---------------------------------------------------------
   * NAVIGATION
   * ---------------------------------------------------------
   */

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

  /*
   * ---------------------------------------------------------
   * STUDENT
   * ---------------------------------------------------------
   */

  const studentName =
    profile?.full_name ||
    user?.email?.split("@")[0] ||
    t("common.student");

  /*
   * ---------------------------------------------------------
   * TODAY'S DATE
   * ---------------------------------------------------------
   */

  const formattedDate = new Intl.DateTimeFormat(
    currentLanguage === "hi"
      ? "hi-IN"
      : "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(today);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* =====================================================
          HEADER
      ====================================================== */}

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
                {t("dashboard.brandTagline")}
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

            <div
              className="relative"
              ref={menuRef}
            >
              <button
                type="button"
                onClick={() =>
                  setMenuOpen((open) => !open)
                }
                aria-label={t(
                  "dashboard.openMenu",
                )}
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
                    <span className="text-lg">
                      👤
                    </span>

                    <span>
                      <span className="block">
                        {t(
                          "dashboard.menu.profile",
                        )}
                      </span>

                      <span className="text-xs font-normal text-slate-400">
                        {t(
                          "dashboard.menu.profileDesc",
                        )}
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
                      {theme === "dark"
                        ? "☀️"
                        : "🌙"}
                    </span>

                    <span>
                      <span className="block">
                        {theme === "dark"
                          ? t(
                              "dashboard.menu.lightMode",
                            )
                          : t(
                              "dashboard.menu.darkMode",
                            )}
                      </span>

                      <span className="text-xs font-normal text-slate-400">
                        {t(
                          "dashboard.menu.changeAppearance",
                        )}
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

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {/* ===================================================
            TODAY'S MINDSET
        ==================================================== */}

        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          {/* Decorative background */}

          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative z-10">
            {/* TOP LABEL */}

            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                {t("dashboard.mindset.label")}
              </span>

              {/* DAY NUMBER */}

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {currentLanguage === "hi"
                  ? `दिन ${mindsetIndex + 1} / 365`
                  : currentLanguage === "hinglish"
                    ? `Day ${mindsetIndex + 1} / 365`
                    : `Day ${mindsetIndex + 1} / 365`}
              </span>
            </div>

            {/* DATE */}

            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {formattedDate}
            </p>

            {/* QUOTE */}

            <blockquote className="max-w-4xl text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
              “{todayQuote}”
            </blockquote>

            {/* SUBTITLE */}

            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("dashboard.mindset.subtitle")}
            </p>
          </div>
        </section>

        {/* ===================================================
            WELCOME
        ==================================================== */}

        <section className="mt-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white shadow-xl shadow-indigo-500/10 sm:p-10">
            <div className="relative z-10 max-w-3xl">
              <p className="text-sm font-semibold text-blue-100">
                👋 {t("dashboard.welcomeBack")}
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {studentName}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                {t(
                  "dashboard.welcomeDescription",
                )}
              </p>

              <button
                type="button"
                onClick={handleQuickRevision}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                ⚡{" "}
                {t(
                  "dashboard.fastRevision.title",
                )}

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

        {/* ===================================================
            FAST REVISION
        ==================================================== */}

        <section className="mt-10">
          <SectionHeading
            title={t(
              "dashboard.fastRevision.sectionTitle",
            )}
            description={t(
              "dashboard.fastRevision.sectionDescription",
            )}
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
                        {t(
                          "dashboard.fastRevision.badge",
                        )}
                      </p>

                      <h2 className="text-2xl font-black sm:text-3xl">
                        {t(
                          "dashboard.fastRevision.title",
                        )}
                      </h2>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                    {t(
                      "dashboard.fastRevision.description",
                    )}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/80 px-3 py-2 text-xs font-bold text-purple-700 shadow-sm dark:bg-slate-900/60 dark:text-purple-300">
                      🤖{" "}
                      {t(
                        "dashboard.fastRevision.smartQuestions",
                      )}
                    </span>

                    <span className="rounded-full bg-white/80 px-3 py-2 text-xs font-bold text-purple-700 shadow-sm dark:bg-slate-900/60 dark:text-purple-300">
                      📚{" "}
                      {t(
                        "dashboard.fastRevision.topicWise",
                      )}
                    </span>

                    <span className="rounded-full bg-white/80 px-3 py-2 text-xs font-bold text-purple-700 shadow-sm dark:bg-slate-900/60 dark:text-purple-300">
                      ⚡{" "}
                      {t(
                        "dashboard.fastRevision.quickPractice",
                      )}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition group-hover:bg-purple-700">
                    {t(
                      "dashboard.fastRevision.action",
                    )}

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

        {/* ===================================================
            DAILY CURRENT AFFAIRS
        ==================================================== */}

        <section className="mt-10">
          <SectionHeading
            title={t(
              "dashboard.currentAffairs.sectionTitle",
            )}
            description={t(
              "dashboard.currentAffairs.sectionDescription",
            )}
          />

          <div className="mt-5">
            <DashboardCard
              icon="🗞️"
              title={t(
                "dashboard.currentAffairs.title",
              )}
              description={t(
                "dashboard.currentAffairs.description",
              )}
              action={t(
                "dashboard.currentAffairs.action",
              )}
              badge={t(
                "dashboard.currentAffairs.badge",
              )}
              badgeClass="bg-green-600"
              className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-900/50 dark:from-green-950/30 dark:to-emerald-950/20"
              actionClass="text-green-700 dark:text-green-400"
              onClick={handleDailyCurrentAffairs}
            />
          </div>
        </section>

        {/* ===================================================
            DAILY NEWSPAPER
        ==================================================== */}

        <section className="mt-10">
          <SectionHeading
            title={t(
              "dashboard.newspaper.sectionTitle",
            )}
            description={t(
              "dashboard.newspaper.sectionDescription",
            )}
          />

          <div className="mt-5">
            <DashboardCard
              icon="📰"
              title={t(
                "dashboard.newspaper.title",
              )}
              description={t(
                "dashboard.newspaper.description",
              )}
              action={t(
                "dashboard.newspaper.action",
              )}
              badge={t(
                "dashboard.newspaper.badge",
              )}
              badgeClass="bg-blue-600"
              className="border-blue-200 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 dark:border-blue-900/50 dark:from-blue-950/30 dark:via-sky-950/30 dark:to-cyan-950/20"
              actionClass="text-blue-700 dark:text-blue-400"
              onClick={handleDailyNewspaper}
            />
          </div>
        </section>

        {/* ===================================================
            WHAT'S IN NEWS
        ==================================================== */}

        <section className="mt-10">
          <SectionHeading
            title={t(
              "dashboard.whatsInNews.sectionTitle",
            )}
            description={t(
              "dashboard.whatsInNews.sectionDescription",
            )}
          />

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <DashboardCard
              icon="📰"
              title={t(
                "dashboard.whatsInNews.news.title",
              )}
              description={t(
                "dashboard.whatsInNews.news.description",
              )}
              action={t(
                "dashboard.whatsInNews.news.action",
              )}
              badge={t(
                "dashboard.whatsInNews.news.badge",
              )}
              badgeClass="bg-blue-600"
              className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:border-blue-900/50 dark:from-blue-950/30 dark:to-cyan-950/20"
              actionClass="text-blue-700 dark:text-blue-400"
              onClick={handleDailyCurrentAffairs}
            />

            <DashboardCard
              icon="💡"
              title={t(
                "dashboard.whatsInNews.why.title",
              )}
              description={t(
                "dashboard.whatsInNews.why.description",
              )}
              action={t(
                "dashboard.whatsInNews.why.action",
              )}
              badge={t(
                "dashboard.whatsInNews.why.badge",
              )}
              badgeClass="bg-amber-500"
              className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-orange-950/20"
              actionClass="text-amber-700 dark:text-amber-400"
              onClick={handleDailyCurrentAffairs}
            />
          </div>
        </section>

        {/* ===================================================
            ASK VIDHYA
        ==================================================== */}

        <section className="mt-10">
          <SectionHeading
            title={t(
              "dashboard.askVidhya.sectionTitle",
            )}
            description={t(
              "dashboard.askVidhya.sectionDescription",
            )}
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
                        {t(
                          "dashboard.askVidhya.badge",
                        )}
                      </p>

                      <h2 className="text-2xl font-black sm:text-3xl">
                        {t(
                          "dashboard.askVidhya.title",
                        )}
                      </h2>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-slate-300 sm:text-base">
                    {t(
                      "dashboard.askVidhya.description",
                    )}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-blue-100">
                      💬{" "}
                      {t(
                        "dashboard.askVidhya.askAnything",
                      )}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-blue-100">
                      🧠{" "}
                      {t(
                        "dashboard.askVidhya.easyExplanations",
                      )}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-blue-100">
                      📖{" "}
                      {t(
                        "dashboard.askVidhya.studyHelp",
                      )}
                    </span>
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-lg transition group-hover:-translate-y-0.5">
                  {t(
                    "dashboard.askVidhya.action",
                  )}

                  <span>→</span>
                </span>
              </div>

              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
            </button>
          </div>
        </section>

        {/* ===================================================
            ENGLISH VOCABULARY
        ==================================================== */}

        <section className="mt-10">
          <SectionHeading
            title={t(
              "dashboard.vocabulary.sectionTitle",
            )}
            description={t(
              "dashboard.vocabulary.sectionDescription",
            )}
          />

          <div className="mt-5">
            <DashboardCard
              icon="📚"
              title={t(
                "dashboard.vocabulary.title",
              )}
              description={t(
                "dashboard.vocabulary.description",
              )}
              action={t(
                "dashboard.vocabulary.action",
              )}
              badge={t(
                "dashboard.vocabulary.badge",
              )}
              badgeClass="bg-indigo-600"
              className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-blue-950/20"
              actionClass="text-indigo-700 dark:text-indigo-400"
              onClick={handleVocabulary}
            />
          </div>
        </section>

        {/* ===================================================
            VIDEO
        ==================================================== */}

        <section className="mt-10">
          <SectionHeading
            title={t(
              "dashboard.videos.sectionTitle",
            )}
            description={t(
              "dashboard.videos.sectionDescription",
            )}
          />

          <div className="mt-5">
            <DashboardCard
              icon="🎥"
              title={t(
                "dashboard.videos.title",
              )}
              description={t(
                "dashboard.videos.description",
              )}
              action={t(
                "dashboard.videos.action",
              )}
              badge={t(
                "dashboard.videos.badge",
              )}
              badgeClass="bg-slate-600"
              className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              actionClass="text-slate-500 dark:text-slate-400"
              onClick={() =>
                alert(t("common.comingSoon"))
              }
            />
          </div>
        </section>

        {/* ===================================================
            ABOUT
        ==================================================== */}

        <section className="mt-10 pb-10">
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-black text-white shadow-lg">
                  V
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    {t("dashboard.about.label")}
                  </p>

                  <h2 className="text-2xl font-black">
                    {t("dashboard.about.title")}
                  </h2>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                {t(
                  "dashboard.about.description",
                )}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                  🎯{" "}
                  {t(
                    "dashboard.about.examFocused",
                  )}
                </span>

                <span className="rounded-full bg-purple-50 px-4 py-2 text-xs font-bold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                  🤖{" "}
                  {t(
                    "dashboard.about.aiPowered",
                  )}
                </span>

                <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-bold text-green-700 dark:bg-green-950/50 dark:text-green-300">
                  📚{" "}
                  {t(
                    "dashboard.about.studentFriendly",
                  )}
                </span>
              </div>
            </div>

            <div className="absolute -bottom-20 -right-10 text-[180px] font-black leading-none text-blue-600/5">
              V
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            VIDYZEN
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-500">
            {t("dashboard.brandTagline")}
          </p>
        </div>
      </footer>
    </div>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

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

/* =========================================================
   DASHBOARD CARD
========================================================= */

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
            className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white ${badgeClass ?? ""}`}
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
