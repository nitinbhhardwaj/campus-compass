import React, { useState } from 'react';
import { CreateTaskDTO, TaskCategory, TaskPriority, TaskRecurrence } from '../../../types/task';
import { Button } from '../../../components/Button';

interface TaskFormProps {
  initialDueDate: string;
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
  onSubmit,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('study');
  const [priority, setPriority] = useState<TaskPriority>(1);
  const [recurrence, setRecurrence] = useState<TaskRecurrence>('none');
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Please provide a task title.');
      return;
    }
    if (!dueDate) {
      setError('Please provide a due date.');
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
      setError('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
          {error}
        </div>
      )}

      {/* Task Title Input */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          Task Description
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Read CS 240 Ch. 3 or Push Day"
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          autoFocus
        />
      </div>

      {/* Category Pills */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          Category
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`py-2 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                category === cat.value
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Priority Selector */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          Priority
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                priority === p.value
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-bold">{p.label}</div>
              <div
                className={`text-[10px] ${
                  priority === p.value ? 'text-indigo-100' : 'text-slate-400'
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Repeat
          </label>
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5">
            {RECURRENCES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRecurrence(r.value)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg text-center transition-all cursor-pointer ${
                  recurrence === r.value
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            {recurrence === 'none' ? 'Due Date' : 'Start Date'}
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
          {isSubmitting ? 'Saving...' : 'Add to Schedule'}
        </Button>
      </div>
    </form>
  );
};
