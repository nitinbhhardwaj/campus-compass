import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  children: React.ReactNode;
  variant?: 'ghost' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
}

export const IconButton: React.FC<IconButtonProps> = ({
  'aria-label': ariaLabel,
  children,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'p-1.5 w-8 h-8',
    md: 'p-2 w-10 h-10',
  };

  const variantStyles = {
    ghost:
      'text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
    secondary:
      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700',
    danger:
      'text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40',
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`relative inline-flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 after:content-[''] after:absolute after:-inset-1 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
