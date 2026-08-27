import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface CurrentAffair {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  source?: string;
}

const weeklyCurrentAffairs: CurrentAffair[] = [
  {
    id: "1",
    title: "National Updates",
    summary:
      "Important national events and government-related developments from this week.",
    category: "National",
    date: "This Week",
  },
  {
    id: "2",
    title: "International Affairs",
    summary:
      "Major international events, global developments and important world news.",
    category: "International",
    date: "This Week",
  },
  {
    id: "3",
    title: "Science & Technology",
    summary:
      "Important developments in science, technology, space and innovation.",
    category: "Science & Tech",
    date: "This Week",
  },
  {
    id: "4",
    title: "Economy & Business",
    summary:
      "Key economic developments, business news and important financial updates.",
    category: "Economy",
    date: "This Week",
  },
  {
    id: "5",
    title: "Sports",
    summary:
      "Important sports events, tournaments, achievements and major updates.",
    category: "Sports",
    date: "This Week",
  },
  {
    id: "6",
    title: "Awards & Appointments",
    summary:
      "Important appointments, awards, honours and personalities in the news.",
    category: "Awards",
    date: "This Week",
  },
];

export function WeeklyCurrentAffairs() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "Weekly Current Affairs | PadhAI";
  }, []);

  const categories = [
    "All",
    "National",
    "International",
    "Science & Tech",
    "Economy",
    "Sports",
    "Awards",
  ];

  const filteredAffairs = weeklyCurrentAffairs.filter(
    (item) => {
      const matchesCategory =
        selectedCategory === "All" ||
        item.category === selectedCategory;

      const searchText =
        `${item.title} ${item.summary} ${item.category}`.toLowerCase();

      const matchesSearch =
        searchText.includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    },
  );

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
            onClick={() =>
              navigate("/student/dashboard")
            }
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      {/* Main */}

      <main className="mx-auto max-w-6xl px-4 py-8">

        {/* Hero */}

        <section className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg sm:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                🆓 FREE
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Weekly Current Affairs 📰
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Stay updated with important events of the week.
                Perfect for school exams, competitive exams and
                general awareness.
              </p>

              <p className="mt-4 text-sm font-medium text-blue-100">
                Hi {profile?.full_name || user?.email || "Student"} 👋
              </p>

            </div>

            <div className="hidden text-7xl md:block">
              📰
            </div>

          </div>

        </section>

        {/* Search */}

        <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search current affairs..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950"
          />

          {/* Categories */}

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setSelectedCategory(category)
                }
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {category}
              </button>
            ))}

          </div>

        </section>

        {/* Section Header */}

        <div className="mt-8 flex items-end justify-between">

          <div>
            <p className="text-sm font-medium text-blue-600">
              THIS WEEK
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Important Updates
            </h2>
          </div>

          <span className="text-sm text-slate-500 dark:text-slate-400">
            {filteredAffairs.length} topics
          </span>

        </div>

        {/* Affairs */}

        {filteredAffairs.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {filteredAffairs.map((item) => (
              <article
                key={item.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >

                <div className="flex items-start justify-between gap-3">

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                    {item.category}
                  </span>

                  <span className="text-xs text-slate-400">
                    {item.date}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {item.summary}
                </p>

                <button
                  type="button"
                  className="mt-5 text-sm font-semibold text-blue-600 transition group-hover:text-blue-700 dark:text-blue-400"
                >
                  Read More →
                </button>

              </article>
            ))}

          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-slate-900">

            <div className="text-4xl">
              🔎
            </div>

            <h3 className="mt-3 font-bold">
              No current affairs found
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try another search or category.
            </p>

          </div>
        )}

        {/* Daily Newspaper teaser */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  🗞️
                </span>

                <h2 className="text-lg font-bold">
                  Daily Newspaper
                </h2>

                <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                  PREMIUM
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Daily curated newspaper with exam-focused
                important news, available for premium students.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/student/daily-newspaper")
              }
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              View Premium →
            </button>

          </div>

        </section>

        {/* Note */}

        <div className="mt-6 rounded-2xl bg-blue-50 p-5 dark:bg-blue-950/30">

          <h3 className="font-semibold text-blue-900 dark:text-blue-200">
            🎯 Exam Tip
          </h3>

          <p className="mt-2 text-sm leading-6 text-blue-800 dark:text-blue-300">
            Current affairs ko sirf read mat karo. Important
            names, dates, awards, appointments, places aur
            numbers ko revise karo. Weekly revision se
            retention better hoti hai.
          </p>

        </div>

      </main>
    </div>
  );
}
