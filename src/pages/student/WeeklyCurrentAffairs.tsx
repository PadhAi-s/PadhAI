import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";

interface CurrentAffair {
  id: string;
  affair_date: string;
  serial_no: number;
  title: string;
  why_in_news: string;
  key_facts: string;
  exam_point: string;
  static_gk: string;
  category: string | null;
  mcqs: unknown[];
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

const categoryInfo: Record<
  string,
  {
    title: string;
    description: string;
  }
> = {
  National: {
    title: "National Updates",
    description:
      "Important national events and government-related developments from this week.",
  },

  International: {
    title: "International Affairs",
    description:
      "Major international events, global developments and important world news.",
  },

  "Science & Tech": {
    title: "Science & Technology",
    description:
      "Important developments in science, technology, space and innovation.",
  },

  Economy: {
    title: "Economy & Business",
    description:
      "Key economic developments, business news and important financial updates.",
  },

  Sports: {
    title: "Sports",
    description:
      "Important sports events, tournaments, achievements and major victories.",
  },

  Awards: {
    title: "Awards & Appointments",
    description:
      "Important appointments, awards, honours and personalities in the news.",
  },
};

export default function CurrentAffairs() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [records, setRecords] = useState<CurrentAffair[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCurrentAffairs();
  }, []);

  async function loadCurrentAffairs() {
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("current_affairs")
        .select(
          `
            id,
            affair_date,
            serial_no,
            title,
            why_in_news,
            key_facts,
            exam_point,
            static_gk,
            category,
            mcqs
          `,
        )
        .order("affair_date", {
          ascending: false,
        })
        .order("serial_no", {
          ascending: true,
        });

      if (fetchError) {
        throw fetchError;
      }

      setRecords(
        (data ?? []).map((row) => ({
          id: row.id,
          affair_date: row.affair_date,
          serial_no: Number(row.serial_no ?? 1),
          title: row.title ?? "",
          why_in_news: row.why_in_news ?? "",
          key_facts: row.key_facts ?? "",
          exam_point: row.exam_point ?? "",
          static_gk: row.static_gk ?? "",
          category: row.category ?? null,
          mcqs: Array.isArray(row.mcqs)
            ? row.mcqs
            : [],
        })),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("currentAffairs.loadError"),
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const categoryMatch =
        selectedCategory === "All" ||
        record.category === selectedCategory;

      const searchText = [
        record.title,
        record.why_in_news,
        record.key_facts,
        record.exam_point,
        record.static_gk,
      ]
        .join(" ")
        .toLowerCase();

      const searchMatch =
        !search.trim() ||
        searchText.includes(
          search.trim().toLowerCase(),
        );

      return categoryMatch && searchMatch;
    });
  }, [
    records,
    selectedCategory,
    search,
  ]);

  function getCategoryCount(category: string) {
    if (category === "All") {
      return records.length;
    }

    return records.filter(
      (record) => record.category === category,
    ).length;
  }

  function getCategoryLabel(category: string) {
    return t(
      `currentAffairs.categories.${category}`,
      {
        defaultValue: category,
      },
    );
  }

  function getCategoryTitle(category: string) {
    if (category === "National") {
      return t("currentAffairs.categoryTitles.national");
    }

    if (category === "International") {
      return t(
        "currentAffairs.categoryTitles.international",
      );
    }

    if (category === "Science & Tech") {
      return t(
        "currentAffairs.categoryTitles.scienceTech",
      );
    }

    if (category === "Economy") {
      return t("currentAffairs.categoryTitles.economy");
    }

    if (category === "Sports") {
      return t("currentAffairs.categoryTitles.sports");
    }

    if (category === "Awards") {
      return t("currentAffairs.categoryTitles.awards");
    }

    return category;
  }

  function getCategoryDescription(category: string) {
    if (category === "National") {
      return t(
        "currentAffairs.categoryDescriptions.national",
      );
    }

    if (category === "International") {
      return t(
        "currentAffairs.categoryDescriptions.international",
      );
    }

    if (category === "Science & Tech") {
      return t(
        "currentAffairs.categoryDescriptions.scienceTech",
      );
    }

    if (category === "Economy") {
      return t(
        "currentAffairs.categoryDescriptions.economy",
      );
    }

    if (category === "Sports") {
      return t(
        "currentAffairs.categoryDescriptions.sports",
      );
    }

    if (category === "Awards") {
      return t(
        "currentAffairs.categoryDescriptions.awards",
      );
    }

    return categoryInfo[category]?.description || "";
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-white">
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* PAGE HEADER */}

        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            {t("currentAffairs.label")}
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {t("currentAffairs.title")}
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {t("currentAffairs.subtitle")}
          </p>
        </div>

        {/* SEARCH + FILTERS */}

        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder={t(
              "currentAffairs.searchPlaceholder",
            )}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setSelectedCategory(category)
                }
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {getCategoryLabel(category)}

                <span className="ml-1 opacity-70">
                  ({getCategoryCount(category)})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="py-16 text-center text-slate-500">
            {t("currentAffairs.loading")}
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-950/30 dark:text-red-300">
            ❌ {error}
          </div>
        )}

        {/* ALL VIEW */}

        {!loading &&
          !error &&
          selectedCategory === "All" && (
            <section className="mt-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                    {t("currentAffairs.allCategories")}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {t("currentAffairs.mixedTitle")}
                  </h2>
                </div>

                <p className="text-sm text-slate-500">
                  {filteredRecords.length}{" "}
                  {t("currentAffairs.topics")}
                </p>
              </div>

              {filteredRecords.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {filteredRecords.map(
                    (record) => (
                      <AffairCard
                        key={record.id}
                        record={record}
                        onClick={() =>
                          navigate(
                            `/current-affairs/${record.id}`,
                          )
                        }
                      />
                    ),
                  )}
                </div>
              )}
            </section>
          )}

        {/* CATEGORY VIEW */}

        {!loading &&
          !error &&
          selectedCategory !== "All" && (
            <section className="mt-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                    {getCategoryLabel(selectedCategory)}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {getCategoryTitle(selectedCategory)}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {getCategoryDescription(
                      selectedCategory,
                    )}
                  </p>
                </div>

                <p className="text-sm text-slate-500">
                  {filteredRecords.length}{" "}
                  {t("currentAffairs.topics")}
                </p>
              </div>

              {filteredRecords.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {filteredRecords.map(
                    (record) => (
                      <AffairCard
                        key={record.id}
                        record={record}
                        onClick={() =>
                          navigate(
                            `/current-affairs/${record.id}`,
                          )
                        }
                      />
                    ),
                  )}
                </div>
              )}
            </section>
          )}
      </main>
    </div>
  );
}

function AffairCard({
  record,
  onClick,
}: {
  record: CurrentAffair;
  onClick: () => void;
}) {
  const { t } = useTranslation();

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          {record.category ||
            t("currentAffairs.label")}
        </span>

        <span className="text-xs text-slate-400">
          {record.affair_date}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-bold leading-snug">
        {record.title}
      </h3>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {record.why_in_news}
      </p>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {record.mcqs.length}{" "}
          {t("currentAffairs.mcqs")}
        </span>

        <button
          type="button"
          onClick={onClick}
          className="font-semibold text-blue-700 hover:text-blue-900 dark:text-blue-400"
        >
          {t("currentAffairs.readMore")} →
        </button>
      </div>
    </article>
  );
}

function EmptyState() {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="text-4xl">
        📰
      </div>

      <h3 className="mt-4 text-lg font-bold">
        {t("currentAffairs.emptyTitle")}
      </h3>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {t("currentAffairs.emptyDescription")}
      </p>
    </div>
  );
}
