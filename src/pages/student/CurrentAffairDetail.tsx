import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

  published: boolean;
  category: string;

  title_hi: string;
  why_in_news_hi: string;
  key_facts_hi: string;
  exam_point_hi: string;
  static_gk_hi: string;
}

type Language = "english" | "hindi";

/* =====================================================
   PAGE
===================================================== */

export function CurrentAffairDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [affair, setAffair] =
    useState<CurrentAffair | null>(null);

  const [language, setLanguage] =
    useState<Language>("english");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedAnswers, setSelectedAnswers] =
    useState<Record<number, string>>({});

  const [submittedQuestions, setSubmittedQuestions] =
    useState<Record<number, boolean>>({});

  /* =====================================================
     LOAD
  ===================================================== */

  useEffect(() => {
    document.title =
      "Current Affair | RANKER BHAIYA";

    void loadCurrentAffair();
  }, [id]);

  async function loadCurrentAffair() {
    setLoading(true);
    setError("");
    setAffair(null);

    if (!id) {
      setError(
        "Current affair ID missing hai.",
      );
      setLoading(false);
      return;
    }

    try {
      /*
       * IMPORTANT:
       * Supabase generated type kabhi-kabhi
       * GenericStringError return karta hai.
       *
       * Isliye database query ko any boundary
       * par rakha gaya hai.
       *
       * UI ke andar data properly typed rahega.
       */
      const db = supabase as any;

      const {
        data: rawData,
        error: fetchError,
      } = await db
        .from("current_affairs")
        .select("*")
        .eq("id", id)
        .eq("published", true)
        .maybeSingle();

      console.log(
        "Current Affair Detail Response:",
        {
          id,
          rawData,
          fetchError,
        },
      );

      if (fetchError) {
        throw fetchError;
      }

      if (!rawData) {
        throw new Error(
          "Current affair nahi mila.",
        );
      }

      const formatted =
        normalizeCurrentAffair(rawData);

      if (!formatted) {
        throw new Error(
          "Current affair data invalid hai.",
        );
      }

      setAffair(formatted);

      document.title =
        `${formatted.title} | RANKER BHAIYA`;
    } catch (err) {
      console.error(
        "Current Affair Detail Load Error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Current affair load nahi ho paya.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     MCQ ANSWER
  ===================================================== */

  function selectAnswer(
    questionIndex: number,
    answer: string,
  ) {
    if (
      submittedQuestions[questionIndex]
    ) {
      return;
    }

    setSelectedAnswers((previous) => ({
      ...previous,
      [questionIndex]: answer,
    }));
  }

  function submitAnswer(
    questionIndex: number,
  ) {
    if (
      !affair ||
      !selectedAnswers[questionIndex]
    ) {
      return;
    }

    setSubmittedQuestions((previous) => ({
      ...previous,
      [questionIndex]: true,
    }));
  }

  /* =====================================================
     DATE
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
        month: "long",
        year: "numeric",
      },
    );
  }

  /* =====================================================
     LANGUAGE DATA
  ===================================================== */

  const title =
    language === "hindi"
      ? affair?.title_hi ||
        affair?.title ||
        ""
      : affair?.title || "";

  const whyInNews =
    language === "hindi"
      ? affair?.why_in_news_hi ||
        affair?.why_in_news ||
        ""
      : affair?.why_in_news || "";

  const keyFacts =
    language === "hindi"
      ? affair?.key_facts_hi ||
        affair?.key_facts ||
        ""
      : affair?.key_facts || "";

  const examPoint =
    language === "hindi"
      ? affair?.exam_point_hi ||
        affair?.exam_point ||
        ""
      : affair?.exam_point || "";

  const staticGk =
    language === "hindi"
      ? affair?.static_gk_hi ||
        affair?.static_gk ||
        ""
      : affair?.static_gk || "";

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/student/current-affairs",
                )
              }
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-black text-white">
                R
              </div>

              <div className="text-left">
                <div className="font-black">
                  RANKER BHAIYA
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Current Affairs
                </div>
              </div>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Loading current affair...
            </p>
          </div>
        </main>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error || !affair) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/student/current-affairs",
                )
              }
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-black text-white">
                R
              </div>

              <div className="text-left">
                <div className="font-black">
                  RANKER BHAIYA
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Current Affairs
                </div>
              </div>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 dark:border-red-900/50 dark:bg-red-950/30">
            <div className="text-4xl">
              ⚠️
            </div>

            <h2 className="mt-4 text-xl font-black text-red-700 dark:text-red-300">
              Current Affair Load Failed
            </h2>

            <p className="mt-3 break-words text-sm leading-6 text-red-600 dark:text-red-400">
              {error ||
                "Current affair nahi mila."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  void loadCurrentAffair()
                }
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/student/current-affairs",
                  )
                }
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
              >
                ← All Current Affairs
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/current-affairs",
              )
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-black text-white shadow-sm">
              R
            </div>

            <div className="text-left">
              <h1 className="text-lg font-black tracking-tight">
                RANKER BHAIYA
              </h1>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current Affairs
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/current-affairs",
              )
            }
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ← Back
          </button>

        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8">

        {/* LANGUAGE */}
        <div className="mb-5 flex justify-end">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <button
              type="button"
              onClick={() =>
                setLanguage("english")
              }
              className={`rounded-lg px-4 py-2 text-sm font-bold ${
                language === "english"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              🇬🇧 English
            </button>

            <button
              type="button"
              onClick={() =>
                setLanguage("hindi")
              }
              className={`rounded-lg px-4 py-2 text-sm font-bold ${
                language === "hindi"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              🇮🇳 हिन्दी
            </button>

          </div>
        </div>

        {/* TITLE CARD */}
        <section className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg sm:p-8">

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
              #{affair.serial_no}
            </span>

            {affair.category && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                {affair.category}
              </span>
            )}

            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
              {formatDate(
                affair.affair_date,
              )}
            </span>
          </div>

          <h2 className="mt-5 text-2xl font-black leading-tight sm:text-3xl">
            {title}
          </h2>

        </section>

        {/* WHY IN NEWS */}
        <ContentSection
          icon="📰"
          title={
            language === "hindi"
              ? "खबरों में क्यों?"
              : "Why in News"
          }
          content={whyInNews}
        />

        {/* KEY FACTS */}
        <ContentSection
          icon="📌"
          title={
            language === "hindi"
              ? "मुख्य तथ्य"
              : "Key Facts"
          }
          content={keyFacts}
        />

        {/* EXAM POINT */}
        <ContentSection
          icon="🎯"
          title={
            language === "hindi"
              ? "परीक्षा बिंदु"
              : "Exam Point"
          }
          content={examPoint}
          highlight
        />

        {/* STATIC GK */}
        <ContentSection
          icon="📚"
          title="Static GK"
          content={staticGk}
        />

        {/* MCQS */}
        {affair.mcqs.length > 0 && (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-600 dark:text-green-400">
                Practice
              </p>

              <h2 className="mt-1 text-xl font-black">
                📝{" "}
                {language === "hindi"
                  ? "अभ्यास MCQs"
                  : "Practice MCQs"}
              </h2>
            </div>

            <div className="mt-6 space-y-6">

              {affair.mcqs.map(
                (mcq, index) => {
                  const selected =
                    selectedAnswers[
                      index
                    ];

                  const submitted =
                    submittedQuestions[
                      index
                    ];

                  const isCorrect =
                    selected ===
                    mcq.answer;

                  return (
                    <div
                      key={`${index}-${mcq.question}`}
                      className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
                    >

                      <div className="flex gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-black text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                          {index + 1}
                        </span>

                        <h3 className="font-bold leading-6">
                          {mcq.question}
                        </h3>
                      </div>

                      <div className="mt-4 space-y-2">
                        {mcq.options.map(
                          (option) => {
                            const isSelected =
                              selected ===
                              option;

                            const isAnswer =
                              mcq.answer ===
                              option;

                            let optionClass =
                              "border-slate-200 hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-800";

                            if (
                              submitted &&
                              isAnswer
                            ) {
                              optionClass =
                                "border-green-500 bg-green-50 text-green-800 dark:border-green-500 dark:bg-green-950/30 dark:text-green-300";
                            } else if (
                              submitted &&
                              isSelected &&
                              !isCorrect
                            ) {
                              optionClass =
                                "border-red-500 bg-red-50 text-red-800 dark:border-red-500 dark:bg-red-950/30 dark:text-red-300";
                            } else if (
                              isSelected
                            ) {
                              optionClass =
                                "border-blue-500 bg-blue-50 text-blue-800 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-300";
                            }

                            return (
                              <button
                                key={option}
                                type="button"
                                disabled={
                                  submitted
                                }
                                onClick={() =>
                                  selectAnswer(
                                    index,
                                    option,
                                  )
                                }
                                className={`flex w-full items-center rounded-xl border p-3 text-left text-sm font-medium transition ${optionClass}`}
                              >
                                <span className="mr-3">
                                  {isSelected
                                    ? "◉"
                                    : "○"}
                                </span>

                                <span>
                                  {option}
                                </span>
                              </button>
                            );
                          },
                        )}
                      </div>

                      {!submitted && (
                        <button
                          type="button"
                          disabled={!selected}
                          onClick={() =>
                            submitAnswer(
                              index,
                            )
                          }
                          className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Check Answer
                        </button>
                      )}

                      {submitted && (
                        <div
                          className={`mt-4 rounded-xl p-4 ${
                            isCorrect
                              ? "bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300"
                              : "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300"
                          }`}
                        >
                          <p className="font-bold">
                            {isCorrect
                              ? "✅ Correct!"
                              : "❌ Incorrect"}
                          </p>

                          {!isCorrect && (
                            <p className="mt-1 text-sm">
                              Correct answer:{" "}
                              <strong>
                                {mcq.answer}
                              </strong>
                            </p>
                          )}

                          {mcq.explanation && (
                            <p className="mt-2 text-sm leading-6">
                              {mcq.explanation}
                            </p>
                          )}
                        </div>
                      )}

                    </div>
                  );
                },
              )}

            </div>
          </section>
        )}

        {/* BOTTOM */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/current-affairs",
              )
            }
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
          >
            ← View All Current Affairs
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/dashboard",
              )
            }
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
          >
            Dashboard
          </button>

        </div>

      </main>
    </div>
  );
}

