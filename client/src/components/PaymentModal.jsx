import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  X, CheckCircle, ShieldCheck, Sparkles, CreditCard, 
  Smartphone, Building, ArrowRight, Lock
} from 'lucide-react';

export const PaymentModal = ({ plan, billingCycle = 'monthly', onClose, onSuccess }) => {
  const { lang } = useLanguage();
  const { user, updateUserSubscription } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay / PhonePe)');
  const [processing, setProcessing] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');

  const amount = plan.id === 'pro' 
    ? (billingCycle === 'yearly' ? 399 : 49)
    : (billingCycle === 'yearly' ? 19999 : 1999);

  const handleSimulatePayment = async () => {
    if (!user) {
      setError(lang === 'ml' ? 'ദയവായി ലോഗിൻ ചെയ്യുക.' : 'Please log in to upgrade your subscription plan.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Simulate realistic payment gateway processing delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const payload = {
        planId: plan.id,
        billingCycle,
        paymentMethod,
        transactionId: `TXN_DEMO_${Date.now()}`
      };

      const res = await axios.post('/api/subscription/verify-payment', payload);
      
      if (res.data.success) {
        updateUserSubscription({
          subscriptionTier: res.data.user.subscriptionTier,
          subscriptionExpiresAt: res.data.user.subscriptionExpiresAt,
          monthlyScanCount: 0
        });
        setSuccessData(res.data);
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message;
      if (err.response?.status === 401 || (errMsg && errMsg.toLowerCase().includes('token'))) {
        setError(lang === 'ml' ? 'ദയവായി ലോഗിൻ ചെയ്യുക.' : 'Please log in to upgrade your subscription plan.');
      } else {
        setError(errMsg || 'Payment simulation failed. Please try again.');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Lock className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                {lang === 'ml' ? 'സുരക്ഷിത പേയ്‌മെന്റ് ഗേറ്റ്‌വേ' : 'Secure Demo Checkout'}
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-400 text-slate-900">
                  Sandbox
                </span>
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                AgriPulse {plan.name} ({billingCycle === 'yearly' ? 'Annual Plan' : 'Monthly Plan'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!user ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black text-slate-900">
                {lang === 'ml' ? 'ദയവായി ലോഗിൻ ചെയ്യുക' : 'Please Log In to Upgrade'}
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {lang === 'ml'
                  ? 'നിങ്ങളുടെ അക്കൗണ്ടിലേക്ക് സബ്‌സ്‌ക്രിപ്ഷൻ പ്ലാൻ ആക്റ്റിവേറ്റ് ചെയ്യാൻ ആദ്യം ലോഗിൻ ചെയ്യേണ്ടതുണ്ട്.'
                  : 'You need an active farmer account to subscribe to AgriPulse Pro or Enterprise plans.'}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {lang === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/login', {
                    state: {
                      from: '/pricing',
                      message: lang === 'ml'
                        ? 'സബ്‌സ്‌ക്രിപ്ഷൻ പ്ലാൻ അപ്‌ഗ്രേഡ് ചെയ്യാൻ ദയവായി ലോഗിൻ ചെയ്യുക.'
                        : 'Please log in to upgrade your subscription plan.'
                    }
                  });
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                <span>{lang === 'ml' ? 'ലോഗിൻ ചെയ്യുക' : 'Log In Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : !successData ? (
          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                {error}
              </div>
            )}

            {/* Order Summary Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-600">
                <span>Selected Plan:</span>
                <span className="font-bold text-slate-900">{plan.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Billing Cycle:</span>
                <span className="capitalize font-medium">{billingCycle}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>GST / Taxes:</span>
                <span className="text-emerald-700 font-bold">₹0 (Zero Agritech Levy)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total Payable:</span>
                <span className="text-emerald-700 text-lg font-black">₹{amount.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                {lang === 'ml' ? 'പേയ്‌മെന്റ് രീതി തിരഞ്ഞെടുക്കുക' : 'Select Payment Method'}
              </label>
              <div className="space-y-2 text-xs font-bold">
                {[
                  { id: 'UPI (Google Pay / PhonePe)', icon: Smartphone, label: 'Instant UPI (GPay / PhonePe / Paytm)' },
                  { id: 'Debit / Credit Card', icon: CreditCard, label: 'Debit / Credit Card (Visa, RuPay, MasterCard)' },
                  { id: 'NetBanking (Kisan / SBI)', icon: Building, label: 'NetBanking (State Bank of India, Canara, Kerala Bank)' }
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                        paymentMethod === m.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        paymentMethod === m.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Simulated 256-bit encrypted sandbox checkout for instant evaluation.</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulatePayment}
                disabled={processing}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-md shadow-emerald-600/30 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <>Simulating Payment...</>
                ) : (
                  <>
                    <span>Pay ₹{amount.toLocaleString()} & Activate</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Payment Success Celebration */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-900 mb-1">
                {lang === 'ml' ? 'അംഗത്വം വിജയകരമായി ആക്റ്റിവേറ്റ് ചെയ്തു!' : 'Subscription Activated!'}
              </h4>
              <p className="text-xs text-slate-500">
                {successData.message}
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono font-bold text-slate-800">{successData.paymentDetails?.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tier:</span>
                <span className="font-bold text-emerald-700 uppercase">{successData.user?.subscriptionTier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scan Quota:</span>
                <span className="font-bold text-emerald-700">Unlimited Access (⚡)</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
            >
              Start Using Pro Features
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
