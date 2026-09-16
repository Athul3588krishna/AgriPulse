import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { WeatherWidget } from '../components/WeatherWidget';
import { GlobeFpoCard } from '../components/GlobeFpoCard';
import { 
  Leaf, Cpu, CloudSun, ShieldCheck, ArrowRight, Volume2, Globe, 
  Sparkles, TrendingUp, Landmark, Mic, DollarSign, Users, Award, Building2 
} from 'lucide-react';

export const HomePage = () => {
  const { t, lang } = useLanguage();

  return (
    <div className="space-y-16 py-8">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-950 text-xs font-black tracking-wide">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AgriMitra 360 Ecosystem • Multimodal Agriculture AI</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            {lang === 'ml' ? (
              <>കൃഷി രോഗനിർണ്ണയം, <span className="text-emerald-600 underline decoration-emerald-300">വിപണി വിലനിലവാരം</span>, സർക്കാർ സബ്‌സിഡികൾ</>
            ) : (
              <>End-to-End <span className="text-emerald-600 underline decoration-emerald-300">Precision Agronomy</span>, Vipani Mitra & Subsidies</>
            )}
          </h1>

          <p className="text-slate-600 text-base leading-relaxed">
            {lang === 'ml' ? (
              'കർഷകരുടെ വിത്ത് മുതൽ വിപണിയും സബ്‌സിഡിയും വരെയുള്ള മുഴുവൻ ഘട്ടങ്ങളെയും ശാക്തീകരിക്കുന്ന വോയ്‌സ്-ഫസ്റ്റ് AI പ്ലാറ്റ്‌ഫോം. ഇല സ്കാനിംഗ്, 7 ദിവസത്തെ മണ്ടി വില പ്രവചനം, സർക്കാർ ആനുകൂല്യങ്ങൾ എന്നിവ മലയാളത്തിൽ ശബ്ദത്തിലൂടെ അറിയാം.'
            ) : (
              'A voice-first, multimodal AI ecosystem uniting Pre-Harvest leaf disease diagnostics & OpenCV severity estimation, Post-Harvest Mandi pricing arbitrage to bypass middlemen, and Autonomous Policy RAG navigation for PMFBY insurance and state subsidies.'
            )}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.02]"
            >
              <span>{t('uploadLeaf')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/mandi"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02]"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{t('mandi')}</span>
            </Link>

            <Link
              to="/subsidies"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm transition-all"
            >
              <Landmark className="w-4 h-4 text-blue-600" />
              <span>{t('subsidies')}</span>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>KAU / ICAR RAG</span>
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

          {/* Live Farm Weather in Left Column */}
          <WeatherWidget />
        </div>

        {/* Right Column: 3D FPO Globe & Omnipresent Voice AI Feature Showcase */}
        <div className="lg:col-span-5 space-y-6">
          <GlobeFpoCard />

          <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-200 rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-emerald-950 flex items-center gap-2 text-sm">
                <Mic className="w-5 h-5 text-emerald-600" />
                Vernacular Voice Agent
              </span>
              <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                Speech-to-Speech
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Zero-touch voice interaction in native regional languages (Malayalam & English). Farmers can tap the floating mic button anytime to ask about plant remedies, mandi prices, or subsidies.
            </p>
          </div>
        </div>
      </section>

      {/* The Three Foundational Pillars Section */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
              Core Architecture
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Three Foundational AI Pillars
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Transforming agricultural workflows from isolated siloed tools into a complete end-to-end intelligent lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 1 */}
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-sm">
                  <Leaf className="w-6 h-6" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Pillar 1 • Pre-Harvest
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Precision Agronomy & Disease Diagnostics
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Deep Learning disease classification paired with OpenCV HSV color segmentation for precise leaf lesion severity scoring (Mild, Moderate, Severe), backed by Open-Meteo weather spray safety advisories.
                </p>
              </div>

              <Link
                to="/scan"
                className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 hover:text-emerald-700 pt-3 border-t border-slate-100"
              >
                <span>Launch Leaf Scanner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold shadow-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                  Pillar 2 • Post-Harvest
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Vipani Mitra: Market Intelligence & Price Optimization
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time Agmarknet mandi rates, 7-day predictive volatility forecast models, and a Middleman Bypass Calculator that compares nearby markets and transport costs to maximize net farm revenue.
                </p>
              </div>

              <Link
                to="/mandi"
                className="inline-flex items-center gap-1 text-xs font-black text-teal-600 hover:text-teal-700 pt-3 border-t border-slate-100"
              >
                <span>Explore Vipani Mitra</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-sm">
                  <Landmark className="w-6 h-6" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                  Pillar 3 • Financial Inclusion
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Autonomous Financial & Subsidy Navigator
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  AI-driven Policy RAG retrieving state and central schemes (PMFBY, PM-KISAN, Subhiksha Keralam). Evaluates land acreage to calculate benefits and auto-generates digital proof packets for crop insurance claims.
                </p>
              </div>

              <Link
                to="/subsidies"
                className="inline-flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700 pt-3 border-t border-slate-100"
              >
                <span>Check Subsidies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Stakeholder Impact Mapping Section (Hackathon Focus) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
            Hackathon Impact Matrix
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Connecting the Agricultural Ecosystem
          </h2>
          <p className="text-xs text-slate-500">
            How AgriMitra 360 delivers quantifiable value to every sector stakeholder
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Farmers & FPOs</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Eliminates language barriers via Malayalam voice, protects margins through mandi arbitrage, and speeds up diagnosis.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Krishi Bhavan & Officers</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Streamlines scheme awareness, digital subsidy applications, and automated crop loss inspection validation.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">KAU, KVK & ICAR</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bridges academic research and Package of Practices to field application through verified RAG citations.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">NABARD & Insurers</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              OpenCV objective severity scores provide fraud-resistant digital evidence for PMFBY claims and farm credit assessment.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
