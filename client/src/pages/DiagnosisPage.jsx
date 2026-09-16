import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useLanguage } from '../context/LanguageContext';
import { Leaf, Upload, Volume2, VolumeX, Mic, MicOff, Download, CheckCircle, AlertTriangle, CloudSun, Shield, FileText, Sparkles, RefreshCw, Landmark, ArrowRight, Zap, ShoppingBag, Star, Lock, Send, ExternalLink, MapPin } from 'lucide-react';
import { useDeviceLocation } from '../hooks/useDeviceLocation';

export const DiagnosisPage = () => {
  const { t, lang, speakText, stopSpeaking, isSpeaking, startListening, isListening } = useLanguage();
  const deviceLocation = useDeviceLocation();

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [cropName, setCropName] = useState('Tomato');
  const [plots, setPlots] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState('');

  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [nonLeafError, setNonLeafError] = useState(null);

  const reportRef = useRef(null);
  const { user } = useAuth();
  const [quotaInfo, setQuotaInfo] = useState({ tier: user?.subscriptionTier || 'free', count: user?.monthlyScanCount || 0, limit: 5 });
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [telegramSent, setTelegramSent] = useState(false);
  const [telegramFeedback, setTelegramFeedback] = useState('');
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState('');
  const [customChatId, setCustomChatId] = useState('');

  useEffect(() => {
    axios.get('/api/plots').then((res) => setPlots(res.data)).catch(() => {});
    if (user) {
      axios.get('/api/subscription/status')
        .then((res) => setQuotaInfo(res.data))
        .catch(() => {});
    }
  }, [user]);

  // Instant client-side inspection to catch ID cards, documents, faces, and non-leaf objects
  const inspectImageClientSide = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 160;
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
        canvas.width = Math.max(1, Math.floor(img.width * scale));
        canvas.height = Math.max(1, Math.floor(img.height * scale));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const totalPixels = data.length / 4;

        let foliagePixels = 0;
        let lowSatPixels = 0;
        let skinPixels = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;
          let h = 0;
          const s = max === 0 ? 0 : delta / max;
          const v = max / 255;

          if (delta !== 0) {
            if (max === r) h = ((g - b) / delta) % 6;
            else if (max === g) h = (b - r) / delta + 2;
            else h = (r - g) / delta + 4;
            h = Math.round(h * 60);
            if (h < 0) h += 360;
          }

          // Green / foliage (50°-175°, s >= 0.22, v >= 0.20)
          if (h >= 50 && h <= 175 && s >= 0.22 && v >= 0.20) {
            foliagePixels++;
          }
          // Foliar chlorosis yellow (32°-50°, s >= 0.35, v >= 0.35)
          else if (h >= 32 && h < 50 && s >= 0.35 && v >= 0.35) {
            foliagePixels++;
          }
          // Necrotic brown lesion (10°-32°, s >= 0.28, v <= 0.75)
          else if (h >= 10 && h < 32 && s >= 0.28 && v >= 0.20 && v <= 0.75) {
            foliagePixels++;
          }

          // Low saturation (white paper, gray cards, screens)
          if (s < 0.20) {
            lowSatPixels++;
          }

          // Human skin tone in RGB: R > G > B
          if (r > 95 && g > 40 && b > 20 && (max - min) > 15 && (r - g) > 12 && r > g && r > b) {
            skinPixels++;
          }
        }

        const foliageRatio = foliagePixels / totalPixels;
        const lowSatRatio = lowSatPixels / totalPixels;
        const skinRatio = skinPixels / totalPixels;

        if (lowSatRatio > 0.45 && foliageRatio < 0.28) {
          setNonLeafError({
            detectedType: 'Document / ID Card / Paper',
            message: lang === 'ml' 
              ? 'ഡോക്യുമെന്റോ ഐഡി കാർഡോ പേപ്പറോ ആണ് കണ്ടെത്തിയത്. ദയവായി വിളകളുടെ ഇലയുടെ കളർ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക.'
              : 'Document, ID card, or paper background detected. Please upload an agricultural crop leaf photo.'
          });
          return;
        }

        if (skinRatio > 0.30 && foliageRatio < 0.20) {
          setNonLeafError({
            detectedType: 'Human / Portrait',
            message: lang === 'ml'
              ? 'മനുഷ്യന്റെ മുഖമോ ശരീരമോ ആണ് കണ്ടത്. ദയവായി വിളകളുടെ ഇലയുടെ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക.'
              : 'Human face or portrait detected. AgriPulse AI only scans crop leaves.'
          });
          return;
        }

        if (foliageRatio < 0.16) {
          setNonLeafError({
            detectedType: 'Non-Plant Object',
            message: lang === 'ml'
              ? 'ചെടിയുടെ ഇലയോ വിളയോ ഈ ചിത്രത്തിൽ കാണുന്നില്ല. വിളകളുടെ രോഗനിർണയത്തിനായി ഇലയുടെ വ്യക്തമായ ചിത്രം മാത്രം നൽകുക.'
              : 'No plant leaf or agricultural crop detected. Only crop leaves can be analyzed for disease diagnosis.'
          });
          return;
        }

        // Image passed client-side leaf checks!
        setNonLeafError(null);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (file) => {
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
      setNonLeafError(null);
      inspectImageClientSide(file);
    }
  };

  // Generate synthetic diseased leaf sample on the fly for instant hackathon demos
  const loadSampleLeaf = (type) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 400, 400);

    // Leaf body
    ctx.beginPath();
    ctx.ellipse(200, 200, 110, 160, Math.PI / 12, 0, 2 * Math.PI);
    ctx.fillStyle = type === 'corn' ? '#65a30d' : '#22c55e';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#15803d';
    ctx.stroke();

    // Leaf veins
    ctx.beginPath();
    ctx.moveTo(200, 50);
    ctx.lineTo(200, 350);
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Necrotic lesion spots (HSV yellow/brown)
    const lesionCount = type === 'tomato' ? 14 : type === 'potato' ? 18 : 10;
    for (let i = 0; i < lesionCount; i++) {
      const lx = 140 + Math.random() * 120;
      const ly = 100 + Math.random() * 200;
      const lr = 8 + Math.random() * 16;
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, 2 * Math.PI);
      ctx.fillStyle = i % 2 === 0 ? '#854d0e' : '#a16207';
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    canvas.toBlob((blob) => {
      const fileName = `${type}_diseased_sample_leaf.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      handleFileChange(file);
      if (type === 'tomato') setCropName('Tomato');
      else if (type === 'potato') setCropName('Potato');
      else if (type === 'corn') setCropName('Corn');
    }, 'image/png');
  };

  // Generate synthetic non-leaf image (blue metallic vehicle) for instant testing of rejection
  const loadNonLeafSample = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // Background dark garage
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 400, 400);

    // Car body (metallic blue)
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(50, 190, 300, 90);

    // Car roof/cabin
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(110, 110, 180, 80);

    // Wheels
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(110, 280, 32, 0, 2 * Math.PI);
    ctx.arc(290, 280, 32, 0, 2 * Math.PI);
    ctx.fill();

    // Wheel hubs
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(110, 280, 14, 0, 2 * Math.PI);
    ctx.arc(290, 280, 14, 0, 2 * Math.PI);
    ctx.fill();

    // Warning text on image
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NON-LEAF VEHICLE SAMPLE', 200, 60);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'sample_non_leaf_car.png', { type: 'image/png' });
      handleFileChange(file);
      setCropName('General');
    }, 'image/png');
  };

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or upload a leaf image first.');
      return;
    }

    if (nonLeafError) {
      setError(nonLeafError.message || (lang === 'ml' ? 'ഇലയല്ലാത്ത ചിത്രം സ്കാൻ ചെയ്യാൻ സാധിക്കില്ല.' : 'Cannot scan a non-leaf image.'));
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('cropName', cropName);
    formData.append('plotId', selectedPlot);
    if (deviceLocation.coords) {
      formData.append('latitude', deviceLocation.coords.lat);
      formData.append('longitude', deviceLocation.coords.lon);
      formData.append('location', deviceLocation.locationName || `${deviceLocation.district}, Kerala`);
    }

    try {
      const res = await axios.post('/api/diagnoses/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
      if (res.data.quotaInfo) {
        setQuotaInfo(prev => ({
          ...prev,
          tier: res.data.quotaInfo.tier,
          count: res.data.quotaInfo.monthlyScanCount,
          limit: res.data.quotaInfo.quotaLimit
        }));
      }
    } catch (err) {
      // Check if image was rejected because it is not a plant leaf
      if (err.response?.status === 400 && (err.response?.data?.isLeaf === false || err.response?.data?.is_leaf === false)) {
        setNonLeafError({
          message: lang === 'ml' 
            ? (err.response.data.message_ml || err.response.data.error_ml || err.response.data.message)
            : (err.response.data.message || err.response.data.error),
          detectedType: err.response.data.detectedType || err.response.data.detected_type || 'Non-Plant Image',
          metrics: err.response.data.metrics
        });
        setError('');
      } else if (err.response?.status === 403 || err.response?.data?.quotaReached) {
        setQuotaModalOpen(true);
        setError(err.response?.data?.message || 'Free monthly quota of 5 scans reached.');
      } else {
        setError(err.response?.data?.message || 'Error executing leaf diagnosis.');
      }
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

  const handleMicInput = () => {
    startListening((transcript) => {
      console.log('Voice transcript:', transcript);
      if (transcript.toLowerCase().includes('paddy') || transcript.includes('നെല്ല്')) setCropName('Paddy');
      else if (transcript.toLowerCase().includes('potato') || transcript.includes('ഉരുളക്കിഴങ്ങ്')) setCropName('Potato');
      else if (transcript.toLowerCase().includes('corn') || transcript.includes('ചോളം')) setCropName('Corn');
      else if (transcript.toLowerCase().includes('chilli') || transcript.includes('മുളക്')) setCropName('Chilli');
      else if (transcript.toLowerCase().includes('tomato') || transcript.includes('തക്കാളി')) setCropName('Tomato');
    });
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current || !result) return;
    setDownloadingPdf(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AgriPulse_Diagnosis_${result.diseaseName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Could not export PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleOpenTelegramModal = async () => {
    setTelegramFeedback('');
    setTelegramModalOpen(true);
    try {
      const res = await axios.get('/api/telegram/recent-chats');
      if (res.data.success && res.data.chats) {
        setRecentChats(res.data.chats);
        if (res.data.defaultChatId) {
          setSelectedChatId(res.data.defaultChatId);
        } else if (res.data.chats.length > 0) {
          setSelectedChatId(res.data.chats[0].chatId);
        }
      }
    } catch (e) {
      console.error('Failed to load chats:', e);
    }
  };

  const handleSendTelegram = async () => {
    if (!result) return;
    setSendingTelegram(true);
    setTelegramFeedback('');
    try {
      const targetChat = customChatId.trim() || selectedChatId;
      const payload = {
        chatId: targetChat || undefined,
        crop: result.cropName || cropName,
        disease: result.diseaseName,
        confidence: result.confidenceScore,
        severity: result.severityPercentage,
        severityLevel: result.severityLevel,
        advisory: result.advisory,
        location: deviceLocation.locationName || `${deviceLocation.district}, Kerala`,
        lang
      };
      const res = await axios.post('/api/telegram/send-diagnosis', payload);
      if (res.data.success) {
        setTelegramSent(true);
        setTelegramFeedback(lang === 'ml' 
          ? 'റിപ്പോർട്ട് വിജയകരമായി ടെലിഗ്രാമിലേക്ക് അയച്ചു! (@Datasqdbot പരിശോധിക്കുക)' 
          : 'Report sent to Telegram successfully! Check @Datasqdbot');
        setTimeout(() => {
          setTelegramModalOpen(false);
          setTelegramSent(false);
        }, 2500);
      }
    } catch (err) {
      setTelegramFeedback(err.response?.data?.message || (lang === 'ml' ? 'ടെലിഗ്രാമിലേക്ക് അയക്കാൻ സാധിച്ചില്ല.' : 'Failed to send to Telegram.'));
    } finally {
      setSendingTelegram(false);
    }
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

      {/* Quota & Plan Status Banner */}
      <div className="max-w-2xl mx-auto">
        {(user?.subscriptionTier === 'pro' || user?.subscriptionTier === 'fpo' || quotaInfo.tier === 'pro' || quotaInfo.tier === 'fpo') ? (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-sm">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>AgriPulse Pro Active • Unlimited AI Diagnoses & Priority Agronomy</span>
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold">UNLIMITED</span>
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-xs">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>
                {lang === 'ml' 
                  ? `സൗജന്യ പ്ലാൻ: ഈ മാസം ${quotaInfo.count || quotaInfo.monthlyScanCount || 0}/5 സ്കാനുകൾ ഉപയോഗിച്ചു`
                  : `Free Tier: ${quotaInfo.count || quotaInfo.monthlyScanCount || 0}/5 monthly scans used`}
              </span>
            </span>
            <Link 
              to="/pricing" 
              className="text-amber-800 font-black hover:text-amber-900 underline flex items-center gap-1"
            >
              <span>{lang === 'ml' ? 'പ്രോയിലേക്ക് മാറുക' : 'Upgrade to Pro'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Upload Form */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        <form onSubmit={handleScanSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">{t('selectCrop')}</label>
                <button
                  type="button"
                  onClick={handleMicInput}
                  className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse border-red-600'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                  title="Speak to select crop"
                >
                  {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3 text-emerald-600" />}
                  <span>{isListening ? t('listeningActive') : t('startListening')}</span>
                </button>
              </div>

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

          {/* Hackathon Quick Demo Sample Leaves */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Hackathon Demo Samples:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => loadSampleLeaf('tomato')}
                className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center gap-1"
              >
                <span>🍅 Tomato Blight</span>
              </button>
              <button
                type="button"
                onClick={() => loadSampleLeaf('potato')}
                className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center gap-1"
              >
                <span>🥔 Potato Blight</span>
              </button>
              <button
                type="button"
                onClick={() => loadSampleLeaf('corn')}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center gap-1"
              >
                <span>🌽 Corn Rust</span>
              </button>
              <button
                type="button"
                onClick={loadNonLeafSample}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center gap-1"
                title={t('testNonLeafBtn')}
              >
                <span>🚫 {t('testNonLeafBtn')}</span>
              </button>
            </div>
          </div>

          {/* Drag & Drop File Upload Area */}
          <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-2xl p-6 text-center hover:bg-emerald-50 transition-colors">
            {imagePreview ? (
              <div className="space-y-3">
                <img src={imagePreview} alt="Leaf Preview" className="max-h-56 mx-auto rounded-xl shadow-md border border-emerald-200" />
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setImagePreview(null); setNonLeafError(null); }}
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

          {/* Non-Leaf Rejection Alert Banner */}
          {nonLeafError && (
            <div className="p-4 md:p-5 bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 border-2 border-rose-300 rounded-2xl shadow-sm text-slate-800 space-y-2">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-black text-rose-900">
                      {t('leafValidationError')}
                    </h4>
                    <span className="text-[10px] uppercase font-extrabold bg-rose-200 text-rose-900 px-2 py-0.5 rounded-md">
                      {t('nonLeafDetectedAs')}: {nonLeafError.detectedType}
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      {lang === 'ml' ? 'ക്വാട്ട കുറച്ചിട്ടില്ല ✓' : 'Scan Quota Preserved ✓'}
                    </span>
                  </div>
                  <p className="text-xs text-rose-800 font-bold leading-relaxed">
                    {nonLeafError.message}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    {t('leafValidationDesc')}
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[11px] text-emerald-800 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('retryWithLeaf')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-bold">{error}</div>}

          <button
            type="submit"
            disabled={loading || !selectedFile || !!nonLeafError}
            className={`w-full py-4 font-extrabold rounded-2xl text-sm shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
              nonLeafError
                ? 'bg-rose-600 text-white cursor-not-allowed shadow-rose-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Running Computer Vision & RAG Advisory Engine...</span>
              </>
            ) : nonLeafError ? (
              <>
                <AlertTriangle className="w-5 h-5" />
                <span>
                  {lang === 'ml' 
                    ? 'സാധുവായ ഇലയല്ല (സ്കാൻ ചെയ്യാൻ കഴിയില്ല)' 
                    : 'Non-Leaf Image Detected (Upload a Plant Leaf)'}
                </span>
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
        <div ref={reportRef} className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 space-y-8 animate-fade-in">
          
          {/* Top Bar: Disease Name, Severity Gauge & Voice/PDF Actions */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <span className="text-emerald-700 text-xs font-extrabold uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                Diagnosis Confirmed
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">{result.diseaseName}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                <span>Crop: {result.cropName}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>{deviceLocation.locationName || `${deviceLocation.district}, Kerala`}</span>
                </span>
                <span>•</span>
                <span>Just Now</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleVoiceReadout}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isSpeaking ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSpeaking ? t('stopAudio') : t('readAloud')}</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{downloadingPdf ? 'Generating PDF...' : t('downloadPdf')}</span>
              </button>

              <button
                onClick={handleOpenTelegramModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0088cc] hover:bg-[#0077b5] text-white shadow-sm transition-all"
              >
                <Send className="w-4 h-4 text-white" />
                <span>{lang === 'ml' ? 'ടെലിഗ്രാമിലേക്ക് അയക്കുക' : 'Send to Telegram'}</span>
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

          {/* PMFBY Digital Insurance Claim Direct Link (If Severity > 20%) */}
          {result.severityPercentage > 20 && (
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-700/60 rounded-xl mt-0.5">
                  <Landmark className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
                    PMFBY Crop Loss Insurance Claim Eligible
                  </span>
                  <p className="text-xs text-blue-100 mt-0.5 max-w-xl">
                    {lang === 'ml'
                      ? `ഇലയിലെ രോഗബാധ ${result.severityPercentage}% രേഖപ്പെടുത്തിയതിനാൽ ഈ സ്കാൻ തെളിവായി ഉപയോഗിച്ച് PMFBY നഷ്ടപരിഹാരത്തിന് അപേക്ഷിക്കാം.`
                      : `Lesion severity of ${result.severityPercentage}% meets threshold for PMFBY compensation. Your digital OpenCV verification acts as valid claim evidence.`
                    }
                  </p>
                </div>
              </div>

              <Link
                to="/subsidies"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-blue-500 hover:bg-blue-400 text-slate-950 shadow-md transition-all shrink-0"
              >
                <span>File PMFBY Claim</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

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

            {/* Cross-Sell: Wholesale Input Marketplace Banner */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                  <ShoppingBag className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">
                    Direct Factory Input Marketplace • 15% Platform Fee
                  </span>
                  <h4 className="text-sm font-black text-white mt-0.5">
                    {lang === 'ml' 
                      ? 'ശുപാർശ ചെയ്ത ജൈവ കുമിൾനാശിനികൾ ഫാക്ടറി വിലയിൽ വാങ്ങൂ' 
                      : 'Source Recommended Treatments at Direct Factory Wholesale Rates'}
                  </h4>
                  <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
                    {lang === 'ml'
                      ? 'ട്രൈക്കോഡെർമ വിരിഡെ, ശുദ്ധമായ വേപ്പെണ്ണ എന്നിവ റീട്ടെയിൽ വിലയേക്കാൾ 26% ലാഭത്തിൽ കർഷകർക്കും FPO-കൾക്കും ലഭ്യമാണ്.'
                      : 'Trichoderma viride, cold-pressed neem formulations, and sprayers directly from certified manufacturers at 25%-35% below retail.'}
                  </p>
                </div>
              </div>

              <Link
                to="/marketplace"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md transition-all shrink-0 flex items-center gap-1.5"
              >
                <span>{lang === 'ml' ? 'മാർക്കറ്റിലേക്ക്' : 'Browse Wholesale Market'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      )}

      {/* Quota Exceeded Modal */}
      {quotaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-7 shadow-2xl border border-amber-200 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                {lang === 'ml' ? 'പ്രതിമാസ സൗജന്യ പരിധി കഴിഞ്ഞു!' : 'Monthly Free Scan Limit Reached!'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {lang === 'ml'
                  ? 'ഈ മാസത്തെ 5 സൗജന്യ സ്കാനുകൾ ഉപയോഗിച്ചു കഴിഞ്ഞു. അൺലിമിറ്റഡ് ഇല സ്കാനിംഗിനും 7-ഡേ മണ്ടി പ്രവചനങ്ങൾക്കുമായി കിസാൻ പ്രോ പ്ലാനിലേക്ക് മാറുക.'
                  : 'You have used all 5 complimentary scans for this month. Upgrade to AgriPulse Pro for unlimited computer vision scans, OpenCV severity, and 7-day price forecasts.'}
              </p>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-xs text-emerald-900 text-left space-y-1.5 font-medium">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AgriPulse Pro Perks:</span>
              </div>
              <div>• Unlimited leaf disease scans</div>
              <div>• 7-Day Mandi Price Prediction trends</div>
              <div>• 1-Click official PMFBY Claim PDF</div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setQuotaModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <Link
                to="/pricing"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-md shadow-emerald-600/30 hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <span>Upgrade (₹49/mo)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Telegram Alert Modal */}
      {telegramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden p-6 text-center space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#0088cc] text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                  <Send className="w-5 h-5 -translate-x-0.5 translate-y-0.5" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {lang === 'ml' ? 'ടെലിഗ്രാം അലേർട്ട്' : 'Send to Telegram'}
                  </h3>
                  <a
                    href="https://t.me/Datasqdbot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#0088cc] font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <span>@Datasqdbot</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <button
                onClick={() => setTelegramModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Explainer Box */}
            <div className="p-3.5 bg-sky-50/70 rounded-2xl border border-sky-100 text-left text-xs space-y-1.5 text-slate-700">
              <p className="font-bold text-sky-950">
                {lang === 'ml' ? '📲 നിങ്ങളുടെ ഫോണിൽ തത്സമയ റിപ്പോർട്ട്:' : '📲 Instant Mobile Diagnosis Report:'}
              </p>
              <p className="text-[11px] leading-relaxed text-slate-600">
                {lang === 'ml'
                  ? 'രോഗവിവരണം, നാശനഷ്ട തോത് (Severity %), KAU സർട്ടിഫൈഡ് ജൈവ-രാസ ചികിത്സകൾ എന്നിവ നേരിട്ട് ലഭിക്കും.'
                  : 'Receive disease name, OpenCV damage %, and certified KAU organic & chemical spray advisory direct on Telegram.'}
              </p>
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[10px] bg-sky-200/70 text-sky-900 px-2 py-0.5 rounded font-bold">100% സൗജന്യം</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">തത്സമയ ഡെലിവറി</span>
              </div>
            </div>

            {/* Status / Feedback message */}
            {telegramFeedback && (
              <div className={`p-3 rounded-xl text-xs font-bold text-left ${
                telegramSent ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {telegramFeedback}
              </div>
            )}

            {/* Chat Selection */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-slate-700 block">
                {lang === 'ml' ? 'ടെലിഗ്രാം ചാറ്റ് തിരഞ്ഞെടുക്കുക:' : 'Select Telegram Chat ID:'}
              </label>

              {recentChats.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {recentChats.map((c) => (
                    <label
                      key={c.chatId}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedChatId === c.chatId
                          ? 'border-[#0088cc] bg-sky-50/80 ring-1 ring-[#0088cc]'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="selectedChat"
                          checked={selectedChatId === c.chatId}
                          onChange={() => {
                            setSelectedChatId(c.chatId);
                            setCustomChatId('');
                          }}
                          className="text-[#0088cc] focus:ring-[#0088cc]"
                        />
                        <div>
                          <div className="text-xs font-extrabold text-slate-900">{c.firstName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">Chat ID: {c.chatId}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Active</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {lang === 'ml'
                    ? 'ടെലിഗ്രാമിൽ @Datasqdbot തുറന്ന് /start അയക്കുക.'
                    : 'Please open @Datasqdbot on Telegram and send /start to link your chat.'}
                </div>
              )}

              {/* Custom Chat ID input toggle */}
              <div className="pt-1">
                <input
                  type="text"
                  placeholder={lang === 'ml' ? 'അല്ലെങ്കിൽ മറ്റൊരു Chat ID നൽകുക' : 'Or enter custom Telegram Chat ID'}
                  value={customChatId}
                  onChange={(e) => setCustomChatId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0088cc]"
                />
              </div>
            </div>

            {/* Quick Step Guide */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-[11px] text-slate-600 flex items-center justify-between">
              <span>{lang === 'ml' ? 'ബോട്ട് സ്റ്റാർട്ട് ചെയ്തിട്ടില്ലെങ്കിൽ:' : 'Not started the bot yet?'}</span>
              <a
                href="https://t.me/Datasqdbot"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors inline-flex items-center gap-1"
              >
                <span>Open @Datasqdbot</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTelegramModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {lang === 'ml' ? 'ക്ലോസ്' : 'Close'}
              </button>
              <button
                type="button"
                onClick={handleSendTelegram}
                disabled={sendingTelegram || (!selectedChatId && !customChatId)}
                className="flex-1 py-2.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-black shadow-md shadow-sky-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {sendingTelegram
                    ? (lang === 'ml' ? 'അയക്കുന്നു...' : 'Sending...')
                    : (lang === 'ml' ? 'ഇപ്പോൾ അയക്കുക' : 'Send Now')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
