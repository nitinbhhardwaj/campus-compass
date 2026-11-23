import React from 'react';
import { TaskCategory } from '../../../types/task';
import { Chip } from '../../../components/Chip';

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
      role="group"
      aria-label="Filter tasks by category"
      className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-2"
    >
      {FILTER_ITEMS.map((item) => (
        <Chip
          key={item.value}
          isSelected={selected === item.value}
          count={categoryCounts[item.value] || 0}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </Chip>
      ))}
    </div>
  );
};
