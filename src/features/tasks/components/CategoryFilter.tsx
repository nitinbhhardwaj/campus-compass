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
      role="group"
      aria-label="Filter tasks by category"
      className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-4"
    >
      {FILTER_ITEMS.map((item) => {
        const isSelected = selected === item.value;
        const count = categoryCounts[item.value] || 0;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            aria-pressed={isSelected}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
              isSelected
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{item.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected
                  ? 'bg-indigo-700/80 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
