import React, { useState } from 'react';
import { WeeklySummary } from '../logic/taskLogic';
import { Card } from '../../../components/Card';
import { Badge, BadgeProps } from '../../../components/Badge';
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { TaskCategory } from '../../../types/task';
import { IconButton } from '../../../components/IconButton';

interface WeeklySummaryCardProps {
  summary: WeeklySummary;
  weekStart: string;
  weekEnd: string;
}

const CATEGORY_META: Record<
  TaskCategory,
  { label: string; variant: BadgeProps['variant'] }
> = {
  study: { label: 'Study', variant: 'indigo' },
  gym: { label: 'Gym', variant: 'emerald' },
  skincare: { label: 'Skincare', variant: 'rose' },
  chore: { label: 'Chore', variant: 'amber' },
  other: { label: 'Other', variant: 'slate' },
};

export const WeeklySummaryCard: React.FC<WeeklySummaryCardProps> = ({
  summary,
  weekStart,
  weekEnd,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="p-3.5 mb-2 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/20 border-indigo-100/80 dark:border-indigo-950/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">This Week</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                ({weekStart.slice(5)} – {weekEnd.slice(5)})
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {summary.totalCompleted}
              </span>{' '}
              {summary.totalCompleted === 1 ? 'task completed' : 'tasks completed'}
            </p>
          </div>
        </div>

        <IconButton
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse weekly breakdown' : 'Expand weekly breakdown'}
          size="sm"
          variant="ghost"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </IconButton>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-indigo-100/60 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
            Completed by Category
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.keys(CATEGORY_META) as TaskCategory[]).map((cat) => {
              const meta = CATEGORY_META[cat];
              const count = summary.byCategory[cat] || 0;
              return (
                <div
                  key={cat}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shadow-2xs"
                >
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};
