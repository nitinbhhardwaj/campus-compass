import React, { useState } from 'react';
import { Expense, ExpenseCategory, CreateExpenseDTO } from '../types/expense';
import { BudgetStatus, CategoryWarning, formatPaiseToRupees } from '../logic/expenseLogic';
import { Card } from '../../../components/Card';
import { Badge, BadgeProps } from '../../../components/Badge';
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
  { label: string; variant: BadgeProps['variant'] }
> = {
  food: { label: 'Food', variant: 'amber' },
  travel: { label: 'Travel', variant: 'slate' },
  rent: { label: 'Rent', variant: 'purple' },
  subscriptions: { label: 'Subs', variant: 'indigo' },
  study: { label: 'Study', variant: 'emerald' },
  other: { label: 'Other', variant: 'slate' },
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
      : 'bg-indigo-600';

  return (
    <Card className="p-4 mb-4 bg-white border-slate-200/90 shadow-xs">
      {/* Top Header: Title, Month Navigation, Settings */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 border border-purple-100">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">Expenses</span>
              {/* Month Navigator */}
              <div className="inline-flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200/80">
                <button
                  type="button"
                  onClick={onPreviousMonth}
                  className="p-0.5 text-slate-500 hover:text-slate-800 rounded hover:bg-white transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-semibold text-slate-700 px-1.5">
                  {selectedMonthDisplay}
                </span>
                <button
                  type="button"
                  onClick={onNextMonth}
                  className="p-0.5 text-slate-500 hover:text-slate-800 rounded hover:bg-white transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              <span className="font-bold text-slate-900">{formatPaiseToRupees(totalSpentPaise)}</span> of{' '}
              <span className="font-bold text-slate-900">{formatPaiseToRupees(monthlyBudgetPaise)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Budget settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse expenses details' : 'Expand expenses details'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${progressBarColor}`}
          style={{ width: `${Math.min(100, usedPercent)}%` }}
        />
      </div>

      {/* Status Line */}
      <div className="flex items-center justify-between text-[11px] mb-2">
        <div>
          {status === 'over' ? (
            <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              <AlertOctagon className="w-3 h-3 text-rose-600" />
              Over budget ({usedPercent}%)
            </span>
          ) : status === 'warning' ? (
            <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              {usedPercent}% used (Warning)
            </span>
          ) : (
            <span className="font-medium text-slate-600">
              <strong className="text-slate-900 font-bold">{formatPaiseToRupees(remainingBudgetPaise)}</strong> remaining
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setIsExpanded(true);
            setActiveTab('add');
          }}
          className="font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1"
        >
          {isExpanded ? '' : '+ Add Expense'}
        </button>
      </div>

      {/* Warning Message Alerts (at >= 80% overall or in specific categories) */}
      {(status === 'warning' || status === 'over' || categoryWarnings.length > 0) && (
        <div className="flex flex-col gap-1.5 my-2.5">
          {status === 'warning' && (
            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>You've used {usedPercent}% of your overall monthly budget.</span>
            </div>
          )}
          {status === 'over' && (
            <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>You've exceeded your monthly budget by {formatPaiseToRupees(totalSpentPaise - monthlyBudgetPaise)}.</span>
            </div>
          )}
          {categoryWarnings.map((w) => (
            <div
              key={w.category}
              className="p-2 rounded-xl bg-amber-50/60 border border-amber-200/80 text-amber-800 text-[11px] flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>You've used {w.percent}% of your {w.category} budget</span>
              </div>
              <span className="font-bold">
                {formatPaiseToRupees(w.spentPaise)} / {formatPaiseToRupees(w.budgetPaise)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Month Category Breakdown Summary */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-100">
        <div className="text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
          Category Breakdown ({selectedMonthDisplay})
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map((cat) => {
            const meta = CATEGORY_CONFIG[cat];
            const amount = categoryTotals[cat] || 0;
            return (
              <div
                key={cat}
                className="flex flex-col p-1.5 rounded-lg bg-slate-50 border border-slate-200/60"
              >
                <div className="flex items-center justify-between">
                  <Badge variant={meta.variant} className="text-[9px] px-1 py-0">
                    {meta.label}
                  </Badge>
                </div>
                <span className="text-[11px] font-bold text-slate-800 mt-1 truncate">
                  {formatPaiseToRupees(amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Accordion: Add Expense & Month History */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
          {/* Sub-tab switcher */}
          <div className="flex rounded-xl bg-slate-100 p-0.5 mb-3" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'add'}
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Add Expense
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'list'}
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
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
