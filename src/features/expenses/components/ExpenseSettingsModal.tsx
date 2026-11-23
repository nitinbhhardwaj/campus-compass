import React, { useState } from 'react';
import { ExpenseSettings, ExpenseCategory } from '../types/expense';
import { rupeeStringToPaise, formatPaiseToRupees } from '../logic/expenseLogic';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';

interface ExpenseSettingsModalProps {
  isOpen: boolean;
  currentSettings: ExpenseSettings;
  onSave: (settings: ExpenseSettings) => Promise<void>;
  onClose: () => void;
}

const CATEGORIES: { label: string; key: ExpenseCategory }[] = [
  { label: 'Food', key: 'food' },
  { label: 'Travel', key: 'travel' },
  { label: 'Rent / Accommodation', key: 'rent' },
  { label: 'Subscriptions', key: 'subscriptions' },
  { label: 'Study & Academics', key: 'study' },
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div role="alert" className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
            {error}
          </div>
        )}

        {/* Overall Monthly Budget */}
        <div>
          <label htmlFor="overall-monthly-budget" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
            Overall Monthly Budget (₹ INR)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 dark:text-slate-500">
              ₹
            </span>
            <input
              id="overall-monthly-budget"
              type="text"
              inputMode="decimal"
              value={monthlyInput}
              onChange={(e) => setMonthlyInput(e.target.value)}
              className="w-full pl-8 pr-3.5 py-2.5 text-sm font-semibold tabular-nums bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            Current: <span className="tabular-nums font-semibold">{formatPaiseToRupees(currentSettings.monthlyBudgetPaise)}</span>
          </p>
        </div>

        {/* Optional Category Budgets */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
            Per-Category Budgets (Optional)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CATEGORIES.map((cat) => (
              <div key={cat.key}>
                <label htmlFor={`budget-${cat.key}`} className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {cat.label}
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-slate-500">
                    ₹
                  </span>
                  <input
                    id={`budget-${cat.key}`}
                    type="text"
                    inputMode="decimal"
                    placeholder="None"
                    value={categoryInputs[cat.key]}
                    onChange={(e) => handleCategoryChange(cat.key, e.target.value)}
                    className="w-full pl-6 pr-2.5 py-1.5 text-xs tabular-nums bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Budgets'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
