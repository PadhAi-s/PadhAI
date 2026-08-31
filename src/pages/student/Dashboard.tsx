import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
          {/* WELCOME + USER MENU */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t("dashboard.welcome")} 👋
              </h2>

              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {profile?.full_name ||
                  user?.email ||
                  t("common.student")}
              </p>
            </div>

            {/* USER + MENU */}
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  {profile?.full_name ||
                    t("common.student")}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email || ""}
                </p>
              </div>

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
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  ⋮
                </button>

                {menuOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    {/* SYLLABUS */}
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
                          {t(
                            "dashboard.menu.syllabus",
                          )}
                        </span>

                        <span className="text-xs font-normal text-slate-400">
                          {t(
                            "dashboard.menu.syllabusDesc",
                          )}
                        </span>
                      </span>
                    </button>

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

          {/* DASHBOARD CARDS */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              actionClass="text-amber-600 dark:text-amber-400"
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
              actionClass="text-green-600 dark:text-green-400"
              onClick={handleCurrentAffairs}
            />

            {/* QUICK REVISION */}
            <DashboardCard
              icon="⚡"
              title={t(
                "dashboard.cards.revision.title",
              )}
              description={t(
                "dashboard.cards.revision.description",
              )}
              action={t(
                "dashboard.cards.revision.action",
              )}
              className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 dark:border-purple-900/50 dark:from-purple-950/30 dark:to-violet-950/20"
              actionClass="text-purple-600 dark:text-purple-400"
              onClick={handleQuickRevision}
            />

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
              actionClass="text-blue-600 dark:text-blue-400"
              onClick={handleAskPadhAI}
            />

            {/* VOCAB BHAIYA */}
            <DashboardCard
              icon="🔤"
              title={t(
                "dashboard.cards.vocab.title",
              )}
              description={t(
                "dashboard.cards.vocab.description",
              )}
              action={t(
                "dashboard.cards.vocab.action",
              )}
              badge={t("common.external")}
              badgeClass="bg-indigo-600"
              className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-blue-950/20"
              actionClass="text-indigo-600 dark:text-indigo-400"
              onClick={handleVocabBhaiya}
            />

            {/* VIDEOS */}
            <DashboardCard
              icon="🎥"
              title={t(
                "dashboard.cards.videos.title",
              )}
              description={t(
                "dashboard.cards.videos.description",
              )}
              action={t("common.comingSoon")}
              className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              actionClass="text-blue-600 dark:text-blue-400"
              onClick={() =>
                alert(t("common.comingSoon"))
              }
            />
          </div>

          {/* EDIT PROFILE */}
          <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
            <button
              type="button"
              onClick={handleProfile}
              className="rounded-xl border border-blue-600 px-5 py-3 font-semibold text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              {t("dashboard.editProfile")}
            </button>
          </div>
        </div>
      </main>
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
      className={`relative rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="text-3xl">
          {icon}
        </div>

        {badge && (
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold text-white ${badgeClass}`}
          >
            {badge}
          </span>
        )}
      </div>

      <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>

      <span
        className={`mt-4 inline-block text-sm font-semibold ${actionClass}`}
      >
        {action}
      </span>
    </button>
  );
}

export default StudentDashboard;
