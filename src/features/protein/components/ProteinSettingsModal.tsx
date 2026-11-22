import React, { useState } from 'react';
import { ProteinSettings } from '../types/protein';
import { validateProteinSettings, defaultGoalFromWeight } from '../logic/proteinLogic';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';

interface ProteinSettingsModalProps {
  isOpen: boolean;
  currentSettings: ProteinSettings;
  onSave: (settings: ProteinSettings) => Promise<void>;
  onClose: () => void;
}

export const ProteinSettingsModal: React.FC<ProteinSettingsModalProps> = ({
  isOpen,
  currentSettings,
  onSave,
  onClose,
}) => {
  const [weightInput, setWeightInput] = useState(String(currentSettings.bodyWeightKg));
  const [goalInput, setGoalInput] = useState(String(currentSettings.goalGrams));
  const [isManualOverride, setIsManualOverride] = useState(
    currentSettings.goalGrams !== defaultGoalFromWeight(currentSettings.bodyWeightKg)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWeightChange = (val: string) => {
    setWeightInput(val);
    const parsed = parseFloat(val);
    if (!isManualOverride && !isNaN(parsed) && parsed > 0) {
      setGoalInput(String(defaultGoalFromWeight(parsed)));
    }
  };

  const handleOverrideToggle = (override: boolean) => {
    setIsManualOverride(override);
    if (!override) {
      const parsedWeight = parseFloat(weightInput);
      if (!isNaN(parsedWeight) && parsedWeight > 0) {
        setGoalInput(String(defaultGoalFromWeight(parsedWeight)));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedWeight = parseFloat(weightInput);
    const parsedGoal = parseFloat(goalInput);

    const validation = validateProteinSettings({
      bodyWeightKg: parsedWeight,
      goalGrams: parsedGoal,
    });

    if (!validation.isValid) {
      setErrors(validation.errors as Record<string, string>);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});
      await onSave({
        bodyWeightKg: parsedWeight,
        goalGrams: Math.round(parsedGoal),
      });
      onClose();
    } catch (err) {
      console.error(err);
      setErrors({ form: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Protein Target Settings">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errors.form && (
          <div role="alert" className="p-3 text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            {errors.form}
          </div>
        )}

        {/* Body Weight Input */}
        <div>
          <label htmlFor="protein-body-weight" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Body Weight (kg)
          </label>
          <input
            id="protein-body-weight"
            type="number"
            step="0.5"
            min="1"
            max="300"
            value={weightInput}
            onChange={(e) => handleWeightChange(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          {errors.bodyWeightKg && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.bodyWeightKg}</p>
          )}
          <p className="mt-1 text-[11px] text-slate-400">
            Standard baseline multiplier is 1.6g of protein per kg of body weight.
          </p>
        </div>

        {/* Goal Calculation & Custom Override */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">Daily Target (grams)</span>
            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={isManualOverride}
                onChange={(e) => handleOverrideToggle(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>Custom Target</span>
            </label>
          </div>

          <input
            id="protein-goal-grams"
            type="number"
            min="1"
            max="500"
            disabled={!isManualOverride}
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            className={`w-full px-3.5 py-2 text-sm rounded-xl border transition-all ${
              isManualOverride
                ? 'bg-white border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
            }`}
            required
          />
          {errors.goalGrams && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.goalGrams}</p>
          )}
          {!isManualOverride && (
            <p className="mt-1 text-[11px] text-slate-400">
              Auto-calculated from weight: {Math.round(parseFloat(weightInput || '0') * 1.6) || 0}g/day
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
