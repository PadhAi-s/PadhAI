import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type TipCategory =
  | "All"
  | "Strategy"
  | "Revision"
  | "Time Management"
  | "Last Minute"
  | "Mindset";

type Tip = {
  id: number;
  category: Exclude<TipCategory, "All">;
  icon: string;
  title: string;
  description: string;
  points: string[];
  tag: string;
  featured?: boolean;
};

const CATEGORIES: {
  key: TipCategory;
  icon: string;
}[] = [
  { key: "All", icon: "✨" },
  { key: "Strategy", icon: "🎯" },
  { key: "Revision", icon: "🔄" },
  { key: "Time Management", icon: "⏱️" },
  { key: "Last Minute", icon: "⚡" },
  { key: "Mindset", icon: "🧠" },
];

const TIPS: Tip[] = [
  {
    id: 1,
    category: "Strategy",
    icon: "🎯",
    title: "Build an Exam Strategy",
    description:
      "A clear strategy helps you decide what to study, when to revise and how to attempt the paper.",
    tag: "Smart Strategy",
    featured: true,
    points: [
      "Understand the complete syllabus before starting.",
      "Divide subjects into strong, average and weak areas.",
      "Give more time to high-weightage and frequently asked topics.",
      "Keep a realistic daily study target.",
      "Review your progress every week.",
    ],
  },
  {
    id: 2,
    category: "Revision",
    icon: "🔄",
    title: "Use Smart Revision",
    description:
      "Revision is more effective when you actively recall information instead of simply reading it again.",
    tag: "Revision",
    points: [
      "Revise important concepts at regular intervals.",
      "Use short notes, formulas and one-page summaries.",
      "Practice questions immediately after revision.",
      "Mark topics you repeatedly forget.",
      "Keep a separate list of important mistakes.",
    ],
  },
  {
    id: 3,
    category: "Time Management",
    icon: "⏱️",
    title: "Master Your Time",
    description:
      "Good time management can improve both your preparation and your performance inside the exam hall.",
    tag: "Time Management",
    points: [
      "Create a daily timetable that you can actually follow.",
      "Study difficult subjects when your concentration is highest.",
      "Use focused study sessions with short breaks.",
      "Practice full-length mock tests with a timer.",
      "Track how much time you spend on each section.",
    ],
  },
  {
    id: 4,
    category: "Last Minute",
    icon: "⚡",
    title: "Last-Minute Preparation",
    description:
      "The final days should focus on revision, practice and confidence—not learning everything from scratch.",
    tag: "Last Minute",
    points: [
      "Revise formulas, facts, vocabulary and short notes.",
      "Solve previously attempted questions again.",
      "Avoid starting completely new and difficult topics.",
      "Analyse your most common mistakes.",
      "Keep your sleep schedule stable before the exam.",
    ],
  },
  {
    id: 5,
    category: "Mindset",
    icon: "🧠",
    title: "Develop the Right Mindset",
    description:
      "Consistent preparation becomes easier when you focus on progress instead of comparing yourself with others.",
    tag: "Mindset",
    points: [
      "Focus on your own preparation journey.",
      "Do not let one bad mock test discourage you.",
      "Treat mistakes as feedback.",
      "Stay consistent even on low-motivation days.",
      "Build confidence through regular practice.",
    ],
  },
  {
    id: 6,
    category: "Strategy",
    icon: "📊",
    title: "Analyse Mock Tests",
    description:
      "A mock test is valuable only when you analyse what went wrong after completing it.",
    tag: "Mock Tests",
    points: [
      "Check every incorrect answer.",
      "Identify questions where you spent too much time.",
      "Separate conceptual mistakes from silly mistakes.",
      "Maintain a mistake notebook.",
      "Use your analysis to change your next study plan.",
    ],
  },
  {
    id: 7,
    category: "Revision",
    icon: "📝",
    title: "Make Short Notes",
    description:
      "Short notes make last-week and last-day revision much faster and more focused.",
    tag: "Smart Notes",
    points: [
      "Write only important facts and concepts.",
      "Use keywords instead of long paragraphs.",
      "Keep formulas and rules together.",
      "Highlight frequently forgotten information.",
      "Update your notes after mock-test analysis.",
    ],
  },
  {
    id: 8,
    category: "Time Management",
    icon: "📅",
    title: "Plan Your Week",
    description:
      "Weekly planning gives you a clear picture of what needs to be completed and revised.",
    tag: "Planning",
    points: [
      "Set weekly learning targets.",
      "Reserve specific time for revision.",
      "Include mock tests and analysis.",
      "Keep one flexible slot for unfinished work.",
      "Review your weekly performance before planning the next week.",
    ],
  },
];

