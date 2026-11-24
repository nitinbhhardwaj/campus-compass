import { Expense, ExpenseCategory } from '../types/expense';
import {
  rupeeStringToPaise,
  formatPaiseToRupees,
  type CurrencyParseResult,
} from '../../../lib/currency';

export { rupeeStringToPaise, formatPaiseToRupees, type CurrencyParseResult };

export type BudgetStatus = 'ok' | 'warning' | 'over';

export interface CategoryWarning {
  category: ExpenseCategory;
  percent: number;
  spentPaise: number;
  budgetPaise: number;
  status: 'warning' | 'over';
}

/**
 * Pure function: Sums the total expenses in integer paise for a given month ('YYYY-MM').
 */
export function totalForMonth(expenses: Expense[], yearMonth: string): number {
  return expenses
    .filter((e) => e.date.startsWith(yearMonth))
    .reduce((sum, e) => sum + (Number.isInteger(e.amountPaise) ? e.amountPaise : 0), 0);
}

/**
 * Pure function: Aggregates total spent in integer paise by category for a given month ('YYYY-MM').
 */
export function totalByCategory(
  expenses: Expense[],
  yearMonth: string
): Record<ExpenseCategory, number> {
  const result: Record<ExpenseCategory, number> = {
    food: 0,
    travel: 0,
    rent: 0,
    subscriptions: 0,
    study: 0,
    other: 0,
  };

  for (const e of expenses) {
    if (e.date.startsWith(yearMonth) && result[e.category] !== undefined) {
      result[e.category] += e.amountPaise;
    }
  }

  return result;
}

/**
 * Pure function: Calculates remaining budget in integer paise.
 * Floored at 0 so exceeding budget never returns negative remaining.
 */
export function remainingBudget(totalSpentPaise: number, budgetPaise: number): number {
  if (budgetPaise <= 0) return 0;
  return Math.max(0, budgetPaise - totalSpentPaise);
}

/**
 * Pure function: Calculates budget used percentage.
 * Uncapped so over-budget months accurately reflect 110%, 150%, etc.
 */
export function budgetUsedPercent(totalSpentPaise: number, budgetPaise: number): number {
  if (budgetPaise <= 0 || totalSpentPaise <= 0) {
    return 0;
  }
  return Math.round((totalSpentPaise / budgetPaise) * 100);
}

/**
 * Pure function: Determines budget status.
 * - 'ok': < 80%
 * - 'warning': >= 80% and <= 100%
 * - 'over': > 100%
 */
export function budgetStatus(totalSpentPaise: number, budgetPaise: number): BudgetStatus {
  if (budgetPaise <= 0) return 'ok';
  const percent = (totalSpentPaise / budgetPaise) * 100;

  if (percent > 100) {
    return 'over';
  }
  if (percent >= 80) {
    return 'warning';
  }
  return 'ok';
}

/**
 * Pure function: Filters expenses for a given month ('YYYY-MM'),
 * sorted chronologically newest date first, then newest createdAt.
 */
export function expensesForMonth(expenses: Expense[], yearMonth: string): Expense[] {
  return expenses
    .filter((e) => e.date.startsWith(yearMonth))
    .sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
}

/**
 * Pure function: Evaluates category budgets and returns any active warnings or over-budget states.
 */
export function checkCategoryWarnings(
  categoryTotals: Record<ExpenseCategory, number>,
  categoryBudgets?: Partial<Record<ExpenseCategory, number>>
): CategoryWarning[] {
  if (!categoryBudgets) return [];

  const warnings: CategoryWarning[] = [];

  for (const [cat, budget] of Object.entries(categoryBudgets) as [ExpenseCategory, number | undefined][]) {
    if (budget && budget > 0) {
      const spent = categoryTotals[cat] || 0;
      const status = budgetStatus(spent, budget);

      if (status === 'warning' || status === 'over') {
        warnings.push({
          category: cat,
          percent: budgetUsedPercent(spent, budget),
          spentPaise: spent,
          budgetPaise: budget,
          status,
        });
      }
    }
  }

  return warnings;
}
