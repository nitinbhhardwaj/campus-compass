import React, { useState, useEffect } from 'react';
import { CreateTaskDTO, Task, TaskCategory, TaskPriority, TaskRecurrence } from '../../../types/task';

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

const PRIORITIES: { label: string; value: TaskPriority }[] = [
  { label: 'P1 High', value: 1 },
  { label: 'P2 Med', value: 2 },
  { label: 'P3 Low', value: 3 },
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {error && (
        <div className="warn" role="alert">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="task-title"
          style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}
        >
          Task Description
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. DBMS assignment, Q3 to Q6"
          required
          autoFocus
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '2px solid var(--ink)',
            borderRadius: '4px',
            background: 'var(--surface)',
            color: 'var(--text)',
            font: '600 15px "Hanken Grotesk", sans-serif',
          }}
        />
      </div>

      {/* Category Selection */}
      <div>
        <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px' }}>
          Category
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }} role="radiogroup" aria-label="Category selection">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              role="radio"
              aria-checked={category === cat.value}
              onClick={() => setCategory(cat.value)}
              className={`chip ${category === cat.value ? 'active' : ''}`}
              style={{ minHeight: '38px', padding: '0 12px', fontSize: '13px' }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Priority Selection */}
      <div>
        <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px' }}>
          Priority
        </span>
        <div style={{ display: 'flex', gap: '6px' }} role="radiogroup" aria-label="Priority level selection">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              role="radio"
              aria-checked={priority === p.value}
              onClick={() => setPriority(p.value)}
              className={`chip ${priority === p.value ? 'active' : ''}`}
              style={{ minHeight: '44px', flex: 1, fontSize: '13px' }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recurrence & Due Date */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px' }}>
            Recurrence
          </span>
          <div style={{ display: 'flex', gap: '4px' }} role="radiogroup" aria-label="Recurrence selection">
            {RECURRENCES.map((r) => (
              <button
                key={r.value}
                type="button"
                role="radio"
                aria-checked={recurrence === r.value}
                onClick={() => setRecurrence(r.value)}
                className={`chip ${recurrence === r.value ? 'active' : ''}`}
                style={{ minHeight: '36px', flex: 1, padding: '0 8px', fontSize: '12px' }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="task-due-date"
            style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px' }}
          >
            {recurrence === 'none' ? 'Due Date' : 'Start Date'}
          </label>
          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '2px solid var(--ink)',
              borderRadius: '4px',
              background: 'var(--surface)',
              color: 'var(--text)',
              font: '13px "Hanken Grotesk", sans-serif',
              minHeight: '36px',
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          style={{
            border: 0,
            background: 'none',
            color: 'var(--muted)',
            font: '600 14px "Hanken Grotesk", sans-serif',
            padding: '0 12px',
            cursor: 'pointer',
            minHeight: '44px',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="chip active"
          style={{ minHeight: '44px' }}
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add to Schedule'}
        </button>
      </div>
    </form>
  );
};
