
import React, { useState } from 'react';
import { Currency } from '../types';

const PricingPage: React.FC = () => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const FX_RATE = 20;

  const plans = [
    {
      name: 'Discovery',
      priceUSD: 49,
      leads: '1,000',
      features: ['Basic Node Scan', 'Neural Verification', 'Standard Support'],
      color: 'glass text-slate-300'
    },
    {
      name: 'Dominance',
      priceUSD: 199,
      leads: '10,000',
      features: ['Deep Territory Scan', 'Decision-Maker Mapping', 'Strategic Outreach Drafts', 'Priority AI Cluster'],
      color: 'btn-primary text-white scale-105 z-10'
    },
    {
      name: 'Elite',
      priceUSD: 599,
      leads: '50,000',
      features: ['Full Regional Access', 'White-Label Instance', 'API Integration', 'Dedicated Intel Rep'],
      color: 'glass text-white border-white/20'
    }
  ];

  const formatPrice = (usd: number) => {
    return currency === 'USD' ? `$${usd}` : `K${usd * FX_RATE}`;
  };

  return (
    <div className="py-20 space-y-24 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <div className="text-center space-y-6">
        <h2 className="text-5xl font-black text-white font-display tracking-tight">Enterprise Tiers for Every Scale</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">Intelligence is an investment in your growth trajectory. Select the plan that matches your market ambition.</p>
        
        <div className="flex items-center justify-center gap-6 pt-4">
           <span className={`text-xs font-black uppercase tracking-widest transition-all ${currency === 'USD' ? 'text-indigo-400' : 'text-slate-600'}`}>USD</span>
           <button 
             onClick={() => setCurrency(currency === 'USD' ? 'ZMW' : 'USD')}
             className="w-16 h-8 bg-white/5 rounded-full relative p-1 border border-white/10"
           >
             <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-all transform ${currency === 'ZMW' ? 'translate-x-8' : 'translate-x-0'}`} />
           </button>
           <span className={`text-xs font-black uppercase tracking-widest transition-all ${currency === 'ZMW' ? 'text-indigo-400' : 'text-slate-600'}`}>ZMW</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
        {plans.map((plan, i) => (
          <div key={i} className={`p-12 rounded-[4rem] border border-white/5 flex flex-col min-h-[550px] transition-all hover:translate-y-[-10px] ${plan.color}`}>
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] mb-8 opacity-70">{plan.name}</h3>
            <div className="mb-12">
              <span className="text-5xl font-black font-display tracking-tighter">{formatPrice(plan.priceUSD)}</span>
              <span className="text-[11px] font-bold uppercase opacity-50 block mt-2"> / per billing cycle</span>
            </div>
            
            <div className="space-y-6 flex-1 mb-12">
              <div className="flex items-center gap-4">
                 <div className="w-2 h-2 rounded-full bg-indigo-500" />
                 <span className="text-xs font-black uppercase tracking-widest">{plan.leads} High-Value Nodes</span>
              </div>
              {plan.features.map((f, j) => (
                <div key={j} className="flex items-center gap-4 opacity-80">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{f}</span>
                </div>
              ))}
            </div>

            <button className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${plan.name === 'Dominance' ? 'bg-white text-indigo-600' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              Acquire {plan.name} Plan
            </button>
          </div>
        ))}
      </div>

      <div className="p-16 glass rounded-[4rem] border-white/5 text-center space-y-8 max-w-4xl mx-auto shadow-none">
         <h4 className="text-3xl font-black text-white font-display">Custom Territory Solutions?</h4>
         <p className="text-slate-500 text-sm leading-relaxed">For multinational corporations or high-volume lead brokers, we offer custom nodes and regional extraction infrastructure. Own your market.</p>
         <button className="px-12 py-5 btn-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest">Consult Strategy Desk</button>
      </div>
    </div>
  );
};

export default PricingPage;
