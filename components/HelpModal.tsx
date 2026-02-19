
import React, { useState } from 'react';

interface HelpModalProps {
  onClose: () => void;
}

const STEPS = [
  {
    title: "Neural Scouting",
    description: "Initialize your market reconnaissance. Use the 'Neural Scout' (the + button in the bottom menu) to identify high-fidelity business leads in specific regions of Zambia.",
    icon: (
      <svg className="w-10 h-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    details: "Enter target keywords (e.g., 'Courier') and select a region (e.g., 'Lusaka Central') to begin the automated extraction process."
  },
  {
    title: "Entity Graph",
    description: "Navigate the Regional Entity Graph to view identified leads. Each node includes a Neural Score indicating Bulk SMS readiness and market fit.",
    icon: (
      <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2" />
      </svg>
    ),
    details: "Click on any row in the table to open the Deep Intel matrix for that specific business entity."
  },
  {
    title: "Strategic Intel Matrix",
    description: "Access deep-level intelligence. View the Neural Activity Timeline to understand business triggers like communication gaps or market expansions.",
    icon: (
      <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    details: "The matrix categorizes signals automatically to help you understand the perfect moment for service penetration."
  },
  {
    title: "Engagement Protocols",
    description: "Convert intel into action. Use AI to generate personalized outreach bundles including Email blueprints and SMS clusters tailored to the lead.",
    icon: (
      <svg className="w-10 h-10 text-fuchsia-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    details: "Copy high-conversion scripts directly and reach out to decision-makers with confidence scores of over 90%."
  }
];

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center z-[200] p-4">
      <div className="glass w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border-white/10">
        <header className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/2">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest font-display">System Protocol Guide</h2>
            <p className="text-[9px] font-bold text-indigo-400 uppercase mt-1 tracking-[0.2em]">Operating E-Place Intel Engine</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-rose-500/20 transition-all text-slate-500 hover:text-rose-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-10 space-y-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 shadow-xl group hover:scale-105 transition-transform duration-500">
              {step.icon}
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-white font-display uppercase tracking-tight">{step.title}</h3>
              <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-md">
                {step.description}
              </p>
            </div>
            <div className="p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/20 text-indigo-300/80 text-[10px] font-bold leading-relaxed max-w-sm italic">
              {step.details}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 transition-all duration-500 rounded-full ${i === currentStep ? 'w-8 bg-indigo-500' : 'w-2 bg-white/10'}`} 
              />
            ))}
          </div>
        </div>

        <footer className="p-10 pt-4 flex gap-4 border-t border-white/5 bg-white/2">
          {currentStep > 0 && (
            <button 
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-8 py-4 glass text-slate-500 font-black uppercase text-[10px] rounded-2xl hover:text-white transition-all"
            >
              Previous
            </button>
          )}
          <button 
            onClick={() => currentStep < STEPS.length - 1 ? setCurrentStep(prev => prev + 1) : onClose()}
            className="flex-1 py-4 btn-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
          >
            {currentStep < STEPS.length - 1 ? 'Next Protocol' : 'Dismiss Guide'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default HelpModal;
