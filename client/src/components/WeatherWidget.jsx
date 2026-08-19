import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { CloudSun, Thermometer, Droplets, Wind, AlertTriangle, CheckCircle } from 'lucide-react';

export const WeatherWidget = () => {
  const { lang } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await axios.get('/api/weather');
        setWeather(res.data);
      } catch (e) {
        console.log('Weather widget notice:', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  if (loading) {
    return <div className="p-4 bg-emerald-50/60 rounded-xl animate-pulse text-xs text-emerald-700">Fetching real-time weather...</div>;
  }

  if (!weather) return null;

  const rec = weather.sprayRecommendation;
  const isSafe = rec.safety === 'SAFE';

  return (
    <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-emerald-800/40">
      <div className="flex items-center justify-between mb-4 border-b border-emerald-800/60 pb-3">
        <div className="flex items-center gap-2">
          <CloudSun className="w-6 h-6 text-amber-400" />
          <div>
            <h3 className="font-bold text-sm text-slate-100">Live Farm Weather</h3>
            <p className="text-[11px] text-emerald-300 font-medium">Kochi, Kerala (Auto-detected)</p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
          isSafe ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
        }`}>
          {rec.safety}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center mb-4">
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <Thermometer className="w-4 h-4 text-red-400 mx-auto mb-1" />
          <span className="block text-xs font-bold">{weather.temperature}°C</span>
          <span className="text-[10px] text-slate-400">Temp</span>
        </div>
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <span className="block text-xs font-bold">{weather.humidity}%</span>
          <span className="text-[10px] text-slate-400">Humidity</span>
        </div>
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <CloudSun className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
          <span className="block text-xs font-bold">{weather.rainProbability}%</span>
          <span className="text-[10px] text-slate-400">Rain Chance</span>
        </div>
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <Wind className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <span className="block text-xs font-bold">{weather.windSpeed} <span className="text-[9px]">km/h</span></span>
          <span className="text-[10px] text-slate-400">Wind</span>
        </div>
      </div>

      <div className={`p-3 rounded-xl border flex items-start gap-2 text-xs ${
        isSafe
          ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-200'
          : 'bg-amber-950/40 border-amber-700/50 text-amber-200'
      }`}>
        {isSafe ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
        <p className="leading-snug">
          {lang === 'ml' ? rec.reasonMl : rec.reasonEn}
        </p>
      </div>
    </div>
  );
};
