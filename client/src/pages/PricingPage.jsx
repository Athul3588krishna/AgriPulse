import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { PaymentModal } from '../components/PaymentModal';
import { 
  Check, Sparkles, Zap, Shield, Building2, HelpCircle, 
  ArrowRight, RefreshCw, Layers, CheckCircle2, Star
} from 'lucide-react';

export const PricingPage = () => {
  const { lang, t } = useLanguage();
  const { user, refreshUser } = useAuth();

  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [quotaStatus, setQuotaStatus] = useState(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchQuota();
  }, [user]);

  const fetchQuota = async () => {
    if (!user) return;
    try {
      const res = await axios.get('/api/subscription/status');
      setQuotaStatus(res.data);
    } catch (e) {}
  };

  const handleDemoReset = async (tier = 'free', scans = 0) => {
    setResetting(true);
    try {
      await axios.post('/api/subscription/reset-demo', { setTier: tier, setScans: scans });
      await refreshUser();
      await fetchQuota();
    } catch (e) {
      console.error('Reset error:', e);
    } finally {
      setResetting(false);
    }
  };

  const currentTier = user?.subscriptionTier || 'free';

  const plans = [
    {
      id: 'free',
      name: lang === 'ml' ? 'കിസാൻ ഫ്രീ' : 'Farmer Free',
      badge: lang === 'ml' ? 'സൗജന്യം' : 'Forever Free',
      priceMonthly: 0,
      priceYearly: 0,
      description: lang === 'ml' 
        ? 'ചെറുകിട കർഷകർക്ക് അടിസ്ഥാനപരമായ ആവശ്യങ്ങൾക്ക്.' 
        : 'Essential agronomy tools for smallholder farmers.',
      features: [
        lang === 'ml' ? 'പ്രതിമാസം 5 AI ഇല രോഗനിർണ്ണയ സ്കാനുകൾ' : '5 AI Leaf Disease Scans / month',
        lang === 'ml' ? 'തത്സമയ കേരള മണ്ടി നിരക്കുകൾ' : 'Live Kerala APMC Mandi Rates',
        lang === 'ml' ? 'അടിസ്ഥാന കാലാവസ്ഥയും സ്പ്രേ സുരക്ഷയും' : 'Basic Weather & Spray Safety Radar',
        lang === 'ml' ? '1 കൃഷിയിട പ്ലോട്ട് മാനേജ്മെന്റ്' : '1 Farm Plot Registration',
        lang === 'ml' ? 'മലയാളം & ഇംഗ്ലീഷ് വോയ്‌സ് അസിസ്റ്റന്റ്' : 'Bilingual Malayalam & English Voice Assistant'
      ],
      isPopular: false
    },
    {
      id: 'pro',
      name: lang === 'ml' ? 'കിസാൻ പ്രോ' : 'AgriPulse Pro',
      badge: lang === 'ml' ? 'കർഷകരുടെ പ്രിയപ്പെട്ടത്' : 'Most Popular',
      priceMonthly: 49,
      priceYearly: 399,
      description: lang === 'ml'
        ? 'അൺലിമിറ്റഡ് സ്കാനിംഗും ലാഭം കൂട്ടാനുള്ള AI പ്രവചനങ്ങളും.'
        : 'Unlimited precision diagnostics & predictive market yield.',
      features: [
        lang === 'ml' ? '⚡ അൺലിമിറ്റഡ് AI ഇല സ്കാനുകൾ' : '⚡ Unlimited AI Leaf Disease Scans',
        lang === 'ml' ? '7 ദിവസത്തെ മണ്ടി വില പ്രവചനം (AI Forecast)' : '7-Day Mandi Price Prediction & Volatility Trends',
        lang === 'ml' ? '1-ക്ലിക്ക് ഔദ്യോഗിക PMFBY ഇൻഷുറൻസ് ക്ലെയിം PDF' : '1-Click Official PMFBY Crop Insurance Claim PDF',
        lang === 'ml' ? '10 കൃഷിയിട പ്ലോട്ടുകൾ വരെ സേവ് ചെയ്യാം' : 'Up to 10 Farm Plots Saved',
        lang === 'ml' ? 'WhatsApp & SMS അടിയന്തര കാലാവസ്ഥ മുന്നറിയിപ്പുകൾ' : 'WhatsApp & SMS Critical Weather Alerts',
        lang === 'ml' ? 'വോയ്‌സ് അസിസ്റ്റന്റ് മുൻഗണനാ സപ്പോർട്ട്' : 'Priority Voice Assistant Response Speed'
      ],
      isPopular: true
    },
    {
      id: 'fpo',
      name: lang === 'ml' ? 'FPO എന്റർപ്രൈസ്' : 'FPO & Cooperative',
      badge: lang === 'ml' ? 'കൂട്ടായ്മകൾക്ക്' : 'For Farmer Collectives',
      priceMonthly: 1999,
      priceYearly: 19999,
      description: lang === 'ml'
        ? '100+ കർഷകരുടെ ക്ലസ്റ്റർ മാനേജ്മെന്റും ബൾക്ക് ട്രേഡിംഗും.'
        : 'Enterprise management for 100+ member farmer clusters.',
      features: [
        lang === 'ml' ? '100+ കർഷകരുടെ കേന്ദ്രീകൃത ഡാഷ്‌ബോർഡ്' : '100+ Member Farmers Management Dashboard',
        lang === 'ml' ? 'പ്രാദേശിക രോഗബാധ ഹീറ്റ്മാപ്പ്' : 'Regional Pest & Disease Outbreak Heatmaps',
        lang === 'ml' ? 'മൊത്തവിള ശേഖരണവും നേരിട്ടുള്ള മണ്ടി വിൽപ്പനയും' : 'Bulk Harvest Aggregation & Direct Mandi Routing',
        lang === 'ml' ? 'ഫാക്ടറി ഇൻപുട്ടുകൾ 15% കമ്മീഷനിൽ വാങ്ങാനുള്ള മുൻഗണന' : 'Direct Factory Input Purchasing at 15% Platform Fee',
        lang === 'ml' ? 'കൃഷിഭവൻ ഓഫീസർ & ശാസ്ത്രജ്ഞരുടെ ഡെഡിക്കേറ്റഡ് സപ്പോർട്ട്' : 'Dedicated Agronomist & Krishi Bhavan Support'
      ],
      isPopular: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-emerald-950 via-teal-900 to-slate-900 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black tracking-wider uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'ml' ? 'സുതാര്യമായ നിരക്കുകൾ' : 'Transparent & Affordable Pricing'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">
            {lang === 'ml' 
              ? 'നിങ്ങളുടെ കൃഷിക്ക് അനുയോജ്യമായ പ്ലാൻ തിരഞ്ഞെടുക്കുക' 
              : 'Empower Your Farm with the Right Plan'}
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
            {lang === 'ml'
              ? 'ചെറുകിട കർഷകർക്ക് സൗജന്യമായും, കൂടുതൽ കൃത്യതയ്ക്കും വരുമാന വർദ്ധനവിനും കിസാൻ പ്രോ പ്ലാനും.'
              : 'Accessible to every smallholder farmer for free, with powerful AI predictions for high-yield precision farming.'}
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center bg-white/10 p-1.5 rounded-2xl border border-white/20 backdrop-blur-md">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-white hover:text-emerald-300'
              }`}
            >
              {lang === 'ml' ? 'പ്രതിമാസം' : 'Monthly'}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-white hover:text-emerald-300'
              }`}
            >
              <span>{lang === 'ml' ? 'വാർഷികം' : 'Yearly'}</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                Save 32%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            const isCurrent = currentTier === plan.id;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-7 border flex flex-col justify-between transition-all duration-300 relative ${
                  plan.isPopular
                    ? 'border-emerald-500 shadow-2xl ring-2 ring-emerald-500/30 scale-[1.03] z-10'
                    : 'border-slate-200/80 shadow-lg hover:shadow-xl'
                }`}
              >
                {/* Popular Pill */}
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                    {!plan.isPopular && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Price Section */}
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900">₹{price}</span>
                      <span className="text-xs font-bold text-slate-500">
                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && plan.priceMonthly > 0 && (
                      <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
                        ₹{Math.round(plan.priceYearly / 12)} / month billed annually
                      </span>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 mb-8">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                      {lang === 'ml' ? 'സവിശേഷതകൾ' : "What's Included"}
                    </span>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium leading-snug">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call-To-Action Button */}
                <div>
                  {isCurrent ? (
                    <div className="w-full py-3 rounded-2xl bg-slate-100 text-slate-700 text-xs font-black text-center border border-slate-200 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{lang === 'ml' ? 'ഇപ്പോഴത്തെ പ്ലാൻ' : 'Current Active Plan'}</span>
                    </div>
                  ) : plan.id === 'free' ? (
                    <button
                      onClick={() => handleDemoReset('free', 0)}
                      disabled={resetting}
                      className="w-full py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-black transition-colors"
                    >
                      {lang === 'ml' ? 'സൗജന്യ പ്ലാനിലേക്ക് മാറുക' : 'Switch to Free Tier'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedPlanForCheckout(plan)}
                      className={`w-full py-3.5 rounded-2xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 ${
                        plan.isPopular
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/30 hover:scale-[1.02]'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <span>{lang === 'ml' ? 'ഇപ്പോൾ അപ്‌ഗ്രേഡ് ചെയ്യുക' : `Upgrade to ${plan.name}`}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Presentation Demo Helper Banner */}
        <div className="mt-12 bg-white rounded-3xl p-6 border border-emerald-100 shadow-md max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-600" />
              <span>Demo Presenter Controls</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Current Session: <b>{currentTier.toUpperCase()}</b> • Scans used: <b>{quotaStatus?.monthlyScanCount || 0}/5</b>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDemoReset('free', 5)}
              disabled={resetting}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors"
              title="Set Free Tier and 5 scans to test quota limit 403 response"
            >
              Simulate 5/5 Quota Hit
            </button>
            <button
              onClick={() => handleDemoReset('pro', 0)}
              disabled={resetting}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors"
            >
              Instant Pro
            </button>
            <button
              onClick={() => handleDemoReset('free', 0)}
              disabled={resetting}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Reset to 0/5
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedPlanForCheckout && (
        <PaymentModal
          plan={selectedPlanForCheckout}
          billingCycle={billingCycle}
          onClose={() => setSelectedPlanForCheckout(null)}
          onSuccess={() => {
            fetchQuota();
            setSelectedPlanForCheckout(null);
          }}
        />
      )}
    </div>
  );
};
