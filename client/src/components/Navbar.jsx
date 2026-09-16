import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Leaf, User, LogOut, Globe, Shield, Activity, TrendingUp, Landmark, Layers, ShoppingBag, Zap, Star } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              AgriMitra <span className="text-emerald-600 font-extrabold text-xs px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300">360 AI</span>
            </span>
            <span className="block text-[9px] text-slate-400 font-bold tracking-wider uppercase">
              Precision Agronomy • Vipani Mitra • Subsidies
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-5 text-xs font-bold text-slate-700">
          <Link 
            to="/" 
            className={`transition-colors hover:text-emerald-600 ${isActive('/') ? 'text-emerald-600' : ''}`}
          >
            {t('home')}
          </Link>

          <Link 
            to="/mandi" 
            className={`flex items-center gap-1 transition-colors hover:text-emerald-600 ${isActive('/mandi') ? 'text-emerald-600 font-extrabold' : ''}`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            {t('mandi')}
          </Link>

          <Link 
            to="/subsidies" 
            className={`flex items-center gap-1 transition-colors hover:text-blue-600 ${isActive('/subsidies') ? 'text-blue-600 font-extrabold' : ''}`}
          >
            <Landmark className="w-3.5 h-3.5 text-blue-600" />
            {t('subsidies')}
          </Link>

          <Link 
            to="/marketplace" 
            className={`flex items-center gap-1 transition-colors hover:text-teal-600 ${isActive('/marketplace') ? 'text-teal-600 font-extrabold' : ''}`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-teal-600" />
            <span>{t('marketplace')}</span>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-full">
              -26%
            </span>
          </Link>

          <Link 
            to="/pricing" 
            className={`flex items-center gap-1 transition-colors hover:text-amber-600 ${isActive('/pricing') ? 'text-amber-600 font-extrabold' : ''}`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('pricing')}</span>
          </Link>

          {user && (
            <>
              <Link 
                to="/scan" 
                className="flex items-center gap-1 text-emerald-800 font-black bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-sm transition-all"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                {t('scan')}
              </Link>
              <Link 
                to="/dashboard" 
                className={`transition-colors hover:text-emerald-600 ${isActive('/dashboard') ? 'text-emerald-600' : ''}`}
              >
                {t('dashboard')}
              </Link>
              <Link 
                to="/plots" 
                className={`transition-colors hover:text-emerald-600 ${isActive('/plots') ? 'text-emerald-600' : ''}`}
              >
                {t('plots')}
              </Link>
              <Link 
                to="/history" 
                className={`transition-colors hover:text-emerald-600 ${isActive('/history') ? 'text-emerald-600' : ''}`}
              >
                {t('history')}
              </Link>
              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="hover:text-amber-600 transition-colors flex items-center gap-1 text-amber-700"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
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
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all shadow-sm"
            title="Switch Language / ഭാഷ മാറ്റുക"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('langSwitch')}</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700">
                <span>{user.name}</span>
                {(user.subscriptionTier === 'pro' || user.subscriptionTier === 'fpo') ? (
                  <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-slate-950" />
                    PRO
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">({user.role})</span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-xs font-bold text-slate-700 hover:text-emerald-600 px-3 py-1.5 transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
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
