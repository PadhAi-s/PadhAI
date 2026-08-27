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

  function openVocabBhaiya() {
    window.location.href = "https://vocabbhaiya.netlify.app/";
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Header */}
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
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                {profile?.full_name || "Student"}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.email}
              </p>
            </div>

            {/* 3 Dot Menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Open account menu"
                aria-expanded={menuOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                ⋮
              </button>

              {menuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
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
                        Subjects and chapters
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

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Welcome */}
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome to PadhAI 👋
          </h2>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {profile?.full_name || user?.email || "Student"}
          </p>

          {/* Profile Info */}
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

          {/* Features */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Quick Revision */}
            <button
              type="button"
              onClick={() => navigate("/student/quick-revision")}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="text-3xl">⚡</div>

              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                Quick Revision
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Revise important concepts, formulas and key points quickly.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
                Start Revision →
              </span>
            </button>

            {/* Ask PadhAI */}
            <button
              type="button"
              onClick={() => navigate("/student/ask")}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="text-3xl">🤖</div>

              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                Ask PadhAI
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Ask questions and get personalized AI explanations.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
                Ask Now →
              </span>
            </button>

            {/* Daily Newspaper */}
            <button
              type="button"
              onClick={() => navigate("/student/newspaper")}
              className="rounded-2xl border border-amber-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-amber-900/60 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div className="text-3xl">📰</div>

                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                  PREMIUM
                </span>
              </div>

              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                Daily Newspaper
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Daily important news explained simply for students.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-amber-600 dark:text-amber-400">
                Read Today's News →
              </span>
            </button>

            {/* Weekly Current Affairs */}
            <button
              type="button"
              onClick={() => navigate("/student/current-affairs")}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div className="text-3xl">🗞️</div>

                <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-700 dark:bg-green-950/60 dark:text-green-300">
                  FREE
                </span>
              </div>

              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                Weekly Current Affairs
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Important events of the week for exams and general awareness.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
                Read Current Affairs →
              </span>
            </button>

            {/* Vocab Bhaiya */}
            <button
              type="button"
              onClick={openVocabBhaiya}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="text-3xl">📘</div>

              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                Vocab Bhaiya
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Improve your English vocabulary with practice and quizzes.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
                Open Vocab Bhaiya →
              </span>
            </button>

            {/* Study Videos */}
            <button
              type="button"
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="text-3xl">🎥</div>

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

          {/* Profile */}
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
