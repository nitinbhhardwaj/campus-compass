import { Expense, ExpenseCategory } from '../types/expense';

export type BudgetStatus = 'ok' | 'warning' | 'over';

export interface CurrencyParseResult {
  amountPaise: number;
  isValid: boolean;
  error?: string;
}

export interface CategoryWarning {
  category: ExpenseCategory;
  percent: number;
  spentPaise: number;
  budgetPaise: number;
  status: 'warning' | 'over';
}

/**
 * Pure function: Safely parses a user-entered Rupee string into integer paise.
 * Operates purely on string manipulation and integer parsing to avoid IEEE 754 floating-point inaccuracies.
 * Supports inputs like "12.5" -> 1250, "100" -> 10000, "0.75" -> 75.
 */
export function rupeeStringToPaise(input: string): CurrencyParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { amountPaise: 0, isValid: false, error: 'Amount is required.' };
  }

  if (trimmed.startsWith('-')) {
    return { amountPaise: 0, isValid: false, error: 'Amount must be positive.' };
  }

  // Regex strictly enforces positive digits with optional 1 or 2 decimal places
  const regex = /^\d+(\.\d{1,2})?$/;
  if (!regex.test(trimmed)) {
    return {
      amountPaise: 0,
      isValid: false,
      error: 'Enter a valid amount (e.g. 100 or 12.50).',
    };
  }

  const parts = trimmed.split('.');
  const wholePart = parts[0];
  const decimalPart = parts[1] || '';

  const wholePaise = parseInt(wholePart, 10) * 100;
  // Pad decimal: "5" -> "50", "05" -> "05", "" -> "00"
  const paddedDecimal = decimalPart.padEnd(2, '0');
  const fractionPaise = parseInt(paddedDecimal, 10);

  const totalPaise = wholePaise + fractionPaise;

  if (totalPaise <= 0) {
    return { amountPaise: 0, isValid: false, error: 'Amount must be greater than zero.' };
  }

  const MAX_PAISE = 100_000_000; // ₹10,00,000 sensible maximum
  if (totalPaise > MAX_PAISE) {
    return { amountPaise: 0, isValid: false, error: 'Amount cannot exceed ₹10,00,000.' };
  }

  return { amountPaise: totalPaise, isValid: true };
}

/**
 * Pure function: Formats integer paise into Indian Rupee currency display.
 * Conversion to floating rupees occurs only at the format boundary.
 */
export function formatPaiseToRupees(paise: number, forceDecimals = false): string {
  const rupees = paise / 100;
  const hasFractions = paise % 100 !== 0;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: forceDecimals || hasFractions ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);
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
