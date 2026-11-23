import React, { useState } from 'react';
import { Expense, ExpenseCategory, CreateExpenseDTO } from '../types/expense';
import { BudgetStatus, CategoryWarning, formatPaiseToRupees } from '../logic/expenseLogic';
import { Card } from '../../../components/Card';
import { Badge, BadgeProps } from '../../../components/Badge';
import { ProgressBar } from '../../../components/ProgressBar';
import { IconButton } from '../../../components/IconButton';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';
import {
  CreditCard,
  Settings2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  AlertOctagon,
  Plus,
} from 'lucide-react';

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

const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { label: string; variant: BadgeProps['variant']; barColor: string; dotColor: string }
> = {
  food: { label: 'Food', variant: 'amber', barColor: 'bg-amber-500', dotColor: 'bg-amber-500' },
  travel: { label: 'Travel', variant: 'slate', barColor: 'bg-sky-500', dotColor: 'bg-sky-500' },
  rent: { label: 'Rent', variant: 'purple', barColor: 'bg-purple-500', dotColor: 'bg-purple-500' },
  subscriptions: { label: 'Subs', variant: 'indigo', barColor: 'bg-indigo-500', dotColor: 'bg-indigo-500' },
  study: { label: 'Study', variant: 'emerald', barColor: 'bg-emerald-500', dotColor: 'bg-emerald-500' },
  other: { label: 'Other', variant: 'slate', barColor: 'bg-slate-400', dotColor: 'bg-slate-400' },
};

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');

  const progressBarColor =
    status === 'over'
      ? 'bg-rose-500'
      : status === 'warning'
      ? 'bg-amber-500'
      : 'bg-indigo-600 dark:bg-indigo-500';

  return (
    <Card className="p-4 sm:p-5 mb-4">
      {/* Top Header: Title, Month Navigation, Settings & Toggle */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-100 dark:border-emerald-900/40 shadow-2xs">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Expenses
              </span>
              {/* Clean Month Navigator with accessible touch targets */}
              <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200/80 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={onPreviousMonth}
                  className="w-7 h-7 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-2">
                  {selectedMonthDisplay}
                </span>
                <button
                  type="button"
                  onClick={onNextMonth}
                  className="w-7 h-7 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatPaiseToRupees(totalSpentPaise)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
                {formatPaiseToRupees(monthlyBudgetPaise)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            variant="ghost"
            size="md"
            onClick={onOpenSettings}
            aria-label="Monthly budget settings"
            className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
          >
            <Settings2 className="w-4 h-4" />
          </IconButton>
          <IconButton
            variant="ghost"
            size="md"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse expenses details' : 'Expand expenses details'}
            className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </IconButton>
        </div>
      </div>

      {/* Spent vs Budget Progress Bar (shifts color at 80% and 100%) */}
      <div className="mb-2.5">
        <ProgressBar
          percent={usedPercent}
          color={progressBarColor}
        />
      </div>

      {/* Status Line */}
      <div className="flex items-center justify-between text-xs mb-3">
        <div>
          {status === 'over' ? (
            <span className="inline-flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/60 tabular-nums">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              Over budget ({usedPercent}%)
            </span>
          ) : status === 'warning' ? (
            <span className="inline-flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/60 tabular-nums">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              {usedPercent}% used (Warning)
            </span>
          ) : (
            <span className="font-medium text-slate-600 dark:text-slate-400">
              <strong className="text-slate-900 dark:text-slate-100 font-bold tabular-nums">
                {formatPaiseToRupees(remainingBudgetPaise)}
              </strong>{' '}
              remaining
            </span>
          )}
        </div>

        {!isExpanded && (
          <button
            type="button"
            onClick={() => {
              setIsExpanded(true);
              setActiveTab('add');
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-2 py-1 transition-colors min-h-[36px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        )}
      </div>

      {/* Warning Message Alerts (at >= 80% overall or in specific categories) */}
      {(status === 'warning' || status === 'over' || categoryWarnings.length > 0) && (
        <div className="flex flex-col gap-2 my-3">
          {status === 'warning' && (
            <div className="p-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>You've used {usedPercent}% of your overall monthly budget.</span>
            </div>
          )}
          {status === 'over' && (
            <div className="p-2.5 rounded-xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>You've exceeded your monthly budget by <span className="tabular-nums font-bold">{formatPaiseToRupees(totalSpentPaise - monthlyBudgetPaise)}</span>.</span>
            </div>
          )}
          {categoryWarnings.map((w) => (
            <div
              key={w.category}
              className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 text-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>You've used {w.percent}% of your {w.category} budget</span>
              </div>
              <span className="font-bold tabular-nums">
                {formatPaiseToRupees(w.spentPaise)} / {formatPaiseToRupees(w.budgetPaise)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Category Breakdown with Segmented Bar and Badges */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Category Breakdown ({selectedMonthDisplay})
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
            {formatPaiseToRupees(totalSpentPaise)} total
          </span>
        </div>

        {/* Segmented Color Bar */}
        {totalSpentPaise > 0 && (
          <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 mb-2.5">
            {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map((cat) => {
              const amount = categoryTotals[cat] || 0;
              if (amount <= 0) return null;
              const pct = (amount / totalSpentPaise) * 100;
              return (
                <div
                  key={cat}
                  className={`h-full ${CATEGORY_CONFIG[cat].barColor} transition-all duration-300`}
                  style={{ width: `${pct}%` }}
                  title={`${CATEGORY_CONFIG[cat].label}: ${formatPaiseToRupees(amount)} (${Math.round(pct)}%)`}
                />
              );
            })}
          </div>
        )}

        {/* Category Cards with Badges and Tabular Numerals */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map((cat) => {
            const meta = CATEGORY_CONFIG[cat];
            const amount = categoryTotals[cat] || 0;
            return (
              <div
                key={cat}
                className="flex flex-col p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50"
              >
                <div className="flex items-center justify-between">
                  <Badge variant={meta.variant} className="text-[10px] px-1.5 py-0.5">
                    {meta.label}
                  </Badge>
                  {totalSpentPaise > 0 && amount > 0 && (
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tabular-nums">
                      {Math.round((amount / totalSpentPaise) * 100)}%
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 tabular-nums truncate">
                  {formatPaiseToRupees(amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Accordion: Add Expense & Month History */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-150">
          {/* Sub-tab switcher */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 mb-3" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'add'}
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer min-h-[38px] ${
                activeTab === 'add'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Add Expense
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'list'}
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer min-h-[38px] ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {selectedMonthDisplay} History ({monthExpenses.length})
            </button>
          </div>

          {activeTab === 'add' ? (
            <ExpenseForm
              initialDate={today}
              onSubmit={async (dto) => {
                await onAddExpense(dto);
                setActiveTab('list');
              }}
            />
          ) : (
            <ExpenseList
              expenses={monthExpenses}
              onDelete={onDeleteExpense}
              selectedMonthDisplay={selectedMonthDisplay}
            />
          )}
        </div>
      )}
    </Card>
  );
};
