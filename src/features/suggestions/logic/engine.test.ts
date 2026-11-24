import { describe, it, expect } from 'vitest';
import { DaySnapshot } from '../types/suggestion';
import {
  ruleDeadlinePressure,
  ruleProteinLowInEvening,
  ruleFoodBudgetWarning,
  ruleGymAtRisk,
  ruleOverduePileUp,
  ruleBalanceCheck,
} from './rules';
import { generateSuggestions } from './engine';

describe('suggestions rules and engine', () => {
  const defaultSnapshot: DaySnapshot = {
    today: '2026-11-23',
    hour: 12,
    tasks: {
      pendingCountByCategory: { study: 2, gym: 1, skincare: 1, chore: 1, other: 0 },
      overdueCount: 0,
      nearestP1StudyDueDaysAway: null,
    },
    gym: {
      isGymPendingToday: false,
      gymCompletionsThisWeek: 2,
    },
    study: {
      studyCompletionsThisWeek: 3,
    },
    protein: {
      totalGrams: 80,
      goalGrams: 112,
    },
    expenses: {
      foodBudgetUsedPercent: 45,
      overallBudgetUsedPercent: 50,
    },
  };

  describe('Rule 1: Deadline pressure', () => {
    it('triggers when priority-1 study task is due within 2 days', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        tasks: { ...defaultSnapshot.tasks, nearestP1StudyDueDaysAway: 1 },
      };
      const result = ruleDeadlinePressure(snap);
      expect(result).not.toBeNull();
      expect(result?.severity).toBe('warning');
      expect(result?.reason).toContain('due in 1 day');
    });

    it('triggers at the exact boundary of 2 days', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        tasks: { ...defaultSnapshot.tasks, nearestP1StudyDueDaysAway: 2 },
      };
      const result = ruleDeadlinePressure(snap);
      expect(result).not.toBeNull();
      expect(result?.reason).toContain('due in 2 days');
    });

    it('formats reason naturally when task is due today', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        tasks: { ...defaultSnapshot.tasks, nearestP1StudyDueDaysAway: 0 },
      };
      const result = ruleDeadlinePressure(snap);
      expect(result).not.toBeNull();
      expect(result?.reason).toContain('due today');
    });

    it('formats reason naturally when task is overdue', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        tasks: { ...defaultSnapshot.tasks, nearestP1StudyDueDaysAway: -4 },
      };
      const result = ruleDeadlinePressure(snap);
      expect(result).not.toBeNull();
      expect(result?.reason).toContain('4 days overdue');
    });

    it('formats singular overdue day naturally', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        tasks: { ...defaultSnapshot.tasks, nearestP1StudyDueDaysAway: -1 },
      };
      const result = ruleDeadlinePressure(snap);
      expect(result).not.toBeNull();
      expect(result?.reason).toContain('1 day overdue');
    });

    it('does not trigger when study task is 3 days away', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        tasks: { ...defaultSnapshot.tasks, nearestP1StudyDueDaysAway: 3 },
      };
      expect(ruleDeadlinePressure(snap)).toBeNull();
    });

    it('does not trigger when no priority-1 study tasks are pending', () => {
      expect(ruleDeadlinePressure(defaultSnapshot)).toBeNull();
    });
  });

  describe('Rule 2: Protein low in the evening', () => {
    it('triggers when hour >= 18 and total < 60% of goal', () => {
      // 50g of 100g = 50% (< 60%), hour 18
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        hour: 18,
        protein: { totalGrams: 50, goalGrams: 100 },
      };
      const result = ruleProteinLowInEvening(snap);
      expect(result).not.toBeNull();
      expect(result?.severity).toBe('nudge');
      expect(result?.reason).toContain('50g of 100g');
    });

    it('boundary: hour 17 does NOT trigger even if protein is under 60%', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        hour: 17,
        protein: { totalGrams: 40, goalGrams: 100 },
      };
      expect(ruleProteinLowInEvening(snap)).toBeNull();
    });

    it('boundary: exactly 60% protein does NOT trigger', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        hour: 19,
        protein: { totalGrams: 60, goalGrams: 100 },
      };
      expect(ruleProteinLowInEvening(snap)).toBeNull();
    });

    it('suggests budget-friendly options when food budget is >= 80%', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        hour: 20,
        protein: { totalGrams: 30, goalGrams: 100 },
        expenses: { foodBudgetUsedPercent: 82, overallBudgetUsedPercent: 70 },
      };
      const result = ruleProteinLowInEvening(snap);
      expect(result?.action).toContain('budget-friendly');
      expect(result?.action).toContain('eggs, curd, dal, or soya chunks');
    });

    it('suggests standard options when food budget is healthy (< 80%)', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        hour: 20,
        protein: { totalGrams: 30, goalGrams: 100 },
        expenses: { foodBudgetUsedPercent: 40, overallBudgetUsedPercent: 50 },
      };
      const result = ruleProteinLowInEvening(snap);
      expect(result?.action).toContain('paneer, chicken, whey');
    });
  });

  describe('Rule 3: Food budget warning', () => {
    it('triggers at exactly 80% boundary', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        expenses: { ...defaultSnapshot.expenses, foodBudgetUsedPercent: 80 },
      };
      const result = ruleFoodBudgetWarning(snap);
      expect(result).not.toBeNull();
      expect(result?.severity).toBe('nudge');
      expect(result?.reason).toContain('80%');
    });

    it('does not trigger below 80% (79%)', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        expenses: { ...defaultSnapshot.expenses, foodBudgetUsedPercent: 79 },
      };
      expect(ruleFoodBudgetWarning(snap)).toBeNull();
    });

    it('triggers warning severity when food budget exceeds 100%', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        expenses: { ...defaultSnapshot.expenses, foodBudgetUsedPercent: 110 },
      };
      const result = ruleFoodBudgetWarning(snap);
      expect(result?.severity).toBe('warning');
    });
  });

  describe('Rule 4: Gym at risk', () => {
    it('triggers when gym is pending, hour >= 17, and deadline pressure active', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        hour: 17,
        gym: { ...defaultSnapshot.gym, isGymPendingToday: true },
        tasks: { ...defaultSnapshot.tasks, nearestP1StudyDueDaysAway: 1 },
      };
      const result = ruleGymAtRisk(snap);
      expect(result).not.toBeNull();
      expect(result?.severity).toBe('nudge');
      expect(result?.reason).toContain('17:00');
    });

    it('boundary: hour 16 does NOT trigger', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        hour: 16,
        gym: { ...defaultSnapshot.gym, isGymPendingToday: true },
        tasks: { ...defaultSnapshot.tasks, nearestP1StudyDueDaysAway: 1 },
      };
      expect(ruleGymAtRisk(snap)).toBeNull();
    });

    it('does not trigger if gym task is already completed today', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        hour: 18,
        gym: { ...defaultSnapshot.gym, isGymPendingToday: false },
        tasks: { ...defaultSnapshot.tasks, nearestP1StudyDueDaysAway: 1 },
      };
      expect(ruleGymAtRisk(snap)).toBeNull();
    });

    it('does not trigger if there is no deadline pressure', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        hour: 18,
        gym: { ...defaultSnapshot.gym, isGymPendingToday: true },
        tasks: { ...defaultSnapshot.tasks, nearestP1StudyDueDaysAway: 4 },
      };
      expect(ruleGymAtRisk(snap)).toBeNull();
    });
  });

  describe('Rule 5: Overdue pile-up', () => {
    it('boundary: 2 overdue tasks does NOT trigger', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        tasks: { ...defaultSnapshot.tasks, overdueCount: 2 },
      };
      expect(ruleOverduePileUp(snap)).toBeNull();
    });

    it('boundary: exactly 3 overdue tasks triggers warning', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        tasks: { ...defaultSnapshot.tasks, overdueCount: 3 },
      };
      const result = ruleOverduePileUp(snap);
      expect(result).not.toBeNull();
      expect(result?.severity).toBe('warning');
      expect(result?.reason).toContain('3 overdue tasks');
    });
  });

  describe('Rule 6: Balance check', () => {
    it('triggers when 0 gym completions and 5 study completions', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        gym: { ...defaultSnapshot.gym, gymCompletionsThisWeek: 0 },
        study: { studyCompletionsThisWeek: 5 },
      };
      const result = ruleBalanceCheck(snap);
      expect(result).not.toBeNull();
      expect(result?.severity).toBe('info');
      expect(result?.reason).toContain('0 gym sessions');
    });

    it('boundary: 4 study completions does NOT trigger', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        gym: { ...defaultSnapshot.gym, gymCompletionsThisWeek: 0 },
        study: { studyCompletionsThisWeek: 4 },
      };
      expect(ruleBalanceCheck(snap)).toBeNull();
    });

    it('does not trigger if user has completed at least 1 gym workout this week', () => {
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        gym: { ...defaultSnapshot.gym, gymCompletionsThisWeek: 1 },
        study: { studyCompletionsThisWeek: 6 },
      };
      expect(ruleBalanceCheck(snap)).toBeNull();
    });
  });

  describe('Engine: generateSuggestions', () => {
    it('returns empty array when no rules trigger', () => {
      const results = generateSuggestions(defaultSnapshot);
      expect(results).toEqual([]);
    });

    it('sorts suggestions with warnings first, then nudges, then info', () => {
      // Trigger Rule 1 (warning), Rule 2 (nudge), Rule 6 (info)
      const snap: DaySnapshot = {
        ...defaultSnapshot,
        hour: 19,
        tasks: { ...defaultSnapshot.tasks, nearestP1StudyDueDaysAway: 1 },
        protein: { totalGrams: 20, goalGrams: 100 },
        gym: { ...defaultSnapshot.gym, gymCompletionsThisWeek: 0 },
        study: { studyCompletionsThisWeek: 5 },
      };

      const results = generateSuggestions(snap);
      expect(results.length).toBe(3);
      expect(results[0].severity).toBe('warning');
      expect(results[1].severity).toBe('nudge');
      expect(results[2].severity).toBe('info');
    });

    it('caps output at exactly 3 results even when more rules trigger', () => {
      // Trigger Rule 1, Rule 2, Rule 3, Rule 4, Rule 5
      const crowdedSnapshot: DaySnapshot = {
        today: '2026-11-23',
        hour: 19,
        tasks: {
          pendingCountByCategory: { study: 3, gym: 1, skincare: 1, chore: 1, other: 0 },
          overdueCount: 4, // triggers Rule 5 (warning)
          nearestP1StudyDueDaysAway: 1, // triggers Rule 1 (warning)
        },
        gym: {
          isGymPendingToday: true, // triggers Rule 4 (nudge)
          gymCompletionsThisWeek: 0,
        },
        study: {
          studyCompletionsThisWeek: 6, // triggers Rule 6 (info)
        },
        protein: {
          totalGrams: 20,
          goalGrams: 100, // triggers Rule 2 (nudge)
        },
        expenses: {
          foodBudgetUsedPercent: 95, // triggers Rule 3 (nudge)
          overallBudgetUsedPercent: 92,
        },
      };

      const results = generateSuggestions(crowdedSnapshot);
      expect(results.length).toBe(3);
      // Both warnings should be present in top 3
      const severities = results.map((r) => r.severity);
      expect(severities.filter((s) => s === 'warning').length).toBe(2);
    });
  });
});
