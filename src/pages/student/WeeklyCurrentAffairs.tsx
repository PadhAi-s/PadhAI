import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

/* =====================================================
   TYPES
===================================================== */

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

  published: boolean;
  category: string;

  title_hi: string;
  why_in_news_hi: string;
  key_facts_hi: string;
  exam_point_hi: string;
  static_gk_hi: string;
}

/* =====================================================
   CATEGORIES
===================================================== */

const CATEGORIES = [
  "All",
  "National",
  "International",
  "Economy",
  "Science & Technology",
  "Environment",
  "Defence",
  "Sports",
  "Awards",
  "Appointments",
  "Government Schemes",
  "Reports & Index",
  "Important Days",
  "Other",
];

/* =====================================================
   COMPONENT
===================================================== */

export function WeeklyCurrentAffairs() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [affairs, setAffairs] = useState<
    CurrentAffair[]
  >([]);

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     PAGE SETUP
  ===================================================== */

  useEffect(() => {
    document.title =
      "Daily Current Affairs | VIDYZEN";

    void loadCurrentAffairs();
  }, []);

  /* =====================================================
     LOAD CURRENT AFFAIRS
  ===================================================== */

  async function loadCurrentAffairs() {
    console.log(
      "========================================",
    );
    console.log(
      "📚 CURRENT AFFAIRS LOAD START",
    );
    console.log(
      "========================================",
    );

    setLoading(true);
    setError("");

    try {
      /* -----------------------------------------------
         AUTH CHECK
      ----------------------------------------------- */

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log(
        "🔐 Session:",
        session
          ? "SESSION FOUND"
          : "NO SESSION",
      );

      if (sessionError) {
        console.error(
          "❌ Session Error:",
          sessionError,
        );
      }

      if (!session) {
        console.warn(
          "⚠️ No active session. Redirecting login.",
        );

        navigate("/student/login");
        return;
      }

      /* -----------------------------------------------
         SUPABASE QUERY
         
         IMPORTANT:
         Literal select string intentionally used.
         Do NOT use array.join(",") here.
      ----------------------------------------------- */

      console.log(
        "📡 Querying current_affairs table...",
      );

      const queryPromise = supabase
        .from("current_affairs")
        .select(
          "id,affair_date,serial_no,title,why_in_news,key_facts,exam_point,static_gk,mcqs,published,category,title_hi,why_in_news_hi,key_facts_hi,exam_point_hi,static_gk_hi",
        )
        .eq("published", true)
        .order("affair_date", {
          ascending: false,
        })
        .order("serial_no", {
          ascending: true,
        });

      /* -----------------------------------------------
         TIMEOUT
         
         Agar Supabase kisi reason se request hang kare,
         page forever loading nahi karega.
      ----------------------------------------------- */

      const timeoutPromise =
        new Promise<{
          data: null;
          error: Error;
        }>((resolve) => {
          setTimeout(() => {
            resolve({
              data: null,
              error: new Error(
                "Supabase request 15 seconds se zyada time le rahi hai. Network, RLS policy ya Supabase connection check karo.",
              ),
            });
          }, 15000);
        });

      const result = await Promise.race([
        queryPromise,
        timeoutPromise,
      ]);

      const {
        data,
        error: fetchError,
      } = result;

      /* -----------------------------------------------
         RAW DEBUG
      ----------------------------------------------- */

      console.log(
        "📦 Supabase Data:",
        data,
      );

      console.log(
        "❗ Supabase Error:",
        fetchError,
      );

      /* -----------------------------------------------
         ERROR CHECK
      ----------------------------------------------- */

      if (fetchError) {
        console.error(
          "❌ CURRENT AFFAIRS QUERY FAILED",
          fetchError,
        );

        throw fetchError;
      }

      /* -----------------------------------------------
         EMPTY RESULT
      ----------------------------------------------- */

      if (!data) {
        console.warn(
          "⚠️ Supabase returned null data.",
        );

        setAffairs([]);
        return;
      }

      console.log(
        `✅ ${data.length} current affairs received.`,
      );

      /* -----------------------------------------------
         DEBUG FIRST ROW
      ----------------------------------------------- */

      if (data.length > 0) {
        console.log(
          "🔎 FIRST CURRENT AFFAIR:",
          data[0],
        );
      } else {
        console.warn(
          "⚠️ Query successful but 0 published current affairs found.",
        );
      }

      /* -----------------------------------------------
         FORMAT DATA
      ----------------------------------------------- */

      const formatted: CurrentAffair[] =
        data.map((row) => ({
          id: String(row.id ?? ""),

          affair_date:
            String(
              row.affair_date ?? "",
            ),

          serial_no:
            Number(
              row.serial_no ?? 1,
            ),

          title:
            String(
              row.title ?? "",
            ),

          why_in_news:
            String(
              row.why_in_news ?? "",
            ),

          key_facts:
            String(
              row.key_facts ?? "",
            ),

          exam_point:
            String(
              row.exam_point ?? "",
            ),

          static_gk:
            String(
              row.static_gk ?? "",
            ),

          mcqs:
            normalizeMCQs(
              row.mcqs,
            ),

          published:
            typeof row.published ===
            "boolean"
              ? row.published
              : true,

          category:
            typeof row.category ===
            "string" &&
            row.category.trim()
              ? row.category.trim()
              : "Other",

          title_hi:
            String(
              row.title_hi ?? "",
            ),

          why_in_news_hi:
            String(
              row.why_in_news_hi ??
                "",
            ),

          key_facts_hi:
            String(
              row.key_facts_hi ??
                "",
            ),

          exam_point_hi:
            String(
              row.exam_point_hi ??
                "",
            ),

          static_gk_hi:
            String(
              row.static_gk_hi ??
                "",
            ),
        }));

      console.log(
        "🧹 FORMATTED CURRENT AFFAIRS:",
        formatted,
      );

      setAffairs(formatted);

      console.log(
        "✅ CURRENT AFFAIRS LOAD SUCCESS",
      );
    } catch (err) {
      console.error(
        "========================================",
      );

      console.error(
        "❌ CURRENT AFFAIRS LOAD ERROR",
      );

      console.error(
        err,
      );

      console.error(
        "========================================",
      );

      setAffairs([]);

      if (err instanceof Error) {
        setError(
          err.message ||
            "Unable to load current affairs.",
        );
      } else {
        setError(
          "Unable to load current affairs.",
        );
      }
    } finally {
      console.log(
        "🔚 Current Affairs loading finished.",
      );

      setLoading(false);
    }
  }

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredAffairs = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return affairs.filter((item) => {
      const category =
        item.category || "Other";

      const matchesCategory =
        selectedCategory === "All" ||
        category === selectedCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        item.title,
        item.why_in_news,
        item.key_facts,
        item.exam_point,
        item.static_gk,

        item.title_hi,
        item.why_in_news_hi,
        item.key_facts_hi,
        item.exam_point_hi,
        item.static_gk_hi,

        item.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        query,
      );
    });
  }, [
    affairs,
    selectedCategory,
    search,
  ]);

  /* =====================================================
     DATE FORMAT
  ===================================================== */

  function formatDate(
    date: string,
  ) {
    if (!date) {
      return "";
    }

    const parsed = new Date(
      `${date}T00:00:00`,
    );

    if (
      Number.isNaN(
        parsed.getTime(),
      )
    ) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  }

  /* =====================================================
     OPEN DETAIL
  ===================================================== */

  function openAffair(
    id: string,
  ) {
    navigate(
      `/student/current-affairs/${id}`,
    );
  }

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  function clearFilters() {
    setSearch("");
    setSelectedCategory("All");
  }

  /* =====================================================
     STUDENT NAME
  ===================================================== */

  const studentName =
    profile?.full_name ||
    user?.email?.split("@")[0] ||
    "Student";

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/dashboard",
              )
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-black text-white shadow-sm">
              V
            </div>

            <div className="text-left">
              <h1 className="text-lg font-black tracking-tight">
                VIDYZEN
              </h1>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily Current Affairs
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/dashboard",
              )
            }
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">

        {/* HERO */}

        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg sm:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="max-w-3xl">

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
                🆓 FREE
              </div>

              <h2 className="text-2xl font-black sm:text-3xl">
                Daily Current Affairs 📰
              </h2>

              <p className="mt-3 text-sm leading-6 text-blue-100 sm:text-base">
                Stay updated with exam-focused
                current affairs, important facts,
                exam points, static GK and practice
                MCQs.
              </p>

              <p className="mt-4 text-sm font-semibold text-blue-100">
                Hi {studentName} 👋
              </p>

            </div>

            <div className="hidden select-none text-7xl md:block">
              📰
            </div>

          </div>

        </section>

        {/* SEARCH + FILTER */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="relative">

            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
              🔎
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search current affairs..."
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />

          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">

            {CATEGORIES.map(
              (category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(
                      category,
                    )
                  }
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${
                    selectedCategory ===
                    category
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {category}
                </button>
              ),
            )}

          </div>

        </section>

        {/* SECTION HEADER */}

        <div className="mt-8 flex items-end justify-between gap-4">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              Latest Updates
            </p>

            <h2 className="mt-1 text-xl font-black sm:text-2xl">
              Important Current Affairs
            </h2>
          </div>

          <span className="shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
            {filteredAffairs.length}{" "}
            {filteredAffairs.length ===
            1
              ? "topic"
              : "topics"}
          </span>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Loading current affairs...
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Supabase se data fetch ho raha hai...
            </p>

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading &&
          error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">

              <div className="flex items-start gap-3">

                <div className="text-2xl">
                  ⚠️
                </div>

                <div className="min-w-0">

                  <h3 className="font-bold text-red-700 dark:text-red-300">
                    Unable to load current affairs
                  </h3>

                  <p className="mt-2 break-words text-sm leading-6 text-red-600 dark:text-red-400">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      void loadCurrentAffairs()
                    }
                    className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                  >
                    Try Again
                  </button>

                </div>

              </div>

            </div>
          )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          filteredAffairs.length ===
            0 && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="text-5xl">
                📰
              </div>

              <h3 className="mt-4 text-lg font-bold">
                No current affairs found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                {affairs.length === 0
                  ? "Database me abhi koi published current affair nahi mila."
                  : "Try another search term or choose a different category."}
              </p>

              {(search ||
                selectedCategory !==
                  "All") && (
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              )}

            </div>
          )}

        {/* =================================================
            AFFAIRS GRID
        ================================================= */}

        {!loading &&
          !error &&
          filteredAffairs.length >
            0 && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {filteredAffairs.map(
                (item) => {
                  const category =
                    item.category ||
                    "Other";

                  return (
                    <article
                      key={item.id}
                      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                    >

                      {/* CARD TOP */}

                      <div className="flex items-start justify-between gap-3">

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                          {category}
                        </span>

                        <span className="shrink-0 text-xs font-medium text-slate-400">
                          {formatDate(
                            item.affair_date,
                          )}
                        </span>

                      </div>

                      {/* META */}

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">

                        <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          #{item.serial_no}
                        </span>

                        {item.mcqs
                          .length >
                          0 && (
                          <span className="rounded-md bg-green-50 px-2 py-1 font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-300">
                            📝{" "}
                            {
                              item.mcqs
                                .length
                            }{" "}
                            MCQ
                            {item.mcqs
                              .length !==
                            1
                              ? "s"
                              : ""}
                          </span>
                        )}

                      </div>

                      {/* TITLE */}

                      <h3 className="mt-4 line-clamp-3 text-lg font-black leading-7 text-slate-900 dark:text-white">
                        {item.title}
                      </h3>

                      {/* WHY IN NEWS */}

                      <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {stripHtml(
                          item.why_in_news,
                        ) ||
                          "Current affair details are available inside."}
                      </p>

                      {/* EXAM POINT */}

                      {item.exam_point && (
                        <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 dark:bg-blue-950/30">

                          <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                            🎯 Exam Point
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-blue-800 dark:text-blue-300">
                            {stripHtml(
                              item.exam_point,
                            )}
                          </p>

                        </div>
                      )}

                      {/* READ MORE */}

                      <div className="mt-auto pt-5">

                        <button
                          type="button"
                          onClick={() =>
                            openAffair(
                              item.id,
                            )
                          }
                          className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 group-hover:shadow-md"
                        >
                          Read Full Current Affair

                          <span className="ml-2">
                            →
                          </span>
                        </button>

                      </div>

                    </article>
                  );
                },
              )}

            </div>
          )}

        {/* =================================================
            DAILY NEWSPAPER
        ================================================= */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <span className="text-2xl">
                  🗞️
                </span>

                <h2 className="text-lg font-black">
                  Daily Newspaper
                </h2>

                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                  Premium
                </span>

              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Daily curated newspaper with
                exam-focused important news,
                available for premium students.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/student/daily-newspaper",
                )
              }
              className="shrink-0 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              View Premium →
            </button>

          </div>

        </section>

        {/* =================================================
            EXAM TIP
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-950/30">

          <h3 className="font-bold text-blue-900 dark:text-blue-200">
            🎯 Exam Tip
          </h3>

          <p className="mt-2 text-sm leading-6 text-blue-800 dark:text-blue-300">
            Current affairs ko sirf read mat karo.
            Important names, dates, awards,
            appointments, places aur numbers ko
            revise karo. Regular revision se
            retention better hoti hai.
          </p>

        </section>

        {/* =================================================
            BACK TO DASHBOARD
        ================================================= */}

        <div className="mt-8 flex justify-center">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/dashboard",
              )
            }
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ← Back to Dashboard
          </button>

        </div>

      </main>

    </div>
  );
}

