import React from 'react';
import { Task } from '../../../types/task';
import { isTaskCompletedOnDate, isTaskOverdue, computeStreak } from '../logic/taskLogic';

interface TaskItemProps {
  task: Task;
  today: string;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  today,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const isCompleted = isTaskCompletedOnDate(task, today);
  const overdue = isTaskOverdue(task, today);
  const isRecurring = task.recurrence !== 'none';
  const streak = isRecurring ? computeStreak(task, today) : 0;

  // Determine time badge matching mockup rail slot (Now, 5:30, Night, Late, etc.)
  const timeSlot = overdue
    ? 'Late'
    : task.priority === 1
    ? 'Now'
    : task.category === 'gym'
    ? '5:30'
    : task.category === 'skincare'
    ? 'Night'
    : task.category === 'chore'
    ? 'Day'
    : `P${task.priority}`;

  const categoryLabel = task.category.charAt(0).toUpperCase() + task.category.slice(1);

  return (
    <li className={task.priority === 1 ? 'p1' : ''}>
      <span className="time">{timeSlot}</span>
      <div className="t">
        <strong>{task.title}</strong>
        {overdue ? (
          <span className="late">{task.dueDate} · overdue</span>
        ) : (
          <span>
            {categoryLabel}
            {isRecurring
              ? ` · ${task.recurrence === 'daily' ? 'Daily' : 'Weekly'}${streak > 0 ? ` · ${streak} day streak` : ''}`
              : ` · due ${task.dueDate === today ? 'today' : task.dueDate}`}
          </span>
        )}
      </div>

      {/* Accessible edit & delete actions on the rail */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Edit ${task.title}`}
          style={{
            border: '1px solid var(--ink)',
            background: 'var(--surface)',
            color: 'var(--ink)',
            font: '600 12px "Hanken Grotesk", sans-serif',
            padding: '2px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            minHeight: '28px',
          }}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete ${task.title}`}
          style={{
            border: '1px solid var(--danger)',
            background: 'var(--surface)',
            color: 'var(--danger)',
            font: '600 12px "Hanken Grotesk", sans-serif',
            padding: '2px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            minHeight: '28px',
          }}
        >
          ×
        </button>
      </div>

      <input
        className="chk"
        type="checkbox"
        checked={isCompleted}
        onChange={() => onToggle(task.id)}
        aria-label={isCompleted ? `Mark ${task.title} incomplete` : `Mark ${task.title} done`}
      />
    </li>
  );
};
