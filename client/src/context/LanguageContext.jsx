import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const dictionary = {
  en: {
    appName: 'AgriPulse AI',
    tagline: 'AI-Powered Precision Agriculture & Crop Disease Advisory',
    home: 'Home',
    dashboard: 'Farmer Dashboard',
    scan: 'Leaf Scanner',
    plots: 'Farm Plots',
    history: 'Diagnosis Logs',
    admin: 'Admin Console',
    login: 'Log In',
    register: 'Register',
    logout: 'Log Out',
    welcomeBack: 'Welcome back, Farmer',
    uploadLeaf: 'Upload Plant Leaf Image',
    selectCrop: 'Select Crop Type',
    analyzeBtn: 'Diagnose Disease',
    confidence: 'AI Confidence Score',
    severity: 'OpenCV Diseased Leaf Area Severity',
    biologicalRemedy: 'Organic & Biological Treatment',
    chemicalRemedy: 'Chemical Remedy',
    preventiveRemedy: 'Preventive Practices',
    weatherSafety: 'Weather & Spray Safety Check',
    sources: 'Verified Agricultural References',
    readAloud: 'Read Advisory Aloud (Voice)',
    stopAudio: 'Stop Voice',
    startListening: 'Speak Input (Mic)',
    listeningActive: 'Listening... (Speak Now)',
    downloadPdf: 'Download PDF Advisory Report',
    userDirectory: 'Registered Farmers & User Directory',
    langSwitch: 'മലയാളം'
  },
  ml: {
    appName: 'അഗ്രിപൾസ് AI',
    tagline: 'കൃത്രിമബുദ്ധി അധിഷ്ഠിത കൃഷി രോഗനിർണ്ണയവും ഉപദേശ സംവിധാനവും',
    home: 'ഹോം',
    dashboard: 'കർഷക ഡാഷ്‌ബോർഡ്',
    scan: 'ഇല പരിശോധന',
    plots: 'കൃഷിയിടങ്ങൾ',
    history: 'രോഗ ചരിത്രം',
    admin: 'അഡ്മിൻ പാനൽ',
    login: 'ലോഗിൻ',
    register: 'രജിസ്റ്റർ',
    logout: 'ലോഗ് ഔട്ട്',
    welcomeBack: 'സ്വാഗതം, കർഷക മിത്രമേ',
    uploadLeaf: 'ചെടിയുടെ ഇലയുടെ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക',
    selectCrop: 'വിള തിരഞ്ഞെടുക്കുക',
    analyzeBtn: 'രോഗം നിർണ്ണയിക്കുക',
    confidence: 'നിർണ്ണയ കൃത്യത സംഖ്യ',
    severity: 'ഇലയിലെ രോഗബാധ അളവ് (OpenCV)',
    biologicalRemedy: 'ജൈവ പരിപാലനം / ചികിത്സ',
    chemicalRemedy: 'രാസ കീടനാശിനി പ്രയോഗം',
    preventiveRemedy: 'പ്രതിരോധ മാർഗ്ഗങ്ങൾ',
    weatherSafety: 'കാലാവസ്ഥയും മരുന്ന് തളിക്കൽ സുരക്ഷയും',
    sources: 'അംഗീകൃത കാർഷിക സ്രോതസ്സുകൾ',
    readAloud: 'ശബ്ദത്തിൽ കേൾക്കുക (Voice)',
    stopAudio: 'ശബ്ദം നിർത്തുക',
    startListening: 'ശബ്ദത്തിൽ സംസാരിക്കുക (Mic)',
    listeningActive: 'ശ്രദ്ധിക്കുന്നു... (സംസാരിക്കുക)',
    downloadPdf: 'PDF ഉപദേശ റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക',
    userDirectory: 'രജിസ്റ്റർ ചെയ്ത കർഷകരുടെ വിവരങ്ങൾ',
    langSwitch: 'English'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ml' : 'en'));
  };

  const t = (key) => dictionary[lang]?.[key] || key;

  // Text-To-Speech (TTS)
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ml' ? 'ml-IN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Speech-To-Text (STT) Voice Microphone Input
  const startListening = (onResultCallback) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Try Chrome/Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ml' ? 'ml-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResultCallback) onResultCallback(transcript);
    };

    recognition.start();
  };

  return (
    <LanguageContext.Provider value={{
      lang, setLang, toggleLanguage, t,
      speakText, stopSpeaking, isSpeaking,
      startListening, isListening
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
