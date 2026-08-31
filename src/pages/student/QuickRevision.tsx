import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type Difficulty = "easy" | "medium" | "hard";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const questionCounts = [5, 10, 20];

export function QuickRevision() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] =
    useState<Difficulty>("medium");
  const [questionCount, setQuestionCount] =
    useState(5);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<
    Record<number, number>
  >({});

  const [submitted, setSubmitted] = useState(false);
  const [generating, setGenerating] =
    useState(false);

  const score = useMemo(() => {
    return questions.reduce((total, question) => {
      return (
        total +
        (answers[question.id] === question.correctAnswer
          ? 1
          : 0)
      );
    }, 0);
  }, [answers, questions]);

  async function handleGenerate() {
    if (!topic.trim()) {
      return;
    }

    setGenerating(true);
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);

    // Temporary demo delay.
    // Later replace this section with Supabase Edge Function AI call.
    await new Promise((resolve) =>
      setTimeout(resolve, 700),
    );

    const generatedQuestions =
      generateQuestions(
        topic.trim(),
        difficulty,
        questionCount,
      );

    setQuestions(generatedQuestions);
    setGenerating(false);
  }

  function selectAnswer(
    questionId: number,
    optionIndex: number,
  ) {
    if (submitted) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [questionId]: optionIndex,
    }));
  }

  function handleSubmit() {
    if (Object.keys(answers).length !== questions.length) {
      return;
    }

    setSubmitted(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleReset() {
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setTopic("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const answeredCount =
    Object.keys(answers).length;

  const allAnswered =
    questions.length > 0 &&
    answeredCount === questions.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            navigate("/student/dashboard")
          }
          className="mb-6 font-semibold text-blue-600 transition hover:text-blue-800 dark:text-blue-400"
        >
          ← {t("common.back", "Back")}
        </button>

        {/* HEADER */}

        <div className="rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-white/70">
                {t(
                  "quickRevision.label",
                  "AI Powered Revision",
                )}
              </p>

              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                ⚡{" "}
                {t(
                  "quickRevision.title",
                  "Quick Revision",
                )}
              </h1>

              <p className="mt-3 max-w-2xl text-white/80">
                {t(
                  "quickRevision.subtitle",
                  "Enter any topic and practice important questions instantly.",
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs text-white/70">
                {t(
                  "quickRevision.poweredBy",
                  "Powered by AI",
                )}
              </p>

              <p className="mt-1 font-bold">
                🤖 PadhAI
              </p>
            </div>
          </div>
        </div>

        {/* GENERATOR */}

        {questions.length === 0 && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <h2 className="text-xl font-bold">
              {t(
                "quickRevision.chooseTopic",
                "What do you want to revise?",
              )}
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {t(
                "quickRevision.chooseTopicDesc",
                "You can enter any subject, chapter, exam topic or concept.",
              )}
            </p>

            {/* TOPIC */}

            <div className="mt-6">
              <label
                htmlFor="topic"
                className="text-sm font-semibold"
              >
                {t(
                  "quickRevision.topic",
                  "Topic",
                )}
              </label>

              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(event) =>
                  setTopic(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    topic.trim()
                  ) {
                    void handleGenerate();
                  }
                }}
                placeholder={t(
                  "quickRevision.topicPlaceholder",
                  "Example: Fundamental Rights, Photosynthesis, World War 2",
                )}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-purple-950"
              />
            </div>

            {/* DIFFICULTY */}

            <div className="mt-6">
              <p className="text-sm font-semibold">
                {t(
                  "quickRevision.difficulty",
                  "Difficulty",
                )}
              </p>

              <div className="mt-3 grid grid-cols-3 gap-3">
                <DifficultyButton
                  active={difficulty === "easy"}
                  onClick={() =>
                    setDifficulty("easy")
                  }
                  icon="🟢"
                  label={t(
                    "quickRevision.easy",
                    "Easy",
                  )}
                />

                <DifficultyButton
                  active={difficulty === "medium"}
                  onClick={() =>
                    setDifficulty("medium")
                  }
                  icon="🟡"
                  label={t(
                    "quickRevision.medium",
                    "Medium",
                  )}
                />

                <DifficultyButton
                  active={difficulty === "hard"}
                  onClick={() =>
                    setDifficulty("hard")
                  }
                  icon="🔴"
                  label={t(
                    "quickRevision.hard",
                    "Hard",
                  )}
                />
              </div>
            </div>

            {/* QUESTION COUNT */}

            <div className="mt-6">
              <p className="text-sm font-semibold">
                {t(
                  "quickRevision.questionCount",
                  "Number of Questions",
                )}
              </p>

              <div className="mt-3 flex flex-wrap gap-3">
                {questionCounts.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() =>
                      setQuestionCount(count)
                    }
                    className={`rounded-xl px-5 py-3 font-semibold transition ${
                      questionCount === count
                        ? "bg-purple-600 text-white shadow"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* EXAMPLES */}

            <div className="mt-8">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t(
                  "quickRevision.tryTopics",
                  "Try these topics",
                )}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "Indian Constitution",
                  "Photosynthesis",
                  "World War 2",
                  "Indian Economy",
                  "Human Body",
                  "UPSC Polity",
                ].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() =>
                      setTopic(example)
                    }
                    className="rounded-full bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* GENERATE */}

            <button
              type="button"
              disabled={
                !topic.trim() || generating
              }
              onClick={() =>
                void handleGenerate()
              }
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 px-6 py-4 font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? (
                <>
                  <span className="animate-spin">
                    ⚙️
                  </span>

                  {t(
                    "quickRevision.generating",
                    "Generating Questions...",
                  )}
                </>
              ) : (
                <>
                  🤖{" "}
                  {t(
                    "quickRevision.generate",
                    "Generate Questions",
                  )}
                </>
              )}
            </button>
          </section>
        )}

        {/* QUIZ */}

        {questions.length > 0 && (
          <section className="mt-8">
            {/* QUIZ HEADER */}

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-purple-600">
                    {topic}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {t(
                      "quickRevision.practice",
                      "Practice Questions",
                    )}
                  </h2>
                </div>

                <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold dark:bg-slate-800">
                  {submitted
                    ? `${score} / ${questions.length}`
                    : `${answeredCount} / ${questions.length}`}
                </div>
              </div>

              {!submitted && (
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-purple-600 transition-all"
                    style={{
                      width: `${
                        questions.length
                          ? (answeredCount /
                              questions.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* RESULT */}

            {submitted && (
              <div className="mb-6 rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-6 text-center dark:border-purple-900/50 dark:from-purple-950/30 dark:to-blue-950/20">
                <div className="text-5xl">
                  {score === questions.length
                    ? "🏆"
                    : score >= questions.length / 2
                      ? "👏"
                      : "💪"}
                </div>

                <h2 className="mt-3 text-2xl font-bold">
                  {t(
                    "quickRevision.yourScore",
                    "Your Score",
                  )}
                </h2>

                <p className="mt-2 text-4xl font-bold text-purple-600">
                  {score} / {questions.length}
                </p>

                <p className="mt-3 text-slate-600 dark:text-slate-300">
                  {score === questions.length
                    ? t(
                        "quickRevision.perfect",
                        "Perfect! Excellent revision.",
                      )
                    : t(
                        "quickRevision.resultMessage",
                        "Review the explanations below and keep practicing.",
                      )}
                </p>
              </div>
            )}

            {/* QUESTIONS */}

            <div className="space-y-5">
              {questions.map(
                (question, questionIndex) => (
                  <article
                    key={question.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                        {questionIndex + 1}
                      </span>

                      <h3 className="pt-1 font-semibold leading-6">
                        {question.question}
                      </h3>
                    </div>

                    <div className="mt-5 space-y-3">
                      {question.options.map(
                        (option, optionIndex) => {
                          const selected =
                            answers[question.id] ===
                            optionIndex;

                          const correct =
                            question.correctAnswer ===
                            optionIndex;

                          let optionClass =
                            "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750";

                          if (
                            !submitted &&
                            selected
                          ) {
                            optionClass =
                              "border-purple-500 bg-purple-50 dark:bg-purple-950/30";
                          }

                          if (
                            submitted &&
                            correct
                          ) {
                            optionClass =
                              "border-green-500 bg-green-50 dark:bg-green-950/30";
                          }

                          if (
                            submitted &&
                            selected &&
                            !correct
                          ) {
                            optionClass =
                              "border-red-500 bg-red-50 dark:bg-red-950/30";
                          }

                          return (
                            <button
                              key={optionIndex}
                              type="button"
                              disabled={submitted}
                              onClick={() =>
                                selectAnswer(
                                  question.id,
                                  optionIndex,
                                )
                              }
                              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${optionClass}`}
                            >
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-700">
                                {String.fromCharCode(
                                  65 + optionIndex,
                                )}
                              </span>

                              <span className="flex-1 text-sm font-medium">
                                {option}
                              </span>

                              {submitted &&
                                correct && (
                                  <span>
                                    ✅
                                  </span>
                                )}

                              {submitted &&
                                selected &&
                                !correct && (
                                  <span>
                                    ❌
                                  </span>
                                )}
                            </button>
                          );
                        },
                      )}
                    </div>

                    {/* EXPLANATION */}

                    {submitted && (
                      <div className="mt-5 rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30">
                        <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                          💡{" "}
                          {t(
                            "quickRevision.explanation",
                            "Explanation",
                          )}
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </article>
                ),
              )}
            </div>

            {/* ACTION */}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {!submitted && (
                <button
                  type="button"
                  disabled={!allAnswered}
                  onClick={handleSubmit}
                  className="rounded-xl bg-purple-600 px-6 py-3 font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {allAnswered
                    ? `✓ ${t(
                        "quickRevision.submit",
                        "Submit Answers",
                      )}`
                    : `${t(
                        "quickRevision.answerAll",
                        "Answer all questions",
                      )} (${answeredCount}/${questions.length})`}
                </button>
              )}

              {submitted && (
                <>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl bg-purple-600 px-6 py-3 font-bold text-white transition hover:bg-purple-700"
                  >
                    ⚡{" "}
                    {t(
                      "quickRevision.newRevision",
                      "New Revision",
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/student/dashboard")
                    }
                    className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {t(
                      "quickRevision.dashboard",
                      "Dashboard",
                    )}
                  </button>
                </>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function DifficultyButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3 text-center text-sm font-semibold transition ${
        active
          ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      <span className="block text-lg">
        {icon}
      </span>

      <span className="mt-1 block">
        {label}
      </span>
    </button>
  );
}

/*
  TEMPORARY QUESTION GENERATOR

  IMPORTANT:
  This does NOT use real AI yet.

  Later we will replace this function with:
  Supabase Edge Function → OpenAI/Gemini/etc.
*/

function generateQuestions(
  topic: string,
  difficulty: Difficulty,
  count: number,
): Question[] {
  const difficultyText =
    difficulty === "easy"
      ? "basic"
      : difficulty === "medium"
        ? "important"
        : "advanced";

  const templates = [
    {
      question: `Which of the following is most closely related to ${topic}?`,
      options: [
        `${topic}`,
        "An unrelated concept",
        "A completely different subject",
        "None of the above",
      ],
      correctAnswer: 0,
      explanation: `${topic} is the main subject being revised in this question.`,
    },

    {
      question: `Why is ${topic} important for examination preparation?`,
      options: [
        "It can contain important concepts and facts",
        "It is never useful",
        "It has no academic value",
        "It should always be ignored",
      ],
      correctAnswer: 0,
      explanation: `${topic} may include important concepts, facts and exam-relevant information.`,
    },

    {
      question: `Which is the best revision strategy for ${topic}?`,
      options: [
        "Understand concepts and practice questions",
        "Memorize without understanding",
        "Avoid revision completely",
        "Study only unrelated topics",
      ],
      correctAnswer: 0,
      explanation: `The best strategy is to understand ${topic}, revise key concepts and practice questions.`,
    },

    {
      question: `A ${difficultyText} question about ${topic} should mainly test what?`,
      options: [
        "Understanding of important concepts",
        "Random guessing only",
        "Unrelated knowledge",
        "No knowledge at all",
      ],
      correctAnswer: 0,
      explanation: `Good questions should test meaningful understanding of ${topic}.`,
    },

    {
      question: `What should you do after answering a question incorrectly about ${topic}?`,
      options: [
        "Read the explanation and revise the concept",
        "Ignore the mistake",
        "Stop studying",
        "Delete the topic",
      ],
      correctAnswer: 0,
      explanation: `Mistakes are useful for learning. Review the explanation and revise the relevant concept.`,
    },
  ];

  return Array.from(
    { length: count },
    (_, index): Question => {
      const template =
        templates[index % templates.length];

      return {
        id: index + 1,
        question: template.question,
        options: [...template.options],
        correctAnswer:
          template.correctAnswer,
        explanation:
          template.explanation,
      };
    },
  );
}

export default QuickRevision;
