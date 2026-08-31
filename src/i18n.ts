import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      common: {
        student: "Student",
        admin: "Admin",
        logout: "Logout",
        premium: "Premium",
        free: "Free",
        external: "External",
        comingSoon: "Coming Soon",
        notSet: "Not set",
        back: "Back",
        loading: "Loading...",
      },

      home: {
        heroTitle: "Learn smarter. Prepare better.",
        heroSubtitle:
          "PadhAI brings learning resources, current affairs and AI-powered study support together in one place.",
        ctaStudent: "Student Login",

        pillars: {
          syllabus:
            "Follow your syllabus with focused and structured learning.",
          ai:
            "Ask PadhAI whenever you need help understanding a topic.",
          video:
            "Access useful learning content and educational resources.",
          progress:
            "Stay consistent and make steady progress in your preparation.",
        },
      },

      studentLogin: {
        login: "Student Login",
        loginSubtitle: "Login to continue your learning journey.",
        email: "Email",
        password: "Password",
        loginButton: "Login",
        noAccount: "Don't have an account?",
        createAccount: "Create Account",
        emailPlaceholder: "Enter your email",
        passwordPlaceholder: "Enter your password",
        loginError: "Unable to login. Please try again.",
      },

      dashboard: {
        subtitle: "Your learning dashboard",
        welcome: "Welcome",

        class: "Class",
        board: "Board",
        exam: "Exam",

        openMenu: "Open menu",
        editProfile: "Edit Profile",

        menu: {
          syllabus: "Syllabus",
          syllabusDesc: "View your subjects and syllabus",

          profile: "Profile",
          profileDesc: "View and update your profile",

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
              "Read important news and stay updated every day.",
            action: "Read Newspaper",
          },

          currentAffairs: {
            title: "Current Affairs",
            description:
              "Explore important weekly current affairs for your exams.",
            action: "Explore Current Affairs",
          },

          revision: {
            title: "Quick Revision",
            description:
              "Revise important topics quickly and efficiently.",
            action: "Start Revision",
          },

          ask: {
            title: "Ask PadhAI",
            description:
              "Ask questions and get help with your studies.",
            action: "Ask Now",
          },

          vocab: {
            title: "Vocab Bhaiya",
            description:
              "Improve your vocabulary with an external learning platform.",
            action: "Open Vocab Bhaiya",
          },

          videos: {
            title: "Learning Videos",
            description:
              "Watch educational videos and useful learning content.",
          },
        },
      },

      currentAffairs: {
        label: "Current Affairs",
        title: "Weekly Current Affairs",
        subtitle:
          "Important events and updates curated for your exam preparation.",

        searchPlaceholder: "Search current affairs...",
        loading: "Loading current affairs...",
        loadError:
          "Unable to load current affairs. Please try again.",

        allCategories: "All Categories",
        mixedTitle: "Latest Current Affairs",
        topics: "topics",

        mcqs: "MCQs",
        readMore: "Read More",

        emptyTitle: "No current affairs found",
        emptyDescription:
          "Try changing your search or category filter.",

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

        detail: {
          back: "Back to Current Affairs",
          whyInNews: "Why in News?",
          keyFacts: "Key Facts",
          examPoint: "Exam Point",
          staticGK: "Static GK",
          mcqs: "Practice MCQs",
          noMcqs: "No MCQs available for this topic.",
          loading: "Loading current affair...",
          notFound: "Current affair not found.",
        },
      },

      notFound: {
        title: "Page Not Found",
        body:
          "The page you are looking for does not exist or may have been moved.",
        cta: "Go Home",
      },
    },
  },

  hi: {
    translation: {
      common: {
        student: "विद्यार्थी",
        admin: "एडमिन",
        logout: "लॉग आउट",
        premium: "प्रीमियम",
        free: "फ्री",
        external: "बाहरी",
        comingSoon: "जल्द आ रहा है",
        notSet: "सेट नहीं है",
        back: "वापस",
        loading: "लोड हो रहा है...",
      },

      home: {
        heroTitle: "स्मार्ट तरीके से पढ़ें। बेहतर तैयारी करें।",
        heroSubtitle:
          "PadhAI आपके लिए पढ़ाई के संसाधन, करंट अफेयर्स और AI आधारित सहायता एक ही जगह लाता है।",
        ctaStudent: "स्टूडेंट लॉगिन",

        pillars: {
          syllabus:
            "अपने सिलेबस के अनुसार व्यवस्थित और केंद्रित पढ़ाई करें।",
          ai:
            "किसी भी विषय में मदद के लिए PadhAI से पूछें।",
          video:
            "उपयोगी शैक्षणिक सामग्री और लर्निंग रिसोर्स प्राप्त करें।",
          progress:
            "नियमित पढ़ाई करें और अपनी तैयारी में लगातार प्रगति करें।",
        },
      },

      studentLogin: {
        login: "स्टूडेंट लॉगिन",
        loginSubtitle:
          "अपनी पढ़ाई जारी रखने के लिए लॉगिन करें।",
        email: "ईमेल",
        password: "पासवर्ड",
        loginButton: "लॉगिन करें",
        noAccount: "अकाउंट नहीं है?",
        createAccount: "अकाउंट बनाएं",
        emailPlaceholder: "अपना ईमेल दर्ज करें",
        passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
        loginError:
          "लॉगिन नहीं हो सका। कृपया दोबारा प्रयास करें।",
      },

      dashboard: {
        subtitle: "आपका लर्निंग डैशबोर्ड",
        welcome: "स्वागत है",

        class: "कक्षा",
        board: "बोर्ड",
        exam: "परीक्षा",

        openMenu: "मेनू खोलें",
        editProfile: "प्रोफाइल एडिट करें",

        menu: {
          syllabus: "सिलेबस",
          syllabusDesc: "अपने विषय और सिलेबस देखें",

          profile: "प्रोफाइल",
          profileDesc: "अपनी प्रोफाइल देखें और अपडेट करें",

          lightMode: "लाइट मोड",
          darkMode: "डार्क मोड",
          changeAppearance: "थीम बदलें",

          settings: "सेटिंग्स",
          comingSoon: "जल्द आ रहा है",
        },

        cards: {
          newspaper: {
            title: "डेली न्यूज़पेपर",
            description:
              "हर दिन महत्वपूर्ण समाचार पढ़ें और अपडेट रहें।",
            action: "न्यूज़पेपर पढ़ें",
          },

          currentAffairs: {
            title: "करंट अफेयर्स",
            description:
              "परीक्षा के लिए महत्वपूर्ण साप्ताहिक करंट अफेयर्स पढ़ें।",
            action: "करंट अफेयर्स देखें",
          },

          revision: {
            title: "क्विक रिवीजन",
            description:
              "महत्वपूर्ण विषयों का जल्दी रिवीजन करें।",
            action: "रिवीजन शुरू करें",
          },

          ask: {
            title: "Ask PadhAI",
            description:
              "अपने सवाल पूछें और पढ़ाई में सहायता प्राप्त करें।",
            action: "अभी पूछें",
          },

          vocab: {
            title: "Vocab Bhaiya",
            description:
              "वोकैबुलरी बेहतर बनाने के लिए लर्निंग प्लेटफॉर्म।",
            action: "Vocab Bhaiya खोलें",
          },

          videos: {
            title: "लर्निंग वीडियो",
            description:
              "शैक्षणिक वीडियो और उपयोगी लर्निंग कंटेंट देखें।",
          },
        },
      },

      currentAffairs: {
        label: "करंट अफेयर्स",
        title: "साप्ताहिक करंट अफेयर्स",
        subtitle:
          "आपकी परीक्षा की तैयारी के लिए महत्वपूर्ण घटनाएं और अपडेट।",

        searchPlaceholder: "करंट अफेयर्स खोजें...",
        loading: "करंट अफेयर्स लोड हो रहे हैं...",
        loadError:
          "करंट अफेयर्स लोड नहीं हो सके। कृपया दोबारा प्रयास करें।",

        allCategories: "सभी श्रेणियां",
        mixedTitle: "नवीनतम करंट अफेयर्स",
        topics: "टॉपिक्स",

        mcqs: "MCQs",
        readMore: "और पढ़ें",

        emptyTitle: "कोई करंट अफेयर नहीं मिला",
        emptyDescription:
          "अपनी खोज या कैटेगरी फ़िल्टर बदलकर देखें।",

        categories: {
          All: "सभी",
          National: "राष्ट्रीय",
          International: "अंतरराष्ट्रीय",
          "Science & Tech": "विज्ञान और टेक्नोलॉजी",
          Economy: "अर्थव्यवस्था",
          Sports: "खेल",
          Awards: "पुरस्कार",
        },

        categoryTitles: {
          national: "राष्ट्रीय अपडेट",
          international: "अंतरराष्ट्रीय मामले",
          scienceTech: "विज्ञान और टेक्नोलॉजी",
          economy: "अर्थव्यवस्था और बिजनेस",
          sports: "खेल",
          awards: "पुरस्कार और नियुक्तियां",
        },

        categoryDescriptions: {
          national:
            "महत्वपूर्ण राष्ट्रीय घटनाएं और सरकारी विकास।",

          international:
            "महत्वपूर्ण अंतरराष्ट्रीय घटनाएं और वैश्विक विकास।",

          scienceTech:
            "विज्ञान, टेक्नोलॉजी, अंतरिक्ष और इनोवेशन के महत्वपूर्ण विकास।",

          economy:
            "अर्थव्यवस्था, बिजनेस और वित्तीय जगत की महत्वपूर्ण खबरें।",

          sports:
            "महत्वपूर्ण खेल आयोजन, उपलब्धियां और जीत।",

          awards:
            "महत्वपूर्ण नियुक्तियां, पुरस्कार और सम्मान।",
        },

        detail: {
          back: "करंट अफेयर्स पर वापस जाएं",
          whyInNews: "खबरों में क्यों?",
          keyFacts: "मुख्य तथ्य",
          examPoint: "परीक्षा के लिए महत्वपूर्ण",
          staticGK: "स्टैटिक GK",
          mcqs: "अभ्यास MCQs",
          noMcqs:
            "इस विषय के लिए कोई MCQ उपलब्ध नहीं है।",
          loading: "करंट अफेयर लोड हो रहा है...",
          notFound: "करंट अफेयर नहीं मिला।",
        },
      },

      notFound: {
        title: "पेज नहीं मिला",
        body:
          "आप जिस पेज को खोज रहे हैं वह मौजूद नहीं है या स्थानांतरित हो गया है।",
        cta: "होम पर जाएं",
      },
    },
  },

  hinglish: {
    translation: {
      common: {
        student: "Student",
        admin: "Admin",
        logout: "Logout",
        premium: "Premium",
        free: "Free",
        external: "External",
        comingSoon: "Coming Soon",
        notSet: "Set nahi hai",
        back: "Back",
        loading: "Loading...",
      },

      home: {
        heroTitle:
          "Smart tareeke se padho. Better preparation karo.",
        heroSubtitle:
          "PadhAI mein learning resources, current affairs aur AI study support ek hi jagah milta hai.",
        ctaStudent: "Student Login",

        pillars: {
          syllabus:
            "Apne syllabus ke according focused aur structured study karo.",
          ai:
            "Jab bhi kisi topic mein help chahiye ho, PadhAI se pucho.",
          video:
            "Useful educational content aur learning resources access karo.",
          progress:
            "Regular study karo aur preparation mein progress banao.",
        },
      },

      studentLogin: {
        login: "Student Login",
        loginSubtitle:
          "Apni learning journey continue karne ke liye login karo.",
        email: "Email",
        password: "Password",
        loginButton: "Login",
        noAccount: "Account nahi hai?",
        createAccount: "Account Banao",
        emailPlaceholder: "Apna email enter karo",
        passwordPlaceholder: "Apna password enter karo",
        loginError:
          "Login nahi ho paya. Please dobara try karo.",
      },

      dashboard: {
        subtitle: "Tumhara learning dashboard",
        welcome: "Welcome",

        class: "Class",
        board: "Board",
        exam: "Exam",

        openMenu: "Menu kholo",
        editProfile: "Profile Edit Karo",

        menu: {
          syllabus: "Syllabus",
          syllabusDesc:
            "Apne subjects aur syllabus dekho",

          profile: "Profile",
          profileDesc:
            "Apni profile dekho aur update karo",

          lightMode: "Light Mode",
          darkMode: "Dark Mode",
          changeAppearance: "Appearance change karo",

          settings: "Settings",
          comingSoon: "Jaldi aa raha hai",
        },

        cards: {
          newspaper: {
            title: "Daily Newspaper",
            description:
              "Roz important news padho aur updated raho.",
            action: "Newspaper Padho",
          },

          currentAffairs: {
            title: "Current Affairs",
            description:
              "Exam ke liye important weekly current affairs explore karo.",
            action: "Current Affairs Dekho",
          },

          revision: {
            title: "Quick Revision",
            description:
              "Important topics ko jaldi revise karo.",
            action: "Revision Start Karo",
          },

          ask: {
            title: "Ask PadhAI",
            description:
              "Apne questions pucho aur study help lo.",
            action: "Abhi Pucho",
          },

          vocab: {
            title: "Vocab Bhaiya",
            description:
              "Vocabulary improve karne ke liye learning platform.",
            action: "Vocab Bhaiya Open Karo",
          },

          videos: {
            title: "Learning Videos",
            description:
              "Educational videos aur useful learning content dekho.",
          },
        },
      },

      currentAffairs: {
        label: "Current Affairs",
        title: "Weekly Current Affairs",
        subtitle:
          "Exam preparation ke liye important events aur updates.",

        searchPlaceholder: "Current affairs search karo...",
        loading: "Current affairs load ho rahe hain...",
        loadError:
          "Current affairs load nahi ho sake. Dobara try karo.",

        allCategories: "All Categories",
        mixedTitle: "Latest Current Affairs",
        topics: "topics",

        mcqs: "MCQs",
        readMore: "Aur Padho",

        emptyTitle: "Koi current affair nahi mila",
        emptyDescription:
          "Search ya category filter change karke dekho.",

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
            "Important national events aur government developments.",

          international:
            "Major international events aur global developments.",

          scienceTech:
            "Science, technology, space aur innovation ke important developments.",

          economy:
            "Economy, business aur financial updates.",

          sports:
            "Important sports events aur achievements.",

          awards:
            "Important appointments, awards aur honours.",
        },

        detail: {
          back: "Current Affairs par wapas jao",
          whyInNews: "News mein kyun hai?",
          keyFacts: "Important Facts",
          examPoint: "Exam Point",
          staticGK: "Static GK",
          mcqs: "Practice MCQs",
          noMcqs:
            "Is topic ke liye koi MCQ available nahi hai.",
          loading: "Current affair load ho raha hai...",
          notFound: "Current affair nahi mila.",
        },
      },

      notFound: {
        title: "Page Nahi Mila",
        body:
          "Jo page tum search kar rahe ho woh exist nahi karta ya move ho gaya hai.",
        cta: "Home Jao",
      },
    },
  },
};

const savedLanguage =
  localStorage.getItem("padhai-language") || "en";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
