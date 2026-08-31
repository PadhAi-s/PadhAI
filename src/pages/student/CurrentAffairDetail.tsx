import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";

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

interface MCQ {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export function CurrentAffairDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [record, setRecord] =
    useState<CurrentAffair | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (id) {
      void loadCurrentAffair();
    }
  }, [id]);

  async function loadCurrentAffair() {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } =
        await supabase
          .from("current_affairs")
          .select(`
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
          `)
          .eq("id", id)
          .single();

      if (fetchError) {
        throw fetchError;
      }

      setRecord({
        id: data.id,
        affair_date:
          data.affair_date ?? "",
        serial_no:
          Number(data.serial_no ?? 1),
        title: data.title ?? "",
        why_in_news:
          data.why_in_news ?? "",
        key_facts:
          data.key_facts ?? "",
        exam_point:
          data.exam_point ?? "",
        static_gk:
          data.static_gk ?? "",
        category:
          data.category ?? null,
        mcqs: Array.isArray(data.mcqs)
          ? data.mcqs
          : [],
      });
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

  const mcqs = record
    ? record.mcqs
        .map(parseMCQ)
        .filter(
          (mcq): mcq is MCQ =>
            mcq !== null,
        )
    : [];

  /* LOADING */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        {t(
          "currentAffairs.detail.loading",
        )}
      </div>
    );
  }

  /* ERROR / NOT FOUND */

  if (error || !record) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl">

          {/* BACK TO DASHBOARD */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/dashboard",
              )
            }
            className="mb-6 text-sm font-semibold text-slate-600 transition hover:text-blue-600 dark:text-slate-300"
          >
            ← Back to Dashboard
          </button>

          <div className="rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-950/30 dark:text-red-300">
            ❌{" "}
            {error ||
              t(
                "currentAffairs.detail.notFound",
              )}
          </div>
        </div>
      </div>
    );
  }

  /* MAIN PAGE */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-white">
      <main className="mx-auto max-w-4xl px-4 py-8">

        {/* BACK TO DASHBOARD */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/dashboard",
            )
          }
          className="mb-6 text-sm font-semibold text-slate-600 transition hover:text-blue-600 dark:text-slate-300"
        >
          ← Back to Dashboard
        </button>

        {/* ARTICLE */}

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">

          {/* CATEGORY + DATE */}

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              {record.category ||
                t(
                  "currentAffairs.label",
                )}
            </span>

            <span className="text-sm text-slate-400">
              {record.affair_date}
            </span>
          </div>

          {/* TITLE */}

          <h1 className="mt-5 text-2xl font-bold leading-tight sm:text-3xl">
            {record.title}
          </h1>

          {/* WHY IN NEWS */}

          <DetailSection
            title={t(
              "currentAffairs.detail.whyInNews",
            )}
            content={
              record.why_in_news
            }
          />

          {/* KEY FACTS */}

          <DetailSection
            title={t(
              "currentAffairs.detail.keyFacts",
            )}
            content={
              record.key_facts
            }
          />

          {/* EXAM POINT */}

          <DetailSection
            title={t(
              "currentAffairs.detail.examPoint",
            )}
            content={
              record.exam_point
            }
          />

          {/* STATIC GK */}

          <DetailSection
            title={t(
              "currentAffairs.detail.staticGK",
            )}
            content={
              record.static_gk
            }
          />

          {/* MCQs */}

          <section className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
            <h2 className="text-xl font-bold">
              {t(
                "currentAffairs.detail.mcqs",
              )}
            </h2>

            {mcqs.length === 0 ? (
              <p className="mt-3 text-slate-500 dark:text-slate-400">
                {t(
                  "currentAffairs.detail.noMcqs",
                )}
              </p>
            ) : (
              <div className="mt-5 space-y-5">
                {mcqs.map(
                  (mcq, index) => (
                    <MCQCard
                      key={`${record.id}-${index}`}
                      mcq={mcq}
                      number={
                        index + 1
                      }
                    />
                  ),
                )}
              </div>
            )}
          </section>
        </article>
      </main>
    </div>
  );
}

