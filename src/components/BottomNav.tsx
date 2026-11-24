import React from 'react';
import { CheckSquare, Dumbbell, CreditCard, Sparkles } from 'lucide-react';

export type MobileTab = 'today' | 'protein' | 'money' | 'insights';

interface BottomNavProps {
  activeTab: MobileTab;
  onChange: (tab: MobileTab) => void;
  insightCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChange,
  insightCount = 0,
}) => {
  const tabs: { id: MobileTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'today', label: 'Today', icon: CheckSquare },
    { id: 'protein', label: 'Protein', icon: Dumbbell },
    { id: 'money', label: 'Money', icon: CreditCard },
    { id: 'insights', label: 'Insights', icon: Sparkles },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1 shadow-lg"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              aria-label={tab.label}
              className={`relative flex flex-col items-center justify-center py-2 px-3 min-h-[48px] min-w-[56px] transition-colors rounded cursor-pointer ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {tab.id === 'insights' && insightCount > 0 && (
                  <span className="absolute -top-1 -right-2.5 w-2 h-2 rounded-sm bg-indigo-600 dark:bg-indigo-400 ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>
              <span className="text-[10px] mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
