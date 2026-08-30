import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

interface MCQ {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface CurrentAffair {
  id: string;
  affair_date: string;
  serial_no: number;
  title: string;
  why_in_news: string;
  key_facts: string;
  exam_point: string;
  static_gk: string;
  mcqs: MCQ[];
}

export function WeeklyCurrentAffairs() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [affairs, setAffairs] = useState<CurrentAffair[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState("All");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedAffair, setSelectedAffair] =
    useState<CurrentAffair | null>(null);

  useEffect(() => {
    document.title = "Weekly Current Affairs | PadhAI";
    loadCurrentAffairs();
  }, []);

  async function loadCurrentAffairs() {
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("current_affairs")
        .select(
          "id,affair_date,serial_no,title,why_in_news,key_facts,exam_point,static_gk,mcqs",
        )
        .order("affair_date", { ascending: false })
        .order("serial_no", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const formatted: CurrentAffair[] = (data ?? []).map(
        (row) => ({
          id: row.id,
          affair_date: row.affair_date,
          serial_no: Number(row.serial_no ?? 1),
          title: row.title ?? "",
          why_in_news: row.why_in_news ?? "",
          key_facts: row.key_facts ?? "",
          exam_point: row.exam_point ?? "",
          static_gk: row.static_gk ?? "",
          mcqs: Array.isArray(row.mcqs)
            ? row.mcqs
            : [],
        }),
      );

      setAffairs(formatted);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load current affairs.",
      );
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    "All",
    "National",
    "International",
    "Science & Tech",
    "Economy",
    "Sports",
    "Awards",
  ];

  /*
   * Current database table mein category field nahi hai.
   * Isliye category ko title/content ke keywords se
   * automatically detect kiya ja raha hai.
   */
  function getCategory(affair: CurrentAffair) {
    const text =
      `${affair.title} ${affair.why_in_news} ${affair.key_facts}`
        .toLowerCase();

    if (
      /sports|cricket|football|hockey|tennis|olympic|athlete|tournament|medal|championship/.test(
        text,
      )
    ) {
      return "Sports";
    }

    if (
      /award|awards|honour|honor|appointment|appointed|chairman|chairperson|president|ceo|director/.test(
        text,
      )
    ) {
      return "Awards";
    }

    if (
      /economy|economic|rbi|bank|banking|finance|financial|inflation|gdp|sebi|market|budget|business/.test(
        text,
      )
    ) {
      return "Economy";
    }

    if (
      /science|technology|technology|ai|artificial intelligence|space|isro|nasa|satellite|research|innovation|quantum|digital/.test(
        text,
      )
    ) {
      return "Science & Tech";
    }

    if (
      /international|united nations|un|usa|america|china|russia|uk|britain|france|japan|germany|global|world bank|imf|foreign/.test(
        text,
      )
    ) {
      return "International";
    }

    return "National";
  }

  const filteredAffairs = useMemo(() => {
    return affairs.filter((item) => {
      const category = getCategory(item);

      const matchesCategory =
        selectedCategory === "All" ||
        category === selectedCategory;

      const searchText =
        `${item.title}
        ${item.why_in_news}
        ${item.key_facts}
        ${item.exam_point}
        ${item.static_gk}
        ${category}`
          .toLowerCase();

      const matchesSearch = searchText.includes(
        search.toLowerCase().trim(),
      );

      return matchesCategory && matchesSearch;
    });
  }, [affairs, selectedCategory, search]);

