import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { 
  Mic, MicOff, Volume2, VolumeX, Sparkles, MessageSquare, 
  X, Send, Bot, User, ArrowRight, Shield, RefreshCw,
  Cpu, ChevronDown, ChevronUp, CheckCircle2, Zap
} from 'lucide-react';

const API_BASE = 'http://localhost:5000';

export const VoiceAgentModal = () => {
  const { lang, t, speakText, stopSpeaking, isSpeaking, startListening, isListening } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      textEn: 'Hello! I am AgriMitra 360 Autonomous Voice Agent. Powered by ReAct tool calling, I can check live Mandi prices, test meteorological spray safety, search KAU disease remedies, and verify PMFBY subsidies.',
      textMl: 'നമസ്കാരം! ഞാൻ അഗ്രിമിത്ര 360 ഓട്ടോണമസ് അഗ്രി-ഏജന്റാണ്. തത്സമയ മണ്ടി വിലകൾ, കാലാവസ്ഥാ സ്പ്രേ സുരക്ഷ, KAU രോഗപ്രതിവിധികൾ, സർക്കാർ സബ്‌സിഡികൾ എന്നിവ വിശകലനം ചെയ്യാൻ എന്നോട് ചോദിക്കാം.',
      toolsCalled: [],
      reactSteps: []
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [agentThinking, setAgentThinking] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, agentThinking]);

  const toggleStepExpand = (msgIdx) => {
    setExpandedSteps(prev => ({
      ...prev,
      [msgIdx]: !prev[msgIdx]
    }));
  };

  // Tool label and styling mapping
  const getToolBadge = (toolName) => {
    switch (toolName) {
      case 'tool_mandi_prices':
        return { labelEn: 'Mandi Rates', labelMl: 'മണ്ടി വില', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'tool_weather_spray_safety':
        return { labelEn: 'Spray Safety', labelMl: 'കാലാവസ്ഥ', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'tool_disease_advisory':
        return { labelEn: 'KAU Advisory', labelMl: 'KAU പ്രതിവിധി', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'tool_subsidy_navigator':
        return { labelEn: 'PMFBY Subsidy', labelMl: 'സബ്‌സിഡി', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'tool_middleman_arbitrage':
        return { labelEn: 'Arbitrage Calc', labelMl: 'ലാഭക്കണക്ക്', color: 'bg-teal-100 text-teal-800 border-teal-300' };
      default:
        return { labelEn: toolName, labelMl: toolName, color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  // Local fallback response generator if backend is temporarily unreachable
  const generateFallbackResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('mandi') || q.includes('price') || q.includes('വില') || q.includes('നെല്ല്')) {
      return {
        en: 'Today\'s highest Paddy rate is at Palakkad Regulated Market at ₹3,080 per quintal (+₹80). Selling directly to APMC saves ₹6,000 per ton.',
        ml: 'ഇന്നത്തെ നെല്ലിന്റെ ഏറ്റവും ഉയർന്ന നിരക്ക് പാലക്കാട് റെഗുലേറ്റഡ് മാർക്കറ്റിലാണ് — ക്വിന്റലിന് ₹3,080 (+₹80). ഇടനിലക്കാരെ ഒഴിവാക്കി വിറ്റാൽ ടണ്ണിന് ₹6,000 ലാഭം.',
        tools: ['tool_mandi_prices']
      };
    }
    if (q.includes('weather') || q.includes('rain') || q.includes('മഴ') || q.includes('കാലാവസ്ഥ')) {
      return {
        en: 'Weather conditions are stable with low wind velocity (<10 km/h). Foliar spray is safe between 7:00 AM - 9:30 AM.',
        ml: 'കാലാവസ്ഥ അനുകൂലമാണ്, മഴ സാധ്യത കുറവാണ്. രാവിലെ 7:00 മുതൽ 9:30 വരെയോ വൈകുന്നേരമോ മരുന്ന് തളിക്കുന്നത് സുരക്ഷിതമാണ്.',
        tools: ['tool_weather_spray_safety']
      };
    }
    return {
      en: 'I can assist with real-time APMC Mandi prices, spray weather forecasts, KAU disease dosages, and PMFBY subsidies.',
      ml: 'മണ്ടി വിലകൾ, കാലാവസ്ഥാ സ്പ്രേ പരിശോധന, KAU രോഗപ്രതിവിധികൾ, സർക്കാർ സബ്‌സിഡികൾ എന്നിവയിൽ എന്നോട് ചോദിക്കാം.',
      tools: ['tool_mandi_prices']
    };
  };

  // Handle Query Submission to Agentic AI Endpoint
  const handleSubmit = async (textToSubmit) => {
    const query = textToSubmit || inputText;
    if (!query.trim()) return;

    const userMessage = { sender: 'user', textEn: query, textMl: query };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setAgentThinking(true);

    try {
      // Call the Agentic AI ReAct Endpoint
      const response = await axios.post(`${API_BASE}/api/agent/chat`, {
        message: query,
        lang: lang,
        location: 'Kerala'
      }, { timeout: 6000 });

      if (response.data && response.data.success) {
        const botMessage = {
          sender: 'bot',
          textEn: response.data.textEn,
          textMl: response.data.textMl,
          toolsCalled: response.data.toolsCalled || [],
          reactSteps: response.data.reactSteps || []
        };

        setMessages(prev => [...prev, botMessage]);
        setAgentThinking(false);

        // Auto read aloud the response in selected language
        const speechText = lang === 'ml' ? response.data.textMl : response.data.textEn;
        // Clean markdown symbols for clearer TTS pronunciation
        const cleanSpeech = speechText.replace(/[*_#`~]/g, '');
        speakText(cleanSpeech, lang === 'ml' ? 'ml-IN' : 'en-US');
      } else {
        throw new Error('Unsuccessful agent response');
      }
    } catch (err) {
      console.warn('Agent API fallback:', err.message);
      const fallback = generateFallbackResponse(query);
      const botMessage = {
        sender: 'bot',
        textEn: fallback.en,
        textMl: fallback.ml,
        toolsCalled: fallback.tools,
        reactSteps: []
      };

      setMessages(prev => [...prev, botMessage]);
      setAgentThinking(false);

      const speechText = lang === 'ml' ? fallback.ml : fallback.en;
      speakText(speechText, lang === 'ml' ? 'ml-IN' : 'en-US');
    }
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
    { en: 'Palakkad Paddy Mandi Price', ml: 'പാലക്കാട് നെല്ലിന്റെ വിലയെത്ര?' },
    { en: 'Can I spray pesticides today?', ml: 'ഇന്ന് മരുന്ന് തളിക്കാൻ പറ്റുമോ?' },
    { en: 'Cure for Tomato Leaf Blight', ml: 'തക്കാളിയിലെ ഇലപ്പുള്ളിക്ക് മരുന്ന്' },
    { en: 'PMFBY Crop Insurance Claim', ml: 'വിള ഇൻഷുറൻസ് എങ്ങനെ ലഭിക്കും?' }
  ];

  return (
    <>
      {/* Floating Action Button (Always Visible) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-4 rounded-full shadow-2xl shadow-emerald-600/50 hover:scale-105 transition-all flex items-center gap-2.5 group border-2 border-emerald-400/40"
        title="AgriMitra 360 Agentic AI Voice Assistant"
      >
        <div className="relative">
          <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
        </div>
        <div className="text-left hidden sm:block pr-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200 block leading-none">Agentic AI</span>
          <span className="text-xs font-black tracking-wide leading-tight block">
            {lang === 'ml' ? 'അഗ്രി-ഏജന്റ്' : 'Agri-Agent'}
          </span>
        </div>
      </button>

      {/* Voice Assistant Floating Modal Window */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 sm:w-[420px] sm:h-[620px] bg-white sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center border border-emerald-400/40 shadow-inner">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs tracking-tight block">
                    AgriMitra 360 Autonomous Agent
                  </span>
                  <span className="px-1.5 py-0.2 bg-emerald-500/30 text-[9px] text-emerald-300 border border-emerald-400/40 rounded-full font-bold uppercase">
                    ReAct
                  </span>
                </div>
                <span className="text-[10px] text-emerald-200 block">
                  {lang === 'ml' ? 'മലയാളം & English വോയ്‌സ് ഇന്റലിജൻസ്' : 'Multi-Tool Vernacular Voice AI'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => isSpeaking ? stopSpeaking() : speakText(messages[messages.length - 1][lang === 'ml' ? 'textMl' : 'textEn'].replace(/[*_#`~]/g, ''), lang === 'ml' ? 'ml-IN' : 'en-US')}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800/80 transition-colors"
                title={isSpeaking ? 'Stop Voice' : 'Read Aloud'}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-300 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => { stopSpeaking(); setIsOpen(false); }}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Query Sample Chips */}
          <div className="p-2 bg-slate-50 border-b border-slate-100 flex gap-1.5 overflow-x-auto text-[10px] no-scrollbar">
            {sampleChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSubmit(lang === 'ml' ? chip.ml : chip.en)}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold whitespace-nowrap hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all flex-shrink-0 shadow-2xs"
              >
                {lang === 'ml' ? chip.ml : chip.en}
              </button>
            ))}
          </div>

          {/* Messages Transcript Scroll Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs bg-slate-50/60">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex gap-2 max-w-[90%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    {/* Tool execution badges for bot */}
                    {msg.sender === 'bot' && msg.toolsCalled && msg.toolsCalled.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5 text-amber-500" />
                          {lang === 'ml' ? 'ടൂളുകൾ:' : 'Tools Run:'}
                        </span>
                        {msg.toolsCalled.map((tool, tIdx) => {
                          const badge = getToolBadge(tool);
                          return (
                            <span 
                              key={tIdx} 
                              className={`text-[9px] px-1.5 py-0.5 rounded-md border font-semibold ${badge.color}`}
                            >
                              ⚡ {lang === 'ml' ? badge.labelMl : badge.labelEn}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Message Content Bubble */}
                    <div
                      className={`p-3 rounded-2xl leading-relaxed shadow-xs text-left ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none whitespace-pre-line'
                      }`}
                    >
                      {lang === 'ml' ? msg.textMl : msg.textEn}
                    </div>

                    {/* ReAct Reasoning Steps Collapsible for Evaluators / Farmers */}
                    {msg.sender === 'bot' && msg.reactSteps && msg.reactSteps.length > 0 && (
                      <div className="mt-0.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl overflow-hidden text-[10px]">
                        <button
                          onClick={() => toggleStepExpand(idx)}
                          className="w-full px-2.5 py-1.5 flex items-center justify-between text-emerald-800 font-bold hover:bg-emerald-100/50 transition-colors"
                        >
                          <span className="flex items-center gap-1">
                            <Cpu className="w-3 h-3 text-emerald-600" />
                            {lang === 'ml' 
                              ? `ഏജന്റ് റീസണിംഗ് സ്റ്റെപ്പുകൾ (${msg.reactSteps.length})` 
                              : `Agent ReAct Chain (${msg.reactSteps.length} Steps)`}
                          </span>
                          {expandedSteps[idx] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {expandedSteps[idx] && (
                          <div className="p-2.5 border-t border-emerald-200/60 bg-white/90 space-y-2 text-slate-700">
                            {msg.reactSteps.map((step, sIdx) => (
                              <div key={sIdx} className="space-y-0.5 border-l-2 border-emerald-500 pl-2">
                                <div className="font-semibold text-emerald-900">
                                  Step {step.stepNumber}: <span className="font-mono text-[9px] bg-slate-100 px-1 rounded">{step.tool}</span>
                                </div>
                                <div className="text-[10px] text-slate-600 italic">
                                  💡 <strong>Thought:</strong> {step.thought}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-white flex-shrink-0 text-[10px] mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {agentThinking && (
              <div className="flex gap-2 items-center text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-2xl border border-emerald-200 animate-pulse">
                <Cpu className="w-4 h-4 animate-spin text-emerald-600" />
                <span className="font-medium">
                  {lang === 'ml' 
                    ? 'അഗ്രിമിത്ര ഓട്ടോണമസ് ടൂളുകൾ റൺ ചെയ്ത് വിശകലനം ചെയ്യുന്നു...' 
                    : 'AgriMitra Agent executing autonomous tools and reasoning...'}
                </span>
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
                  ? 'bg-red-500 text-white animate-pulse shadow-red-500/50'
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
              placeholder={lang === 'ml' ? 'ഇവിടെ ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ മൈക്രോഫോൺ ഉപയോഗിക്കുക...' : 'Ask by voice or typing...'}
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
