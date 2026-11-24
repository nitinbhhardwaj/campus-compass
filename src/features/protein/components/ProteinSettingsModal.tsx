import React, { useState } from 'react';
import { ProteinSettings } from '../types/protein';
import { validateProteinSettings, defaultGoalFromWeight } from '../logic/proteinLogic';
import { Modal } from '../../../components/Modal';

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
        dietPreference: currentSettings.dietPreference || 'veg',
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
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {errors.form && (
          <div className="warn" role="alert">
            {errors.form}
          </div>
        )}

        {/* Body Weight Input */}
        <div>
          <label htmlFor="protein-body-weight" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
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
            required
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '2px solid var(--ink)',
              borderRadius: '4px',
              background: 'var(--surface)',
              color: 'var(--text)',
              font: '600 15px "Hanken Grotesk", sans-serif',
            }}
          />
          {errors.bodyWeightKg && (
            <p className="warn" style={{ marginTop: '4px' }}>{errors.bodyWeightKg}</p>
          )}
          <p className="sub" style={{ margin: '4px 0 0' }}>
            Standard multiplier is 1.6g protein per kg of body weight.
          </p>
        </div>

        {/* Goal Calculation & Custom Override */}
        <div style={{ padding: '14px', border: '1px dashed var(--line)', borderRadius: '4px', background: 'var(--paper)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Daily Target (grams)</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isManualOverride}
                onChange={(e) => handleOverrideToggle(e.target.checked)}
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
            required
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '2px solid var(--ink)',
              borderRadius: '4px',
              background: isManualOverride ? 'var(--surface)' : 'var(--paper)',
              color: 'var(--text)',
              font: '600 15px "Hanken Grotesk", sans-serif',
              opacity: isManualOverride ? 1 : 0.6,
            }}
          />
          {errors.goalGrams && (
            <p className="warn" style={{ marginTop: '4px' }}>{errors.goalGrams}</p>
          )}
          {!isManualOverride && (
            <p className="sub" style={{ margin: '4px 0 0' }}>
              Auto-calculated from weight: {Math.round(parseFloat(weightInput || '0') * 1.6) || 0}g/day
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              border: 0,
              background: 'none',
              color: 'var(--muted)',
              font: '600 14px "Hanken Grotesk"',
              padding: '0 12px',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="chip active"
            style={{ minHeight: '44px' }}
          >
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
