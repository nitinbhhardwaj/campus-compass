import React from 'react';

export interface ProgressBarProps {
  percent: number;
  color?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  color = 'bg-indigo-600 dark:bg-indigo-500',
  className = '',
}) => {
  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <div
      className={`w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-all duration-300 ease-out ${color}`}
        style={{ width: `${clampedPercent}%` }}
      />
    </div>
  );
};
