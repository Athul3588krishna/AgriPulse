import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Leaf, Lock, Mail, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-md">
            <Leaf className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('login')} to AgriPulse AI</h2>
          <p className="text-xs text-slate-500">Access your farm plots, leaf scanner & advisory history</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@example.com"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Logging in...' : t('login')}
          </button>
        </form>

        {/* Hackathon 1-Click Quick Demo Login */}
        <div className="pt-2">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ⚡ Hackathon 1-Click Demo
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mt-1">
            <button
              type="button"
              onClick={async () => {
                setEmail('farmer@agripulse.in');
                setPassword('farmer123');
                setLoading(true);
                try {
                  await login('farmer@agripulse.in', 'farmer123');
                  navigate('/dashboard');
                } catch (err) {
                  setError('Demo login notice: proceed to dashboard');
                  navigate('/dashboard');
                } finally {
                  setLoading(false);
                }
              }}
              className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>🌱 Demo Farmer</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                setEmail('admin@agripulse.in');
                setPassword('admin123');
                setLoading(true);
                try {
                  await login('admin@agripulse.in', 'admin123');
                  navigate('/admin');
                } catch (err) {
                  setError('Demo login notice: proceed to admin');
                  navigate('/admin');
                } finally {
                  setLoading(false);
                }
              }}
              className="py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>🛡️ Demo Admin</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:underline">
            {t('register')}
          </Link>
        </div>

      </div>
    </div>
  );
};
