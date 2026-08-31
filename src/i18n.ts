import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      common: {
        student: "Student",
        logout: "Logout",
        notSet: "Not set",
        premium: "PREMIUM",
        free: "FREE",
        external: "External ↗",
        comingSoon: "Coming soon",
      },

      home: {
        heroTitle: "Study smarter. Learn better.",
        heroSubtitle:
          "PadhAI helps students learn with organized syllabus content, AI assistance, videos and progress tracking.",
        ctaStudent: "Student Login",

        pillars: {
          syllabus: "Organized syllabus and chapter-wise learning.",
          ai: "Ask questions and get AI-powered explanations.",
          video: "Learn concepts with useful study videos.",
          progress: "Track your learning and improve consistently.",
        },
      },

      login: {
        title: "Student Login",
        subtitle: "Login to continue your learning journey.",
        email: "Email address",
        password: "Password",
        emailPlaceholder: "Enter your email",
        passwordPlaceholder: "Enter your password",
        loginButton: "Login",
        loggingIn: "Logging in...",
        noAccount: "Don't have an account?",
        signUp: "Sign up",
        loginError: "Unable to login. Please check your credentials.",
      },

      dashboard: {
        subtitle: "Student Dashboard",

        welcome: "Welcome to PadhAI",

        class: "Class",
        board: "Board",
        exam: "Exam",

        openMenu: "Open menu",

        editProfile: "Edit My Profile",

        menu: {
          syllabus: "My Syllabus",
          syllabusDesc: "Subjects & chapters",

          profile: "My Profile",
          profileDesc: "Edit your profile",

          lightMode: "Light Mode",
          darkMode: "Dark Mode",

          changeAppearance: "Change appearance",

          settings: "Settings",
          comingSoon: "Coming soon",
        },

        cards: {
          newspaper: {
            title: "Daily Newspaper",
            description:
              "Read today's important news selected specially for students.",
            action: "Read Today's Paper 🔒 →",
          },

          currentAffairs: {
            title: "Weekly Current Affairs",
            description:
              "Important weekly current affairs for exams and general awareness.",
            action: "Read Current Affairs →",
          },

          revision: {
            title: "Quick Revision",
            description:
              "Revise important concepts, formulas and exam points quickly.",
            action: "Revise Now →",
          },

          ask: {
            title: "Ask PadhAI",
            description:
              "Ask questions and get step-by-step AI explanations.",
            action: "Ask Now →",
          },

          vocab: {
            title: "Vocab Bhaiya",
            description:
              "Improve your English vocabulary with Vocab Bhaiya.",
            action: "Open Vocab Bhaiya →",
          },

          videos: {
            title: "Study Videos",
            description:
              "Relevant learning videos for your studies.",
          },
        },
      },

      currentAffairs: {
        label: "Current Affairs",

        title: "Daily Current Affairs",

        subtitle:
          "Important current affairs for competitive exams.",

        searchPlaceholder: "Search current affairs...",

        loading: "Loading current affairs...",

        loadError: "Unable to load current affairs.",

        allCategories: "All Categories",

        mixedTitle: "Mixed Current Affairs",

        topics: "topics",

        mcqs: "MCQs",

        readMore: "Read More",

        emptyTitle: "No current affairs found",

        emptyDescription:
          "Try another category or search term.",

        categories: {
          All: "All",
          National: "National",
          International: "International",
          "Science & Tech": "Science & Tech",
          Economy: "Economy",
          Sports: "Sports",
          Awards: "Awards",
        },

        categoryTitles: {
          national: "National Updates",

          international: "International Affairs",

          scienceTech: "Science & Technology",

          economy: "Economy & Business",

          sports: "Sports",

          awards: "Awards & Appointments",
        },

        categoryDescriptions: {
          national:
            "Important national events and government-related developments from this week.",

          international:
            "Major international events, global developments and important world news.",

          scienceTech:
            "Important developments in science, technology, space and innovation.",

          economy:
            "Key economic developments, business news and important financial updates.",

          sports:
            "Important sports events, tournaments, achievements and major victories.",

          awards:
            "Important appointments, awards, honours and personalities in the news.",
        },
      },
    },
  },

  hi: {
    translation: {
      common: {
        student: "छात्र",
        logout: "लॉगआउट",
        notSet: "सेट नहीं है",
        premium: "प्रीमियम",
        free: "फ्री",
        external: "बाहरी ↗",
        comingSoon: "जल्द आ रहा है",
      },

      home: {
        heroTitle: "स्मार्ट तरीके से पढ़ें। बेहतर सीखें।",

        heroSubtitle:
          "PadhAI छात्रों को व्यवस्थित सिलेबस, AI सहायता, वीडियो और प्रोग्रेस ट्रैकिंग के साथ बेहतर सीखने में मदद करता है।",

        ctaStudent: "स्टूडेंट लॉगिन",

        pillars: {
          syllabus:
            "व्यवस्थित सिलेबस और चैप्टर-वाइज पढ़ाई।",

          ai:
            "सवाल पूछें और AI से समझें।",

          video:
            "उपयोगी स्टडी वीडियो के साथ कॉन्सेप्ट सीखें।",

          progress:
            "अपनी पढ़ाई ट्रैक करें और लगातार बेहतर बनें।",
        },
      },

      login: {
        title: "स्टूडेंट लॉगिन",

        subtitle:
          "अपनी पढ़ाई जारी रखने के लिए लॉगिन करें।",

        email: "ईमेल पता",

        password: "पासवर्ड",

        emailPlaceholder:
          "अपना ईमेल दर्ज करें",

        passwordPlaceholder:
          "अपना पासवर्ड दर्ज करें",

        loginButton: "लॉगिन करें",

        loggingIn: "लॉगिन हो रहा है...",

        noAccount: "अकाउंट नहीं है?",

        signUp: "साइन अप करें",

        loginError:
          "लॉगिन नहीं हो सका। कृपया अपनी जानकारी जांचें।",
      },

      dashboard: {
        subtitle: "स्टूडेंट डैशबोर्ड",

        welcome: "PadhAI में आपका स्वागत है",

        class: "कक्षा",

        board: "बोर्ड",

        exam: "परीक्षा",

        openMenu: "मेनू खोलें",

        editProfile: "मेरी प्रोफाइल एडिट करें",

        menu: {
          syllabus: "मेरा सिलेबस",

          syllabusDesc:
            "विषय और चैप्टर",

          profile: "मेरी प्रोफाइल",

          profileDesc:
            "अपनी प्रोफाइल एडिट करें",

          lightMode: "लाइट मोड",

          darkMode: "डार्क मोड",

          changeAppearance:
            "दिखावट बदलें",

          settings: "सेटिंग्स",

          comingSoon: "जल्द आ रहा है",
        },

        cards: {
          newspaper: {
            title: "डेली न्यूज़पेपर",

            description:
              "छात्रों के लिए चुनी गई आज की महत्वपूर्ण खबरें पढ़ें।",

            action:
              "आज का पेपर पढ़ें 🔒 →",
          },

          currentAffairs: {
            title:
              "साप्ताहिक करंट अफेयर्स",

            description:
              "परीक्षाओं और सामान्य ज्ञान के लिए महत्वपूर्ण साप्ताहिक करंट अफेयर्स।",

            action:
              "करंट अफेयर्स पढ़ें →",
          },

          revision: {
            title: "क्विक रिवीजन",

            description:
              "महत्वपूर्ण कॉन्सेप्ट, फॉर्मूले और परीक्षा के पॉइंट जल्दी रिवाइज करें।",

            action: "अभी रिवाइज करें →",
          },

          ask: {
            title: "Ask PadhAI",

            description:
              "सवाल पूछें और AI से स्टेप-बाय-स्टेप उत्तर पाएं।",

            action: "अभी पूछें →",
          },

          vocab: {
            title: "Vocab Bhaiya",

            description:
              "Vocab Bhaiya के साथ अपनी इंग्लिश शब्दावली बेहतर करें।",

            action:
              "Vocab Bhaiya खोलें →",
          },

          videos: {
            title: "स्टडी वीडियो",

            description:
              "आपकी पढ़ाई के लिए उपयोगी लर्निंग वीडियो।",
          },
        },
      },

      currentAffairs: {
        label: "करंट अफेयर्स",

        title: "डेली करंट अफेयर्स",

        subtitle:
          "प्रतियोगी परीक्षाओं के लिए महत्वपूर्ण करंट अफेयर्स।",

        searchPlaceholder:
          "करंट अफेयर्स खोजें...",

        loading:
          "करंट अफेयर्स लोड हो रहे हैं...",

        loadError:
          "करंट अफेयर्स लोड नहीं हो सके।",

        allCategories:
          "सभी कैटेगरी",

        mixedTitle:
          "मिक्स करंट अफेयर्स",

        topics: "टॉपिक्स",

        mcqs: "MCQs",

        readMore: "और पढ़ें",

        emptyTitle:
          "कोई करंट अफेयर नहीं मिला",

        emptyDescription:
          "कोई दूसरी कैटेगरी या सर्च शब्द आज़माएं।",

        categories: {
          All: "सभी",

          National: "राष्ट्रीय",

          International: "अंतरराष्ट्रीय",

          "Science & Tech":
            "विज्ञान और टेक्नोलॉजी",

          Economy: "अर्थव्यवस्था",

          Sports: "खेल",

          Awards: "पुरस्कार",
        },

        categoryTitles: {
          national:
            "राष्ट्रीय अपडेट्स",

          international:
            "अंतरराष्ट्रीय मामले",

          scienceTech:
            "विज्ञान और टेक्नोलॉजी",

          economy:
            "अर्थव्यवस्था और बिज़नेस",

          sports: "खेल",

          awards:
            "पुरस्कार और नियुक्तियां",
        },

        categoryDescriptions: {
          national:
            "इस सप्ताह की महत्वपूर्ण राष्ट्रीय घटनाएं और सरकारी विकास।",

          international:
            "महत्वपूर्ण अंतरराष्ट्रीय घटनाएं और विश्व से जुड़ी खबरें।",

          scienceTech:
            "विज्ञान, तकनीक, अंतरिक्ष और इनोवेशन से जुड़े महत्वपूर्ण विकास।",

          economy:
            "अर्थव्यवस्था, बिज़नेस और वित्तीय क्षेत्र की महत्वपूर्ण खबरें।",

          sports:
            "महत्वपूर्ण खेल प्रतियोगिताएं, उपलब्धियां और बड़ी जीत।",

          awards:
            "समाचारों में महत्वपूर्ण नियुक्तियां, पुरस्कार और सम्मान।",
        },
      },
    },
  },

  hinglish: {
    translation: {
      common: {
        student: "Student",
        logout: "Logout",
        notSet: "Set nahi hai",
        premium: "PREMIUM",
        free: "FREE",
        external: "External ↗",
        comingSoon: "Coming soon",
      },

      home: {
        heroTitle:
          "Smart tareeke se padho. Better seekho.",

        heroSubtitle:
          "PadhAI students ko organised syllabus, AI help, videos aur progress tracking ke saath better learning mein help karta hai.",

        ctaStudent: "Student Login",

        pillars: {
          syllabus:
            "Organised syllabus aur chapter-wise learning.",

          ai:
            "Questions pucho aur AI se explanations pao.",

          video:
            "Useful study videos ke saath concepts seekho.",

          progress:
            "Apni learning track karo aur regularly improve karo.",
        },
      },

      login: {
        title: "Student Login",

        subtitle:
          "Apni learning journey continue karne ke liye login karo.",

        email: "Email address",

        password: "Password",

        emailPlaceholder:
          "Apna email enter karo",

        passwordPlaceholder:
          "Apna password enter karo",

        loginButton: "Login",

        loggingIn: "Login ho raha hai...",

        noAccount:
          "Account nahi hai?",

        signUp: "Sign up",

        loginError:
          "Login nahi ho saka. Credentials check karo.",
      },

      dashboard: {
        subtitle: "Student Dashboard",

        welcome:
          "PadhAI mein welcome",

        class: "Class",

        board: "Board",

        exam: "Exam",

        openMenu: "Menu kholo",

        editProfile:
          "Meri Profile Edit Karo",

        menu: {
          syllabus: "Mera Syllabus",

          syllabusDesc:
            "Subjects aur chapters",

          profile: "Meri Profile",

          profileDesc:
            "Apni profile edit karo",

          lightMode: "Light Mode",

          darkMode: "Dark Mode",

          changeAppearance:
            "Appearance change karo",

          settings: "Settings",

          comingSoon: "Coming soon",
        },

        cards: {
          newspaper: {
            title: "Daily Newspaper",

            description:
              "Students ke liye specially select ki gayi aaj ki important news padho.",

            action:
              "Aaj ka Paper Padho 🔒 →",
          },

          currentAffairs: {
            title:
              "Weekly Current Affairs",

            description:
              "Exams aur general awareness ke liye important weekly current affairs.",

            action:
              "Current Affairs Padho →",
          },

          revision: {
            title: "Quick Revision",

            description:
              "Important concepts, formulas aur exam points jaldi revise karo.",

            action:
              "Abhi Revise Karo →",
          },

          ask: {
            title: "Ask PadhAI",

            description:
              "Questions pucho aur AI se step-by-step explanation pao.",

            action: "Abhi Pucho →",
          },

          vocab: {
            title: "Vocab Bhaiya",

            description:
              "Vocab Bhaiya ke saath apni English vocabulary improve karo.",

            action:
              "Vocab Bhaiya Open Karo →",
          },

          videos: {
            title: "Study Videos",

            description:
              "Tumhari studies ke liye relevant learning videos.",
          },
        },
      },

      currentAffairs: {
        label: "Current Affairs",

        title: "Daily Current Affairs",

        subtitle:
          "Competitive exams ke liye important current affairs.",

        searchPlaceholder:
          "Current affairs search karo...",

        loading:
          "Current affairs load ho rahe hain...",

        loadError:
          "Current affairs load nahi ho sake.",

        allCategories:
          "Sabhi Categories",

        mixedTitle:
          "Mixed Current Affairs",

        topics: "topics",

        mcqs: "MCQs",

        readMore: "Aur Padho",

        emptyTitle:
          "Koi current affair nahi mila",

        emptyDescription:
          "Koi doosri category ya search term try karo.",

        categories: {
          All: "All",

          National: "National",

          International:
            "International",

          "Science & Tech":
            "Science & Tech",

          Economy: "Economy",

          Sports: "Sports",

          Awards: "Awards",
        },

        categoryTitles: {
          national:
            "National Updates",

          international:
            "International Affairs",

          scienceTech:
            "Science & Technology",

          economy:
            "Economy & Business",

          sports: "Sports",

          awards:
            "Awards & Appointments",
        },

        categoryDescriptions: {
          national:
            "Is week ke important national events aur government developments.",

          international:
            "Major international events aur important world news.",

          scienceTech:
            "Science, technology, space aur innovation ke important developments.",

          economy:
            "Important economic developments, business news aur financial updates.",

          sports:
            "Important sports events, tournaments aur major victories.",

          awards:
            "Important appointments, awards, honours aur news mein personalities.",
        },
      },
    },
  },
};

const savedLanguage =
  localStorage.getItem("padhai-language");

i18n.use(initReactI18next).init({
  resources,

  lng: savedLanguage || "en",

  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
