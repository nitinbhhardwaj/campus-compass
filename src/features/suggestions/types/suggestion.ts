export type SuggestionSeverity = 'warning' | 'nudge' | 'info';

export interface Suggestion {
  id: string;
  severity: SuggestionSeverity;
  title: string;
  reason: string;
  action?: string;
}

export type SnapshotTaskCategory = 'study' | 'gym' | 'skincare' | 'chore' | 'other';

/**
 * Plain input contract representing all facts needed by the rule engine.
 * Contains only primitive types. Independent of tasks, protein, or expense modules.
 */
export interface DaySnapshot {
  today: string;         // 'YYYY-MM-DD'
  hour: number;          // 0 - 23 (never read from system clock internally)
  tasks: {
    pendingCountByCategory: Record<SnapshotTaskCategory, number>;
    overdueCount: number;
    nearestP1StudyDueDaysAway: number | null; // e.g. 0 = due today, 1 = tomorrow, 2 = in 2 days, null = none pending
  };
  gym: {
    isGymPendingToday: boolean;
    gymCompletionsThisWeek: number;
  };
  study: {
    studyCompletionsThisWeek: number;
  };
  protein: {
    totalGrams: number;
    goalGrams: number;
  };
  expenses: {
    foodBudgetUsedPercent: number | null; // null if no budget configured
    overallBudgetUsedPercent: number;     // percentage (e.g. 85, 110)
  };
}

export type SuggestionRule = (snapshot: DaySnapshot) => Suggestion | null;
