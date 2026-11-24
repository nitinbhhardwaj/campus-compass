import React from 'react';
import { Task } from '../../../types/task';
import { TaskItem } from './TaskItem';
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
    return (
      <div
        style={{
          padding: '28px',
          border: '2px dashed var(--line)',
          borderRadius: '4px',
          textAlign: 'center',
          color: 'var(--muted)',
          background: 'var(--surface)',
          marginTop: '14px',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, fontSize: '15px' }}>
          {categoryFilter !== 'all'
            ? `No ${categoryFilter} tasks for today.`
            : 'No tasks scheduled for today.'}
        </p>
        {categoryFilter !== 'all' ? (
          <button
            type="button"
            className="chip"
            onClick={onClearCategoryFilter}
            style={{ marginTop: '14px', fontSize: '13px' }}
          >
            Show all tasks
          </button>
        ) : (
          <button
            type="button"
            className="chip"
            onClick={onOpenAddModal}
            style={{ marginTop: '14px', fontSize: '13px' }}
          >
            + Add your first task
          </button>
        )}
      </div>
    );
  }

  return (
    <ul className="rail" role="list" aria-label="Today's tasks">
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
    </ul>
  );
};
