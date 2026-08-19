import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { WeatherWidget } from '../components/WeatherWidget';
import { Leaf, Activity, Plus, History, AlertTriangle, CheckCircle } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();

  const [plots, setPlots] = useState([]);
  const [recentDiagnoses, setRecentDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plotsRes, historyRes] = await Promise.all([
          axios.get('/api/plots'),
          axios.get('/api/diagnoses/history')
        ]);
        setPlots(plotsRes.data);
        setRecentDiagnoses(historyRes.data);
      } catch (e) {
        console.log('Dashboard fetch notice:', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 py-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider">Farmer Overview</span>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-1">
            {t('welcomeBack')}, {user?.name || 'Farmer'}!
          </h1>
          <p className="text-emerald-100/80 text-xs md:text-sm mt-2 max-w-xl">
            Manage your farm plots, execute real-time crop disease diagnosis, and access RAG advisory tailored to your current weather conditions.
          </p>
        </div>

        <Link
          to="/scan"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-3 rounded-2xl shadow-lg transition-all hover:scale-105 shrink-0 text-sm"
        >
          <Activity className="w-5 h-5 text-slate-950" />
          <span>New Leaf Scan</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Plots & Recent Diagnoses */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Plots Quick Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
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
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                No farm plots created yet. Create a plot to track specific field health over time.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plots.slice(0, 4).map((plot) => (
                  <div key={plot._id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
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
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                No leaf scans recorded yet. Click "New Leaf Scan" above to diagnose your crop.
              </div>
            ) : (
              <div className="space-y-3">
                {recentDiagnoses.slice(0, 3).map((item) => (
                  <div key={item._id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
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
                      className="text-xs font-bold text-emerald-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50"
                    >
                      Report
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Live Weather & Advisory */}
        <div className="lg:col-span-5 space-y-6">
          <WeatherWidget />
        </div>

      </div>

    </div>
  );
};
