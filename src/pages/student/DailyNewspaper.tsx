import { useNavigate } from "react-router-dom";

export function DailyNewspaper() {
  const navigate = useNavigate();

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
              Daily Newspaper
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/student/dashboard")}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm dark:border-amber-900/50 dark:bg-slate-900 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-4xl">📰</div>

              <h2 className="mt-4 text-2xl font-bold">
                Daily Newspaper
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Today's important news selected specially for students.
              </p>
            </div>

            <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
              PREMIUM
            </span>
          </div>

          <div className="mt-8 rounded-2xl bg-amber-50 p-5 dark:bg-amber-950/30">
            <h3 className="font-semibold">
              🔒 Premium Content
            </h3>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Daily Newspaper is available for paid members.
              Subscribe to access today's newspaper and daily
              exam-focused news.
            </p>

            <button
              type="button"
              className="mt-5 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-white transition hover:bg-amber-600"
            >
              Unlock Daily Newspaper →
            </button>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
            <h3 className="font-semibold">
              What you'll get
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                📰 Daily important news
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                🎯 Exam-focused updates
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                📚 Easy student-friendly explanations
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                🔐 Non-shareable premium content
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
