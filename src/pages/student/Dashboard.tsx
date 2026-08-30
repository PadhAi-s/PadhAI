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

  function handleQuickRevision() {
    navigate("/student/quick-revision");
  }

  function handleDailyNewspaper() {
    navigate("/student/daily-newspaper");
  }

  function handleCurrentAffairs() {
    navigate("/student/current-affairs");
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
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              PadhAI
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("dashboard.studentDashboard")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* LANGUAGE */}
            <LanguageToggle />

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                {profile?.full_name || t("dashboard.student")}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.email}
              </p>
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
                        {t("dashboard.mySyllabus")}
                      </span>

                      <span className="text-xs font-normal text-slate-400">
                        {t("dashboard.subjectsChapters")}
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
                        {t("dashboard.myProfile")}
                      </span>

                      <span className="text-xs font-normal text-slate-400">
                        {t("dashboard.editProfile")}
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
                          ? t("dashboard.lightMode")
                          : t("dashboard.darkMode")}
                      </span>

                      <span className="text-xs font-normal text-slate-400">
                        {t("dashboard.changeAppearance")}
                      </span>
                    </span>
                  </button>

                  {/* SETTINGS */}
                  <button
                    type="button"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span className="text-lg">
                      ⚙️
                    </span>

                    <span>
                      <span className="block">
                        {t("dashboard.settings")}
                      </span>

                      <span className="text-xs font-normal text-slate-400">
                        {t("dashboard.comingSoon")}
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
                      {t("dashboard.logout")}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("dashboard.welcome")} 👋
          </h2>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {profile?.full_name ||
              user?.email ||
              t("dashboard.student")}
          </p>

          {/* PROFILE INFO */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <InfoCard
              label={t("dashboard.class")}
              value={
                profile?.class_name ||
                t("dashboard.notSet")
              }
              className="bg-blue-50 dark:bg-blue-950/40"
            />

            <InfoCard
              label={t("dashboard.board")}
              value={
                profile?.board ||
                t("dashboard.notSet")
              }
              className="bg-green-50 dark:bg-green-950/40"
            />

            <InfoCard
              label={t("dashboard.exam")}
              value={
                profile?.exam ||
                t("dashboard.notSet")
              }
              className="bg-purple-50 dark:bg-purple-950/40"
            />
          </div>

          {/* FEATURES */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DashboardCard
              icon="📰"
              title={t("dashboard.dailyNewspaper")}
              description={t(
                "dashboard.dailyNewspaperDesc",
              )}
              action={t("dashboard.readPaper")}
              badge={t("dashboard.premium")}
              badgeClass="bg-amber-500"
              className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-orange-950/20"
              actionClass="text-amber-600 dark:text-amber-400"
              onClick={handleDailyNewspaper}
            />

            <DashboardCard
              icon="🗞️"
              title={t(
                "dashboard.weeklyCurrentAffairs",
              )}
              description={t(
                "dashboard.currentAffairsDesc",
              )}
              action={t(
                "dashboard.readCurrentAffairs",
              )}
              badge={t("dashboard.free")}
              badgeClass="bg-green-600"
              className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-900/50 dark:from-green-950/30 dark:to-emerald-950/20"
              actionClass="text-green-600 dark:text-green-400"
              onClick={handleCurrentAffairs}
            />

            <DashboardCard
              icon="⚡"
              title={t("dashboard.quickRevision")}
              description={t(
                "dashboard.quickRevisionDesc",
              )}
              action={t("dashboard.reviseNow")}
              className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 dark:border-purple-900/50 dark:from-purple-950/30 dark:to-violet-950/20"
              actionClass="text-purple-600 dark:text-purple-400"
              onClick={handleQuickRevision}
            />

            <DashboardCard
              icon="🤖"
              title={t("dashboard.askPadhAI")}
              description={t(
                "dashboard.askPadhAIDesc",
              )}
              action={t("dashboard.askNow")}
              className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:border-blue-900/50 dark:from-blue-950/30 dark:to-cyan-950/20"
              actionClass="text-blue-600 dark:text-blue-400"
              onClick={handleAskPadhAI}
            />

            <DashboardCard
              icon="🔤"
              title={t("dashboard.vocabBhaiya")}
              description={t(
                "dashboard.vocabBhaiyaDesc",
              )}
              action={t(
                "dashboard.openVocabBhaiya",
              )}
              badge={t("dashboard.external")}
              badgeClass="bg-indigo-600"
              className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-blue-950/20"
              actionClass="text-indigo-600 dark:text-indigo-400"
              onClick={handleVocabBhaiya}
            />

            <DashboardCard
              icon="🎥"
              title={t("dashboard.studyVideos")}
              description={t(
                "dashboard.studyVideosDesc",
              )}
              action={t("dashboard.comingSoon")}
              className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              actionClass="text-blue-600"
              onClick={() => {}}
            />
          </div>

          {/* EDIT PROFILE */}
          <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
            <button
              type="button"
              onClick={handleProfile}
              className="rounded-xl border border-blue-600 px-5 py-3 font-semibold text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              {t("dashboard.editMyProfile")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

interface InfoCardProps {
  label: string;
  value: string;
  className: string;
}

function InfoCard({
  label,
  value,
  className,
}: InfoCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
    >
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
        {value}
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
