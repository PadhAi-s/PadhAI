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
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm dark:border-amber-900/50 dark:bg-slate-900 sm:p-8">
          {/* Premium header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-4xl">📰</div>

              <h2 className="mt-4 text-2xl font-bold">
                Daily Newspaper
              </h2>

              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Today's important news selected specially for students.
              </p>
            </div>

            <span className="w-fit rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white">
              PREMIUM 🔒
            </span>
          </div>

          {/* Locked content */}
          <div className="mt-8 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-950/20">
            <div className="text-5xl">🔐</div>

            <h3 className="mt-4 text-xl font-bold">
              Premium Newspaper
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">
              Daily Newspaper is available for premium members.
              Subscribe to access today's newspaper and daily student-focused news.
            </p>

            <button
              type="button"
              className="mt-6 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white transition hover:bg-amber-600"
              onClick={() => {
                alert("Premium subscription will be available soon.");
              }}
            >
              Unlock Daily Newspaper →
            </button>
          </div>

          {/* Features */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
              <div className="text-2xl">🗞️</div>
              <h4 className="mt-3 font-semibold">
                Daily News
              </h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Important national and international news.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
              <div className="text-2xl">🎯</div>
              <h4 className="mt-3 font-semibold">
                Exam Focused
              </h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Useful points for competitive exams.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
              <div className="text-2xl">🔒</div>
              <h4 className="mt-3 font-semibold">
                Premium Content
              </h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Protected content for subscribers.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
