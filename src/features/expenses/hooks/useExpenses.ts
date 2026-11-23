import { useState, useEffect, useCallback, useMemo } from 'react';
import { Expense, ExpenseSettings, CreateExpenseDTO } from '../types/expense';
import { ExpenseRepository } from '../../../lib/storage/expenseRepository';
import {
  expenseRepository as defaultRepo,
  DEFAULT_EXPENSE_SETTINGS,
} from '../../../lib/storage/localExpenseRepository';
import {
  totalForMonth,
  totalByCategory,
  remainingBudget,
  budgetUsedPercent,
  budgetStatus,
  expensesForMonth,
  checkCategoryWarnings,
} from '../logic/expenseLogic';
import {
  formatLocalDate,
  getYearMonth,
  getPreviousMonth,
  getNextMonth,
} from '../../../lib/dateUtils';

export function useExpenses(
  repo: ExpenseRepository = defaultRepo,
  today: string = formatLocalDate()
) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<ExpenseSettings>(DEFAULT_EXPENSE_SETTINGS);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => getYearMonth(today));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [fetchedExpenses, fetchedSettings] = await Promise.all([
        repo.getExpenses(),
        repo.getSettings(),
      ]);
      setExpenses(fetchedExpenses);
      setSettings(fetchedSettings);
    } catch (err) {
      console.error('Failed to load expenses data:', err);
      setError('Could not load expense data.');
    } finally {
      setIsLoading(false);
    }
  }, [repo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addExpense = async (dto: CreateExpenseDTO): Promise<Expense> => {
    const newExpense: Expense = {
      ...dto,
      id: `expense_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setExpenses((prev) => [newExpense, ...prev]);

    try {
      await repo.saveExpense(newExpense);
      return newExpense;
    } catch (err) {
      console.error('Failed to save expense:', err);
      setExpenses((prev) => prev.filter((e) => e.id !== newExpense.id));
      throw err;
    }
  };

  const deleteExpense = async (id: string): Promise<void> => {
    const previous = [...expenses];
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    try {
      await repo.deleteExpense(id);
    } catch (err) {
      console.error('Failed to delete expense:', err);
      setExpenses(previous);
      throw err;
    }
  };

  const updateSettings = async (newSettings: ExpenseSettings): Promise<void> => {
    const previous = { ...settings };
    setSettings(newSettings);

    try {
      await repo.saveSettings(newSettings);
    } catch (err) {
      console.error('Failed to update expense settings:', err);
      setSettings(previous);
      throw err;
    }
  };

  const goToPreviousMonth = () => {
    setSelectedMonth((prev) => getPreviousMonth(prev));
  };

  const goToNextMonth = () => {
    setSelectedMonth((prev) => getNextMonth(prev));
  };

  const resetToCurrentMonth = () => {
    setSelectedMonth(getYearMonth(today));
  };

  // Pure derived metrics for the selected month
  const monthExpenses = useMemo(() => {
    return expensesForMonth(expenses, selectedMonth);
  }, [expenses, selectedMonth]);

  const totalSpentPaise = useMemo(() => {
    return totalForMonth(expenses, selectedMonth);
  }, [expenses, selectedMonth]);

  const categoryTotals = useMemo(() => {
    return totalByCategory(expenses, selectedMonth);
  }, [expenses, selectedMonth]);

  const remainingBudgetPaise = useMemo(() => {
    return remainingBudget(totalSpentPaise, settings.monthlyBudgetPaise);
  }, [totalSpentPaise, settings.monthlyBudgetPaise]);

  const usedPercent = useMemo(() => {
    return budgetUsedPercent(totalSpentPaise, settings.monthlyBudgetPaise);
  }, [totalSpentPaise, settings.monthlyBudgetPaise]);

  const status = useMemo(() => {
    return budgetStatus(totalSpentPaise, settings.monthlyBudgetPaise);
  }, [totalSpentPaise, settings.monthlyBudgetPaise]);

  const categoryWarnings = useMemo(() => {
    return checkCategoryWarnings(categoryTotals, settings.categoryBudgetsPaise);
  }, [categoryTotals, settings.categoryBudgetsPaise]);

  return {
    expenses,
    monthExpenses,
    settings,
    selectedMonth,
    setSelectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    resetToCurrentMonth,
    totalSpentPaise,
    remainingBudgetPaise,
    usedPercent,
    status,
    categoryTotals,
    categoryWarnings,
    isLoading,
    error,
    today,
    addExpense,
    deleteExpense,
    updateSettings,
    refreshExpenses: loadData,
  };
}