export default function ExamTips() {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] =
    useState<TipCategory>("All");

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [search, setSearch] = useState("");

  const filteredTips = useMemo(() => {
    const query = search.trim().toLowerCase();

    return TIPS.filter((tip) => {
      const categoryMatch =
        selectedCategory === "All" ||
        tip.category === selectedCategory;

      if (!categoryMatch) return false;

      if (!query) return true;

      const searchableText = [
        tip.title,
        tip.description,
        tip.category,
        tip.tag,
        ...tip.points,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [selectedCategory, search]);

  const toggleTip = (id: number) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">

      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

        {/* =====================================================
            BACK BUTTON
        ===================================================== */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <span className="text-base">←</span>
          Back
        </button>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative mb-7 overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-6 text-white shadow-xl shadow-orange-200 dark:shadow-none sm:p-8 lg:p-10">

          {/* Decorative shapes */}

          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-orange-700/10 blur-3xl" />

          <div className="pointer-events-none absolute right-20 top-24 h-24 w-24 rounded-full border border-white/20" />

          <div className="pointer-events-none absolute bottom-8 right-1/4 h-10 w-10 rounded-full bg-white/10" />

          {/* Hero Content */}

          <div className="relative max-w-4xl">

            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-black tracking-wide backdrop-blur">
              🔥 SMART EXAM PREPARATION
            </span>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Exam Tips
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90 sm:text-base">
              Get smart strategies, revision techniques and
              last-minute exam tips to prepare better,
              manage your time and perform with confidence.
            </p>

            {/* Hero Stats */}

            <div className="mt-6 flex flex-wrap gap-3">

              <div className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur">
                <div className="text-lg font-black">
                  {TIPS.length}+
                </div>
                <div className="text-[10px] font-bold text-white/75">
                  Preparation Tips
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur">
                <div className="text-lg font-black">
                  {CATEGORIES.length - 1}
                </div>
                <div className="text-[10px] font-bold text-white/75">
                  Focus Areas
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur">
                <div className="text-lg font-black">
                  100%
                </div>
                <div className="text-[10px] font-bold text-white/75">
                  Exam Focused
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            QUICK FOCUS CARDS
        ===================================================== */}

        <section className="mb-7">

          <div className="mb-4">
            <h2 className="text-xl font-black sm:text-2xl">
              Your Preparation Focus
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Follow these four pillars for smarter preparation.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Strategy */}

            <div className="group rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-indigo-900/40 dark:from-indigo-500/10 dark:to-slate-900">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-2xl dark:bg-indigo-500/15">
                🎯
              </div>

              <h3 className="mt-4 text-base font-black">
                Smart Strategy
              </h3>

              <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Study with a clear plan instead of studying randomly.
              </p>

            </div>

            {/* Revision */}

            <div className="group rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-emerald-900/40 dark:from-emerald-500/10 dark:to-slate-900">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl dark:bg-emerald-500/15">
                🔄
              </div>

              <h3 className="mt-4 text-base font-black">
                Smart Revision
              </h3>

              <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Revise important information repeatedly using active recall.
              </p>

            </div>

            {/* Time */}

            <div className="group rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-blue-900/40 dark:from-blue-500/10 dark:to-slate-900">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl dark:bg-blue-500/15">
                ⏱️
              </div>

              <h3 className="mt-4 text-base font-black">
                Time Management
              </h3>

              <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Balance study, revision and mock-test practice effectively.
              </p>

            </div>

            {/* Mindset */}

            <div className="group rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-purple-900/40 dark:from-purple-500/10 dark:to-slate-900">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl dark:bg-purple-500/15">
                🧠
              </div>

              <h3 className="mt-4 text-base font-black">
                Strong Mindset
              </h3>

              <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Stay consistent, learn from mistakes and build confidence.
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            SEARCH + CATEGORY FILTER
        ===================================================== */}

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">

          {/* Search */}

          <div className="relative mb-4">

            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
              🔎
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search exam tips..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
            />

          </div>

          {/* Categories */}

          <div className="flex gap-2 overflow-x-auto pb-1">

            {CATEGORIES.map((category) => {
              const active = selectedCategory === category.key;

              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category.key);
                    setExpandedId(null);
                  }}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black transition-all ${
                    active
                      ? "bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-none"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{category.icon}</span>
                  {category.key}
                </button>
              );
            })}

          </div>

        </section>

        {/* =====================================================
            SECTION HEADER
        ===================================================== */}

        <section className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h2 className="text-xl font-black sm:text-2xl">
              Preparation Tips
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Practical tips you can apply to your preparation.
            </p>
          </div>

          <div className="text-sm font-bold text-slate-400">
            {filteredTips.length}{" "}
            {filteredTips.length === 1 ? "tip" : "tips"}
          </div>

        </section>

        {/* =====================================================
            TIPS GRID
        ===================================================== */}

        {filteredTips.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">

            {filteredTips.map((tip, index) => {
              const expanded = expandedId === tip.id;

              return (
                <article
                  key={tip.id}
                  className={`group overflow-hidden rounded-[1.75rem] border bg-white shadow-sm transition-all duration-300 dark:bg-slate-900 ${
                    expanded
                      ? "border-orange-300 shadow-lg shadow-orange-100 dark:border-orange-500/40 dark:shadow-none"
                      : "border-slate-200 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800"
                  }`}
                >

                  {/* =================================================
                      CARD HEADER
                  ================================================= */}

                  <div
                    className={`relative overflow-hidden p-5 sm:p-6 ${
                      index % 4 === 0
                        ? "bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-orange-500/10 dark:via-slate-900 dark:to-amber-500/5"
                        : index % 4 === 1
                          ? "bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-500/10 dark:via-slate-900 dark:to-violet-500/5"
                          : index % 4 === 2
                            ? "bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-500/10 dark:via-slate-900 dark:to-teal-500/5"
                            : "bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-500/10 dark:via-slate-900 dark:to-pink-500/5"
                    }`}
                  >

                    {/* Decorative Circle */}

                    <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-orange-200/30 dark:bg-orange-500/5" />

                    <div className="relative flex items-start justify-between gap-4">

                      <div className="flex items-start gap-4">

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-md dark:bg-slate-800">
                          {tip.icon}
                        </div>

                        <div>

                          <div className="mb-2 flex flex-wrap items-center gap-2">

                            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                              {tip.tag}
                            </span>

                            {tip.featured && (
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                                ⭐ Featured
                              </span>
                            )}

                          </div>

                          <h3 className="text-lg font-black leading-6 sm:text-xl">
                            {tip.title}
                          </h3>

                        </div>

                      </div>

                    </div>

                    <p className="relative mt-5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {tip.description}
                    </p>

                  </div>

                  {/* =================================================
                      CARD BODY
                  ================================================= */}

                  <div className="px-5 pb-5 sm:px-6 sm:pb-6">

                    <button
                      type="button"
                      onClick={() => toggleTip(tip.id)}
                      className="mt-4 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-orange-300 hover:bg-orange-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-orange-500/40 dark:hover:bg-orange-500/5"
                    >

                      <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                        {expanded
                          ? "Hide practical tips"
                          : "See practical tips"}
                      </span>

                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-black text-orange-600 shadow-sm transition-transform duration-300 dark:bg-slate-800 ${
                          expanded ? "rotate-180" : ""
                        }`}
                      >
                        ↓
                      </span>

                    </button>

                    {/* Expanded Points */}

                    {expanded && (
                      <div className="mt-4 space-y-2.5">

                        {tip.points.map((point, pointIndex) => (
                          <div
                            key={pointIndex}
                            className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950"
                          >

                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-black text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                              {pointIndex + 1}
                            </span>

                            <p className="text-sm leading-5 text-slate-600 dark:text-slate-300">
                              {point}
                            </p>

                          </div>
                        ))}

                      </div>
                    )}

                  </div>

                  {/* =================================================
                      CARD FOOTER
                  ================================================= */}

                  <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/40 sm:px-6">

                    <span className="text-[11px] font-bold text-slate-400">
                      Exam Focused
                    </span>

                    <span className="text-xs font-black text-orange-600 dark:text-orange-400">
                      {expanded ? "↑ Collapse" : "→ Learn"}
                    </span>

                  </div>

                </article>
              );
            })}

          </div>
        ) : (
          /* =====================================================
             EMPTY STATE
          ===================================================== */

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">

            <div className="text-5xl">🔎</div>

            <h3 className="mt-4 text-xl font-black">
              No tips found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Try another search term or select a different category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
              className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 dark:shadow-none"
            >
              Clear Filters
            </button>

          </div>
        )}

        {/* =====================================================
            DAILY REMINDER
        ===================================================== */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 p-6 dark:border-orange-900/30 dark:from-orange-500/10 dark:via-amber-500/5 dark:to-yellow-500/5 sm:p-7">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm dark:bg-slate-900">
                💪
              </div>

              <div>

                <h3 className="text-base font-black sm:text-lg">
                  Consistency beats intensity.
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  रोज़ थोड़ा पढ़ो, revise करो और mistakes से सीखो.
                  Small improvements every day create big results.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() => navigate("/student/dashboard")}
              className="shrink-0 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600 dark:shadow-none"
            >
              Back to Dashboard →
            </button>

          </div>

        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="mt-7 text-center">

          <p className="text-xs font-semibold text-slate-400">
            🎯 Study smart • Revise regularly • Practice consistently
          </p>

        </div>

      </main>
    </div>
  );
}
