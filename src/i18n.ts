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
        notSet: "Not set",
        premium: "Premium",
        free: "Free",
        external: "External",
        comingSoon: "Coming Soon",
      },

      home: {
        heroTitle:
          "Your smarter way to prepare for competitive exams.",
        heroSubtitle:
          "Learn with structured study material, AI assistance, current affairs and powerful learning tools.",
        ctaStudent: "Student Login",

        pillars: {
          syllabus:
            "Structured syllabus and focused study resources.",
          ai:
            "Ask PadhAI AI whenever you need help.",
          video:
            "Useful learning content and study resources.",
          progress:
            "Stay focused and keep improving every day.",
        },
      },

      studentLogin: {
        login: "Student Login",
        loginSubtitle:
          "Sign in to continue your learning journey",
        email: "Email",
        password: "Password",
        loginButton: "Login",
        noAccount: "Don't have an account?",
        createAccount: "Create Account",
        loggingIn: "Logging in...",
        loginError:
          "Unable to login. Please check your credentials.",
      },

      dashboard: {
        subtitle:
          "Your learning dashboard",

        welcome:
          "Welcome back",

        class: "Class",
        board: "Board",
        exam: "Exam",

        openMenu: "Open menu",

        editProfile:
          "Edit Profile",

        menu: {
          syllabus: "Syllabus",
          syllabusDesc:
            "View your subjects and syllabus",

          profile: "Profile",
          profileDesc:
            "View and edit your profile",

          lightMode: "Light Mode",
          darkMode: "Dark Mode",

          changeAppearance:
            "Change app appearance",

          settings: "Settings",
          comingSoon: "Coming soon",
        },

        cards: {
          newspaper: {
            title: "Daily Newspaper",
            description:
              "Read important news and daily updates.",
            action: "Open Newspaper",
          },

          currentAffairs: {
            title: "Current Affairs",
            description:
              "Important current affairs for competitive exams.",
            action: "Explore Current Affairs",
          },

          revision: {
            title: "Quick Revision",
            description:
              "Revise important topics quickly.",
            action: "Start Revision",
          },

          ask: {
            title: "Ask PadhAI",
            description:
              "Ask questions and get AI-powered help.",
            action: "Ask Now",
          },

          vocab: {
            title: "Vocab Bhaiya",
            description:
              "Improve your vocabulary with useful resources.",
            action: "Open Vocab Bhaiya",
          },

          videos: {
            title: "Learning Videos",
            description:
              "Watch useful educational and learning videos.",
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

        topics:
          "topics",

        mcqs:
          "MCQs",

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
            "Important national events and government-related developments.",

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
        logout: "लॉग आउट",
        notSet: "सेट नहीं है",
        premium: "प्रीमियम",
        free: "मुफ्त",
        external: "बाहरी",
        comingSoon: "जल्द आ रहा है",
      },

      home: {
        heroTitle:
          "प्रतियोगी परीक्षाओं की तैयारी का स्मार्ट तरीका।",

        heroSubtitle:
          "स्ट्रक्चर्ड स्टडी मटेरियल, AI सहायता, करेंट अफेयर्स और उपयोगी लर्निंग टूल्स के साथ पढ़ाई करें।",

        ctaStudent:
          "स्टूडेंट लॉगिन",

        pillars: {
          syllabus:
            "स्ट्रक्चर्ड सिलेबस और फोकस्ड स्टडी रिसोर्सेज।",

          ai:
            "जब भी मदद चाहिए PadhAI AI से पूछें।",

          video:
            "उपयोगी लर्निंग कंटेंट और स्टडी रिसोर्सेज।",

          progress:
            "फोकस बनाए रखें और हर दिन बेहतर बनें।",
        },
      },

      studentLogin: {
        login:
          "स्टूडेंट लॉगिन",

        loginSubtitle:
          "अपनी पढ़ाई जारी रखने के लिए साइन इन करें",

        email:
          "ईमेल",

        password:
          "पासवर्ड",

        loginButton:
          "लॉगिन करें",

        noAccount:
          "क्या आपका अकाउंट नहीं है?",

        createAccount:
          "अकाउंट बनाएं",

        loggingIn:
          "लॉगिन हो रहा है...",

        loginError:
          "लॉगिन नहीं हो पाया। कृपया अपनी जानकारी जांचें।",
      },

      dashboard: {
        subtitle:
          "आपका लर्निंग डैशबोर्ड",

        welcome:
          "वापस स्वागत है",

        class:
          "कक्षा",

        board:
          "बोर्ड",

        exam:
          "परीक्षा",

        openMenu:
          "मेनू खोलें",

        editProfile:
          "प्रोफाइल एडिट करें",

        menu: {
          syllabus:
            "सिलेबस",

          syllabusDesc:
            "अपने विषय और सिलेबस देखें",

          profile:
            "प्रोफाइल",

          profileDesc:
            "अपनी प्रोफाइल देखें और एडिट करें",

          lightMode:
            "लाइट मोड",

          darkMode:
            "डार्क मोड",

          changeAppearance:
            "ऐप का लुक बदलें",

          settings:
            "सेटिंग्स",

          comingSoon:
            "जल्द आ रहा है",
        },

        cards: {
          newspaper: {
            title:
              "डेली न्यूज़पेपर",

            description:
              "महत्वपूर्ण समाचार और दैनिक अपडेट पढ़ें।",

            action:
              "न्यूज़पेपर खोलें",
          },

          currentAffairs: {
            title:
              "करेंट अफेयर्स",

            description:
              "प्रतियोगी परीक्षाओं के लिए महत्वपूर्ण करेंट अफेयर्स।",

            action:
              "करेंट अफेयर्स देखें",
          },

          revision: {
            title:
              "क्विक रिवीजन",

            description:
              "महत्वपूर्ण टॉपिक्स का जल्दी रिवीजन करें।",

            action:
              "रिवीजन शुरू करें",
          },

          ask: {
            title:
              "Ask PadhAI",

            description:
              "सवाल पूछें और AI की मदद प्राप्त करें।",

            action:
              "अभी पूछें",
          },

          vocab: {
            title:
              "Vocab Bhaiya",

            description:
              "उपयोगी रिसोर्सेज के साथ अपनी शब्दावली बेहतर बनाएं।",

            action:
              "Vocab Bhaiya खोलें",
          },

          videos: {
            title:
              "लर्निंग वीडियो",

            description:
              "उपयोगी एजुकेशनल और लर्निंग वीडियो देखें।",
          },
        },
      },

      currentAffairs: {
        label:
          "करेंट अफेयर्स",

        title:
          "डेली करेंट अफेयर्स",

        subtitle:
          "प्रतियोगी परीक्षाओं के लिए महत्वपूर्ण करेंट अफेयर्स।",

        searchPlaceholder:
          "करेंट अफेयर्स खोजें...",

        loading:
          "करेंट अफेयर्स लोड हो रहे हैं...",

        loadError:
          "करेंट अफेयर्स लोड नहीं हो पाए।",

        allCategories:
          "सभी श्रेणियां",

        mixedTitle:
          "सभी करेंट अफेयर्स",

        topics:
          "टॉपिक्स",

        mcqs:
          "MCQs",

        readMore:
          "और पढ़ें",

        emptyTitle:
          "कोई करेंट अफेयर्स नहीं मिला",

        emptyDescription:
          "दूसरी कैटेगरी या सर्च शब्द आज़माएं।",

        categories: {
          All: "सभी",
          National: "राष्ट्रीय",
          International: "अंतरराष्ट्रीय",
          "Science & Tech":
            "विज्ञान और तकनीक",
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
            "विज्ञान और तकनीक",

          economy:
            "अर्थव्यवस्था और बिजनेस",

          sports:
            "खेल",

          awards:
            "पुरस्कार और नियुक्तियां",
        },

        categoryDescriptions: {
          national:
            "महत्वपूर्ण राष्ट्रीय घटनाएं और सरकारी विकास।",

          international:
            "प्रमुख अंतरराष्ट्रीय घटनाएं और विश्व से जुड़ी महत्वपूर्ण खबरें।",

          scienceTech:
            "विज्ञान, तकनीक, अंतरिक्ष और इनोवेशन से जुड़े महत्वपूर्ण विकास।",

          economy:
            "महत्वपूर्ण आर्थिक विकास और बिजनेस अपडेट।",

          sports:
            "महत्वपूर्ण खेल प्रतियोगिताएं और उपलब्धियां।",

          awards:
            "महत्वपूर्ण नियुक्तियां, पुरस्कार और समाचारों में रहने वाली हस्तियां।",
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
        premium: "Premium",
        free: "Free",
        external: "External",
        comingSoon: "Coming Soon",
      },

      home: {
        heroTitle:
          "Competitive exams ki preparation ka smarter way.",

        heroSubtitle:
          "Structured study material, AI help, current affairs aur powerful learning tools ke saath padho.",

        ctaStudent:
          "Student Login",

        pillars: {
          syllabus:
            "Structured syllabus aur focused study resources.",

          ai:
            "Jab bhi help chahiye PadhAI AI se poocho.",

          video:
            "Useful learning content aur study resources.",

          progress:
            "Focused raho aur har din improve karo.",
        },
      },

      studentLogin: {
        login:
          "Student Login",

        loginSubtitle:
          "Apni learning journey continue karne ke liye sign in karo",

        email:
          "Email",

        password:
          "Password",

        loginButton:
          "Login",

        noAccount:
          "Account nahi hai?",

        createAccount:
          "Account Banao",

        loggingIn:
          "Login ho raha hai...",

        loginError:
          "Login nahi ho paya. Apni details check karo.",
      },

      dashboard: {
        subtitle:
          "Tumhara learning dashboard",

        welcome:
          "Welcome back",

        class:
          "Class",

        board:
          "Board",

        exam:
          "Exam",

        openMenu:
          "Menu kholo",

        editProfile:
          "Profile Edit Karo",

        menu: {
          syllabus:
            "Syllabus",

          syllabusDesc:
            "Apne subjects aur syllabus dekho",

          profile:
            "Profile",

          profileDesc:
            "Apni profile dekho aur edit karo",

          lightMode:
            "Light Mode",

          darkMode:
            "Dark Mode",

          changeAppearance:
            "App ka appearance badlo",

          settings:
            "Settings",

          comingSoon:
            "Coming Soon",
        },

        cards: {
          newspaper: {
            title:
              "Daily Newspaper",

            description:
              "Important news aur daily updates padho.",

            action:
              "Newspaper Open Karo",
          },

          currentAffairs: {
            title:
              "Current Affairs",

            description:
              "Competitive exams ke liye important current affairs.",

            action:
              "Current Affairs Explore Karo",
          },

          revision: {
            title:
              "Quick Revision",

            description:
              "Important topics ko jaldi revise karo.",

            action:
              "Revision Start Karo",
          },

          ask: {
            title:
              "Ask PadhAI",

            description:
              "Questions poocho aur AI-powered help pao.",

            action:
              "Abhi Poocho",
          },

          vocab: {
            title:
              "Vocab Bhaiya",

            description:
              "Useful resources ke saath vocabulary improve karo.",

            action:
              "Vocab Bhaiya Open Karo",
          },

          videos: {
            title:
              "Learning Videos",

            description:
              "Useful educational aur learning videos dekho.",
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
          "Current affairs search karo...",

        loading:
          "Current affairs load ho rahe hain...",

        loadError:
          "Current affairs load nahi ho paaye.",

        allCategories:
          "All Categories",

        mixedTitle:
          "Mixed Current Affairs",

        topics:
          "topics",

        mcqs:
          "MCQs",

        readMore:
          "Aur Padho",

        emptyTitle:
          "Koi current affair nahi mila",

        emptyDescription:
          "Dusri category ya search term try karo.",

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
            "Important national events aur government related developments.",

          international:
            "Major international events aur important world news.",

          scienceTech:
            "Science, technology, space aur innovation ke important developments.",

          economy:
            "Important economic developments aur business updates.",

          sports:
            "Important sports events aur major achievements.",

          awards:
            "Important appointments, awards aur news mein rehne wali personalities.",
        },
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,

  lng: savedLanguage,

  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },
});

export default i18n;
