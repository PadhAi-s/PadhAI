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
        search: "Search",
        retry: "Retry",
        readMore: "Read More",
        viewAll: "View All",
        next: "Next",
        previous: "Previous",
        submit: "Submit",
        score: "Score",
        answer: "Answer",
        explanation: "Explanation",
      },

      language: {
        english: "English",
        hindi: "हिंदी",
        hinglish: "Hinglish",
      },

      home: {
        heroTitle: "Learn smarter. Prepare better.",
        heroSubtitle:
          "VIDYZEN brings learning resources, current affairs and AI-powered study support together in one place.",
        ctaStudent: "Student Login",

        pillars: {
          syllabus:
            "Follow your syllabus with focused and structured learning.",
          ai:
            "Ask Vidhya whenever you need help understanding a topic.",
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
            title: "Daily Current Affairs",
            description:
              "Explore important current affairs for your exams.",
            action: "Explore Current Affairs",
          },

          revision: {
            title: "Fast Revision",
            description:
              "Revise important topics quickly and efficiently.",
            action: "Start Revision",
          },

          ask: {
            title: "Ask Vidhya",
            description:
              "Ask questions and get help with your studies.",
            action: "Ask Now",
          },

          vocab: {
            title: "English Vocabulary",
            description:
              "Improve your English vocabulary with useful learning content.",
            action: "Open Vocabulary",
          },

          videos: {
            title: "Learning Videos",
            description:
              "Watch educational videos and useful learning content.",
          },

          whatsInNews: {
            title: "What's in News?",
            description:
              "Understand important news and why it matters for your exams.",
            action: "Explore News",
          },

          about: {
            title: "About VIDYZEN",
            description:
              "Learn more about VIDYZEN and its learning platform.",
            action: "Learn More",
          },
        },
      },

      currentAffairs: {
        label: "Current Affairs",
        title: "Daily Current Affairs",
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

      fastRevision: {
        title: "Fast Revision",
        subtitle:
          "Revise important topics quickly with AI-powered revision cards and quizzes.",
        subject: "Subject",
        topic: "Topic",
        difficulty: "Difficulty",
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
        generate: "Generate Revision",
        generating: "Generating...",
        cards: "Revision Cards",
        quiz: "Quiz",
        next: "Next",
        previous: "Previous",
        submit: "Submit",
        score: "Your Score",
        tryAgain: "Try Again",
      },

      askVidhya: {
        title: "Ask Vidhya",
        subtitle:
          "Ask questions and get help with your studies.",
        placeholder: "Ask Vidhya anything...",
        thinking: "Vidhya is thinking...",
        send: "Send",
        newChat: "New Chat",
        history: "Chat History",
        noHistory: "No previous chats.",
        unableToConnect:
          "Unable to connect with Vidhya. Please try again.",
      },

      newspaper: {
        title: "Daily Newspaper",
        subtitle:
          "Read daily newspaper updates in a simple, student-friendly format.",
        loading: "Loading newspaper...",
        error:
          "Unable to load newspaper. Please try again.",
        noNews: "No newspaper available.",
        read: "Read Newspaper",
      },

      vocabulary: {
        title: "English Vocabulary",
        subtitle:
          "Improve your English vocabulary with useful words and meanings.",
        open: "Open Vocabulary",
      },

      videos: {
        title: "Learning Videos",
        subtitle:
          "Useful educational videos and learning resources.",
        comingSoon: "Video Learning Coming Soon",
      },

      about: {
        title: "About VIDYZEN",
        description:
          "VIDYZEN is a student-focused learning platform designed to make exam preparation simpler, smarter and more effective.",
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
        search: "खोजें",
        retry: "फिर से प्रयास करें",
        readMore: "और पढ़ें",
        viewAll: "सभी देखें",
        next: "अगला",
        previous: "पिछला",
        submit: "जमा करें",
        score: "स्कोर",
        answer: "उत्तर",
        explanation: "व्याख्या",
      },

      language: {
        english: "English",
        hindi: "हिंदी",
        hinglish: "Hinglish",
      },

      home: {
        heroTitle: "स्मार्ट तरीके से पढ़ें। बेहतर तैयारी करें।",
        heroSubtitle:
          "VIDYZEN आपके लिए पढ़ाई के संसाधन, करंट अफेयर्स और AI आधारित सहायता एक ही जगह लाता है।",
        ctaStudent: "स्टूडेंट लॉगिन",

        pillars: {
          syllabus:
            "अपने सिलेबस के अनुसार व्यवस्थित और केंद्रित पढ़ाई करें।",
          ai:
            "किसी भी विषय को समझने में मदद के लिए विध्या से पूछें।",
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
            title: "दैनिक करेंट अफेयर्स",
            description:
              "परीक्षा के लिए महत्वपूर्ण करेंट अफेयर्स पढ़ें।",
            action: "करंट अफेयर्स देखें",
          },

          revision: {
            title: "फास्ट रिवीजन",
            description:
              "महत्वपूर्ण विषयों का जल्दी और प्रभावी रिवीजन करें।",
            action: "रिवीजन शुरू करें",
          },

          ask: {
            title: "विध्या से पूछें",
            description:
              "अपने सवाल पूछें और पढ़ाई में सहायता प्राप्त करें।",
            action: "अभी पूछें",
          },

          vocab: {
            title: "अंग्रेज़ी शब्दावली",
            description:
              "उपयोगी कंटेंट की मदद से अपनी अंग्रेज़ी शब्दावली बेहतर करें।",
            action: "वोकैबुलरी खोलें",
          },

          videos: {
            title: "लर्निंग वीडियो",
            description:
              "शैक्षणिक वीडियो और उपयोगी लर्निंग कंटेंट देखें।",
          },

          whatsInNews: {
            title: "खबरों में क्या है?",
            description:
              "महत्वपूर्ण खबरों को समझें और जानें कि वे परीक्षा के लिए क्यों महत्वपूर्ण हैं।",
            action: "खबरें देखें",
          },

          about: {
            title: "VIDYZEN के बारे में",
            description:
              "VIDYZEN और उसके लर्निंग प्लेटफॉर्म के बारे में जानें।",
            action: "और जानें",
          },
        },
      },

      currentAffairs: {
        label: "करंट अफेयर्स",
        title: "दैनिक करेंट अफेयर्स",
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

      fastRevision: {
        title: "फास्ट रिवीजन",
        subtitle:
          "AI की मदद से महत्वपूर्ण विषयों का जल्दी रिवीजन करें।",
        subject: "विषय",
        topic: "टॉपिक",
        difficulty: "कठिनाई",
        easy: "आसान",
        medium: "मध्यम",
        hard: "कठिन",
        generate: "रिवीजन तैयार करें",
        generating: "तैयार हो रहा है...",
        cards: "रिवीजन कार्ड्स",
        quiz: "क्विज़",
        next: "अगला",
        previous: "पिछला",
        submit: "जमा करें",
        score: "आपका स्कोर",
        tryAgain: "फिर से प्रयास करें",
      },

      askVidhya: {
        title: "विध्या से पूछें",
        subtitle:
          "अपने सवाल पूछें और पढ़ाई में सहायता प्राप्त करें।",
        placeholder: "विध्या से कुछ भी पूछें...",
        thinking: "विध्या सोच रही है...",
        send: "भेजें",
        newChat: "नई चैट",
        history: "चैट हिस्ट्री",
        noHistory: "कोई पुरानी चैट नहीं है।",
        unableToConnect:
          "विध्या से कनेक्ट नहीं हो पाया। कृपया दोबारा प्रयास करें।",
      },

      newspaper: {
        title: "डेली न्यूज़पेपर",
        subtitle:
          "सरल और छात्र-अनुकूल तरीके से रोज़ के समाचार पढ़ें।",
        loading: "न्यूज़पेपर लोड हो रहा है...",
        error:
          "न्यूज़पेपर लोड नहीं हो सका। कृपया दोबारा प्रयास करें।",
        noNews: "कोई न्यूज़पेपर उपलब्ध नहीं है।",
        read: "न्यूज़पेपर पढ़ें",
      },

      vocabulary: {
        title: "अंग्रेज़ी शब्दावली",
        subtitle:
          "उपयोगी शब्दों और उनके अर्थों से अपनी अंग्रेज़ी शब्दावली बेहतर करें।",
        open: "वोकैबुलरी खोलें",
      },

      videos: {
        title: "लर्निंग वीडियो",
        subtitle:
          "उपयोगी शैक्षणिक वीडियो और लर्निंग रिसोर्स।",
        comingSoon: "वीडियो लर्निंग जल्द आ रही है",
      },

      about: {
        title: "VIDYZEN के बारे में",
        description:
          "VIDYZEN एक छात्र-केंद्रित लर्निंग प्लेटफॉर्म है जो परीक्षा की तैयारी को आसान, स्मार्ट और प्रभावी बनाने के लिए बनाया गया है।",
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
        comingSoon: "Jaldi aa raha hai",
        notSet: "Set nahi hai",
        back: "Back",
        loading: "Loading...",
        search: "Search",
        retry: "Dobara try karo",
        readMore: "Aur Padho",
        viewAll: "Sabhi Dekho",
        next: "Next",
        previous: "Previous",
        submit: "Submit",
        score: "Score",
        answer: "Answer",
        explanation: "Explanation",
      },

      language: {
        english: "English",
        hindi: "हिंदी",
        hinglish: "Hinglish",
      },

      home: {
        heroTitle:
          "Smart tareeke se padho. Better preparation karo.",
        heroSubtitle:
          "VIDYZEN mein learning resources, current affairs aur AI study support ek hi jagah milta hai.",
        ctaStudent: "Student Login",

        pillars: {
          syllabus:
            "Apne syllabus ke according focused aur structured study karo.",
          ai:
            "Jab bhi kisi topic mein help chahiye ho, Vidhya se pucho.",
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
            title: "Daily Current Affairs",
            description:
              "Exam ke liye important current affairs explore karo.",
            action: "Current Affairs Dekho",
          },

          revision: {
            title: "Fast Revision",
            description:
              "Important topics ko jaldi aur efficiently revise karo.",
            action: "Revision Start Karo",
          },

          ask: {
            title: "Ask Vidhya",
            description:
              "Apne questions pucho aur study help lo.",
            action: "Abhi Pucho",
          },

          vocab: {
            title: "English Vocabulary",
            description:
              "Useful learning content se apni English vocabulary improve karo.",
            action: "Vocabulary Open Karo",
          },

          videos: {
            title: "Learning Videos",
            description:
              "Educational videos aur useful learning content dekho.",
          },

          whatsInNews: {
            title: "What's in News?",
            description:
              "Important news samjho aur dekho ki exam ke liye kyun important hai.",
            action: "News Dekho",
          },

          about: {
            title: "VIDYZEN ke baare mein",
            description:
              "VIDYZEN aur uske learning platform ke baare mein jaano.",
            action: "Aur Jaano",
          },
        },
      },

      currentAffairs: {
        label: "Current Affairs",
        title: "Daily Current Affairs",
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

      fastRevision: {
        title: "Fast Revision",
        subtitle:
          "AI ki help se important topics ko quickly revise karo.",
        subject: "Subject",
        topic: "Topic",
        difficulty: "Difficulty",
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
        generate: "Revision Generate Karo",
        generating: "Generate ho raha hai...",
        cards: "Revision Cards",
        quiz: "Quiz",
        next: "Next",
        previous: "Previous",
        submit: "Submit",
        score: "Tumhara Score",
        tryAgain: "Dobara Try Karo",
      },

      askVidhya: {
        title: "Ask Vidhya",
        subtitle:
          "Apne questions pucho aur study help lo.",
        placeholder: "Vidhya se kuch bhi pucho...",
        thinking: "Vidhya soch rahi hai...",
        send: "Send",
        newChat: "New Chat",
        history: "Chat History",
        noHistory: "Koi previous chat nahi hai.",
        unableToConnect:
          "Vidhya se connect nahi ho paya. Dobara try karo.",
      },

      newspaper: {
        title: "Daily Newspaper",
        subtitle:
          "Simple aur student-friendly format mein daily newspaper updates padho.",
        loading: "Newspaper load ho raha hai...",
        error:
          "Newspaper load nahi ho saka. Dobara try karo.",
        noNews: "Koi newspaper available nahi hai.",
        read: "Newspaper Padho",
      },

      vocabulary: {
        title: "English Vocabulary",
        subtitle:
          "Useful words aur meanings se apni English vocabulary improve karo.",
        open: "Vocabulary Open Karo",
      },

      videos: {
        title: "Learning Videos",
        subtitle:
          "Useful educational videos aur learning resources.",
        comingSoon: "Video Learning Jaldi Aa Rahi Hai",
      },

      about: {
        title: "VIDYZEN ke baare mein",
        description:
          "VIDYZEN ek student-focused learning platform hai jo exam preparation ko simple, smart aur effective banane ke liye banaya gaya hai.",
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

const STORAGE_KEY = "vidyzen-language";

const savedLanguage = localStorage.getItem(STORAGE_KEY);

const initialLanguage =
  savedLanguage === "en" ||
  savedLanguage === "hi" ||
  savedLanguage === "hinglish"
    ? savedLanguage
    : "en";

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
