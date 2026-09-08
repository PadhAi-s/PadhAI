```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "english" | "hindi";

type TranslationKey =
  | "english"
  | "hindi"
  | "language"
  | "selectLanguage"
  | "home"
  | "dashboard"
  | "profile"
  | "logout"
  | "fastRevision"
  | "dailyCurrentAffairs"
  | "dailyNewspaper"
  | "whatsInNews"
  | "whyImportant"
  | "askVidhya"
  | "englishVocabulary"
  | "videoLearning"
  | "comingSoon"
  | "about"
  | "readMore"
  | "viewAll"
  | "back"
  | "loading"
  | "error"
  | "retry"
  | "search"
  | "noResults"
  | "today"
  | "examPoint"
  | "keyFacts"
  | "staticGk"
  | "mcqs"
  | "question"
  | "answer"
  | "explanation"
  | "next"
  | "previous"
  | "submit"
  | "score"
  | "start"
  | "generate"
  | "selectSubject"
  | "topic"
  | "difficulty"
  | "easy"
  | "medium"
  | "hard"
  | "askAnything"
  | "thinking"
  | "unableToConnect";

type TranslationDictionary = Record<TranslationKey, string>;

const translations: Record<Language, TranslationDictionary> = {
  english: {
    english: "English",
    hindi: "Hindi",
    language: "Language",
    selectLanguage: "Select Language",

    home: "Home",
    dashboard: "Dashboard",
    profile: "Profile",
    logout: "Logout",

    fastRevision: "Fast Revision",
    dailyCurrentAffairs: "Daily Current Affairs",
    dailyNewspaper: "Daily Newspaper",
    whatsInNews: "What's in News?",
    whyImportant: "Why Important?",
    askVidhya: "Ask Vidhya",
    englishVocabulary: "English Vocabulary",
    videoLearning: "Video Learning",
    comingSoon: "Coming Soon",
    about: "About VIDYZEN",

    readMore: "Read More",
    viewAll: "View All",
    back: "Back",

    loading: "Loading...",
    error: "Something went wrong.",
    retry: "Retry",
    search: "Search",
    noResults: "No results found.",
    today: "Today",

    examPoint: "Exam Point",
    keyFacts: "Key Facts",
    staticGk: "Static GK",
    mcqs: "MCQs",
    question: "Question",
    answer: "Answer",
    explanation: "Explanation",

    next: "Next",
    previous: "Previous",
    submit: "Submit",
    score: "Score",
    start: "Start",
    generate: "Generate",

    selectSubject: "Select Subject",
    topic: "Topic",
    difficulty: "Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",

    askAnything: "Ask Vidhya anything...",
    thinking: "Vidhya is thinking...",
    unableToConnect: "Unable to connect with Vidhya.",
  },

  hindi: {
    english: "English",
    hindi: "हिंदी",
    language: "भाषा",
    selectLanguage: "भाषा चुनें",

    home: "होम",
    dashboard: "डैशबोर्ड",
    profile: "प्रोफ़ाइल",
    logout: "लॉगआउट",

    fastRevision: "फास्ट रिवीजन",
    dailyCurrentAffairs: "दैनिक करेंट अफेयर्स",
    dailyNewspaper: "दैनिक समाचार पत्र",
    whatsInNews: "खबरों में क्या है?",
    whyImportant: "क्यों महत्वपूर्ण है?",
    askVidhya: "विध्या से पूछें",
    englishVocabulary: "अंग्रेज़ी शब्दावली",
    videoLearning: "वीडियो लर्निंग",
    comingSoon: "जल्द आ रहा है",
    about: "VIDYZEN के बारे में",

    readMore: "और पढ़ें",
    viewAll: "सभी देखें",
    back: "वापस",

    loading: "लोड हो रहा है...",
    error: "कुछ गलत हो गया।",
    retry: "फिर से प्रयास करें",
    search: "खोजें",
    noResults: "कोई परिणाम नहीं मिला।",
    today: "आज",

    examPoint: "परीक्षा के लिए महत्वपूर्ण",
    keyFacts: "मुख्य तथ्य",
    staticGk: "स्टेटिक GK",
    mcqs: "बहुविकल्पीय प्रश्न",
    question: "प्रश्न",
    answer: "उत्तर",
    explanation: "व्याख्या",

    next: "अगला",
    previous: "पिछला",
    submit: "जमा करें",
    score: "स्कोर",
    start: "शुरू करें",
    generate: "तैयार करें",

    selectSubject: "विषय चुनें",
    topic: "टॉपिक",
    difficulty: "कठिनाई",
    easy: "आसान",
    medium: "मध्यम",
    hard: "कठिन",

    askAnything: "विध्या से कुछ भी पूछें...",
    thinking: "विध्या सोच रही है...",
    unableToConnect: "विध्या से कनेक्ट नहीं हो पाया।",
  },
};

const STORAGE_KEY = "vidyzen-language";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "english";
  }

  const savedLanguage = window.localStorage.getItem(STORAGE_KEY);

  if (savedLanguage === "hindi" || savedLanguage === "english") {
    return savedLanguage;
  }

  return "english";
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  isHindi: boolean;
  isEnglish: boolean;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({
  children,
}: LanguageProviderProps) {
  const [language, setLanguageState] =
    useState<Language>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);

    // Helps browsers and accessibility tools understand
    // the currently selected document language.
    document.documentElement.lang =
      language === "hindi" ? "hi" : "en";
  }, [language]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((currentLanguage) =>
      currentLanguage === "english" ? "hindi" : "english"
    );
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key];
    },
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      isHindi: language === "hindi",
      isEnglish: language === "english",
      t,
    }),
    [language, setLanguage, toggleLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}

export { translations };
export default LanguageContext;
```
