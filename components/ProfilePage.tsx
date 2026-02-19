
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface ProfilePageProps {
  user: User | null;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  const [formData, setFormData] = useState<User>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [hasSelectedKey, setHasSelectedKey] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const result = await window.aistudio.hasSelectedApiKey();
        setHasSelectedKey(result);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    setFormData(user);
    setEmailError(null);
    setIsEditing(false);
  }, [user]);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSave = async () => {
    if (!validateEmail(formData.email)) {
      setEmailError("Please provide a valid email address.");
      return;
    }
    
    setEmailError(null);
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    // Note: Profile updates would be handled via updateProfile() from supabase service
    setIsEditing(false);
    setIsSyncing(false);
  };

  const handleManageKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasSelectedKey(true);
    }
  };

  const copyEnvTemplate = () => {
    const template = `API_KEY=YOUR_GEMINI_API_KEY_HERE\n# Get your key from: https://aistudio.google.com/`;
    navigator.clipboard.writeText(template);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const isAdmin = user.role === 'admin';

  return (
    <div className="py-6 md:py-10 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Intelligence Core Status & VSC Helper */}
      <section className="glass rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-10 border-indigo-500/20 bg-indigo-500/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${hasSelectedKey ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'} animate-pulse`} />
            <span className={`text-[9px] md:text-[10px] font-black ${hasSelectedKey ? 'text-emerald-500' : 'text-rose-500'} uppercase tracking-widest`}>
              {hasSelectedKey ? 'Neural Sync' : 'Link Required'}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-10 relative z-10">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl shrink-0">
            <svg className="h-8 w-8 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="flex-1 space-y-1.5 text-center lg:text-left">
            <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-widest font-display">Neural Uplink Hub</h3>
            <p className="text-[10px] md:text-xs text-slate-400 font-medium max-w-xl">
              Configured via <span className="text-indigo-400 font-bold">Gemini 3 Flash</span>. Paid GCP keys required for high-fidelity market grounding.
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="ml-2 text-indigo-500 hover:underline">Docs</a>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button 
              onClick={copyEnvTemplate}
              className={`flex-1 sm:flex-none px-6 py-3.5 rounded-xl md:rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${copyFeedback ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
            >
              {copyFeedback ? 'Copied!' : 'Copy .env'}
            </button>
            <button 
              onClick={handleManageKey}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl md:rounded-2xl text-[9px] font-black text-white uppercase tracking-widest transition-all text-center shadow-lg shadow-indigo-600/20"
            >
              Reconnect Link
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        <div className="lg:col-span-1 glass rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
          <div className="relative">
            <div className="w-28 h-28 md:w-40 md:h-40 rounded-[2rem] md:rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl relative z-10 bg-slate-900">
              {/* Fixed: renamed avatarUrl to avatar_url */}
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl border-4 border-slate-950 flex items-center justify-center text-white shadow-lg z-20 ${isAdmin ? 'bg-indigo-600' : 'bg-slate-600'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
          </div>
          <div className="space-y-1 relative z-10">
            <h3 className="text-2xl md:text-3xl font-black text-white font-display tracking-tight">{user.name}</h3>
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">{user.role} • {user.company_name || 'E-Place'}</p>
          </div>
        </div>

        <div className="lg:col-span-2 glass rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 space-y-8 md:space-y-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
             <div className="space-y-1 text-center sm:text-left">
               <h4 className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em]">Node Configuration</h4>
               <p className="text-xl md:text-2xl font-black text-white font-display">Identity & Governance</p>
             </div>
             <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={isSyncing}
              className={`w-full sm:w-auto px-8 py-4 btn-primary text-white rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest min-w-[160px] flex items-center justify-center gap-3`}
             >
               {isSyncing && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
               {isEditing ? (isSyncing ? 'Syncing...' : 'Save Changes') : 'Edit Identity'}
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Full Identity Name</label>
               <input 
                type="text" 
                disabled={!isEditing}
                className="w-full px-6 py-4 bg-white text-slate-900 rounded-xl md:rounded-2xl text-xs md:text-sm font-black outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all disabled:opacity-50 shadow-lg"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
               />
            </div>
            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Enterprise Node</label>
               <input 
                type="text" 
                disabled={!isEditing}
                className="w-full px-6 py-4 bg-white text-slate-900 rounded-xl md:rounded-2xl text-xs md:text-sm font-black outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all disabled:opacity-50 shadow-lg"
                value={formData.company_name || ''}
                onChange={e => setFormData({...formData, company_name: e.target.value})}
               />
            </div>
            <div className="space-y-3 md:col-span-2">
               <label className={`text-[10px] font-black uppercase tracking-widest ml-2 transition-colors ${emailError ? 'text-rose-500' : 'text-slate-500'}`}>Email Coordinate</label>
               <input 
                type="email" 
                disabled={!isEditing}
                className={`w-full px-6 py-4 bg-white text-slate-900 rounded-xl md:rounded-2xl text-xs md:text-sm font-black outline-none transition-all disabled:opacity-50 shadow-lg ${emailError ? 'ring-4 ring-rose-500/30 border-rose-500' : 'focus:ring-4 focus:ring-indigo-500/30'}`}
                value={formData.email}
                onChange={e => {
                  setFormData({...formData, email: e.target.value});
                  if (emailError) setEmailError(null);
                }}
               />
               {emailError && (
                 <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest ml-4 mt-2 animate-in slide-in-from-left-2">{emailError}</p>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Team Management - Only shows for admins */}
      {isAdmin && (
        <div className="glass rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 space-y-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-[9px] font-black text-fuchsia-500 uppercase tracking-[0.3em]">Admin Tools</h4>
              <p className="text-xl md:text-2xl font-black text-white font-display">Role Management</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm">Team management functionality coming soon.</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
