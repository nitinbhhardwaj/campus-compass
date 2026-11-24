import React, { useState } from 'react';
import { WeeklySummary } from '../logic/taskLogic';
import { TaskCategory } from '../../../types/task';

interface WeeklySummaryCardProps {
  summary: WeeklySummary;
  weekStart: string;
  weekEnd: string;
}

export const WeeklySummaryCard: React.FC<WeeklySummaryCardProps> = ({
  summary,
  weekStart,
  weekEnd,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      style={{
        margin: '18px 0',
        border: '1px dashed var(--line)',
        padding: '12px 16px',
        borderRadius: '4px',
        background: 'var(--surface)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>
            This week: {summary.totalCompleted} completed
          </strong>
          <span style={{ fontSize: '12.5px', color: 'var(--muted)', marginLeft: '8px' }}>
            ({weekStart.slice(5)} to {weekEnd.slice(5)})
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            border: 0,
            background: 'none',
            color: 'var(--ink)',
            font: '600 12px "Hanken Grotesk", sans-serif',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Hide weekly breakdown' : 'Show weekly breakdown'}
        >
          {isExpanded ? 'Hide' : 'Details'}
        </button>
      </div>

      {isExpanded && (
        <ul className="ledger" style={{ marginTop: '10px' }}>
          {(Object.keys(summary.byCategory) as TaskCategory[]).map((cat) => (
            <li key={cat}>
              <span style={{ textTransform: 'capitalize' }}>{cat}</span>
              <span>{summary.byCategory[cat] || 0}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
