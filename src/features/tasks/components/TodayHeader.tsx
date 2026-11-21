import React from 'react';
import { Plus, AlertTriangle, CalendarDays, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/Button';
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
    <header className="mb-6">
      {/* Date & Quick Add Row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
          <CalendarDays className="w-4 h-4 text-indigo-500" />
          <span>{formatDisplayDate(today)}</span>
        </div>
        <Button
          onClick={onOpenAddModal}
          size="sm"
          className="shadow-sm shadow-indigo-200"
          aria-label="Add new task"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </Button>
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Today's Plan
        </h1>
        <div className="text-xs font-medium text-slate-500">
          <span className="font-semibold text-slate-800">{completedTasks}</span> of{' '}
          <span className="font-semibold text-slate-800">{totalTasks}</span> done
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden mb-3">
        <div
          className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Status Badges Row (Overdue Alert & All Done Celebration) */}
      <div className="flex flex-wrap items-center gap-2">
        {overdueCount > 0 && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              {overdueCount} {overdueCount === 1 ? 'task' : 'tasks'} carried over
            </span>
          </div>
        )}

        {totalTasks > 0 && completedTasks === totalTasks && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All tasks completed! Great work today.</span>
          </div>
        )}
      </div>
    </header>
  );
};
