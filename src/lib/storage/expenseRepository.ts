import { Expense, ExpenseSettings } from '../../features/expenses/types/expense';

/**
 * Abstract Repository Interface for Expense tracking persistence.
 * Async methods returning Promises enable seamless swapping
 * between LocalStorage, Supabase, or external REST services.
 */
export interface ExpenseRepository {
  getExpenses(): Promise<Expense[]>;
  saveExpense(expense: Expense): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;
  getSettings(): Promise<ExpenseSettings>;
  saveSettings(settings: ExpenseSettings): Promise<ExpenseSettings>;
}
