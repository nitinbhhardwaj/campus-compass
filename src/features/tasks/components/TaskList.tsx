import React from 'react';
import { Task } from '../../../types/task';
import { TaskItem } from './TaskItem';
import { CheckCircle2, Filter } from 'lucide-react';
import { CategoryFilterType } from './CategoryFilter';
import { EmptyState } from '../../../components/EmptyState';
import { Button } from '../../../components/Button';

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
        <EmptyState
          icon={<Filter className="w-5 h-5" />}
          title={`No ${categoryFilter} tasks for today`}
          description={`None of your scheduled items today match the ${categoryFilter} category.`}
          action={
            <Button variant="ghost" size="sm" onClick={onClearCategoryFilter}>
              Show all categories
            </Button>
          }
        />
      );
    }

    return (
      <EmptyState
        icon={<CheckCircle2 className="w-5 h-5 text-indigo-500" />}
        title="No tasks scheduled for today"
        description="Enjoy the breather, or schedule a study block, workout session, or chore."
        action={
          <Button variant="primary" size="sm" onClick={onOpenAddModal}>
            + Add your first task
          </Button>
        }
      />
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
