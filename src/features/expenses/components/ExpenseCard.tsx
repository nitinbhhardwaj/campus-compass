import React, { useState } from 'react';
import { Expense, ExpenseCategory, CreateExpenseDTO } from '../types/expense';
import { BudgetStatus, CategoryWarning, formatPaiseToRupees } from '../logic/expenseLogic';
import { ExpenseForm } from './ExpenseForm';

interface ExpenseCardProps {
  selectedMonth: string;
  selectedMonthDisplay: string;
  totalSpentPaise: number;
  monthlyBudgetPaise: number;
  remainingBudgetPaise: number;
  usedPercent: number;
  status: BudgetStatus;
  categoryTotals: Record<ExpenseCategory, number>;
  categoryWarnings: CategoryWarning[];
  monthExpenses: Expense[];
  today: string;
  onAddExpense: (dto: CreateExpenseDTO) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onOpenSettings: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  selectedMonthDisplay,
  totalSpentPaise,
  monthlyBudgetPaise,
  remainingBudgetPaise,
  usedPercent,
  status,
  categoryTotals,
  categoryWarnings,
  monthExpenses,
  today,
  onAddExpense,
  onDeleteExpense,
  onPreviousMonth,
  onNextMonth,
  onOpenSettings,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const activeCategories = (Object.keys(categoryTotals) as ExpenseCategory[]).filter(
    (c) => (categoryTotals[c] || 0) > 0
  );

  return (
    <section className="block" aria-labelledby="mon">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <h2 id="mon" style={{ margin: 0 }}>Money, {selectedMonthDisplay}</h2>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onPreviousMonth}
            aria-label="Previous month"
            style={{
              border: '2px solid var(--ink)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              borderRadius: '999px',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Next month"
            style={{
              border: '2px solid var(--ink)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              borderRadius: '999px',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ›
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Budget settings"
            style={{
              border: 0,
              background: 'none',
              color: 'var(--ink)',
              font: '600 13px "Hanken Grotesk", sans-serif',
              cursor: 'pointer',
              marginLeft: '4px',
            }}
          >
            Settings
          </button>
        </div>
      </div>

      <div className="big" style={{ marginTop: '14px' }}>{formatPaiseToRupees(totalSpentPaise)}</div>
      <div className="sub">
        of {formatPaiseToRupees(monthlyBudgetPaise)} budget · {formatPaiseToRupees(remainingBudgetPaise)} left
      </div>

      <div className="bar" role="img" aria-label={`Budget ${usedPercent} percent used`}>
        <i style={{ width: `${Math.min(100, Math.max(0, usedPercent))}%` }}></i>
      </div>

      {status === 'warning' && (
        <div className="warn" style={{ marginTop: '4px' }}>
          Overall: {usedPercent}% of budget used
        </div>
      )}
      {status === 'over' && (
        <div className="warn" style={{ marginTop: '4px' }}>
          Over budget by {formatPaiseToRupees(totalSpentPaise - monthlyBudgetPaise)}
        </div>
      )}
      {categoryWarnings.map((w) => (
        <div key={w.category} className="warn" style={{ marginTop: '4px', textTransform: 'capitalize' }}>
          {w.category}: {w.percent}% of budget used
        </div>
      ))}

      <ul className="ledger" style={{ marginTop: '12px' }}>
        {activeCategories.map((cat) => (
          <li key={cat}>
            <span style={{ textTransform: 'capitalize' }}>{cat}</span>
            <span>{formatPaiseToRupees(categoryTotals[cat] || 0)}</span>
          </li>
        ))}
        {activeCategories.length === 0 && (
          <li style={{ color: 'var(--muted)', fontSize: '13.5px' }}>No spending recorded yet.</li>
        )}
      </ul>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <button
          type="button"
          className="chip"
          onClick={() => {
            setIsAddOpen(!isAddOpen);
            setIsHistoryOpen(false);
          }}
          style={{ fontSize: '13px' }}
        >
          {isAddOpen ? 'Close' : '+ Add Expense'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsHistoryOpen(!isHistoryOpen);
            setIsAddOpen(false);
          }}
          style={{
            border: 0,
            background: 'none',
            color: 'var(--ink)',
            font: '600 13px "Hanken Grotesk", sans-serif',
            cursor: 'pointer',
          }}
          aria-expanded={isHistoryOpen}
        >
          {isHistoryOpen ? 'Hide History' : `History (${monthExpenses.length})`}
        </button>
      </div>

      {isAddOpen && (
        <div style={{ marginTop: '14px', borderTop: '1px dashed var(--line)', paddingTop: '14px' }}>
          <ExpenseForm
            initialDate={today}
            onSubmit={async (dto) => {
              await onAddExpense(dto);
              setIsAddOpen(false);
            }}
            onClose={() => setIsAddOpen(false)}
          />
        </div>
      )}

      {isHistoryOpen && (
        <ul className="ledger" style={{ marginTop: '14px', maxHeight: '220px', overflowY: 'auto' }}>
          {monthExpenses.map((expense) => (
            <li key={expense.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
              <div>
                <strong>{expense.note}</strong>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', textTransform: 'capitalize' }}>
                  {expense.category} · {expense.date}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>{formatPaiseToRupees(expense.amountPaise)}</span>
                <button
                  type="button"
                  onClick={() => onDeleteExpense(expense.id)}
                  aria-label={`Delete ${expense.note}`}
                  style={{
                    border: 0,
                    background: 'none',
                    color: 'var(--danger)',
                    cursor: 'pointer',
                    fontSize: '18px',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            </li>
          ))}
          {monthExpenses.length === 0 && (
            <li style={{ color: 'var(--muted)', fontSize: '13.5px' }}>No expenses recorded for this month.</li>
          )}
        </ul>
      )}
    </section>
  );
};
