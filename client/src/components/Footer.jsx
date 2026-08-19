import React from 'react';
import { Leaf, ShieldCheck, Cpu, CloudSun } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div>
          <div className="flex items-center space-x-2 text-white font-bold text-lg mb-3">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <span>AgriPulse AI</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            AI-Powered Precision Agriculture and Crop Disease Advisory System.
          </p>
        </div>

        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Core Modules</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-emerald-400" /> EfficientNet Disease AI</li>
            <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> OpenCV Severity Calculation</li>
            <li className="flex items-center gap-1.5"><CloudSun className="w-3.5 h-3.5 text-emerald-400" /> Open-Meteo Weather RAG</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Supported Languages</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            English & Malayalam (മലയാളം) full text advisory with browser Text-to-Speech audio reader.
          </p>
        </div>

        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Tech Stack</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            React.js, Tailwind CSS, Node.js Express, FastAPI, PyTorch, MongoDB & RAG Vector Engine.
          </p>
        </div>

      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        © 2026 AgriPulse AI. All rights reserved.
      </div>
    </footer>
  );
};
