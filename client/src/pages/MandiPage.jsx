import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, Legend 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Minus, MapPin, Calculator, RefreshCw, Volume2, VolumeX, 
  ArrowRight, ShieldCheck, DollarSign, Store, Sparkles, AlertCircle, Globe 
} from 'lucide-react';
import { useDeviceLocation, KERALA_DISTRICTS } from '../hooks/useDeviceLocation';

export const MandiPage = () => {
  const { t, lang, speakText, stopSpeaking, isSpeaking } = useLanguage();
  const deviceLocation = useDeviceLocation();

  const [pricesData, setPricesData] = useState([]);
  const [commoditiesList, setCommoditiesList] = useState([]);
  const [selectedCommodity, setSelectedCommodity] = useState('Tomato');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [loadingPrices, setLoadingPrices] = useState(true);

  // Live Agmarknet Sync state
  const [syncStatus, setSyncStatus] = useState({ isLive: false, source: 'Agmarknet Spec', lastSynced: null });
  const [syncingLive, setSyncingLive] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);

  // 7-day Forecast state
  const [forecastData, setForecastData] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Arbitrage Calculator state
  const [calcQty, setCalcQty] = useState(500);
  const [farmerLocation, setFarmerLocation] = useState('Ernakulam');
  const [arbitrageResult, setArbitrageResult] = useState(null);
  const [loadingArbitrage, setLoadingArbitrage] = useState(false);

  useEffect(() => {
    if (deviceLocation.district) {
      setFarmerLocation(deviceLocation.district);
    }
  }, [deviceLocation.district]);

  // Fetch current Mandi prices
  const fetchPrices = async () => {
    setLoadingPrices(true);
    try {
      const res = await axios.get('/api/mandi/prices', {
        params: { commodity: selectedCommodity, district: selectedDistrict }
      });
      setPricesData(res.data.data || []);
      if (res.data.commoditiesList) {
        setCommoditiesList(res.data.commoditiesList);
      }
      if (res.data.syncStatus) {
        setSyncStatus(res.data.syncStatus);
      }
    } catch (err) {
      console.error('Failed to fetch mandi prices:', err);
    } finally {
      setLoadingPrices(false);
    }
  };

  // Trigger on-demand Agmarknet Live sync
  const triggerLiveAgmarknetSync = async () => {
    setSyncingLive(true);
    setSyncFeedback(null);
    try {
      const res = await axios.post('/api/mandi/sync');
      if (res.data?.syncStatus) {
        setSyncStatus(res.data.syncStatus);
      }
      setSyncFeedback(res.data?.message || 'Agmarknet synchronized successfully.');
      await fetchPrices();
      await fetchForecast(selectedCommodity);
    } catch (err) {
      setSyncFeedback('Agmarknet live sync notice: using verified APMC rates.');
    } finally {
      setSyncingLive(false);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  // Fetch 7-day forecast
  const fetchForecast = async (commodity) => {
    setLoadingForecast(true);
    try {
      const res = await axios.get(`/api/mandi/forecast/${commodity}`);
      setForecastData(res.data);
    } catch (err) {
      console.error('Failed to fetch forecast:', err);
    } finally {
      setLoadingForecast(false);
    }
  };

  // Run Arbitrage Calculation
  const runArbitrageCalc = async () => {
    setLoadingArbitrage(true);
    try {
      const res = await axios.post('/api/mandi/optimize-arbitrage', {
        commodity: selectedCommodity,
        quantityKg: calcQty,
        farmerLocation
      });
      setArbitrageResult(res.data);
    } catch (err) {
      console.error('Arbitrage optimization error:', err);
    } finally {
      setLoadingArbitrage(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    fetchForecast(selectedCommodity);
  }, [selectedCommodity, selectedDistrict]);

  useEffect(() => {
    runArbitrageCalc();
  }, [selectedCommodity]);

  const handleVoiceRead = (text) => {
    speakText(text, lang === 'ml' ? 'ml-IN' : 'en-US');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Pillar 2: Post-Harvest Market Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            {t('mandiTitle')}
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            {t('mandiSubtitle')}
          </p>
        </div>
      </div>

      {/* Live Agmarknet Sync Status Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3.5 w-3.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${syncStatus?.isLive ? 'bg-emerald-400' : 'bg-teal-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${syncStatus?.isLive ? 'bg-emerald-500' : 'bg-teal-600'}`}></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-sm text-slate-800">
                {syncStatus?.isLive 
                  ? 'Agmarknet (Data.gov.in) Live APMC Feed' 
                  : 'Agmarknet Verified APMC Kerala Feed'}
              </span>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                syncStatus?.isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {syncStatus?.isLive ? 'LIVE' : 'VERIFIED CACHE'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {syncStatus?.lastSynced 
                ? `Last Synced: ${new Date(syncStatus.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                : 'Automated Real-Time Agmarknet Synchronization Active'} 
              {syncStatus?.recordsCount ? ` • ${syncStatus.recordsCount} Regional Markets Tracked` : ' • Kerala APMC Hubs'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {syncFeedback && (
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
              {syncFeedback}
            </span>
          )}
          <button
            onClick={triggerLiveAgmarknetSync}
            disabled={syncingLive}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingLive ? 'animate-spin' : ''}`} />
            {syncingLive 
              ? (lang === 'ml' ? 'സിങ്ക് ചെയ്യുന്നു...' : 'Syncing Live...') 
              : (lang === 'ml' ? 'തത്സമയ Agmarknet സിങ്ക്' : 'Sync Agmarknet Live')}
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('selectCommodity')}:
          </label>
          <div className="flex flex-wrap gap-2">
            {commoditiesList.map((comm) => (
              <button
                key={comm.id}
                onClick={() => setSelectedCommodity(comm.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCommodity === comm.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {lang === 'ml' ? comm.nameMl : comm.nameEn}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {deviceLocation.district && (
            <button
              onClick={() => setSelectedDistrict(selectedDistrict === deviceLocation.district ? '' : deviceLocation.district)}
              className={`text-xs px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 border ${
                selectedDistrict === deviceLocation.district
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
              title={lang === 'ml' ? 'എന്റെ ലൈവ് ജില്ലയിലെ മണ്ടികൾ കാണുക' : 'Filter by my live district'}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{lang === 'ml' ? `${deviceLocation.districtMl} (GPS)` : `${deviceLocation.district} (GPS)`}</span>
            </button>
          )}

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">{t('allDistricts')}</option>
            {KERALA_DISTRICTS.map((d) => (
              <option key={d.id} value={d.nameEn}>
                {lang === 'ml' ? `${d.nameMl} (${d.nameEn})` : d.nameEn}
              </option>
            ))}
          </select>

          <button
            onClick={() => { fetchPrices(); fetchForecast(selectedCommodity); }}
            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
            title="Refresh Rates"
          >
            <RefreshCw className={`w-4 h-4 ${loadingPrices ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid: 7-Day Forecast Chart & Middleman Bypass Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Cols: 7-Day Price Forecast Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                {t('forecastTitle')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedCommodity} ({forecastData?.unit ? `₹ / ${forecastData.unit}` : '₹ / kg'})
              </p>
            </div>
            {forecastData && (
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                forecastData.percentChange7Days >= 0 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {forecastData.overallRecommendation}
              </span>
            )}
          </div>

          {/* Forecast Chart */}
          <div className="h-64 w-full">
            {loadingForecast ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Generating volatility projection model...
              </div>
            ) : forecastData?.forecast ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData.forecast} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(val) => [`₹ ${val} / ${forecastData.unit}`, 'Predicted Rate']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="upperBound" stroke="#a7f3d0" fill="#ecfdf5" fillOpacity={0.5} name="Upper Volatility" />
                  <Area type="monotone" dataKey="predictedPrice" stroke="#059669" strokeWidth={3} fill="url(#priceGrad)" name="Modal Forecast" />
                  <Line type="monotone" dataKey="lowerBound" stroke="#cbd5e1" strokeDasharray="3 3" name="Lower Support" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No forecast data available.
              </div>
            )}
          </div>

          {/* AI Market Advisory Box */}
          {forecastData && (
            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  AI Market Advisory
                </span>
                <p className="text-emerald-800 leading-relaxed">
                  {lang === 'ml' ? forecastData.advisoryMl : forecastData.advisoryEn}
                </p>
              </div>
              <button
                onClick={() => handleVoiceRead(lang === 'ml' ? forecastData.advisoryMl : forecastData.advisoryEn)}
                className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-all flex-shrink-0"
                title={isSpeaking ? t('stopAudio') : t('readAloud')}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-emerald-700" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
              </button>
            </div>
          )}
        </div>

        {/* Right 5 Cols: Middleman Bypass & Arbitrage Calculator */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600" />
                {t('netProfitCalc')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t('calcSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  {t('harvestQty')}
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={calcQty}
                  onChange={(e) => setCalcQty(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  Farm District / Hub
                </label>
                <select
                  value={farmerLocation}
                  onChange={(e) => setFarmerLocation(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {KERALA_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.nameEn}>
                      {lang === 'ml' ? `${d.nameMl} (${d.nameEn})` : d.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={runArbitrageCalc}
              disabled={loadingArbitrage}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {loadingArbitrage ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
              <span>{t('calcProfitBtn')}</span>
            </button>
          </div>

          {/* Arbitrage Result Card */}
          {arbitrageResult?.recommendedMandi && (
            <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {t('recommendedMandi')}
                </span>
                <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {arbitrageResult.recommendedMandi.district}
                </span>
              </div>

              <div className="text-base font-extrabold text-slate-900">
                {arbitrageResult.recommendedMandi.mandiName}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">Gross Revenue</span>
                  <span className="font-bold text-slate-800">
                    ₹{arbitrageResult.recommendedMandi.grossRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">Transport + Fees</span>
                  <span className="font-bold text-amber-700">
                    ₹{(arbitrageResult.recommendedMandi.transportExpense + arbitrageResult.recommendedMandi.mandiHandlingFee).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="bg-emerald-600 text-white rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-200 block">Net Farmer Profit</span>
                  <span className="text-lg font-black">
                    ₹{arbitrageResult.recommendedMandi.netProfit.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-emerald-200 block">Bypassing Middleman</span>
                  <span className="text-xs font-extrabold bg-emerald-700 px-2 py-1 rounded-md text-emerald-100">
                    +₹{arbitrageResult.recommendedMandi.directBenefitOverMiddleman.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-tight italic">
                {lang === 'ml' ? arbitrageResult.advisoryMl : arbitrageResult.advisoryEn}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Mandi Price Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-600" />
              {t('marketPriceTable')}
            </h2>
            <p className="text-xs text-slate-500">
              Verified daily market arrivals from APMC & Agmarknet government reporting nodes.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {pricesData.length} Mandis Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Market / Mandi</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Commodity</th>
                <th className="py-3 px-4">{t('modalPrice')}</th>
                <th className="py-3 px-4">{t('minMax')}</th>
                <th className="py-3 px-4">{t('trend')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {pricesData.map((mandi) => (
                mandi.commodities.map((comm) => (
                  <tr key={`${mandi.id}-${comm.commodityKey}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      {mandi.mandiName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{mandi.district}</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-800">
                      {lang === 'ml' ? comm.nameMl : comm.nameEn}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      ₹{comm.modalPrice} <span className="text-[10px] text-slate-400 font-normal">/ {comm.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      ₹{comm.minPrice} - ₹{comm.maxPrice}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        comm.trend === 'up' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : comm.trend === 'down' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {comm.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                        {comm.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                        {comm.trend === 'stable' && <Minus className="w-3 h-3" />}
                        {comm.change > 0 ? `+${comm.change}` : comm.change}
                      </span>
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
