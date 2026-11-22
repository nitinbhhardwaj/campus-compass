import React from 'react';
import { ProteinEntry } from '../types/protein';
import { Trash2, UtensilsCrossed } from 'lucide-react';

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
      <div className="py-6 text-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 mt-3">
        <UtensilsCrossed className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
        <p className="text-xs text-slate-500 font-medium">
          No protein logged for today yet.
        </p>
        <p className="text-[11px] text-slate-400">
          Tap a preset above or add a custom entry.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-0.5" role="list" aria-label="Today's protein entries">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
          role="listitem"
        >
          <div className="flex items-baseline gap-2 truncate pr-2">
            <span className="font-semibold text-slate-800 truncate">
              {entry.label}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs">
              +{entry.grams}g
            </span>

            {/* 44px minimum hit target touch button */}
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              className="relative p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 after:content-[''] after:absolute after:-inset-2"
              aria-label={`Delete ${entry.label} (${entry.grams}g)`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
