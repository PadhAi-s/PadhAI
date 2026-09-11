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

const CARD_THEMES = [
  {
    bg: "from-orange-50 via-white to-amber-50",
    darkBg: "dark:from-orange-950/30 dark:via-slate-900 dark:to-amber-950/20",
    accent: "bg-orange-500",
    soft: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
    border: "border-orange-200/70 dark:border-orange-900/50",
    button:
      "bg-orange-500 hover:bg-orange-600 shadow-orange-200 dark:shadow-none",
    icon: "💰",
  },
  {
    bg: "from-blue-50 via-white to-indigo-50",
    darkBg: "dark:from-blue-950/30 dark:via-slate-900 dark:to-indigo-950/20",
    accent: "bg-blue-500",
    soft: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    border: "border-blue-200/70 dark:border-blue-900/50",
    button:
      "bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none",
    icon: "⏳",
  },
  {
    bg: "from-emerald-50 via-white to-green-50",
    darkBg:
      "dark:from-emerald-950/30 dark:via-slate-900 dark:to-green-950/20",
    accent: "bg-emerald-500",
    soft: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    border: "border-emerald-200/70 dark:border-emerald-900/50",
    button:
      "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-none",
    icon: "🛡️",
  },
  {
    bg: "from-violet-50 via-white to-purple-50",
    darkBg:
      "dark:from-violet-950/30 dark:via-slate-900 dark:to-purple-950/20",
    accent: "bg-violet-500",
    soft: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
    border: "border-violet-200/70 dark:border-violet-900/50",
    button:
      "bg-violet-600 hover:bg-violet-700 shadow-violet-200 dark:shadow-none",
    icon: "💜",
  },
  {
    bg: "from-rose-50 via-white to-pink-50",
    darkBg: "dark:from-rose-950/30 dark:via-slate-900 dark:to-pink-950/20",
    accent: "bg-rose-500",
    soft: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
    border: "border-rose-200/70 dark:border-rose-900/50",
    button:
      "bg-rose-600 hover:bg-rose-700 shadow-rose-200 dark:shadow-none",
    icon: "✨",
  },
  {
    bg: "from-cyan-50 via-white to-sky-50",
    darkBg: "dark:from-cyan-950/30 dark:via-slate-900 dark:to-sky-950/20",
    accent: "bg-cyan-500",
    soft: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300",
    border: "border-cyan-200/70 dark:border-cyan-900/50",
    button:
      "bg-cyan-600 hover:bg-cyan-700 shadow-cyan-200 dark:shadow-none",
    icon: "🧠",
  },
];

function getTheme(index: number) {
  return CARD_THEMES[index % CARD_THEMES.length];
}

