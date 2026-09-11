import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type Category =
  | "vocabulary"
  | "idioms"
  | "synonyms"
  | "antonyms"
  | "oneWord"
  | "phrasal"
  | "confusing"
  | "errors";

type Difficulty = "Easy" | "Medium" | "Hard";

type StudyItem = {
  id: string;
  title: string;
  subtitle: string;
  meaning: string;
  hindi: string;
  hinglish: string;
  example: string;
  pronunciation?: string;
  extra?: string;
  difficulty: Difficulty;
};

const DATA: Record<Category, StudyItem[]> = {
  vocabulary: [
    {
      id: "abundant",
      title: "Abundant",
      subtitle: "Available in large quantities; more than enough.",
      meaning: "Available in large quantities; more than enough.",
      hindi: "प्रचुर / बहुत अधिक",
      hinglish: "Bahut zyada ya bharpur matra mein.",
      pronunciation: "/əˈbʌndənt/",
      example: "India has abundant natural resources.",
      difficulty: "Medium",
    },
    {
      id: "candid",
      title: "Candid",
      subtitle: "Truthful and straightforward.",
      meaning: "Truthful and straightforward.",
      hindi: "स्पष्टवादी / ईमानदार",
      hinglish: "Bina kuch chhupaye seedhi aur sachchi baat karna.",
      pronunciation: "/ˈkændɪd/",
      example: "She gave a candid opinion about the issue.",
      difficulty: "Medium",
    },
    {
      id: "diligent",
      title: "Diligent",
      subtitle: "Showing careful and persistent effort.",
      meaning: "Showing careful and persistent effort.",
      hindi: "परिश्रमी / मेहनती",
      hinglish: "Consistently mehnat aur dedication se kaam karne wala.",
      pronunciation: "/ˈdɪlɪdʒənt/",
      example: "A diligent student always revises regularly.",
      difficulty: "Easy",
    },
    {
      id: "inevitable",
      title: "Inevitable",
      subtitle: "Certain to happen; unavoidable.",
      meaning: "Certain to happen; unavoidable.",
      hindi: "अपरिहार्य",
      hinglish: "Jise avoid nahi kiya ja sakta; hona hi hai.",
      pronunciation: "/ɪnˈevɪtəbəl/",
      example: "Change is inevitable in life.",
      difficulty: "Medium",
    },
    {
      id: "pragmatic",
      title: "Pragmatic",
      subtitle: "Practical and focused on realistic solutions.",
      meaning: "Practical and focused on realistic solutions.",
      hindi: "व्यावहारिक",
      hinglish: "Jo practical solution par focus kare.",
      pronunciation: "/præɡˈmætɪk/",
      example: "We need a pragmatic approach to this problem.",
      difficulty: "Hard",
    },
    {
      id: "resilient",
      title: "Resilient",
      subtitle: "Able to recover quickly from difficulties.",
      meaning: "Able to recover quickly from difficulties.",
      hindi: "कठिनाइयों से उबरने वाला",
      hinglish: "Mushkil situation ke baad jaldi recover karne wala.",
      pronunciation: "/rɪˈzɪliənt/",
      example: "She remained resilient during difficult times.",
      difficulty: "Hard",
    },
    {
      id: "versatile",
      title: "Versatile",
      subtitle: "Able to adapt to many different activities or uses.",
      meaning: "Able to adapt to many different activities or uses.",
      hindi: "बहुमुखी",
      hinglish: "Jo alag-alag situations ya kaamon mein useful ho.",
      pronunciation: "/ˈvɜːrsətaɪl/",
      example: "He is a versatile player.",
      difficulty: "Medium",
    },
    {
      id: "vigilant",
      title: "Vigilant",
      subtitle: "Carefully watching for possible danger or problems.",
      meaning: "Carefully watching for possible danger or problems.",
      hindi: "सतर्क / चौकन्ना",
      hinglish: "Jo kisi danger ya problem ke liye alert rahe.",
      pronunciation: "/ˈvɪdʒɪlənt/",
      example: "Security personnel must remain vigilant.",
      difficulty: "Hard",
    },
  ],

  idioms: [
    {
      id: "blessing-disguise",
      title: "A blessing in disguise",
      subtitle: "Something that seems bad but turns out to be good.",
      meaning: "Something that initially appears bad but later proves beneficial.",
      hindi: "ऐसी चीज़ जो शुरुआत में बुरी लगे लेकिन बाद में लाभदायक साबित हो।",
      hinglish: "Jo pehle bura lage lekin baad mein faydemand nikle.",
      example: "Losing that job was a blessing in disguise.",
      pronunciation: "A blessing in disguise",
      difficulty: "Medium",
    },
    {
      id: "piece-cake",
      title: "A piece of cake",
      subtitle: "Something very easy to do.",
      meaning: "Something that is very easy to accomplish.",
      hindi: "बहुत आसान काम।",
      hinglish: "Bahut hi easy kaam.",
      example: "The test was a piece of cake.",
      pronunciation: "A piece of cake",
      difficulty: "Easy",
    },
    {
      id: "once-blue-moon",
      title: "Once in a blue moon",
      subtitle: "Something that happens very rarely.",
      meaning: "Something that happens only rarely.",
      hindi: "बहुत कम / कभी-कभार।",
      hinglish: "Bahut hi rarely hona.",
      example: "He visits his hometown once in a blue moon.",
      pronunciation: "Once in a blue moon",
      difficulty: "Easy",
    },
    {
      id: "spill-beans",
      title: "Spill the beans",
      subtitle: "To reveal a secret.",
      meaning: "To reveal secret or confidential information.",
      hindi: "राज़ खोल देना।",
      hinglish: "Koi secret bata dena.",
      example: "Don't spill the beans about the surprise.",
      pronunciation: "Spill the beans",
      difficulty: "Easy",
    },
    {
      id: "break-ice",
      title: "Break the ice",
      subtitle: "To make people feel more comfortable.",
      meaning: "To start a friendly conversation and reduce tension.",
      hindi: "झिझक या तनाव दूर करना।",
      hinglish: "Conversation start karke awkwardness door karna.",
      example: "He told a joke to break the ice.",
      pronunciation: "Break the ice",
      difficulty: "Easy",
    },
    {
      id: "hit-nail",
      title: "Hit the nail on the head",
      subtitle: "To describe something exactly.",
      meaning: "To say or do something exactly right.",
      hindi: "बिल्कुल सही बात कहना।",
      hinglish: "Bilkul sahi point par baat karna.",
      example: "You hit the nail on the head with your answer.",
      pronunciation: "Hit the nail on the head",
      difficulty: "Medium",
    },
  ],

  synonyms: [
    {
      id: "happy",
      title: "Happy",
      subtitle: "Feeling pleasure or satisfaction.",
      meaning: "Feeling pleasure or satisfaction.",
      hindi: "खुश",
      hinglish: "Khush ya prasann.",
      example: "She was happy with her result.",
      extra: "Joyful • Glad • Cheerful • Delighted",
      difficulty: "Easy",
    },
    {
      id: "brave",
      title: "Brave",
      subtitle: "Ready to face danger or difficulty.",
      meaning: "Showing courage in difficult situations.",
      hindi: "बहादुर",
      hinglish: "Mushkil ya danger ka saamna karne wala.",
      example: "The brave soldier saved the child.",
      extra: "Courageous • Fearless • Bold • Valiant",
      difficulty: "Easy",
    },
    {
      id: "abandon",
      title: "Abandon",
      subtitle: "To leave completely.",
      meaning: "To leave someone or something permanently.",
      hindi: "त्याग देना / छोड़ देना",
      hinglish: "Kisi cheez ko completely chhod dena.",
      example: "They had to abandon the old building.",
      extra: "Leave • Desert • Forsake • Quit",
      difficulty: "Medium",
    },
    {
      id: "concise",
      title: "Concise",
      subtitle: "Giving information clearly in few words.",
      meaning: "Brief but clear and complete.",
      hindi: "संक्षिप्त",
      hinglish: "Kam words mein clear baat kehna.",
      example: "Give a concise answer.",
      extra: "Brief • Short • Succinct • Compact",
      difficulty: "Medium",
    },
    {
      id: "abundant-syn",
      title: "Abundant",
      subtitle: "Available in large quantities.",
      meaning: "Available in large quantities.",
      hindi: "प्रचुर",
      hinglish: "Bharpur matra mein available.",
      example: "Water is abundant in this region.",
      extra: "Plentiful • Ample • Copious • Generous",
      difficulty: "Medium",
    },
  ],

  antonyms: [
    {
      id: "ancient",
      title: "Ancient",
      subtitle: "Belonging to the very distant past.",
      meaning: "Belonging to an old or distant period.",
      hindi: "प्राचीन",
      hinglish: "Bahut purane samay ka.",
      example: "This is an ancient monument.",
      extra: "Antonym: Modern • New • Recent",
      difficulty: "Easy",
    },
    {
      id: "expand",
      title: "Expand",
      subtitle: "To become larger or more extensive.",
      meaning: "To increase in size, amount or importance.",
      hindi: "फैलाना / विस्तार करना",
      hinglish: "Size ya scope ko bada karna.",
      example: "The company plans to expand its business.",
      extra: "Antonym: Contract • Shrink • Reduce",
      difficulty: "Medium",
    },
    {
      id: "optimistic",
      title: "Optimistic",
      subtitle: "Hopeful about the future.",
      meaning: "Having a positive expectation about the future.",
      hindi: "आशावादी",
      hinglish: "Future ko lekar positive rehna.",
      example: "She is optimistic about her results.",
      extra: "Antonym: Pessimistic",
      difficulty: "Medium",
    },
    {
      id: "victory",
      title: "Victory",
      subtitle: "An act of defeating an opponent.",
      meaning: "Success in a competition or struggle.",
      hindi: "विजय",
      hinglish: "Jeet ya success.",
      example: "The team celebrated its victory.",
      extra: "Antonym: Defeat • Loss",
      difficulty: "Easy",
    },
    {
      id: "generous",
      title: "Generous",
      subtitle: "Willing to give freely.",
      meaning: "Willing to give more than expected.",
      hindi: "उदार",
      hinglish: "Khulkar dene wala.",
      example: "He is generous to everyone.",
      extra: "Antonym: Miserly • Stingy",
      difficulty: "Easy",
    },
  ],

  oneWord: [
    {
      id: "one-who-cannot-read",
      title: "Illiterate",
      subtitle: "A person who cannot read or write.",
      meaning: "A person who is unable to read or write.",
      hindi: "जो पढ़ या लिख नहीं सकता।",
      hinglish: "Aisa vyakti jo read ya write nahi kar sakta.",
      example: "The programme aims to educate illiterate adults.",
      difficulty: "Easy",
    },
    {
      id: "one-who-loves-books",
      title: "Bibliophile",
      subtitle: "A person who loves or collects books.",
      meaning: "A person who loves books.",
      hindi: "पुस्तक प्रेमी",
      hinglish: "Books ko bahut pasand karne wala vyakti.",
      example: "He is a true bibliophile.",
      difficulty: "Hard",
    },
    {
      id: "one-who-speaks-many",
      title: "Polyglot",
      subtitle: "A person who knows and uses many languages.",
      meaning: "A person who can speak several languages.",
      hindi: "कई भाषाएं जानने वाला व्यक्ति।",
      hinglish: "Jo kai languages bol sakta ho.",
      example: "She is a polyglot who speaks five languages.",
      difficulty: "Hard",
    },
    {
      id: "one-who-hates-mankind",
      title: "Misanthrope",
      subtitle: "A person who dislikes or distrusts humankind.",
      meaning: "A person who dislikes humanity.",
      hindi: "मानव जाति से घृणा करने वाला व्यक्ति।",
      hinglish: "Jo generally mankind ko dislike karta ho.",
      example: "The character is portrayed as a misanthrope.",
      difficulty: "Hard",
    },
    {
      id: "one-who-knows-everything",
      title: "Omniscient",
      subtitle: "Knowing everything.",
      meaning: "Having complete or unlimited knowledge.",
      hindi: "सर्वज्ञ",
      hinglish: "Jise sab kuch pata ho.",
      example: "The narrator appears to be omniscient.",
      difficulty: "Hard",
    },
  ],

  phrasal: [
    {
      id: "give-up",
      title: "Give up",
      subtitle: "To stop trying or surrender.",
      meaning: "To stop making an effort or to surrender.",
      hindi: "हार मान लेना / छोड़ देना",
      hinglish: "Koshish karna band kar dena.",
      example: "Never give up on your dreams.",
      pronunciation: "Give up",
      difficulty: "Easy",
    },
    {
      id: "look-after",
      title: "Look after",
      subtitle: "To take care of someone or something.",
      meaning: "To take care of someone or something.",
      hindi: "देखभाल करना",
      hinglish: "Kisi ki care karna.",
      example: "She looks after her younger brother.",
      pronunciation: "Look after",
      difficulty: "Easy",
    },
    {
      id: "bring-up",
      title: "Bring up",
      subtitle: "To mention a topic or raise a child.",
      meaning: "To introduce a subject in conversation.",
      hindi: "विषय उठाना / पालन-पोषण करना",
      hinglish: "Kisi topic ko conversation mein lana.",
      example: "He brought up an important issue.",
      pronunciation: "Bring up",
      difficulty: "Medium",
    },
    {
      id: "carry-on",
      title: "Carry on",
      subtitle: "To continue doing something.",
      meaning: "To continue.",
      hindi: "जारी रखना",
      hinglish: "Kisi kaam ko continue karna.",
      example: "Please carry on with your work.",
      pronunciation: "Carry on",
      difficulty: "Easy",
    },
    {
      id: "put-off",
      title: "Put off",
      subtitle: "To postpone something.",
      meaning: "To delay or postpone something.",
      hindi: "स्थगित करना / टालना",
      hinglish: "Kisi kaam ko baad ke liye postpone karna.",
      example: "Don't put off your preparation.",
      pronunciation: "Put off",
      difficulty: "Medium",
    },
  ],

  confusing: [
    {
      id: "affect-effect",
      title: "Affect vs Effect",
      subtitle: "Two commonly confused words.",
      meaning: "Affect is usually a verb meaning to influence. Effect is usually a noun meaning result.",
      hindi: "Affect = प्रभावित करना; Effect = प्रभाव / परिणाम।",
      hinglish: "Affect generally verb hota hai; Effect generally noun hota hai.",
      example: "Lack of sleep affects health. The effect was serious.",
      difficulty: "Medium",
    },
    {
      id: "accept-except",
      title: "Accept vs Except",
      subtitle: "Accept means receive; except means excluding.",
      meaning: "Accept = to receive or agree. Except = excluding someone or something.",
      hindi: "Accept = स्वीकार करना; Except = को छोड़कर।",
      hinglish: "Accept = maanna/receive karna; Except = kisi ko chhodkar.",
      example: "I accept your offer. Everyone came except Rahul.",
      difficulty: "Easy",
    },
    {
      id: "principal-principle",
      title: "Principal vs Principle",
      subtitle: "A person in authority vs a rule or belief.",
      meaning: "Principal can mean head of a school or most important. Principle means a rule or belief.",
      hindi: "Principal = प्रधान / मुख्य; Principle = सिद्धांत।",
      hinglish: "Principal person ya main cheez ho sakta hai; Principle ek rule ya belief hai.",
      example: "The principal explained the principle.",
      difficulty: "Medium",
    },
    {
      id: "stationary-stationery",
      title: "Stationary vs Stationery",
      subtitle: "Not moving vs writing materials.",
      meaning: "Stationary means not moving. Stationery means writing materials.",
      hindi: "Stationary = स्थिर; Stationery = लेखन सामग्री।",
      hinglish: "Stationary = still; Stationery = pens, paper etc.",
      example: "The car remained stationary. I bought stationery.",
      difficulty: "Easy",
    },
    {
      id: "compliment-complement",
      title: "Compliment vs Complement",
      subtitle: "Praise vs something that completes another.",
      meaning: "Compliment means praise. Complement means something that completes or enhances another.",
      hindi: "Compliment = प्रशंसा; Complement = पूरक।",
      hinglish: "Compliment = tareef; Complement = jo kisi cheez ko complete kare.",
      example: "She complimented my dress. The shoes complement it.",
      difficulty: "Medium",
    },
  ],

  errors: [
    {
      id: "error-he-does",
      title: "He do not know.",
      subtitle: "Incorrect sentence.",
      meaning: "The correct form is: He does not know.",
      hindi: "He के साथ does आएगा, do नहीं।",
      hinglish: "He/She/It ke saath present tense mein does use hota hai.",
      example: "Incorrect: He do not know. Correct: He does not know.",
      extra: "Rule: He / She / It + does",
      difficulty: "Easy",
    },
    {
      id: "error-i-have-seen",
      title: "I have seen him yesterday.",
      subtitle: "Incorrect use of tense.",
      meaning: "Use simple past with a finished past-time expression.",
      hindi: "सही: I saw him yesterday.",
      hinglish: "Yesterday ke saath simple past use karte hain.",
      example: "Incorrect: I have seen him yesterday. Correct: I saw him yesterday.",
      extra: "Rule: Yesterday + Simple Past",
      difficulty: "Medium",
    },
    {
      id: "error-discuss-about",
      title: "Discuss about the issue.",
      subtitle: "Incorrect preposition.",
      meaning: "The verb discuss does not normally need 'about'.",
      hindi: "सही: Discuss the issue.",
      hinglish: "Discuss ke baad normally 'about' nahi lagta.",
      example: "Incorrect: We discussed about the problem. Correct: We discussed the problem.",
      extra: "Rule: Discuss + object",
      difficulty: "Medium",
    },
    {
      id: "error-return-back",
      title: "Return back",
      subtitle: "Redundant expression.",
      meaning: "Return already contains the meaning of going back.",
      hindi: "सही: Return home / Return to school.",
      hinglish: "Return mein already back ka meaning hota hai.",
      example: "Incorrect: I will return back tomorrow. Correct: I will return tomorrow.",
      extra: "Rule: Avoid unnecessary 'back' after return.",
      difficulty: "Easy",
    },
    {
      id: "error-more-better",
      title: "More better",
      subtitle: "Double comparative.",
      meaning: "Better is already a comparative form.",
      hindi: "सही: Much better / Better.",
      hinglish: "Better already comparative hai, isliye more better nahi.",
      example: "Incorrect: This is more better. Correct: This is much better.",
      extra: "Rule: Don't use 'more' with better.",
      difficulty: "Easy",
    },
  ],
};

