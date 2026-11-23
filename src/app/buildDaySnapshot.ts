import { Task } from '../types/task';
import { ExpenseCategory } from '../features/expenses/types/expense';
import { DaySnapshot, SnapshotTaskCategory } from '../features/suggestions/types/suggestion';
import {
  isTaskForToday,
  isTaskCompletedOnDate,
  isTaskOverdue,
  getWeeklySummary,
} from '../features/tasks/logic/taskLogic';
import { budgetUsedPercent } from '../features/expenses/logic/expenseLogic';

export interface BuildDaySnapshotParams {
  tasks: Task[];
  today: string;         // 'YYYY-MM-DD'
  hour: number;          // 0 - 23
  protein: {
    totalGrams: number;
    goalGrams: number;
  };
  expenses: {
    totalSpentPaise: number;
    monthlyBudgetPaise: number;
    categoryTotals: Record<ExpenseCategory, number>;
    categoryBudgetsPaise?: Partial<Record<ExpenseCategory, number>>;
  };
  weekRange: {
    startDate: string;
    endDate: string;
  };
}

/**
 * Calculates calendar day difference (to - from) using local date components.
 */
function daysBetweenDates(fromDateStr: string, toDateStr: string): number {
  const [y1, m1, d1] = fromDateStr.split('-').map(Number);
  const [y2, m2, d2] = toDateStr.split('-').map(Number);
  const d1Utc = Date.UTC(y1, m1 - 1, d1);
  const d2Utc = Date.UTC(y2, m2 - 1, d2);
  return Math.round((d2Utc - d1Utc) / (1000 * 60 * 60 * 24));
}

/**
 * Anti-Corruption Adapter: Converts heterogeneous domain models (Tasks, Protein, Expenses)
 * into a single unified, primitive-only DaySnapshot required by the suggestions engine.
 * 
 * Architectural Defense (Dependency Inversion):
 * This file is the single convergence point across modules.
 * Neither the suggestions engine nor the domain modules depend on each other.
 */
export function buildDaySnapshot(params: BuildDaySnapshotParams): DaySnapshot {
  const { tasks, today, hour, protein, expenses, weekRange } = params;

  // 1. Tasks Category Counts & Overdue Count
  const pendingCountByCategory: Record<SnapshotTaskCategory, number> = {
    study: 0,
    gym: 0,
    skincare: 0,
    chore: 0,
    other: 0,
  };

  let overdueCount = 0;
  let nearestP1StudyDays: number | null = null;

  for (const task of tasks) {
    const isCompleted = isTaskCompletedOnDate(task, today);
    const isDueOrOverdue = isTaskForToday(task, today);

    if (isDueOrOverdue && !isCompleted) {
      if (pendingCountByCategory[task.category] !== undefined) {
        pendingCountByCategory[task.category] += 1;
      }
    }

    if (isTaskOverdue(task, today)) {
      overdueCount += 1;
    }

    // Nearest pending priority-1 study task calculation
    if (task.category === 'study' && task.priority === 1 && !isCompleted) {
      const diff = daysBetweenDates(today, task.dueDate);
      if (nearestP1StudyDays === null || diff < nearestP1StudyDays) {
        nearestP1StudyDays = diff;
      }
    }
  }

  // 2. Gym Status
  const isGymPendingToday = tasks.some(
    (t) => t.category === 'gym' && isTaskForToday(t, today) && !isTaskCompletedOnDate(t, today)
  );

  const weeklySummary = getWeeklySummary(tasks, weekRange.startDate, weekRange.endDate);
  const gymCompletionsThisWeek = weeklySummary.byCategory.gym || 0;
  const studyCompletionsThisWeek = weeklySummary.byCategory.study || 0;

  // 3. Expenses Status
  const foodBudgetPaise = expenses.categoryBudgetsPaise?.food;
  const foodSpentPaise = expenses.categoryTotals.food || 0;
  const foodBudgetUsedPercent =
    foodBudgetPaise && foodBudgetPaise > 0
      ? budgetUsedPercent(foodSpentPaise, foodBudgetPaise)
      : null;

  const overallBudgetUsedPercent = budgetUsedPercent(
    expenses.totalSpentPaise,
    expenses.monthlyBudgetPaise
  );

  return {
    today,
    hour,
    tasks: {
      pendingCountByCategory,
      overdueCount,
      nearestP1StudyDueDaysAway: nearestP1StudyDays,
    },
    gym: {
      isGymPendingToday,
      gymCompletionsThisWeek,
    },
    study: {
      studyCompletionsThisWeek,
    },
    protein: {
      totalGrams: protein.totalGrams,
      goalGrams: protein.goalGrams,
    },
    expenses: {
      foodBudgetUsedPercent,
      overallBudgetUsedPercent,
    },
  };
}
