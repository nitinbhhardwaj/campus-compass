import React from 'react';
import { ProteinEntry } from '../types/protein';
import { Trash2, UtensilsCrossed } from 'lucide-react';
import { EmptyState } from '../../../components/EmptyState';
import { IconButton } from '../../../components/IconButton';

interface ProteinEntryListProps {
  entries: ProteinEntry[];
  onDelete: (id: string) => Promise<void>;
}

export const ProteinEntryList: React.FC<ProteinEntryListProps> = ({
  entries,
  onDelete,
}) => {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<UtensilsCrossed className="w-5 h-5" />}
        title="No protein logged today yet"
        description="Tap a quick preset above or log a custom entry."
      />
    );
  }

  return (
    <div
      className="mt-2 flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-0.5"
      role="list"
      aria-label="Today’s protein entries"
    >
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 text-xs"
          role="listitem"
        >
          <div className="flex items-baseline gap-2 truncate pr-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {entry.label}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-2xs tabular-nums">
              +{entry.grams}g
            </span>

            <IconButton
              onClick={() => onDelete(entry.id)}
              aria-label={`Delete ${entry.label} (${entry.grams}g)`}
              size="sm"
              variant="danger"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </IconButton>
          </div>
        </div>
      ))}
    </div>
  );
};
