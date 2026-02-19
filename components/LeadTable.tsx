/**
 * @deprecated This component is part of the legacy lead-based architecture.
 * Use SignalTable instead for signals-only architecture.
 * To be removed in v2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Lead, LeadStatus } from '../types';

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  isProcessing?: boolean;
  onUpgrade?: () => void;
}

const ITEMS_PER_PAGE = 10;

const LeadTable: React.FC<LeadTableProps> = ({ leads, onSelectLead, isProcessing, onUpgrade }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(leads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLeads = leads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageError = (id: string) => {
    setImgError(prev => ({ ...prev, [id]: true }));
  };

  const handleQuickEmail = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    window.location.href = `mailto:${email}`;
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
    setIsExportOpen(false);
  };

  const exportCSV = (data: Lead[], suffix: string) => {
    const headers = ['Company', 'Name', 'Title', 'Email', 'Location', 'Score', 'Status', 'Industry'];
    const rows = data.map(l => [
      `"${l.name}"`,
      `"${l.contacts?.[0]?.full_name || ''}"`,
      `"${l.contacts?.[0]?.role || ''}"`,
      l.contacts?.[0]?.email || '',
      `"${l.city}, ${l.country}"`,
      l.engagement?.score || 0,
      l.status,
      `"${l.industry || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csvContent, `eplace_intel_${suffix}.csv`, 'text/csv');
  };

  const exportJSON = (data: Lead[], suffix: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `eplace_intel_${suffix}.json`, 'application/json');
  };

  return (
    <div className="space-y-6 md:space-y-8 relative">
      {/* Table Controls Bar */}
      <div className="flex justify-between items-center px-6">
        <div className="flex items-center gap-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
            {leads.length} Nodes Found
          </p>
        </div>

        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[9px] font-black text-white uppercase tracking-widest transition-all"
          >
            <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Intel
          </button>

          {isExportOpen && (
            <div className="absolute right-0 mt-3 w-64 glass rounded-3xl border border-white/10 p-2 z-[60] shadow-2xl animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-white/5 mb-1">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Select Format</span>
              </div>
              <button
                onClick={() => exportCSV(paginatedLeads, 'page')}
                className="w-full text-left px-4 py-3 hover:bg-indigo-600/20 rounded-xl text-[9px] font-black text-white uppercase tracking-widest transition-colors flex items-center justify-between group"
              >
                <span>Current Page (CSV)</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
              <button
                onClick={() => exportCSV(leads, 'all')}
                className="w-full text-left px-4 py-3 hover:bg-indigo-600/20 rounded-xl text-[9px] font-black text-white uppercase tracking-widest transition-colors flex items-center justify-between group"
              >
                <span>Full Results (CSV)</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
              <button
                onClick={() => exportJSON(leads, 'all')}
                className="w-full text-left px-4 py-3 hover:bg-indigo-600/20 rounded-xl text-[9px] font-black text-white uppercase tracking-widest transition-colors flex items-center justify-between group"
              >
                <span>JSON Dump (All)</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block glass rounded-[3.5rem] overflow-hidden transition-all duration-700 relative">
        <div className="mesh-bg opacity-30">
          <div className="mesh-blob w-72 h-72 bg-indigo-500 top-0 right-0 animate-float-slow" />
          <div className="mesh-blob w-72 h-72 bg-fuchsia-500 bottom-0 left-0 animate-float-reverse" />
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-10 py-8 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Identity Node</th>
                <th className="px-6 py-8 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Contact Point</th>
                <th className="px-6 py-8 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Direct Coordinates</th>
                <th className="px-6 py-8 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">Engagement Score</th>
                <th className="px-6 py-8 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Intel Phase</th>
                <th className="px-10 py-8 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] text-right">Matrix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-white/5 transition-all cursor-pointer group"
                  onClick={() => onSelectLead(lead)}
                >
                  <td className="px-10 py-8">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden mr-5 border border-white/10 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/10">
                        {!imgError[lead.id] && lead.logoUrl ? (
                          <img
                            src={lead.logoUrl}
                            alt={lead.name}
                            className="w-full h-full object-contain p-2"
                            onError={() => handleImageError(lead.id)}
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white font-black text-lg">
                            {lead.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-black text-white text-[14px] tracking-tight group-hover:text-indigo-400 transition-colors">{lead.name}</div>
                          {lead.verificationLinks && lead.verificationLinks.length > 0 && (
                            <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] text-white shadow-[0_0_8px_rgba(99,102,241,0.6)]" title="Grounding Verified">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{lead.industry || 'Commercial Node'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <div className="text-white text-sm font-bold">{lead.contacts?.[0]?.full_name || 'Unknown Contact'}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{lead.contacts?.[0]?.role || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-8">
                    <div className="space-y-1.5">
                      <div className="text-[10px] text-indigo-400 font-bold lowercase truncate max-w-[150px]">{lead.contacts?.[0]?.email || 'N/A'}</div>
                      <div
                        className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 group/unlock"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onUpgrade) onUpgrade();
                        }}
                      >
                        <span className="blur-[3px] opacity-40">+260 ••• ••• •••</span>
                        <span className="text-[7px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg font-black group-hover/unlock:bg-white transition-all">Pay</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center gap-2 group/score relative">
                      <span className={`text-[11px] font-black ${(lead.engagement?.score || 0) > 80 ? 'text-emerald-400' : 'text-amber-400'} cursor-help`}>
                        {lead.engagement?.score || 0}%
                      </span>
                      {lead.engagement?.breakdown?.explanation && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-900 border border-white/10 p-3 rounded-xl shadow-xl z-50 opacity-0 group-hover/score:opacity-100 transition-opacity pointer-events-none">
                          <p className="text-[9px] font-bold text-slate-300 leading-relaxed text-center">
                            {lead.engagement.breakdown.explanation}
                          </p>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <span className={`text-[9px] px-3 py-1.5 rounded-xl border font-black uppercase tracking-widest flex items-center gap-2 w-fit ${lead.status === LeadStatus.QUALIFIED ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' :
                      lead.status === LeadStatus.PROCESSING ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400' :
                        'border-white/10 bg-white/5 text-slate-500'
                      }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all ml-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View - Enhanced for narrow screens */}
      <div className="lg:hidden flex flex-col gap-4">
        {paginatedLeads.map((lead) => (
          <div
            key={lead.id}
            onClick={() => onSelectLead(lead)}
            className="glass rounded-[2rem] p-5 border-white/10 active:scale-[0.98] transition-all flex flex-col gap-5 relative group overflow-hidden w-full max-w-full"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white flex-shrink-0 flex items-center justify-center p-1.5 shadow-lg">
                  {!imgError[lead.id] && lead.logoUrl ? (
                    <img src={lead.logoUrl} alt={lead.name} className="w-full h-full object-contain" onError={() => handleImageError(lead.id)} />
                  ) : (
                    <div className="text-slate-900 font-black text-xs">{lead.name.charAt(0)}</div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-black text-sm tracking-tight truncate">
                    {lead.name}
                  </h4>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest truncate">{lead.industry}</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className={`text-[8px] px-2 py-1 rounded-lg border font-black uppercase tracking-widest ${lead.status === LeadStatus.QUALIFIED ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10' : 'border-white/10 text-slate-500'
                  }`}>
                  {lead.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 border-y border-white/5 py-4">
              <div className="flex justify-between items-center gap-2">
                <p className="text-[8px] font-black text-slate-500 uppercase flex-shrink-0">Point of Contact</p>
                <p className="text-[10px] font-bold text-white truncate">{lead.contacts?.[0]?.full_name || 'N/A'}</p>
              </div>
              <div className="flex justify-between items-center gap-2">
                <p className="text-[8px] font-black text-slate-500 uppercase flex-shrink-0">Email Node</p>
                <p className="text-[10px] font-bold text-indigo-400 truncate lowercase">{lead.contacts?.[0]?.email || 'N/A'}</p>
              </div>
              <div className="flex justify-between items-center gap-2">
                <p className="text-[8px] font-black text-slate-500 uppercase flex-shrink-0">Mobile Node</p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] blur-[2.5px] opacity-40">+260 ••• •••</span>
                  <button onClick={(e) => { e.stopPropagation(); if (onUpgrade) onUpgrade(); }} className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[7px] font-black rounded-lg shadow-lg active:scale-95">Pay</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={(e) => handleQuickEmail(e, lead.contacts?.[0]?.email || '')}
                className="flex items-center justify-center py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all gap-2"
              >
                <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span className="text-[7px] font-black uppercase text-slate-400">Email</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onSelectLead(lead); }}
                className="flex items-center justify-center py-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all gap-2 active:scale-95"
              >
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <span className="text-[7px] font-black uppercase">Deep Intel</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      {leads.length > ITEMS_PER_PAGE && (
        <div className="flex flex-col sm:flex-row gap-6 justify-between items-center px-4 py-8 relative z-10 border-t border-white/5">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] text-center">
            {leads.length} Matrix Nodes Analyzed
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${currentPage === 1 ? 'border-white/5 text-slate-700 cursor-not-allowed' : 'glass text-indigo-400 border-white/10 hover:border-indigo-500/30'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            </button>

            <div className="flex gap-1.5 mx-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 md:w-11 md:h-11 rounded-xl text-[10px] font-black transition-all border ${currentPage === i + 1
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-600/20'
                    : 'glass text-slate-500 border-white/10 hover:border-white/20'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${currentPage === totalPages ? 'border-white/5 text-slate-700 cursor-not-allowed' : 'glass text-indigo-400 border-white/10 hover:border-indigo-500/30'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadTable;
