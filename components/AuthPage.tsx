import React, { useState, useEffect } from 'react';

interface AuthPageProps {
  onAuth: (email: string, pass: string, isSignUp: boolean, metadata?: any) => void;
  error: string | null;
  isLoading: boolean;
  isInitialSetup?: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuth, error, isLoading, isInitialSetup = false }) => {
  const [isSignUpState, setIsSignUpState] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState(isInitialSetup ? 'E-Place Governance' : '');
  const [industry, setIndustry] = useState(isInitialSetup ? 'Governance' : 'General Logistics');
  const [step, setStep] = useState(1);

  const isSignUp = isInitialSetup || isSignUpState;

  useEffect(() => {
    if (isInitialSetup) {
      setIsSignUpState(true);
      setCompanyName('E-Place Governance');
      setIndustry('Governance');
    }
  }, [isInitialSetup]);

  const industries = [
    'Courier & Express',
    'Fleet Management',
    'Bulk SMS Marketing',
    'Trucking & Haulage',
    'Retail Logistics',
    'Individual Operator',
    'Governance'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && step === 1) {
      setStep(2);
      return;
    }
    const metadata = isSignUp ? {
      full_name: fullName,
      company_name: companyName,
      industry: industry,
      is_root_admin: isInitialSetup || email.toLowerCase() === 'mambwemwila1@gmail.com'
    } : undefined;
    onAuth(email, password, isSignUp, metadata);
  };

  const toggleMode = () => {
    if (isInitialSetup) return;
    setIsSignUpState(!isSignUpState);
    setStep(1);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-950 text-white font-sans overflow-hidden">

      {/* Visual Identity Side */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-950/40 z-10" />
          <img
            src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=2000"
            alt="Logistics Background"
            className="w-full h-full object-cover scale-110 animate-float-slow"
          />
        </div>

        <div className="relative z-20 space-y-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black font-display uppercase tracking-[0.2em]">E-Place Group</h2>
          </div>

          <div className="space-y-6 max-w-lg">
            <h1 className="text-6xl font-black leading-tight font-display tracking-tight">
              NEURAL <br /> MARKET <br /> <span className="text-indigo-500">INTEL.</span>
            </h1>
            <p className="text-lg text-slate-300 font-medium leading-relaxed">
              Accessing high-fidelity leads for Outreach Workflow, Fleet Management, and Regional Logistics optimization in Zambia and the wider territory.
            </p>
          </div>
        </div>

        <div className="relative z-20 grid grid-cols-2 gap-10">
          <div className="space-y-2 border-l-2 border-indigo-500 pl-6">
            <p className="text-4xl font-black font-display">4,200+</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Business Nodes</p>
          </div>
          <div className="space-y-2 border-l-2 border-fuchsia-500 pl-6">
            <p className="text-4xl font-black font-display">84%</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Accuracy Score</p>
          </div>
        </div>
      </div>

      {/* Auth Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-20 relative overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="glass rounded-[3.5rem] p-10 md:p-14 shadow-2xl border-white/10 animate-in slide-in-from-right-10 duration-700">

            <div className="text-center space-y-4 mb-10">
              <div className="lg:hidden w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em]">
                {isInitialSetup ? 'System Seed Protocol' : 'Access Authorization'}
              </h3>
              <h1 className="text-3xl font-black font-display uppercase tracking-tight">
                {isSignUp ? 'Initialize Node' : 'Uplink to Engine'}
              </h1>
            </div>

            {isInitialSetup && (
              <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl animate-in fade-in">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Master Controller Needed
                </p>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                  System uninitialized. Register the first account to establish <span className="text-white">ROOT ADMINISTRATIVE</span> authority.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <p className="text-xs font-bold text-rose-400 leading-snug">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp ? (
                step === 1 ? (
                  <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Full Identity Name</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Mambwe Mwila"
                        className="w-full px-8 py-5 bg-white/5 border border-white/5 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-xs font-bold text-white placeholder:text-slate-700"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Organization Node</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. E-Place Logistics"
                        className="w-full px-8 py-5 bg-white/5 border border-white/5 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-xs font-bold text-white placeholder:text-slate-700"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Vertical Bias</label>
                      <select
                        className="w-full px-8 py-5 bg-white/5 border border-white/5 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-xs font-bold text-white appearance-none"
                        value={industry}
                        onChange={e => setIndustry(e.target.value)}
                      >
                        {industries.map(ind => (
                          <option key={ind} value={ind} className="bg-slate-900 text-white">{ind}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Email Coordinate</label>
                      <input
                        required
                        type="email"
                        placeholder="e.g. user@eplace.zm"
                        className="w-full px-8 py-5 bg-white/5 border border-white/5 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-xs font-bold text-white placeholder:text-slate-700"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Access Key</label>
                      <input
                        required
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-8 py-5 bg-white/5 border border-white/5 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-xs font-bold text-white placeholder:text-slate-700"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Neural Coordinate</label>
                    <input
                      required
                      type="email"
                      className="w-full px-8 py-5 bg-white/5 border border-white/5 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-xs font-bold text-white"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Access Key</label>
                    <input
                      required
                      type="password"
                      className="w-full px-8 py-5 bg-white/5 border border-white/5 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-xs font-bold text-white"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-6 btn-primary text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    isSignUp
                      ? (step === 1 ? 'Next Phase' : 'Initialize Profile')
                      : 'Authorize Access'
                  )}
                </button>
              </div>
            </form>

            {!isInitialSetup && (
              <div className="mt-10 pt-8 border-t border-white/5 text-center space-y-4">
                <button
                  onClick={toggleMode}
                  className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-400 transition-all"
                >
                  {isSignUp ? 'Already registered? Authenticate' : 'New operator? Initialize Identity'}
                </button>

                {isSignUp && step === 2 && (
                  <button onClick={() => setStep(1)} className="block mx-auto text-[8px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-all">
                    Go Back
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;