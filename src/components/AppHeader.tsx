import React from 'react';
import { Compass, Sun, Moon, Laptop } from 'lucide-react';
import { formatDisplayDate } from '../lib/dateUtils';
import { useTheme } from '../lib/theme';
import { IconButton } from './IconButton';

interface AppHeaderProps {
  today: string;
  hour: number;
  userName?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  today,
  hour,
  userName = 'Nitin',
}) => {
  const { theme, toggleTheme } = useTheme();

  const getGreeting = () => {
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="mb-6">
      {/* Brand Top Bar */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-xs shadow-indigo-300 dark:shadow-none">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100 leading-none block">
              Campus Compass
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              Student Life Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Theme Toggle Button */}
          <IconButton
            onClick={toggleTheme}
            aria-label={`Current theme: ${theme}. Click to switch theme.`}
            variant="ghost"
            size="sm"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4" />
            ) : theme === 'light' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Laptop className="w-4 h-4" />
            )}
          </IconButton>
        </div>
      </div>

      {/* Personalized Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            {formatDisplayDate(today)} &bull; Plan your day with focus and balance
          </p>
        </div>
      </div>
    </header>
  );
};
