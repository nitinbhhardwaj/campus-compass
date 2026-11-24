import React from 'react';
import { TaskCategory } from '../../../types/task';

export type CategoryFilterType = TaskCategory | 'all';

interface CategoryFilterProps {
  selected: CategoryFilterType;
  onChange: (category: CategoryFilterType) => void;
  categoryCounts: Record<CategoryFilterType, number>;
}

const FILTER_ITEMS: { label: string; value: CategoryFilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Study', value: 'study' },
  { label: 'Gym', value: 'gym' },
  { label: 'Skincare', value: 'skincare' },
  { label: 'Chore', value: 'chore' },
  { label: 'Other', value: 'other' },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selected,
  onChange,
  categoryCounts,
}) => {
  return (
    <div
      role="tablist"
      aria-label="Filter tasks by category"
      className="chips"
      style={{ marginTop: 0, marginBottom: '20px', flexWrap: 'wrap' }}
    >
      {FILTER_ITEMS.map((item) => {
        const count = categoryCounts[item.value] || 0;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected === item.value}
            className={`chip ${selected === item.value ? 'active' : ''}`}
            onClick={() => onChange(item.value)}
          >
            {item.label} {count > 0 ? `(${count})` : ''}
          </button>
        );
      })}
    </div>
  );
};
