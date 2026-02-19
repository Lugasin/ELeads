import React from 'react';

const CreditBadge: React.FC<{ credits: number }> = ({ credits }) => {
  const isLow = credits < 5;
  
  return (
    <div className={`px-4 py-2 rounded-xl ${isLow ? 'bg-amber-500/10 border-amber-500/20' : 'bg-indigo-500/10 border-indigo-500/20'} border`}>
      <span className={`text-xs font-black ${isLow ? 'text-amber-400' : 'text-indigo-400'}`}>
        {credits} credits
      </span>
    </div>
  );
};

export default CreditBadge;