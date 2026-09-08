import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
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
   MAIN
===================================================== */

export function CurrentAffairDetail() {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  const [affair, setAffair] =
    useState<CurrentAffair | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [language, setLanguage] =
    useState<"english" | "hindi">(
      "english",
    );

  const [selectedAnswers, setSelectedAnswers] =
    useState<
      Record<number, string>
    >({});

  const [showAnswers, setShowAnswers] =
    useState<
      Record<number, boolean>
    >({});

  /* =====================================================
     LOAD DETAIL
  ===================================================== */

  useEffect(() => {
    if (!id) {
      setError(
        "Current affair ID is missing.",
      );
      setLoading(false);
      return;
    }

    void loadCurrentAffair(id);
  }, [id]);

  async function loadCurrentAffair(
    affairId: string,
  ) {
    setLoading(true);
    setError("");

    try {
      const {
        data,
        error: fetchError,
      } = await supabase
        .from("current_affairs")
        .select(
          [
            "id",
            "affair_date",
            "serial_no",
            "title",
            "why_in_news",
            "key_facts",
            "exam_point",
            "static_gk",
            "mcqs",
            "published",
            "category",
            "title_hi",
            "why_in_news_hi",
            "key_facts_hi",
            "exam_point_hi",
            "static_gk_hi",
          ].join(","),
        )
        .eq(
          "id",
          affairId,
        )
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        setError(
          "Current affair not found.",
        );
        setAffair(null);
        return;
      }

      const normalized: CurrentAffair =
        {
          id: data.id,

          affair_date:
            data.affair_date ?? "",

          serial_no:
            Number(
              data.serial_no ?? 1,
            ),

          title:
            data.title ?? "",

          why_in_news:
            data.why_in_news ?? "",

          key_facts:
            data.key_facts ?? "",

          exam_point:
            data.exam_point ?? "",

          static_gk:
            data.static_gk ?? "",

          mcqs: normalizeMCQs(
            data.mcqs,
          ),

          published:
            typeof data.published ===
            "boolean"
              ? data.published
              : true,

          category:
            data.category ||
            "Other",

          title_hi:
            data.title_hi ?? "",

          why_in_news_hi:
            data.why_in_news_hi ??
            "",

          key_facts_hi:
            data.key_facts_hi ?? "",

          exam_point_hi:
            data.exam_point_hi ??
            "",

          static_gk_hi:
            data.static_gk_hi ??
            "",
        };

      setAffair(
        normalized,
      );
    } catch (err) {
      console.error(
        "Current affair detail error:",
        err,
      );

      setError(
        getErrorMessage(
          err,
          "Unable to load current affair.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     LANGUAGE DATA
  ===================================================== */

  const content = useMemo(() => {
    if (!affair) {
      return {
        title: "",
        whyInNews: "",
        keyFacts: "",
        examPoint: "",
        staticGK: "",
      };
    }

    if (language === "hindi") {
      return {
        title:
          affair.title_hi ||
          affair.title,

        whyInNews:
          affair.why_in_news_hi ||
          affair.why_in_news,

        keyFacts:
          affair.key_facts_hi ||
          affair.key_facts,

        examPoint:
          affair.exam_point_hi ||
          affair.exam_point,

        staticGK:
          affair.static_gk_hi ||
          affair.static_gk,
      };
    }

    return {
      title: affair.title,
      whyInNews:
        affair.why_in_news,
      keyFacts:
        affair.key_facts,
      examPoint:
        affair.exam_point,
      staticGK:
        affair.static_gk,
    };
  }, [
    affair,
    language,
  ]);

  /* =====================================================
     MCQ HANDLER
  ===================================================== */

  function handleAnswer(
    mcqIndex: number,
    answer: string,
  ) {
    if (
      showAnswers[mcqIndex]
    ) {
      return;
    }

    setSelectedAnswers(
      (previous) => ({
        ...previous,
        [mcqIndex]: answer,
      }),
    );

    setShowAnswers(
      (previous) => ({
        ...previous,
        [mcqIndex]: true,
      }),
    );
  }

  function resetQuiz() {
    setSelectedAnswers({});
    setShowAnswers({});
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">

        <Header
          onBack={() =>
            navigate(
              "/student/current-affairs",
            )
          }
        />

        <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">

          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-5 text-sm font-semibold text-slate-500">
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
      <div className="min-h-screen bg-slate-50">

        <Header
          onBack={() =>
            navigate(
              "/student/current-affairs",
            )
          }
        />

        <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">

          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <div className="text-5xl">
              📰
            </div>

            <h1 className="mt-5 text-2xl font-black text-slate-900">
              Current Affair Not Found
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error ||
                "This current affair could not be found."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/student/current-affairs",
                )
              }
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              ← View All Current Affairs
            </button>

          </div>

        </main>
      </div>
    );
  }

  /* =====================================================
     RESULT
  ===================================================== */

  const attempted =
    Object.keys(
      selectedAnswers,
    ).length;

  const correct =
    affair.mcqs.filter(
      (mcq, index) =>
        selectedAnswers[index] ===
        mcq.answer,
    ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}

      <Header
        onBack={() =>
          navigate(
            "/student/current-affairs",
          )
        }
      />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">

        {/* =================================================
            TOP META
        ================================================= */}

        <div className="mb-5 flex flex-wrap items-center gap-2">

          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            {affair.category ||
              "Current Affairs"}
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            {formatDate(
              affair.affair_date,
            )}
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            #{affair.serial_no}
          </span>

        </div>

        {/* =================================================
            TITLE CARD
        ================================================= */}

        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="p-6 sm:p-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

              <div className="min-w-0 flex-1">

                <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                  VIDYZEN · Current Affairs
                </p>

                <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
                  {content.title}
                </h1>

              </div>

              {/* LANGUAGE */}

              <div className="flex shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-1">

                <button
                  type="button"
                  onClick={() => {
                    setLanguage(
                      "english",
                    );
                    resetQuiz();
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                    language ===
                    "english"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  English
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLanguage(
                      "hindi",
                    );
                    resetQuiz();
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                    language ===
                    "hindi"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  हिंदी
                </button>

              </div>

            </div>

            {/* WHY IN NEWS */}

            <ContentSection
              icon="🔥"
              title={
                language ===
                "hindi"
                  ? "खबरों में क्यों?"
                  : "Why in News"
              }
              content={
                content.whyInNews
              }
              accent="blue"
            />

            {/* KEY FACTS */}

            <ContentSection
              icon="📌"
              title={
                language ===
                "hindi"
                  ? "मुख्य तथ्य"
                  : "Key Facts"
              }
              content={
                content.keyFacts
              }
              accent="indigo"
            />

            {/* EXAM POINT */}

            <ContentSection
              icon="🎯"
              title={
                language ===
                "hindi"
                  ? "परीक्षा बिंदु"
                  : "Exam Point"
              }
              content={
                content.examPoint
              }
              accent="green"
            />

            {/* STATIC GK */}

            <ContentSection
              icon="📚"
              title={
                language ===
                "hindi"
                  ? "Static GK"
                  : "Static GK"
              }
              content={
                content.staticGK
              }
              accent="orange"
            />

          </div>

        </article>

        {/* =================================================
            MCQ SECTION
        ================================================= */}

        {affair.mcqs.length >
          0 && (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                  Practice
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {language ===
                  "hindi"
                    ? "MCQ अभ्यास"
                    : "MCQ Practice"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {language ===
                  "hindi"
                    ? `${affair.mcqs.length} प्रश्न`
                    : `${affair.mcqs.length} questions`}
                </p>

              </div>

              {attempted > 0 && (
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">

                  <p className="text-xs font-semibold text-slate-500">
                    Score
                  </p>

                  <p className="text-xl font-black text-blue-600">
                    {correct}/
                    {attempted}
                  </p>

                </div>
              )}

            </div>

            <div className="mt-6 space-y-5">

              {affair.mcqs.map(
                (
                  mcq,
                  mcqIndex,
                ) => {
                  const selected =
                    selectedAnswers[
                      mcqIndex
                    ];

                  const answered =
                    showAnswers[
                      mcqIndex
                    ];

                  const isCorrect =
                    selected ===
                    mcq.answer;

                  return (
                    <div
                      key={
                        mcqIndex
                      }
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >

                      {/* QUESTION */}

                      <div className="flex gap-3">

                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                          {mcqIndex +
                            1}
                        </span>

                        <h3 className="pt-1 text-base font-black leading-6 text-slate-900">
                          {mcq.question}
                        </h3>

                      </div>

                      {/* OPTIONS */}

                      <div className="mt-5 grid gap-3">

                        {mcq.options.map(
                          (
                            option,
                            optionIndex,
                          ) => {
                            const optionIsCorrect =
                              option ===
                              mcq.answer;

                            const optionIsSelected =
                              option ===
                              selected;

                            let optionClass =
                              "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50";

                            if (
                              answered &&
                              optionIsCorrect
                            ) {
                              optionClass =
                                "border-green-300 bg-green-50";
                            } else if (
                              answered &&
                              optionIsSelected &&
                              !optionIsCorrect
                            ) {
                              optionClass =
                                "border-red-300 bg-red-50";
                            }

                            return (
                              <button
                                key={
                                  optionIndex
                                }
                                type="button"
                                disabled={
                                  answered
                                }
                                onClick={() =>
                                  handleAnswer(
                                    mcqIndex,
                                    option,
                                  )
                                }
                                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${optionClass} ${
                                  answered
                                    ? "cursor-default"
                                    : "cursor-pointer"
                                }`}
                              >

                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-600">
                                  {String.fromCharCode(
                                    65 +
                                      optionIndex,
                                  )}
                                </span>

                                <span className="pt-0.5 text-sm font-semibold leading-6 text-slate-700">
                                  {
                                    option
                                  }
                                </span>

                                {answered &&
                                  optionIsCorrect && (
                                    <span className="ml-auto text-lg">
                                      ✅
                                    </span>
                                  )}

                                {answered &&
                                  optionIsSelected &&
                                  !optionIsCorrect && (
                                    <span className="ml-auto text-lg">
                                      ❌
                                    </span>
                                  )}

                              </button>
                            );
                          },
                        )}

                      </div>

                      {/* FEEDBACK */}

                      {answered && (
                        <div
                          className={`mt-4 rounded-xl border p-4 ${
                            isCorrect
                              ? "border-green-200 bg-green-50"
                              : "border-red-200 bg-red-50"
                          }`}
                        >

                          <p
                            className={`text-sm font-black ${
                              isCorrect
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            {isCorrect
                              ? language ===
                                "hindi"
                                ? "सही उत्तर! 🎉"
                                : "Correct Answer! 🎉"
                              : language ===
                                "hindi"
                                ? "गलत उत्तर"
                                : "Incorrect Answer"}
                          </p>

                          {!isCorrect && (
                            <p className="mt-2 text-sm font-semibold text-slate-700">
                              <span className="font-black">
                                {language ===
                                "hindi"
                                  ? "सही उत्तर:"
                                  : "Correct answer:"}
                              </span>{" "}
                              {
                                mcq.answer
                              }
                            </p>
                          )}

                          {mcq.explanation && (
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              <span className="font-bold">
                                {language ===
                                "hindi"
                                  ? "व्याख्या:"
                                  : "Explanation:"}
                              </span>{" "}
                              {
                                mcq.explanation
                              }
                            </p>
                          )}

                        </div>
                      )}

                    </div>
                  );
                },
              )}

            </div>

            {/* RESET */}

            {attempted > 0 && (
              <div className="mt-6 flex justify-center">

                <button
                  type="button"
                  onClick={
                    resetQuiz
                  }
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  {language ===
                  "hindi"
                    ? "फिर से प्रयास करें"
                    : "Try Again"}
                </button>

              </div>
            )}

          </section>
        )}

        {/* =================================================
            BOTTOM ACTION
        ================================================= */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/current-affairs",
              )
            }
            className="flex-1 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
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
            className="flex-1 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
          >
            Go to Dashboard →
          </button>

        </div>

      </main>

      {/* FOOTER */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-5xl px-4 py-6 text-center sm:px-6">

          <p className="text-sm font-black text-blue-600">
            VIDYZEN
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Learn Smart · Revise Fast · Perform Better
          </p>

        </div>

      </footer>

    </div>
  );
}

/* =====================================================
   HEADER
===================================================== */

function Header({
  onBack,
}: {
  onBack: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">

      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">

        <button
          type="button"
          onClick={onBack}
          className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          ← Back
        </button>

        <div className="text-xl font-black tracking-tight text-blue-600">
          VIDYZEN
        </div>

        <div className="w-[60px]" />

      </div>

    </header>
  );
}

/* =====================================================
   CONTENT SECTION
===================================================== */

function ContentSection({
  icon,
  title,
  content,
  accent,
}: {
  icon: string;
  title: string;
  content: string;
  accent:
    | "blue"
    | "indigo"
    | "green"
    | "orange";
}) {
  if (!content?.trim()) {
    return null;
  }

  const accentClasses = {
    blue: {
      wrapper:
        "border-blue-100 bg-blue-50/50",
      icon:
        "bg-blue-100 text-blue-700",
      title:
        "text-blue-800",
    },

    indigo: {
      wrapper:
        "border-indigo-100 bg-indigo-50/50",
      icon:
        "bg-indigo-100 text-indigo-700",
      title:
        "text-indigo-800",
    },

    green: {
      wrapper:
        "border-green-100 bg-green-50/50",
      icon:
        "bg-green-100 text-green-700",
      title:
        "text-green-800",
    },

    orange: {
      wrapper:
        "border-orange-100 bg-orange-50/50",
      icon:
        "bg-orange-100 text-orange-700",
      title:
        "text-orange-800",
    },
  };

  const styles =
    accentClasses[
      accent
    ];

  const paragraphs =
    splitContent(content);

  return (
    <section
      className={`mt-7 rounded-2xl border p-5 ${styles.wrapper}`}
    >

      <div className="flex items-center gap-3">

        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${styles.icon}`}
        >
          {icon}
        </span>

        <h2
          className={`text-lg font-black ${styles.title}`}
        >
          {title}
        </h2>

      </div>

      <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">

        {paragraphs.map(
          (
            paragraph,
            index,
          ) => (
            <p
              key={index}
              className="whitespace-pre-line"
            >
              {paragraph}
            </p>
          ),
        )}

      </div>

    </section>
  );
}

/* =====================================================
   CONTENT SPLITTER
===================================================== */

function splitContent(
  value: string,
): string[] {
  const cleaned =
    value
      .replace(
        /<br\s*\/?>/gi,
        "\n",
      )
      .replace(
        /<\/p>/gi,
        "\n",
      )
      .replace(
        /<p[^>]*>/gi,
        "",
      )
      .replace(
        /<li[^>]*>/gi,
        "• ",
      )
      .replace(
        /<\/li>/gi,
        "\n",
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
      .trim();

  if (!cleaned) {
    return [];
  }

  return cleaned
    .split(/\n+/)
    .map(
      (item) =>
        item.trim(),
    )
    .filter(Boolean);
}

/* =====================================================
   MCQ NORMALIZATION
===================================================== */

function normalizeMCQs(
  values: unknown,
): MCQ[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => {
      if (
        typeof value ===
        "string"
      ) {
        try {
          return normalizeSingleMCQ(
            JSON.parse(value),
          );
        } catch {
          return null;
        }
      }

      return normalizeSingleMCQ(
        value,
      );
    })
    .filter(
      (
        mcq,
      ): mcq is MCQ =>
        mcq !== null,
    );
}

/* =====================================================
   SINGLE MCQ
===================================================== */

function normalizeSingleMCQ(
  value: unknown,
): MCQ | null {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const data =
    value as Record<
      string,
      unknown
    >;

  const question =
    typeof data.question ===
    "string"
      ? data.question.trim()
      : "";

  const options =
    Array.isArray(
      data.options,
    )
      ? data.options
          .filter(
            (
              option,
            ): option is string =>
              typeof option ===
              "string",
          )
          .map(
            (option) =>
              option.trim(),
          )
      : [];

  const answer =
    typeof data.answer ===
    "string"
      ? data.answer.trim()
      : "";

  const explanation =
    typeof data.explanation ===
    "string"
      ? data.explanation.trim()
      : "";

  if (
    !question ||
    options.length !== 4 ||
    options.some(
      (option) => !option,
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
}

/* =====================================================
   DATE
===================================================== */

function formatDate(
  value: string,
): string {
  if (!value) {
    return "";
  }

  const date =
    new Date(
      `${value}T00:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

/* =====================================================
   ERROR MESSAGE
===================================================== */

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null
  ) {
    const data =
      error as Record<
        string,
        unknown
      >;

    if (
      typeof data.message ===
      "string"
    ) {
      return data.message;
    }

    if (
      typeof data.details ===
      "string"
    ) {
      return data.details;
    }

    if (
      typeof data.hint ===
      "string"
    ) {
      return data.hint;
    }
  }

  return fallback;
}

/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default CurrentAffairDetail;
