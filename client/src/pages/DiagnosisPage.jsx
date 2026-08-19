import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { Leaf, Upload, Volume2, VolumeX, CheckCircle, AlertTriangle, CloudSun, Shield, FileText, Sparkles, RefreshCw } from 'lucide-react';

export const DiagnosisPage = () => {
  const { t, lang, speakText, stopSpeaking, isSpeaking } = useLanguage();

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [cropName, setCropName] = useState('Tomato');
  const [plots, setPlots] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/plots').then((res) => setPlots(res.data)).catch(() => {});
  }, []);

  const handleFileChange = (file) => {
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or upload a leaf image first.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('cropName', cropName);
    formData.append('plotId', selectedPlot);

    try {
      const res = await axios.post('/api/diagnoses/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error executing leaf diagnosis.');
    } finally {
      setLoading(false);
    }
  };

  const currentAdvisory = result?.advisory?.[lang === 'ml' ? 'malayalam' : 'english'] || result?.advisory?.english;

  const handleVoiceReadout = () => {
    if (!currentAdvisory) return;
    const textToRead = `${result.diseaseName}. ${currentAdvisory.summary}. ` +
      `Organic Remedies: ${currentAdvisory.organic?.join('. ')}. ` +
      `Chemical Remedies: ${currentAdvisory.chemical?.join('. ')}.`;
    speakText(textToRead);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-md">
          <Leaf className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('uploadLeaf')}</h1>
        <p className="text-xs text-slate-500">
          Upload a high-resolution photo of affected crop leaves for computer vision identification & RAG advisory.
        </p>
      </div>

      {/* Upload Form */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        <form onSubmit={handleScanSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t('selectCrop')}</label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Tomato">Tomato (തക്കാളി)</option>
                <option value="Paddy">Paddy / Rice (നെല്ല്)</option>
                <option value="Potato">Potato (ഉരുളക്കിഴങ്ങ്)</option>
                <option value="Corn">Corn / Maize (ചോളം)</option>
                <option value="Chilli">Chilli (മുളക്)</option>
                <option value="General">Other / General Crop</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Farm Plot (Optional)</label>
              <select
                value={selectedPlot}
                onChange={(e) => setSelectedPlot(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- No Specific Plot --</option>
                {plots.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} ({p.cropType})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Drag & Drop File Upload Area */}
          <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-2xl p-6 text-center hover:bg-emerald-50 transition-colors">
            {imagePreview ? (
              <div className="space-y-3">
                <img src={imagePreview} alt="Leaf Preview" className="max-h-56 mx-auto rounded-xl shadow-md border border-emerald-200" />
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setImagePreview(null); }}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Remove & Choose Another Photo
                </button>
              </div>
            ) : (
              <label className="cursor-pointer space-y-3 block">
                <Upload className="w-10 h-10 text-emerald-600 mx-auto" />
                <div className="space-y-1">
                  <span className="text-sm font-bold text-emerald-900 block">Click to upload or drag leaf image here</span>
                  <span className="text-[11px] text-slate-500">Supports JPG, PNG, WEBP up to 10MB</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">{error}</div>}

          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-sm shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Running Computer Vision & RAG Advisory Engine...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{t('analyzeBtn')}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Diagnosis Report Output */}
      {result && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 space-y-8 animate-fade-in">
          
          {/* Top Bar: Disease Name, Severity Gauge & Voice Button */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <span className="text-emerald-700 text-xs font-extrabold uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                Diagnosis Confirmed
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">{result.diseaseName}</h2>
              <p className="text-xs text-slate-500">Crop: {result.cropName} • Analysis Time: Just Now</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleVoiceReadout}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isSpeaking ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSpeaking ? t('stopAudio') : t('readAloud')}</span>
              </button>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-[11px] text-emerald-800 font-bold uppercase">{t('confidence')}</span>
              <span className="block text-2xl font-extrabold text-emerald-900 mt-1">{result.confidenceScore}%</span>
              <span className="text-[10px] text-emerald-700">PyTorch EfficientNet Neural Net</span>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-[11px] text-amber-800 font-bold uppercase">{t('severity')}</span>
              <span className="block text-2xl font-extrabold text-amber-900 mt-1">
                {result.severityPercentage}% ({result.severityLevel})
              </span>
              <span className="text-[10px] text-amber-700">OpenCV Lesion Color Contour Ratio</span>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-300 font-bold uppercase">Spray Safety</span>
              <span className="block text-xl font-extrabold text-emerald-400 mt-1">
                {result.weatherSnapshot?.sprayRecommendation || 'SAFE'}
              </span>
              <span className="text-[10px] text-slate-400">Open-Meteo Weather Check</span>
            </div>
          </div>

          {/* RAG Contextual Advisory Section */}
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                RAG Evidence-Based Advisory ({lang === 'ml' ? 'മലയാളം' : 'English'})
              </h3>
            </div>

            {currentAdvisory && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Organic Remedies */}
                <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-3">
                  <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    {t('biologicalRemedy')}
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {currentAdvisory.organic?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Chemical Remedies */}
                <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-200 space-y-3">
                  <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-600" />
                    {t('chemicalRemedy')}
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {currentAdvisory.chemical?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            )}

            {/* References & Citations */}
            {result.sources && result.sources.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-700 block">{t('sources')}:</span>
                <ul className="space-y-1">
                  {result.sources.map((s, i) => (
                    <li key={i} className="text-slate-600">
                      • <a href={s.url} target="_blank" rel="noreferrer" className="text-emerald-700 font-medium hover:underline">{s.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