/* =====================================================
   MCQ NORMALIZER
===================================================== */

function normalizeMCQs(
  value: unknown,
): MCQ[] {
  let parsedValue = value;

  /* Supabase kabhi JSON string return kare
     to usko parse karne ki koshish */
  if (typeof parsedValue === "string") {
    try {
      parsedValue =
        JSON.parse(parsedValue);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue
    .map((item) => {
      if (
        !item ||
        typeof item !==
          "object" ||
        Array.isArray(item)
      ) {
        return null;
      }

      const row =
        item as Record<
          string,
          unknown
        >;

      const question =
        typeof row.question ===
        "string"
          ? row.question.trim()
          : "";

      const options =
        Array.isArray(
          row.options,
        )
          ? row.options
              .filter(
                (
                  option,
                ): option is string =>
                  typeof option ===
                  "string",
              )
              .map((option) =>
                option.trim(),
              )
          : [];

      const answer =
        typeof row.answer ===
        "string"
          ? row.answer.trim()
          : "";

      const explanation =
        typeof row.explanation ===
        "string"
          ? row.explanation.trim()
          : "";

      if (
        !question ||
        options.length !==
          4 ||
        options.some(
          (option) =>
            !option,
        ) ||
        !answer
      ) {
        return null;
      }

      return {
        question,
        options,
        answer,
        explanation,
      };
    })
    .filter(
      (
        item,
      ): item is MCQ =>
        item !== null,
    );
}

/* =====================================================
   STRIP HTML
===================================================== */

function stripHtml(
  value: string,
): string {
  if (!value) {
    return "";
  }

  return value
    .replace(
      /<br\s*\/?>/gi,
      " ",
    )
    .replace(
      /<\/p>/gi,
      " ",
    )
    .replace(
      /<[^>]+>/g,
      "",
    )
    .replace(
      /&nbsp;/gi,
      " ",
    )
    .replace(
      /&amp;/gi,
      "&",
    )
    .replace(
      /&quot;/gi,
      '"',
    )
    .replace(
      /&#39;/gi,
      "'",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default WeeklyCurrentAffairs;
