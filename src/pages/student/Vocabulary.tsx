import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { supabase } from "../../lib/supabase";

type Category =
  | "vocabulary"
  | "idioms"
  | "synonyms"
  | "antonyms"
  | "oneWord"
  | "phrasal"
  | "confusing"
  | "errors";

type Difficulty = "Easy" | "Medium" | "Hard";

type StudyItem = {
  id: string;
  category: Category;
  title: string;
  subtitle: string | null;
  meaning: string | null;
  hindi: string | null;
  hinglish: string | null;
  pronunciation: string | null;
  example: string | null;
  extra: string | null;
  difficulty: Difficulty;
  published: boolean;
  created_at: string;
};

const CATEGORIES: {
  id: Category;
  label: string;
  icon: string;
}[] = [
  { id: "vocabulary", label: "Vocabulary", icon: "📚" },
  { id: "idioms", label: "Idioms & Phrases", icon: "💬" },
  { id: "synonyms", label: "Synonyms", icon: "🔄" },
  { id: "antonyms", label: "Antonyms", icon: "↔️" },
  { id: "oneWord", label: "One Word", icon: "🎯" },
  { id: "phrasal", label: "Phrasal Verbs", icon: "🧩" },
  { id: "confusing", label: "Confusing Words", icon: "⚡" },
  { id: "errors", label: "Common Errors", icon: "✍️" },
];

