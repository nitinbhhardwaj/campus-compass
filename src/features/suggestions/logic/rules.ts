import { DaySnapshot, Suggestion } from '../types/suggestion';

/**
 * Rule 1: Deadline pressure
 * Trigger: Priority-1 study task due within 2 days (<= 2 days away).
 */
export function ruleDeadlinePressure(snapshot: DaySnapshot): Suggestion | null {
  const daysAway = snapshot.tasks.nearestP1StudyDueDaysAway;
  if (daysAway === null || daysAway > 2) {
    return null;
  }

  let timingPhrase = '';
  if (daysAway < 0) {
    const overdueDays = Math.abs(daysAway);
    timingPhrase = `${overdueDays} ${overdueDays === 1 ? 'day' : 'days'} overdue`;
  } else if (daysAway === 0) {
    timingPhrase = 'due today';
  } else {
    timingPhrase = `due in ${daysAway} ${daysAway === 1 ? 'day' : 'days'}`;
  }

  return {
    id: 'rule-deadline-pressure',
    severity: 'warning',
    title: 'Study Deadline Approaching',
    reason: `A priority-1 study task is ${timingPhrase}.`,
    action: 'Focus on your study blocks and consider deferring chores and skincare to later.',
  };
}

/**
 * Rule 2: Protein low in the evening
 * Trigger: hour >= 18 and total < 60% of goal.
 * Context-aware: If food budget is >= 80% (or overall >= 90%), suggests budget-friendly options.
 */
export function ruleProteinLowInEvening(snapshot: DaySnapshot): Suggestion | null {
  if (snapshot.hour < 18) {
    return null;
  }

  const { totalGrams, goalGrams, dietPreference = 'veg' } = snapshot.protein;
  if (goalGrams <= 0) {
    return null;
  }

  // Strictly less than 60% of goal
  const isBelow60Percent = totalGrams < 0.6 * goalGrams;
  if (!isBelow60Percent) {
    return null;
  }

  const percentCurrent = Math.round((totalGrams / goalGrams) * 100);
  const remaining = Math.max(0, goalGrams - totalGrams);

  const isFoodBudgetTight =
    snapshot.expenses.foodBudgetUsedPercent !== null &&
    snapshot.expenses.foodBudgetUsedPercent >= 80;
  const isOverallBudgetTight = snapshot.expenses.overallBudgetUsedPercent >= 90;

  const isBudgetConstrained = isFoodBudgetTight || isOverallBudgetTight;

  let foodOptions = '';
  if (isBudgetConstrained) {
    if (dietPreference === 'veg') {
      foodOptions = 'budget-friendly staples like curd, dal, or soya chunks';
    } else {
      // 'egg' and 'non-veg' users can have boiled eggs in budget options
      foodOptions = 'budget-friendly staples like boiled eggs, curd, dal, or soya chunks';
    }
  } else {
    if (dietPreference === 'veg') {
      foodOptions = 'a high-protein dinner or quick snack (paneer, whey, or soya chunks)';
    } else if (dietPreference === 'egg') {
      foodOptions = 'a high-protein dinner or quick snack (eggs, paneer, whey, or soya chunks)';
    } else {
      foodOptions = 'a high-protein dinner or quick snack (paneer, chicken, whey, or eggs)';
    }
  }

  const actionText = `Close the ${remaining}g gap with ${foodOptions}.`;

  return {
    id: 'rule-protein-low-evening',
    severity: 'nudge',
    title: 'Evening Protein Catch-Up',
    reason: `Protein is ${totalGrams}g of ${goalGrams}g (${percentCurrent}%) and it is ${snapshot.hour}:00 (after 6 PM).`,
    action: actionText,
  };
}

/**
 * Rule 3: Food budget warning
 * Trigger: Food budget >= 80% used.
 */
export function ruleFoodBudgetWarning(snapshot: DaySnapshot): Suggestion | null {
  const percent = snapshot.expenses.foodBudgetUsedPercent;
  if (percent === null || percent < 80) {
    return null;
  }

  return {
    id: 'rule-food-budget-warning',
    severity: percent > 100 ? 'warning' : 'nudge',
    title: percent > 100 ? 'Food Budget Exceeded' : 'Food Budget Alert',
    reason: `Food budget is ${percent}% used for this month.`,
    action: 'Consider opting for home-cooked or campus mess meals to stay within your monthly budget.',
  };
}

/**
 * Rule 4: Gym at risk
 * Trigger: Gym task pending today, hour >= 17, and deadline pressure (Rule 1) is active.
 */
export function ruleGymAtRisk(snapshot: DaySnapshot): Suggestion | null {
  if (!snapshot.gym.isGymPendingToday) {
    return null;
  }

  if (snapshot.hour < 17) {
    return null;
  }

  const daysAway = snapshot.tasks.nearestP1StudyDueDaysAway;
  const hasDeadlinePressure = daysAway !== null && daysAway <= 2;
  if (!hasDeadlinePressure) {
    return null;
  }

  let deadlinePhrase = '';
  if (daysAway < 0) {
    const overdueDays = Math.abs(daysAway);
    deadlinePhrase = `${overdueDays} ${overdueDays === 1 ? 'day' : 'days'} overdue`;
  } else if (daysAway === 0) {
    deadlinePhrase = 'due today';
  } else {
    deadlinePhrase = `due in ${daysAway} ${daysAway === 1 ? 'day' : 'days'}`;
  }

  return {
    id: 'rule-gym-at-risk',
    severity: 'nudge',
    title: 'Gym Workout at Risk',
    reason: `Gym workout is pending at ${snapshot.hour}:00 while a priority study deadline is ${deadlinePhrase}.`,
    action: 'Opt for a lighter or shorter 20-30 min session rather than skipping your workout entirely.',
  };
}

/**
 * Rule 5: Overdue pile-up
 * Trigger: 3 or more overdue tasks.
 */
export function ruleOverduePileUp(snapshot: DaySnapshot): Suggestion | null {
  if (snapshot.tasks.overdueCount < 3) {
    return null;
  }

  return {
    id: 'rule-overdue-pile-up',
    severity: 'warning',
    title: 'Overdue Tasks Backlog',
    reason: `You have ${snapshot.tasks.overdueCount} overdue tasks carried over.`,
    action: 'Clear the smallest or quickest overdue task first to regain momentum.',
  };
}

/**
 * Rule 6: Balance check
 * Trigger: 0 gym completions this week while 5 or more study tasks were completed.
 */
export function ruleBalanceCheck(snapshot: DaySnapshot): Suggestion | null {
  if (snapshot.gym.gymCompletionsThisWeek > 0) {
    return null;
  }

  if (snapshot.study.studyCompletionsThisWeek < 5) {
    return null;
  }

  return {
    id: 'rule-balance-check',
    severity: 'info',
    title: 'Weekly Routine Balance',
    reason: `0 gym sessions completed this week alongside ${snapshot.study.studyCompletionsThisWeek} completed study blocks.`,
    action: 'Schedule a short workout or movement break to balance academic focus with physical health.',
  };
}
