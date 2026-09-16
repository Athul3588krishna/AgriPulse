import React, { useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  X, CheckCircle, ShoppingBag, ShieldCheck, Building2, 
  User, Phone, MapPin, Truck, ArrowRight, Sparkles, Receipt, Download
} from 'lucide-react';

export const BulkOrderModal = ({ product, initialQty = 2, onClose, onOrderPlaced }) => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(initialQty || product.minOrderQuantity || 2);
  const [buyerType, setBuyerType] = useState('farmer'); // 'farmer' | 'fpo'
  const [fpoName, setFpoName] = useState('');
  const [buyerName, setBuyerName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+91 94471 23456');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.location || 'Krishi Bhavan Cluster Depot, Palakkad');
  const [district, setDistrict] = useState('Palakkad');
  const [paymentMethod, setPaymentMethod] = useState('UPI (Demo)');

  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [error, setError] = useState('');

  // 15% Platform Commission formula
  const factoryPrice = product.factoryPrice;
  const outsidePrice = product.outsidePrice;
  const commissionPerUnit = Math.round(factoryPrice * 0.15); // Exactly 15%
  const finalUnitPrice = factoryPrice + commissionPerUnit;
  const savingsPerUnit = outsidePrice - finalUnitPrice;

  const totalFactoryCost = factoryPrice * quantity;
  const totalCommission = commissionPerUnit * quantity;
  const totalPayable = finalUnitPrice * quantity;
  const totalOutside = outsidePrice * quantity;
  const totalSavings = totalOutside - totalPayable;
  const savingsPercent = Math.round((totalSavings / totalOutside) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!buyerName.trim() || !phone.trim() || !deliveryAddress.trim()) {
      setError('Please fill in all required contact and delivery details.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        buyerType,
        fpoName: buyerType === 'fpo' ? fpoName : '',
        buyerName,
        phone,
        deliveryAddress,
        district,
        paymentMethod,
        items: [
          {
            productId: product._id,
            name: product.name,
            quantity
          }
        ]
      };

      const res = await axios.post('/api/marketplace/order', payload);
      setCompletedOrder(res.data);
      if (onOrderPlaced) onOrderPlaced(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit bulk order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShoppingBag className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                {lang === 'ml' ? 'ബൾക്ക് ഫാക്ടറി ഓർഡർ' : 'Factory Direct Bulk Order'}
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-900">
                  15% Fee Model
                </span>
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                {lang === 'ml' ? product.nameMl || product.name : product.name}
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

        {/* Content Body */}
        {!completedOrder ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                {error}
              </div>
            )}

            {/* Buyer Type Toggle (Farmer vs FPO) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                {lang === 'ml' ? 'ഓർഡർ വിഭാഗം തിരഞ്ഞെടുക്കുക' : 'Select Buyer Category'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBuyerType('farmer')}
                  className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl border text-xs font-black transition-all ${
                    buyerType === 'farmer'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>{t('buyerTypeFarmer')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBuyerType('fpo')}
                  className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl border text-xs font-black transition-all ${
                    buyerType === 'fpo'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>{t('buyerTypeFpo')}</span>
                </button>
              </div>
            </div>

            {buyerType === 'fpo' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'ml' ? 'FPO / സഹകരണ സംഘത്തിന്റെ പേര്' : 'FPO / Cooperative Society Name'}
                </label>
                <input
                  type="text"
                  value={fpoName}
                  onChange={(e) => setFpoName(e.target.value)}
                  placeholder="e.g. Palakkad Organic Paddy Producers Co-operative"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required={buyerType === 'fpo'}
                />
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {lang === 'ml' ? 'ആവശ്യമായ അളവ് (ബൾക്ക്)' : 'Order Quantity (Bulk Units)'}
                </label>
                <span className="text-xs font-bold text-slate-500">
                  {product.unit} (Min: {product.minOrderQuantity})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-300 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(product.minOrderQuantity || 1, quantity - 1))}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={product.minOrderQuantity || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center font-black text-sm text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Quick FPO batch presets */}
                <div className="flex items-center gap-1.5">
                  {[5, 10, 25, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setQuantity(preset)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                        quantity === preset
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      {preset} units
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Transparent Financial Arbitrage Card (User's Exact Model) */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white rounded-2xl p-4 border border-emerald-200/80 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {lang === 'ml' ? 'വില വിവരണം (സുതാര്യം)' : 'Cost Breakdown (Transparent Model)'}
                </span>
                <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  {savingsPercent}% Cheaper than Market
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>{t('outsideMarketPrice')} ({quantity} × ₹{outsidePrice.toLocaleString()}):</span>
                  <span className="line-through text-red-500 font-bold">₹{totalOutside.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>{t('factoryCost')} ({quantity} × ₹{factoryPrice.toLocaleString()}):</span>
                  <span>₹{totalFactoryCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-teal-800 font-semibold">
                  <span className="flex items-center gap-1">
                    {t('platformFee')} (+15%):
                    <span className="text-[10px] text-teal-600 bg-teal-100/80 px-1.5 rounded">Facilitation</span>
                  </span>
                  <span>+ ₹{totalCommission.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex justify-between items-center text-sm font-black text-slate-900">
                  <span>{t('finalPrice')} ({quantity} units):</span>
                  <span className="text-emerald-700 text-base">₹{totalPayable.toLocaleString()}</span>
                </div>
              </div>

              {/* Total Community Savings Badge */}
              <div className="mt-2 pt-2 border-t border-dashed border-emerald-200 flex items-center justify-between text-xs font-black text-emerald-800">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  {t('youSave')}:
                </span>
                <span className="text-emerald-700 text-sm bg-white px-3 py-1 rounded-xl border border-emerald-300 shadow-sm">
                  ₹{totalSavings.toLocaleString()} Saved!
                </span>
              </div>
            </div>

            {/* Delivery & Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'ml' ? 'കർഷകന്റെ / പ്രതിനിധിയുടെ പേര്' : 'Contact Person / Farmer Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Suresh Kumar"
                    className="w-full text-xs font-medium pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'ml' ? 'ഫോൺ നമ്പർ' : 'Mobile Number'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 94471 23456"
                    className="w-full text-xs font-medium pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'ml' ? 'ഡെലിവറി വിലാസം / കൃഷിഭവൻ ഡിപ്പോ' : 'Delivery Address / Krishi Bhavan Depot'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. Kudumbashree Agritech Center, Alathur, Palakkad"
                    className="w-full text-xs font-medium pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                {lang === 'ml' ? 'പേയ്‌മെന്റ് രീതി' : 'Payment Method'}
              </label>
              <div className="grid grid-cols-3 gap-2.5 text-xs font-bold">
                {['UPI (Demo)', 'Bank Transfer / NEFT', 'Pay on Delivery'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      paymentMethod === m
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>Processing Order...</>
                ) : (
                  <>
                    <span>Confirm Bulk Order (₹{totalPayable.toLocaleString()})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Order Placed Celebration & Receipt View */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-900 mb-1">
                {t('orderConfirmationTitle')}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {t('orderConfirmationDesc')}
              </p>
            </div>

            {/* Invoice Breakdown Card */}
            <div className="max-w-md mx-auto bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Order Reference:</span>
                <span className="font-mono font-bold text-slate-800">{completedOrder.order?.orderId}</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Product:</span>
                  <span className="font-bold text-slate-900">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span className="font-bold">{quantity} {product.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Manufacturer Wholesale Cost:</span>
                  <span className="font-medium">₹{totalFactoryCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-teal-700 font-semibold">
                  <span>AgriPulse Facilitation Fee (15%):</span>
                  <span>₹{totalCommission.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-sm text-slate-900">
                  <span>Total Paid (Farmer / FPO):</span>
                  <span className="text-emerald-700">₹{totalPayable.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-emerald-300 bg-emerald-50/70 -mx-5 -mb-5 p-3 rounded-b-2xl flex justify-between items-center text-xs font-bold text-emerald-800">
                <span>Total Community Savings:</span>
                <span className="font-black text-sm text-emerald-700">₹{totalSavings.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Print / Save Invoice
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
