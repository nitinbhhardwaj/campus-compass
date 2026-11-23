import React from 'react';
import {
  Check,
  Repeat,
  AlertCircle,
  Pencil,
  Trash2,
  Flame,
  BookOpen,
  Dumbbell,
  Sparkles,
  CheckCircle,
  Folder,
} from 'lucide-react';
import { Task, TaskCategory, TaskPriority } from '../../../types/task';
import { Card } from '../../../components/Card';
import { Badge, BadgeProps } from '../../../components/Badge';
import { IconButton } from '../../../components/IconButton';
import { isTaskCompletedOnDate, isTaskOverdue, computeStreak } from '../logic/taskLogic';

interface TaskItemProps {
  task: Task;
  today: string;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_META: Record<
  TaskCategory,
  { label: string; icon: React.FC<{ className?: string }>; dotColor: string; variant: BadgeProps['variant'] }
> = {
  study: { label: 'Study', icon: BookOpen, dotColor: 'bg-indigo-500', variant: 'indigo' },
  gym: { label: 'Gym', icon: Dumbbell, dotColor: 'bg-emerald-500', variant: 'emerald' },
  skincare: { label: 'Skincare', icon: Sparkles, dotColor: 'bg-rose-400', variant: 'rose' },
  chore: { label: 'Chore', icon: CheckCircle, dotColor: 'bg-amber-500', variant: 'amber' },
  other: { label: 'Other', icon: Folder, dotColor: 'bg-slate-400', variant: 'slate' },
};

const PRIORITY_META: Record<TaskPriority, { label: string; variant: BadgeProps['variant'] }> = {
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
  const cat = CATEGORY_META[task.category] || CATEGORY_META.other;
  const prio = PRIORITY_META[task.priority] || PRIORITY_META[3];
  const isRecurring = task.recurrence !== 'none';
  const streak = isRecurring ? computeStreak(task, today) : 0;
  const CategoryIcon = cat.icon;

  return (
    <Card
      className={`group p-3.5 sm:p-4 transition-all duration-150 ${
        isCompleted
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60'
          : overdue
          ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/25 dark:bg-rose-950/20'
          : 'hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Custom Animated Checkbox */}
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          className={`relative mt-0.5 flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg border-2 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 after:content-[''] after:absolute after:-inset-2 ${
            isCompleted
              ? 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-indigo-400'
          }`}
          aria-label={isCompleted ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as completed`}
        >
          {isCompleted && (
            <Check className="w-3.5 h-3.5 text-white stroke-[3] animate-in zoom-in-75 duration-150" />
          )}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Dot */}
              <span className={`w-2 h-2 rounded-full ${cat.dotColor} flex-shrink-0`} aria-hidden="true" />

              <h3
                className={`text-sm sm:text-base leading-snug break-words transition-all duration-150 ${
                  isCompleted
                    ? 'line-through text-slate-400 dark:text-slate-500 font-normal'
                    : 'text-slate-900 dark:text-slate-100 font-semibold'
                }`}
              >
                {task.title}
              </h3>
            </div>

            {/* Hover / Swipe Action Buttons */}
            <div className="flex items-center gap-0.5 flex-shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <IconButton
                onClick={() => onEdit(task)}
                aria-label={`Edit task ${task.title}`}
                size="sm"
                variant="ghost"
              >
                <Pencil className="w-3.5 h-3.5" />
              </IconButton>
              <IconButton
                onClick={() => onDelete(task.id)}
                aria-label={`Delete task ${task.title}`}
                size="sm"
                variant="danger"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </IconButton>
            </div>
          </div>

          {/* Badges & Meta Row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <Badge variant={prio.variant}>{prio.label}</Badge>
            <Badge variant={cat.variant} className="flex items-center gap-1">
              <CategoryIcon className="w-3 h-3" />
              <span>{cat.label}</span>
            </Badge>

            {/* Recurrence Pill */}
            {isRecurring && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                <Repeat className="w-3 h-3 text-slate-400" />
                {task.recurrence === 'daily' ? 'Daily' : 'Weekly'}
              </span>
            )}

            {/* Habit Streak Badge */}
            {isRecurring && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  streak > 0
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
                title={`Current streak: ${streak} ${task.recurrence === 'daily' ? 'day(s)' : 'week(s)'}`}
              >
                <Flame className={`w-3 h-3 ${streak > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                {streak} {task.recurrence === 'daily' ? 'd' : 'w'} streak
              </span>
            )}

            {/* Overdue Alert Badge */}
            {overdue && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/60">
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
