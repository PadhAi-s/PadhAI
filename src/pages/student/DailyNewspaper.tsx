import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

type Paper = {
  id: string;
  newspaper_date: string;
  language: "hindi" | "english";
  paper_number: number;
  title: string;
  url: string;
};

export function DailyNewspaper() {
  const navigate = useNavigate();

  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNewspapers();
  }, []);

  const loadNewspapers = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/student/login");
        return;
      }

      const {
  data,
  error: functionError,
} = await supabase.functions.invoke(
  "get-published-newspapers",
  {
    method: "GET",
  },
);

if (functionError) {
  console.error(
    "get-published-newspapers error:",
    functionError,
  );

  throw new Error(
    functionError.message ||
      "Newspaper load nahi ho paya.",
  );
}

if (!data?.success) {
  throw new Error(
    data?.error ||
      "Newspaper load nahi ho paya.",
  );
}

setPapers(data.papers || []);

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "Newspaper load nahi ho paya.",
        );
      }

      setPapers(data?.papers || []);
    } catch (err) {
      console.error(
        "Newspaper loading error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Newspaper load nahi ho paya.",
      );
    } finally {
      setLoading(false);
    }
  };

  const groupedDates = useMemo(() => {
    const groups: Record<
      string,
      {
        hindi: Paper[];
        english: Paper[];
      }
    > = {};

    for (const paper of papers) {
      if (!groups[paper.newspaper_date]) {
        groups[paper.newspaper_date] = {
          hindi: [],
          english: [],
        };
      }

      groups[paper.newspaper_date][
        paper.language
      ].push(paper);
    }

    return Object.entries(groups);
  }, [papers]);

  const formatDate = (date: string) => {
    return new Date(
      `${date}T00:00:00`,
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

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
              Daily Newspaper
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/student/dashboard")
            }
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-5xl px-4 py-8">

        <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm dark:border-amber-900/50 dark:bg-slate-900 sm:p-8">

          {/* TITLE */}
          <div className="flex items-start justify-between">

            <div>
              <div className="text-4xl">
                📰
              </div>

              <h2 className="mt-4 text-2xl font-bold">
                Daily Newspaper
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Hindi & English newspapers
                with previous published dates.
              </p>
            </div>

            <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
              ACTIVE
            </span>

          </div>

          {/* LOADING */}
          {loading && (
            <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-center dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Newspapers loading...
              </p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="mt-8 rounded-2xl bg-red-50 p-5 text-red-700 dark:bg-red-950/30 dark:text-red-300">
              <p className="font-semibold">
                Newspaper load nahi hua
              </p>

              <p className="mt-2 text-sm">
                {error}
              </p>

              <button
                onClick={loadNewspapers}
                className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Retry
              </button>
            </div>
          )}

          {/* NO PAPERS */}
          {!loading &&
            !error &&
            papers.length === 0 && (
              <div className="mt-8 rounded-2xl bg-blue-50 p-6 text-center dark:bg-blue-950/30">

                <div className="text-4xl">
                  📰
                </div>

                <h3 className="mt-3 font-semibold">
                  Newspaper abhi available nahi hai
                </h3>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Published newspaper yahan
                  automatically dikhega.
                </p>

              </div>
            )}

          {/* NEWSPAPERS */}
          {!loading &&
            !error &&
            groupedDates.length > 0 && (
              <div className="mt-8 space-y-8">

                {groupedDates.map(
                  ([date, languages]) => (
                    <div
                      key={date}
                      className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700"
                    >

                      {/* DATE */}
                      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
                        <h3 className="text-lg font-bold">
                          📅 {formatDate(date)}
                        </h3>
                      </div>

                      <div className="grid gap-6 p-5 md:grid-cols-2">

                        {/* HINDI */}
                        <div>
                          <h4 className="mb-3 text-lg font-bold">
                            🇮🇳 Hindi
                          </h4>

                          {languages.hindi.length ===
                            0 && (
                            <p className="text-sm text-slate-400">
                              Hindi paper available
                              nahi hai.
                            </p>
                          )}

                          <div className="space-y-3">
                            {languages.hindi.map(
                              (paper) => (
                                <a
                                  key={paper.id}
                                  href={paper.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                                >
                                  <div>
                                    <p className="font-semibold">
                                      📄 Paper{" "}
                                      {
                                        paper.paper_number
                                      }
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                      {paper.title}
                                    </p>
                                  </div>

                                  <span className="text-sm font-semibold text-blue-600">
                                    Open →
                                  </span>
                                </a>
                              ),
                            )}
                          </div>
                        </div>

                        {/* ENGLISH */}
                        <div>
                          <h4 className="mb-3 text-lg font-bold">
                            🇬🇧 English
                          </h4>

                          {languages.english.length ===
                            0 && (
                            <p className="text-sm text-slate-400">
                              English paper available
                              nahi hai.
                            </p>
                          )}

                          <div className="space-y-3">
                            {languages.english.map(
                              (paper) => (
                                <a
                                  key={paper.id}
                                  href={paper.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                                >
                                  <div>
                                    <p className="font-semibold">
                                      📄 Paper{" "}
                                      {
                                        paper.paper_number
                                      }
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                      {paper.title}
                                    </p>
                                  </div>

                                  <span className="text-sm font-semibold text-blue-600">
                                    Open →
                                  </span>
                                </a>
                              ),
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  ),
                )}

              </div>
            )}

          {/* INFO */}
          <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">

            <h3 className="font-semibold">
              What you'll get
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                📰 Daily important news
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                📅 Previous published dates
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                🇮🇳 Hindi papers
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                🇬🇧 English papers
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
