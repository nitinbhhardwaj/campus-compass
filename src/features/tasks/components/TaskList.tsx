import React from 'react';
import { Task } from '../../../types/task';
import { TaskItem } from './TaskItem';
import { CheckCircle2, Filter } from 'lucide-react';
import { CategoryFilterType } from './CategoryFilter';

interface TaskListProps {
  tasks: Task[];
  today: string;
  categoryFilter: CategoryFilterType;
  onClearCategoryFilter: () => void;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  today,
  categoryFilter,
  onClearCategoryFilter,
  onToggle,
  onEdit,
  onDelete,
  onOpenAddModal,
}) => {
  if (tasks.length === 0) {
    if (categoryFilter !== 'all') {
      return (
        <div className="text-center py-10 px-4 rounded-3xl border-2 border-dashed border-slate-200 bg-white/50">
          <div className="w-10 h-10 mx-auto mb-2.5 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
            <Filter className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">
            No {categoryFilter} tasks for today
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-3">
            None of your today tasks are tagged as {categoryFilter}.
          </p>
          <button
            type="button"
            onClick={onClearCategoryFilter}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Show all categories
          </button>
        </div>
      );
    }

    return (
      <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-slate-200 bg-white/50">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          No tasks scheduled for today
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
          Enjoy the breather, or add a study block, workout session, or chore.
        </p>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          + Add your first task
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5" role="list" aria-label="Today's tasks">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          today={today}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
