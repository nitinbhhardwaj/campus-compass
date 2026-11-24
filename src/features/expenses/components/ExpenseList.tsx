import React from 'react';
import { Expense, ExpenseCategory } from '../types/expense';
import { formatPaiseToRupees } from '../logic/expenseLogic';
import { Badge, BadgeProps } from '../../../components/Badge';
import { IconButton } from '../../../components/IconButton';
import { EmptyState } from '../../../components/EmptyState';
import { Trash2, Receipt } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => Promise<void>;
  selectedMonthDisplay: string;
}

const CATEGORY_STYLES: Record<ExpenseCategory, { label: string; variant: BadgeProps['variant'] }> = {
  food: { label: 'Food', variant: 'amber' },
  travel: { label: 'Travel', variant: 'slate' },
  rent: { label: 'Rent', variant: 'slate' },
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
      <EmptyState
        icon={<Receipt className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
        title={`No expenses in ${selectedMonthDisplay}`}
        description="Tap Add Expense above to log student spending."
      />
    );
  }

  return (
    <div
      className="mt-3 flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-0.5"
      role="list"
      aria-label={`Expenses for ${selectedMonthDisplay}`}
    >
      {expenses.map((expense) => {
        const cat = CATEGORY_STYLES[expense.category] || CATEGORY_STYLES.other;
        return (
          <div
            key={expense.id}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-xs transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/80"
            role="listitem"
          >
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-baseline gap-1.5 truncate">
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {expense.note}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                <Badge variant={cat.variant} className="text-[10px] px-1.5 py-0">
                  {cat.label}
                </Badge>
                <span className="tabular-nums">{expense.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700/80 px-2.5 py-0.5 rounded-lg border border-slate-200/80 dark:border-slate-600/80 shadow-2xs">
                {formatPaiseToRupees(expense.amountPaise)}
              </span>

              <IconButton
                variant="ghost"
                size="sm"
                onClick={() => onDelete(expense.id)}
                aria-label={`Delete ${expense.note} (${formatPaiseToRupees(expense.amountPaise)})`}
                className="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </IconButton>
            </div>
          </div>
        );
      })}
    </div>
  );
};
