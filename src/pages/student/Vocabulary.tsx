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

type Difficulty = "All" | "Easy" | "Medium" | "Hard";

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
  difficulty: string | null;
  published: boolean;
  created_at: string;
};

const CATEGORIES: {
  key: Category;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    key: "vocabulary",
    label: "Vocabulary",
    icon: "📚",
    description: "Important exam vocabulary",
  },
  {
    key: "idioms",
    label: "Idioms & Phrases",
    icon: "💬",
    description: "Common idioms and phrases",
  },
  {
    key: "synonyms",
    label: "Synonyms",
    icon: "🔄",
    description: "Words with similar meanings",
  },
  {
    key: "antonyms",
    label: "Antonyms",
    icon: "↔️",
    description: "Opposite meaning words",
  },
  {
    key: "oneWord",
    label: "One Word Substitution",
    icon: "🎯",
    description: "One word for a phrase",
  },
  {
    key: "phrasal",
    label: "Phrasal Verbs",
    icon: "⚡",
    description: "Useful phrasal verbs",
  },
  {
    key: "confusing",
    label: "Confusing Words",
    icon: "🧠",
    description: "Frequently confused words",
  },
  {
    key: "errors",
    label: "Spelling / Common Errors",
    icon: "✍️",
    description: "Common spelling and usage errors",
  },
];

const CARD_THEMES = [
  "from-indigo-500/10 via-violet-500/5 to-transparent",
  "from-blue-500/10 via-cyan-500/5 to-transparent",
  "from-emerald-500/10 via-teal-500/5 to-transparent",
  "from-orange-500/10 via-amber-500/5 to-transparent",
  "from-pink-500/10 via-rose-500/5 to-transparent",
  "from-purple-500/10 via-fuchsia-500/5 to-transparent",
];

function normalizeDifficulty(value: string | null): string {
  if (!value) return "Easy";

  const normalized = value.trim().toLowerCase();

  if (normalized === "medium") return "Medium";
  if (normalized === "hard") return "Hard";

  return "Easy";
}

function getCategoryLabel(category: Category) {
  return (
    CATEGORIES.find((item) => item.key === category)?.label ?? "Vocabulary"
  );
}

function speakText(text: string) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    !text.trim()
  ) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN";
  utterance.rate = 0.85;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