/* =====================================================
   CONTENT SECTION
===================================================== */

function ContentSection({
  icon,
  title,
  content,
  highlight = false,
}: {
  icon: string;
  title: string;
  content: string;
  highlight?: boolean;
}) {
  if (!content) {
    return null;
  }

  return (
    <section
      className={`mt-6 rounded-3xl border p-6 shadow-sm sm:p-8 ${
        highlight
          ? "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <h2 className="flex items-center gap-2 text-xl font-black">
        <span>{icon}</span>
        <span>{title}</span>
      </h2>

      <div
        className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300"
        dangerouslySetInnerHTML={{
          __html: content,
        }}
      />
    </section>
  );
}

/* =====================================================
   NORMALIZE CURRENT AFFAIR
===================================================== */

function normalizeCurrentAffair(
  value: unknown,
): CurrentAffair | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const row =
    value as Record<string, unknown>;

  return {
    id: String(row.id ?? ""),

    affair_date: String(
      row.affair_date ?? "",
    ),

    serial_no: Number(
      row.serial_no ?? 1,
    ),

    title: String(
      row.title ?? "",
    ),

    why_in_news: String(
      row.why_in_news ?? "",
    ),

    key_facts: String(
      row.key_facts ?? "",
    ),

    exam_point: String(
      row.exam_point ?? "",
    ),

    static_gk: String(
      row.static_gk ?? "",
    ),

    mcqs: normalizeMCQs(
      row.mcqs,
    ),

    published:
      typeof row.published ===
      "boolean"
        ? row.published
        : true,

    category: String(
      row.category ?? "Other",
    ),

    title_hi: String(
      row.title_hi ?? "",
    ),

    why_in_news_hi: String(
      row.why_in_news_hi ?? "",
    ),

    key_facts_hi: String(
      row.key_facts_hi ?? "",
    ),

    exam_point_hi: String(
      row.exam_point_hi ?? "",
    ),

    static_gk_hi: String(
      row.static_gk_hi ?? "",
    ),
  };
}

/* =====================================================
   MCQ NORMALIZER
===================================================== */

function normalizeMCQs(
  value: unknown,
): MCQ[] {
  let source: unknown = value;

  /*
   * Supabase JSON kabhi-kabhi string ke
   * form mein bhi return ho sakta hai.
   */
  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map((item): MCQ | null => {
      if (
        !item ||
        typeof item !== "object" ||
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
              .filter(Boolean)
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
        options.length !== 4 ||
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
      (item): item is MCQ =>
        item !== null,
    );
}

export default CurrentAffairDetail;
