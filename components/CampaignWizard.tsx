
import React, { useState } from 'react';
import { LeadSource, DEFAULT_SOURCES } from '../types';

interface CampaignWizardProps {
  onStart: (platform: LeadSource, keywords: string, region: string) => void;
  onClose: () => void;
  isScraping: boolean;
}

const CampaignWizard: React.FC<CampaignWizardProps> = ({ onStart, onClose, isScraping }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    industry: '',
    region: 'Lusaka Central',
    sources: [DEFAULT_SOURCES.LINKEDIN, DEFAULT_SOURCES.WEB],
  });

  const handleStart = () => {
    // Strategic Auto-Close: Dismiss wizard instantly to reveal the progress bar underneath
    onStart(formData.sources[0], `${formData.title} in ${formData.industry}`, formData.region);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-2xl">
      <div className="glass w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest font-display">Intelligence Scouter</h2>
            <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Phase {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-rose-500/20 transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <div className="p-10 min-h-[350px]">
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Target Persona</label>
                <input type="text" placeholder="e.g. Operations Manager" className="w-full px-6 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl outline-none shadow-xl" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Vertical Focus</label>
                <input type="text" placeholder="e.g. Logistics & Courier" className="w-full px-6 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl outline-none shadow-xl" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 text-center">
              <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-4">Territorial Coordinate</label>
              <select className="w-full px-6 py-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest appearance-none text-center shadow-xl" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})}>
                <option>Lusaka Central Cluster</option>
                <option>Copperbelt Industrial Node</option>
                <option>Southern Region Hub</option>
              </select>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 text-center">
              <div className="p-10 glass rounded-[2.5rem] bg-indigo-500/5 space-y-4">
                 <p className="text-[10px] font-black text-indigo-500 uppercase">Strategic Acquisition Cost</p>
                 <p className="text-4xl font-black text-slate-900 dark:text-white">450 <span className="text-sm opacity-50 font-medium tracking-normal">Node Credits</span></p>
                 <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">+3,200 Potential Targets</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-10 pt-0 flex gap-4">
          {step > 1 && <button onClick={() => setStep(step - 1)} className="px-8 py-4 glass text-slate-500 font-black uppercase text-[10px] rounded-2xl">Back</button>}
          <button onClick={() => step < 3 ? setStep(step + 1) : handleStart()} className="flex-1 py-4 btn-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
            {step < 3 ? 'Confirm Strategy' : 'Initiate Scan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignWizard;
