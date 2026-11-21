import React from 'react';
import { Task } from '../../../types/task';
import { TaskItem } from './TaskItem';
import { CheckCircle2 } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  today: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  today,
  onToggle,
  onDelete,
  onOpenAddModal,
}) => {
  if (tasks.length === 0) {
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
          onClick={onOpenAddModal}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 cursor-pointer"
        >
          + Add your first task
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          today={today}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
