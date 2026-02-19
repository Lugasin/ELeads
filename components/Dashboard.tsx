import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { BusinessEntity } from '../types';

interface DashboardProps {
  entities: BusinessEntity[];
  onScoutRequest?: () => void;
}



const Dashboard: React.FC<DashboardProps> = ({ entities, onScoutRequest }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const signals = entities.flatMap(e => e.signals?.map(s => ({ ...s, company: e.name })) || []);

  const highPotentialLeads = entities
    .filter(e => (e.engagement?.score || 0) > 70)
    .sort((a, b) => (b.engagement?.score || 0) - (a.engagement?.score || 0))
    .slice(0, 4);

  // 1. Dynamic Opportunities (Top 3 High Score)
  const opportunities = entities
    .filter(e => (e.engagement?.score || 0) > 60)
    .sort((a, b) => (b.engagement?.score || 0) - (a.engagement?.score || 0))
    .slice(0, 3)
    .map(e => ({
      title: e.name,
      desc: e.description || `High potential opportunity in ${e.city} ${e.industry} sector.`,
      img: e.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${e.name}`,
      tag: "Verified Lead"
    }));

  // Fallback if no entities
  if (opportunities.length === 0) {
    opportunities.push({
      title: "Market Scanner Idle",
      desc: "Deploy neural scouts to identify regional opportunities.",
      img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200",
      tag: "System Standby"
    });
  }

  // 2. Dynamic Chart Data (Signals by Hour - Mocked distribution from real signal timestamps if available, else flat)
  // For Phase 0, we'll simple bucket signals by time if available, or show "No Data" state?
  // Let's bucket by generic "buckets" around the current time for a "Pulse" visual derived from signal count.
  const hourBuckets = new Array(6).fill(0).map((_, i) => ({ name: `${8 + i * 2}:00`, intensity: 0 }));
  signals.forEach(s => {
    const hours = new Date(s.observed_at || s.detected_at || s.timestamp || new Date()).getHours();
    // Simple modulo mapping to our 6 buckets
    const bucketIdx = Math.floor((hours - 8) / 2);
    if (bucketIdx >= 0 && bucketIdx < 6) hourBuckets[bucketIdx].intensity += (s.confidence || 0.5) * 20;
  });
  const chartData = hourBuckets;

  // 3. Dynamic Stats
  const avgPotential = entities.length > 0
    ? (entities.reduce((acc, e) => acc + (e.engagement?.score || 0), 0) / entities.length).toFixed(1)
    : "0.0";

  const readinessCount = entities.filter(e => (e.engagement?.score || 0) > 75).length;
  const readinessPct = entities.length > 0 ? Math.round((readinessCount / entities.length) * 100) : 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % opportunities.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [opportunities.length]);

  // 4. Pulse Logic (14 day window)
  const hasRecentActivity = signals.some(s => {
    const date = new Date(s.observed_at || s.detected_at || s.timestamp || 0);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    return date > fourteenDaysAgo;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">

      {/* Featured Opportunity Carousel */}
      <section className="relative h-[400px] md:h-[450px] w-full rounded-[3.5rem] overflow-hidden shadow-2xl group border border-white/5">
        {opportunities.map((opt, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
            <img src={opt.img} alt={opt.title} className="w-full h-full object-cover transition-transform duration-10000 group-hover:scale-110" />

            <div className="absolute bottom-0 left-0 p-8 md:p-14 z-20 space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 bg-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-xl">
                  {opt.tag}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white font-display tracking-tight leading-tight uppercase">
                {opt.title}
              </h2>
              <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed">
                {opt.desc}
              </p>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={onScoutRequest}
                  className="px-8 py-3.5 btn-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
                >
                  Discover Signals
                </button>
                <div className="flex gap-2 items-center">
                  {opportunities.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => setCurrentSlide(dotIdx)}
                      className={`h-1.5 transition-all rounded-full ${dotIdx === currentSlide ? 'w-8 bg-indigo-500' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Analytics Pulse & Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-[3rem] p-10 border-white/5 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div>
              <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Strategic Frequency</h3>
              <p className="text-2xl font-black text-white font-display uppercase">SMS Lead Generation Pulse</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${hasRecentActivity ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-slate-800/50 border-white/5'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${hasRecentActivity ? 'bg-indigo-500 animate-pulse shadow-[0_0_8px_#6366f1]' : 'bg-slate-600'}`} />
              <span className={`text-[9px] font-black uppercase ${hasRecentActivity ? 'text-indigo-400' : 'text-slate-500'}`}>
                {hasRecentActivity ? 'New Verified Activity' : 'Silence'}
              </span>
            </div>
          </div>

          <div className="h-56 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="pulseColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip
                  cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontSize: '10px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="intensity" stroke="#6366f1" strokeWidth={5} fill="url(#pulseColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-[3rem] p-10 border-white/5 space-y-8 bg-indigo-600/5 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <svg className="w-24 h-24 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
          </div>
          <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Market Conversion Bias</h3>
          <div className="space-y-6 relative z-10">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outreach Readiness</span>
              <span className="text-xs font-black text-white">{readinessPct}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
              <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1] transition-all duration-1000" style={{ inlineSize: `${readinessPct}%` }} />
            </div>

            <div className="pt-6 grid grid-cols-2 gap-4">
              <div className="p-4 glass rounded-2xl text-center space-y-1 border border-white/5 bg-white/2">
                <p className="text-[8px] font-black text-slate-500 uppercase">Avg Potential</p>
                <p className="text-xl font-black text-white">{avgPotential}</p>
              </div>
              <div className="p-4 glass rounded-2xl text-center space-y-1 border border-white/5 bg-white/2">
                <p className="text-[8px] font-black text-slate-500 uppercase">Neural Hits</p>
                <p className="text-xl font-black text-white">{entities.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* High Intent Leads Display */}
      <section className="space-y-6">
        <div className="flex justify-between items-end px-4">
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">High-Priority SMS Vectors</h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tight">Top leads identified by communication intent audit.</p>
          </div>
          <button className="text-[9px] font-black text-indigo-400 hover:text-white transition-all uppercase tracking-widest underline decoration-indigo-500/30">View All Vectors</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highPotentialLeads.map((lead, idx) => (
            <div key={idx} className="glass p-8 rounded-[2.5rem] border-white/5 hover:border-indigo-500/40 transition-all group relative overflow-hidden bg-white/2">
              <div className="absolute top-0 right-0 p-4 z-20 group/score">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-[10px] font-black border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all cursor-help relative">
                  {(lead.engagement?.score || 0)}%
                  {lead.engagement?.breakdown?.explanation && (
                    <div className="absolute top-full right-0 mt-2 w-40 bg-slate-900 border border-white/10 p-2 rounded-lg shadow-xl opacity-0 group-hover/score:opacity-100 transition-opacity pointer-events-none">
                      <p className="text-[8px] font-medium text-slate-300 leading-snug">
                        {lead.engagement.breakdown.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-xl p-2.5 transition-transform group-hover:scale-110">
                <img src={lead.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${lead.name}`} alt={lead.name} className="w-full h-full object-contain" />
              </div>
              <h4 className="text-lg font-black text-white tracking-tight mb-1 truncate group-hover:text-indigo-400 transition-colors">{lead.name}</h4>
              <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-4">{lead.industry}</p>
              <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Uplink Verified</span>
              </div>
            </div>
          ))}
          {highPotentialLeads.length === 0 && (
            <div className="col-span-full py-24 text-center glass rounded-[3.5rem] border-dashed border-white/10 flex flex-col items-center justify-center gap-6">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-700 animate-pulse">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div className="space-y-2">
                <p className="text-[12px] font-black text-white uppercase tracking-widest">Neural Reconnaissance Required</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scanning territory for high-intent SMS leads...</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Real-time Intent Feed */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] ml-6">Regional Intent Stream</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {signals.slice(0, 6).map((signal, idx) => (
            <div key={idx} className="glass p-8 rounded-[2.5rem] border-white/5 hover:border-indigo-500/30 transition-all group bg-white/2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-8 -mt-8" />
                <div className="flex justify-between items-start mb-6 relative z-10">
                <span className={`text-[8px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${(signal.signal_type || signal.type) === 'communication_gap' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-white/5 text-slate-400 border border-white/5'}`}>
                  {(signal.signal_type || signal.type || '').replace('_', ' ')}
                </span>
                <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">{new Date(signal.observed_at || signal.timestamp || signal.detected_at || Date.now()).toLocaleTimeString()}</span>
              </div>
              <p className="text-sm font-bold text-white mb-4 line-clamp-2 leading-relaxed relative z-10">{signal.description}</p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-[11px] font-black text-indigo-400 uppercase border border-white/5">{signal.company?.charAt(0) || '?'}</div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{signal.company || 'Unknown'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;