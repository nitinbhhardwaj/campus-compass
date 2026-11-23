import React from 'react';
import { Expense, ExpenseCategory } from '../types/expense';
import { formatPaiseToRupees } from '../logic/expenseLogic';
import { Badge, BadgeProps } from '../../../components/Badge';
import { Trash2, Receipt } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => Promise<void>;
  selectedMonthDisplay: string;
}

const CATEGORY_STYLES: Record<ExpenseCategory, { label: string; variant: BadgeProps['variant'] }> = {
  food: { label: 'Food', variant: 'amber' },
  travel: { label: 'Travel', variant: 'slate' },
  rent: { label: 'Rent', variant: 'purple' },
  subscriptions: { label: 'Subs', variant: 'indigo' },
  study: { label: 'Study', variant: 'emerald' },
  other: { label: 'Other', variant: 'slate' },
};

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onDelete,
  selectedMonthDisplay,
}) => {
  if (expenses.length === 0) {
    return (
      <div className="py-6 text-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 mt-3">
        <Receipt className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
        <p className="text-xs text-slate-500 font-medium">
          No expenses recorded for {selectedMonthDisplay}.
        </p>
        <p className="text-[11px] text-slate-400">
          Use the quick-add tab to record student spending.
        </p>
      </div>
    );
  }

  return (
    <div
      className="mt-3 flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-0.5"
      role="list"
      aria-label={`Expenses for ${selectedMonthDisplay}`}
    >
      {expenses.map((expense) => {
        const cat = CATEGORY_STYLES[expense.category] || CATEGORY_STYLES.other;
        return (
          <div
            key={expense.id}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
            role="listitem"
          >
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-baseline gap-1.5 truncate">
                <span className="font-semibold text-slate-800 truncate">
                  {expense.note}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                <Badge variant={cat.variant} className="text-[10px] px-1.5 py-0">
                  {cat.label}
                </Badge>
                <span>{expense.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs">
                {formatPaiseToRupees(expense.amountPaise)}
              </span>

              {/* 44px minimum hit target touch button */}
              <button
                type="button"
                onClick={() => onDelete(expense.id)}
                className="relative p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 after:content-[''] after:absolute after:-inset-2"
                aria-label={`Delete ${expense.note} (${formatPaiseToRupees(expense.amountPaise)})`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
