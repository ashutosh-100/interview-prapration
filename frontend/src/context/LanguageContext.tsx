"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "hi";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav & General
    appName: "AI Interview Mentor Pro",
    dashboard: "Dashboard",
    history: "History",
    admin: "Admin Panel",
    logout: "Logout",
    login: "Login",
    signup: "Sign Up",
    profile: "Profile",
    language: "Language",
    english: "English",
    hindi: "Hindi",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    welcome: "Welcome",
    
    // Landing
    heroTitle: "Master Your Next Big Interview with AI",
    heroSubtitle: "Get real-time feedback, behavioral analysis, screen and camera monitoring, and technical evaluation designed by industry specialists.",
    getStarted: "Get Started Free",
    
    // Dashboard
    pastInterviews: "Past Interviews",
    noInterviews: "No interviews conducted yet. Set up your first interview now!",
    newInterview: "Start New Interview",
    analytics: "Analytics & Trends",
    overallAverage: "Overall Average Score",
    interviewsConducted: "Interviews Conducted",
    domainPerformance: "Domain Performance",
    readinessScore: "Readiness Score",
    hiringProbability: "Hiring Probability",
    viewReport: "View Report",
    
    // Setup
    interviewSetup: "Interview Setup",
    selectMode: "Select Interview Mode",
    technicalRound: "Technical Round",
    codingRound: "Coding Round",
    hrRound: "HR Round",
    behavioralRound: "Behavioral Round",
    experienceLevel: "Experience Level",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    selectDomains: "Select Domains (Max 3)",
    uploadResume: "Upload Resume (Optional)",
    uploadDescription: "Drag & drop or click to upload PDF/DOCX (Max 5MB). AI will extract skills, projects and experience to generate custom questions.",
    resumeParsed: "Resume parsed successfully!",
    startInterview: "Begin Interview",

    // Interview Room
    consentTitle: "Permissions Consent Required",
    consentDesc: "To simulate a real company interview, this platform requests access to your Camera, Microphone, and Screen Share. These feeds are analyzed locally for eye contact, attention, speaking speed, and filler word detection.",
    grantPermissions: "Grant Permissions",
    cameraActive: "Camera Feed Active",
    screenActive: "Screen Share Active",
    connectingAi: "Connecting to AI Interviewer...",
    submitAnswer: "Submit Answer",
    speakingSpeed: "Speaking Speed",
    eyeContact: "Eye Contact",
    fillersCount: "Filler Words (umm, like)",
    endInterview: "Finish Interview",
    aiThinking: "AI is thinking...",

    // Report
    performanceReport: "Performance Evaluation Report",
    overallScore: "Overall Score",
    strengths: "Strengths",
    weaknesses: "Weaknesses",
    improvementAreas: "Suggested Improvement Areas",
    learningResources: "Suggested Learning Resources",
    aiFeedbackSummary: "Detailed AI Feedback Summary",
    probabilityHigh: "High Probability",
    probabilityMedium: "Medium Probability",
    probabilityLow: "Low Probability",
    backToDashboard: "Back to Dashboard",
  },
  hi: {
    // Nav & General
    appName: "एआई इंटरव्यू मेंटर प्रो",
    dashboard: "डैशबोर्ड",
    history: "इतिहास",
    admin: "एडमिन पैनल",
    logout: "लॉगआउट",
    login: "लॉगिन",
    signup: "साइन अप",
    profile: "प्रोफ़ाइल",
    language: "भाषा",
    english: "अंग्रेजी",
    hindi: "हिंदी",
    theme: "थीम",
    light: "लाइट",
    dark: "डार्क",
    system: "सिस्टम",
    welcome: "स्वागत है",

    // Landing
    heroTitle: "एआई के साथ अपने अगले बड़े इंटरव्यू में महारत हासिल करें",
    heroSubtitle: "उद्योग विशेषज्ञों द्वारा डिजाइन की गई वास्तविक समय प्रतिक्रिया, व्यवहार विश्लेषण, स्क्रीन और कैमरा निगरानी, और तकनीकी मूल्यांकन प्राप्त करें।",
    getStarted: "नि:शुल्क शुरू करें",

    // Dashboard
    pastInterviews: "पिछले इंटरव्यू",
    noInterviews: "अभी तक कोई इंटरव्यू नहीं हुआ है। अपना पहला इंटरव्यू अभी शुरू करें!",
    newInterview: "नया इंटरव्यू शुरू करें",
    analytics: "विश्लेषण और रुझान",
    overallAverage: "औसत स्कोर",
    interviewsConducted: "आयोजित इंटरव्यू",
    domainPerformance: "डोमेन प्रदर्शन",
    readinessScore: "तैयारी स्कोर",
    hiringProbability: "नौकरी मिलने की संभावना",
    viewReport: "रिपोर्ट देखें",

    // Setup
    interviewSetup: "इंटरव्यू सेटअप",
    selectMode: "इंटरव्यू मोड चुनें",
    technicalRound: "तकनीकी दौर (Technical)",
    codingRound: "कोडिंग दौर (Coding)",
    hrRound: "एचआर दौर (HR)",
    behavioralRound: "व्यवहार दौर (Behavioral)",
    experienceLevel: "अनुभव स्तर",
    beginner: "शुरुआती (Beginner)",
    intermediate: "मध्यम (Intermediate)",
    advanced: "उन्नत (Advanced)",
    selectDomains: "डोमेन चुनें (अधिकतम 3)",
    uploadResume: "रिज्यूमे अपलोड करें (वैकल्पिक)",
    uploadDescription: "PDF/DOCX अपलोड करने के लिए खींचें या क्लिक करें (अधिकतम 5MB)। एआई आपके कौशल और परियोजनाओं के आधार पर व्यक्तिगत प्रश्न उत्पन्न करेगा।",
    resumeParsed: "रिज्यूमे का विश्लेषण सफलतापूर्वक हो गया है!",
    startInterview: "इंटरव्यू शुरू करें",

    // Interview Room
    consentTitle: "अनुमति सहमति आवश्यक है",
    consentDesc: "वास्तविक कंपनी इंटरव्यू का अनुकरण करने के लिए, यह प्लेटफॉर्म आपके कैमरा, माइक्रोफ़ोन और स्क्रीन शेयर तक पहुंच का अनुरोध करता है। इनका विश्लेषण आंख के संपर्क, ध्यान, बोलने की गति, और पूरक शब्द पहचान के लिए किया जाता है।",
    grantPermissions: "अनुमतियां दें",
    cameraActive: "कैमरा सक्रिय है",
    screenActive: "स्क्रीन शेयर सक्रिय है",
    connectingAi: "एआई इंटरव्यूअर से जुड़ रहा है...",
    submitAnswer: "उत्तर सबमिट करें",
    speakingSpeed: "बोलने की गति",
    eyeContact: "आँखों का संपर्क",
    fillersCount: "पूरक शब्द (umm, like)",
    endInterview: "इंटरव्यू समाप्त करें",
    aiThinking: "एआई सोच रहा है...",

    // Report
    performanceReport: "प्रदर्शन मूल्यांकन रिपोर्ट",
    overallScore: "कुल स्कोर",
    strengths: "मजबूत पक्ष",
    weaknesses: "कमजोरियां",
    improvementAreas: "सुझाए गए सुधार क्षेत्र",
    learningResources: "सुझाए गए शिक्षण संसाधन",
    aiFeedbackSummary: "विस्तृत एआई प्रतिक्रिया",
    probabilityHigh: "उच्च संभावना",
    probabilityMedium: "मध्यम संभावना",
    probabilityLow: "कम संभावना",
    backToDashboard: "डैशबोर्ड पर वापस जाएं",
  }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("preferred_language") as Language;
    if (savedLang === "en" || savedLang === "hi") {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("preferred_language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
