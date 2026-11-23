import { Expense, ExpenseSettings } from '../../features/expenses/types/expense';
import { ExpenseRepository } from './expenseRepository';

const EXPENSES_KEY = 'campus_compass_expenses_v1';
const SETTINGS_KEY = 'campus_compass_expense_settings_v1';

export const DEFAULT_EXPENSE_SETTINGS: ExpenseSettings = {
  monthlyBudgetPaise: 1500000, // ₹15,000 default student monthly budget
  categoryBudgetsPaise: {
    food: 600000,          // ₹6,000
    travel: 200000,        // ₹2,000
    rent: 400000,          // ₹4,000
    subscriptions: 100000, // ₹1,000
    study: 150000,         // ₹1,500
    other: 50000,          // ₹500
  },
};

export const INITIAL_SEED_EXPENSES: Expense[] = [
  {
    id: 'seed-exp-1',
    date: '2026-11-21',
    amountPaise: 25000, // ₹250
    category: 'food',
    note: 'College Canteen Lunch + Chai',
    createdAt: '2026-11-21T13:30:00.000Z',
  },
  {
    id: 'seed-exp-2',
    date: '2026-11-20',
    amountPaise: 49900, // ₹499
    category: 'subscriptions',
    note: 'GitHub Copilot / Cloud Sandbox',
    createdAt: '2026-11-20T10:00:00.000Z',
  },
  {
    id: 'seed-exp-3',
    date: '2026-11-18',
    amountPaise: 85000, // ₹850
    category: 'study',
    note: 'Calculus & Linear Algebra Reference',
    createdAt: '2026-11-18T16:00:00.000Z',
  },
  {
    id: 'seed-exp-4',
    date: '2026-11-15',
    amountPaise: 15000, // ₹150
    category: 'travel',
    note: 'Metro Smart Card Recharge',
    createdAt: '2026-11-15T09:00:00.000Z',
  },
];

export class LocalStorageExpenseRepository implements ExpenseRepository {
  private expensesKey: string;
  private settingsKey: string;

  constructor(expensesKey = EXPENSES_KEY, settingsKey = SETTINGS_KEY) {
    this.expensesKey = expensesKey;
    this.settingsKey = settingsKey;
  }

  private readExpenses(): Expense[] {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return [...INITIAL_SEED_EXPENSES];
      }
      const raw = window.localStorage.getItem(this.expensesKey);
      if (!raw) {
        this.writeExpenses(INITIAL_SEED_EXPENSES);
        return [...INITIAL_SEED_EXPENSES];
      }
      return JSON.parse(raw) as Expense[];
    } catch (err) {
      console.error('Failed to read expenses from localStorage:', err);
      return [];
    }
  }

  private writeExpenses(expenses: Expense[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.expensesKey, JSON.stringify(expenses));
      }
    } catch (err) {
      console.error('Failed to write expenses to localStorage:', err);
    }
  }

  private readSettings(): ExpenseSettings {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return { ...DEFAULT_EXPENSE_SETTINGS };
      }
      const raw = window.localStorage.getItem(this.settingsKey);
      if (!raw) {
        this.writeSettings(DEFAULT_EXPENSE_SETTINGS);
        return { ...DEFAULT_EXPENSE_SETTINGS };
      }
      return JSON.parse(raw) as ExpenseSettings;
    } catch (err) {
      console.error('Failed to read expense settings from localStorage:', err);
      return { ...DEFAULT_EXPENSE_SETTINGS };
    }
  }

  private writeSettings(settings: ExpenseSettings): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.settingsKey, JSON.stringify(settings));
      }
    } catch (err) {
      console.error('Failed to write expense settings to localStorage:', err);
    }
  }

  async getExpenses(): Promise<Expense[]> {
    return Promise.resolve(this.readExpenses());
  }

  async saveExpense(expense: Expense): Promise<Expense> {
    const expenses = this.readExpenses();
    const existingIndex = expenses.findIndex((e) => e.id === expense.id);
    let updated: Expense[];

    if (existingIndex >= 0) {
      updated = [...expenses];
      updated[existingIndex] = expense;
    } else {
      updated = [expense, ...expenses];
    }

    this.writeExpenses(updated);
    return Promise.resolve(expense);
  }

  async deleteExpense(id: string): Promise<void> {
    const expenses = this.readExpenses();
    const filtered = expenses.filter((e) => e.id !== id);
    this.writeExpenses(filtered);
    return Promise.resolve();
  }

  async getSettings(): Promise<ExpenseSettings> {
    return Promise.resolve(this.readSettings());
  }

  async saveSettings(settings: ExpenseSettings): Promise<ExpenseSettings> {
    this.writeSettings(settings);
    return Promise.resolve(settings);
  }
}

// Default singleton instance for the app
export const expenseRepository = new LocalStorageExpenseRepository();
