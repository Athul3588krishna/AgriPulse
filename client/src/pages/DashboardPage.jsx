import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { WeatherWidget } from '../components/WeatherWidget';
import { 
  Leaf, Activity, Plus, History, AlertTriangle, CheckCircle, 
  TrendingUp, Landmark, ArrowRight, DollarSign, Sparkles 
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();

  const [plots, setPlots] = useState([]);
  const [recentDiagnoses, setRecentDiagnoses] = useState([]);
  const [mandiSnapshot, setMandiSnapshot] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plotsRes, historyRes, mandiRes] = await Promise.all([
          axios.get('/api/plots'),
          axios.get('/api/diagnoses/history'),
          axios.get('/api/mandi/prices?commodity=Paddy')
        ]);
        setPlots(plotsRes.data);
        setRecentDiagnoses(historyRes.data);
        if (mandiRes.data?.data) {
          setMandiSnapshot(mandiRes.data.data.slice(0, 3));
        }
      } catch (e) {
        console.log('Dashboard fetch notice:', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AgriMitra 360 Command Center
          </div>
          <h1 className="text-2xl md:text-3xl font-black">
            {t('welcomeBack')}, {user?.name || 'Farmer'}!
          </h1>
          <p className="text-emerald-100/80 text-xs md:text-sm mt-1.5 max-w-xl">
            {lang === 'ml'
              ? 'നിങ്ങളുടെ കൃഷിയിടങ്ങളുടെ ആരോഗ്യം, ഇന്നത്തെ വിപണി നിരക്കുകൾ, ലഭ്യമായ സർക്കാർ സബ്‌സിഡികൾ എന്നിവ ഒറ്റനോട്ടത്തിൽ കാണുക.'
              : 'Monitor field plot health trajectories, real-time APMC Mandi rates, and qualified government subsidy entitlements from a single dashboard.'
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            to="/scan"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-2xl shadow-lg transition-all hover:scale-105 shrink-0 text-xs"
          >
            <Activity className="w-4 h-4 text-slate-950" />
            <span>New Leaf Scan</span>
          </Link>
          <Link
            to="/mandi"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-2xl border border-white/20 transition-all shrink-0 text-xs"
          >
            <TrendingUp className="w-4 h-4 text-emerald-300" />
            <span>Check Mandis</span>
          </Link>
        </div>
      </div>

      {/* Quick 3-Pillar Status Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <Link to="/scan" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Leaf className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">Pillar 1: Agronomy</span>
          <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">Leaf Disease Diagnostics</h3>
          <p className="text-xs text-slate-500 mt-1">CV Detection + OpenCV Severity Area %</p>
        </Link>

        <Link to="/mandi" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-500 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 block">Pillar 2: Market</span>
          <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">Mandi Market Intelligence</h3>
          <p className="text-xs text-slate-500 mt-1">Agmarknet Rates & Middleman Arbitrage</p>
        </Link>

        <Link to="/subsidies" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Landmark className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">Pillar 3: Finance</span>
          <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">Subsidy & Policy Navigator</h3>
          <p className="text-xs text-slate-500 mt-1">PMFBY Insurance & Krishi Bhavan Schemes</p>
        </Link>

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Plots & Diagnoses */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Plots */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                Active Farm Plots ({plots.length})
              </h3>
              <Link to="/plots" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Plot
              </Link>
            </div>

            {plots.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                No farm plots created yet. Create a plot to track specific field health over time.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plots.slice(0, 4).map((plot) => (
                  <div key={plot._id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 text-xs">{plot.name}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {plot.cropType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{plot.areaAcres} Acres • {plot.soilType} Soil</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Diagnosis Activity */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                Recent Diagnoses
              </h3>
              <Link to="/history" className="text-xs font-bold text-emerald-600 hover:underline">
                View All Logs →
              </Link>
            </div>

            {recentDiagnoses.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                No leaf scans recorded yet. Click "New Leaf Scan" above to diagnose your crop.
              </div>
            ) : (
              <div className="space-y-3">
                {recentDiagnoses.slice(0, 3).map((item) => (
                  <div key={item._id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.diseaseName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.severityLevel === 'Mild' ? 'bg-amber-100 text-amber-800' :
                          item.severityLevel === 'Moderate' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.severityLevel} ({item.severityPercentage}%)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Crop: {item.cropName} • Confidence: {item.confidenceScore}%
                      </p>
                    </div>
                    <Link
                      to="/history"
                      className="text-xs font-bold text-emerald-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-emerald-50"
                    >
                      Report
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Live Weather & Mandi Snapshot */}
        <div className="lg:col-span-5 space-y-6">
          <WeatherWidget />

          {/* Mandi Quick Snapshot */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Live Mandi Prices (Paddy)
              </span>
              <Link to="/mandi" className="text-[11px] font-bold text-emerald-600 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-2">
              {mandiSnapshot.map((m) => (
                <div key={m.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 truncate max-w-[180px]">{m.mandiName}</span>
                  <span className="font-black text-slate-900">
                    ₹{m.commodities?.[0]?.modalPrice || '2,880'} / quintal
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
