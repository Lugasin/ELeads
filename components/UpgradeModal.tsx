import React from 'react';

const plans = [
  { name: 'Free', credits: 10, price: 0 },
  { name: 'Starter', credits: 75, price: 49 },
  { name: 'Pro', credits: 250, price: 149 },
];

interface UpgradeModalProps {
  onClose: () => void;
  onUpgrade: (plan: string) => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, onUpgrade }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="glass p-10 rounded-3xl max-w-4xl">
        <h2 className="text-3xl font-black text-white mb-8">Upgrade Your Intelligence</h2>
        
        <div className="grid grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.name} className="glass p-6 rounded-2xl border border-white/10">
              <h3 className="text-xl font-black text-white mb-2">{plan.name}</h3>
              <p className="text-4xl font-black text-indigo-400 mb-4">${plan.price}</p>
              <p className="text-sm text-slate-400 mb-6">{plan.credits} signals/month</p>
              <button 
                className="w-full btn-primary py-3 rounded-xl"
                onClick={() => onUpgrade(plan.name)}
              >
                {plan.price === 0 ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
        
        <button 
          onClick={onClose}
          className="mt-8 text-slate-400 hover:text-white transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default UpgradeModal;