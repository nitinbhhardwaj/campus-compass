import React, { useState } from 'react';
import { PROTEIN_PRESETS, ProteinPreset } from '../constants/presets';
import { CreateProteinEntryDTO } from '../types/protein';
import { Button } from '../../../components/Button';
import { Plus } from 'lucide-react';

interface ProteinQuickAddProps {
  today: string;
  onAdd: (dto: CreateProteinEntryDTO) => Promise<void>;
}

export const ProteinQuickAdd: React.FC<ProteinQuickAddProps> = ({
  today,
  onAdd,
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customGrams, setCustomGrams] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePresetClick = async (preset: ProteinPreset) => {
    try {
      await onAdd({
        date: today,
        label: preset.label,
        grams: preset.grams,
      });
    } catch (err) {
      console.error('Failed to add preset:', err);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLabel = customLabel.trim();
    const parsedGrams = parseFloat(customGrams);

    if (!cleanLabel) {
      setCustomError('Please provide a description.');
      return;
    }
    if (isNaN(parsedGrams) || parsedGrams <= 0) {
      setCustomError('Enter a positive number of grams.');
      return;
    }

    try {
      setIsSubmitting(true);
      setCustomError(null);
      await onAdd({
        date: today,
        label: cleanLabel,
        grams: Math.round(parsedGrams * 10) / 10,
      });
      setCustomLabel('');
      setCustomGrams('');
      setShowCustom(false);
    } catch (err) {
      console.error('Failed to add custom entry:', err);
      setCustomError('Could not save entry. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-2">
      {/* Quick Add Presets: Horizontal Scrolling Chip Row with Emoji */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Quick-Add Presets (~approx)
        </span>
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1"
        >
          {showCustom ? 'Hide Custom' : '+ Custom Entry'}
        </button>
      </div>

      <div
        role="group"
        aria-label="Protein quick add presets"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
      >
        {PROTEIN_PRESETS.map((preset) => {
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/60 border border-slate-200/80 dark:border-slate-700 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
              aria-label={`Add ${preset.label}, approximately ${preset.grams} grams of protein`}
            >
              <Plus size={13} className="text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {preset.label}
              </span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700">
                ~{preset.grams}g
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom Entry Form */}
      {showCustom && (
        <form
          onSubmit={handleCustomSubmit}
          className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex flex-col gap-2.5 animate-in fade-in duration-150"
        >
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Log Custom Protein
          </div>
          {customError && (
            <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
              {customError}
            </div>
          )}
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="custom-protein-label" className="sr-only">
                Food item name
              </label>
              <input
                id="custom-protein-label"
                type="text"
                placeholder="e.g. Tofu bowl"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
            <div className="w-24">
              <label htmlFor="custom-protein-grams" className="sr-only">
                Protein in grams
              </label>
              <input
                id="custom-protein-grams"
                type="number"
                step="0.5"
                min="0.5"
                placeholder="Grams"
                value={customGrams}
                onChange={(e) => setCustomGrams(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log</span>
            </Button>
          </div>
        </form>
      )}

      {/* Explicit Disclaimer */}
      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 italic">
        * Preset protein values are approximate reference estimates.
      </div>
    </div>
  );
};
