import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export function StudentDashboard() {
  const navigate = useNavigate();
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
    window.location.href = "https://vocabbhaiya.netlify.app/";
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">

      {/* ==================== HEADER ==================== */}

      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">

          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              PadhAI
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Student Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">

            {/* User Info */}

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                {profile?.full_name || "Student"}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.email}
              </p>
            </div>

            {/* ==================== 3 DOT MENU ==================== */}

            <div className="relative" ref={menuRef}>

              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Open menu"
                aria-expanded={menuOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                ⋮
              </button>

              {menuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">

                  {/* My Syllabus */}

                  <button
                    type="button"
                    onClick={handleSyllabus}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span className="text-lg">📚</span>

                    <span>
                      <span className="block">
                        My Syllabus
                      </span>

                      <span className="text-xs font-normal text-slate-400">
                        Subjects & chapters
                      </span>
                    </span>
                  </button>

                  {/* My Profile */}

                  <button
                    type="button"
                    onClick={handleProfile}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span className="text-lg">👤</span>

                    <span>
                      <span className="block">
                        My Profile
                      </span>

                      <span className="text-xs font-normal text-slate-400">
                        Edit your profile
                      </span>
                    </span>
                  </button>

                  {/* Theme */}

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
                          ? "Light Mode"
                          : "Dark Mode"}
                      </span>

                      <span className="text-xs font-normal text-slate-400">
                        Change appearance
                      </span>
                    </span>
                  </button>

                  {/* Settings */}

                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span className="text-lg">⚙️</span>

                    <span>
                      <span className="block">
                        Settings
                      </span>

                      <span className="text-xs font-normal text-slate-400">
                        Coming soon
                      </span>
                    </span>
                  </button>

                  <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

                  {/* Logout */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <span className="text-lg">🚪</span>

                    <span>Logout</span>
                  </button>

                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ==================== MAIN ==================== */}

      <main className="mx-auto max-w-6xl px-4 py-8">

        {/* Welcome */}

        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome to PadhAI 👋
          </h2>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {profile?.full_name || user?.email || "Student"}
          </p>

          {/* ==================== PROFILE INFO ==================== */}

          <div className="mt-6 grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl bg-blue-50 p-5 dark:bg-blue-950/40">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Class
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                {profile?.class_name || "Not set"}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-5 dark:bg-green-950/40">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Board
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                {profile?.board || "Not set"}
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 p-5 dark:bg-purple-950/40">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Exam
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                {profile?.exam || "Not set"}
              </p>
            </div>

          </div>

          {/* ==================== FEATURES ==================== */}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* ==================== DAILY NEWSPAPER ==================== */}

            <button
              type="button"
              onClick={handleDailyNewspaper}
              className="group relative rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-amber-900/50 dark:from-amber-950/30 dark:to-orange-950/20"
            >

              <div className="absolute right-4 top-4 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white">
                PREMIUM
              </div>

              <div className="text-3xl">
                📰
              </div>

              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                Daily Newspaper
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Read today's important news selected specially for students.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-amber-600 dark:text-amber-400">
                Read Today's Paper 🔒 →
              </span>

            </button>

            {/* ==================== WEEKLY CURRENT AFFAIRS ==================== */}

            <button
              type="button"
              onClick={handleCurrentAffairs}
              className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-green-900/50 dark:from-green-950/30 dark:to-emerald-950/20"
            >

              <div className="flex items-center justify-between">

                <div className="text-3xl">
                  🗞️
                </div>

                <span className="rounded-full bg-green-600 px-2.5 py-1 text-[10px] font-bold text-white">
                  FREE
                </span>

              </div>

              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                Weekly Current Affairs
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Important weekly current affairs for exams and general awareness.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-green-600 dark:text-green-400">
                Read Current Affairs →
              </span>

            </button>

            {/* ==================== QUICK REVISION ==================== */}

            <button
              type="button"
              onClick={handleQuickRevision}
              className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-purple-900/50 dark:from-purple-950/30 dark:to-violet-950/20"
            >

              <div className="text-3xl">
                ⚡
              </div>

              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                Quick Revision
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Revise important concepts, formulas and exam points quickly.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-purple-600 dark:text-purple-400">
                Revise Now →
              </span>

            </button>

            {/* ==================== ASK PADHAI ==================== */}

            <button
              type="button"
              onClick={handleAskPadhAI}
              className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-blue-900/50 dark:from-blue-950/30 dark:to-cyan-950/20"
            >

              <div className="text-3xl">
                🤖
              </div>

              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                Ask PadhAI
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Ask questions and get step-by-step AI explanations.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-blue-600 dark:text-blue-400">
                Ask Now →
              </span>

            </button>

            {/* ==================== VOCAB BHAIYA ==================== */}

            <button
              type="button"
              onClick={handleVocabBhaiya}
              className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-blue-950/20"
            >

              <div className="flex items-center justify-between">

                <div className="text-3xl">
                  🔤
                </div>

                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  External ↗
                </span>

              </div>

              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                Vocab Bhaiya
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Improve your English vocabulary with Vocab Bhaiya.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                Open Vocab Bhaiya →
              </span>

            </button>

            {/* ==================== STUDY VIDEOS ==================== */}

            <button
              type="button"
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >

              <div className="text-3xl">
                🎥
              </div>

              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                Study Videos
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Relevant learning videos for your studies.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
                Coming soon
              </span>

            </button>

          </div>

          {/* ==================== PROFILE BUTTON ==================== */}

          <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">

            <button
              type="button"
              onClick={() => navigate("/student/profile")}
              className="rounded-xl border border-blue-600 px-5 py-3 font-semibold text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              Edit My Profile
            </button>

          </div>

        </div>
      </main>
    </div>
  );
}
