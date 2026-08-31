import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

/* =========================
   TYPES
========================= */

type Difficulty = "Easy" | "Medium" | "Hard";

interface FlashCard {
  id: string;
  topic: string;
  question_en: string;
  question_hi: string;
  answer_en: string;
  answer_hi: string;
  explanation_en: string;
  explanation_hi: string;
  difficulty: Difficulty;
}

interface QuizOption {
  en: string;
  hi: string;
}

interface QuizQuestion {
  id: string;
  question_en: string;
  question_hi: string;
  options: QuizOption[];
  correctAnswer: number;
  explanation_en: string;
  explanation_hi: string;
}

interface RevisionData {
  cards: FlashCard[];
  quiz: QuizQuestion[];
}

interface GenerateRevisionResponse {
  success?: boolean;
  data?: RevisionData;
  cards?: FlashCard[];
  quiz?: QuizQuestion[];
  error?: string;
}

/* =========================
   COMPONENT
========================= */

export function QuickRevision() {
  const navigate = useNavigate();

  const [subject, setSubject] =
    useState("General Knowledge");

  const [topic, setTopic] =
    useState("");

  const [difficulty, setDifficulty] =
    useState<Difficulty>("Medium");

  const [cardCount, setCardCount] =
    useState(10);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [revision, setRevision] =
    useState<RevisionData | null>(null);

  const [activeTab, setActiveTab] =
    useState<"cards" | "quiz">("cards");

  /* FLASHCARD */

  const [currentCard, setCurrentCard] =
    useState(0);

  const [showAnswer, setShowAnswer] =
    useState(false);

  /* QUIZ */

  const [currentQuiz, setCurrentQuiz] =
    useState(0);

  const [selectedAnswers, setSelectedAnswers] =
    useState<Record<number, number>>({});

  const [showQuizResult, setShowQuizResult] =
    useState(false);

  /* =========================
     GENERATE REVISION
  ========================= */

  async function handleGenerate() {
    const cleanTopic = topic.trim();

    if (!cleanTopic) {
      setError(
        "Please enter a topic / कृपया एक टॉपिक लिखें।",
      );
      return;
    }

    setLoading(true);
    setError("");
    setRevision(null);

    setCurrentCard(0);
    setShowAnswer(false);

    setCurrentQuiz(0);
    setSelectedAnswers({});
    setShowQuizResult(false);

    try {
      const { data, error: functionError } =
        await supabase.functions.invoke(
          "generate-revision",
          {
            body: {
              subject,
              topic: cleanTopic,
              difficulty,
              cardCount,
            },
          },
        );

      if (functionError) {
        throw new Error(
          functionError.message ||
            "Unable to contact AI service.",
        );
      }

      const response =
        data as GenerateRevisionResponse;

      if (response?.success === false) {
        throw new Error(
          response.error ||
            "AI could not generate revision.",
        );
      }

      /*
       Supports both:

       {
         success: true,
         data: {
           cards: [],
           quiz: []
         }
       }

       AND

       {
         cards: [],
         quiz: []
       }
      */

      const result: RevisionData | undefined =
        response.data ??
        (Array.isArray(response.cards) &&
        Array.isArray(response.quiz)
          ? {
              cards: response.cards,
              quiz: response.quiz,
            }
          : undefined);

      if (
        !result ||
        !Array.isArray(result.cards) ||
        !Array.isArray(result.quiz)
      ) {
        console.error(
          "Invalid revision response:",
          data,
        );

        throw new Error(
          "Invalid AI response. Please try again.",
        );
      }

      if (
        result.cards.length === 0 ||
        result.quiz.length === 0
      ) {
        throw new Error(
          "AI returned empty revision content.",
        );
      }

      setRevision(result);
      setActiveTab("cards");
    } catch (err) {
      console.error(
        "Quick Revision error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     FLASHCARD CONTROLS
  ========================= */

  function handlePreviousCard() {
    if (!revision) return;

    setShowAnswer(false);

    setCurrentCard((previous) =>
      previous === 0
        ? revision.cards.length - 1
        : previous - 1,
    );
  }

  function handleNextCard() {
    if (!revision) return;

    setShowAnswer(false);

    setCurrentCard((previous) =>
      previous === revision.cards.length - 1
        ? 0
        : previous + 1,
    );
  }

  /* =========================
     QUIZ CONTROLS
  ========================= */

  function selectAnswer(
    questionIndex: number,
    answerIndex: number,
  ) {
    if (showQuizResult) return;

    setSelectedAnswers((previous) => ({
      ...previous,
      [questionIndex]: answerIndex,
    }));
  }

  function handlePreviousQuestion() {
    setCurrentQuiz((previous) =>
      previous === 0
        ? 0
        : previous - 1,
    );
  }

  function handleNextQuestion() {
    if (!revision) return;

    setCurrentQuiz((previous) =>
      previous === revision.quiz.length - 1
        ? previous
        : previous + 1,
    );
  }

  function handleSubmitQuiz() {
    if (!revision) return;

    if (
      Object.keys(selectedAnswers).length <
      revision.quiz.length
    ) {
      const unanswered =
        revision.quiz.findIndex(
          (_, index) =>
            selectedAnswers[index] === undefined,
        );

      if (unanswered !== -1) {
        setCurrentQuiz(unanswered);

        setError(
          `Please answer all questions. Question ${
            unanswered + 1
          } is unanswered. / कृपया सभी प्रश्नों के उत्तर दें।`,
        );

        return;
      }
    }

    setError("");
    setShowQuizResult(true);
  }

  function restartQuiz() {
    setCurrentQuiz(0);
    setSelectedAnswers({});
    setShowQuizResult(false);
    setError("");
  }

  /* =========================
     SCORE
  ========================= */

  const quizScore = useMemo(() => {
    if (!revision) return 0;

    return revision.quiz.reduce(
      (score, question, index) => {
        return selectedAnswers[index] ===
          question.correctAnswer
          ? score + 1
          : score;
      },
      0,
    );
  }, [revision, selectedAnswers]);

  const scorePercentage = useMemo(() => {
    if (!revision || revision.quiz.length === 0) {
      return 0;
    }

    return Math.round(
      (quizScore / revision.quiz.length) * 100,
    );
  }, [quizScore, revision]);

  const answeredCount =
    Object.keys(selectedAnswers).length;

  /* =========================
     CURRENT CONTENT
  ========================= */

  const card =
    revision?.cards[currentCard];

  const quizQuestion =
    revision?.quiz[currentQuiz];

  /* =========================
     UI
  ========================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/40 to-blue-50 text-slate-900 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950 dark:text-white">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            navigate("/student/dashboard")
          }
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          ← Back to Dashboard
        </button>

        {/* HERO */}

        <section className="overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-sm dark:border-purple-900/50 dark:bg-slate-900">
          <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 px-6 py-8 text-white sm:px-10 sm:py-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                ⚡ AI Powered Revision
              </div>

              <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
                Quick Revision
              </h1>

              <p className="mt-3 text-base leading-7 text-purple-100 sm:text-lg">
                Enter any topic and let AI generate
                bilingual flashcards and MCQ questions.
              </p>

              <p className="mt-2 text-sm text-purple-200">
                किसी भी टॉपिक का तेज़ और स्मार्ट
                रिवीजन करें।
              </p>
            </div>
          </div>

          {/* FORM */}

          <div className="p-5 sm:p-8">
            <div className="grid gap-5 md:grid-cols-2">
              {/* SUBJECT */}

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  📚 Subject / विषय
                </label>

                <input
                  id="subject"
                  value={subject}
                  onChange={(event) =>
                    setSubject(
                      event.target.value,
                    )
                  }
                  placeholder="Example: Science, History, Geography"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-purple-900/30"
                />
              </div>

              {/* DIFFICULTY */}

              <div>
                <label
                  htmlFor="difficulty"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  🎯 Difficulty / कठिनाई
                </label>

                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(
                      event.target
                        .value as Difficulty,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-purple-900/30"
                >
                  <option value="Easy">
                    Easy / आसान
                  </option>

                  <option value="Medium">
                    Medium / मध्यम
                  </option>

                  <option value="Hard">
                    Hard / कठिन
                  </option>
                </select>
              </div>
            </div>

            {/* TOPIC */}

            <div className="mt-5">
              <label
                htmlFor="topic"
                className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
              >
                🧠 Topic / टॉपिक
              </label>

              <textarea
                id="topic"
                value={topic}
                onChange={(event) =>
                  setTopic(event.target.value)
                }
                rows={3}
                placeholder="Example: Indian Constitution Fundamental Rights / भारतीय संविधान के मौलिक अधिकार"
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-purple-900/30"
              />
            </div>

            {/* CARD COUNT */}

            <div className="mt-5">
              <label
                htmlFor="cardCount"
                className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
              >
                🔢 Number of Cards / कार्ड की संख्या
              </label>

              <select
                id="cardCount"
                value={cardCount}
                onChange={(event) =>
                  setCardCount(
                    Number(event.target.value),
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800"
              >
                <option value={5}>
                  5 Cards
                </option>

                <option value={10}>
                  10 Cards
                </option>

                <option value={15}>
                  15 Cards
                </option>

                <option value={20}>
                  20 Cards
                </option>
              </select>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                ❌ {error}
              </div>
            )}

            {/* BUTTON */}

            <button
              type="button"
              disabled={loading}
              onClick={handleGenerate}
              className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 font-bold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="animate-spin">
                    ⏳
                  </span>

                  AI is generating your revision...
                </>
              ) : (
                <>
                  ⚡ Generate AI Revision
                </>
              )}
            </button>
          </div>
        </section>

        {/* RESULTS */}

        {revision && (
          <section className="mt-8">
            {/* TABS */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("cards");
                    setError("");
                  }}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition ${
                    activeTab === "cards"
                      ? "bg-purple-600 text-white shadow"
                      : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  🧠 Flashcards (
                  {revision.cards.length})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("quiz");
                    setError("");
                  }}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition ${
                    activeTab === "quiz"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  📝 Quiz ({revision.quiz.length})
                </button>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm font-bold text-purple-600 transition hover:bg-purple-50 disabled:opacity-50 dark:border-purple-900 dark:bg-slate-900 dark:text-purple-300 dark:hover:bg-purple-950/30"
              >
                🔄 Generate Again
              </button>
            </div>

            {/* =====================
                FLASHCARDS
            ===================== */}

            {activeTab === "cards" &&
              card && (
                <div className="mt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Card {currentCard + 1} of{" "}
                      {revision.cards.length}
                    </p>

                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                      {card.difficulty}
                    </span>
                  </div>

                  {/* CARD */}

                  <div className="overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-lg dark:border-purple-900/50 dark:bg-slate-900">
                    <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 text-white">
                      <p className="text-xs font-bold uppercase tracking-wider text-purple-200">
                        Topic
                      </p>

                      <p className="mt-1 font-semibold">
                        {card.topic}
                      </p>
                    </div>

                    <div className="min-h-[360px] p-6 sm:p-10">
                      {!showAnswer ? (
                        <div>
                          <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                            QUESTION / प्रश्न
                          </span>

                          <h2 className="mt-6 text-2xl font-bold leading-relaxed sm:text-3xl">
                            {card.question_en}
                          </h2>

                          <p className="mt-5 text-xl font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                            {card.question_hi}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              setShowAnswer(true)
                            }
                            className="mt-10 rounded-xl bg-purple-600 px-6 py-3 font-bold text-white transition hover:bg-purple-700"
                          >
                            👀 Show Answer / उत्तर देखें
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-950/40 dark:text-green-300">
                            ANSWER / उत्तर
                          </span>

                          <h2 className="mt-6 text-2xl font-bold leading-relaxed sm:text-3xl">
                            {card.answer_en}
                          </h2>

                          <p className="mt-4 text-xl font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                            {card.answer_hi}
                          </p>

                          <div className="mt-8 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
                            <h3 className="font-bold text-purple-700 dark:text-purple-300">
                              💡 Explanation / व्याख्या
                            </h3>

                            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                              {card.explanation_en}
                            </p>

                            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                              {card.explanation_hi}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setShowAnswer(false)
                            }
                            className="mt-6 rounded-xl border border-purple-300 px-5 py-3 font-bold text-purple-600 transition hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/30"
                          >
                            🔄 Show Question
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CARD NAVIGATION */}

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={handlePreviousCard}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      ← Previous
                    </button>

                    <div className="flex gap-1">
                      {revision.cards.map(
                        (_, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setCurrentCard(index);
                              setShowAnswer(false);
                            }}
                            aria-label={`Go to card ${
                              index + 1
                            }`}
                            className={`h-2.5 w-2.5 rounded-full transition ${
                              currentCard === index
                                ? "scale-125 bg-purple-600"
                                : "bg-slate-300 dark:bg-slate-700"
                            }`}
                          />
                        ),
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleNextCard}
                      className="rounded-xl bg-purple-600 px-5 py-3 font-bold text-white transition hover:bg-purple-700"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

            {/* =====================
                QUIZ
            ===================== */}

            {activeTab === "quiz" &&
              quizQuestion && (
                <div className="mt-6">
                  {!showQuizResult ? (
                    <>
                      {/* QUIZ PROGRESS */}

                      <div className="mb-5 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm dark:border-blue-900/50 dark:bg-slate-900">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold">
                              📝 Question{" "}
                              {currentQuiz + 1} of{" "}
                              {revision.quiz.length}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {answeredCount} answered
                            </p>
                          </div>

                          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {Math.round(
                              (answeredCount /
                                revision.quiz
                                  .length) *
                                100,
                            )}
                            %
                          </div>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all"
                            style={{
                              width: `${
                                (answeredCount /
                                  revision.quiz
                                    .length) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* QUESTION */}

                      <div className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm dark:border-blue-900/50 dark:bg-slate-900 sm:p-8">
                        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                          MCQ QUESTION
                        </span>

                        <h2 className="mt-5 text-xl font-bold leading-relaxed sm:text-2xl">
                          {quizQuestion.question_en}
                        </h2>

                        <p className="mt-3 text-lg font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                          {quizQuestion.question_hi}
                        </p>

                        {/* OPTIONS */}

                        <div className="mt-7 space-y-3">
                          {quizQuestion.options.map(
                            (option, index) => {
                              const isSelected =
                                selectedAnswers[
                                  currentQuiz
                                ] === index;

                              return (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() =>
                                    selectAnswer(
                                      currentQuiz,
                                      index,
                                    )
                                  }
                                  className={`w-full rounded-2xl border p-4 text-left transition ${
                                    isSelected
                                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100 dark:border-blue-500 dark:bg-blue-950/30 dark:ring-blue-900/30"
                                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-800"
                                  }`}
                                >
                                  <div className="flex gap-4">
                                    <span
                                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                        isSelected
                                          ? "bg-blue-600 text-white"
                                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                      }`}
                                    >
                                      {String.fromCharCode(
                                        65 + index,
                                      )}
                                    </span>

                                    <div>
                                      <p className="font-semibold">
                                        {option.en}
                                      </p>

                                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {option.hi}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              );
                            },
                          )}
                        </div>

                        {/* QUIZ NAV */}

                        <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                          <button
                            type="button"
                            disabled={
                              currentQuiz === 0
                            }
                            onClick={
                              handlePreviousQuestion
                            }
                            className="rounded-xl border border-slate-200 px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                          >
                            ← Previous
                          </button>

                          {currentQuiz ===
                          revision.quiz.length -
                            1 ? (
                            <button
                              type="button"
                              onClick={
                                handleSubmitQuiz
                              }
                              className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700"
                            >
                              ✅ Submit Quiz
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={
                                handleNextQuestion
                              }
                              className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
                            >
                              Next →
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* =====================
                       QUIZ RESULT
                    ===================== */

                    <div>
                      <div className="rounded-3xl border border-green-200 bg-white p-8 text-center shadow-lg dark:border-green-900/50 dark:bg-slate-900">
                        <div className="text-6xl">
                          🏆
                        </div>

                        <h2 className="mt-5 text-3xl font-bold">
                          Quiz Completed!
                        </h2>

                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                          आपका क्विज़ पूरा हो गया।
                        </p>

                        <div className="mx-auto mt-8 flex h-40 w-40 flex-col items-center justify-center rounded-full border-8 border-green-100 bg-green-50 dark:border-green-950 dark:bg-green-950/20">
                          <span className="text-4xl font-black text-green-600">
                            {scorePercentage}%
                          </span>

                          <span className="mt-1 text-sm font-bold text-green-700 dark:text-green-300">
                            Score
                          </span>
                        </div>

                        <p className="mt-6 text-xl font-bold">
                          {quizScore} /{" "}
                          {revision.quiz.length} Correct
                        </p>

                        <button
                          type="button"
                          onClick={restartQuiz}
                          className="mt-7 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
                        >
                          🔄 Try Again
                        </button>
                      </div>

                      {/* REVIEW */}

                      <div className="mt-8">
                        <h3 className="text-xl font-bold">
                          📋 Answer Review
                        </h3>

                        <div className="mt-4 space-y-4">
                          {revision.quiz.map(
                            (
                              question,
                              questionIndex,
                            ) => {
                              const selected =
                                selectedAnswers[
                                  questionIndex
                                ];

                              const isCorrect =
                                selected ===
                                question.correctAnswer;

                              return (
                                <div
                                  key={
                                    question.id
                                  }
                                  className={`rounded-2xl border p-5 ${
                                    isCorrect
                                      ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20"
                                      : "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
                                  }`}
                                >
                                  <div className="flex gap-3">
                                    <span className="text-xl">
                                      {isCorrect
                                        ? "✅"
                                        : "❌"}
                                    </span>

                                    <div className="min-w-0 flex-1">
                                      <p className="font-bold">
                                        Q
                                        {questionIndex +
                                          1}
                                        .{" "}
                                        {
                                          question.question_en
                                        }
                                      </p>

                                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                        {
                                          question.question_hi
                                        }
                                      </p>

                                      <div className="mt-4 text-sm">
                                        <p>
                                          <span className="font-bold">
                                            Your Answer:
                                          </span>{" "}
                                          {selected !==
                                          undefined
                                            ? question
                                                .options[
                                                selected
                                              ]?.en
                                            : "Not answered"}
                                        </p>

                                        <p className="mt-2 font-bold text-green-700 dark:text-green-300">
                                          Correct Answer:{" "}
                                          {
                                            question.options[
                                              question
                                                .correctAnswer
                                            ]?.en
                                          }
                                        </p>
                                      </div>

                                      <div className="mt-4 rounded-xl bg-white/70 p-4 dark:bg-slate-900/60">
                                        <p className="font-bold">
                                          💡 Explanation
                                        </p>

                                        <p className="mt-2 text-sm leading-6">
                                          {
                                            question.explanation_en
                                          }
                                        </p>

                                        <p className="mt-2 text-sm leading-6">
                                          {
                                            question.explanation_hi
                                          }
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
          </section>
        )}
      </main>
    </div>
  );
}

export default QuickRevision;
