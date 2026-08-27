import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface CurrentAffair {
  category: string;
  title: string;
  summary: string;
  examPoint: string;
}

const weeklyAffairs: CurrentAffair[] = [
  {
    category: "National",
    title: "India – Important National Updates",
    summary:
      "Is section mein week ke important national developments ko simple language mein revise karein.",
    examPoint:
      "Competitive exams mein important facts, dates, schemes aur government initiatives par focus karein.",
  },
  {
    category: "International",
    title: "World – Important Updates",
    summary:
      "Week ke important international events aur global developments ka quick overview.",
    examPoint:
      "Countries, organisations, agreements aur important international events yaad rakhein.",
  },
  {
    category: "Economy",
    title: "Economy & Banking",
    summary:
      "Economy, banking, financial sector aur business se related important updates.",
    examPoint:
      "RBI, monetary policy, banking terms, reports aur important economic indicators par focus karein.",
  },
  {
    category: "Science & Technology",
    title: "Science & Technology",
    summary:
      "Science, technology, space aur important innovations se related weekly updates.",
    examPoint:
      "Important missions, technologies, discoveries aur organisations ko note karein.",
  },
  {
    category: "Sports",
    title: "Sports Updates",
    summary:
      "Week ke important tournaments, championships aur sporting achievements ka revision.",
    examPoint:
      "Winners, runners-up, venues, records aur important sports personalities par focus karein.",
  },
  {
    category: "Awards & Appointments",
    title: "Awards & Important Appointments",
    summary:
      "Important awards, honours aur major appointments ka weekly revision.",
    examPoint:
      "Award + recipient aur appointment + organisation ko pair mein yaad karein.",
  },
];

export function WeeklyCurrentAffairs() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

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
              Weekly Current Affairs
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/student/dashboard")}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero */}
        <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-950/40 dark:text-green-300">
                🆓 FREE
              </div>

              <h2 className="text-3xl font-bold">
                Weekly Current Affairs 🗞️
              </h2>

              <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
                Har week ke important current affairs ko simple,
                exam-focused aur easy-to-revise format mein padho.
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 px-5 py-4 dark:bg-blue-950/40">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Student
              </p>

              <p className="mt-1 font-bold">
                {profile?.full_name || user?.email || "Student"}
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/40">
              <div className="text-2xl">📚</div>

              <p className="mt-2 font-bold">Exam Focused</p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Important facts aur exam points.
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 p-4 dark:bg-purple-950/40">
              <div className="text-2xl">⚡</div>

              <p className="mt-2 font-bold">Quick Revision</p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Short aur easy explanations.
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-4 dark:bg-green-950/40">
              <div className="text-2xl">🆓</div>

              <p className="mt-2 font-bold">Always Free</p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Weekly current affairs sabke liye free.
              </p>
            </div>
          </div>
        </section>

        {/* Current Affairs */}
        <section className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">
              This Week's Current Affairs
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Important categories ko revise karo.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {weeklyAffairs.map((affair, index) => (
              <article
                key={affair.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    {affair.category}
                  </span>

                  <span className="text-xs font-semibold text-slate-400">
                    #{index + 1}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold">
                  {affair.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {affair.summary}
                </p>

                <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    🎯 Exam Point
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {affair.examPoint}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Coming Soon */}
        <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
          <div className="text-4xl">🚀</div>

          <h3 className="mt-3 text-lg font-bold">
            More Current Affairs Coming Soon
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Weekly section ko gradually detailed current affairs,
            important facts aur exam-oriented questions ke saath
            expand kiya jayega.
          </p>
        </section>

        {/* Bottom Navigation */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/student/ask")}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            🤖 Ask PadhAI
          </button>

          <button
            type="button"
            onClick={() => navigate("/student/dashboard")}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
