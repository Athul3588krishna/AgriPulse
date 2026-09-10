import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Mic, MicOff, Volume2, VolumeX, Sparkles, MessageSquare, 
  X, Send, Bot, User, ArrowRight, Shield, RefreshCw 
} from 'lucide-react';

export const VoiceAgentModal = () => {
  const { lang, t, speakText, stopSpeaking, isSpeaking, startListening, isListening } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      textEn: 'Hello! I am AgriMitra 360 Voice AI. Ask me anything about crop diseases, today\'s Mandi prices, weather spray safety, or government subsidies.',
      textMl: 'നമസ്കാരം! ഞാൻ അഗ്രിമിത്ര 360 വോയ്‌സ് അസിസ്റ്റന്റാണ്. വിള രോഗങ്ങൾ, ഇന്നത്തെ മണ്ടി വില, കാലാവസ്ഥ, അല്ലെങ്കിൽ സർക്കാർ സബ്‌സിഡികളെക്കുറിച്ച് എന്തും ചോദിക്കാം.'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [agentThinking, setAgentThinking] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Intelligent rural agricultural response matcher (bilingual)
  const generateAgentResponse = (query) => {
    const q = query.toLowerCase();

    // 1. Mandi Price Queries
    if (q.includes('mandi') || q.includes('price') || q.includes('rate') || q.includes('വില') || q.includes('മാർക്കറ്റ്') || q.includes('നെല്ല്') || q.includes('തക്കാളി')) {
      if (q.includes('paddy') || q.includes('നെല്ല്')) {
        return {
          en: 'Today\'s highest Paddy rate is in Palakkad Regulated Market at ₹3,080 per quintal (up by ₹80). In Alappuzha, the modal price is ₹2,980. Bypassing middlemen by selling directly to APMC saves you approx ₹6,000 per ton.',
          ml: 'ഇന്നത്തെ നെല്ലിന്റെ ഏറ്റവും ഉയർന്ന നിരക്ക് പാലക്കാട് റെഗുലേറ്റഡ് മാർക്കറ്റിലാണ് — ക്വിന്റലിന് ₹3,080 (+₹80 വർദ്ധനവ്). ആലപ്പുഴയിൽ ₹2,980 ആണ്. ഇടനിലക്കാരെ ഒഴിവാക്കി നേരിട്ട് വിൽക്കുന്നതിലൂടെ ടണ്ണിന് ₹6,000 വരെ അധിക ലാഭം നേടാം.'
        };
      }
      if (q.includes('tomato') || q.includes('തക്കാളി')) {
        return {
          en: 'Tomato prices today are averaging ₹36-38/kg across Ernakulam and Alappuzha. The 7-day forecast indicates a slight dip, so selling harvested stock within 48 hours is recommended.',
          ml: 'തക്കാളിക്ക് ഇന്ന് എറണാകുളം, ആലപ്പുഴ മാർക്കറ്റുകളിൽ കിലോയ്ക്ക് ₹36-38 നിരക്കുണ്ട്. അടുത്ത 7 ദിവസങ്ങളിൽ വില കുറയാൻ സാധ്യതയുള്ളതിനാൽ 48 മണിക്കൂറിനുള്ളിൽ വിൽക്കുന്നതാണ് ഉചിതം.'
        };
      }
      return {
        en: 'Current average Mandi rates: Paddy ₹2,950/quintal, Nendran Banana ₹52/kg, Coconut ₹37/kg, Tomato ₹36/kg, Black Pepper ₹615/kg. Visit the Mandi Intelligence tab for a 7-day predictive forecast.',
        ml: 'ഇന്നത്തെ പ്രധാന മാർക്കറ്റ് നിരക്കുകൾ: നെല്ല് ക്വിന്റലിന് ₹2,950, നേന്ത്രക്കായ കിലോയ്ക്ക് ₹52, തേങ്ങ ₹37, തക്കാളി ₹36, കുരുമുളക് ₹615. കൂടുതൽ വിവരങ്ങൾക്ക് മണ്ടി പേജ് സന്ദർശിക്കുക.'
      };
    }

    // 2. Subsidies and PMFBY Insurance
    if (q.includes('subsidy') || q.includes('scheme') || q.includes('pmfby') || q.includes('kisan') || q.includes('സബ്‌സിഡി') || q.includes('പദ്ധതി') || q.includes('ഇൻഷുറൻസ്') || q.includes('സഹായം')) {
      if (q.includes('insurance') || q.includes('pmfby') || q.includes('വിളനാശം') || q.includes('ഇൻഷുറൻസ്')) {
        return {
          en: 'Under PMFBY, you are eligible for up to ₹35,000/acre compensation for severe crop pest or disease blight. Make sure to report the damage within 72 hours with digital leaf scan proof to your local Krishi Bhavan.',
          ml: 'പ്രധാനമന്ത്രി ഫസൽ ബീമാ യോജന (PMFBY) വഴി വിളനാശത്തിന് ഏക്കറിന് ₹35,000 വരെ നഷ്ടപരിഹാരം ലഭിക്കും. രോഗബാധ കണ്ടെത്തി 72 മണിക്കൂറിനുള്ളിൽ ഇലയുടെ ഫോട്ടോ സഹിതം കൃഷിഭവനിൽ അറിയിക്കുക.'
        };
      }
      return {
        en: 'Key schemes: 1. PM-KISAN (₹6,000/year direct transfer). 2. Subhiksha Keralam (up to ₹35,000/ha for vegetable farming). 3. Micro-Irrigation Drip Subsidy (55% off). Use our Subsidy Navigator tab to check your exact eligibility.',
        ml: 'പ്രധാന പദ്ധതികൾ: 1. പി.എം. കിസാൻ (വർഷം ₹6,000 ബാങ്ക് അക്കൗണ്ടിലേക്ക്). 2. സുഭിക്ഷ കേരളം (പച്ചക്കറി കൃഷിക്ക് ഹെക്ടറിന് ₹35,000 വരെ). 3. തുള്ളിനന ഉപകരണങ്ങൾക്ക് 55% സബ്‌സിഡി. സബ്‌സിഡി പേജിൽ നിങ്ങളുടെ അർഹത പരിശോധിക്കാം.'
      };
    }

    // 3. Crop Disease Diagnostics & Treatment
    if (q.includes('disease') || q.includes('leaf') || q.includes('blight') || q.includes('spot') || q.includes('രോഗം') || q.includes('ഇല') || q.includes('കുമിൾ') || q.includes('മരുന്ന്')) {
      return {
        en: 'For fungal leaf spots and blight, KAU recommends spraying Neem oil emulsion (5ml/L) or Trichoderma viride bio-fungicide as an organic remedy. For chemical treatment, Copper Oxychloride @ 3g/L is verified. Upload a photo in Leaf Scanner for precise OpenCV severity scoring.',
        ml: 'ഇലപ്പുള്ളി, കുമിൾ രോഗങ്ങൾക്ക് വേപ്പെണ്ണ-വെളുത്തുള്ളി മിശ്രിതം (5ml/ലിറ്റർ) അല്ലെങ്കിൽ ട്രൈക്കോഡെർമ ജൈവ കുമിൾനാശിനി തളിക്കുക. രാസനിയന്ത്രണത്തിന് കോപ്പർ ഓക്സിക്ലോറൈഡ് 3 ഗ്രാം/ലിറ്റർ ഉപയോഗിക്കാം. കൃത്യമായ പരിശോധനയ്ക്ക് ഇല സ്കാനർ ഉപയോഗിക്കുക.'
      };
    }

    // 4. Weather & Spray Timing
    if (q.includes('weather') || q.includes('rain') || q.includes('spray') || q.includes('മഴ') || q.includes('കാലാവസ്ഥ') || q.includes('തളിക്ക')) {
      return {
        en: 'Live weather check indicates stable wind speeds below 10 km/h with low precipitation probability today. Spraying organic or chemical solutions between 7:00 AM - 9:30 AM or late evening is safe and effective.',
        ml: 'ഇന്നത്തെ കാലാവസ്ഥയിൽ മഴ സാധ്യത കുറവാണ്, കാറ്റിന്റെ വേഗത 10 km/h-ൽ താഴെയാണ്. രാവിലെ 7:00 മുതൽ 9:30 വരെയോ വൈകുന്നേരമോ മരുന്ന് തളിക്കുന്നത് സുരക്ഷിതമാണ്.'
      };
    }

    // Default Fallback
    return {
      en: 'I can assist you with Crop Disease diagnosis, Agmarknet Mandi prices, 7-day market forecasting, and Government Subsidies. What would you like help with today?',
      ml: 'വിള രോഗനിർണ്ണയം, മണ്ടി വിപണി വിലകൾ, 7 ദിവസത്തെ വില പ്രവചനം, സർക്കാർ സബ്‌സിഡികൾ എന്നിവയിൽ എന്നോട് ചോദിക്കാം. ഏത് കാര്യത്തിലാണ് ഇന്ന് സഹായം വേണ്ടത്?'
    };
  };

  // Handle Query Submission
  const handleSubmit = (textToSubmit) => {
    const query = textToSubmit || inputText;
    if (!query.trim()) return;

    // Add user message
    const newMessages = [
      ...messages,
      { sender: 'user', textEn: query, textMl: query }
    ];
    setMessages(newMessages);
    setInputText('');
    setAgentThinking(true);

    setTimeout(() => {
      const response = generateAgentResponse(query);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', textEn: response.en, textMl: response.ml }
      ]);
      setAgentThinking(false);

      // Auto read aloud bot response
      const speechText = lang === 'ml' ? response.ml : response.en;
      speakText(speechText, lang === 'ml' ? 'ml-IN' : 'en-US');
    }, 600);
  };

  // Microphone voice recognition
  const handleMicClick = () => {
    if (isListening) return;
    startListening((transcript) => {
      setInputText(transcript);
      handleSubmit(transcript);
    }, lang === 'ml' ? 'ml-IN' : 'en-US');
  };

  const sampleChips = [
    { en: 'Today\'s Paddy Mandi Price', ml: 'ഇന്നത്തെ നെല്ലിന്റെ വില' },
    { en: 'How to claim PMFBY Insurance?', ml: 'വിള ഇൻഷുറൻസ് എങ്ങനെ എടുക്കാം?' },
    { en: 'Remedy for Tomato Leaf Blight', ml: 'തക്കാളിയിലെ ഇലപ്പുള്ളിക്ക് മരുന്ന്' },
    { en: 'Is it safe to spray today?', ml: 'ഇന്ന് മരുന്ന് തളിക്കാൻ പറ്റിയ കാലാവസ്ഥയാണോ?' }
  ];

  return (
    <>
      {/* Floating Action Button (Always Visible) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white p-4 rounded-full shadow-2xl shadow-emerald-600/50 hover:scale-105 transition-all flex items-center gap-2.5 group"
        title="AgriMitra 360 Vernacular Voice AI"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
        </div>
        <span className="text-xs font-black tracking-wide pr-1 hidden sm:inline-block">
          {lang === 'ml' ? 'വോയ്‌സ് AI' : 'Voice AI'}
        </span>
      </button>

      {/* Voice Assistant Floating Modal Window */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 sm:w-96 sm:h-[580px] bg-white sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center border border-emerald-500/40 shadow-inner">
                <Bot className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <span className="font-extrabold text-xs block leading-tight">
                  AgriMitra 360 Voice AI
                </span>
                <span className="text-[10px] text-emerald-200 block">
                  {lang === 'ml' ? 'മലയാളം & English സംഭാഷണം' : 'Vernacular Speech-to-Speech'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => isSpeaking ? stopSpeaking() : speakText(messages[messages.length - 1][lang === 'ml' ? 'textMl' : 'textEn'], lang === 'ml' ? 'ml-IN' : 'en-US')}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800 transition-colors"
                title={isSpeaking ? 'Stop Voice' : 'Read Aloud'}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => { stopSpeaking(); setIsOpen(false); }}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Query Sample Chips */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex gap-1.5 overflow-x-auto text-[10px] no-scrollbar">
            {sampleChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSubmit(lang === 'ml' ? chip.ml : chip.en)}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold whitespace-nowrap hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all flex-shrink-0"
              >
                {lang === 'ml' ? chip.ml : chip.en}
              </button>
            ))}
          </div>

          {/* Messages Transcript Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white flex-shrink-0 text-[10px]">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] p-3 rounded-2xl leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none font-medium'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  {lang === 'ml' ? msg.textMl : msg.textEn}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-white flex-shrink-0 text-[10px]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {agentThinking && (
              <div className="flex gap-2 items-center text-[11px] text-slate-400 italic">
                <Bot className="w-4 h-4 animate-bounce text-emerald-600" />
                <span>AgriMitra thinking in {lang === 'ml' ? 'മലയാളം' : 'English'}...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input & Voice Controls */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <button
              onClick={handleMicClick}
              className={`p-2.5 rounded-xl transition-all shadow-sm ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
              title={isListening ? 'Listening...' : 'Speak Question'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={lang === 'ml' ? 'ഇവിടെ ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ സംസാരിക്കുക...' : 'Ask by text or microphone...'}
              className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              onClick={() => handleSubmit()}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </>
  );
};
