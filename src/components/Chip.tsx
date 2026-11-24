import React from 'react';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSelected?: boolean;
  count?: number;
  children: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  isSelected = false,
  count,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900 ${
        isSelected
          ? 'bg-indigo-600 text-white shadow-xs font-semibold dark:bg-indigo-500'
          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
      } ${className}`}
      {...props}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
            isSelected
              ? 'bg-indigo-700/80 text-white dark:bg-indigo-600'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
