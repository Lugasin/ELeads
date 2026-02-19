
import React, { useState } from 'react';

interface ManualBusinessFormProps {
  onAdd: (data: any) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
}

const ManualBusinessForm: React.FC<ManualBusinessFormProps> = ({ onAdd, onClose, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    industry: 'Logistics',
    country: 'Zambia',
    city: 'Lusaka',
    description: '',
    website: '',
    confidence_score: 100,
  });

  const industries = [
    'Logistics', 'Courier', 'Fintech', 'Retail', 'Mining', 'Manufacturing', 'Agri-business'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="glass w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border-white/10 animate-in zoom-in-95 duration-500">
        <header className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest font-display">Entity Registration</h2>
            <p className="text-[9px] font-bold text-indigo-400 uppercase mt-1 tracking-[0.2em]">Manual Identity Injection</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-rose-500/20 transition-all text-slate-500 hover:text-rose-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Business Name</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Lusaka Express Ltd"
                className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-xs font-bold text-white placeholder:text-slate-600"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Industry Sector</label>
              <select 
                className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-xs font-bold text-white appearance-none cursor-pointer"
                value={formData.industry}
                onChange={e => setFormData({...formData, industry: e.target.value})}
              >
                {industries.map(ind => (
                  <option key={ind} value={ind} className="bg-slate-900 text-white">{ind}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Region / City</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Lusaka Central"
                className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-xs font-bold text-white placeholder:text-slate-600"
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Website / Domain</label>
              <input 
                type="text" 
                placeholder="e.g. lusakaexpress.com"
                className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-xs font-bold text-white placeholder:text-slate-600"
                value={formData.website}
                onChange={e => setFormData({...formData, website: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Entity Description</label>
            <textarea 
              rows={3}
              required
              placeholder="Provide a strategic overview of the entity..."
              className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-xs font-bold text-white placeholder:text-slate-600 resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-4">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Confidence Score Mapping</label>
              <span className="text-xs font-black text-indigo-400">{formData.confidence_score}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500"
              value={formData.confidence_score}
              onChange={e => setFormData({...formData, confidence_score: parseInt(e.target.value)})}
            />
          </div>
        </form>

        <footer className="p-10 pt-4 flex gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="px-8 py-4 glass text-slate-500 font-black uppercase text-[10px] rounded-2xl hover:text-white transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name}
            className="flex-1 py-4 btn-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-all"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              'Inject Entity'
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ManualBusinessForm;
