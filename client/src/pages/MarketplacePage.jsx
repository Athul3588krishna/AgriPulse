import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { BulkOrderModal } from '../components/BulkOrderModal';
import { 
  ShoppingBag, ShieldCheck, Sparkles, Filter, Search, 
  TrendingDown, Check, ArrowRight, Building2, Package, 
  HelpCircle, Star, Info, Percent, Factory
} from 'lucide-react';

export const MarketplacePage = () => {
  const { lang, t } = useLanguage();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalProduct, setActiveModalProduct] = useState(null);
  const [itemQuantities, setItemQuantities] = useState({});

  const [stats, setStats] = useState({
    totalOrders: 32,
    totalGMV: 184500,
    totalCommission: 24065,
    totalSavings: 68400,
    activeFPOs: 22
  });

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = selectedCategory === 'all' 
        ? `/api/marketplace/products` 
        : `/api/marketplace/products?category=${selectedCategory}`;
      const res = await axios.get(url);
      setProducts(res.data);

      // Initialize quantities
      const initQ = {};
      res.data.forEach((p) => {
        initQ[p._id || p.name] = p.minOrderQuantity || 2;
      });
      setItemQuantities(initQ);
    } catch (err) {
      console.error('Error fetching marketplace products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/marketplace/stats');
      setStats(res.data);
    } catch (e) {}
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.nameMl?.includes(searchQuery) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  const handleQtyChange = (prodId, delta, min = 1) => {
    setItemQuantities((prev) => {
      const current = prev[prodId] || min;
      const next = Math.max(min, current + delta);
      return { ...prev, [prodId]: next };
    });
  };

  const categories = [
    { id: 'all', label: t('filterAll') },
    { id: 'bio-fungicides', label: t('filterBio') },
    { id: 'seeds', label: t('filterSeeds') },
    { id: 'fertilizers', label: t('filterFertilizers') },
    { id: 'equipment', label: t('filterEquipment') }
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      
      {/* Hero Header Section */}
      <section className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black tracking-wider uppercase mb-4">
                <Factory className="w-3.5 h-3.5" />
                <span>{lang === 'ml' ? 'ഫാക്ടറി നേരിട്ടുള്ള സംഭരണം' : 'Factory Direct to Farm & FPOs'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-3">
                {t('marketplaceTitle')}
              </h1>
              <p className="text-sm sm:text-base text-emerald-100/90 font-medium leading-relaxed max-w-2xl">
                {t('marketplaceSubtitle')}
              </p>
            </div>

            {/* Interactive Business Formula Card (User's Exact Example) */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20 shadow-2xl max-w-md w-full">
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-amber-400" />
                  {lang === 'ml' ? '15% കമ്മീഷൻ മോഡൽ' : '15% Platform Commission Model'}
                </span>
                <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                  Zero Middlemen
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>{lang === 'ml' ? 'റീട്ടെയിൽ വിപണി വില:' : 'Outside Retail Price:'}</span>
                  <span className="line-through text-red-300 font-bold text-sm">₹2,800</span>
                </div>
                <div className="flex justify-between items-center text-emerald-100">
                  <span>{lang === 'ml' ? 'ഫാക്ടറി മൊത്തവില:' : 'Direct Factory Cost:'}</span>
                  <span className="font-bold">₹1,800</span>
                </div>
                <div className="flex justify-between items-center text-teal-200">
                  <span>{lang === 'ml' ? 'AgriPulse 15% ഫീസ്:' : 'AgriPulse 15% Platform Fee:'}</span>
                  <span className="font-bold">+ ₹270</span>
                </div>
                <div className="pt-2 border-t border-white/20 flex justify-between items-center text-sm font-black text-white">
                  <span>{lang === 'ml' ? 'കർഷകൻ / FPO നൽകുന്നത്:' : 'Final Farmer / FPO Cost:'}</span>
                  <span className="text-emerald-300 text-base font-black">₹2,070</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-dashed border-emerald-400/40 flex items-center justify-between text-xs font-black text-emerald-300">
                <span>{lang === 'ml' ? 'കർഷകന് ലാഭം:' : 'Net Farmer Savings:'}</span>
                <span className="bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 px-2.5 py-1 rounded-xl">
                  ₹730 / bag (26% Off!)
                </span>
              </div>
            </div>
          </div>

          {/* Macro Impact Badges */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
              <span className="text-[10px] text-emerald-300 font-bold uppercase block tracking-wider">
                {lang === 'ml' ? 'കർഷകർക്ക് ലാഭിച്ചത്' : 'Farmer Savings Delivered'}
              </span>
              <span className="text-xl font-black text-white">
                ₹{stats.totalSavings?.toLocaleString()}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
              <span className="text-[10px] text-emerald-300 font-bold uppercase block tracking-wider">
                {lang === 'ml' ? '15% പ്ലാറ്റ്‌ഫോം കമ്മീഷൻ' : '15% Platform Revenue'}
              </span>
              <span className="text-xl font-black text-amber-300">
                ₹{stats.totalCommission?.toLocaleString()}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
              <span className="text-[10px] text-emerald-300 font-bold uppercase block tracking-wider">
                {lang === 'ml' ? 'പങ്കാളികളായ FPO-കൾ' : 'Active FPO Cooperatives'}
              </span>
              <span className="text-xl font-black text-teal-300">
                {stats.activeFPOs}+ FPOs
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
              <span className="text-[10px] text-emerald-300 font-bold uppercase block tracking-wider">
                {lang === 'ml' ? 'ശരാശരി ഡിസ്‌കൗണ്ട്' : 'Average Bulk Discount'}
              </span>
              <span className="text-xl font-black text-emerald-400">
                27% Cheaper
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Filters, Search, & Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        
        {/* Controls Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl border border-emerald-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ml' ? 'ഉൽപ്പന്നങ്ങൾ തിരയുക...' : 'Search wholesale inputs...'}
              className="w-full text-xs font-medium pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-slate-400">
            {lang === 'ml' ? 'ഫാക്ടറി ഉൽപ്പന്നങ്ങൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading verified wholesale materials...'}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-black text-slate-700">No products found</h4>
            <p className="text-xs text-slate-500 mt-1">Try another category or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const prodKey = product._id || product.name;
              const currentQty = itemQuantities[prodKey] || product.minOrderQuantity || 2;
              
              const factoryPrice = product.factoryPrice;
              const outsidePrice = product.outsidePrice;
              const commissionPerUnit = Math.round(factoryPrice * 0.15);
              const finalUnitPrice = factoryPrice + commissionPerUnit;
              const unitSavings = outsidePrice - finalUnitPrice;
              const savingsPercentage = Math.round((unitSavings / outsidePrice) * 100);

              const subtotal = finalUnitPrice * currentQty;
              const totalSavedForBatch = unitSavings * currentQty;

              return (
                <div
                  key={prodKey}
                  className="bg-white rounded-3xl border border-emerald-100 shadow-md hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Popular / Savings Badge */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <span className="bg-emerald-600/95 backdrop-blur-md text-white text-[11px] font-black px-2.5 py-1 rounded-xl shadow-md">
                          Save {savingsPercentage}% (₹{unitSavings})
                        </span>
                        {product.isPopular && (
                          <span className="bg-amber-500 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-xl shadow-md">
                            ★ Top Choice
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-xl">
                        {product.unit}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 space-y-3.5">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {product.manufacturer}
                        </span>
                        <h3 className="text-base font-black text-slate-900 mt-1 leading-snug">
                          {lang === 'ml' ? product.nameMl || product.name : product.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {lang === 'ml' ? product.descriptionMl || product.description : product.description}
                        </p>
                      </div>

                      {/* Transparent Price Breakdown Grid */}
                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-500">
                          <span>{t('outsideMarketPrice')}:</span>
                          <span className="line-through text-red-500 font-bold">₹{outsidePrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-700 font-medium">
                          <span>{t('factoryCost')}:</span>
                          <span>₹{factoryPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-teal-800 font-semibold">
                          <span>{t('platformFee')} (+15%):</span>
                          <span>+ ₹{commissionPerUnit.toLocaleString()}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                          <span>{t('finalPrice')}:</span>
                          <span className="text-emerald-700 text-base">₹{finalUnitPrice.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Quantity Selector on Card */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="text-xs font-bold text-slate-600">
                          {lang === 'ml' ? 'അളവ്:' : 'Quantity:'}
                        </div>
                        <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                          <button
                            onClick={() => handleQtyChange(prodKey, -1, product.minOrderQuantity || 1)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 font-black text-xs text-slate-700"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-xs font-black text-slate-900">
                            {currentQty}
                          </span>
                          <button
                            onClick={() => handleQtyChange(prodKey, 1)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 font-black text-xs text-slate-700"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Live Subtotal & Savings for this Card */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-dashed border-slate-200">
                        <span className="text-slate-500 font-medium">
                          Subtotal ({currentQty} {product.unit}):
                        </span>
                        <span className="font-black text-slate-900">
                          ₹{subtotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => setActiveModalProduct({ ...product, selectedQty: currentQty })}
                      className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-[1.01]"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t('buyBulkBtn')}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                    <div className="text-center mt-2 text-[11px] font-bold text-emerald-700">
                      You save ₹{totalSavedForBatch.toLocaleString()} on this order!
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-over Bulk Order Modal */}
      {activeModalProduct && (
        <BulkOrderModal
          product={activeModalProduct}
          initialQty={activeModalProduct.selectedQty || 2}
          onClose={() => setActiveModalProduct(null)}
          onOrderPlaced={() => {
            fetchStats();
          }}
        />
      )}
    </div>
  );
};
