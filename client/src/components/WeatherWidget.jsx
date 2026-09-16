import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useDeviceLocation } from '../hooks/useDeviceLocation';
import { CloudSun, Thermometer, Droplets, Wind, AlertTriangle, CheckCircle, Send, MapPin, Navigation, RefreshCw } from 'lucide-react';

export const WeatherWidget = () => {
  const { lang } = useLanguage();
  const deviceLocation = useDeviceLocation();

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [telegramSent, setTelegramSent] = useState(false);

  // Fetch weather when device location coords change
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const { lat, lon } = deviceLocation.coords || { lat: 10.7867, lon: 76.6548 };
        const res = await axios.get('/api/weather', {
          params: {
            lat,
            lon,
            district: deviceLocation.district,
            locality: deviceLocation.locality
          }
        });
        setWeather(res.data);
      } catch (e) {
        console.log('Weather widget notice:', e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [deviceLocation.coords?.lat, deviceLocation.coords?.lon, deviceLocation.district]);

  const handleSendWeatherTelegram = async () => {
    if (!weather) return;
    setSendingTelegram(true);
    try {
      const activeDistrict = weather.location?.district || deviceLocation.district || 'Palakkad';
      await axios.post('/api/telegram/send-weather', {
        district: activeDistrict,
        temperature: weather.temperature,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        rainProbability: weather.rainProbability,
        spraySafety: weather.sprayRecommendation?.safety || 'SAFE',
        lang
      });
      setTelegramSent(true);
      setTimeout(() => setTelegramSent(false), 3000);
    } catch (e) {
      console.error('Failed to send weather to Telegram:', e);
    } finally {
      setSendingTelegram(false);
    }
  };

  if (loading) {
    return (
      <div className="p-5 bg-gradient-to-br from-emerald-900 to-slate-900 rounded-2xl animate-pulse text-xs text-emerald-200 border border-emerald-800/40">
        <div className="flex items-center gap-2 mb-3">
          <Navigation className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>{lang === 'ml' ? 'ഉപകരണ ലൊക്കേഷൻ പരിശോധിക്കുന്നു...' : 'Detecting live GPS location & weather...'}</span>
        </div>
        <div className="h-16 bg-slate-800/50 rounded-xl" />
      </div>
    );
  }

  if (!weather) return null;

  const rec = weather.sprayRecommendation;
  const isSafe = rec?.safety === 'SAFE';
  const displayedLocation = deviceLocation.locationName || (weather.location?.locationName) || 'Kerala, India';

  return (
    <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-emerald-800/40">
      
      {/* Header with GPS Location Badge */}
      <div className="flex items-start justify-between mb-4 border-b border-emerald-800/60 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <CloudSun className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>{lang === 'ml' ? 'തത്സമയ കാലാവസ്ഥ' : 'Live Farm Weather'}</span>
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <p className="text-[11px] text-emerald-300 font-semibold truncate max-w-[180px] sm:max-w-[220px]">
                {displayedLocation}
              </p>
              {deviceLocation.isGpsActive && (
                <span className="inline-flex items-center gap-1 text-[9px] uppercase font-black bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  GPS Live
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
            isSafe ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}>
            {rec?.safety || 'SAFE'}
          </span>
          <button
            onClick={deviceLocation.refreshLocation}
            title={lang === 'ml' ? 'ലൊക്കേഷൻ റീഫ്രഷ് ചെയ്യുക' : 'Refresh GPS Location'}
            className="text-[10px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${deviceLocation.loading ? 'animate-spin' : ''}`} />
            <span>{lang === 'ml' ? 'ലൊക്കേഷൻ' : 'GPS'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2 text-center mb-4">
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <Thermometer className="w-4 h-4 text-red-400 mx-auto mb-1" />
          <span className="block text-xs font-bold">{weather.temperature}°C</span>
          <span className="text-[10px] text-slate-400">{lang === 'ml' ? 'താപം' : 'Temp'}</span>
        </div>
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <span className="block text-xs font-bold">{weather.humidity}%</span>
          <span className="text-[10px] text-slate-400">{lang === 'ml' ? 'ഈർപ്പം' : 'Humidity'}</span>
        </div>
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <CloudSun className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
          <span className="block text-xs font-bold">{weather.rainProbability}%</span>
          <span className="text-[10px] text-slate-400">{lang === 'ml' ? 'മഴ' : 'Rain'}</span>
        </div>
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <Wind className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <span className="block text-xs font-bold">{weather.windSpeed} <span className="text-[9px]">km/h</span></span>
          <span className="text-[10px] text-slate-400">{lang === 'ml' ? 'കാറ്റ്' : 'Wind'}</span>
        </div>
      </div>

      {/* Spray Recommendation Alert */}
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

      {/* Telegram Alert Action */}
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-emerald-800/40 text-[11px]">
        <button
          onClick={handleSendWeatherTelegram}
          disabled={sendingTelegram}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0088cc]/90 hover:bg-[#0088cc] text-white font-bold transition-all disabled:opacity-50 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>
            {sendingTelegram 
              ? (lang === 'ml' ? 'അയക്കുന്നു...' : 'Sending...') 
              : (telegramSent 
                  ? (lang === 'ml' ? 'അയച്ചു ✓' : 'Sent ✓') 
                  : (lang === 'ml' ? 'ടെലിഗ്രാം അലേർട്ട്' : 'Alert on Telegram'))}
          </span>
        </button>
        <a 
          href="https://t.me/Datasqdbot" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[10px] text-emerald-300 hover:underline flex items-center gap-1"
        >
          <span>@Datasqdbot</span>
        </a>
      </div>
    </div>
  );
};
