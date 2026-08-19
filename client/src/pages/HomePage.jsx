import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { WeatherWidget } from '../components/WeatherWidget';
import { Leaf, Cpu, CloudSun, ShieldCheck, ArrowRight, Volume2, Globe, Sparkles } from 'lucide-react';

export const HomePage = () => {
  const { t, lang } = useLanguage();

  return (
    <div className="space-y-16 py-8">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Precision Agriculture Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {lang === 'ml' ? (
              <>കൃഷി രോഗനിർണ്ണയവും <span className="text-emerald-600 underline decoration-emerald-300">കാലാവസ്ഥാ അധിഷ്ഠിത</span> ഉപദേശങ്ങളും</>
            ) : (
              <>AI-Powered <span className="text-emerald-600 underline decoration-emerald-300">Precision Agriculture</span> & Crop Advisory System</>
            )}
          </h1>

          <p className="text-slate-600 text-base leading-relaxed">
            {lang === 'ml' ? (
              'ഇലയുടെ ചിത്രം മാത്രം അപ്‌ലോഡ് ചെയ്ത് രോഗങ്ങൾ തൽക്ഷണം കണ്ടെത്തുക. റിയൽ-ടൈം കാലാവസ്ഥ വിവരങ്ങളും മലയാളം/English ഉപദേശങ്ങളും നേടുക.'
            ) : (
              'Upload crop leaf images for instant deep learning disease identification, OpenCV severity estimation, RAG agricultural advisory, and weather-aware treatment guidance in English & Malayalam.'
            )}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
            >
              <span>{t('uploadLeaf')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm transition-all"
            >
              <span>{t('register')}</span>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>EfficientNet AI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Malayalam Voice</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-emerald-600" />
              <span>Weather Aware</span>
            </div>
          </div>
        </div>

        {/* Right Side Weather Widget & Interactive Visual */}
        <div className="lg:col-span-5 space-y-6">
          <WeatherWidget />

          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 shadow-sm text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                Multilingual Voice Assistance
              </span>
              <span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">EN / ML</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Provides text and audio read-aloud advisory for farmers in both English and Malayalam for effortless field accessibility.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="bg-slate-100/70 py-12 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">AgriPulse AI Core Capabilities</h2>
            <p className="text-xs text-slate-500 mt-1">Integrated Computer Vision, RAG, Weather API & Multilingual Assistance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Deep Learning & OpenCV</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                PyTorch classification with confidence score + OpenCV HSV color segmentation to measure exact diseased leaf area percentage.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Leaf className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">RAG Agricultural Knowledge</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Retrieval-Augmented Generation linking diagnoses with verified guidelines from KAU and ICAR with organic & chemical remedies.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <CloudSun className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Weather-Aware Spray Safety</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Integrates rainfall probability and wind speed data to alert farmers against spraying chemicals right before rain.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