  function formatDate(date: string) {
    if (!date) return "";

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function openAffair(affair: CurrentAffair) {
    setSelectedAffair(affair);
  }

  function closeAffair() {
    setSelectedAffair(null);
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

      {/* MAIN */}
      <main className="mx-auto max-w-6xl px-4 py-8">

        {/* HERO */}
        <section className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg sm:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                🆓 FREE
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Current Affairs 📰
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Daily exam-focused current affairs with
                important facts, exam points, static GK and
                MCQs.
              </p>

              <p className="mt-4 text-sm font-medium text-blue-100">
                Hi{" "}
                {profile?.full_name ||
                  user?.email ||
                  "Student"}{" "}
                👋
              </p>

            </div>

            <div className="hidden text-7xl md:block">
              📰
            </div>

          </div>

        </section>

        {/* SEARCH + FILTER */}
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

        {/* SECTION HEADER */}
        <div className="mt-8 flex items-end justify-between">

          <div>
            <p className="text-sm font-medium text-blue-600">
              LATEST UPDATES
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Important Current Affairs
            </h2>
          </div>

          <span className="text-sm text-slate-500 dark:text-slate-400">
            {filteredAffairs.length} topics
          </span>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-slate-900">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Loading current affairs...
            </p>

          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">

            <h3 className="font-bold text-red-700 dark:text-red-300">
              Unable to load current affairs
            </h3>

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={loadCurrentAffairs}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>

          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          filteredAffairs.length === 0 && (
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

              {(search ||
                selectedCategory !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All");
                  }}
                  className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              )}

            </div>
          )}

        {/* AFFAIRS GRID */}
        {!loading &&
          !error &&
          filteredAffairs.length > 0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {filteredAffairs.map((item) => {
                const category = getCategory(item);

                return (
                  <article
                    key={item.id}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                        {category}
                      </span>

                      <span className="text-xs text-slate-400">
                        {formatDate(item.affair_date)}
                      </span>

                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                      <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
                        #{item.serial_no}
                      </span>

                      {item.mcqs.length > 0 && (
                        <span className="rounded-md bg-green-50 px-2 py-1 text-green-700 dark:bg-green-950/40 dark:text-green-300">
                          {item.mcqs.length} MCQ
                          {item.mcqs.length !== 1
                            ? "s"
                            : ""}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>

                    <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {item.why_in_news}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        openAffair(item)
                      }
                      className="mt-5 text-sm font-semibold text-blue-600 transition group-hover:text-blue-700 dark:text-blue-400"
                    >
                      Read More →
                    </button>

                  </article>
                );
              })}

            </div>
          )}

        {/* DAILY NEWSPAPER */}
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
                important news, available for premium
                students.
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

        {/* EXAM TIP */}
        <div className="mt-6 rounded-2xl bg-blue-50 p-5 dark:bg-blue-950/30">

          <h3 className="font-semibold text-blue-900 dark:text-blue-200">
            🎯 Exam Tip
          </h3>

          <p className="mt-2 text-sm leading-6 text-blue-800 dark:text-blue-300">
            Current affairs ko sirf read mat karo.
            Important names, dates, awards, appointments,
            places aur numbers ko revise karo. Weekly
            revision se retention better hoti hai.
          </p>

        </div>

      </main>

      {/* =====================================================
          CURRENT AFFAIR DETAIL MODAL
          ===================================================== */}

      {selectedAffair && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4">

          <div className="mx-auto my-6 max-w-4xl rounded-3xl bg-white shadow-2xl dark:bg-slate-900">

            {/* MODAL HEADER */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800">

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                    {getCategory(selectedAffair)}
                  </span>

                  <span className="text-xs text-slate-400">
                    #{selectedAffair.serial_no}
                  </span>

                  <span className="text-xs text-slate-400">
                    {formatDate(
                      selectedAffair.affair_date,
                    )}
                  </span>

                </div>

                <h2 className="mt-3 text-xl font-bold sm:text-2xl">
                  {selectedAffair.title}
                </h2>

              </div>

              <button
                type="button"
                onClick={closeAffair}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                ×
              </button>

            </div>

            {/* MODAL BODY */}
            <div className="space-y-6 p-6">

              {/* WHY IN NEWS */}
              <section>

                <h3 className="text-lg font-bold text-blue-600">
                  📰 Why in News
                </h3>

                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {selectedAffair.why_in_news ||
                    "Not available."}
                </p>

              </section>

              {/* KEY FACTS */}
              <section className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/60">

                <h3 className="text-lg font-bold">
                  📌 Key Facts
                </h3>

                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {selectedAffair.key_facts ||
                    "Not available."}
                </p>

              </section>

              {/* EXAM POINT */}
              <section className="rounded-2xl bg-blue-50 p-5 dark:bg-blue-950/30">

                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200">
                  🎯 Exam Point
                </h3>

                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-blue-800 dark:text-blue-300">
                  {selectedAffair.exam_point ||
                    "Not available."}
                </p>

              </section>

              {/* STATIC GK */}
              {selectedAffair.static_gk && (
                <section className="rounded-2xl bg-amber-50 p-5 dark:bg-amber-950/20">

                  <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200">
                    📚 Static GK
                  </h3>

                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-amber-800 dark:text-amber-300">
                    {selectedAffair.static_gk}
                  </p>

                </section>
              )}

              {/* MCQS */}
              {selectedAffair.mcqs.length > 0 && (
                <section>

                  <div className="flex items-center justify-between">

                    <div>
                      <h3 className="text-lg font-bold">
                        📝 Practice MCQs
                      </h3>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Test your understanding.
                      </p>
                    </div>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-300">
                      {selectedAffair.mcqs.length} MCQ
                      {selectedAffair.mcqs.length !== 1
                        ? "s"
                        : ""}
                    </span>

                  </div>

                  <div className="mt-4 space-y-4">

                    {selectedAffair.mcqs.map(
                      (mcq, index) => (
                        <MCQCard
                          key={`${selectedAffair.id}-mcq-${index}`}
                          mcq={mcq}
                          index={index}
                        />
                      ),
                    )}

                  </div>

                </section>
              )}

            </div>

            {/* MODAL FOOTER */}
            <div className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-800">

              <button
                type="button"
                onClick={closeAffair}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/* ============================================================
   MCQ CARD
   ============================================================ */

function MCQCard({
  mcq,
  index,
}: {
  mcq: MCQ;
  index: number;
}) {
  const [selectedOption, setSelectedOption] =
    useState<string | null>(null);

  const [showAnswer, setShowAnswer] =
    useState(false);

  function handleOptionClick(option: string) {
    if (showAnswer) return;

    setSelectedOption(option);
  }

  function submitAnswer() {
    if (!selectedOption) return;

    setShowAnswer(true);
  }

  const isCorrect =
    selectedOption !== null &&
    selectedOption.trim().toLowerCase() ===
      mcq.answer.trim().toLowerCase();

  return (
    <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">

      <p className="font-semibold">
        {index + 1}. {mcq.question}
      </p>

      <div className="mt-4 grid gap-3">

        {mcq.options.map((option, optionIndex) => {

          const isSelected =
            selectedOption === option;

          const isAnswer =
            option.trim().toLowerCase() ===
            mcq.answer.trim().toLowerCase();

          let optionClass =
            "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800";

          if (showAnswer && isAnswer) {
            optionClass =
              "border-green-500 bg-green-50 text-green-800 dark:border-green-500 dark:bg-green-950/30 dark:text-green-300";
          } else if (
            showAnswer &&
            isSelected &&
            !isCorrect
          ) {
            optionClass =
              "border-red-500 bg-red-50 text-red-800 dark:border-red-500 dark:bg-red-950/30 dark:text-red-300";
          } else if (isSelected) {
            optionClass =
              "border-blue-500 bg-blue-50 text-blue-800 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-300";
          }

          return (
            <button
              key={optionIndex}
              type="button"
              onClick={() =>
                handleOptionClick(option)
              }
              className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${optionClass}`}
            >
              <span className="mr-2 font-bold">
                {String.fromCharCode(
                  65 + optionIndex,
                )}
                .
              </span>

              {option}

              {showAnswer && isAnswer && (
                <span className="float-right">
                  ✓
                </span>
              )}

              {showAnswer &&
                isSelected &&
                !isCorrect && (
                  <span className="float-right">
                    ✕
                  </span>
                )}
            </button>
          );
        })}

      </div>

      {!showAnswer && (
        <button
          type="button"
          onClick={submitAnswer}
          disabled={!selectedOption}
          className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Check Answer
        </button>
      )}

      {showAnswer && (
        <div
          className={`mt-4 rounded-xl p-4 ${
            isCorrect
              ? "bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300"
              : "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300"
          }`}
        >

          <p className="font-bold">
            {isCorrect
              ? "✅ Correct Answer!"
              : "❌ Incorrect Answer"}
          </p>

          <p className="mt-1 text-sm">
            Correct answer:{" "}
            <strong>{mcq.answer}</strong>
          </p>

          {mcq.explanation && (
            <p className="mt-2 whitespace-pre-line text-sm leading-6">
              {mcq.explanation}
            </p>
          )}

        </div>
      )}

    </div>
  );
}

export default WeeklyCurrentAffairs;
