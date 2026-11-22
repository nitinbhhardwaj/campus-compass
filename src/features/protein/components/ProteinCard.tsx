import React, { useState } from 'react';
import { ProteinEntry, CreateProteinEntryDTO } from '../types/protein';
import { Card } from '../../../components/Card';
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
    <Card className="p-4 mb-4 bg-white border-slate-200/90 shadow-xs">
      {/* Top Row: Metric & Quick Controls */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800">Daily Protein</span>
            <div className="text-[11px] text-slate-500 font-medium">
              <span className="font-bold text-slate-800">{totalGrams}g</span> of{' '}
              <span className="font-bold text-slate-800">{goalGrams}g</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Settings Trigger */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Protein settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Expand/Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse protein details' : 'Expand protein details'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            isGoalReached ? 'bg-emerald-500' : 'bg-indigo-600'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status Line */}
      <div className="flex items-center justify-between text-[11px]">
        {isGoalReached ? (
          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Target hit ({progress}%)
          </span>
        ) : (
          <span className="font-medium text-slate-600">
            <strong className="text-slate-900 font-bold">{remainingGrams}g</strong> remaining today
          </span>
        )}

        <button
          type="button"
          onClick={() => {
            setIsExpanded(true);
            setActiveTab('quick');
          }}
          className="font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1"
        >
          {isExpanded ? '' : '+ Log Protein'}
        </button>
      </div>

      {/* Expanded Accordion: Quick Presets & Entry History */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
          {/* Sub-tab navigation */}
          <div className="flex rounded-xl bg-slate-100 p-0.5 mb-3" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'quick'}
              onClick={() => setActiveTab('quick')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer ${
                activeTab === 'quick'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
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
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Today's Log ({todayEntries.length})
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