export default function Vocabulary() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [items, setItems] = useState<StudyItem[]>([]);
  const [activeCategory, setActiveCategory] =
    useState<Category>("vocabulary");

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] =
    useState<"All" | Difficulty>("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] =
    useState<string | null>(null);
  const [speakingId, setSpeakingId] =
    useState<string | null>(null);

  const currentLanguage =
    i18n.language?.toLowerCase() || "en";

  const isHindi =
    currentLanguage === "hi" ||
    currentLanguage.startsWith("hi-");

  const isHinglish =
    currentLanguage.includes("hinglish") ||
    currentLanguage === "en-hi";

  // =========================================================
  // LOAD CONTENT FROM SUPABASE
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadContent = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } =
        await supabase
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
  // FILTERED CONTENT
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
  // SPEECH
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

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <span className="text-xl transition group-hover:-translate-x-1">
              ←
            </span>

            <span className="hidden sm:inline">
              Back
            </span>
          </button>

          <div className="flex items-center gap-2.5">

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-black text-white shadow-lg shadow-indigo-200 dark:shadow-none">
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

        <section className="relative mb-7 overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none sm:p-8">

          {/* Decorative circles */}

          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />

          <div className="relative max-w-4xl">

            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3.5 py-1.5 text-xs font-black tracking-wide backdrop-blur">
              🎯 SMART ENGLISH PREPARATION
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              English Preparation
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/85 sm:text-base">
              Improve your English for competitive exams
              with vocabulary, idioms, synonyms, antonyms,
              phrasal verbs, one-word substitutions and
              common errors.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">

              <span className="rounded-full border border-white/10 bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur">
                📚 Vocabulary
              </span>

              <span className="rounded-full border border-white/10 bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur">
                💬 Idioms
              </span>

              <span className="rounded-full border border-white/10 bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur">
                🎯 Exam Focused
              </span>

            </div>

          </div>

        </section>

        {/* ===================================================
            CATEGORY TABS
        =================================================== */}

        <section className="mb-6">

          <div className="scrollbar-thin flex gap-3 overflow-x-auto pb-2">

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
                    "flex min-w-max items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-black transition-all",
                    active
                      ? "border-indigo-600 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                      : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:bg-slate-800",
                  ].join(" ")}
                >

                  <span className="text-lg">
                    {category.icon}
                  </span>

                  <span>
                    {category.label}
                  </span>

                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-[10px] font-black",
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
            SEARCH
        =================================================== */}

        <section className="mb-7 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

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
                      category.id ===
                      activeCategory
                  )?.label
                }...`}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-950"
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
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
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

          <div className="mt-3 flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">

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
                className="font-black text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
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
          <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="self-start overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >

                  <div className="flex gap-4">

                    <div className="h-16 w-16 shrink-0 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />

                    <div className="flex-1">

                      <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                      <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                    </div>

                  </div>

                  <div className="mt-6 h-16 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />

                  <div className="mt-5 h-11 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

                </div>
              )
            )}

          </div>
        )}

        {/* ===================================================
            ERROR
        =================================================== */}

        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center dark:border-red-900/50 dark:bg-red-950/30">

            <div className="text-5xl">
              ⚠️
            </div>

            <h3 className="mt-4 text-xl font-black text-red-700 dark:text-red-300">
              Something went wrong
            </h3>

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={retry}
              className="mt-6 rounded-xl bg-red-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-200 transition hover:bg-red-700 dark:shadow-none"
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
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">

              <div className="text-5xl">
                📭
              </div>

              <h3 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
                No content found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Is category mein abhi published content
                available nahi hai.
              </p>

            </div>
          )}

        {/* ===================================================
            PREMIUM CARDS
        =================================================== */}

        {!loading &&
          !error &&
          filteredItems.length > 0 && (
            <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {filteredItems.map((item, index) => {
                const expanded =
                  expandedId === item.id;

                const speaking =
                  speakingId === item.id;

                const theme = getTheme(index);

                return (
                  <article
                    key={item.id}
                    className={[
                      "group relative self-start overflow-hidden rounded-[1.6rem] border bg-gradient-to-br shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                      theme.bg,
                      theme.darkBg,
                      theme.border,
                    ].join(" ")}
                  >

                    {/* Decorative curved glow */}

                    <div
                      className={[
                        "pointer-events-none absolute -left-12 -top-16 h-44 w-44 rounded-full opacity-20 blur-2xl",
                        theme.accent,
                      ].join(" ")}
                    />

                    {/* =================================================
                        CARD HEADER
                    ================================================= */}

                    <div className="relative p-5">

                      <div className="flex items-start gap-4">

                        {/* ICON */}

                        <div
                          className={[
                            "relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.25rem] text-3xl shadow-lg ring-4 ring-white/70 transition-transform duration-300 group-hover:scale-105 dark:ring-slate-900/40",
                            theme.accent,
                          ].join(" ")}
                        >
                          <span className="relative z-10">
                            {theme.icon}
                          </span>

                          <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-white/20" />
                        </div>

                        {/* TITLE */}

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-2">

                            <div className="min-w-0">

                              <h2 className="break-words text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                {item.title}
                              </h2>

                              {item.pronunciation && (
                                <span className="mt-1 inline-flex rounded-lg bg-white/70 px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                                  /{item.pronunciation}/
                                </span>
                              )}

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(
                                  expanded
                                    ? null
                                    : item.id
                                )
                              }
                              className="shrink-0 rounded-full bg-white/70 p-1.5 text-sm text-slate-500 shadow-sm transition hover:bg-white hover:text-slate-900 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                              aria-label={
                                expanded
                                  ? "Collapse"
                                  : "Expand"
                              }
                            >
                              {expanded ? "⌃" : "⌄"}
                            </button>

                          </div>

                          {item.subtitle && (
                            <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-slate-600 dark:text-slate-400">
                              {item.subtitle}
                            </p>
                          )}

                        </div>

                      </div>

                      {/* BADGES */}

                      <div className="mt-5 flex items-center justify-between gap-3">

                        <span
                          className={[
                            "rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wide",
                            item.difficulty === "Easy"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : item.difficulty ===
                                "Hard"
                              ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
                          ].join(" ")}
                        >
                          {item.difficulty}
                        </span>

                        <span className="text-xs font-semibold text-slate-400">
                          {expanded
                            ? "Tap to close"
                            : "Tap to learn"}
                        </span>

                      </div>

                    </div>

                    {/* =================================================
                        MEANING
                    ================================================= */}

                    <div className="relative border-t border-white/70 bg-white/45 px-5 py-4 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/30">

                      <div className="flex gap-3">

                        <div
                          className={[
                            "mt-1 h-10 w-1 shrink-0 rounded-full",
                            theme.accent,
                          ].join(" ")}
                        />

                        <p className="text-sm font-extrabold leading-6 text-slate-800 dark:text-slate-200">
                          {getPrimaryMeaning(item)}
                        </p>

                      </div>

                    </div>

                    {/* =================================================
                        EXAMPLE PREVIEW
                    ================================================= */}

                    {item.example && (
                      <div className="px-5 pb-4 pt-1">

                        <div className="rounded-2xl border border-white/70 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40">

                          <p className="text-xs italic leading-5 text-slate-600 dark:text-slate-400">
                            “{item.example}”
                          </p>

                        </div>

                      </div>
                    )}

                    {/* =================================================
                        TAP TO LEARN BUTTON
                    ================================================= */}

                    <div className="px-5 pb-5">

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(
                            expanded
                              ? null
                              : item.id
                          )
                        }
                        className={[
                          "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]",
                          theme.button,
                        ].join(" ")}
                      >
                        <span>
                          {expanded
                            ? "Close details"
                            : "Tap to learn"}
                        </span>

                        <span className="text-base">
                          {expanded ? "↑" : "→"}
                        </span>
                      </button>

                    </div>

                    {/* =================================================
                        EXPANDED DETAILS
                    ================================================= */}

                    {expanded && (
                      <div className="border-t border-white/70 bg-white/70 px-5 pb-5 pt-5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/60">

                        {/* Pronunciation */}

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
                              "mb-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition",
                              speaking
                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700",
                            ].join(" ")}
                          >
                            <span className="text-lg">
                              {speaking
                                ? "🔊"
                                : "🔈"}
                            </span>

                            {speaking
                              ? "Playing pronunciation..."
                              : "Listen pronunciation"}
                          </button>
                        )}

                        {/* Meaning */}

                        {item.meaning && (
                          <div className="mb-4">

                            <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">
                              Meaning
                            </p>

                            <p className="text-sm font-medium leading-6 text-slate-700 dark:text-slate-300">
                              {item.meaning}
                            </p>

                          </div>
                        )}

                        {/* Hindi */}

                        {item.hindi && (
                          <div className="mb-4">

                            <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">
                              Hindi
                            </p>

                            <p className="text-sm font-medium leading-6 text-slate-700 dark:text-slate-300">
                              {item.hindi}
                            </p>

                          </div>
                        )}

                        {/* Hinglish */}

                        {item.hinglish && (
                          <div className="mb-4">

                            <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">
                              Hinglish
                            </p>

                            <p className="text-sm font-medium leading-6 text-slate-700 dark:text-slate-300">
                              {item.hinglish}
                            </p>

                          </div>
                        )}

                        {/* Example */}

                        {item.example && (
                          <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">

                            <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                              Example
                            </p>

                            <p className="text-sm font-medium leading-6 text-slate-700 dark:text-slate-300">
                              {item.example}
                            </p>

                          </div>
                        )}

                        {/* Extra */}

                        {item.extra && (
                          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30">

                            <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">
                              Exam Point
                            </p>

                            <p className="text-sm font-medium leading-6 text-slate-700 dark:text-slate-300">
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
