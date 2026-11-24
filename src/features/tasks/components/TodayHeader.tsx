import React from 'react';

interface TodayHeaderProps {
  today: string;
  totalTasks: number;
  completedTasks: number;
  overdueCount: number;
  completionPercentage: number;
  onOpenAddModal: () => void;
}

export const TodayHeader: React.FC<TodayHeaderProps> = ({
  totalTasks,
  completedTasks,
  overdueCount,
  onOpenAddModal,
}) => {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <h2 id="day" style={{ margin: 0 }}>
            Your day
          </h2>
          <span className="sub" style={{ margin: 0 }}>
            {completedTasks} of {totalTasks} done
          </span>
        </div>
        <button
          type="button"
          className="chip"
          onClick={onOpenAddModal}
          aria-label="Add new task"
        >
          + Add task
        </button>
      </div>

      {overdueCount > 0 && (
        <div className="warn" style={{ marginTop: '8px' }}>
          {overdueCount} {overdueCount === 1 ? 'task' : 'tasks'} overdue
        </div>
      )}
    </div>
  );
};
