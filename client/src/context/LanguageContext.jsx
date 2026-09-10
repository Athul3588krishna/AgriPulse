import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const dictionary = {
  en: {
    appName: 'AgriMitra 360',
    tagline: 'End-to-End Multimodal AI Platform for Precision Agronomy, Market Intelligence & Subsidies',
    home: 'Home',
    dashboard: 'Farmer Dashboard',
    scan: 'Leaf Diagnostics',
    mandi: 'Mandi Intelligence',
    subsidies: 'Subsidy Navigator',
    voiceAgent: 'Vernacular Voice AI',
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
    langSwitch: 'മലയാളം',
    
    // Mandi Intelligence terms
    mandiTitle: 'Dynamic Market Intelligence & Mandi Optimization',
    mandiSubtitle: 'Real-time Agmarknet commodity feeds, 7-day predictive volatility trends, and net-profit market routing to bypass middlemen.',
    selectCommodity: 'Select Commodity',
    allDistricts: 'All Districts',
    marketPriceTable: 'Mandi Market Rate Matrix',
    forecastTitle: '7-Day Predictive Price Forecast & Volatility Trend',
    netProfitCalc: 'Middleman Bypass Net-Yield Calculator',
    calcSubtitle: 'Input your estimated harvest to calculate transport costs vs market price to find your most lucrative selling route.',
    harvestQty: 'Estimated Harvest Quantity (kg)',
    calcProfitBtn: 'Calculate Optimal Selling Mandi',
    recommendedMandi: 'Highest Net Profit Destination',
    directBenefit: 'Direct Benefit Over Unregulated Middlemen',
    modalPrice: 'Modal Price',
    minMax: 'Min / Max Price',
    trend: 'Daily Trend',
    
    // Subsidies terms
    subsidyTitle: 'Autonomous Financial & Subsidy Navigator',
    subsidySubtitle: 'AI-driven policy retrieval over state and central agricultural schemes (PMFBY, PM-KISAN, Subhiksha Keralam, Soil Health Cards).',
    filterCategory: 'Filter by Scheme Category',
    allSchemes: 'All Schemes',
    eligibilityMatcherTitle: 'Smart AI Scheme Eligibility Matcher',
    eligibilityMatcherSubtitle: 'Map your farm credentials to instantly evaluate qualified subsidies and estimated monetary benefits.',
    landSize: 'Land Holding Size (Acres)',
    farmerType: 'Farmer Category',
    marginalFarmer: 'Marginal Farmer (< 2.5 Acres)',
    smallFarmer: 'Small Farmer (2.5 - 5 Acres)',
    mediumFarmer: 'Medium Farmer (5 - 10 Acres)',
    largeFarmer: 'Large Farmer (> 10 Acres)',
    checkEligibilityBtn: 'Evaluate Qualified Schemes',
    totalEstimatedBenefit: 'Total Estimated Scheme Benefits',
    schemesMatched: 'Schemes Qualified',
    requiredDocs: 'Required Application Documents',
    authorityOffice: 'Nodal Authority / Krishi Bhavan',
    claimInsuranceTitle: 'PMFBY Digital Insurance Damage Proof',
    claimInsuranceDesc: 'Detected severe crop disease can be directly linked to a fast-track PMFBY crop loss insurance claim.'
  },
  ml: {
    appName: 'അഗ്രിമിത്ര 360',
    tagline: 'കൃഷി രോഗനിർണ്ണയം, വിപണി വിലനിലവാരം, സർക്കാർ സബ്‌സിഡികൾ എന്നിവയ്ക്കായുള്ള സമ്പൂർണ്ണ AI പ്ലാറ്റ്‌ഫോം',
    home: 'ഹോം',
    dashboard: 'കർഷക ഡാഷ്‌ബോർഡ്',
    scan: 'രോഗനിർണ്ണയം',
    mandi: 'മണ്ടി വിപണി വില',
    subsidies: 'സബ്‌സിഡി നാവിഗേറ്റർ',
    voiceAgent: 'വോയ്‌സ് അസിസ്റ്റന്റ്',
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
    langSwitch: 'English',

    // Mandi Intelligence terms
    mandiTitle: 'തത്സമയ വിപണി വിലനിലവാരവും മണ്ടി ഒപ്റ്റിമൈസേഷനും',
    mandiSubtitle: 'Agmarknet തത്സമയ വിളവിലകൾ, 7 ദിവസത്തെ വില പ്രവചനം, ഇടനിലക്കാരെ ഒഴിവാക്കി പരമാവധി ലാഭം തരുന്ന മാർക്കറ്റ് തിരഞ്ഞെടുക്കൽ.',
    selectCommodity: 'വിള തിരഞ്ഞെടുക്കുക',
    allDistricts: 'എല്ലാ ജില്ലകളും',
    marketPriceTable: 'മണ്ടി വിപണി നിരക്കുകൾ',
    forecastTitle: '7 ദിവസത്തെ വില പ്രവചന ചാർട്ട്',
    netProfitCalc: 'ഇടനിലക്കാരെ ഒഴിവാക്കാനുള്ള നെറ്റ് ലാഭ കാൽക്കുലേറ്റർ',
    calcSubtitle: 'നിങ്ങളുടെ വിളവും അളവും നൽകിയാൽ യാത്രാച്ചെലവ് കഴിഞ്ഞ് ഏറ്റവും കൂടുതൽ ലാഭം തരുന്ന മാർക്കറ്റ് കണ്ടെത്താം.',
    harvestQty: 'ലഭിച്ച വിളവിന്റെ അളവ് (കിലോഗ്രാം)',
    calcProfitBtn: 'ഏറ്റവും മികച്ച മണ്ടി കണ്ടെത്തുക',
    recommendedMandi: 'ഏറ്റവും കൂടുതൽ ലാഭം തരുന്ന മാർക്കറ്റ്',
    directBenefit: 'ഇടനിലക്കാരെ ഒഴിവാക്കി ലഭിക്കുന്ന അധിക ലാഭം',
    modalPrice: 'ശരാശരി വില',
    minMax: 'കുറഞ്ഞ / ഉയർന്ന വില',
    trend: 'പ്രതിദിന മാറ്റം',

    // Subsidies terms
    subsidyTitle: 'സർക്കാർ സബ്‌സിഡി & ഇൻഷുറൻസ് നാവിഗേറ്റർ',
    subsidySubtitle: 'കേന്ദ്ര-സംസ്ഥാന കാർഷിക പദ്ധതികൾ (PMFBY, PM-KISAN, സുഭിക്ഷ കേരളം, സോയിൽ ഹെൽത്ത് കാർഡ്) എളുപ്പത്തിൽ കണ്ടെത്താം.',
    filterCategory: 'വിഭാഗം തിരിച്ച് കാണുക',
    allSchemes: 'എല്ലാ പദ്ധതികളും',
    eligibilityMatcherTitle: 'സ്മാർട്ട് സബ്‌സിഡി അർഹതാ പരിശോധന',
    eligibilityMatcherSubtitle: 'നിങ്ങളുടെ ഭൂമിയുടെ വിസ്തൃതിയും വിളയും നൽകി അർഹതയുള്ള സബ്‌സിഡികളും സാമ്പത്തിക ആനുകൂല്യങ്ങളും അറിയുക.',
    landSize: 'ഭൂമിയുടെ വിസ്തൃതി (ഏക്കർ)',
    farmerType: 'കർഷക വിഭാഗം',
    marginalFarmer: 'നാമമാത്ര കർഷകൻ (< 2.5 ഏക്കർ)',
    smallFarmer: 'ചെറുകിട കർഷകൻ (2.5 - 5 ഏക്കർ)',
    mediumFarmer: 'ഇടത്തരം കർഷകൻ (5 - 10 ഏക്കർ)',
    largeFarmer: 'വൻകിട കർഷകൻ (> 10 ഏക്കർ)',
    checkEligibilityBtn: 'അർഹത പരിശോധിക്കുക',
    totalEstimatedBenefit: 'ആകെ ലഭിക്കാവുന്ന ധനസഹായം',
    schemesMatched: 'ലഭ്യമായ പദ്ധതികൾ',
    requiredDocs: 'ആവശ്യമായ രേഖകൾ',
    authorityOffice: 'ബന്ധപ്പെടേണ്ട കൃഷിഭവൻ / ഓഫീസ്',
    claimInsuranceTitle: 'PMFBY ഡിജിറ്റൽ വിളനാശ ഇൻഷുറൻസ് രേഖ',
    claimInsuranceDesc: 'ഇല സ്കാനിംഗിൽ കണ്ടെത്തിയ രോഗബാധയ്ക്ക് അടിയന്തരമായി PMFBY വിള ഇൻഷുറൻസ് ക്ലെയിം ചെയ്യാം.'
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
  const speakText = (text, targetLang = null) => {
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
    const useLang = targetLang || (lang === 'ml' ? 'ml-IN' : 'en-US');
    utterance.lang = useLang;
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
  const startListening = (onResultCallback, targetLang = null) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please try Google Chrome or Microsoft Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = targetLang || (lang === 'ml' ? 'ml-IN' : 'en-US');
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
