import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const savedLanguage =
  localStorage.getItem("padhai-language") || "en";

const resources = {
  en: {
    translation: {
      common: {
        student: "Student",
        logout: "Logout",
        notSet: "Not Set",
        premium: "PREMIUM",
        free: "FREE",
        external: "EXTERNAL",
        comingSoon: "Coming Soon",
      },

      home: {
        heroTitle:
          "Learn smarter. Prepare better.",
        heroSubtitle:
          "Your complete learning platform for competitive exam preparation.",
        ctaStudent: "Student Login",

        pillars: {
          syllabus:
            "Structured syllabus for focused preparation.",
          ai:
            "Ask PadhAI and get help with your studies.",
          video:
            "Learn with useful videos and learning resources.",
          progress:
            "Track your progress and improve every day.",
        },
      },

      studentLogin: {
        login: "Student Login",
        loginSubtitle:
          "Login to continue your learning journey",
        email: "Email",
        password: "Password",
        loginButton: "Login",
        noAccount: "Don't have an account?",
        createAccount: "Create Account",
        emailPlaceholder: "Enter your email",
        passwordPlaceholder: "Enter your password",
        loginError:
          "Unable to login. Please try again.",
      },

      dashboard: {
        subtitle:
          "Your personal learning dashboard",

        welcome:
          "Welcome back",

        class: "Class",
        board: "Board",
        exam: "Exam",

        openMenu: "Open menu",

        editProfile: "Edit Profile",

        menu: {
          syllabus: "Syllabus",
          syllabusDesc:
            "View your complete syllabus",

          profile: "My Profile",
          profileDesc:
            "View and update your profile",

          lightMode: "Light Mode",
          darkMode: "Dark Mode",

          changeAppearance:
            "Change application appearance",

          settings: "Settings",
          comingSoon:
            "This feature is coming soon",
        },

        cards: {
          newspaper: {
            title: "Daily Newspaper",
            description:
              "Read important news and daily updates.",
            action: "Open Newspaper →",
          },

          currentAffairs: {
            title: "Current Affairs",
            description:
              "Stay updated with important current affairs.",
            action: "Explore Current Affairs →",
          },

          revision: {
            title: "Quick Revision",
            description:
              "Revise important topics quickly.",
            action: "Start Revision →",
          },

          ask: {
            title: "Ask PadhAI",
            description:
              "Ask questions and get learning help.",
            action: "Ask Now →",
          },

          vocab: {
            title: "Vocab Bhaiya",
            description:
              "Improve your vocabulary and English.",
            action: "Visit Website →",
          },

          videos: {
            title: "Learning Videos",
            description:
              "Watch useful educational videos.",
          },
        },
      },

      currentAffairs: {
        label: "Current Affairs",

        title:
          "Daily Current Affairs",

        subtitle:
          "Important current affairs for competitive exams.",

        searchPlaceholder:
          "Search current affairs...",

        loading:
          "Loading current affairs...",

        loadError:
          "Unable to load current affairs.",

        allCategories:
          "All Categories",

        mixedTitle:
          "Mixed Current Affairs",

        topics: "topics",

        mcqs: "MCQs",

        readMore:
          "Read More",

        emptyTitle:
          "No current affairs found",

        emptyDescription:
          "Try another category or search term.",

        categories: {
          All: "All",
          National: "National",
          International: "International",
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

          sports:
            "Sports",

          awards:
            "Awards & Appointments",
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
        external: "बाहरी",
        comingSoon: "जल्द आ रहा है",
      },

      home: {
        heroTitle:
          "स्मार्ट तरीके से पढ़ें। बेहतर तैयारी करें।",

        heroSubtitle:
          "प्रतियोगी परीक्षाओं की तैयारी के लिए आपका संपूर्ण लर्निंग प्लेटफॉर्म।",

        ctaStudent:
          "स्टूडेंट लॉगिन",

        pillars: {
          syllabus:
            "बेहतर तैयारी के लिए व्यवस्थित सिलेबस।",

          ai:
            "PadhAI से सवाल पूछें और पढ़ाई में मदद पाएं।",

          video:
            "उपयोगी वीडियो और लर्निंग रिसोर्स के साथ सीखें।",

          progress:
            "अपनी प्रगति ट्रैक करें और हर दिन बेहतर बनें।",
        },
      },

      studentLogin: {
        login: "छात्र लॉगिन",

        loginSubtitle:
          "अपनी पढ़ाई जारी रखने के लिए लॉगिन करें",

        email: "ईमेल",

        password: "पासवर्ड",

        loginButton: "लॉगिन करें",

        noAccount:
          "अकाउंट नहीं है?",

        createAccount:
          "अकाउंट बनाएं",

        emailPlaceholder:
          "अपना ईमेल दर्ज करें",

        passwordPlaceholder:
          "अपना पासवर्ड दर्ज करें",

        loginError:
          "लॉगिन नहीं हो सका। कृपया दोबारा प्रयास करें।",
      },

      dashboard: {
        subtitle:
          "आपका व्यक्तिगत लर्निंग डैशबोर्ड",

        welcome:
          "वापस स्वागत है",

        class: "कक्षा",

        board: "बोर्ड",

        exam: "परीक्षा",

        openMenu:
          "मेनू खोलें",

        editProfile:
          "प्रोफाइल एडिट करें",

        menu: {
          syllabus: "सिलेबस",

          syllabusDesc:
            "अपना पूरा सिलेबस देखें",

          profile:
            "मेरी प्रोफाइल",

          profileDesc:
            "अपनी प्रोफाइल देखें और अपडेट करें",

          lightMode:
            "लाइट मोड",

          darkMode:
            "डार्क मोड",

          changeAppearance:
            "ऐप का लुक बदलें",

          settings:
            "सेटिंग्स",

          comingSoon:
            "यह फीचर जल्द आ रहा है",
        },

        cards: {
          newspaper: {
            title:
              "डेली न्यूज़पेपर",

            description:
              "महत्वपूर्ण समाचार और दैनिक अपडेट पढ़ें।",

            action:
              "न्यूज़पेपर खोलें →",
          },

          currentAffairs: {
            title:
              "करंट अफेयर्स",

            description:
              "महत्वपूर्ण करंट अफेयर्स से अपडेट रहें।",

            action:
              "करंट अफेयर्स देखें →",
          },

          revision: {
            title:
              "क्विक रिवीजन",

            description:
              "महत्वपूर्ण टॉपिक जल्दी रिवाइज करें।",

            action:
              "रिवीजन शुरू करें →",
          },

          ask: {
            title:
              "PadhAI से पूछें",

            description:
              "सवाल पूछें और पढ़ाई में मदद पाएं।",

            action:
              "अभी पूछें →",
          },

          vocab: {
            title:
              "Vocab Bhaiya",

            description:
              "अपनी Vocabulary और English बेहतर करें।",

            action:
              "वेबसाइट देखें →",
          },

          videos: {
            title:
              "लर्निंग वीडियो",

            description:
              "उपयोगी शैक्षणिक वीडियो देखें।",
          },
        },
      },

      currentAffairs: {
        label:
          "करंट अफेयर्स",

        title:
          "दैनिक करंट अफेयर्स",

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
          "मिक्स्ड करंट अफेयर्स",

        topics:
          "टॉपिक्स",

        mcqs:
          "MCQs",

        readMore:
          "और पढ़ें",

        emptyTitle:
          "कोई करंट अफेयर्स नहीं मिला",

        emptyDescription:
          "दूसरी कैटेगरी या सर्च शब्द आज़माएं।",

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
            "राष्ट्रीय अपडेट",

          international:
            "अंतरराष्ट्रीय मामले",

          scienceTech:
            "विज्ञान और टेक्नोलॉजी",

          economy:
            "अर्थव्यवस्था और बिजनेस",

          sports:
            "खेल",

          awards:
            "पुरस्कार और नियुक्तियां",
        },

        categoryDescriptions: {
          national:
            "इस सप्ताह की महत्वपूर्ण राष्ट्रीय घटनाएं और सरकारी विकास।",

          international:
            "प्रमुख अंतरराष्ट्रीय घटनाएं और दुनिया की महत्वपूर्ण खबरें।",

          scienceTech:
            "विज्ञान, टेक्नोलॉजी, अंतरिक्ष और इनोवेशन के महत्वपूर्ण विकास।",

          economy:
            "महत्वपूर्ण आर्थिक विकास, बिजनेस समाचार और वित्तीय अपडेट।",

          sports:
            "महत्वपूर्ण खेल आयोजन, टूर्नामेंट और उपलब्धियां।",

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
        notSet: "Set Nahi Hai",
        premium: "PREMIUM",
        free: "FREE",
        external: "EXTERNAL",
        comingSoon: "Jaldi Aa Raha Hai",
      },

      home: {
        heroTitle:
          "Smart Padho. Better Prepare Karo.",

        heroSubtitle:
          "Competitive exams ki preparation ke liye aapka complete learning platform.",

        ctaStudent:
          "Student Login",

        pillars: {
          syllabus:
            "Focused preparation ke liye structured syllabus.",

          ai:
            "PadhAI se questions pucho aur study help pao.",

          video:
            "Useful videos aur learning resources ke saath padho.",

          progress:
            "Apni progress track karo aur har din improve karo.",
        },
      },

      studentLogin: {
        login:
          "Student Login",

        loginSubtitle:
          "Apni padhai continue karne ke liye login karein",

        email:
          "Email",

        password:
          "Password",

        loginButton:
          "Login Karein",

        noAccount:
          "Account nahi hai?",

        createAccount:
          "Account Banayein",

        emailPlaceholder:
          "Apna email enter karein",

        passwordPlaceholder:
          "Apna password enter karein",

        loginError:
          "Login nahi ho saka. Kripya dobara try karein.",
      },

      dashboard: {
        subtitle:
          "Aapka personal learning dashboard",

        welcome:
          "Welcome Back",

        class:
          "Class",

        board:
          "Board",

        exam:
          "Exam",

        openMenu:
          "Menu Kholein",

        editProfile:
          "Profile Edit Karein",

        menu: {
          syllabus:
            "Syllabus",

          syllabusDesc:
            "Apna complete syllabus dekhein",

          profile:
            "Meri Profile",

          profileDesc:
            "Apni profile dekhein aur update karein",

          lightMode:
            "Light Mode",

          darkMode:
            "Dark Mode",

          changeAppearance:
            "App ka appearance badlein",

          settings:
            "Settings",

          comingSoon:
            "Ye feature jaldi aa raha hai",
        },

        cards: {
          newspaper: {
            title:
              "Daily Newspaper",

            description:
              "Important news aur daily updates padhein.",

            action:
              "Newspaper Kholein →",
          },

          currentAffairs: {
            title:
              "Current Affairs",

            description:
              "Important current affairs se updated rahein.",

            action:
              "Current Affairs Dekhein →",
          },

          revision: {
            title:
              "Quick Revision",

            description:
              "Important topics jaldi revise karein.",

            action:
              "Revision Start Karein →",
          },

          ask: {
            title:
              "Ask PadhAI",

            description:
              "Questions pucho aur learning help pao.",

            action:
              "Abhi Pucho →",
          },

          vocab: {
            title:
              "Vocab Bhaiya",

            description:
              "Apni vocabulary aur English improve karo.",

            action:
              "Website Visit Karein →",
          },

          videos: {
            title:
              "Learning Videos",

            description:
              "Useful educational videos dekhein.",
          },
        },
      },

      currentAffairs: {
        label:
          "Current Affairs",

        title:
          "Daily Current Affairs",

        subtitle:
          "Competitive exams ke liye important current affairs.",

        searchPlaceholder:
          "Current affairs search karein...",

        loading:
          "Current affairs load ho rahe hain...",

        loadError:
          "Current affairs load nahi ho sake.",

        allCategories:
          "All Categories",

        mixedTitle:
          "Mixed Current Affairs",

        topics:
          "topics",

        mcqs:
          "MCQs",

        readMore:
          "Aur Padhein",

        emptyTitle:
          "Koi current affairs nahi mila",

        emptyDescription:
          "Dusri category ya search term try karein.",

        categories: {
          All: "Sabhi",
          National: "National",
          International: "International",
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

          sports:
            "Sports",

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
            "Important economic developments aur business updates.",

          sports:
            "Important sports events, tournaments aur achievements.",

          awards:
            "Important appointments, awards aur honours.",
        },
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,

  lng: savedLanguage,

  fallbackLng: "en",

  supportedLngs: [
    "en",
    "hi",
    "hinglish",
  ],

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },
});

export default i18n;
