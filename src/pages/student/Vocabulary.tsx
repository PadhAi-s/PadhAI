import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type Difficulty = "All" | "Easy" | "Medium" | "Hard";

type VocabularyWord = {
  word: string;
  meaning: string;
  hindi: string;
  hinglish: string;
  pronunciation: string;
  example: string;
  difficulty: Exclude<Difficulty, "All">;
};

const WORDS: VocabularyWord[] = [
  {
    word: "Abundant",
    meaning: "Available in large quantities; more than enough.",
    hindi: "प्रचुर / बहुत अधिक",
    hinglish: "Bahut zyada ya bharpur matra mein.",
    pronunciation: "/əˈbʌndənt/",
    example: "India has abundant natural resources.",
    difficulty: "Medium",
  },
  {
    word: "Candid",
    meaning: "Truthful and straightforward.",
    hindi: "स्पष्टवादी / ईमानदार",
    hinglish: "Jo bina kuch chhupaye seedhi aur sachchi baat kare.",
    pronunciation: "/ˈkændɪd/",
    example: "She gave a candid opinion about the issue.",
    difficulty: "Medium",
  },
  {
    word: "Diligent",
    meaning: "Showing careful and persistent effort.",
    hindi: "परिश्रमी / मेहनती",
    hinglish: "Jo consistently mehnat aur dedication se kaam kare.",
    pronunciation: "/ˈdɪlɪdʒənt/",
    example: "A diligent student always revises regularly.",
    difficulty: "Easy",
  },
  {
    word: "Inevitable",
    meaning: "Certain to happen; unavoidable.",
    hindi: "अपरिहार्य",
    hinglish: "Jise avoid nahi kiya ja sakta; hona hi hai.",
    pronunciation: "/ɪnˈevɪtəbəl/",
    example: "Change is inevitable in life.",
    difficulty: "Medium",
  },
  {
    word: "Pragmatic",
    meaning: "Practical and focused on realistic solutions.",
    hindi: "व्यावहारिक",
    hinglish: "Jo practical solution par focus kare.",
    pronunciation: "/præɡˈmætɪk/",
    example: "We need a pragmatic approach to this problem.",
    difficulty: "Hard",
  },
  {
    word: "Resilient",
    meaning: "Able to recover quickly from difficulties.",
    hindi: "लचीला / कठिनाइयों से उबरने वाला",
    hinglish: "Mushkil situation ke baad jaldi recover karne wala.",
    pronunciation: "/rɪˈzɪliənt/",
    example: "She remained resilient during difficult times.",
    difficulty: "Hard",
  },
  {
    word: "Versatile",
    meaning: "Able to adapt to many different activities or uses.",
    hindi: "बहुमुखी",
    hinglish: "Jo alag-alag situations ya kaamon mein useful ho.",
    pronunciation: "/ˈvɜːrsətaɪl/",
    example: "He is a versatile player.",
    difficulty: "Medium",
  },
  {
    word: "Vigilant",
    meaning: "Carefully watching for possible danger or problems.",
    hindi: "सतर्क / चौकन्ना",
    hinglish: "Jo kisi danger ya problem ke liye alert rahe.",
    pronunciation: "/ˈvɪdʒɪlənt/",
    example: "Security personnel must remain vigilant.",
    difficulty: "Hard",
  },
];

