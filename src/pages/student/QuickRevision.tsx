import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";

type Difficulty = "Easy" | "Medium" | "Hard";

interface SubjectOption {
  value: string;
  label: string;
  topics: {
    value: string;
    label: string;
  }[];
}

const subjects: SubjectOption[] = [
  {
    value: "Mathematics",
    label: "Mathematics / गणित",
    topics: [
      {
        value: "Percentage",
        label: "Percentage / प्रतिशत",
      },
      {
        value: "Profit and Loss",
        label: "Profit & Loss / लाभ और हानि",
      },
      {
        value: "Ratio and Proportion",
        label: "Ratio & Proportion / अनुपात और समानुपात",
      },
      {
        value: "Simple Interest",
        label: "Simple Interest / साधारण ब्याज",
      },
      {
        value: "Compound Interest",
        label: "Compound Interest / चक्रवृद्धि ब्याज",
      },
      {
        value: "Time and Work",
        label: "Time & Work / समय और कार्य",
      },
      {
        value: "Time Speed and Distance",
        label: "Time, Speed & Distance / समय, गति और दूरी",
      },
      {
        value: "Algebra",
        label: "Algebra / बीजगणित",
      },
      {
        value: "Geometry",
        label: "Geometry / ज्यामिति",
      },
    ],
  },

  {
    value: "Science",
    label: "Science / विज्ञान",
    topics: [
      {
        value: "Physics",
        label: "Physics / भौतिक विज्ञान",
      },
      {
        value: "Chemistry",
        label: "Chemistry / रसायन विज्ञान",
      },
      {
        value: "Biology",
        label: "Biology / जीव विज्ञान",
      },
      {
        value: "Human Body",
        label: "Human Body / मानव शरीर",
      },
      {
        value: "Electricity",
        label: "Electricity / विद्युत",
      },
      {
        value: "Light",
        label: "Light / प्रकाश",
      },
      {
        value: "Motion and Force",
        label: "Motion & Force / गति और बल",
      },
      {
        value: "Environment",
        label: "Environment / पर्यावरण",
      },
    ],
  },

  {
    value: "Social Science",
    label: "Social Science / सामाजिक विज्ञान",
    topics: [
      {
        value: "Indian History",
        label: "Indian History / भारतीय इतिहास",
      },
      {
        value: "Indian Geography",
        label: "Indian Geography / भारतीय भूगोल",
      },
      {
        value: "Indian Constitution",
        label: "Indian Constitution / भारतीय संविधान",
      },
      {
        value: "Fundamental Rights",
        label: "Fundamental Rights / मौलिक अधिकार",
      },
      {
        value: "Indian Economy",
        label: "Indian Economy / भारतीय अर्थव्यवस्था",
      },
      {
        value: "World Geography",
        label: "World Geography / विश्व भूगोल",
      },
      {
        value: "Civics",
        label: "Civics / नागरिक शास्त्र",
      },
    ],
  },

  {
    value: "English",
    label: "English / अंग्रेज़ी",
    topics: [
      {
        value: "Grammar",
        label: "Grammar / व्याकरण",
      },
      {
        value: "Tenses",
        label: "Tenses / काल",
      },
      {
        value: "Vocabulary",
        label: "Vocabulary / शब्दावली",
      },
      {
        value: "Parts of Speech",
        label: "Parts of Speech / शब्द भेद",
      },
      {
        value: "Active and Passive Voice",
        label: "Active & Passive Voice / कर्तृवाच्य और कर्मवाच्य",
      },
      {
        value: "Direct and Indirect Speech",
        label: "Direct & Indirect Speech / प्रत्यक्ष और अप्रत्यक्ष कथन",
      },
    ],
  },

  {
    value: "General Knowledge",
    label: "General Knowledge / सामान्य ज्ञान",
    topics: [
      {
        value: "Indian Constitution",
        label: "Indian Constitution / भारतीय संविधान",
      },
      {
        value: "Indian History",
        label: "Indian History / भारतीय इतिहास",
      },
      {
        value: "Indian Geography",
        label: "Indian Geography / भारतीय भूगोल",
      },
      {
        value: "Science and Technology",
        label: "Science & Technology / विज्ञान और तकनीक",
      },
      {
        value: "Important Days",
        label: "Important Days / महत्वपूर्ण दिवस",
      },
      {
        value: "Awards and Honours",
        label: "Awards & Honours / पुरस्कार और सम्मान",
      },
    ],
  },

  {
    value: "Current Affairs",
    label: "Current Affairs / समसामयिक घटनाएँ",
    topics: [
      {
        value: "National Current Affairs",
        label: "National / राष्ट्रीय",
      },
      {
        value: "International Current Affairs",
        label: "International / अंतरराष्ट्रीय",
      },
      {
        value: "Sports Current Affairs",
        label: "Sports / खेल",
      },
      {
        value: "Government Schemes",
        label: "Government Schemes / सरकारी योजनाएँ",
      },
      {
        value: "Awards",
        label: "Awards / पुरस्कार",
      },
    ],
  },
];

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

  const [customTopic, setCustomTopic] =
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

  /* UI */

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

  const currentSubject = useMemo(
    () =>
      subjects.find(
        (item) => item.value === subject,
      ),
    [subject],
  );

  const topicOptions =
    currentSubject?.topics || [];

  const isCustomTopic =
    topic === "__custom__";

  const isMixedTopic =
    topic === "__mix__";

  function handleSubjectChange(
    value: string,
  ) {
    setSubject(value);

    setTopic("");
    setCustomTopic("");
    setError("");
  }

  function getFinalTopic() {
    if (topic === "__custom__") {
      return customTopic.trim();
    }

    if (topic === "__mix__") {
      return `Mixed important topics from ${subject}`;
    }

    return topic.trim();
  }

  async function handleGenerate(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const finalTopic = getFinalTopic();

    if (!finalTopic) {
      setError(
        "Please select or enter a topic / कृपया एक टॉपिक चुनें या लिखें",
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
              topic: finalTopic,
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

      /*
       * Handles:
       * normal object response
       * JSON string response
       */

      let result: RevisionResponse;

      if (typeof data === "string") {
        result = JSON.parse(
          data,
        ) as RevisionResponse;
      } else {
        result =
          data as RevisionResponse;
      }

      if (
        !Array.isArray(result.cards) ||
        !Array.isArray(result.quiz)
      ) {
        console.error(
          "Invalid revision response:",
          data,
        );

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

  /* FLASHCARD */

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

  /* QUIZ */

  function handleSelectAnswer(
    answerIndex: number,
  ) {
    if (selectedAnswer !== null) {
      return;
    }

    setSelectedAnswer(answerIndex);
  }

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
    setCustomTopic("");
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

  /* ========================= */
  /* FORM */
  /* ========================= */

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-white">
        <div className="mx-auto max-w-5xl">

          <button
            type="button"
            onClick={() =>
              navigate("/student/dashboard")
            }
            className="mb-5 text-sm font-semibold text-slate-600 transition hover:text-purple-600 dark:text-slate-300"
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
              Choose a subject and let AI generate
              bilingual flashcards and MCQ questions.
            </p>

            <p className="mt-1 text-sm text-purple-100">
              विषय और टॉपिक चुनें और AI से तुरंत रिवीजन करें।
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

                <select
                  value={subject}
                  onChange={(event) =>
                    handleSubjectChange(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-purple-950"
                >
                  {subjects.map(
                    (item) => (
                      <option
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </option>
                    ),
                  )}
                </select>
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

              <select
                value={topic}
                onChange={(event) => {
                  setTopic(
                    event.target.value,
                  );

                  setCustomTopic("");
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-purple-950"
              >
                <option value="">
                  Select Topic / टॉपिक चुनें
                </option>

                {topicOptions.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ),
                )}

                <option value="__mix__">
                  🔀 Mix Important Topics /
                  मिश्रित महत्वपूर्ण टॉपिक
                </option>

                <option value="__custom__">
                  ✏️ Custom Topic /
                  अपना टॉपिक लिखें
                </option>
              </select>
            </div>

            {/* CUSTOM TOPIC */}

            {isCustomTopic && (
              <div className="mt-4">
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  ✏️ Enter Your Topic / अपना टॉपिक लिखें
                </label>

                <textarea
                  value={customTopic}
                  onChange={(event) =>
                    setCustomTopic(
                      event.target.value,
                    )
                  }
                  placeholder="Example: Indian Constitution Fundamental Rights / भारतीय संविधान के मौलिक अधिकार"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-purple-950"
                />
              </div>
            )}

            {/* MIX INFO */}

            {isMixedTopic && (
              <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-700 dark:border-purple-900 dark:bg-purple-950/30 dark:text-purple-300">
                🔀 AI will select and mix important
                topics from{" "}
                <strong>{subject}</strong>.
                <br />
                AI इस विषय के महत्वपूर्ण टॉपिक को मिलाकर
                रिवीजन तैयार करेगा।
              </div>
            )}

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

            {/* START */}

            <button
              type="submit"
              disabled={
                loading ||
                (!topic ||
                  (isCustomTopic &&
                    !customTopic.trim()))
              }
              className="group relative mt-6 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-lg backdrop-blur-sm">
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
                <span className="text-lg">
                  →
                </span>
              )}
            </button>

            <p className="mt-4 text-center text-xs text-slate-400">
              AI will automatically generate bilingual
              flashcards and MCQs.
            </p>
          </form>
        </div>
      </div>
    );
  }

  /* ========================= */
  /* FLASHCARDS */
  /* ========================= */

  if (
    mode === "cards" &&
    cards.length > 0
  ) {
    const card = cards[currentCard];

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl">

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
                  className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 font-bold text-white shadow-lg"
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

  /* ========================= */
  /* QUIZ */
  /* ========================= */

  if (
    mode === "quiz" &&
    quiz.length > 0
  ) {
    const question =
      quiz[currentQuestion];

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl">

          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-purple-600">
                📝 AI Quiz
              </p>

              <p className="text-xs text-slate-500">
                Question {currentQuestion + 1} of{" "}
                {quiz.length}
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              MCQ Practice
            </span>
          </div>

          <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
              style={{
                width: `${
                  ((currentQuestion + 1) /
                    quiz.length) *
                  100
                }%`,
              }}
            />
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900 sm:p-8">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {question.question_en}
            </h1>

            <p className="mt-3 font-semibold text-purple-600 dark:text-purple-300">
              {question.question_hi}
            </p>

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

            <button
              type="button"
              disabled={
                selectedAnswer === null
              }
              onClick={
                handleNextQuestion
              }
              className="mt-8 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
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

  /* ========================= */
  /* RESULT */
  /* ========================= */

  if (mode === "result") {
    const percentage =
      quiz.length > 0
        ? Math.round(
            (score / quiz.length) * 100,
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

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleRestart}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4 font-bold text-white"
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
              className="rounded-xl border border-slate-200 px-5 py-4 font-bold text-slate-700 dark:border-slate-700 dark:text-white"
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
