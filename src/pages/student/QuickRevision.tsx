import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Difficulty = "Easy" | "Medium" | "Hard";

interface Question {
  id: number;
  topic: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

const topics = [
  "General Knowledge",
  "History",
  "Geography",
  "Polity",
  "Economy",
  "Science",
  "Current Affairs",
  "English",
  "Reasoning",
  "Mathematics",
];

const questionBank: Record<string, Question[]> = {
  "General Knowledge": [
    {
      id: 1,
      topic: "General Knowledge",
      question: "What is the capital of India?",
      options: [
        "Mumbai",
        "New Delhi",
        "Kolkata",
        "Chennai",
      ],
      answer: 1,
      explanation:
        "New Delhi is the capital of India.",
    },
    {
      id: 2,
      topic: "General Knowledge",
      question:
        "Which is the largest planet in our solar system?",
      options: [
        "Earth",
        "Mars",
        "Jupiter",
        "Saturn",
      ],
      answer: 2,
      explanation:
        "Jupiter is the largest planet in the solar system.",
    },
  ],

  History: [
    {
      id: 3,
      topic: "History",
      question:
        "Who founded the Maurya Empire?",
      options: [
        "Ashoka",
        "Chandragupta Maurya",
        "Bindusara",
        "Harshavardhana",
      ],
      answer: 1,
      explanation:
        "Chandragupta Maurya founded the Maurya Empire.",
    },
    {
      id: 4,
      topic: "History",
      question:
        "Who was the first Mughal emperor of India?",
      options: [
        "Akbar",
        "Babur",
        "Humayun",
        "Shah Jahan",
      ],
      answer: 1,
      explanation:
        "Babur established the Mughal Empire in India.",
    },
  ],

  Geography: [
    {
      id: 5,
      topic: "Geography",
      question:
        "Which is the longest river in India?",
      options: [
        "Yamuna",
        "Ganga",
        "Godavari",
        "Narmada",
      ],
      answer: 1,
      explanation:
        "The Ganga is generally considered India's longest river.",
    },
    {
      id: 6,
      topic: "Geography",
      question:
        "Which is the highest mountain peak in the world?",
      options: [
        "K2",
        "Kanchenjunga",
        "Mount Everest",
        "Nanda Devi",
      ],
      answer: 2,
      explanation:
        "Mount Everest is the highest peak in the world.",
    },
  ],

  Polity: [
    {
      id: 7,
      topic: "Polity",
      question:
        "Who is the constitutional head of India?",
      options: [
        "Prime Minister",
        "President",
        "Chief Justice",
        "Vice President",
      ],
      answer: 1,
      explanation:
        "The President is the constitutional head of India.",
    },
    {
      id: 8,
      topic: "Polity",
      question:
        "How many houses are there in the Indian Parliament?",
      options: [
        "One",
        "Two",
        "Three",
        "Four",
      ],
      answer: 1,
      explanation:
        "The Indian Parliament has Lok Sabha and Rajya Sabha.",
    },
  ],

  Economy: [
    {
      id: 9,
      topic: "Economy",
      question:
        "What does GDP stand for?",
      options: [
        "Gross Domestic Product",
        "General Domestic Price",
        "Gross Development Plan",
        "Government Development Product",
      ],
      answer: 0,
      explanation:
        "GDP stands for Gross Domestic Product.",
    },
    {
      id: 10,
      topic: "Economy",
      question:
        "Which institution is India's central bank?",
      options: [
        "SBI",
        "RBI",
        "NABARD",
        "SEBI",
      ],
      answer: 1,
      explanation:
        "The Reserve Bank of India is India's central bank.",
    },
  ],

  Science: [
    {
      id: 11,
      topic: "Science",
      question:
        "What is the chemical symbol of water?",
      options: [
        "CO2",
        "O2",
        "H2O",
        "NaCl",
      ],
      answer: 2,
      explanation:
        "Water consists of hydrogen and oxygen: H2O.",
    },
    {
      id: 12,
      topic: "Science",
      question:
        "Which planet is known as the Red Planet?",
      options: [
        "Venus",
        "Mars",
        "Jupiter",
        "Mercury",
      ],
      answer: 1,
      explanation:
        "Mars is called the Red Planet because of iron oxide on its surface.",
    },
  ],

  English: [
    {
      id: 13,
      topic: "English",
      question:
        "Choose the synonym of 'Happy'.",
      options: [
        "Sad",
        "Joyful",
        "Angry",
        "Tired",
      ],
      answer: 1,
      explanation:
        "Joyful has a similar meaning to Happy.",
    },
  ],

  Reasoning: [
    {
      id: 14,
      topic: "Reasoning",
      question:
        "Find the next number: 2, 4, 8, 16, ?",
      options: [
        "20",
        "24",
        "32",
        "36",
      ],
      answer: 2,
      explanation:
        "Each number is multiplied by 2.",
    },
  ],

  Mathematics: [
    {
      id: 15,
      topic: "Mathematics",
      question:
        "What is 25 × 4?",
      options: [
        "50",
        "75",
        "100",
        "125",
      ],
      answer: 2,
      explanation:
        "25 multiplied by 4 equals 100.",
    },
  ],

  "Current Affairs": [
    {
      id: 16,
      topic: "Current Affairs",
      question:
        "Which type of information is generally included in current affairs?",
      options: [
        "Historical fiction only",
        "Recent important events",
        "Mathematical formulas only",
        "Grammar rules only",
      ],
      answer: 1,
      explanation:
        "Current affairs focuses on recent important national and international events.",
    },
  ],
};

export function QuickRevision() {
  const navigate = useNavigate();

  const [selectedTopic, setSelectedTopic] =
    useState("General Knowledge");

  const [customTopic, setCustomTopic] =
    useState("");

  const [difficulty, setDifficulty] =
    useState<Difficulty>("Medium");

  const [questionCount, setQuestionCount] =
    useState(5);

  const [started, setStarted] =
    useState(false);

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState<number | null>(null);

  const [checked, setChecked] =
    useState(false);

  const [score, setScore] =
    useState(0);

  const [finished, setFinished] =
    useState(false);

  const activeTopic = useMemo(() => {
    return customTopic.trim() || selectedTopic;
  }, [customTopic, selectedTopic]);

  function createQuestions() {
    const available =
      questionBank[selectedTopic] ||
      questionBank["General Knowledge"];

    const generatedQuestions: Question[] = [];

    for (let i = 0; i < questionCount; i++) {
      const sourceQuestion =
        available[i % available.length];

      generatedQuestions.push({
        ...sourceQuestion,
        id: Date.now() + i,
        topic: activeTopic,
      });
    }

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setChecked(false);
    setScore(0);
    setFinished(false);
    setStarted(true);
  }

  function checkAnswer() {
    if (
      selectedAnswer === null ||
      !questions[currentIndex]
    ) {
      return;
    }

    setChecked(true);

    if (
      selectedAnswer ===
      questions[currentIndex].answer
    ) {
      setScore((currentScore) => currentScore + 1);
    }
  }

  function nextQuestion() {
    if (
      currentIndex === questions.length - 1
    ) {
      setFinished(true);
      return;
    }

    setCurrentIndex(
      (current) => current + 1,
    );

    setSelectedAnswer(null);
    setChecked(false);
  }

  function restartRevision() {
    setStarted(false);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setChecked(false);
    setScore(0);
    setFinished(false);
  }

  const currentQuestion =
    questions[currentIndex];

  /* RESULT SCREEN */
  if (finished) {
    const percentage =
      questions.length > 0
        ? Math.round(
            (score / questions.length) * 100,
          )
        : 0;

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
        <main className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm dark:bg-slate-900">
            <div className="text-6xl">
              🎉
            </div>

            <h1 className="mt-5 text-3xl font-bold">
              Revision Complete!
            </h1>

            <p className="mt-3 text-slate-500 dark:text-slate-400">
              Great job! Here is your result.
            </p>

            <div className="mx-auto mt-8 max-w-md rounded-2xl bg-purple-50 p-6 dark:bg-purple-950/30">
              <p className="text-sm font-semibold text-purple-600">
                YOUR SCORE
              </p>

              <p className="mt-2 text-5xl font-bold">
                {score} / {questions.length}
              </p>

              <p className="mt-3 text-xl font-semibold text-purple-600">
                {percentage}%
              </p>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={restartRevision}
                className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
              >
                ⚡ Start New Revision
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/student/dashboard")
                }
                className="rounded-xl border border-slate-300 px-6 py-3 font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                ← Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* QUESTION SCREEN */
  if (started && currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
        <main className="mx-auto max-w-3xl px-4 py-8">
          <button
            type="button"
            onClick={restartRevision}
            className="mb-6 font-semibold text-purple-600 hover:text-purple-800"
          >
            ← Exit Revision
          </button>

          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                ⚡ {activeTopic}
              </span>

              <span className="text-sm font-semibold text-slate-500">
                Question {currentIndex + 1} /{" "}
                {questions.length}
              </span>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-purple-600 transition-all"
                style={{
                  width: `${
                    ((currentIndex + 1) /
                      questions.length) *
                    100
                  }%`,
                }}
              />
            </div>

            <p className="mt-8 text-xs font-bold uppercase tracking-wider text-slate-400">
              {difficulty} LEVEL
            </p>

            <h1 className="mt-3 text-xl font-bold leading-relaxed sm:text-2xl">
              {currentQuestion.question}
            </h1>

            <div className="mt-8 space-y-3">
              {currentQuestion.options.map(
                (option, index) => {
                  let optionClass =
                    "border-slate-200 hover:border-purple-400 dark:border-slate-700";

                  if (
                    selectedAnswer === index &&
                    !checked
                  ) {
                    optionClass =
                      "border-purple-600 bg-purple-50 dark:bg-purple-950/30";
                  }

                  if (checked) {
                    if (
                      index ===
                      currentQuestion.answer
                    ) {
                      optionClass =
                        "border-green-500 bg-green-50 dark:bg-green-950/30";
                    } else if (
                      index === selectedAnswer
                    ) {
                      optionClass =
                        "border-red-500 bg-red-50 dark:bg-red-950/30";
                    }
                  }

                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={checked}
                      onClick={() =>
                        setSelectedAnswer(index)
                      }
                      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left font-medium transition ${optionClass}`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold dark:bg-slate-800">
                        {String.fromCharCode(
                          65 + index,
                        )}
                      </span>

                      <span>{option}</span>
                    </button>
                  );
                },
              )}
            </div>

            {checked && (
              <div className="mt-6 rounded-2xl bg-blue-50 p-5 dark:bg-blue-950/30">
                <p className="font-bold text-blue-700 dark:text-blue-300">
                  💡 Explanation
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              {!checked ? (
                <button
                  type="button"
                  disabled={
                    selectedAnswer === null
                  }
                  onClick={checkAnswer}
                  className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
                >
                  {currentIndex ===
                  questions.length - 1
                    ? "Finish Revision 🎉"
                    : "Next Question →"}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* START SCREEN */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <main className="mx-auto max-w-4xl px-4 py-8">
        <button
          type="button"
          onClick={() =>
            navigate("/student/dashboard")
          }
          className="mb-6 font-semibold text-purple-600 hover:text-purple-800"
        >
          ← Back to Dashboard
        </button>

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm dark:bg-slate-900">
          {/* HERO */}
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-8 text-white sm:p-10">
            <div className="text-5xl">
              ⚡
            </div>

            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
              Quick Revision
            </h1>

            <p className="mt-3 max-w-2xl text-purple-100">
              Select any topic and start practising
              important questions. AI question generation
              can later be connected here to generate
              questions from any topic.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {/* TOPIC */}
            <label className="text-sm font-bold">
              Select Topic
            </label>

            <select
              value={selectedTopic}
              onChange={(event) =>
                setSelectedTopic(
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800"
            >
              {topics.map((topic) => (
                <option
                  key={topic}
                  value={topic}
                >
                  {topic}
                </option>
              ))}
            </select>

            {/* CUSTOM TOPIC */}
            <div className="mt-6">
              <label className="text-sm font-bold">
                Or enter any topic
              </label>

              <input
                type="text"
                value={customTopic}
                onChange={(event) =>
                  setCustomTopic(
                    event.target.value,
                  )
                }
                placeholder="Example: Indian Constitution, Photosynthesis, World War 2..."
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800"
              />

              <p className="mt-2 text-xs text-slate-500">
                🤖 Custom topic is ready for AI-generated
                questions integration.
              </p>
            </div>

            {/* DIFFICULTY */}
            <div className="mt-6">
              <label className="text-sm font-bold">
                Difficulty
              </label>

              <div className="mt-3 grid grid-cols-3 gap-3">
                {(
                  [
                    "Easy",
                    "Medium",
                    "Hard",
                  ] as Difficulty[]
                ).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      setDifficulty(level)
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                      difficulty === level
                        ? "border-purple-600 bg-purple-600 text-white"
                        : "border-slate-200 hover:border-purple-400 dark:border-slate-700"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* QUESTION COUNT */}
            <div className="mt-6">
              <label className="text-sm font-bold">
                Number of Questions
              </label>

              <div className="mt-3 flex flex-wrap gap-3">
                {[5, 10, 15, 20].map(
                  (count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() =>
                        setQuestionCount(count)
                      }
                      className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
                        questionCount === count
                          ? "bg-purple-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {count}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* START */}
            <button
              type="button"
              onClick={createQuestions}
              className="mt-8 w-full rounded-xl bg-purple-600 px-6 py-4 text-lg font-bold text-white transition hover:bg-purple-700"
            >
              ⚡ Start Quick Revision
            </button>

            <p className="mt-4 text-center text-xs text-slate-400">
              Topic: {activeTopic} • Difficulty:{" "}
              {difficulty} • Questions: {questionCount}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default QuickRevision;
