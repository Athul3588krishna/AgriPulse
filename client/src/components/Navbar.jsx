import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Leaf, User, LogOut, Globe, Shield, Activity, MapPin } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              AgriPulse <span className="text-emerald-600 font-extrabold text-sm px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">AI</span>
            </span>
            <span className="block text-[10px] text-slate-500 font-medium tracking-wide uppercase">Precision Advisory Platform</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-slate-700">
          <Link to="/" className="hover:text-emerald-600 transition-colors">{t('home')}</Link>
          {user && (
            <>
              <Link to="/dashboard" className="hover:text-emerald-600 transition-colors">{t('dashboard')}</Link>
              <Link to="/scan" className="hover:text-emerald-600 transition-colors flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <Activity className="w-4 h-4 text-emerald-600" />
                {t('scan')}
              </Link>
              <Link to="/plots" className="hover:text-emerald-600 transition-colors">{t('plots')}</Link>
              <Link to="/history" className="hover:text-emerald-600 transition-colors">{t('history')}</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="hover:text-amber-600 transition-colors flex items-center gap-1 text-amber-700">
                  <Shield className="w-4 h-4 text-amber-600" />
                  {t('admin')}
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Actions & Language Switcher */}
        <div className="flex items-center space-x-3">
          
          {/* Multilingual Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-all"
            title="Switch Language / ഭാഷ മാറ്റുക"
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>{t('langSwitch')}</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-600 hidden sm:inline-block bg-slate-100 px-2.5 py-1 rounded-md">
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={t('logout')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 px-3 py-1.5 transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 rounded-lg shadow-sm transition-all"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
