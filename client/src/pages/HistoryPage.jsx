import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { History, Search, Filter, Calendar, Volume2, ShieldCheck, CheckCircle } from 'lucide-react';

export const HistoryPage = () => {
  const { t, lang, speakText } = useLanguage();
  const [history, setHistory] = useState([]);
  const [filterCrop, setFilterCrop] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    axios.get('/api/diagnoses/history').then((res) => setHistory(res.data)).catch(() => {});
  }, []);

  const filteredHistory = filterCrop === 'All'
    ? history
    : history.filter((h) => h.cropName?.toLowerCase() === filterCrop.toLowerCase());

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('history')}</h1>
          <p className="text-xs text-slate-500">Historical disease diagnoses, severity levels, and RAG advisory logs</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
          >
            <option value="All">All Crops</option>
            <option value="Tomato">Tomato</option>
            <option value="Paddy">Paddy</option>
            <option value="Potato">Potato</option>
            <option value="Corn">Corn</option>
          </select>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center text-xs text-slate-500">
          No diagnosis logs match your selection. Perform a new scan in the Leaf Scanner page.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Crop: {item.cropName}</span>
                    <h3 className="font-extrabold text-slate-900 text-base">{item.diseaseName}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.severityLevel === 'Mild' ? 'bg-amber-100 text-amber-800' :
                    item.severityLevel === 'Moderate' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.severityLevel} ({item.severityPercentage}%)
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p>AI Confidence: <span className="font-bold text-slate-800">{item.confidenceScore}%</span></p>
                  <p>Date: {new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRecord(item)}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors"
              >
                View Complete Advisory
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Advisory Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded">
                  Diagnosis Report Log
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{selectedRecord.diseaseName}</h2>
                <p className="text-xs text-slate-500">Crop: {selectedRecord.cropName} • Severity: {selectedRecord.severityLevel} ({selectedRecord.severityPercentage}%)</p>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            {/* Advisory detail */}
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Recommended Interventions ({lang === 'ml' ? 'മലയാളം' : 'English'})</h4>
              
              <div className="p-4 bg-emerald-50 rounded-xl space-y-2">
                <span className="font-bold text-emerald-900">Organic & Biological Remedies:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  {(selectedRecord.advisory?.[lang === 'ml' ? 'malayalam' : 'english']?.organic || selectedRecord.advisory?.english?.organic || []).map((o, idx) => (
                    <li key={idx}>{o}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl space-y-2">
                <span className="font-bold text-blue-900">Chemical Remedies:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  {(selectedRecord.advisory?.[lang === 'ml' ? 'malayalam' : 'english']?.chemical || selectedRecord.advisory?.english?.chemical || []).map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
