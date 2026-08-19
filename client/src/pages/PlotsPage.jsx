import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { Leaf, Plus, Trash2, MapPin, Calendar, Layers } from 'lucide-react';

export const PlotsPage = () => {
  const { t } = useLanguage();
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    cropType: 'Tomato',
    areaAcres: 1.5,
    soilType: 'Loamy',
    city: 'Kochi'
  });

  const fetchPlots = async () => {
    try {
      const res = await axios.get('/api/plots');
      setPlots(res.data);
    } catch (e) {
      console.log('Plots fetch notice:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlots();
  }, []);

  const handleAddPlot = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/plots', {
        name: formData.name,
        cropType: formData.cropType,
        areaAcres: Number(formData.areaAcres),
        soilType: formData.soilType,
        location: { city: formData.city, latitude: 9.9312, longitude: 76.2673 }
      });
      setFormData({ name: '', cropType: 'Tomato', areaAcres: 1.5, soilType: 'Loamy', city: 'Kochi' });
      fetchPlots();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding plot');
    }
  };

  const handleDeletePlot = async (id) => {
    if (!window.confirm('Delete this plot?')) return;
    try {
      await axios.delete(`/api/plots/${id}`);
      fetchPlots();
    } catch (e) {
      alert('Error deleting plot');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('plots')}</h1>
          <p className="text-xs text-slate-500">Record and monitor individual farm plots and crops</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Plot Creation Form */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600" />
            Add New Farm Plot
          </h3>

          <form onSubmit={handleAddPlot} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Plot Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. North Field Plot A"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Crop Type</label>
              <select
                value={formData.cropType}
                onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              >
                <option value="Tomato">Tomato (തക്കാളി)</option>
                <option value="Paddy">Paddy / Rice (നെല്ല്)</option>
                <option value="Potato">Potato (ഉരുളക്കിഴങ്ങ്)</option>
                <option value="Corn">Corn (ചോളം)</option>
                <option value="Chilli">Chilli (മുളക്)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.areaAcres}
                  onChange={(e) => setFormData({ ...formData, areaAcres: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Soil Type</label>
                <input
                  type="text"
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Location / District</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
            >
              Save Plot
            </button>
          </form>
        </div>

        {/* Existing Plots List */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Your Active Plots ({plots.length})</h3>
          
          {plots.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
              No farm plots registered yet. Use the form on the left to add your first plot.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plots.map((p) => (
                <div key={p._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                      <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {p.cropType}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeletePlot(p._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{p.areaAcres} Acres</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{p.location?.city || 'Kochi'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
