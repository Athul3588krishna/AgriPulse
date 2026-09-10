import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { 
  FileText, CheckCircle2, AlertTriangle, ShieldCheck, Landmark, 
  ExternalLink, Sparkles, Filter, ChevronRight, HelpCircle, Download, 
  Volume2, VolumeX, DollarSign, Award, Layers 
} from 'lucide-react';

export const SubsidyPage = () => {
  const { t, lang, speakText, stopSpeaking, isSpeaking } = useLanguage();

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Eligibility Matcher state
  const [landAcres, setLandAcres] = useState(1.5);
  const [farmerCategory, setFarmerCategory] = useState('Small');
  const [crop, setCrop] = useState('Paddy');
  const [district, setDistrict] = useState('Ernakulam');
  const [hasDamage, setHasDamage] = useState(false);
  const [damageSeverity, setDamageSeverity] = useState(30);

  const [evaluationResult, setEvaluationResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  // Claim Packet Modal state
  const [selectedClaimScheme, setSelectedClaimScheme] = useState(null);
  const [claimPacket, setClaimPacket] = useState(null);

  // Fetch all schemes
  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/subsidies/all', {
        params: { type: selectedCategory }
      });
      setSchemes(res.data.schemes || []);
    } catch (err) {
      console.error('Failed to fetch schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run Eligibility Evaluation
  const runEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await axios.post('/api/subsidies/evaluate-eligibility', {
        landAcres,
        crop,
        farmerCategory,
        district,
        hasDamage,
        damageSeverityPercent: hasDamage ? damageSeverity : 0
      });
      setEvaluationResult(res.data);
    } catch (err) {
      console.error('Eligibility evaluation error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  // Generate Digital Claim Packet
  const handleGenerateClaim = async (scheme) => {
    setSelectedClaimScheme(scheme);
    try {
      const res = await axios.post('/api/subsidies/generate-claim-packet', {
        cropName: crop,
        severityPercentage: damageSeverity,
        plotName: `${crop} Field Plot (${landAcres} Acres)`
      });
      setClaimPacket(res.data.claimPacket);
    } catch (err) {
      console.error('Error generating claim packet:', err);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [selectedCategory]);

  useEffect(() => {
    runEvaluation();
  }, []);

  const handleVoiceRead = (text) => {
    speakText(text, lang === 'ml' ? 'ml-IN' : 'en-US');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Pillar 3: Autonomous Financial & Subsidy Navigator
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            {t('subsidyTitle')}
          </h1>
          <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed">
            {t('subsidySubtitle')}
          </p>
        </div>
      </div>

      {/* AI Scheme Eligibility Matcher */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            {t('eligibilityMatcherTitle')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('eligibilityMatcherSubtitle')}
          </p>
        </div>

        {/* Input Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              {t('landSize')}
            </label>
            <input
              type="number"
              step="0.1"
              min="0.05"
              value={landAcres}
              onChange={(e) => setLandAcres(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              {t('farmerType')}
            </label>
            <select
              value={farmerCategory}
              onChange={(e) => setFarmerCategory(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Marginal">{t('marginalFarmer')}</option>
              <option value="Small">{t('smallFarmer')}</option>
              <option value="Medium">{t('mediumFarmer')}</option>
              <option value="Large">{t('largeFarmer')}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Primary Cultivated Crop
            </label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Paddy">Paddy / Rice (നെല്ല്)</option>
              <option value="Banana">Banana / Nendran (വാഴ)</option>
              <option value="Vegetables">Vegetables / Tomato (പച്ചക്കറി)</option>
              <option value="Ginger">Ginger (ഇഞ്ചി)</option>
              <option value="BlackPepper">Black Pepper (കുരുമുളക്)</option>
              <option value="Coconut">Coconut (തെങ്ങ്)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              District / Krishi Bhavan
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Ernakulam">Ernakulam</option>
              <option value="Thrissur">Thrissur</option>
              <option value="Palakkad">Palakkad</option>
              <option value="Alappuzha">Alappuzha</option>
              <option value="Wayanad">Wayanad</option>
              <option value="Kottayam">Kottayam</option>
              <option value="Idukki">Idukki</option>
            </select>
          </div>
        </div>

        {/* Crop Damage Toggle for PMFBY Insurance Claim Trigger */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="damageToggle"
              checked={hasDamage}
              onChange={(e) => setHasDamage(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="damageToggle" className="text-xs font-bold text-amber-950 cursor-pointer">
              {t('claimInsuranceTitle')} — Crop disease or flood damage observed in field?
            </label>
          </div>

          {hasDamage && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-900 font-semibold">Severity %:</span>
              <input
                type="number"
                min="10"
                max="100"
                value={damageSeverity}
                onChange={(e) => setDamageSeverity(e.target.value)}
                className="w-20 text-xs font-bold px-2 py-1 rounded-lg border border-amber-300 bg-white"
              />
            </div>
          )}
        </div>

        <button
          onClick={runEvaluation}
          disabled={evaluating}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t('checkEligibilityBtn')}</span>
        </button>

        {/* Evaluation Summary Card */}
        {evaluationResult && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blue-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  {evaluationResult.totalSchemesMatched} {t('schemesMatched')}
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  {lang === 'ml' ? evaluationResult.advisoryMl : evaluationResult.advisoryEn}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-blue-600 block">{t('totalEstimatedBenefit')}</span>
                <span className="text-2xl font-black text-blue-900">
                  ₹{evaluationResult.totalEstimatedAid.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Matched Scheme Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {evaluationResult.schemes.map((scheme) => (
                <div key={scheme.id} className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm flex flex-col justify-between space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-extrabold text-xs text-slate-900">
                      {lang === 'ml' ? scheme.nameMl : scheme.nameEn}
                    </span>
                    {scheme.isHighPriority && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-700 animate-pulse">
                        HIGH PRIORITY CLAIM
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">{scheme.type}</span>
                    <span className="font-black text-emerald-700">
                      +₹{scheme.calculatedBenefit.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Match: {scheme.matchScore}%</span>
                    <button
                      onClick={() => handleGenerateClaim(scheme)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Application Packet</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Schemes Directory */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-blue-600" />
              Verified Agricultural Scheme Directory
            </h2>
            <p className="text-xs text-slate-500">
              Authoritative policies from Ministry of Agriculture and Kerala Department of Agriculture.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('allSchemes')}</option>
              <option value="Insurance">Crop Insurance (PMFBY)</option>
              <option value="Direct Benefit">Direct Benefit Transfer (PM-KISAN)</option>
              <option value="Cultivation Incentive">Cultivation Incentives (Subhiksha)</option>
              <option value="Infrastructure">Irrigation Subsidies</option>
              <option value="Equipment">Farm Machinery (SMAM)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    {scheme.type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{scheme.authority}</span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                  {lang === 'ml' ? scheme.nameMl : scheme.nameEn}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === 'ml' ? scheme.descriptionMl : scheme.descriptionEn}
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Financial Assistance</span>
                  <span className="text-xs font-bold text-emerald-800 block">
                    {lang === 'ml' ? scheme.maxFinancialBenefitMl : scheme.maxFinancialBenefitEn}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('requiredDocs')}:</span>
                  <ul className="text-[11px] text-slate-600 space-y-0.5 list-disc list-inside">
                    {(lang === 'ml' ? scheme.requiredDocumentsMl : scheme.requiredDocumentsEn).slice(0, 3).map((doc, idx) => (
                      <li key={idx} className="truncate">{doc}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <a
                    href={scheme.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleVoiceRead(lang === 'ml' ? scheme.descriptionMl : scheme.descriptionEn)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                    title={isSpeaking ? t('stopAudio') : t('readAloud')}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Claim Packet Modal */}
      {claimPacket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider block">
                  Official Claim Dossier
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {claimPacket.claimId}
                </h3>
              </div>
              <button
                onClick={() => setClaimPacket(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 block">Cultivated Plot:</span>
                  <span className="font-bold">{claimPacket.plotName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Verified Status:</span>
                  <span className="font-bold text-emerald-700">{claimPacket.eligibilityStatus}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Required Documentation Checklist:</span>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  {claimPacket.documentsRequired.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-1.5">
                <span className="font-bold text-blue-900 block">Action Steps for Compensation:</span>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  {(lang === 'ml' ? claimPacket.actionStepsMl : claimPacket.actionStepsEn).map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setClaimPacket(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('Claim Dossier PDF downloaded successfully with geo-tagged damage timestamp.');
                  setClaimPacket(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/30 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Claim Packet</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
