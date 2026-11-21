import React from 'react';
import { Check, Trash2, Repeat, AlertCircle, Pencil, Flame } from 'lucide-react';
import { Task, TaskCategory, TaskPriority } from '../../../types/task';
import { Card } from '../../../components/Card';
import { Badge, BadgeProps } from '../../../components/Badge';
import { isTaskCompletedOnDate, isTaskOverdue, computeStreak } from '../logic/taskLogic';

interface TaskItemProps {
  task: Task;
  today: string;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_CONFIG: Record<
  TaskCategory,
  { label: string; variant: BadgeProps['variant'] }
> = {
  study: { label: 'Study', variant: 'indigo' },
  gym: { label: 'Gym', variant: 'emerald' },
  skincare: { label: 'Skincare', variant: 'rose' },
  chore: { label: 'Chore', variant: 'amber' },
  other: { label: 'Other', variant: 'slate' },
};

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; variant: BadgeProps['variant'] }
> = {
  1: { label: 'P1 High', variant: 'rose' },
  2: { label: 'P2 Med', variant: 'amber' },
  3: { label: 'P3 Low', variant: 'slate' },
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  today,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const isCompleted = isTaskCompletedOnDate(task, today);
  const overdue = isTaskOverdue(task, today);
  const categoryInfo = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.other;
  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG[3];
  const isRecurring = task.recurrence !== 'none';
  const streak = isRecurring ? computeStreak(task, today) : 0;

  return (
    <Card
      className={`p-3.5 sm:p-4 transition-all duration-150 ${
        isCompleted
          ? 'bg-slate-50/80 border-slate-200/60 opacity-65'
          : overdue
          ? 'border-rose-300 bg-rose-50/20 shadow-xs'
          : 'hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Generous touch target checkbox (min 44px hit area for mobile) */}
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          className="relative mt-0.5 flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 after:content-[''] after:absolute after:-inset-2.5"
          style={{
            borderColor: isCompleted ? '#4f46e5' : '#cbd5e1',
            backgroundColor: isCompleted ? '#4f46e5' : '#ffffff',
          }}
          aria-label={isCompleted ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as completed`}
        >
          {isCompleted && <Check className="w-4 h-4 text-white stroke-[3]" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h3
              className={`text-sm sm:text-base font-semibold leading-snug break-words transition-colors ${
                isCompleted
                  ? 'line-through text-slate-400 font-normal'
                  : 'text-slate-800'
              }`}
            >
              {task.title}
            </h3>

            {/* Quick Actions (Edit & Delete) */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={`Edit task ${task.title}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
                aria-label={`Delete task ${task.title}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Badges Metadata Row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {/* Priority Badge */}
            <Badge variant={priorityInfo.variant}>
              {priorityInfo.label}
            </Badge>

            {/* Category Badge */}
            <Badge variant={categoryInfo.variant}>
              {categoryInfo.label}
            </Badge>

            {/* Recurrence Indicator */}
            {isRecurring && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                <Repeat className="w-3 h-3 text-slate-400" />
                {task.recurrence === 'daily' ? 'Daily' : 'Weekly'}
              </span>
            )}

            {/* Habit Streak Badge */}
            {isRecurring && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  streak > 0
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}
                title={`Current streak: ${streak} ${task.recurrence === 'daily' ? 'day(s)' : 'week(s)'}`}
              >
                <Flame className={`w-3 h-3 ${streak > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                {streak} {task.recurrence === 'daily' ? 'd' : 'w'} streak
              </span>
            )}

            {/* Overdue Warning */}
            {overdue && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                <AlertCircle className="w-3 h-3" />
                Overdue ({task.dueDate})
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
