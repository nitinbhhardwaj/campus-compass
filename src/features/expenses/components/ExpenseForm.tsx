import React, { useState } from 'react';
import { CreateExpenseDTO, ExpenseCategory } from '../types/expense';
import { rupeeStringToPaise } from '../logic/expenseLogic';
import { Button } from '../../../components/Button';

interface ExpenseFormProps {
  initialDate: string;
  onSubmit: (dto: CreateExpenseDTO) => Promise<void>;
  onClose?: () => void;
}

const CATEGORIES: { label: string; value: ExpenseCategory }[] = [
  { label: 'Food', value: 'food' },
  { label: 'Travel', value: 'travel' },
  { label: 'Rent', value: 'rent' },
  { label: 'Subscriptions', value: 'subscriptions' },
  { label: 'Study', value: 'study' },
  { label: 'Other', value: 'other' },
];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialDate,
  onSubmit,
  onClose,
}) => {
  const [rupeesInput, setRupeesInput] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(initialDate);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parseResult = rupeeStringToPaise(rupeesInput);

    if (!parseResult.isValid) {
      setError(parseResult.error || 'Please enter a valid amount.');
      return;
    }

    const cleanNote = note.trim();
    if (!cleanNote) {
      setError('Please provide a short description.');
      return;
    }

    if (!date) {
      setError('Please provide a date.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        amountPaise: parseResult.amountPaise,
        category,
        note: cleanNote,
        date,
      });
      setRupeesInput('');
      setNote('');
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to record expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      {error && (
        <div role="alert" className="p-3 text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
          {error}
        </div>
      )}

      {/* Amount Input (Rupees) */}
      <div>
        <label htmlFor="expense-amount" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
          Amount (₹ INR)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
            ₹
          </span>
          <input
            id="expense-amount"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 250 or 12.50"
            value={rupeesInput}
            onChange={(e) => setRupeesInput(e.target.value)}
            className="w-full pl-8 pr-3.5 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
            required
          />
        </div>
        <p className="mt-1 text-[10px] text-slate-400">
          Stored accurately as integer paise without floating-point errors.
        </p>
      </div>

      {/* Description / Note */}
      <div>
        <label htmlFor="expense-note" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
          Description
        </label>
        <input
          id="expense-note"
          type="text"
          placeholder="e.g. Canteen lunch, metro pass, textbook"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      {/* Category Selection */}
      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
          Category
        </span>
        <div role="radiogroup" aria-label="Expense Category" className="grid grid-cols-3 gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              role="radio"
              aria-checked={category === cat.value}
              onClick={() => setCategory(cat.value)}
              className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                category === cat.value
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <label htmlFor="expense-date" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
          Date
        </label>
        <input
          id="expense-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        {onClose && (
          <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
          {isSubmitting ? 'Recording...' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
};
