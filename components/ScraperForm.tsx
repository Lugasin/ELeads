/**
 * @deprecated This component is part of the legacy scraping architecture.
 * Use SourceInput instead for signals-only architecture (no scraping).
 * To be removed in v2.0
 */

import React, { useState, useEffect } from 'react';
import { LeadSource, DEFAULT_SOURCES } from '../types';

interface ScraperFormProps {
  onStartScraping: (platform: LeadSource, keywords: string, region: string) => void;
  isScraping: boolean;
  availableSources: string[];
  onAddSource: (source: string) => void;
  progress?: number;
}

// Simulated configuration/API response for regions
const FETCHED_REGIONS = [
  'Lusaka, Zambia',
  'Copperbelt, Zambia',
  'Central, Zambia',
  'Southern, Zambia',
  'Eastern, Zambia',
  'Western, Zambia',
  'North-Western, Zambia',
  'Northern, Zambia',
  'Luapula, Zambia',
  'Muchinga, Zambia',
  'Kitwe, Zambia',
  'Ndola, Zambia',
  'Livingstone, Zambia',
  'Chipata, Zambia',
  'Kabwe, Zambia'
];

const ScraperForm: React.FC<ScraperFormProps> = ({ onStartScraping, isScraping, availableSources, onAddSource, progress = 0 }) => {
  const [platform, setPlatform] = useState<LeadSource>(DEFAULT_SOURCES.WEB);
  const [keywords, setKeywords] = useState('');
  const [regions, setRegions] = useState<string[]>([]);
  const [region, setRegion] = useState('');
  const [newSource, setNewSource] = useState('');
  const [showAddSource, setShowAddSource] = useState(false);
  const [isLoadingRegions, setIsLoadingRegions] = useState(true);

  useEffect(() => {
    // Simulate dynamic loading from a configuration or API
    const loadRegions = async () => {
      setIsLoadingRegions(true);
      try {
        // In a real app, this would be: await fetch('/api/regions')
        await new Promise(resolve => setTimeout(resolve, 600));
        setRegions(FETCHED_REGIONS);
        setRegion(FETCHED_REGIONS[0]);
      } catch (error) {
        console.error("Failed to load region matrix.");
      } finally {
        setIsLoadingRegions(false);
      }
    };
    loadRegions();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keywords.trim() && region) {
      onStartScraping(platform, keywords, region);
    }
  };

  const handleAddCustomSource = () => {
    if (newSource.trim() && !availableSources.includes(newSource.trim())) {
      onAddSource(newSource.trim());
      setPlatform(newSource.trim());
      setNewSource('');
      setShowAddSource(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
        <div className="p-3 md:p-4 bg-indigo-600 rounded-2xl md:rounded-[1.75rem] text-white shadow-2xl shadow-indigo-500/20 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter font-display uppercase">Territory Discovery v5.2</h2>
          <p className="text-slate-500 font-medium text-[10px] md:text-sm mt-0.5 md:mt-1">Neural reconnaissance via Google Maps & Web Grounding.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          {/* Source Selection */}
          <div className="space-y-4 md:space-y-5">
            <label className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">1. Intel Network</label>
            <div className="flex flex-wrap gap-2">
              {availableSources.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPlatform(s)}
                  className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all duration-300 ${platform === s
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                    }`}
                >
                  {s}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowAddSource(!showAddSource)}
                className="px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border border-dashed border-white/20 text-slate-500 hover:text-white transition-all"
              >
                + Link Node
              </button>
            </div>

            {showAddSource && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-top-3 duration-300">
                <input
                  type="text"
                  placeholder="e.g. specialized-database.zm"
                  className="flex-1 px-4 py-2.5 text-[10px] font-bold rounded-xl bg-white text-slate-900 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                />
                <button type="button" onClick={handleAddCustomSource} className="px-4 py-2.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg">Add</button>
              </div>
            )}
          </div>

          {/* Region Selection - Properly mapped to Google Maps strings */}
          <div className="space-y-4 md:space-y-5">
            <label className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">2. Maps Coordinate</label>
            <div className="relative">
              {isLoadingRegions ? (
                <div className="w-full h-[52px] bg-white/5 rounded-[1.25rem] md:rounded-[1.5rem] animate-pulse flex items-center px-6">
                  <div className="h-3 w-32 bg-white/10 rounded" />
                </div>
              ) : (
                <>
                  <select
                    className="w-full px-6 py-4 rounded-[1.25rem] md:rounded-[1.5rem] bg-white text-slate-900 text-[10px] md:text-[11px] font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all appearance-none cursor-pointer shadow-lg"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    {regions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-4 md:space-y-5">
            <label className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">3. Growth Vector</label>
            <input
              type="text"
              placeholder="e.g. Courier & Delivery Hubs"
              className="w-full px-6 py-4 rounded-[1.25rem] md:rounded-[1.5rem] bg-white text-slate-900 text-[10px] md:text-[11px] font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400 shadow-lg"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              disabled={isScraping}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-6 md:pt-10 border-t border-white/5 gap-6 md:gap-8">
          <div className="flex items-center gap-3 text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-center md:text-left">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)] flex-shrink-0" />
            Engines Hot. Ready for {region || 'Deployment'}.
          </div>
          <button
            type="submit"
            disabled={isScraping || !keywords || !region}
            className={`w-full md:w-auto py-4 md:py-5 px-10 md:px-14 rounded-2xl md:rounded-[1.75rem] font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4 min-w-0 md:min-w-[280px] ${isScraping || !keywords || !region ? 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none' : 'btn-primary'
              }`}
          >
            {isScraping ? (
              <>
                <div className="animate-spin h-4 w-4 md:h-5 md:w-5 border-[3px] border-white border-t-transparent rounded-full" />
                Discovering ({Math.round(progress)}%)
              </>
            ) : (
              'Discover Signals'
            )}
          </button>
        </div>
      </form>

      {isScraping && (
        <div className="mt-8 md:mt-12 space-y-3 md:space-y-4 animate-in fade-in duration-700">
          <div className="h-1.5 md:h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
            <span className="flex items-center gap-2 truncate pr-4">
              <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-indigo-500 rounded-full animate-ping flex-shrink-0" />
              Mapping {platform} matrix...
            </span>
            <span className="text-white flex-shrink-0">{Math.round(progress)}% SYNCED</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScraperForm;