/* PARSE MCQ */

function parseMCQ(
  value: unknown,
): MCQ | null {
  try {
    let parsed: unknown =
      value;

    if (
      typeof value === "string"
    ) {
      parsed =
        JSON.parse(value);
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return null;
    }

    const data =
      parsed as Record<
        string,
        unknown
      >;

    const question =
      typeof data.question ===
      "string"
        ? data.question
        : "";

    const answer =
      typeof data.answer ===
      "string"
        ? data.answer
        : "";

    const options =
      Array.isArray(
        data.options,
      )
        ? data.options.filter(
            (
              option,
            ): option is string =>
              typeof option ===
              "string",
          )
        : [];

    const explanation =
      typeof data.explanation ===
      "string"
        ? data.explanation
        : undefined;

    if (
      !question ||
      !answer ||
      options.length === 0
    ) {
      return null;
    }

    return {
      question,
      options,
      answer,
      explanation,
    };
  } catch {
    return null;
  }
}

/* MCQ CARD */

interface MCQCardProps {
  mcq: MCQ;
  number: number;
}

function MCQCard({
  mcq,
  number,
}: MCQCardProps) {
  const [
    selectedAnswer,
    setSelectedAnswer,
  ] = useState<
    string | null
  >(null);

  const isAnswered =
    selectedAnswer !== null;

  function selectAnswer(
    option: string,
  ) {
    if (isAnswered) {
      return;
    }

    setSelectedAnswer(option);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">

      <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
        Question {number}
      </p>

      <h3 className="mt-2 text-base font-semibold leading-6">
        {mcq.question}
      </h3>

      {/* OPTIONS */}

      <div className="mt-4 space-y-3">
        {mcq.options.map(
          (option, index) => {
            const isSelected =
              selectedAnswer ===
              option;

            const isCorrect =
              isAnswered &&
              option ===
                mcq.answer;

            const isWrong =
              isSelected &&
              option !==
                mcq.answer;

            let optionClass =
              "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500 dark:hover:bg-slate-800";

            if (isCorrect) {
              optionClass =
                "border-green-500 bg-green-50 text-green-800 dark:border-green-500 dark:bg-green-950/30 dark:text-green-300";
            }

            if (isWrong) {
              optionClass =
                "border-red-500 bg-red-50 text-red-800 dark:border-red-500 dark:bg-red-950/30 dark:text-red-300";
            }

            return (
              <button
                key={`${option}-${index}`}
                type="button"
                disabled={
                  isAnswered
                }
                onClick={() =>
                  selectAnswer(
                    option,
                  )
                }
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition ${optionClass}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                  {String.fromCharCode(
                    65 + index,
                  )}
                </span>

                <span>
                  {option}
                </span>
              </button>
            );
          },
        )}
      </div>

      {/* RESULT */}

      {isAnswered && (
        <div className="mt-4">
          {selectedAnswer ===
          mcq.answer ? (
            <p className="font-semibold text-green-600 dark:text-green-400">
              ✓ Correct Answer!
            </p>
          ) : (
            <div>
              <p className="font-semibold text-red-600 dark:text-red-400">
                ✗ Incorrect
              </p>

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Correct answer:{" "}
                <strong>
                  {mcq.answer}
                </strong>
              </p>
            </div>
          )}

          {mcq.explanation && (
            <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-slate-700 dark:bg-blue-950/30 dark:text-slate-300">
              <strong>
                Explanation:
              </strong>{" "}
              {mcq.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* DETAIL SECTION */

function DetailSection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  if (!content) {
    return null;
  }

  return (
    <section className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
      <h2 className="text-xl font-bold">
        {title}
      </h2>

      <p className="mt-3 whitespace-pre-line leading-7 text-slate-600 dark:text-slate-300">
        {content}
      </p>
    </section>
  );
}

export default CurrentAffairDetail;
