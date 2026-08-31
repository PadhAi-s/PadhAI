import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Difficulty = "Easy" | "Medium" | "Hard";
type Mode = "flashcards" | "quiz";

interface RevisionCard {
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

interface QuizQuestion {
  id: string;
  question_en: string;
  question_hi: string;
  options: {
    en: string;
    hi: string;
  }[];
  correctAnswer: number;
  explanation_en: string;
  explanation_hi: string;
}

interface RevisionData {
  cards: RevisionCard[];
  quiz: QuizQuestion[];
}

const cardOptions = [5, 10, 20];

export function QuickRevision() {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] =
    useState<Difficulty>("Medium");

  const [cardCount, setCardCount] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] =
    useState<RevisionData | null>(null);

  const [mode, setMode] =
    useState<Mode>("flashcards");

  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const [quizIndex, setQuizIndex] = useState(0);

  const [selectedAnswers, setSelectedAnswers] =
    useState<Record<number, number>>({});

  const [showResult, setShowResult] =
    useState(false);

  async function generateRevision() {
    if (!topic.trim()) {
      setError("Please enter a topic / कृपया टॉपिक लिखें");
      return;
    }

    setLoading(true);
    setError("");

    try {
      /*
       ==========================================

       FUTURE AI BACKEND CONNECTION

       Replace sampleRevisionData() with:

       const { data, error } =
         await supabase.functions.invoke(
           "generate-revision",
           {
             body: {
               subject,
               topic,
               difficulty,
               cardCount,
             },
           },
         );

       if (error) throw error;

       setData(data);

       ==========================================
      */

      await new Promise((resolve) =>
        setTimeout(resolve, 1500),
      );

      const generatedData =
        sampleRevisionData(
          subject,
          topic,
          difficulty,
          cardCount,
        );

      setData(generatedData);

      setMode("flashcards");
      setCardIndex(0);
      setQuizIndex(0);
      setFlipped(false);
      setSelectedAnswers({});
      setShowResult(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate revision.",
      );
    } finally {
      setLoading(false);
    }
  }

  function nextCard() {
    if (!data) return;

    if (cardIndex < data.cards.length - 1) {
      setCardIndex((value) => value + 1);
      setFlipped(false);
    }
  }

  function previousCard() {
    if (cardIndex > 0) {
      setCardIndex((value) => value - 1);
      setFlipped(false);
    }
  }

  function startQuiz() {
    setMode("quiz");
    setQuizIndex(0);
    setSelectedAnswers({});
    setShowResult(false);
  }

  function selectAnswer(answerIndex: number) {
    setSelectedAnswers((previous) => ({
      ...previous,
      [quizIndex]: answerIndex,
    }));
  }

  function nextQuestion() {
    if (!data) return;

    if (quizIndex < data.quiz.length - 1) {
      setQuizIndex((value) => value + 1);
    } else {
      setShowResult(true);
    }
  }

  function previousQuestion() {
    if (quizIndex > 0) {
      setQuizIndex((value) => value - 1);
    }
  }

  function restart() {
    setData(null);
    setSubject("");
    setTopic("");
    setDifficulty("Medium");
    setCardCount(10);
    setCardIndex(0);
    setQuizIndex(0);
    setSelectedAnswers({});
    setShowResult(false);
    setFlipped(false);
    setError("");
  }

  function calculateScore() {
    if (!data) return 0;

    return data.quiz.reduce(
      (score, question, index) => {
        return selectedAnswers[index] ===
          question.correctAnswer
          ? score + 1
          : score;
      },
      0,
    );
  }

  /*
   ===============================
   SETUP SCREEN
   ===============================
  */

  if (!data && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
        <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
          <button
            type="button"
            onClick={() =>
              navigate("/student/dashboard")
            }
            className="mb-8 text-sm font-semibold text-slate-500 transition hover:text-blue-600 dark:text-slate-400"
          >
            ← Back to Dashboard
          </button>

          <div className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-xl shadow-purple-100/50 dark:border-purple-900/40 dark:bg-slate-900 dark:shadow-none">
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 px-6 py-8 text-white sm:px-10">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur">
                  ⚡
                </div>

                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-purple-100">
                    AI Powered Learning
                  </p>

                  <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                    Quick Revision
                  </h1>

                  <p className="mt-3 max-w-2xl text-purple-100">
                    Revise any topic with bilingual
                    AI flashcards and practice quiz.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-10">
              <div className="grid gap-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Subject / विषय
                  </label>

                  <input
                    type="text"
                    value={subject}
                    onChange={(event) =>
                      setSubject(event.target.value)
                    }
                    placeholder="Example: Polity, History, Science..."
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-purple-950"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Topic / टॉपिक *
                  </label>

                  <input
                    type="text"
                    value={topic}
                    onChange={(event) =>
                      setTopic(event.target.value)
                    }
                    placeholder="Type ANY topic... Example: Indian Constitution"
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-purple-950"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Difficulty / कठिनाई
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {(
                      [
                        "Easy",
                        "Medium",
                        "Hard",
                      ] as Difficulty[]
                    ).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setDifficulty(item)
                        }
                        className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                          difficulty === item
                            ? "border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none"
                            : "border-slate-200 bg-white text-slate-600 hover:border-purple-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Revision Cards / कार्ड्स
                  </p>

                  <div className="mt-3 flex gap-3">
                    {cardOptions.map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() =>
                          setCardCount(count)
                        }
                        className={`flex-1 rounded-xl border py-3 font-bold transition ${
                          cardCount === count
                            ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                            : "border-slate-200 text-slate-600 hover:border-purple-300 dark:border-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-950/30 dark:text-red-300">
                    ❌ {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={generateRevision}
                  className="rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-purple-200 transition hover:scale-[1.01] hover:shadow-xl dark:shadow-none"
                >
                  ✨ Generate AI Revision
                </button>

                <div className="grid gap-3 border-t border-slate-100 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:grid-cols-3">
                  <p>🃏 Flashcards</p>
                  <p>🌐 English + हिंदी</p>
                  <p>🧠 Practice Quiz</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /*
   ===============================
   AI LOADING
   ===============================
  */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl dark:bg-slate-900">
          <div className="mx-auto flex h-20 w-20 animate-pulse items-center justify-center rounded-3xl bg-purple-100 text-4xl dark:bg-purple-950/50">
            ✨
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
            AI is preparing your revision
          </h1>

          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Creating bilingual flashcards and
            practice questions...
          </p>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-purple-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  /*
   ===============================
   RESULT SCREEN
   ===============================
  */

  if (showResult) {
    const score = calculateScore();
    const total = data.quiz.length;
    const percentage =
      total > 0
        ? Math.round((score / total) * 100)
        : 0;

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
        <main className="mx-auto max-w-3xl">
          <div className="rounded-3xl bg-white p-6 text-center shadow-xl dark:bg-slate-900 sm:p-10">
            <div className="text-6xl">
              {percentage >= 80
                ? "🏆"
                : percentage >= 50
                  ? "👏"
                  : "💪"}
            </div>

            <p className="mt-5 text-sm font-bold uppercase tracking-wider text-purple-600">
              Revision Complete
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {topic}
            </h1>

            <div className="mx-auto mt-8 flex h-36 w-36 items-center justify-center rounded-full border-8 border-purple-100 bg-purple-50 dark:border-purple-950 dark:bg-purple-950/30">
              <div>
                <p className="text-4xl font-black text-purple-700 dark:text-purple-300">
                  {score}/{total}
                </p>

                <p className="text-sm font-medium text-slate-500">
                  {percentage}%
                </p>
              </div>
            </div>

            <h2 className="mt-8 text-xl font-bold text-slate-900 dark:text-white">
              Great work! 🎉
            </h2>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              You completed your flashcard revision
              and practice quiz.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setMode("quiz");
                  setQuizIndex(0);
                  setSelectedAnswers({});
                  setShowResult(false);
                }}
                className="rounded-xl border border-purple-600 px-5 py-3 font-bold text-purple-700 transition hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-950/30"
              >
                🔄 Retry Quiz
              </button>

              <button
                type="button"
                onClick={restart}
                className="rounded-xl bg-purple-600 px-5 py-3 font-bold text-white transition hover:bg-purple-700"
              >
                ✨ New Topic
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Review Answers
            </h2>

            {data.quiz.map((question, index) => {
              const selected =
                selectedAnswers[index];

              const correct =
                selected === question.correctAnswer;

              return (
                <div
                  key={question.id}
                  className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Question {index + 1}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        correct
                          ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                      }`}
                    >
                      {correct
                        ? "Correct ✓"
                        : "Incorrect ✗"}
                    </span>
                  </div>

                  <p className="mt-4 font-semibold text-slate-800 dark:text-white">
                    {question.question_en}
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {question.question_hi}
                  </p>

                  <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm dark:bg-green-950/30">
                    <span className="font-bold text-green-700 dark:text-green-300">
                      Correct Answer:{" "}
                    </span>

                    <span className="text-green-800 dark:text-green-200">
                      {
                        question.options[
                          question.correctAnswer
                        ].en
                      }
                      {" / "}
                      {
                        question.options[
                          question.correctAnswer
                        ].hi
                      }
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    <p>
                      💡 {question.explanation_en}
                    </p>

                    <p className="mt-1">
                      💡 {question.explanation_hi}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  /*
   ===============================
   FLASHCARD MODE
   ===============================
  */

  if (mode === "flashcards") {
    const card = data.cards[cardIndex];

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
        <main className="mx-auto max-w-3xl px-4 py-8">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={restart}
              className="text-sm font-semibold text-slate-500 hover:text-purple-600"
            >
              ← Exit Revision
            </button>

            <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              🃏 Flashcards
            </span>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>
                {topic || "Quick Revision"}
              </span>

              <span>
                {cardIndex + 1} / {data.cards.length}
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all"
                style={{
                  width: `${
                    ((cardIndex + 1) /
                      data.cards.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setFlipped((value) => !value)
            }
            className="mt-8 w-full text-left"
          >
            <div className="min-h-[430px] rounded-3xl border border-purple-100 bg-white p-6 shadow-xl transition hover:shadow-2xl dark:border-purple-900/40 dark:bg-slate-900 sm:p-10">
              {!flipped ? (
                <div className="flex min-h-[350px] flex-col">
                  <span className="w-fit rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                    QUESTION / प्रश्न
                  </span>

                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-2xl font-bold leading-relaxed sm:text-3xl">
                      {card.question_en}
                    </p>

                    <p className="mt-5 text-xl leading-relaxed text-slate-600 dark:text-slate-300 sm:text-2xl">
                      {card.question_hi}
                    </p>
                  </div>

                  <div className="text-center text-sm font-bold text-purple-600">
                    👆 Tap to reveal answer
                  </div>
                </div>
              ) : (
                <div className="min-h-[350px]">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-950/40 dark:text-green-300">
                    ANSWER / उत्तर
                  </span>

                  <h2 className="mt-5 text-2xl font-bold">
                    {card.answer_en}
                  </h2>

                  <p className="mt-2 text-xl text-slate-600 dark:text-slate-300">
                    {card.answer_hi}
                  </p>

                  <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
                    <p className="text-sm font-bold uppercase tracking-wide text-purple-600">
                      💡 Explanation / व्याख्या
                    </p>

                    <p className="mt-4 leading-7 text-slate-700 dark:text-slate-200">
                      {card.explanation_en}
                    </p>

                    <p className="mt-3 leading-7 text-slate-500 dark:text-slate-400">
                      {card.explanation_hi}
                    </p>
                  </div>

                  <div className="mt-6 text-center text-sm font-bold text-purple-600">
                    👆 Tap to see question again
                  </div>
                </div>
              )}
            </div>
          </button>

          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={cardIndex === 0}
              onClick={previousCard}
              className="rounded-xl border border-slate-200 px-5 py-3 font-bold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              ← Previous
            </button>

            {cardIndex === data.cards.length - 1 ? (
              <button
                type="button"
                onClick={startQuiz}
                className="rounded-xl bg-purple-600 px-5 py-3 font-bold text-white transition hover:bg-purple-700"
              >
                Start Quiz 🧠 →
              </button>
            ) : (
              <button
                type="button"
                onClick={nextCard}
                className="rounded-xl bg-purple-600 px-5 py-3 font-bold text-white transition hover:bg-purple-700"
              >
                Next →
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  /*
   ===============================
   QUIZ MODE
   ===============================
  */

  const question = data.quiz[quizIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              setMode("flashcards")
            }
            className="text-sm font-semibold text-slate-500 hover:text-purple-600"
          >
            ← Flashcards
          </button>

          <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            🧠 Practice Quiz
          </span>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900 sm:p-8">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>
              Question {quizIndex + 1}
            </span>

            <span>
              {data.quiz.length} Total
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-indigo-600"
              style={{
                width: `${
                  ((quizIndex + 1) /
                    data.quiz.length) *
                  100
                }%`,
              }}
            />
          </div>

          <h1 className="mt-8 text-2xl font-bold leading-relaxed">
            {question.question_en}
          </h1>

          <p className="mt-3 text-xl leading-relaxed text-slate-600 dark:text-slate-300">
            {question.question_hi}
          </p>

          <div className="mt-8 space-y-3">
            {question.options.map(
              (option, index) => {
                const selected =
                  selectedAnswers[quizIndex] ===
                  index;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      selectAnswer(index)
                    }
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100 dark:bg-indigo-950/30 dark:ring-indigo-950"
                        : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex gap-4">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          selected
                            ? "bg-indigo-600 text-white"
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

          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={quizIndex === 0}
              onClick={previousQuestion}
              className="rounded-xl border border-slate-200 px-5 py-3 font-bold disabled:opacity-40 dark:border-slate-700"
            >
              ← Previous
            </button>

            <button
              type="button"
              disabled={
                selectedAnswers[quizIndex] ===
                undefined
              }
              onClick={nextQuestion}
              className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {quizIndex ===
              data.quiz.length - 1
                ? "Finish Quiz 🏁"
                : "Next →"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/*
=============================================
TEMPORARY SAMPLE DATA

AI backend connect होने के बाद
यह function हटाया जा सकता है.
=============================================
*/

function sampleRevisionData(
  subject: string,
  topic: string,
  difficulty: Difficulty,
  cardCount: number,
): RevisionData {
  const safeTopic =
    topic || "General Knowledge";

  const cards: RevisionCard[] = Array.from(
    { length: cardCount },
    (_, index) => ({
      id: `card-${index + 1}`,

      topic: safeTopic,

      question_en:
        index === 0
          ? `What is an important concept related to ${safeTopic}?`
          : `Important revision question ${
              index + 1
            } about ${safeTopic}.`,

      question_hi:
        index === 0
          ? `${safeTopic} से संबंधित एक महत्वपूर्ण अवधारणा क्या है?`
          : `${safeTopic} के बारे में महत्वपूर्ण रिवीजन प्रश्न ${
              index + 1
            }।`,

      answer_en:
        `Important concept ${
          index + 1
        } of ${safeTopic}`,

      answer_hi:
        `${safeTopic} की महत्वपूर्ण अवधारणा ${
          index + 1
        }`,

      explanation_en:
        `This flashcard helps you revise an important concept related to ${safeTopic}. The AI backend will generate accurate topic-specific content.`,

      explanation_hi:
        `यह फ्लैशकार्ड ${safeTopic} से संबंधित महत्वपूर्ण अवधारणा को दोहराने में मदद करता है। AI बैकएंड वास्तविक और टॉपिक-विशिष्ट सामग्री तैयार करेगा।`,

      difficulty,
    }),
  );

  const quiz: QuizQuestion[] = cards.map(
    (card, index) => ({
      id: `quiz-${index + 1}`,

      question_en:
        `Which option best relates to ${safeTopic}?`,

      question_hi:
        `${safeTopic} से संबंधित सबसे सही विकल्प कौन सा है?`,

      options: [
        {
          en: `Concept ${index + 1}`,
          hi: `अवधारणा ${index + 1}`,
        },

        {
          en: "Option B",
          hi: "विकल्प B",
        },

        {
          en: "Option C",
          hi: "विकल्प C",
        },

        {
          en: "Option D",
          hi: "विकल्प D",
        },
      ],

      correctAnswer: 0,

      explanation_en:
        `Concept ${index + 1} is the correct answer for this generated revision question.`,

      explanation_hi:
        `इस रिवीजन प्रश्न के लिए अवधारणा ${
          index + 1
        } सही उत्तर है।`,
    }),
  );

  return {
    cards,
    quiz,
  };
}

export default QuickRevision;
