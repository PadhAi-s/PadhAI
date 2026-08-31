import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";

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

interface RevisionResponse {
  cards: FlashCard[];
  quiz: QuizQuestion[];
}

export function QuickRevision() {
  const navigate = useNavigate();

  /* FORM */
  const [subject, setSubject] =
    useState("General Knowledge");

  const [topic, setTopic] =
    useState("");

  const [difficulty, setDifficulty] =
    useState<Difficulty>("Medium");

  const [cardCount, setCardCount] =
    useState(10);

  /* AI DATA */
  const [cards, setCards] =
    useState<FlashCard[]>([]);

  const [quiz, setQuiz] =
    useState<QuizQuestion[]>([]);

  /* UI STATES */
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [started, setStarted] =
    useState(false);

  const [mode, setMode] =
    useState<"cards" | "quiz" | "result">(
      "cards",
    );

  const [currentCard, setCurrentCard] =
    useState(0);

  const [showAnswer, setShowAnswer] =
    useState(false);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState<number | null>(null);

  const [answers, setAnswers] =
    useState<number[]>([]);

  /* GENERATE AI REVISION */
  async function handleGenerate(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!topic.trim()) {
      setError(
        "Please enter a topic / कृपया एक टॉपिक लिखें",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      setCards([]);
      setQuiz([]);

      setCurrentCard(0);
      setCurrentQuestion(0);

      setShowAnswer(false);
      setSelectedAnswer(null);

      setAnswers([]);

      const { data, error: functionError } =
        await supabase.functions.invoke(
          "generate-revision",
          {
            body: {
              subject,
              topic: topic.trim(),
              difficulty,
              cardCount,
            },
          },
        );

      if (functionError) {
        throw new Error(
          functionError.message ||
            "Unable to connect to AI service.",
        );
      }

      if (!data) {
        throw new Error(
          "No response received from AI.",
        );
      }

      const result =
        data as RevisionResponse;

      if (
        !Array.isArray(result.cards) ||
        !Array.isArray(result.quiz)
      ) {
        throw new Error(
          "Invalid revision data received.",
        );
      }

      if (
        result.cards.length === 0 ||
        result.quiz.length === 0
      ) {
        throw new Error(
          "AI did not generate enough revision content.",
        );
      }

      setCards(result.cards);
      setQuiz(result.quiz);

      setStarted(true);
      setMode("cards");
    } catch (err) {
      console.error(
        "Quick Revision Error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate revision. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* FLASHCARD NEXT */
  function handleNextCard() {
    setShowAnswer(false);

    if (currentCard < cards.length - 1) {
      setCurrentCard(
        (previous) => previous + 1,
      );
      return;
    }

    setMode("quiz");

    setCurrentQuestion(0);
    setSelectedAnswer(null);
  }

  function handlePreviousCard() {
    if (currentCard <= 0) {
      return;
    }

    setShowAnswer(false);

    setCurrentCard(
      (previous) => previous - 1,
    );
  }

  /* QUIZ ANSWER */
  function handleSelectAnswer(
    answerIndex: number,
  ) {
    if (selectedAnswer !== null) {
      return;
    }

    setSelectedAnswer(answerIndex);
  }

  /* NEXT QUESTION */
  function handleNextQuestion() {
    if (selectedAnswer === null) {
      return;
    }

    const updatedAnswers = [
      ...answers,
      selectedAnswer,
    ];

    setAnswers(updatedAnswers);

    if (
      currentQuestion <
      quiz.length - 1
    ) {
      setCurrentQuestion(
        (previous) => previous + 1,
      );

      setSelectedAnswer(null);

      return;
    }

    setMode("result");
  }

  /* RESTART */
  function handleRestart() {
    setStarted(false);

    setCards([]);
    setQuiz([]);

    setMode("cards");

    setCurrentCard(0);
    setCurrentQuestion(0);

    setShowAnswer(false);
    setSelectedAnswer(null);

    setAnswers([]);
    setError("");

    setTopic("");
  }

  /* SCORE */
  const score = answers.reduce(
    (total, answer, index) => {
      if (
        quiz[index] &&
        answer === quiz[index].correctAnswer
      ) {
        return total + 1;
      }

      return total;
    },
    0,
  );

  /* ============================= */
  /* FORM SCREEN */
  /* ============================= */

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-white">
        <div className="mx-auto max-w-5xl">

          {/* BACK */}
          <button
            type="button"
            onClick={() =>
              navigate("/student/dashboard")
            }
            className="mb-5 text-sm font-semibold text-slate-600 transition hover:text-blue-600 dark:text-slate-300"
          >
            ← Back to Dashboard
          </button>

          {/* HERO */}
          <div className="overflow-hidden rounded-t-3xl bg-gradient-to-r from-purple-700 via-violet-600 to-blue-600 px-6 py-8 text-white shadow-xl sm:px-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold backdrop-blur">
              ⚡ AI Powered Revision
            </div>

            <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
              Quick Revision
            </h1>

            <p className="mt-3 text-sm text-purple-100 sm:text-base">
              Enter any topic and let AI generate bilingual
              flashcards and MCQ questions.
            </p>

            <p className="mt-1 text-sm text-purple-100">
              किसी भी टॉपिक को जल्दी और आसान तरीके से रिवाइज करें।
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleGenerate}
            className="rounded-b-3xl bg-white p-5 shadow-xl dark:bg-slate-900 sm:p-8"
          >
            <div className="grid gap-5 md:grid-cols-2">

              {/* SUBJECT */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  📚 Subject / विषय
                </label>

                <input
                  type="text"
                  value={subject}
                  onChange={(event) =>
                    setSubject(
                      event.target.value,
                    )
                  }
                  placeholder="General Knowledge"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-purple-950"
                />
              </div>

              {/* DIFFICULTY */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  🎯 Difficulty / कठिनाई
                </label>

                <select
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(
                      event.target
                        .value as Difficulty,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-purple-950"
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
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                🧠 Topic / टॉपिक
              </label>

              <textarea
                value={topic}
                onChange={(event) =>
                  setTopic(
                    event.target.value,
                  )
                }
                placeholder="Example: Indian Constitution Fundamental Rights / भारतीय संविधान के मौलिक अधिकार"
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-purple-950"
              />
            </div>

            {/* CARD COUNT */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                🔢 Number of Cards / कार्डों की संख्या
              </label>

              <select
                value={cardCount}
                onChange={(event) =>
                  setCardCount(
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800"
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
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 dark:border-red-900 dark:bg-red-950/30">
                ⚠️ {error}
              </div>
            )}

            {/* START BUTTON */}
            <button
              type="submit"
              disabled={
                loading ||
                !topic.trim()
              }
              className="group relative mt-6 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                {loading
                  ? "⏳"
                  : "⚡"}
              </span>

              <span>
                {loading
                  ? "Preparing Revision... / रिवीजन तैयार हो रहा है..."
                  : "Start Revision / रिवीजन शुरू करें"}
              </span>

              {!loading && (
                <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              )}
            </button>

            <p className="mt-4 text-center text-xs text-slate-400">
              AI will generate flashcards and MCQs automatically.
            </p>
          </form>
        </div>
      </div>
    );
  }

  /* ============================= */
  /* FLASHCARDS */
  /* ============================= */

  if (
    mode === "cards" &&
    cards.length > 0
  ) {
    const card = cards[currentCard];

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl">

          {/* HEADER */}
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleRestart}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              ← New Topic
            </button>

            <span className="rounded-full bg-purple-100 px-4 py-2 text-xs font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              Flashcard {currentCard + 1} /{" "}
              {cards.length}
            </span>
          </div>

          {/* PROGRESS */}
          <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all"
              style={{
                width: `${
                  ((currentCard + 1) /
                    cards.length) *
                  100
                }%`,
              }}
            />
          </div>

          {/* CARD */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-slate-900">

            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-5 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-100">
                {card.topic}
              </p>

              <p className="mt-2 text-sm">
                {card.difficulty} Difficulty
              </p>
            </div>

            <div className="p-6 sm:p-10">
              <div className="text-center">
                <span className="text-4xl">
                  🧠
                </span>

                <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                  {card.question_en}
                </h2>

                <p className="mt-3 text-lg font-semibold text-purple-600 dark:text-purple-300">
                  {card.question_hi}
                </p>
              </div>

              {!showAnswer ? (
                <button
                  type="button"
                  onClick={() =>
                    setShowAnswer(true)
                  }
                  className="mt-8 w-full rounded-2xl bg-purple-100 px-5 py-4 font-bold text-purple-700 transition hover:bg-purple-200 dark:bg-purple-950/40 dark:text-purple-300"
                >
                  👀 Show Answer / उत्तर देखें
                </button>
              ) : (
                <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/20">
                  <h3 className="font-bold text-green-700 dark:text-green-300">
                    ✅ Answer / उत्तर
                  </h3>

                  <p className="mt-3 font-semibold text-slate-800 dark:text-white">
                    {card.answer_en}
                  </p>

                  <p className="mt-2 text-slate-600 dark:text-slate-300">
                    {card.answer_hi}
                  </p>

                  <div className="mt-5 border-t border-green-200 pt-5 dark:border-green-900">
                    <h4 className="font-bold text-slate-800 dark:text-white">
                      Explanation / व्याख्या
                    </h4>

                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {card.explanation_en}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {card.explanation_hi}
                    </p>
                  </div>
                </div>
              )}

              {/* NAVIGATION */}
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  disabled={
                    currentCard === 0
                  }
                  onClick={
                    handlePreviousCard
                  }
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  onClick={
                    handleNextCard
                  }
                  className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 font-bold text-white shadow-lg transition hover:shadow-xl"
                >
                  {currentCard ===
                  cards.length - 1
                    ? "Start Quiz / क्विज शुरू करें"
                    : "Next Card →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ============================= */
  /* QUIZ */
  /* ============================= */

  if (
    mode === "quiz" &&
    quiz.length > 0
  ) {
    const question =
      quiz[currentQuestion];

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl">

          {/* HEADER */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-purple-600">
                📝 AI Quiz
              </p>

              <p className="text-xs text-slate-500">
                Question{" "}
                {currentQuestion + 1} of{" "}
                {quiz.length}
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              MCQ Practice
            </span>
          </div>

          {/* PROGRESS */}
          <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all"
              style={{
                width: `${
                  ((currentQuestion + 1) /
                    quiz.length) *
                  100
                }%`,
              }}
            />
          </div>

          {/* QUESTION */}
          <div className="rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900 sm:p-8">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {question.question_en}
            </h1>

            <p className="mt-3 font-semibold text-purple-600 dark:text-purple-300">
              {question.question_hi}
            </p>

            {/* OPTIONS */}
            <div className="mt-8 space-y-3">
              {question.options.map(
                (option, index) => {
                  const isSelected =
                    selectedAnswer ===
                    index;

                  const isCorrect =
                    index ===
                    question.correctAnswer;

                  let className =
                    "border-slate-200 bg-white hover:border-purple-400 dark:border-slate-700 dark:bg-slate-800";

                  if (
                    selectedAnswer !==
                    null
                  ) {
                    if (isCorrect) {
                      className =
                        "border-green-500 bg-green-50 dark:bg-green-950/30";
                    } else if (
                      isSelected
                    ) {
                      className =
                        "border-red-500 bg-red-50 dark:bg-red-950/30";
                    }
                  }

                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={
                        selectedAnswer !==
                        null
                      }
                      onClick={() =>
                        handleSelectAnswer(
                          index,
                        )
                      }
                      className={`w-full rounded-2xl border p-4 text-left transition ${className}`}
                    >
                      <div className="flex gap-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold dark:bg-slate-700">
                          {String.fromCharCode(
                            65 + index,
                          )}
                        </span>

                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">
                            {option.en}
                          </p>

                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                            {option.hi}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                },
              )}
            </div>

            {/* EXPLANATION */}
            {selectedAnswer !== null && (
              <div className="mt-6 rounded-2xl bg-blue-50 p-5 dark:bg-blue-950/30">
                <p className="font-bold text-blue-700 dark:text-blue-300">
                  💡 Explanation / व्याख्या
                </p>

                <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
                  {question.explanation_en}
                </p>

                <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
                  {question.explanation_hi}
                </p>
              </div>
            )}

            {/* NEXT */}
            <button
              type="button"
              disabled={
                selectedAnswer === null
              }
              onClick={
                handleNextQuestion
              }
              className="mt-8 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4 font-bold text-white transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
            >
              {currentQuestion ===
              quiz.length - 1
                ? "See Result / परिणाम देखें"
                : "Next Question →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ============================= */
  /* RESULT */
  /* ============================= */

  if (mode === "result") {
    const percentage =
      quiz.length > 0
        ? Math.round(
            (score / quiz.length) *
              100,
          )
        : 0;

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 dark:bg-slate-950">
        <div className="w-full max-w-2xl rounded-3xl bg-white p-8 text-center shadow-xl dark:bg-slate-900">

          <div className="text-6xl">
            {percentage >= 80
              ? "🏆"
              : percentage >= 50
                ? "🎉"
                : "💪"}
          </div>

          <h1 className="mt-5 text-3xl font-bold text-slate-900 dark:text-white">
            Revision Complete!
          </h1>

          <p className="mt-2 text-slate-500">
            रिवीजन पूरा हो गया
          </p>

          {/* SCORE */}
          <div className="mx-auto mt-8 flex h-40 w-40 flex-col items-center justify-center rounded-full border-8 border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/30">
            <span className="text-4xl font-bold text-purple-600">
              {percentage}%
            </span>

            <span className="text-xs text-slate-500">
              Score
            </span>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
              <p className="text-xs text-slate-500">
                Total
              </p>

              <p className="mt-1 text-xl font-bold">
                {quiz.length}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-4 dark:bg-green-950/30">
              <p className="text-xs text-green-600">
                Correct
              </p>

              <p className="mt-1 text-xl font-bold text-green-600">
                {score}
              </p>
            </div>

            <div className="rounded-2xl bg-red-50 p-4 dark:bg-red-950/30">
              <p className="text-xs text-red-600">
                Incorrect
              </p>

              <p className="mt-1 text-xl font-bold text-red-600">
                {quiz.length - score}
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleRestart}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4 font-bold text-white transition hover:shadow-xl"
            >
              🔄 New Revision
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/student/dashboard",
                )
              }
              className="rounded-xl border border-slate-200 px-5 py-4 font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
            >
              🏠 Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default QuickRevision;