export default function Vocabulary() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [items, setItems] = useState<StudyItem[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("vocabulary");
  const [difficulty, setDifficulty] = useState<Difficulty>("All");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentLanguage = i18n.language?.toLowerCase() ?? "en";

  useEffect(() => {
    let mounted = true;

    async function loadContent() {
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
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (fetchError) {
        console.error("Vocabulary fetch error:", fetchError);
        setError(
          "Vocabulary content load nahi ho pa raha hai. Please try again."
        );
        setItems([]);
        setLoading(false);
        return;
      }

      const validItems: StudyItem[] = (data ?? [])
        .filter((item) =>
          CATEGORIES.some(
            (category) => category.key === item.category
          )
        )
        .map((item) => ({
          id: String(item.id),
          category: item.category as Category,
          title: item.title ?? "",
          subtitle: item.subtitle ?? null,
          meaning: item.meaning ?? null,
          hindi: item.hindi ?? null,
          hinglish: item.hinglish ?? null,
          pronunciation: item.pronunciation ?? null,
          example: item.example ?? null,
          extra: item.extra ?? null,
          difficulty: item.difficulty ?? "Easy",
          published: Boolean(item.published),
          created_at: item.created_at,
        }));

      setItems(validItems);
      setLoading(false);
    }

    loadContent();

    return () => {
      mounted = false;
    };
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      vocabulary: 0,
      idioms: 0,
      synonyms: 0,
      antonyms: 0,
      oneWord: 0,
      phrasal: 0,
      confusing: 0,
      errors: 0,
    };

    for (const item of items) {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
    }

    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const categoryMatch = item.category === selectedCategory;

      const difficultyMatch =
        difficulty === "All" ||
        normalizeDifficulty(item.difficulty) === difficulty;

      if (!categoryMatch || !difficultyMatch) {
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
        item.pronunciation,
        item.example,
        item.extra,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [items, selectedCategory, difficulty, search]);

  const selectedCategoryInfo = CATEGORIES.find(
    (category) => category.key === selectedCategory
  );

  const getMeaning = (item: StudyItem) => {
    if (
      currentLanguage.includes("hi") ||
      currentLanguage.includes("hindi")
    ) {
      return item.hindi || item.hinglish || item.meaning || "";
    }

    if (
      currentLanguage.includes("hinglish") ||
      currentLanguage.includes("roman")
    ) {
      return item.hinglish || item.meaning || item.hindi || "";
    }

    return item.meaning || item.hinglish || item.hindi || "";
  };

  const handleCardClick = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const handleSpeak = (
    event: MouseEvent<HTMLButtonElement>,
    item: StudyItem
  ) => {
    event.stopPropagation();

    const text = [
      item.title,
      item.pronunciation ? `Pronunciation: ${item.pronunciation}` : "",
      item.meaning ?? "",
    ]
      .filter(Boolean)
      .join(". ");

    speakText(text);
  };

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    setExpandedId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-900 dark:bg-slate-950 dark:text-white">
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

        {/* ===================================================
            BACK BUTTON
        =================================================== */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <span>←</span>
          <span>Back</span>
        </button>

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="relative mb-7 overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none sm:p-8">

          {/* Decorative circles */}

          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />

          {/* =================================================
              VOCAB-BHAIYA EXTERNAL LINK
          ================================================= */}

          <a
            href="https://vocabbhaiya.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Learn More by Vocab-Bhaiya"
            className="group absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/30 bg-white/95 px-3 py-2 text-xs font-black text-violet-700 shadow-lg shadow-violet-950/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl sm:right-6 sm:top-6 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <span className="text-sm transition-transform duration-300 group-hover:scale-110 sm:text-base">
              ✨
            </span>

            <span className="whitespace-nowrap">
              Learn More by Vocab-Bhaiya
            </span>

            <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>

          {/* =================================================
              HERO CONTENT
          ================================================= */}

          <div className="relative max-w-4xl pr-2 sm:pr-44">

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
            CATEGORY SECTION
        =================================================== */}

        <section className="mb-6">

          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tight sm:text-2xl">
                English Topics
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Choose a topic and start your preparation.
              </p>
            </div>

            <div className="hidden rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 sm:block">
              {items.length} Total
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">

            {CATEGORIES.map((category) => {
              const active = selectedCategory === category.key;

              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => handleCategoryChange(category.key)}
                  className={`group rounded-2xl border p-3 text-left transition-all duration-200 ${
                    active
                      ? "border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                      : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xl">
                      {category.icon}
                    </span>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {categoryCounts[category.key]}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-black leading-4">
                    {category.label}
                  </div>

                  <div
                    className={`mt-1 hidden text-[10px] leading-4 sm:block ${
                      active
                        ? "text-white/75"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {category.description}
                  </div>
                </button>
              );
            })}

          </div>
        </section>

        {/* ===================================================
            SEARCH + FILTER
        =================================================== */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-xl">

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                🔎
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search word, meaning, Hindi, Hinglish..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              />

            </div>

            <div className="flex flex-wrap items-center gap-2">

              <span className="mr-1 text-xs font-black uppercase tracking-wide text-slate-400">
                Difficulty
              </span>

              {(["All", "Easy", "Medium", "Hard"] as Difficulty[]).map(
                (level) => {
                  const active = difficulty === level;

                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`rounded-full px-3 py-2 text-xs font-black transition ${
                        active
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      }`}
                    >
                      {level}
                    </button>
                  );
                }
              )}

            </div>

          </div>
        </section>

        {/* ===================================================
            CURRENT CATEGORY HEADER
        =================================================== */}

        <section className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-xl dark:bg-indigo-500/10">
              {selectedCategoryInfo?.icon}
            </div>

            <div>
              <h2 className="text-xl font-black">
                {selectedCategoryInfo?.label}
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedCategoryInfo?.description}
              </p>
            </div>

          </div>

          <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "items"} found
          </div>

        </section>

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-800" />

                <div className="mt-5 h-7 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />

                <div className="mt-3 h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />

                <div className="mt-2 h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />

                <div className="mt-6 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
              </div>
            ))}

          </div>
        )}

        {/* ===================================================
            ERROR
        =================================================== */}

        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20">

            <div className="text-4xl">⚠️</div>

            <h3 className="mt-3 text-lg font-black text-red-700 dark:text-red-300">
              Something went wrong
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm text-red-600/80 dark:text-red-300/70">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:bg-red-700"
            >
              Try Again
            </button>

          </div>
        )}

        {/* ===================================================
            EMPTY
        =================================================== */}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">

            <div className="text-5xl">📚</div>

            <h3 className="mt-4 text-xl font-black">
              No content found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              {search
                ? "Try a different search word or clear the search box."
                : "Is category ke liye abhi published content available nahi hai."}
            </p>

            {(search || difficulty !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setDifficulty("All");
                }}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:bg-indigo-700"
              >
                Clear Filters
              </button>
            )}

          </div>
        )}

        {/* ===================================================
            CONTENT CARDS
        =================================================== */}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            {filteredItems.map((item, index) => {
              const expanded = expandedId === item.id;
              const theme =
                CARD_THEMES[index % CARD_THEMES.length];

              const level = normalizeDifficulty(item.difficulty);

              return (
                <article
                  key={item.id}
                  onClick={() => handleCardClick(item.id)}
                  className={`group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br ${theme} bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 ${
                    expanded
                      ? "ring-2 ring-indigo-500/30"
                      : ""
                  }`}
                >

                  {/* Card Top */}

                  <div className="p-5">

                    <div className="flex items-start justify-between gap-3">

                      <span className="rounded-full bg-indigo-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                        {getCategoryLabel(item.category)}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                          level === "Hard"
                            ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                            : level === "Medium"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                        }`}
                      >
                        {level}
                      </span>

                    </div>

                    {/* Title */}

                    <div className="mt-5 flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <h3 className="break-words text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                          {item.title}
                        </h3>

                        {item.subtitle && (
                          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {item.subtitle}
                          </p>
                        )}

                      </div>

                      <button
                        type="button"
                        aria-label={`Listen to ${item.title}`}
                        onClick={(event) =>
                          handleSpeak(event, item)
                        }
                        className="shrink-0 rounded-xl border border-slate-200 bg-white p-2.5 text-lg shadow-sm transition hover:scale-105 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-indigo-500/10"
                      >
                        🔊
                      </button>

                    </div>

                    {/* Pronunciation */}

                    {item.pronunciation && (
                      <div className="mt-3 inline-flex rounded-lg bg-slate-900/5 px-2.5 py-1.5 text-xs font-bold italic text-slate-600 dark:bg-white/5 dark:text-slate-400">
                        / {item.pronunciation} /
                      </div>
                    )}

                    {/* Meaning */}

                    <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white/75 p-4 backdrop-blur dark:border-slate-700/70 dark:bg-slate-950/50">

                      <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Meaning
                      </div>

                      <p className="mt-2 text-sm font-bold leading-6 text-slate-700 dark:text-slate-200">
                        {getMeaning(item) || "Meaning not available."}
                      </p>

                    </div>

                    {/* Example */}

                    {item.example && (
                      <div className="mt-4">

                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Example
                        </div>

                        <p className="mt-1.5 text-sm italic leading-6 text-slate-600 dark:text-slate-400">
                          “{item.example}”
                        </p>

                      </div>
                    )}

                    {/* Expanded Content */}

                    {expanded && (
                      <div className="mt-5 space-y-4 border-t border-slate-200 pt-5 dark:border-slate-800">

                        {item.meaning && (
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-indigo-500">
                              English Meaning
                            </div>

                            <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                              {item.meaning}
                            </p>
                          </div>
                        )}

                        {item.hindi && (
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-orange-500">
                              Hindi
                            </div>

                            <p className="mt-1.5 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
                              {item.hindi}
                            </p>
                          </div>
                        )}

                        {item.hinglish && (
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
                              Hinglish
                            </div>

                            <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                              {item.hinglish}
                            </p>
                          </div>
                        )}

                        {item.extra && (
                          <div className="rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-500/10">

                            <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              Exam Tip / Extra
                            </div>

                            <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
                              {item.extra}
                            </p>

                          </div>
                        )}

                      </div>
                    )}

                  </div>

                  {/* Card Footer */}

                  <div className="flex items-center justify-between border-t border-slate-200/70 bg-white/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/30">

                    <span className="text-[11px] font-bold text-slate-400">
                      {expanded
                        ? "Tap to collapse"
                        : "Tap to learn more"}
                    </span>

                    <span className="text-sm font-black text-indigo-600 transition-transform duration-300 group-hover:translate-x-1 dark:text-indigo-400">
                      {expanded ? "↑" : "→"}
                    </span>

                  </div>

                </article>
              );
            })}

          </div>
        )}

        {/* ===================================================
            FOOTER INFO
        =================================================== */}

        {!loading && !error && items.length > 0 && (
          <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-center dark:border-indigo-900/40 dark:bg-indigo-500/5">

            <p className="text-xs font-semibold leading-5 text-indigo-700 dark:text-indigo-300">
              💡 Regular practice is the key to improving English
              for competitive exams. Learn a few words every day.
            </p>

          </div>
        )}

      </main>
    </div>
  );
}
