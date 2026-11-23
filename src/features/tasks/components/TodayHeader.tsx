import React from 'react';
import { Plus, AlertTriangle, CalendarDays, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/Button';
import { ProgressBar } from '../../../components/ProgressBar';
import { formatDisplayDate } from '../../../lib/dateUtils';

interface TodayHeaderProps {
  today: string;
  totalTasks: number;
  completedTasks: number;
  overdueCount: number;
  completionPercentage: number;
  onOpenAddModal: () => void;
}

export const TodayHeader: React.FC<TodayHeaderProps> = ({
  today,
  totalTasks,
  completedTasks,
  overdueCount,
  completionPercentage,
  onOpenAddModal,
}) => {
  return (
    <header className="mb-2">
      {/* Date & Quick Add Row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <CalendarDays className="w-4 h-4 text-indigo-500" />
          <span>{formatDisplayDate(today)}</span>
        </div>
        <Button
          onClick={onOpenAddModal}
          size="sm"
          className="shadow-xs shadow-indigo-200 dark:shadow-none"
          aria-label="Add new task"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </Button>
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Today's Plan
        </h2>
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-200">{completedTasks}</span> of{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{totalTasks}</span> done
        </div>
      </div>

      {/* Modern Progress Bar */}
      <ProgressBar percent={completionPercentage} className="mb-3" />

      {/* Status Badges Row (Overdue Alert & All Done Celebration) */}
      <div className="flex flex-wrap items-center gap-2">
        {overdueCount > 0 && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-rose-900/60">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>
              {overdueCount} {overdueCount === 1 ? 'task' : 'tasks'} carried over
            </span>
          </div>
        )}

        {totalTasks > 0 && completedTasks === totalTasks && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-900/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>All tasks completed! Great work today.</span>
          </div>
        )}
      </div>
    </header>
  );
};
