import { useEffect, useMemo, useState } from "react";
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
  hindi_version: string;
}

interface MCQ {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface HindiSections {
  title: string;
  whyInNews: string;
  keyFacts: string;
  examPoint: string;
  staticGK: string;
  mcqs: string;
}

export function CurrentAffairDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    t,
    i18n,
  } = useTranslation();

  const [record, setRecord] =
    useState<CurrentAffair | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const isHindi =
    i18n.language?.toLowerCase().startsWith("hi");

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
      const {
        data,
        error: fetchError,
      } = await supabase
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
          mcqs,
          hindi_version
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
        category:
          data.category ?? null,
        mcqs:
          Array.isArray(data.mcqs)
            ? data.mcqs
            : [],
        hindi_version:
          data.hindi_version ?? "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Current affair load nahi ho saka.",
      );
    } finally {
      setLoading(false);
    }
  }

  const mcqs = useMemo(() => {
    if (!record) {
      return [];
    }

    return record.mcqs
      .map(parseMCQ)
      .filter(
        (
          mcq,
        ): mcq is MCQ =>
          mcq !== null,
      );
  }, [record]);

  const hindiContent =
    useMemo(() => {
      if (!record?.hindi_version) {
        return null;
      }

      return parseHindiVersion(
        record.hindi_version,
      );
    }, [record]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        {isHindi
          ? "लोड हो रहा है..."
          : "Loading..."}
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/dashboard",
              )
            }
            className="mb-6 text-sm font-semibold text-slate-600 transition hover:text-blue-600 dark:text-slate-300"
          >
            ← {isHindi
              ? "डैशबोर्ड पर वापस जाएँ"
              : "Back to Dashboard"}
          </button>

          <div className="rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-950/30 dark:text-red-300">
            ❌{" "}
            {error ||
              (isHindi
                ? "यह करेंट अफेयर्स नहीं मिला।"
                : "Current affair not found.")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-white">
      <main className="mx-auto max-w-4xl px-4 py-8">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/dashboard",
            )
          }
          className="mb-6 text-sm font-semibold text-slate-600 transition hover:text-blue-600 dark:text-slate-300"
        >
          ← {isHindi
            ? "डैशबोर्ड पर वापस जाएँ"
            : "Back to Dashboard"}
        </button>

        {isHindi &&
        hindiContent ? (
          <HindiCurrentAffair
            record={record}
            content={hindiContent}
          />
        ) : (
          <EnglishCurrentAffair
            record={record}
            mcqs={mcqs}
          />
        )}
      </main>
    </div>
  );
}

/* =========================================
   ENGLISH VERSION
========================================= */

function EnglishCurrentAffair({
  record,
  mcqs,
}: {
  record: CurrentAffair;
  mcqs: MCQ[];
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">

      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          {record.category ||
            "Current Affairs"}
        </span>

        <span className="text-sm text-slate-400">
          {record.affair_date}
        </span>
      </div>

      <h1 className="mt-5 text-2xl font-bold leading-tight sm:text-3xl">
        {record.title}
      </h1>

      <DetailSection
        title="Why in News?"
        content={record.why_in_news}
      />

      <DetailSection
        title="Key Facts"
        content={record.key_facts}
      />

      <DetailSection
        title="Exam Point"
        content={record.exam_point}
      />

      <DetailSection
        title="Static GK"
        content={record.static_gk}
      />

      <section className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
        <h2 className="text-xl font-bold">
          MCQs
        </h2>

        {mcqs.length === 0 ? (
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            No MCQs available.
          </p>
        ) : (
          <div className="mt-5 space-y-5">
            {mcqs.map(
              (mcq, index) => (
                <MCQCard
                  key={`${record.id}-${index}`}
                  mcq={mcq}
                  number={index + 1}
                />
              ),
            )}
          </div>
        )}
      </section>
    </article>
  );
}

/* =========================================
   HINDI VERSION
========================================= */

