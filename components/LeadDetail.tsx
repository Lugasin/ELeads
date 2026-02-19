
import React, { useState } from 'react';
import { Lead, LeadStatus, ROLE_PERMISSIONS, UserRole, SignalType } from '../types';
import { generateOutreachBundle, qualifyLeadAI, generateStrategicBrief } from '../services/geminiService';

interface LeadDetailProps {
  lead: Lead;
  onClose: () => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  userRole?: UserRole;
  onUpgrade?: () => void;
}

const LeadDetail: React.FC<LeadDetailProps> = ({ lead, onClose, onUpdateStatus, userRole = 'free', onUpgrade }) => {
  const [outreach, setOutreach] = useState<{ email: string; sms: string } | null>(null);
  const [strategicBrief, setStrategicBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [qualifying, setQualifying] = useState(false);
  const [briefLoading, setBriefLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [isPhoneDecrypted, setIsPhoneDecrypted] = useState(false);
  const [copied, setCopied] = useState<'email' | 'sms' | null>(null);

  const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.free;

  const handleGenerateOutreach = async () => {
    if (!permissions.canGenerateOutreach) {
      if (onUpgrade) onUpgrade();
      return;
    }
    setLoading(true);
    setLocalError(null);
    try {
      const bundle = await generateOutreachBundle(lead);
      setOutreach(bundle);
    } catch (err: any) {
      setLocalError(err.message || "Outreach intelligence unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchBrief = async () => {
    if (!permissions.canAccessBriefs) {
      if (onUpgrade) onUpgrade();
      return;
    }
    setBriefLoading(true);
    try {
      const brief = await generateStrategicBrief(lead);
      setStrategicBrief(brief);
    } catch (e) {
      setLocalError("Strategic brief uplink failure.");
    } finally {
      setBriefLoading(false);
    }
  };

  const handleAIQualify = async () => {
    setQualifying(true);
    setLocalError(null);
    try {
      const result = await qualifyLeadAI(lead);
      onUpdateStatus(lead.id, result.status);
    } catch (err: any) {
      setLocalError(err.message || "Qualification analysis failed.");
    } finally {
      setQualifying(false);
    }
  };

  const handleDecryptPhone = () => {
    if (permissions.canDecryptPhone) {
      setIsPhoneDecrypted(true);
    } else if (onUpgrade) {
      onUpgrade();
    }
  };

  const handleCopy = (text: string, type: 'email' | 'sms') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const getSignalColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'communication_gap': return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      case 'expansion': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'hiring': return 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5';
      default: return 'text-slate-400 border-white/5 bg-white/5';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center z-[100] p-0 md:p-4 lg:p-10">
      <div className="glass w-full h-full md:h-auto md:max-h-[92vh] md:max-w-6xl md:rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border-none md:border md:border-white/10 flex flex-col md:flex-row">

        {/* Sidebar / Top Summary */}
        <div className="w-full md:w-72 lg:w-80 bg-white/5 border-b md:border-b-0 md:border-r border-white/5 p-6 md:p-10 flex flex-col items-center overflow-y-auto flex-shrink-0">
          <div className="flex w-full justify-between items-center md:hidden mb-6">
            <button onClick={onClose} className="p-3 bg-white/10 rounded-2xl border border-white/5 active:scale-90 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Entity Intel</span>
            <div className="w-11" />
          </div>

          <div className="w-20 h-20 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-2xl md:rounded-[2.5rem] bg-white p-4 md:p-6 flex items-center justify-center shadow-xl mb-6 relative group">
            {!logoError && lead.logoUrl ? (
              <img src={lead.logoUrl} alt={lead.name} className="w-full h-full object-contain transition-transform group-hover:scale-105" onError={() => setLogoError(true)} />
            ) : (
              <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-white text-2xl font-black">{lead.name.charAt(0)}</div>
            )}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xl border-2 border-slate-950">
              {lead.name.charAt(0)}
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mb-2 font-display">{lead.name}</h3>
            <div className="flex flex-col gap-2 items-center">
              <span className="text-[8px] md:text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 uppercase tracking-widest">{lead.industry || 'Strategic Node'}</span>
              <span className={`text-[7px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${userRole === 'enterprise' ? 'bg-fuchsia-500 text-white' : userRole === 'pro' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {userRole} view
              </span>
            </div>
          </div>

          <div className="w-full space-y-5 pt-5 border-t border-white/5 text-left md:text-center lg:text-left">
            <div className="flex flex-col gap-1">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Entity Identity</p>
              <p className="text-sm font-black text-white">{lead.contacts?.[0]?.full_name || 'N/A'}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{lead.contacts?.[0]?.role || 'N/A'}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Market Coordinates</p>
              <p className="text-[9px] font-black text-white uppercase tracking-widest">{lead.city}, {lead.country}</p>
            </div>
          </div>

          <button onClick={handleAIQualify} disabled={qualifying} className="w-full mt-6 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all flex items-center justify-center gap-2 active:scale-95">
            {qualifying && <div className="w-3 h-3 border-2 border-white/20 border-t-white animate-spin rounded-full" />}
            Re-Audit Matrix
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/40">
          <header className="hidden md:flex p-8 border-b border-white/5 justify-between items-center bg-white/2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Engagement Intelligence Vectors</h4>
            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-rose-500/20 rounded-2xl border border-white/5 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 group-hover:text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </header>

          <div className="p-5 md:p-10 space-y-8 md:space-y-12 overflow-y-auto">
            {localError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] font-black text-rose-500 uppercase tracking-widest">
                {localError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="p-5 md:p-6 glass rounded-2xl md:rounded-[2rem] border-white/5 bg-white/2">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Entity Identity</p>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7l3-7z"/></svg>
                  </div>
                  <span className="text-xs font-bold text-white truncate">{lead.name}</span>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">{lead.industry || 'Strategic Node'}</p>
                <p className="text-[8px] text-slate-500 mt-1">Contact details are hidden for compliance.</p>
              </div>

              <div className="p-5 md:p-6 glass rounded-2xl md:rounded-[2rem] border-amber-500/20 bg-amber-500/5">
                <p className="text-[8px] font-black text-amber-500/60 uppercase tracking-widest mb-2">Market Coordinates</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black tracking-widest`}>{lead.city || 'N/A'}, {lead.country || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Strategic Intel Matrix - Refactored for Signals */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h5 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Engagement Activity Matrix</h5>
                </div>
                {permissions.canAccessBriefs && !strategicBrief && (
                  <button onClick={handleFetchBrief} disabled={briefLoading} className="px-4 py-2 bg-fuchsia-600/10 border border-fuchsia-500/30 text-fuchsia-400 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-fuchsia-600 hover:text-white transition-all">
                    {briefLoading ? 'Syncing...' : 'Deep Brief'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Executive Summary */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="p-6 md:p-8 glass rounded-[2rem] text-white relative border-white/10 bg-indigo-950/20 h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Executive AI Insight</p>
                    </div>
                    <p className="text-sm md:text-base font-medium leading-relaxed text-slate-200">{lead.notes || "No executive summary currently generated for this node."}</p>

                    {strategicBrief && (
                      <div className="mt-6 pt-6 border-t border-white/5 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse shadow-[0_0_8px_#d946ef]" />
                          <span className="text-[8px] font-black text-fuchsia-400 uppercase tracking-[0.2em]">Strategic Penetration Brief</span>
                        </div>
                        <p className="text-[11px] italic text-slate-400 leading-relaxed bg-white/2 p-4 rounded-xl border border-white/5">
                          {strategicBrief}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Signals Timeline */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="relative pl-6 space-y-6">
                    {/* Timeline Vertical Line */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-white/5" />

                    {lead.signals && lead.signals.length > 0 ? lead.signals.map((signal, idx) => (
                      <div key={idx} className="relative animate-in slide-in-from-left-4" style={{ animationDelay: `${idx * 150}ms` }}>
                        <div className={`absolute left-[-24px] top-1.5 w-4 h-4 rounded-full border-2 border-slate-950 shadow-xl ${signal.type === 'communication_gap' ? 'bg-amber-500 shadow-amber-500/20' :
                          (signal.signal_type || signal.type) === 'expansion' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-indigo-500 shadow-indigo-500/20'
                          }`} />

                        <div className={`p-5 rounded-2xl border transition-all hover:scale-[1.02] cursor-default group ${getSignalColor(signal.signal_type || signal.type)}`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              {(signal.signal_type || signal.type || '').replace('_', ' ')}
                            </span>
                            <span className="text-[8px] font-bold opacity-50 uppercase">{new Date(signal.observed_at || signal.timestamp || signal.detected_at || Date.now()).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs font-bold leading-relaxed">{signal.description}</p>
                          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Source: {signal.source_excerpt || signal.source || signal.source_url || 'N/A'}</span>
                            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Confidence: {signal.confidence_level || signal.confidence || 'unknown'}</span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="py-10 text-center glass rounded-3xl border-dashed border-white/10">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No active market signals recorded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Outreach Section */}
            <div className="space-y-6 pb-10">
              <div className="flex items-center justify-between border-t border-white/5 pt-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <h5 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Engagement Protocols</h5>
                </div>
                {!outreach && (
                  <button
                    onClick={handleGenerateOutreach}
                    disabled={loading}
                    className={`px-5 py-3 text-white rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all ${permissions.canGenerateOutreach ? 'btn-primary shadow-indigo-600/20 hover:scale-105' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                  >
                    {loading && <div className="w-2.5 h-2.5 border-2 border-white/20 border-t-white animate-spin rounded-full" />}
                    {permissions.canGenerateOutreach ? 'Generate outreach bundle' : 'Engagement Vectors Locked'}
                  </button>
                )}
              </div>

              {outreach ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Email Blueprint</p>
                      <button onClick={() => handleCopy(outreach.email, 'email')} className="text-[7px] font-black text-indigo-400 uppercase hover:text-white transition-all">
                        {copied === 'email' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="p-5 glass rounded-[1.5rem] border-white/5 bg-slate-900/40 font-mono text-[10px] text-slate-300 leading-relaxed min-h-[140px] whitespace-pre-wrap">
                      {outreach.email}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">SMS Cluster</p>
                      <button onClick={() => handleCopy(outreach.sms, 'sms')} className="text-[7px] font-black text-indigo-400 uppercase hover:text-white transition-all">
                        {copied === 'sms' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="p-5 glass rounded-[1.5rem] border-white/5 bg-slate-900/40 font-mono text-[10px] text-slate-300 leading-relaxed min-h-[140px] flex items-center justify-center text-center">
                      {outreach.sms}
                    </div>
                  </div>
                </div>
              ) : !loading && (
                <div className="py-14 border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-700">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest">Awaiting engagement blueprint generation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
