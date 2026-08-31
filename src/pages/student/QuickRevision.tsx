import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface FlashCard {
  id: string;
  topic: string;
  question_en: string;
  question_hi: string;
  answer_en: string;
  answer_hi: string;
  explanation_en: string;
  explanation_hi: string;
  difficulty: string;
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

type Difficulty = "Easy" | "Medium" | "Hard";
type RevisionMode = "flashcards" | "quiz";

export function QuickRevision() {
  const navigate = useNavigate();

  const [subject, setSubject] =
    useState("");

  const [topic, setTopic] =
    useState("");

  const [difficulty, setDifficulty] =
    useState<Difficulty>("Medium");

  const [cardCount, setCardCount] =
    useState(10);

  const [mode, setMode] =
    useState<RevisionMode>("flashcards");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [revisionData, setRevisionData] =
    useState<RevisionData | null>(null);

  const [flashcardIndex, setFlashcardIndex] =
    useState(0);

  const [cardFlipped, setCardFlipped] =
    useState(false);

  const [quizIndex, setQuizIndex] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState<number | null>(null);

  const [quizScore, setQuizScore] =
    useState(0);

  const [quizFinished, setQuizFinished] =
    useState(false);

  async function generateRevision() {
    const cleanTopic = topic.trim();

    if (!cleanTopic) {
      setError(
        "Please enter a topic first. / कृपया पहले कोई टॉपिक लिखें।",
      );

      return;
    }

    setLoading(true);
    setError("");

    setRevisionData(null);

    setFlashcardIndex(0);
    setCardFlipped(false);

    setQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);

    try {
      const { data, error: functionError } =
        await supabase.functions.invoke(
          "generate-revision",
          {
            body: {
              subject:
                subject.trim() ||
                "General Knowledge",

              topic: cleanTopic,

              difficulty,

              cardCount,
            },
          },
        );

      if (functionError) {
        throw functionError;
      }

      if (!data) {
        throw new Error(
          "No data received from AI.",
        );
      }

      if (
        !Array.isArray(data.cards) ||
        !Array.isArray(data.quiz)
      ) {
        throw new Error(
          "Invalid AI response received.",
        );
      }

      if (
        data.cards.length === 0 &&
        data.quiz.length === 0
      ) {
        throw new Error(
          "AI did not generate revision content.",
        );
      }

      setRevisionData({
        cards: data.cards,
        quiz: data.quiz,
      });
    } catch (err) {
      console.error(
        "Quick revision error:",
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

  function resetRevision() {
    setRevisionData(null);
    setError("");

    setFlashcardIndex(0);
    setCardFlipped(false);

    setQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
  }

  function goToNextFlashcard() {
    if (!revisionData) {
      return;
    }

    if (
      flashcardIndex <
      revisionData.cards.length - 1
    ) {
      setFlashcardIndex(
        (current) => current + 1,
      );

      setCardFlipped(false);
    }
  }

  function goToPreviousFlashcard() {
    if (flashcardIndex > 0) {
      setFlashcardIndex(
        (current) => current - 1,
      );

      setCardFlipped(false);
    }
  }

  function selectAnswer(answerIndex: number) {
    if (selectedAnswer !== null) {
      return;
    }

    if (!revisionData) {
      return;
    }

    const currentQuestion =
      revisionData.quiz[quizIndex];

    if (!currentQuestion) {
      return;
    }

    setSelectedAnswer(answerIndex);

    if (
      answerIndex ===
      currentQuestion.correctAnswer
    ) {
      setQuizScore(
        (current) => current + 1,
      );
    }
  }

  function goToNextQuestion() {
    if (!revisionData) {
      return;
    }

    if (selectedAnswer === null) {
      return;
    }

    const isLastQuestion =
      quizIndex >=
      revisionData.quiz.length - 1;

    if (isLastQuestion) {
      setQuizFinished(true);

      return;
    }

    setQuizIndex(
      (current) => current + 1,
    );

    setSelectedAnswer(null);
  }

  function restartQuiz() {
    setQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
  }

  const currentCard =
    revisionData?.cards[flashcardIndex];

  const currentQuestion =
    revisionData?.quiz[quizIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* TOP BAR */}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/student/dashboard")
              }
              className="mb-4 text-sm font-semibold text-blue-600 transition hover:text-blue-800 dark:text-blue-400"
            >
              ← Back to Dashboard
            </button>

            <h1 className="text-3xl font-bold sm:text-4xl">
              ⚡ Quick Revision
            </h1>

            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
              AI will generate bilingual
              flashcards and MCQ questions
              from any topic you choose.
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
              किसी भी टॉपिक से तुरंत
              Hindi + English revision
              तैयार करें।
            </p>
          </div>

          {revisionData && (
            <button
              type="button"
              onClick={resetRevision}
              className="rounded-xl border border-purple-300 px-4 py-2 font-semibold text-purple-700 transition hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/30"
            >
              ✨ New Topic
            </button>
          )}
        </div>

        {/* GENERATOR FORM */}

        {!revisionData && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl dark:bg-purple-950/50">
                🤖
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Generate AI Revision
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Enter any subject and topic.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {/* SUBJECT */}

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-semibold"
                >
                  Subject / विषय
                </label>

                <input
                  id="subject"
                  value={subject}
                  onChange={(event) =>
                    setSubject(
                      event.target.value,
                    )
                  }
                  placeholder="Example: History, Science, GK"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-purple-900"
                />
              </div>

              {/* TOPIC */}

              <div>
                <label
                  htmlFor="topic"
                  className="mb-2 block text-sm font-semibold"
                >
                  Topic / टॉपिक *
                </label>

                <input
                  id="topic"
                  value={topic}
                  onChange={(event) =>
                    setTopic(
                      event.target.value,
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !loading
                    ) {
                      void generateRevision();
                    }
                  }}
                  placeholder="Example: Mughal Empire, Photosynthesis"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-purple-900"
                />
              </div>

              {/* DIFFICULTY */}

              <div>
                <label
                  htmlFor="difficulty"
                  className="mb-2 block text-sm font-semibold"
                >
                  Difficulty / कठिनाई
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800"
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

              {/* COUNT */}

              <div>
                <label
                  htmlFor="cardCount"
                  className="mb-2 block text-sm font-semibold"
                >
                  Questions / प्रश्न
                </label>

                <select
                  id="cardCount"
                  value={cardCount}
                  onChange={(event) =>
                    setCardCount(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value={5}>
                    5
                  </option>

                  <option value={10}>
                    10
                  </option>

                  <option value={15}>
                    15
                  </option>

                  <option value={20}>
                    20
                  </option>
                </select>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                ❌ {error}
              </div>
            )}

            {/* GENERATE */}

            <button
              type="button"
              onClick={() =>
                void generateRevision()
              }
              disabled={loading}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-purple-600 px-6 py-4 font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="animate-spin">
                    ⚙️
                  </span>

                  AI is preparing your revision...
                </>
              ) : (
                <>
                  ⚡ Generate Quick Revision
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs text-slate-400">
              🃏 Bilingual Flashcards +
              📝 AI MCQ Quiz
            </p>
          </section>
        )}

        {/* REVISION CONTENT */}

        {revisionData && (
          <>
            {/* MODE SWITCHER */}

            <div className="mt-8 flex rounded-2xl bg-slate-200 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() =>
                  setMode("flashcards")
                }
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  mode === "flashcards"
                    ? "bg-white text-purple-700 shadow-sm dark:bg-slate-900 dark:text-purple-300"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                🃏 Flashcards
              </button>

              <button
                type="button"
                onClick={() =>
                  setMode("quiz")
                }
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  mode === "quiz"
                    ? "bg-white text-purple-700 shadow-sm dark:bg-slate-900 dark:text-purple-300"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                🧠 MCQ Quiz
              </button>
            </div>

            {/* FLASHCARDS */}

            {mode === "flashcards" &&
              currentCard && (
                <section className="mt-8">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-purple-600">
                        Flashcard{" "}
                        {flashcardIndex + 1} /{" "}
                        {revisionData.cards.length}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {currentCard.topic}
                      </p>
                    </div>

                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                      {currentCard.difficulty}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setCardFlipped(
                        (current) =>
                          !current,
                      )
                    }
                    className="min-h-[420px] w-full rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-violet-50 p-6 text-left shadow-sm transition hover:shadow-lg dark:border-purple-900/50 dark:from-purple-950/30 dark:via-slate-900 dark:to-violet-950/20 sm:p-10"
                  >
                    {!cardFlipped ? (
                      <div className="flex min-h-[350px] flex-col justify-center">
                        <p className="text-sm font-bold uppercase tracking-widest text-purple-500">
                          Question / प्रश्न
                        </p>

                        <h2 className="mt-5 text-2xl font-bold leading-relaxed sm:text-3xl">
                          {currentCard.question_en}
                        </h2>

                        <p className="mt-6 text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                          {currentCard.question_hi}
                        </p>

                        <p className="mt-10 text-sm font-semibold text-purple-600">
                          👆 Tap card to reveal answer
                        </p>
                      </div>
                    ) : (
                      <div className="flex min-h-[350px] flex-col justify-center">
                        <p className="text-sm font-bold uppercase tracking-widest text-green-600">
                          Answer / उत्तर
                        </p>

                        <h2 className="mt-5 text-2xl font-bold leading-relaxed sm:text-3xl">
                          {currentCard.answer_en}
                        </h2>

                        <p className="mt-5 text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                          {currentCard.answer_hi}
                        </p>

                        <div className="mt-8 border-t border-purple-200 pt-6 dark:border-purple-900">
                          <p className="font-bold">
                            Explanation /
                            व्याख्या
                          </p>

                          <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                            {
                              currentCard.explanation_en
                            }
                          </p>

                          <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                            {
                              currentCard.explanation_hi
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </button>

                  <div className="mt-6 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={
                        goToPreviousFlashcard
                      }
                      disabled={
                        flashcardIndex === 0
                      }
                      className="rounded-xl border border-slate-300 px-5 py-3 font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      ← Previous
                    </button>

                    <button
                      type="button"
                      onClick={
                        goToNextFlashcard
                      }
                      disabled={
                        flashcardIndex ===
                        revisionData.cards.length -
                          1
                      }
                      className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                </section>
              )}

            {/* QUIZ */}

            {mode === "quiz" &&
              currentQuestion &&
              !quizFinished && (
                <section className="mt-8 rounded-3xl border border-blue-200 bg-white p-6 shadow-sm dark:border-blue-900/50 dark:bg-slate-900 sm:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-blue-600">
                        Question {quizIndex + 1} /{" "}
                        {
                          revisionData.quiz
                            .length
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Score: {quizScore}
                      </p>
                    </div>

                    <div className="text-3xl">
                      🧠
                    </div>
                  </div>

                  <h2 className="mt-8 text-xl font-bold leading-relaxed sm:text-2xl">
                    {
                      currentQuestion.question_en
                    }
                  </h2>

                  <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                    {
                      currentQuestion.question_hi
                    }
                  </p>

                  <div className="mt-8 space-y-3">
                    {currentQuestion.options.map(
                      (
                        option,
                        optionIndex,
                      ) => {
                        const isSelected =
                          selectedAnswer ===
                          optionIndex;

                        const isCorrect =
                          optionIndex ===
                          currentQuestion.correctAnswer;

                        let optionClass =
                          "border-slate-200 hover:border-blue-400 dark:border-slate-700";

                        if (
                          selectedAnswer !==
                          null
                        ) {
                          if (isCorrect) {
                            optionClass =
                              "border-green-500 bg-green-50 dark:border-green-700 dark:bg-green-950/30";
                          } else if (
                            isSelected
                          ) {
                            optionClass =
                              "border-red-500 bg-red-50 dark:border-red-700 dark:bg-red-950/30";
                          }
                        }

                        return (
                          <button
                            key={
                              optionIndex
                            }
                            type="button"
                            disabled={
                              selectedAnswer !==
                              null
                            }
                            onClick={() =>
                              selectAnswer(
                                optionIndex,
                              )
                            }
                            className={`w-full rounded-2xl border p-4 text-left transition ${optionClass}`}
                          >
                            <div className="flex gap-4">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold dark:bg-slate-800">
                                {String.fromCharCode(
                                  65 +
                                    optionIndex,
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

                  {selectedAnswer !== null && (
                    <div className="mt-8 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
                      <p className="font-bold">
                        📖 Explanation /
                        व्याख्या
                      </p>

                      <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                        {
                          currentQuestion.explanation_en
                        }
                      </p>

                      <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                        {
                          currentQuestion.explanation_hi
                        }
                      </p>

                      <button
                        type="button"
                        onClick={
                          goToNextQuestion
                        }
                        className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700"
                      >
                        {quizIndex ===
                        revisionData.quiz
                          .length -
                          1
                          ? "Finish Quiz 🏆"
                          : "Next Question →"}
                      </button>
                    </div>
                  )}
                </section>
              )}

            {/* QUIZ RESULT */}

            {mode === "quiz" &&
              quizFinished && (
                <section className="mt-8 rounded-3xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center shadow-sm dark:border-green-900/50 dark:from-green-950/30 dark:to-emerald-950/20">
                  <div className="text-6xl">
                    🏆
                  </div>

                  <h2 className="mt-5 text-3xl font-bold">
                    Quiz Completed!
                  </h2>

                  <p className="mt-2 text-slate-600 dark:text-slate-300">
                    Quiz पूरा हो गया।
                  </p>

                  <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
                    <p className="text-sm text-slate-500">
                      Your Score / आपका स्कोर
                    </p>

                    <p className="mt-2 text-5xl font-bold text-green-600">
                      {quizScore} /{" "}
                      {
                        revisionData.quiz
                          .length
                      }
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <button
                      type="button"
                      onClick={
                        restartQuiz
                      }
                      className="rounded-xl border border-green-600 px-5 py-3 font-bold text-green-700 transition hover:bg-green-100 dark:text-green-400"
                    >
                      🔄 Retry Quiz
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setMode(
                          "flashcards",
                        )
                      }
                      className="rounded-xl bg-purple-600 px-5 py-3 font-bold text-white transition hover:bg-purple-700"
                    >
                      🃏 Study Flashcards
                    </button>
                  </div>
                </section>
              )}
          </>
        )}
      </main>
    </div>
  );
}

export default QuickRevision;