function HindiCurrentAffair({
  record,
  content,
}: {
  record: CurrentAffair;
  content: HindiSections;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">

      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          {record.category ||
            "करेंट अफेयर्स"}
        </span>

        <span className="text-sm text-slate-400">
          {record.affair_date}
        </span>
      </div>

      <h1 className="mt-5 text-2xl font-bold leading-tight sm:text-3xl">
        {content.title ||
          record.title}
      </h1>

      <HindiDetailSection
        title="चर्चा में क्यों?"
        content={
          content.whyInNews
        }
      />

      <HindiDetailSection
        title="मुख्य तथ्य"
        content={
          content.keyFacts
        }
      />

      <HindiDetailSection
        title="परीक्षा बिंदु"
        content={
          content.examPoint
        }
      />

      <HindiDetailSection
        title="सामान्य ज्ञान"
        content={
          content.staticGK
        }
      />

      {content.mcqs && (
        <section className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
          <h2 className="text-xl font-bold">
            प्रश्नोत्तर (MCQs)
          </h2>

          <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <p className="whitespace-pre-line leading-7 text-slate-700 dark:text-slate-300">
              {content.mcqs}
            </p>
          </div>
        </section>
      )}
    </article>
  );
}

/* =========================================
   HINDI VERSION PARSER
========================================= */

function parseHindiVersion(
  html: string,
): HindiSections {
  const text =
    htmlToPlainText(html);

  const title = extractSection(
    text,
    "शीर्षक (Title):",
    [
      "चर्चा में क्यों:",
    ],
  );

  const whyInNews =
    extractSection(
      text,
      "चर्चा में क्यों:",
      [
        "मुख्य तथ्य:",
      ],
    );

  const keyFacts =
    extractSection(
      text,
      "मुख्य तथ्य:",
      [
        "परीक्षा बिंदु:",
      ],
    );

  const examPoint =
    extractSection(
      text,
      "परीक्षा बिंदु:",
      [
        "सामान्य ज्ञान:",
      ],
    );

  const staticGK =
    extractSection(
      text,
      "सामान्य ज्ञान:",
      [
        "प्रश्नोत्तर (MCQs):",
      ],
    );

  const mcqs =
    extractSection(
      text,
      "प्रश्नोत्तर (MCQs):",
      [],
    );

  return {
    title,
    whyInNews,
    keyFacts,
    examPoint,
    staticGK,
    mcqs,
  };
}

function htmlToPlainText(
  html: string,
) {
  return html
    .replace(
      /<br\s*\/?>/gi,
      "\n",
    )
    .replace(
      /<\/p>/gi,
      "\n",
    )
    .replace(
      /<li>/gi,
      "• ",
    )
    .replace(
      /<\/li>/gi,
      "\n",
    )
    .replace(
      /<[^>]*>/g,
      "",
    )
    .replace(
      /&nbsp;/g,
      " ",
    )
    .replace(
      /&amp;/g,
      "&",
    )
    .replace(
      /&lt;/g,
      "<",
    )
    .replace(
      /&gt;/g,
      ">",
    )
    .replace(
      /\n{3,}/g,
      "\n\n",
    )
    .trim();
}

function extractSection(
  text: string,
  startLabel: string,
  endLabels: string[],
) {
  const startIndex =
    text.indexOf(startLabel);

  if (startIndex === -1) {
    return "";
  }

  const contentStart =
    startIndex +
    startLabel.length;

  let endIndex =
    text.length;

  for (
    const label of endLabels
  ) {
    const index =
      text.indexOf(
        label,
        contentStart,
      );

    if (
      index !== -1 &&
      index < endIndex
    ) {
      endIndex = index;
    }
  }

  return text
    .slice(
      contentStart,
      endIndex,
    )
    .trim();
}

/* =========================================
   PARSE ENGLISH MCQ
========================================= */

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

/* =========================================
   ENGLISH MCQ CARD
========================================= */

function MCQCard({
  mcq,
  number,
}: {
  mcq: MCQ;
  number: number;
}) {
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
              "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900";

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

/* =========================================
   DETAIL SECTION
========================================= */

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

function HindiDetailSection({
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