export default function Vocabulary() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [items, setItems] = useState<StudyItem[]>([]);
  const [activeCategory, setActiveCategory] =
    useState<Category>("vocabulary");

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<
    "All" | Difficulty
  >("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const currentLanguage = i18n.language?.toLowerCase() || "en";

  const isHindi =
    currentLanguage === "hi" ||
    currentLanguage.startsWith("hi-");

  const isHinglish =
    currentLanguage.includes("hinglish") ||
    currentLanguage === "en-hi";

  // =========================================================
  // FETCH FROM SUPABASE
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadContent = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("english_content")
        .select(`
          id,
          category,
          title,
          subtitle,
          meaning,
          hindi,
          hinglish,
          pronunciation,
          example,
          extra,
          difficulty,
          published,
          created_at
        `)
        .eq("published", true)
        .order("created_at", {
          ascending: false,
        });

      if (!mounted) return;

      if (fetchError) {
        console.error(
          "English content error:",
          fetchError
        );

        setError(
          "English content load nahi ho paaya. Please try again."
        );
        setItems([]);
      } else {
        setItems((data || []) as StudyItem[]);
      }

      setLoading(false);
    };

    loadContent();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // CATEGORY COUNT
  // =========================================================

  const getCategoryCount = (category: Category) =>
    items.filter(
      (item) => item.category === category
    ).length;

  // =========================================================
  // FILTER
  // =========================================================

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      if (item.category !== activeCategory) {
        return false;
      }

      if (
        difficulty !== "All" &&
        item.difficulty !== difficulty
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        item.title,
        item.subtitle,
        item.meaning,
        item.hindi,
        item.hinglish,
        item.example,
        item.extra,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [
    items,
    activeCategory,
    search,
    difficulty,
  ]);

  // =========================================================
  // MEANING
  // =========================================================

  const getPrimaryMeaning = (item: StudyItem) => {
    if (isHindi && item.hindi) {
      return item.hindi;
    }

    if (isHinglish && item.hinglish) {
      return item.hinglish;
    }

    return (
      item.meaning ||
      item.hinglish ||
      item.hindi ||
      "Meaning not available"
    );
  };

  // =========================================================
  // PRONUNCIATION
  // =========================================================

  const pronounce = (
    item: StudyItem,
    event?: MouseEvent<HTMLButtonElement>
  ) => {
    event?.stopPropagation();

    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    if (speakingId === item.id) {
      setSpeakingId(null);
      return;
    }

    const utterance =
      new SpeechSynthesisUtterance(item.title);

    utterance.lang = "en-US";
    utterance.rate = 0.78;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setSpeakingId(item.id);
    };

    utterance.onend = () => {
      setSpeakingId(null);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // =========================================================
  // CATEGORY CHANGE
  // =========================================================

  const changeCategory = (category: Category) => {
    setActiveCategory(category);
    setSearch("");
    setDifficulty("All");
    setExpandedId(null);
  };

  // =========================================================
  // RETRY
  // =========================================================

  const retry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <span className="text-xl">←</span>
            <span className="hidden sm:inline">
              Back
            </span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-black text-white">
              R
            </div>

            <span className="text-sm font-black tracking-wide text-slate-900 dark:text-white sm:text-base">
              RANKER BHAIYA
            </span>
          </div>

          <div className="w-14 sm:w-20" />
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-lg sm:p-8">

          <div className="max-w-3xl">

            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur">
              🎯 SMART ENGLISH PREPARATION
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              English Preparation
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/85 sm:text-base">
              Improve your English for competitive exams with
              vocabulary, idioms, synonyms, antonyms, phrasal
              verbs, one-word substitutions and common errors.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">

              <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
                📚 Vocabulary
              </span>

              <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
                💬 Idioms
              </span>

              <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
                🎯 Exam Focused
              </span>

            </div>
          </div>
        </section>

        {/* ===================================================
            CATEGORY NAVIGATION
        =================================================== */}

        <section className="mb-6">
          <div className="flex gap-3 overflow-x-auto pb-2">

            {CATEGORIES.map((category) => {
              const active =
                activeCategory === category.id;

              const count =
                getCategoryCount(category.id);

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    changeCategory(category.id)
                  }
                  className={[
                    "flex min-w-max items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition",
                    active
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-md"
                      : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:bg-slate-800",
                  ].join(" ")}
                >
                  <span className="text-lg">
                    {category.icon}
                  </span>

                  <span>{category.label}</span>

                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-[10px]",
                      active
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                    ].join(" ")}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

          </div>
        </section>

        {/* ===================================================
            SEARCH / FILTER
        =================================================== */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="flex flex-col gap-3 sm:flex-row">

            <div className="relative flex-1">

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder={`Search ${
                  CATEGORIES.find(
                    (category) =>
                      category.id === activeCategory
                  )?.label
                }...`}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />

            </div>

            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(
                  e.target.value as
                    | "All"
                    | Difficulty
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="All">
                All Levels
              </option>
              <option value="Easy">
                Easy
              </option>
              <option value="Medium">
                Medium
              </option>
              <option value="Hard">
                Hard
              </option>
            </select>

          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">

            <span>
              {filteredItems.length}{" "}
              {filteredItems.length === 1
                ? "item"
                : "items"}{" "}
              found
            </span>

            {(search || difficulty !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setDifficulty("All");
                }}
                className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Clear filters
              </button>
            )}

          </div>
        </section>

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (
          <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                  <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                  <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                  <div className="mt-6 h-10 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>
              )
            )}

          </div>
        )}

        {/* ===================================================
            ERROR
        =================================================== */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/30">

            <div className="text-4xl">
              ⚠️
            </div>

            <h3 className="mt-3 text-lg font-extrabold text-red-700 dark:text-red-300">
              Something went wrong
            </h3>

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={retry}
              className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>

          </div>
        )}

        {/* ===================================================
            EMPTY
        =================================================== */}

        {!loading &&
          !error &&
          filteredItems.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">

              <div className="text-5xl">
                📭
              </div>

              <h3 className="mt-4 text-lg font-extrabold text-slate-900 dark:text-white">
                No content found
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Is category mein abhi published content
                available nahi hai.
              </p>

            </div>
          )}

        {/* ===================================================
            CONTENT GRID
        =================================================== */}

        {!loading &&
          !error &&
          filteredItems.length > 0 && (
            <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {filteredItems.map((item) => {
                const expanded =
                  expandedId === item.id;

                const speaking =
                  speakingId === item.id;

                return (
                  <article
                    key={item.id}
                    className="self-start overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >

                    {/* CARD TOP */}

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(
                          expanded
                            ? null
                            : item.id
                        )
                      }
                      className="w-full p-5 text-left"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h2 className="break-words text-xl font-black text-slate-900 dark:text-white">
                              {item.title}
                            </h2>

                            {item.pronunciation && (
                              <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                /{item.pronunciation}/
                              </span>
                            )}

                          </div>

                          {item.subtitle && (
                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                              {item.subtitle}
                            </p>
                          )}

                        </div>

                        <span className="shrink-0 text-lg text-slate-400">
                          {expanded ? "⌃" : "⌄"}
                        </span>

                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2">

                        <span
                          className={[
                            "rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                            item.difficulty ===
                            "Easy"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : item.difficulty ===
                                "Hard"
                              ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
                          ].join(" ")}
                        >
                          {item.difficulty}
                        </span>

                        <span className="text-xs text-slate-400">
                          {expanded
                            ? "Tap to close"
                            : "Tap to learn"}
                        </span>

                      </div>

                    </button>

                    {/* QUICK MEANING */}

                    <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">

                      <p className="text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
                        {getPrimaryMeaning(item)}
                      </p>

                      {item.example && (
                        <p className="mt-3 border-l-2 border-indigo-400 pl-3 text-xs italic leading-5 text-slate-500 dark:text-slate-400">
                          “{item.example}”
                        </p>
                      )}

                    </div>

                    {/* EXPANDED CONTENT */}

                    {expanded && (
                      <div className="border-t border-slate-100 bg-slate-50 px-5 pb-5 pt-4 dark:border-slate-800 dark:bg-slate-950/60">

                        {/* PRONUNCIATION */}

                        {item.pronunciation && (
                          <button
                            type="button"
                            onClick={(event) =>
                              pronounce(
                                item,
                                event
                              )
                            }
                            className={[
                              "mb-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition",
                              speaking
                                ? "bg-indigo-600 text-white"
                                : "bg-white text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50 dark:bg-slate-900 dark:text-indigo-400 dark:ring-indigo-900",
                            ].join(" ")}
                          >
                            <span>
                              {speaking
                                ? "🔊"
                                : "🔈"}
                            </span>

                            {speaking
                              ? "Playing pronunciation..."
                              : "Listen pronunciation"}
                          </button>
                        )}

                        {/* MEANING */}

                        {item.meaning && (
                          <div className="mb-4">

                            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              Meaning
                            </p>

                            <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                              {item.meaning}
                            </p>

                          </div>
                        )}

                        {/* HINDI */}

                        {item.hindi && (
                          <div className="mb-4">

                            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              Hindi
                            </p>

                            <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                              {item.hindi}
                            </p>

                          </div>
                        )}

                        {/* HINGLISH */}

                        {item.hinglish && (
                          <div className="mb-4">

                            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              Hinglish
                            </p>

                            <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                              {item.hinglish}
                            </p>

                          </div>
                        )}

                        {/* EXAMPLE */}

                        {item.example && (
                          <div className="mb-4 rounded-xl bg-white p-4 dark:bg-slate-900">

                            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                              Example
                            </p>

                            <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                              {item.example}
                            </p>

                          </div>
                        )}

                        {/* EXTRA */}

                        {item.extra && (
                          <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/30">

                            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              Exam Point
                            </p>

                            <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                              {item.extra}
                            </p>

                          </div>
                        )}

                      </div>
                    )}

                  </article>
                );
              })}

            </div>
          )}

      </main>
    </div>
  );
}
