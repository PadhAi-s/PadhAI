import {
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

/* =====================================================
   TYPES
===================================================== */

interface RevisionCard {
  id: string;
  title: string;
  content: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface RevisionResult {
  topic: string;
  subject: string;
  difficulty: string;
  cards: RevisionCard[];
  questions: QuizQuestion[];
}

/* =====================================================
   COMPONENT
===================================================== */

export function FastRevision() {
  const navigate = useNavigate();

  /* =====================================================
     FORM STATE
  ===================================================== */

  const [subject, setSubject] =
    useState("");

  const [topic, setTopic] =
    useState("");

  const [difficulty, setDifficulty] =
    useState("medium");

  const [cardCount, setCardCount] =
    useState(8);

  /* =====================================================
     RESULT STATE
  ===================================================== */

  const [result, setResult] =
    useState<RevisionResult | null>(
      null,
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =====================================================
     QUIZ STATE
  ===================================================== */

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

  const [score, setScore] =
    useState(0);

  const [quizFinished, setQuizFinished] =
    useState(false);

  /* =====================================================
     GENERATE REVISION
  ===================================================== */

  async function generateRevision(
    event?: FormEvent,
  ) {
    event?.preventDefault();

    const cleanSubject =
      subject.trim();

    const cleanTopic =
      topic.trim();

    if (!cleanSubject) {
      setError(
        "Please enter a subject.",
      );
      return;
    }

    if (!cleanTopic) {
      setError(
        "Please enter a topic.",
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    setCurrentQuestion(0);
    setSelectedAnswer("");
    setScore(0);
    setQuizFinished(false);

    try {
      console.log(
        "[FastRevision] Calling generate-revision...",
        {
          subject: cleanSubject,
          topic: cleanTopic,
          difficulty,
          cardCount,
        },
      );

      const {
        data,
        error: functionError,
      } =
        await supabase.functions.invoke(
          "generate-revision",
          {
            body: {
              subject: cleanSubject,
              topic: cleanTopic,
              difficulty,
              cardCount,
            },
          },
        );

      console.log(
        "[FastRevision] Edge Function response:",
        data,
      );

      if (functionError) {
        console.error(
          "[FastRevision] Edge Function error:",
          functionError,
        );

        throw new Error(
          functionError.message ||
            "Revision generate nahi ho paya.",
        );
      }

      if (!data) {
        throw new Error(
          "Edge Function ne empty response diya.",
        );
      }

      /*
       * Backend kabhi:
       *
       * { cards: [], questions: [] }
       *
       * ya
       *
       * { revision: { cards: [], questions: [] } }
       *
       * return kar sakta hai.
       */

      const payload =
        data?.revision ??
        data?.data ??
        data;

      const rawCards =
        Array.isArray(
          payload?.cards,
        )
          ? payload.cards
          : Array.isArray(
                payload?.flashcards,
              )
            ? payload.flashcards
            : [];

      const rawQuestions =
        Array.isArray(
          payload?.questions,
        )
          ? payload.questions
          : Array.isArray(
                payload?.quiz,
              )
            ? payload.quiz
            : Array.isArray(
                  payload?.mcqs,
                )
              ? payload.mcqs
              : [];

      const cards =
        normalizeCards(rawCards);

      const questions =
        normalizeQuestions(
          rawQuestions,
        );

      /*
       * Agar backend response unexpected hai
       * to user ko clear error dikhao.
       */

      if (
        cards.length === 0 &&
        questions.length === 0
      ) {
        console.error(
          "[FastRevision] Unexpected response:",
          data,
        );

        throw new Error(
          "Revision data nahi mila. Console me Edge Function response check karo.",
        );
      }

      setResult({
        subject:
          typeof payload?.subject ===
          "string"
            ? payload.subject
            : cleanSubject,

        topic:
          typeof payload?.topic ===
          "string"
            ? payload.topic
            : cleanTopic,

        difficulty:
          typeof payload?.difficulty ===
          "string"
            ? payload.difficulty
            : difficulty,

        cards,
        questions,
      });
    } catch (err) {
      console.error(
        "[FastRevision] Load Error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate revision.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     QUIZ ANSWER
  ===================================================== */

  function submitAnswer() {
    if (
      !result ||
      !result.questions.length ||
      !selectedAnswer
    ) {
      return;
    }

    const question =
      result.questions[
        currentQuestion
      ];

    if (!question) {
      return;
    }

    if (
      normalizeText(
        selectedAnswer,
      ) ===
      normalizeText(
        question.answer,
      )
    ) {
      setScore(
        (previous) =>
          previous + 1,
      );
    }

    if (
      currentQuestion <
      result.questions.length - 1
    ) {
      setCurrentQuestion(
        (previous) =>
          previous + 1,
      );

      setSelectedAnswer("");
    } else {
      setQuizFinished(true);
    }
  }

  /* =====================================================
     RESET
  ===================================================== */

  function resetRevision() {
    setResult(null);
    setError("");

    setCurrentQuestion(0);
    setSelectedAnswer("");
    setScore(0);
    setQuizFinished(false);
  }

  /* =====================================================
     CURRENT QUESTION
  ===================================================== */

  const question =
    result?.questions[
      currentQuestion
    ];

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
                Fast Revision
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

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg sm:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="max-w-3xl">

              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
                ⚡ FAST REVISION
              </span>

              <h2 className="mt-4 text-3xl font-black sm:text-4xl">
                Revise Faster. Remember Better.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Enter a subject and topic.
                Vidhya will prepare quick
                revision cards and practice
                questions for you.
              </p>

            </div>

            <div className="hidden text-7xl md:block">
              ⚡
            </div>

          </div>

        </section>

        {/* =================================================
            GENERATOR FORM
        ================================================= */}

        {!result && (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                Create Revision
              </p>

              <h2 className="mt-1 text-2xl font-black">
                What do you want to revise?
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Topic jitna specific hoga,
                revision utna useful hoga.
              </p>
            </div>

            <form
              onSubmit={generateRevision}
              className="mt-6 space-y-5"
            >

              {/* SUBJECT */}

              <div>
                <label
                  htmlFor="revision-subject"
                  className="mb-2 block text-sm font-bold"
                >
                  Subject
                </label>

                <input
                  id="revision-subject"
                  type="text"
                  value={subject}
                  onChange={(event) =>
                    setSubject(
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Polity, History, Geography"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* TOPIC */}

              <div>
                <label
                  htmlFor="revision-topic"
                  className="mb-2 block text-sm font-bold"
                >
                  Topic
                </label>

                <input
                  id="revision-topic"
                  type="text"
                  value={topic}
                  onChange={(event) =>
                    setTopic(
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Fundamental Rights"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* OPTIONS */}

              <div className="grid gap-5 sm:grid-cols-2">

                {/* DIFFICULTY */}

                <div>
                  <label
                    htmlFor="revision-difficulty"
                    className="mb-2 block text-sm font-bold"
                  >
                    Difficulty
                  </label>

                  <select
                    id="revision-difficulty"
                    value={difficulty}
                    onChange={(event) =>
                      setDifficulty(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="easy">
                      Easy
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="hard">
                      Hard
                    </option>
                  </select>
                </div>

                {/* CARD COUNT */}

                <div>
                  <label
                    htmlFor="revision-card-count"
                    className="mb-2 block text-sm font-bold"
                  >
                    Revision Cards
                  </label>

                  <select
                    id="revision-card-count"
                    value={cardCount}
                    onChange={(event) =>
                      setCardCount(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value={5}>
                      5 Cards
                    </option>

                    <option value={8}>
                      8 Cards
                    </option>

                    <option value={10}>
                      10 Cards
                    </option>

                    <option value={15}>
                      15 Cards
                    </option>
                  </select>
                </div>

              </div>

              {/* ERROR */}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">

                  <p className="font-bold text-red-700 dark:text-red-300">
                    ⚠️ Revision generate nahi hua
                  </p>

                  <p className="mt-1 break-words text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>

                  <p className="mt-2 text-xs text-red-500 dark:text-red-400">
                    Browser Console me
                    [FastRevision] logs bhi
                    check kar sakte ho.
                  </p>

                </div>
              )}

              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Generating Revision...
                  </>
                ) : (
                  <>
                    ⚡ Generate Fast Revision
                  </>
                )}
              </button>

            </form>

          </section>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <section className="mt-6 rounded-3xl border border-blue-100 bg-white p-10 text-center shadow-sm dark:border-blue-900/50 dark:bg-slate-900">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl dark:bg-blue-950/40">
              ⚡
            </div>

            <h3 className="mt-5 text-lg font-black">
              Vidhya is preparing your revision...
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Important concepts, quick facts
              and questions prepare ho rahe hain.
            </p>

          </section>
        )}

        {/* =================================================
            REVISION RESULT
        ================================================= */}

        {!loading && result && (
          <>

            {/* RESULT HEADER */}

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                    Revision Ready
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    {result.topic}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {result.subject} •{" "}
                    {result.difficulty}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetRevision}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  ← New Revision
                </button>

              </div>

            </section>

            {/* =================================================
                REVISION CARDS
            ================================================= */}

            {result.cards.length > 0 && (
              <section className="mt-6">

                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                    Quick Notes
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    Revision Cards
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  {result.cards.map(
                    (card, index) => (
                      <article
                        key={card.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                      >

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-black text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                            {index + 1}
                          </div>

                          <h3 className="font-black leading-5">
                            {card.title ||
                              `Revision Point ${
                                index + 1
                              }`}
                          </h3>

                        </div>

                        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {card.content}
                        </p>

                      </article>
                    ),
                  )}

                </div>

              </section>
            )}

            {/* =================================================
                QUIZ
            ================================================= */}

            {result.questions.length >
              0 && (
              <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-600 dark:text-green-400">
                      Practice Quiz
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      Test Yourself 📝
                    </h2>
                  </div>

                  {!quizFinished && (
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      Question{" "}
                      {currentQuestion +
                        1}{" "}
                      /{" "}
                      {
                        result.questions
                          .length
                      }
                    </span>
                  )}

                </div>

                {/* QUIZ FINISHED */}

                {quizFinished ? (
                  <div className="mt-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center dark:from-blue-950/30 dark:to-indigo-950/30">

                    <div className="text-5xl">
                      🎉
                    </div>

                    <h3 className="mt-4 text-2xl font-black">
                      Quiz Complete!
                    </h3>

                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                      Your Score
                    </p>

                    <div className="mt-2 text-4xl font-black text-blue-600 dark:text-blue-400">
                      {score} /{" "}
                      {
                        result.questions
                          .length
                      }
                    </div>

                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                      Revision dobara karo aur
                      score improve karo.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentQuestion(
                          0,
                        );
                        setSelectedAnswer(
                          "",
                        );
                        setScore(0);
                        setQuizFinished(
                          false,
                        );
                      }}
                      className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      🔄 Retry Quiz
                    </button>

                  </div>
                ) : question ? (
                  <div className="mt-8">

                    {/* QUESTION */}

                    <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">

                      <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                        Question{" "}
                        {currentQuestion +
                          1}
                      </p>

                      <h3 className="mt-3 text-lg font-black leading-7">
                        {question.question}
                      </h3>

                    </div>

                    {/* OPTIONS */}

                    <div className="mt-5 space-y-3">

                      {question.options.map(
                        (
                          option,
                          optionIndex,
                        ) => {
                          const isSelected =
                            selectedAnswer ===
                            option;

                          return (
                            <button
                              key={`${question.id}-${optionIndex}`}
                              type="button"
                              onClick={() =>
                                setSelectedAnswer(
                                  option,
                                )
                              }
                              className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm font-semibold transition ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-200"
                                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                              }`}
                            >

                              <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                                  isSelected
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                }`}
                              >
                                {String.fromCharCode(
                                  65 +
                                    optionIndex,
                                )}
                              </span>

                              <span className="pt-1">
                                {option}
                              </span>

                            </button>
                          );
                        },
                      )}

                    </div>

                    {/* SUBMIT */}

                    <button
                      type="button"
                      disabled={
                        !selectedAnswer
                      }
                      onClick={
                        submitAnswer
                      }
                      className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {currentQuestion ===
                      result.questions
                        .length -
                        1
                        ? "Finish Quiz →"
                        : "Next Question →"}
                    </button>

                  </div>
                ) : null}

              </section>
            )}

            {/* =================================================
                NO QUIZ / NO CARDS
            ================================================= */}

            {result.cards.length ===
              0 &&
              result.questions.length ===
                0 && (
                <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900/50 dark:bg-amber-950/30">

                  <div className="text-4xl">
                    📚
                  </div>

                  <h3 className="mt-3 font-bold">
                    Revision content nahi mila
                  </h3>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Please try another topic.
                  </p>

                </section>
              )}

          </>
        )}

        {/* =================================================
            BOTTOM TIP
        ================================================= */}

        <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-950/30">

          <h3 className="font-bold text-blue-900 dark:text-blue-200">
            💡 Revision Tip
          </h3>

          <p className="mt-2 text-sm leading-6 text-blue-800 dark:text-blue-300">
            Pehle quick revision cards padho,
            phir bina dekhe quiz attempt karo.
            Galat answers ko dobara revise karna
            retention improve karta hai.
          </p>

        </section>

      </main>

    </div>
  );
}

/* =====================================================
   NORMALIZE CARDS
===================================================== */

function normalizeCards(
  value: unknown,
): RevisionCard[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
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

      const title =
        typeof row.title ===
        "string"
          ? row.title.trim()
          : typeof row.heading ===
              "string"
            ? row.heading.trim()
            : typeof row.name ===
                "string"
              ? row.name.trim()
              : "";

      const content =
        typeof row.content ===
        "string"
          ? row.content.trim()
          : typeof row.text ===
              "string"
            ? row.text.trim()
            : typeof row.description ===
                "string"
              ? row.description.trim()
              : typeof row.fact ===
                  "string"
                ? row.fact.trim()
                : "";

      if (!content) {
        return null;
      }

      return {
        id:
          typeof row.id ===
          "string"
            ? row.id
            : String(index + 1),

        title:
          title ||
          `Revision Point ${
            index + 1
          }`,

        content,
      };
    })
    .filter(
      (
        item,
      ): item is RevisionCard =>
        item !== null,
    );
}

/* =====================================================
   NORMALIZE QUESTIONS
===================================================== */

function normalizeQuestions(
  value: unknown,
): QuizQuestion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
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
          : typeof row.q ===
              "string"
            ? row.q.trim()
            : "";

      const rawOptions =
        Array.isArray(
          row.options,
        )
          ? row.options
          : Array.isArray(
                row.choices,
              )
            ? row.choices
            : [];

      const options =
        rawOptions
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
          .filter(Boolean);

      const answer =
        typeof row.answer ===
        "string"
          ? row.answer.trim()
          : typeof row.correct_answer ===
              "string"
            ? row.correct_answer.trim()
            : typeof row.correctAnswer ===
                "string"
              ? row.correctAnswer.trim()
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

      /*
       * Answer agar A/B/C/D format me hai
       * to corresponding option ko use karenge.
       */

      let normalizedAnswer =
        answer;

      const answerUpper =
        answer.toUpperCase();

      if (
        /^[ABCD]$/.test(
          answerUpper,
        )
      ) {
        const answerIndex =
          answerUpper.charCodeAt(
            0,
          ) - 65;

        normalizedAnswer =
          options[
            answerIndex
          ] ?? answer;
      }

      return {
        id:
          typeof row.id ===
          "string"
            ? row.id
            : String(index + 1),

        question,

        options,

        answer:
          normalizedAnswer,

        explanation,
      };
    })
    .filter(
      (
        item,
      ): item is QuizQuestion =>
        item !== null,
    );
}

/* =====================================================
   TEXT NORMALIZER
===================================================== */

function normalizeText(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default FastRevision;
