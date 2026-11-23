import { describe, it, expect } from 'vitest';
import { Expense } from '../types/expense';
import {
  rupeeStringToPaise,
  formatPaiseToRupees,
  totalForMonth,
  totalByCategory,
  remainingBudget,
  budgetUsedPercent,
  budgetStatus,
  expensesForMonth,
  checkCategoryWarnings,
} from './expenseLogic';

describe('expenseLogic pure functions', () => {
  const mockExpenses: Expense[] = [
    {
      id: 'e1',
      date: '2026-11-21',
      amountPaise: 25000, // ₹250
      category: 'food',
      note: 'Campus Cafeteria Lunch',
      createdAt: '2026-11-21T12:00:00.000Z',
    },
    {
      id: 'e2',
      date: '2026-11-20',
      amountPaise: 5000, // ₹50
      category: 'travel',
      note: 'Metro commute',
      createdAt: '2026-11-20T08:30:00.000Z',
    },
    {
      id: 'e3',
      date: '2026-11-05',
      amountPaise: 45000, // ₹450
      category: 'study',
      note: 'Algorithms Textbook',
      createdAt: '2026-11-05T14:00:00.000Z',
    },
    {
      id: 'e4',
      date: '2026-10-28', // Previous month
      amountPaise: 100000, // ₹1,000
      category: 'food',
      note: 'Groceries October',
      createdAt: '2026-10-28T18:00:00.000Z',
    },
  ];

  describe('1. rupeeStringToPaise (float-safe parsing)', () => {
    it('converts integer rupee strings to paise', () => {
      const res = rupeeStringToPaise('100');
      expect(res.isValid).toBe(true);
      expect(res.amountPaise).toBe(10000);
    });

    it('converts single decimal place inputs accurately without float errors (12.5 -> 1250)', () => {
      const res = rupeeStringToPaise('12.5');
      expect(res.isValid).toBe(true);
      expect(res.amountPaise).toBe(1250);
    });

    it('converts two decimal place inputs accurately (12.50 -> 1250, 0.75 -> 75)', () => {
      expect(rupeeStringToPaise('12.50').amountPaise).toBe(1250);
      expect(rupeeStringToPaise('0.75').amountPaise).toBe(75);
      expect(rupeeStringToPaise('0.05').amountPaise).toBe(5);
    });

    it('rejects invalid, negative, or more than 2 decimal inputs', () => {
      expect(rupeeStringToPaise('-50').isValid).toBe(false);
      expect(rupeeStringToPaise('12.345').isValid).toBe(false);
      expect(rupeeStringToPaise('abc').isValid).toBe(false);
      expect(rupeeStringToPaise('').isValid).toBe(false);
      expect(rupeeStringToPaise('0').isValid).toBe(false);
    });

    it('rejects amounts exceeding sensible limits (> 10 Lakh INR)', () => {
      const result = rupeeStringToPaise('1000001');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('10,00,000');
    });
  });

  describe('2. formatPaiseToRupees', () => {
    it('formats whole rupee amounts cleanly', () => {
      const formatted = formatPaiseToRupees(10000);
      expect(formatted).toContain('100');
      expect(formatted).toContain('₹');
    });

    it('formats fractional paise amounts accurately', () => {
      const formatted = formatPaiseToRupees(1250);
      expect(formatted).toContain('12.5');
    });
  });

  describe('3. totalForMonth & totalByCategory', () => {
    it('sums all expenses within the target month', () => {
      // Nov 2026: 25000 (food) + 5000 (travel) + 45000 (study) = 75000 paise (₹750)
      const totalNov = totalForMonth(mockExpenses, '2026-11');
      expect(totalNov).toBe(75000);

      // Oct 2026: 100000 paise
      const totalOct = totalForMonth(mockExpenses, '2026-10');
      expect(totalOct).toBe(100000);
    });

    it('aggregates correctly by category for the target month', () => {
      const byCat = totalByCategory(mockExpenses, '2026-11');
      expect(byCat.food).toBe(25000);
      expect(byCat.travel).toBe(5000);
      expect(byCat.study).toBe(45000);
      expect(byCat.rent).toBe(0);
      expect(byCat.subscriptions).toBe(0);
      expect(byCat.other).toBe(0);
    });
  });

  describe('4. remainingBudget, budgetUsedPercent & budgetStatus', () => {
    const budget = 100000; // ₹1,000 budget (100,000 paise)

    it('calculates remaining budget and budget status at normal usage (< 80%)', () => {
      const spent = 50000; // 50%
      expect(remainingBudget(spent, budget)).toBe(50000);
      expect(budgetUsedPercent(spent, budget)).toBe(50);
      expect(budgetStatus(spent, budget)).toBe('ok');
    });

    it('triggers warning status at >= 80% and <= 100%', () => {
      const spent80 = 80000; // exactly 80%
      expect(budgetStatus(spent80, budget)).toBe('warning');
      expect(budgetUsedPercent(spent80, budget)).toBe(80);

      const spent95 = 95000; // 95%
      expect(budgetStatus(spent95, budget)).toBe('warning');
    });

    it('triggers over status at > 100% and does not cap percent', () => {
      const spentOver = 125000; // 125%
      expect(budgetStatus(spentOver, budget)).toBe('over');
      expect(budgetUsedPercent(spentOver, budget)).toBe(125);
      expect(remainingBudget(spentOver, budget)).toBe(0); // Floored at 0
    });
  });

  describe('5. expensesForMonth sorting', () => {
    it('returns expenses for the month ordered newest date first', () => {
      const novExpenses = expensesForMonth(mockExpenses, '2026-11');
      expect(novExpenses.length).toBe(3);
      expect(novExpenses[0].id).toBe('e1'); // Nov 21
      expect(novExpenses[1].id).toBe('e2'); // Nov 20
      expect(novExpenses[2].id).toBe('e3'); // Nov 05
    });

    it('returns empty array if no expenses match the month', () => {
      expect(expensesForMonth(mockExpenses, '2026-09')).toEqual([]);
    });
  });

  describe('6. checkCategoryWarnings', () => {
    it('detects category budgets hitting warning (>=80%) or over (>100%)', () => {
      const categoryTotals = {
        food: 25000, // ₹250
        travel: 5000,
        rent: 0,
        subscriptions: 0,
        study: 45000, // ₹450
        other: 0,
      };

      const categoryBudgets = {
        food: 30000, // ₹300 budget -> ₹250 is 83.3% -> WARNING!
        study: 40000, // ₹400 budget -> ₹450 is 112.5% -> OVER!
        travel: 10000, // ₹100 budget -> ₹50 is 50% -> OK
      };

      const warnings = checkCategoryWarnings(categoryTotals, categoryBudgets);
      expect(warnings.length).toBe(2);

      const foodWarning = warnings.find((w) => w.category === 'food');
      expect(foodWarning).toBeDefined();
      expect(foodWarning?.status).toBe('warning');
      expect(foodWarning?.percent).toBe(83);

      const studyWarning = warnings.find((w) => w.category === 'study');
      expect(studyWarning).toBeDefined();
      expect(studyWarning?.status).toBe('over');
      expect(studyWarning?.percent).toBe(113);
    });
  });
});
