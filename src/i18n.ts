import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      language: {
        english: "English",
        hindi: "हिंदी",
        hinglish: "Hinglish",
      },

      nav: {
        home: "Home",
        login: "Login",
        dashboard: "Dashboard",
        currentAffairs: "Current Affairs",
      },

      home: {
        heroTitle:
          "Study smarter. Learn better. Achieve more.",
        heroSubtitle:
          "PadhAI helps students learn with structured content, AI support, videos and progress tracking.",
        ctaStudent: "Student Login",

        pillars: {
          syllabus:
            "Structured syllabus and chapter-wise learning.",
          ai:
            "AI-powered support for your questions and doubts.",
          video:
            "Relevant learning videos for better understanding.",
          progress:
            "Track your learning progress and stay consistent.",
        },
      },

      studentLogin: {
        createAccount: "Create Student Account",
        login: "Student Login",

        createAccountSubtitle:
          "Create your PadhAI student account",

        loginSubtitle:
          "Login to continue learning with PadhAI",

        fullName: "Full Name",
        fullNamePlaceholder:
          "Enter your full name",

        email: "Email",
        emailPlaceholder:
          "student@example.com",

        password: "Password",
        passwordPlaceholder:
          "Enter your password",

        pleaseWait: "Please wait...",
        create: "Create Account",
        loginButton: "Login",

        alreadyHaveAccount:
          "Already have an account?",

        dontHaveAccount:
          "Don't have an account?",

        switchToLogin: "Login",
        switchToSignup: "Create account",

        emailPasswordRequired:
          "Please enter your email and password.",

        fullNameRequired:
          "Please enter your full name.",

        passwordLength:
          "Password must be at least 6 characters.",

        accountCreated:
          "Account created! Please check your email to confirm your account.",

        accountCreateError:
          "Account could not be created.",

        loginError:
          "Unable to login. Please try again.",

        generalError:
          "Something went wrong.",
      },

      dashboard: {
        title: "Student Dashboard",

        welcome: "Welcome to PadhAI 👋",

        student: "Student",

        class: "Class",
        board: "Board",
        exam: "Exam",

        notSet: "Not set",

        menu: {
          syllabus: "My Syllabus",
          syllabusDescription:
            "Subjects & chapters",

          profile: "My Profile",
          profileDescription:
            "Edit your profile",

          lightMode: "Light Mode",
          darkMode: "Dark Mode",

          appearance:
            "Change appearance",

          settings: "Settings",

          comingSoon: "Coming soon",

          logout: "Logout",
        },

        cards: {
          newspaper: {
            title: "Daily Newspaper",
            description:
              "Read today's important news selected specially for students.",
            action:
              "Read Today's Paper 🔒 →",
            badge: "PREMIUM",
          },

          currentAffairs: {
            title: "Weekly Current Affairs",
            description:
              "Important weekly current affairs for exams and general awareness.",
            action:
              "Read Current Affairs →",
            badge: "FREE",
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
            action:
              "Open Vocab Bhaiya →",
            badge: "External ↗",
          },

          videos: {
            title: "Study Videos",
            description:
              "Relevant learning videos for your studies.",
            action: "Coming soon",
          },
        },

        editProfile: "Edit My Profile",
      },

      currentAffairs: {
        label: "Current Affairs",

        title: "Daily Current Affairs",

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

        readMore: "Read More",

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
      language: {
        english: "English",
        hindi: "हिंदी",
        hinglish: "Hinglish",
      },

      nav: {
        home: "होम",
        login: "लॉगिन",
        dashboard: "डैशबोर्ड",
        currentAffairs: "करंट अफेयर्स",
      },

      home: {
        heroTitle:
          "स्मार्ट तरीके से पढ़ें। बेहतर सीखें। अधिक हासिल करें।",

        heroSubtitle:
          "PadhAI छात्रों को संरचित कंटेंट, AI सहायता, वीडियो और प्रगति ट्रैकिंग के साथ पढ़ने में मदद करता है।",

        ctaStudent:
          "स्टूडेंट लॉगिन",

        pillars: {
          syllabus:
            "संरचित सिलेबस और चैप्टर के अनुसार पढ़ाई।",

          ai:
            "आपके सवालों और डाउट्स के लिए AI सहायता।",

          video:
            "बेहतर समझ के लिए उपयोगी लर्निंग वीडियो।",

          progress:
            "अपनी पढ़ाई की प्रगति ट्रैक करें और लगातार पढ़ें।",
        },
      },

      studentLogin: {
        createAccount:
          "स्टूडेंट अकाउंट बनाएं",

        login:
          "स्टूडेंट लॉगिन",

        createAccountSubtitle:
          "अपना PadhAI स्टूडेंट अकाउंट बनाएं",

        loginSubtitle:
          "PadhAI के साथ पढ़ाई जारी रखने के लिए लॉगिन करें",

        fullName:
          "पूरा नाम",

        fullNamePlaceholder:
          "अपना पूरा नाम दर्ज करें",

        email: "ईमेल",

        emailPlaceholder:
          "student@example.com",

        password:
          "पासवर्ड",

        passwordPlaceholder:
          "अपना पासवर्ड दर्ज करें",

        pleaseWait:
          "कृपया प्रतीक्षा करें...",

        create:
          "अकाउंट बनाएं",

        loginButton:
          "लॉगिन करें",

        alreadyHaveAccount:
          "क्या आपका पहले से अकाउंट है?",

        dontHaveAccount:
          "क्या आपका अकाउंट नहीं है?",

        switchToLogin:
          "लॉगिन करें",

        switchToSignup:
          "अकाउंट बनाएं",

        emailPasswordRequired:
          "कृपया अपना ईमेल और पासवर्ड दर्ज करें।",

        fullNameRequired:
          "कृपया अपना पूरा नाम दर्ज करें।",

        passwordLength:
          "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",

        accountCreated:
          "अकाउंट बन गया! कृपया अपने ईमेल को कन्फर्म करें।",

        accountCreateError:
          "अकाउंट नहीं बनाया जा सका।",

        loginError:
          "लॉगिन नहीं हो सका। कृपया दोबारा कोशिश करें।",

        generalError:
          "कुछ गलत हो गया।",
      },

      dashboard: {
        title:
          "स्टूडेंट डैशबोर्ड",

        welcome:
          "PadhAI में आपका स्वागत है 👋",

        student:
          "स्टूडेंट",

        class:
          "कक्षा",

        board:
          "बोर्ड",

        exam:
          "परीक्षा",

        notSet:
          "सेट नहीं है",

        menu: {
          syllabus:
            "मेरा सिलेबस",

          syllabusDescription:
            "विषय और चैप्टर",

          profile:
            "मेरी प्रोफाइल",

          profileDescription:
            "अपनी प्रोफाइल एडिट करें",

          lightMode:
            "लाइट मोड",

          darkMode:
            "डार्क मोड",

          appearance:
            "दिखावट बदलें",

          settings:
            "सेटिंग्स",

          comingSoon:
            "जल्द आ रहा है",

          logout:
            "लॉगआउट",
        },

        cards: {
          newspaper: {
            title:
              "डेली न्यूज़पेपर",

            description:
              "छात्रों के लिए चुनी गई आज की महत्वपूर्ण खबरें पढ़ें।",

            action:
              "आज का पेपर पढ़ें 🔒 →",

            badge:
              "प्रीमियम",
          },

          currentAffairs: {
            title:
              "साप्ताहिक करंट अफेयर्स",

            description:
              "परीक्षाओं और सामान्य ज्ञान के लिए महत्वपूर्ण साप्ताहिक करंट अफेयर्स।",

            action:
              "करंट अफेयर्स पढ़ें →",

            badge:
              "फ्री",
          },

          revision: {
            title:
              "क्विक रिवीजन",

            description:
              "महत्वपूर्ण कॉन्सेप्ट, फॉर्मूले और एग्जाम पॉइंट जल्दी रिवाइज करें।",

            action:
              "अभी रिवाइज करें →",
          },

          ask: {
            title:
              "PadhAI से पूछें",

            description:
              "सवाल पूछें और AI से स्टेप-बाय-स्टेप उत्तर पाएं।",

            action:
              "अभी पूछें →",
          },

          vocab: {
            title:
              "वोकैब भैया",

            description:
              "Vocab Bhaiya के साथ अपनी इंग्लिश वोकैबुलरी बेहतर करें।",

            action:
              "Vocab Bhaiya खोलें →",

            badge:
              "बाहरी ↗",
          },

          videos: {
            title:
              "स्टडी वीडियो",

            description:
              "आपकी पढ़ाई के लिए उपयोगी लर्निंग वीडियो।",

            action:
              "जल्द आ रहा है",
          },
        },

        editProfile:
          "मेरी प्रोफाइल एडिट करें",
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
          "सभी श्रेणियां",

        mixedTitle:
          "मिश्रित करंट अफेयर्स",

        topics:
          "विषय",

        mcqs:
          "MCQs",

        readMore:
          "और पढ़ें",

        emptyTitle:
          "कोई करंट अफेयर नहीं मिला",

        emptyDescription:
          "कोई अन्य श्रेणी या खोज शब्द आज़माएं।",

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
            "विज्ञान और प्रौद्योगिकी",

          economy:
            "अर्थव्यवस्था और व्यापार",

          sports:
            "खेल",

          awards:
            "पुरस्कार और नियुक्तियां",
        },

        categoryDescriptions: {
          national:
            "इस सप्ताह की महत्वपूर्ण राष्ट्रीय घटनाएं और सरकारी विकास।",

          international:
            "प्रमुख अंतरराष्ट्रीय घटनाएं और विश्व से संबंधित महत्वपूर्ण समाचार।",

          scienceTech:
            "विज्ञान, तकनीक, अंतरिक्ष और नवाचार के महत्वपूर्ण विकास।",

          economy:
            "महत्वपूर्ण आर्थिक विकास, व्यापार समाचार और वित्तीय अपडेट।",

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
      language: {
        english: "English",
        hindi: "हिंदी",
        hinglish: "Hinglish",
      },

      nav: {
        home: "Home",
        login: "Login",
        dashboard: "Dashboard",
        currentAffairs:
          "Current Affairs",
      },

      home: {
        heroTitle:
          "Smart tareeke se padho. Better seekho. Zyada achieve karo.",

        heroSubtitle:
          "PadhAI students ko structured content, AI support, videos aur progress tracking ke saath padhne mein help karta hai.",

        ctaStudent:
          "Student Login",

        pillars: {
          syllabus:
            "Structured syllabus aur chapter-wise learning.",

          ai:
            "Aapke questions aur doubts ke liye AI support.",

          video:
            "Better understanding ke liye useful learning videos.",

          progress:
            "Apni learning progress track karo aur consistent raho.",
        },
      },

      studentLogin: {
        createAccount:
          "Student Account Banao",

        login:
          "Student Login",

        createAccountSubtitle:
          "Apna PadhAI student account banao",

        loginSubtitle:
          "PadhAI ke saath learning continue karne ke liye login karo",

        fullName:
          "Full Name",

        fullNamePlaceholder:
          "Apna full name enter karo",

        email:
          "Email",

        emailPlaceholder:
          "student@example.com",

        password:
          "Password",

        passwordPlaceholder:
          "Apna password enter karo",

        pleaseWait:
          "Please wait...",

        create:
          "Account Banao",

        loginButton:
          "Login",

        alreadyHaveAccount:
          "Already account hai?",

        dontHaveAccount:
          "Account nahi hai?",

        switchToLogin:
          "Login",

        switchToSignup:
          "Account Banao",

        emailPasswordRequired:
          "Please email aur password enter karo.",

        fullNameRequired:
          "Please apna full name enter karo.",

        passwordLength:
          "Password kam se kam 6 characters ka hona chahiye.",

        accountCreated:
          "Account ban gaya! Apna email check karke account confirm karo.",

        accountCreateError:
          "Account create nahi ho saka.",

        loginError:
          "Login nahi ho saka. Please dobara try karo.",

        generalError:
          "Kuch galat ho gaya.",
      },

      dashboard: {
        title:
          "Student Dashboard",

        welcome:
          "PadhAI mein Welcome 👋",

        student:
          "Student",

        class:
          "Class",

        board:
          "Board",

        exam:
          "Exam",

        notSet:
          "Set nahi hai",

        menu: {
          syllabus:
            "My Syllabus",

          syllabusDescription:
            "Subjects aur chapters",

          profile:
            "My Profile",

          profileDescription:
            "Apni profile edit karo",

          lightMode:
            "Light Mode",

          darkMode:
            "Dark Mode",

          appearance:
            "Appearance change karo",

          settings:
            "Settings",

          comingSoon:
            "Jaldi aa raha hai",

          logout:
            "Logout",
        },

        cards: {
          newspaper: {
            title:
              "Daily Newspaper",

            description:
              "Students ke liye specially selected aaj ki important news padho.",

            action:
              "Aaj ka Paper Padho 🔒 →",

            badge:
              "PREMIUM",
          },

          currentAffairs: {
            title:
              "Weekly Current Affairs",

            description:
              "Exams aur general awareness ke liye important weekly current affairs.",

            action:
              "Current Affairs Padho →",

            badge:
              "FREE",
          },

          revision: {
            title:
              "Quick Revision",

            description:
              "Important concepts, formulas aur exam points jaldi revise karo.",

            action:
              "Abhi Revise Karo →",
          },

          ask: {
            title:
              "Ask PadhAI",

            description:
              "Questions pucho aur AI se step-by-step explanation pao.",

            action:
              "Abhi Pucho →",
          },

          vocab: {
            title:
              "Vocab Bhaiya",

            description:
              "Vocab Bhaiya ke saath apni English vocabulary improve karo.",

            action:
              "Vocab Bhaiya Open Karo →",

            badge:
              "External ↗",
          },

          videos: {
            title:
              "Study Videos",

            description:
              "Aapki studies ke liye relevant learning videos.",

            action:
              "Coming soon",
          },
        },

        editProfile:
          "My Profile Edit Karo",
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
          "Aur Padho",

        emptyTitle:
          "Koi current affair nahi mila",

        emptyDescription:
          "Dusri category ya search term try karo.",

        categories: {
          All: "Sabhi",
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
            "Important economic developments, business news aur financial updates.",

          sports:
            "Important sports events, tournaments aur achievements.",

          awards:
            "Important appointments, awards, honours aur news mein personalities.",
        },
      },
    },
  },
};

const savedLanguage =
  localStorage.getItem("padhai_language");

i18n.use(initReactI18next).init({
  resources,

  lng: savedLanguage || "en",

  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
