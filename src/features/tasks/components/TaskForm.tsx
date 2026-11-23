import React, { useState, useEffect } from 'react';
import { CreateTaskDTO, Task, TaskCategory, TaskPriority, TaskRecurrence } from '../../../types/task';
import { Button } from '../../../components/Button';

interface TaskFormProps {
  initialDueDate: string;
  taskToEdit?: Task | null;
  onSubmit: (dto: CreateTaskDTO) => Promise<void>;
  onClose: () => void;
}

const CATEGORIES: { label: string; value: TaskCategory }[] = [
  { label: 'Study', value: 'study' },
  { label: 'Gym', value: 'gym' },
  { label: 'Skincare', value: 'skincare' },
  { label: 'Chore', value: 'chore' },
  { label: 'Other', value: 'other' },
];

const PRIORITIES: { label: string; value: TaskPriority; desc: string }[] = [
  { label: 'P1 High', value: 1, desc: 'Urgent' },
  { label: 'P2 Med', value: 2, desc: 'Normal' },
  { label: 'P3 Low', value: 3, desc: 'Optional' },
];

const RECURRENCES: { label: string; value: TaskRecurrence }[] = [
  { label: 'Once', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
];

export const TaskForm: React.FC<TaskFormProps> = ({
  initialDueDate,
  taskToEdit,
  onSubmit,
  onClose,
}) => {
  const isEditing = Boolean(taskToEdit);

  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [category, setCategory] = useState<TaskCategory>(taskToEdit?.category || 'study');
  const [priority, setPriority] = useState<TaskPriority>(taskToEdit?.priority || 1);
  const [recurrence, setRecurrence] = useState<TaskRecurrence>(taskToEdit?.recurrence || 'none');
  const [dueDate, setDueDate] = useState(taskToEdit?.dueDate || initialDueDate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setCategory(taskToEdit.category);
      setPriority(taskToEdit.priority);
      setRecurrence(taskToEdit.recurrence);
      setDueDate(taskToEdit.dueDate);
    }
  }, [taskToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Please provide a task title.');
      return;
    }
    if (!dueDate) {
      setError('Please provide a valid date.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        title: cleanTitle,
        category,
        priority,
        dueDate,
        recurrence,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to save task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div
          role="alert"
          className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
        >
          {error}
        </div>
      )}

      {/* Task Title Input */}
      <div>
        <label
          htmlFor="task-title"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
        >
          Task Description
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Read CS 240 Ch. 3 or Push Day"
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          autoFocus
          required
        />
      </div>

      {/* Category Pills */}
      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
          Category
        </span>
        <div
          role="radiogroup"
          aria-label="Category selection"
          className="grid grid-cols-3 sm:grid-cols-5 gap-1.5"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              role="radio"
              aria-checked={category === cat.value}
              onClick={() => setCategory(cat.value)}
              className={`py-2 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                category === cat.value
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold shadow-2xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Priority Selector */}
      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
          Priority Level
        </span>
        <div
          role="radiogroup"
          aria-label="Priority level selection"
          className="grid grid-cols-3 gap-2"
        >
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              role="radio"
              aria-checked={priority === p.value}
              onClick={() => setPriority(p.value)}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                priority === p.value
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <div className="text-xs font-bold">{p.label}</div>
              <div
                className={`text-[10px] ${
                  priority === p.value ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {p.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Schedule / Recurrence & Due Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Recurrence
          </span>
          <div
            role="radiogroup"
            aria-label="Recurrence selection"
            className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5"
          >
            {RECURRENCES.map((r) => (
              <button
                key={r.value}
                type="button"
                role="radio"
                aria-checked={recurrence === r.value}
                onClick={() => setRecurrence(r.value)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  recurrence === r.value
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="task-due-date"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
          >
            {recurrence === 'none' ? 'Due Date' : 'Start Date'}
          </label>
          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            required
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Saving...'
            : isEditing
            ? 'Save Changes'
            : 'Add to Schedule'}
        </Button>
      </div>
    </form>
  );
};
