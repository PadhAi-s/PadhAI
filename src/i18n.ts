import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      // COMMON
      home: "Home",
      currentAffairs: "Current Affairs",
      search: "Search",
      readMore: "Read More →",
      loading: "Loading...",
      noData: "No data available",

      // LANGUAGE
      hindi: "हिंदी",
      english: "English",

      // CURRENT AFFAIRS
      thisWeek: "THIS WEEK",
      importantUpdates: "Important Updates",
      topics: "topics",
      searchCurrentAffairs: "Search current affairs...",

      // CATEGORIES
      all: "All",
      national: "National",
      international: "International",
      scienceTech: "Science & Tech",
      economy: "Economy",
      sports: "Sports",
      awards: "Awards",

      // CATEGORY CARDS
      nationalUpdates: "National Updates",
      nationalDescription:
        "Important national events and government-related developments from this week.",

      internationalAffairs: "International Affairs",
      internationalDescription:
        "Major international events, global developments and important world news.",

      scienceTechnology: "Science & Technology",
      scienceDescription:
        "Important developments in science, technology, space and innovation.",

      economyBusiness: "Economy & Business",
      economyDescription:
        "Key economic developments, business news and important financial updates.",

      sportsTitle: "Sports",
      sportsDescription:
        "Important sports events, tournaments, achievements and major updates.",

      awardsAppointments: "Awards & Appointments",
      awardsDescription:
        "Important appointments, awards, honours and personalities in the news.",

      // CURRENT AFFAIR DETAILS
      whyInNews: "Why in News",
      keyFacts: "Key Facts",
      examPoint: "Exam Point",
      staticGK: "Static GK",
      mcqs: "MCQs",
      explanation: "Explanation",
      correctAnswer: "Correct Answer",

      // EMPTY STATES
      noCurrentAffairs: "No current affairs found.",
      tryAgain: "Please try again later.",

      // BUTTONS
      back: "Back",
      next: "Next",
      previous: "Previous",
      submit: "Submit",
      close: "Close",
    },
  },

  hi: {
    translation: {
      // COMMON
      home: "होम",
      currentAffairs: "करंट अफेयर्स",
      search: "खोजें",
      readMore: "और पढ़ें →",
      loading: "लोड हो रहा है...",
      noData: "कोई डेटा उपलब्ध नहीं है",

      // LANGUAGE
      hindi: "हिंदी",
      english: "English",

      // CURRENT AFFAIRS
      thisWeek: "इस सप्ताह",
      importantUpdates: "महत्वपूर्ण अपडेट",
      topics: "विषय",
      searchCurrentAffairs: "करंट अफेयर्स खोजें...",

      // CATEGORIES
      all: "सभी",
      national: "राष्ट्रीय",
      international: "अंतर्राष्ट्रीय",
      scienceTech: "विज्ञान और टेक",
      economy: "अर्थव्यवस्था",
      sports: "खेल",
      awards: "पुरस्कार",

      // CATEGORY CARDS
      nationalUpdates: "राष्ट्रीय अपडेट",
      nationalDescription:
        "इस सप्ताह की महत्वपूर्ण राष्ट्रीय घटनाएं और सरकारी विकास।",

      internationalAffairs: "अंतर्राष्ट्रीय मामले",
      internationalDescription:
        "प्रमुख अंतर्राष्ट्रीय घटनाएं, वैश्विक विकास और महत्वपूर्ण विश्व समाचार।",

      scienceTechnology: "विज्ञान और प्रौद्योगिकी",
      scienceDescription:
        "विज्ञान, प्रौद्योगिकी, अंतरिक्ष और नवाचार में महत्वपूर्ण विकास।",

      economyBusiness: "अर्थव्यवस्था और व्यापार",
      economyDescription:
        "महत्वपूर्ण आर्थिक विकास, व्यापार समाचार और वित्तीय अपडेट।",

      sportsTitle: "खेल",
      sportsDescription:
        "महत्वपूर्ण खेल आयोजन, टूर्नामेंट, उपलब्धियां और प्रमुख अपडेट।",

      awardsAppointments: "पुरस्कार और नियुक्तियां",
      awardsDescription:
        "समाचार में महत्वपूर्ण नियुक्तियां, पुरस्कार, सम्मान और व्यक्तित्व।",

      // CURRENT AFFAIR DETAILS
      whyInNews: "समाचार में क्यों",
      keyFacts: "मुख्य तथ्य",
      examPoint: "परीक्षा बिंदु",
      staticGK: "स्टेटिक जीके",
      mcqs: "बहुविकल्पीय प्रश्न",
      explanation: "व्याख्या",
      correctAnswer: "सही उत्तर",

      // EMPTY STATES
      noCurrentAffairs: "कोई करंट अफेयर्स नहीं मिला।",
      tryAgain: "कृपया बाद में पुनः प्रयास करें।",

      // BUTTONS
      back: "वापस",
      next: "अगला",
      previous: "पिछला",
      submit: "जमा करें",
      close: "बंद करें",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,

  lng: localStorage.getItem("padhai-language") || "en",

  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
