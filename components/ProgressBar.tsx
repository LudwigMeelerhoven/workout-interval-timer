import React from 'react';

interface ProgressBarProps {
  total: number;
  current: number;
  label: string;
  colorClass: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ total, current, label, colorClass }) => {
  // Ensure we don't divide by zero and clamp values
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(1, current), safeTotal);
  
  // Create blocks for the progress bar
  const blocks = Array.from({ length: safeTotal }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider opacity-80">
        <span>{label}</span>
        <span>{current} / {total}</span>
      </div>
      <div className="flex gap-1 h-2">
        {blocks.map((num) => (
          <div
            key={num}
            className={`flex-1 rounded-full transition-all duration-300 ${
              num <= safeCurrent ? colorClass : 'bg-white/20'
            } ${num === safeCurrent ? 'opacity-100' : 'opacity-60'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
