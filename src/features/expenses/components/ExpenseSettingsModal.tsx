import React, { useState } from 'react';
import { ExpenseSettings, ExpenseCategory } from '../types/expense';
import { rupeeStringToPaise, formatPaiseToRupees } from '../logic/expenseLogic';
import { Modal } from '../../../components/Modal';

interface ExpenseSettingsModalProps {
  isOpen: boolean;
  currentSettings: ExpenseSettings;
  onSave: (settings: ExpenseSettings) => Promise<void>;
  onClose: () => void;
}

const CATEGORIES: { label: string; key: ExpenseCategory }[] = [
  { label: 'Food', key: 'food' },
  { label: 'Travel', key: 'travel' },
  { label: 'Rent', key: 'rent' },
  { label: 'Subscriptions', key: 'subscriptions' },
  { label: 'Study', key: 'study' },
  { label: 'Other', key: 'other' },
];

export const ExpenseSettingsModal: React.FC<ExpenseSettingsModalProps> = ({
  isOpen,
  currentSettings,
  onSave,
  onClose,
}) => {
  const [monthlyInput, setMonthlyInput] = useState(
    String(currentSettings.monthlyBudgetPaise / 100)
  );

  const [categoryInputs, setCategoryInputs] = useState<Record<ExpenseCategory, string>>(() => {
    const initial: Record<string, string> = {};
    for (const cat of CATEGORIES) {
      const budget = currentSettings.categoryBudgetsPaise?.[cat.key];
      initial[cat.key] = budget ? String(budget / 100) : '';
    }
    return initial as Record<ExpenseCategory, string>;
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategoryChange = (cat: ExpenseCategory, val: string) => {
    setCategoryInputs((prev) => ({ ...prev, [cat]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const monthlyParsed = rupeeStringToPaise(monthlyInput);
    if (!monthlyParsed.isValid) {
      setError(monthlyParsed.error || 'Please enter a valid monthly budget.');
      return;
    }

    const updatedCategoryBudgets: Partial<Record<ExpenseCategory, number>> = {};
    for (const cat of CATEGORIES) {
      const rawVal = categoryInputs[cat.key]?.trim();
      if (rawVal) {
        const parsed = rupeeStringToPaise(rawVal);
        if (!parsed.isValid) {
          setError(`Invalid amount for ${cat.label}: ${parsed.error}`);
          return;
        }
        updatedCategoryBudgets[cat.key] = parsed.amountPaise;
      }
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        monthlyBudgetPaise: monthlyParsed.amountPaise,
        categoryBudgetsPaise: updatedCategoryBudgets,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to save budget settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Monthly Budget Settings">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {error && (
          <div className="warn" role="alert">
            {error}
          </div>
        )}

        {/* Overall Monthly Budget */}
        <div>
          <label htmlFor="overall-monthly-budget" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
            Overall Monthly Budget (₹ INR)
          </label>
          <input
            id="overall-monthly-budget"
            type="text"
            inputMode="decimal"
            value={monthlyInput}
            onChange={(e) => setMonthlyInput(e.target.value)}
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
          <p className="sub" style={{ margin: '4px 0 0' }}>
            Current: {formatPaiseToRupees(currentSettings.monthlyBudgetPaise)}
          </p>
        </div>

        {/* Optional Category Budgets */}
        <div style={{ padding: '14px', border: '1px dashed var(--line)', borderRadius: '4px', background: 'var(--paper)' }}>
          <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>
            Per-Category Budgets (Optional)
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            {CATEGORIES.map((cat) => (
              <div key={cat.key}>
                <label htmlFor={`budget-${cat.key}`} style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>
                  {cat.label}
                </label>
                <input
                  id={`budget-${cat.key}`}
                  type="text"
                  inputMode="decimal"
                  placeholder="None"
                  value={categoryInputs[cat.key]}
                  onChange={(e) => handleCategoryChange(cat.key, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid var(--ink)',
                    borderRadius: '4px',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    font: '13px "Hanken Grotesk"',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
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
            {isSubmitting ? 'Saving...' : 'Save Budgets'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
