import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageExpenseRepository } from './localExpenseRepository';
import { Expense, ExpenseSettings } from '../../features/expenses/types/expense';

describe('LocalStorageExpenseRepository', () => {
  let mockStorage: Record<string, string> = {};
  const testExpensesKey = 'test_expenses_repo';
  const testSettingsKey = 'test_expenses_settings_repo';

  beforeEach(() => {
    mockStorage = {};
    (globalThis as unknown as { window: { localStorage: Storage } }).window = {
      localStorage: {
        getItem: (k: string) => mockStorage[k] ?? null,
        setItem: (k: string, v: string) => {
          mockStorage[k] = v;
        },
        removeItem: (k: string) => {
          delete mockStorage[k];
        },
        clear: () => {
          mockStorage = {};
        },
        key: (_index: number) => null,
        length: Object.keys(mockStorage).length,
      } as Storage,
    };
  });

  it('seeds default sample expenses and settings when storage is empty', async () => {
    const repo = new LocalStorageExpenseRepository(testExpensesKey, testSettingsKey);
    const expenses = await repo.getExpenses();
    const settings = await repo.getSettings();

    expect(expenses.length).toBeGreaterThan(0);
    expect(settings.monthlyBudgetPaise).toBe(1500000);
    expect(settings.categoryBudgetsPaise?.food).toBe(600000);
  });

  it('saves and retrieves an expense asynchronously with integer paise', async () => {
    const repo = new LocalStorageExpenseRepository(testExpensesKey, testSettingsKey);
    const newExpense: Expense = {
      id: 'custom-exp-1',
      date: '2026-11-21',
      amountPaise: 1250, // ₹12.50
      category: 'food',
      note: 'Tea + Biscuit',
      createdAt: '2026-11-21T15:00:00.000Z',
    };

    const saved = await repo.saveExpense(newExpense);
    expect(saved).toEqual(newExpense);

    const all = await repo.getExpenses();
    const found = all.find((e) => e.id === 'custom-exp-1');
    expect(found).toBeDefined();
    expect(found?.amountPaise).toBe(1250);
  });

  it('deletes an expense by id', async () => {
    const repo = new LocalStorageExpenseRepository(testExpensesKey, testSettingsKey);
    const exp: Expense = {
      id: 'to-delete-exp',
      date: '2026-11-21',
      amountPaise: 8000,
      category: 'travel',
      note: 'Auto ride',
      createdAt: '2026-11-21T16:00:00.000Z',
    };

    await repo.saveExpense(exp);
    await repo.deleteExpense('to-delete-exp');

    const all = await repo.getExpenses();
    expect(all.some((e) => e.id === 'to-delete-exp')).toBe(false);
  });

  it('saves and updates monthly and category budgets', async () => {
    const repo = new LocalStorageExpenseRepository(testExpensesKey, testSettingsKey);
    const updatedSettings: ExpenseSettings = {
      monthlyBudgetPaise: 2000000, // ₹20,000
      categoryBudgetsPaise: {
        food: 800000,
        rent: 500000,
      },
    };

    await repo.saveSettings(updatedSettings);
    const retrieved = await repo.getSettings();

    expect(retrieved.monthlyBudgetPaise).toBe(2000000);
    expect(retrieved.categoryBudgetsPaise?.food).toBe(800000);
  });
});
