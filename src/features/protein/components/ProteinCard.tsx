import React, { useState } from 'react';
import { ProteinEntry, CreateProteinEntryDTO } from '../types/protein';
import { Card } from '../../../components/Card';
import { ProgressRing } from '../../../components/ProgressRing';
import { IconButton } from '../../../components/IconButton';
import { ProteinQuickAdd } from './ProteinQuickAdd';
import { ProteinEntryList } from './ProteinEntryList';
import { Settings2, Dumbbell, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface ProteinCardProps {
  today: string;
  totalGrams: number;
  goalGrams: number;
  remainingGrams: number;
  progress: number;
  todayEntries: ProteinEntry[];
  onAddEntry: (dto: CreateProteinEntryDTO) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
  onOpenSettings: () => void;
}

export const ProteinCard: React.FC<ProteinCardProps> = ({
  today,
  totalGrams,
  goalGrams,
  remainingGrams,
  progress,
  todayEntries,
  onAddEntry,
  onDeleteEntry,
  onOpenSettings,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'log'>('quick');
  const isGoalReached = remainingGrams === 0 && totalGrams > 0;

  return (
    <Card className="p-4 sm:p-5">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-100 dark:border-emerald-900/60">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Daily Protein
            </h2>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Target: {goalGrams}g/day
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            onClick={onOpenSettings}
            aria-label="Protein settings"
            size="sm"
            variant="ghost"
          >
            <Settings2 className="w-4 h-4" />
          </IconButton>
          <IconButton
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse protein details' : 'Expand protein details'}
            size="sm"
            variant="ghost"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </IconButton>
        </div>
      </div>

      {/* Main Focus: Circular Progress Ring & Key Stat */}
      <div className="flex items-center justify-between gap-4 py-1">
        <div className="flex items-center gap-4">
          <ProgressRing
            percent={progress}
            size={88}
            strokeWidth={8}
            color={isGoalReached ? '#10b981' : '#6366f1'}
            trackColor="#e2e8f0"
          >
            <span className="text-base font-extrabold text-slate-900 dark:text-slate-50 tabular-nums">
              {totalGrams}g
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              {progress}%
            </span>
          </ProgressRing>

          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isGoalReached ? 'Daily Target Hit' : 'Progress'}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {totalGrams} <span className="text-xs text-slate-400 font-normal">/ {goalGrams}g</span>
            </div>
            <div className="mt-1">
              {isGoalReached ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Goal Reached!
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  <strong className="text-indigo-600 dark:text-indigo-400 font-bold tabular-nums">
                    {remainingGrams}g
                  </strong>{' '}
                  left to reach target
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsExpanded(true);
            setActiveTab('quick');
          }}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl"
        >
          {isExpanded ? '' : '+ Log'}
        </button>
      </div>

      {/* Expanded Presets & History Drawer */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-150">
          {/* Sub-tab switcher */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 mb-3" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'quick'}
              onClick={() => setActiveTab('quick')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer ${
                activeTab === 'quick'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Quick Presets
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'log'}
              onClick={() => setActiveTab('log')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer ${
                activeTab === 'log'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Today's Entries ({todayEntries.length})
            </button>
          </div>

          {activeTab === 'quick' ? (
            <ProteinQuickAdd today={today} onAdd={onAddEntry} />
          ) : (
            <ProteinEntryList entries={todayEntries} onDelete={onDeleteEntry} />
          )}
        </div>
      )}
    </Card>
  );
};
