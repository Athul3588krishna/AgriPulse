import React from 'react';
import { Leaf, ShieldCheck, Cpu, CloudSun, TrendingUp, Landmark, Mic } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-white font-black text-lg">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <span>AgriMitra 360</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            End-to-End Multimodal AI Platform for Precision Agronomy, Dynamic Market Intelligence, and Autonomous Subsidy Navigation.
          </p>
          <div className="text-[10px] text-emerald-400 font-semibold">
            Aligned with KAU, ICAR, Agmarknet & PMFBY Guidelines
          </div>
        </div>

        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Core AI Pillars</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-emerald-400" /> Pre-Harvest Leaf Diagnostics & Severity</li>
            <li className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Vipani Mitra & 7-Day Forecast</li>
            <li className="flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5 text-emerald-400" /> Autonomous Subsidy & PMFBY Navigator</li>
            <li className="flex items-center gap-1.5"><Mic className="w-3.5 h-3.5 text-emerald-400" /> Omnipresent Vernacular Voice AI</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Languages & Access</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-2">
            Zero-touch voice interaction in native regional languages: <strong>Malayalam (മലയാളം)</strong> and <strong>English</strong>.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Eliminates digital literacy barriers for grassroots farming communities and FPOs.
          </p>
        </div>

        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Technology Stack</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            React 18, Vite, Tailwind CSS, Recharts, Node.js Express, MongoDB, FastAPI, OpenCV, PyTorch & Web Speech API.
          </p>
        </div>

      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        © 2026 AgriMitra 360 Ecosystem. Built for Precision Agriculture and Financial Inclusion.
      </div>
    </footer>
  );
};
