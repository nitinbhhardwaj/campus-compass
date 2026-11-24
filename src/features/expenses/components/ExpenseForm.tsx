import React, { useState } from 'react';
import { CreateExpenseDTO, ExpenseCategory } from '../types/expense';
import { rupeeStringToPaise } from '../logic/expenseLogic';

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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {error && (
        <div className="warn" role="alert">
          {error}
        </div>
      )}

      {/* Amount Input */}
      <div>
        <label htmlFor="expense-amount" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
          Amount (₹ INR)
        </label>
        <input
          id="expense-amount"
          type="text"
          inputMode="decimal"
          placeholder="e.g. 250 or 12.50"
          value={rupeesInput}
          onChange={(e) => setRupeesInput(e.target.value)}
          required
          autoFocus
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
      </div>

      {/* Description / Note */}
      <div>
        <label htmlFor="expense-note" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
          Description
        </label>
        <input
          id="expense-note"
          type="text"
          placeholder="e.g. Mess lunch, metro card, notebook"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '2px solid var(--ink)',
            borderRadius: '4px',
            background: 'var(--surface)',
            color: 'var(--text)',
            font: '14px "Hanken Grotesk", sans-serif',
          }}
        />
      </div>

      {/* Category Selection */}
      <div>
        <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px' }}>
          Category
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }} role="radiogroup" aria-label="Expense Category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              role="radio"
              aria-checked={category === cat.value}
              onClick={() => setCategory(cat.value)}
              className={`chip ${category === cat.value ? 'active' : ''}`}
              style={{ minHeight: '36px', padding: '0 12px', fontSize: '13px' }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <label htmlFor="expense-date" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
          Date
        </label>
        <input
          id="expense-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '2px solid var(--ink)',
            borderRadius: '4px',
            background: 'var(--surface)',
            color: 'var(--text)',
            font: '14px "Hanken Grotesk", sans-serif',
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
        {onClose && (
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
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="chip active"
          style={{ minHeight: '44px' }}
        >
          {isSubmitting ? 'Recording...' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
};