const CATEGORIES: {
  id: Category;
  icon: string;
  label: string;
  shortLabel: string;
}[] = [
  {
    id: "vocabulary",
    icon: "📚",
    label: "Vocabulary",
    shortLabel: "Words",
  },
  {
    id: "idioms",
    icon: "💬",
    label: "Idioms & Phrases",
    shortLabel: "Idioms",
  },
  {
    id: "synonyms",
    icon: "🔄",
    label: "Synonyms",
    shortLabel: "Synonyms",
  },
  {
    id: "antonyms",
    icon: "↔️",
    label: "Antonyms",
    shortLabel: "Antonyms",
  },
  {
    id: "oneWord",
    icon: "🎯",
    label: "One Word",
    shortLabel: "One Word",
  },
  {
    id: "phrasal",
    icon: "🧩",
    label: "Phrasal Verbs",
    shortLabel: "Phrasal",
  },
  {
    id: "confusing",
    icon: "⚠️",
    label: "Confusing Words",
    shortLabel: "Confusing",
  },
  {
    id: "errors",
    icon: "✍️",
    label: "Common Errors",
    shortLabel: "Errors",
  },
];

export function Vocabulary() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [category, setCategory] =
    useState<Category>("vocabulary");

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] =
    useState<"All" | Difficulty>("All");

  const [expandedId, setExpandedId] =
    useState<string | null>(null);

  const [speakingId, setSpeakingId] =
    useState<string | null>(null);

  const language =
    i18n.resolvedLanguage === "hi"
      ? "hi"
      : i18n.resolvedLanguage === "hinglish"
        ? "hinglish"
        : "en";

  const ui = {
    en: {
      back: "Back to Dashboard",
      eyebrow: "SMART ENGLISH PREPARATION",
      title: "English Preparation",
      description:
        "Build strong English skills with vocabulary, idioms, synonyms, antonyms and exam-focused concepts.",
      search: "Search anything...",
      all: "All",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      meaning: "Meaning",
      pronunciation: "Pronunciation",
      pronounce: "Pronounce",
      playing: "Playing...",
      example: "Example",
      extra: "Exam Point",
      items: "items",
      noResults: "No results found.",
    },

    hi: {
      back: "डैशबोर्ड पर वापस जाएं",
      eyebrow: "स्मार्ट इंग्लिश तैयारी",
      title: "अंग्रेज़ी तैयारी",
      description:
        "Vocabulary, idioms, synonyms, antonyms और परीक्षा-केंद्रित concepts के साथ अपनी English मजबूत करें।",
      search: "कुछ भी खोजें...",
      all: "सभी",
      easy: "आसान",
      medium: "मध्यम",
      hard: "कठिन",
      meaning: "अर्थ",
      pronunciation: "उच्चारण",
      pronounce: "उच्चारण सुनें",
      playing: "चल रहा है...",
      example: "उदाहरण",
      extra: "Exam Point",
      items: "आइटम",
      noResults: "कोई परिणाम नहीं मिला।",
    },

    hinglish: {
      back: "Dashboard par wapas",
      eyebrow: "SMART ENGLISH PREPARATION",
      title: "English Preparation",
      description:
        "Vocabulary, idioms, synonyms, antonyms aur exam-focused concepts ke saath English strong karo.",
      search: "Kuch bhi search karo...",
      all: "Sabhi",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      meaning: "Meaning",
      pronunciation: "Pronunciation",
      pronounce: "Pronounce",
      playing: "Playing...",
      example: "Example",
      extra: "Exam Point",
      items: "items",
      noResults: "Koi result nahi mila.",
    },
  }[language];

  const currentCategory = CATEGORIES.find(
    (item) => item.id === category,
  );

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return DATA[category].filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.meaning.toLowerCase().includes(query) ||
        item.hindi.toLowerCase().includes(query) ||
        item.hinglish.toLowerCase().includes(query) ||
        item.example.toLowerCase().includes(query) ||
        item.extra?.toLowerCase().includes(query);

      const matchesDifficulty =
        difficulty === "All" ||
        item.difficulty === difficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [category, search, difficulty]);

  const getMeaning = (item: StudyItem) => {
    if (language === "hi") {
      return `${item.hindi} — ${item.meaning}`;
    }

    if (language === "hinglish") {
      return `${item.hinglish} — ${item.meaning}`;
    }

    return item.meaning;
  };

  const pronounce = (item: StudyItem) => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const text =
      item.pronunciation ||
      item.title.replace(/[\/]/g, "");

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.rate = 0.78;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setSpeakingId(item.id);
    };

    utterance.onend = () => {
      setSpeakingId(null);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const changeCategory = (next: Category) => {
    setCategory(next);
    setSearch("");
    setDifficulty("All");
    setExpandedId(null);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setSpeakingId(null);
  };

  const difficultyStyle = (level: Difficulty) => {
    if (level === "Easy") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400";
    }

    if (level === "Hard") {
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400";
    }

    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() =>
              navigate("/student/dashboard")
            }
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

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:py-9">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-violet-50 p-6 shadow-sm dark:border-blue-900/50 dark:from-blue-950/30 dark:via-slate-900 dark:to-violet-950/20 sm:p-9">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-600 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-400">
              {ui.eyebrow}
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              {ui.title}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
              {ui.description}
            </p>
          </div>
        </section>

        {/* CATEGORY TABS */}
        <section className="mt-6">
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max gap-2">
              {CATEGORIES.map((item) => {
                const active = category === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      changeCategory(item.id)
                    }
                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black transition ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="hidden sm:inline">
                      {item.label}
                    </span>
                    <span className="sm:hidden">
                      {item.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* SEARCH + FILTER */}
        <section className="mt-3">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xl">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
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
                  onClick={() =>
                    setDifficulty(value)
                  }
                  className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                    difficulty === value
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400">
              {currentCategory?.icon}{" "}
              {currentCategory?.label} ·{" "}
              {filteredItems.length} {ui.items}
            </p>
          </div>
        </section>

        {/* CARDS */}
        <section className="mt-5 grid items-start gap-5 md:grid-cols-2">
          {filteredItems.map((item) => {
            const expanded =
              expandedId === item.id;

            const speaking =
              speakingId === item.id;

            return (
              <article
                key={item.id}
                className={`self-start overflow-hidden rounded-[1.75rem] border bg-white shadow-sm transition duration-300 dark:bg-slate-900 ${
                  expanded
                    ? "border-blue-300 shadow-lg shadow-blue-500/10 dark:border-blue-800"
                    : "border-slate-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800"
                }`}
              >
                {/* CARD HEADER */}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(
                          expanded ? null : item.id,
                        )
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="min-w-0">
                          <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                            {item.title}
                          </h2>

                          <p className="mt-1 text-sm font-medium leading-6 text-slate-400">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                    </button>

                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-wider ${difficultyStyle(
                          item.difficulty,
                        )}`}
                      >
                        {item.difficulty}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(
                            expanded ? null : item.id,
                          )
                        }
                        className={`flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition dark:bg-slate-800 dark:text-slate-300 ${
                          expanded
                            ? "rotate-180"
                            : ""
                        }`}
                        aria-label="Toggle details"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                </div>

                {/* DETAILS */}
                {expanded && (
                  <div className="border-t border-slate-100 px-6 pb-6 dark:border-slate-800">
                    {/* MEANING */}
                    <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                      <div className="flex gap-3">
                        <span className="text-lg">
                          📖
                        </span>

                        <div className="min-w-0">
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
                    {item.pronunciation && (
                      <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="text-lg">
                            🔊
                          </span>

                          <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                              {ui.pronunciation}
                            </p>

                            <p className="mt-1 truncate text-sm font-bold text-slate-700 dark:text-slate-200">
                              {item.pronunciation}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            pronounce(item)
                          }
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-black transition ${
                            speaking
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-blue-200 bg-white text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-400"
                          }`}
                        >
                          <span>
                            {speaking
                              ? "🔊"
                              : "▶"}
                          </span>

                          <span className="hidden sm:inline">
                            {speaking
                              ? ui.playing
                              : ui.pronounce}
                          </span>
                        </button>
                      </div>
                    )}

                    {/* EXTRA / EXAM POINT */}
                    {item.extra && (
                      <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/60 p-4 dark:border-violet-900/40 dark:bg-violet-950/20">
                        <div className="flex gap-3">
                          <span className="text-lg">
                            🎯
                          </span>

                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">
                              {ui.extra}
                            </p>

                            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
                              {item.extra}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* EXAMPLE */}
                    <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex gap-3">
                        <span className="text-lg">
                          📝
                        </span>

                        <div className="min-w-0">
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

        {/* EMPTY STATE */}
        {filteredItems.length === 0 && (
          <div className="mt-6 rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="text-4xl">
              📚
            </div>

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