export function Vocabulary() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("All");
  const [expandedWord, setExpandedWord] = useState<string | null>(null);
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);

  const language =
    i18n.resolvedLanguage === "hi"
      ? "hi"
      : i18n.resolvedLanguage === "hinglish"
        ? "hinglish"
        : "en";

  const ui = {
    en: {
      back: "Back to Dashboard",
      eyebrow: "LEARN SMART",
      title: "English Vocabulary",
      description:
        "Build strong vocabulary with exam-focused words, meanings and examples.",
      search: "Search a word...",
      all: "All",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      meaning: "Meaning",
      pronunciation: "Pronunciation",
      pronounce: "Pronounce",
      example: "Example",
      words: "words",
      noResults: "No vocabulary words found.",
    },

    hi: {
      back: "डैशबोर्ड पर वापस जाएं",
      eyebrow: "स्मार्ट लर्निंग",
      title: "अंग्रेज़ी शब्दावली",
      description:
        "परीक्षा के लिए महत्वपूर्ण शब्दों, अर्थ और उदाहरणों के साथ अपनी vocabulary मजबूत करें।",
      search: "शब्द खोजें...",
      all: "सभी",
      easy: "आसान",
      medium: "मध्यम",
      hard: "कठिन",
      meaning: "अर्थ",
      pronunciation: "उच्चारण",
      pronounce: "उच्चारण सुनें",
      example: "उदाहरण",
      words: "शब्द",
      noResults: "कोई vocabulary word नहीं मिला।",
    },

    hinglish: {
      back: "Dashboard par wapas",
      eyebrow: "SMART LEARNING",
      title: "English Vocabulary",
      description:
        "Exam-focused words, meanings aur examples ke saath apni vocabulary strong karo.",
      search: "Word search karo...",
      all: "Sabhi",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      meaning: "Meaning",
      pronunciation: "Pronunciation",
      pronounce: "Pronounce",
      example: "Example",
      words: "words",
      noResults: "Koi vocabulary word nahi mila.",
    },
  }[language];

  const filteredWords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return WORDS.filter((item) => {
      const matchesSearch =
        !query ||
        item.word.toLowerCase().includes(query) ||
        item.meaning.toLowerCase().includes(query) ||
        item.hindi.toLowerCase().includes(query) ||
        item.hinglish.toLowerCase().includes(query);

      const matchesDifficulty =
        difficulty === "All" || item.difficulty === difficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [search, difficulty]);

  const getMeaning = (word: VocabularyWord) => {
    if (language === "hi") return word.hindi;
    if (language === "hinglish") return word.hinglish;
    return word.meaning;
  };

  const difficultyStyle = (level: VocabularyWord["difficulty"]) => {
    if (level === "Easy") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900";
    }

    if (level === "Hard") {
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900";
    }

    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900";
  };

  const pronounceWord = (word: VocabularyWord) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word.word);

    utterance.lang = "en-US";
    utterance.rate = 0.78;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setSpeakingWord(word.word);
    };

    utterance.onend = () => {
      setSpeakingWord(null);
    };

    utterance.onerror = () => {
      setSpeakingWord(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleCard = (word: string) => {
    setExpandedWord((current) => (current === word ? null : word));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* TOP BAR */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate("/student/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
          >
            <span className="text-base">←</span>
            {ui.back}
          </button>

          <div className="text-lg font-black tracking-tight text-blue-600">
            RANKER BHAIYA
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-violet-50 p-6 shadow-sm dark:border-blue-900/50 dark:from-blue-950/30 dark:via-slate-900 dark:to-violet-950/20 sm:p-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-400">
              {ui.eyebrow}
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              {ui.title}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
              {ui.description}
            </p>
          </div>
        </section>

        {/* SEARCH + FILTER */}
        <section className="mt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xl">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={ui.search}
                className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3.5 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["All", ui.all],
                  ["Easy", ui.easy],
                  ["Medium", ui.medium],
                  ["Hard", ui.hard],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDifficulty(value)}
                  className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                    difficulty === value
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-4 text-xs font-bold text-slate-400">
            {filteredWords.length} {ui.words}
          </p>
        </section>

        {/* WORD CARDS */}
        <section className="mt-5 grid gap-5 md:grid-cols-2">
          {filteredWords.map((item) => {
            const isExpanded = expandedWord === item.word;
            const isSpeaking = speakingWord === item.word;

            return (
              <article
                key={item.word}
                className={`overflow-hidden rounded-[1.75rem] border bg-white shadow-sm transition duration-300 dark:bg-slate-900 ${
                  isExpanded
                    ? "border-blue-300 shadow-lg shadow-blue-500/10 dark:border-blue-800"
                    : "border-slate-200 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800"
                }`}
              >
                {/* CARD HEADER */}
                <button
                  type="button"
                  onClick={() => toggleCard(item.word)}
                  className="w-full p-6 text-left"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                        {item.word}
                      </h2>

                      <p className="mt-1 text-sm font-medium text-slate-400">
                        {item.meaning}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-wider ${difficultyStyle(
                          item.difficulty,
                        )}`}
                      >
                        {item.difficulty}
                      </span>

                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition dark:bg-slate-800 dark:text-slate-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      >
                        ↓
                      </span>
                    </div>
                  </div>
                </button>

                {/* EXPANDED DETAILS */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-6 pb-6 dark:border-slate-800">
                    {/* MEANING */}
                    <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                      <div className="flex gap-3">
                        <div className="mt-0.5 text-lg">📖</div>

                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                            {ui.meaning}
                          </p>

                          <p className="mt-2 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
                            {getMeaning(item)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* PRONUNCIATION */}
                    <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="text-lg">🔊</div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                            {ui.pronunciation}
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                            {item.pronunciation}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          pronounceWord(item);
                        }}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-black transition ${
                          isSpeaking
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-blue-200 bg-white text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-400"
                        }`}
                        aria-label={`${ui.pronounce} ${item.word}`}
                      >
                        <span>{isSpeaking ? "🔊" : "▶"}</span>
                        <span className="hidden sm:inline">
                          {isSpeaking ? "Playing..." : ui.pronounce}
                        </span>
                      </button>
                    </div>

                    {/* EXAMPLE */}
                    <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex gap-3">
                        <div className="mt-0.5 text-lg">📝</div>

                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                            {ui.example}
                          </p>

                          <p className="mt-2 text-sm italic leading-6 text-slate-600 dark:text-slate-400">
                            “{item.example}”
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>

        {/* NO RESULTS */}
        {filteredWords.length === 0 && (
          <div className="mt-6 rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="text-4xl">📚</div>

            <p className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400">
              {ui.noResults}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Vocabulary;
