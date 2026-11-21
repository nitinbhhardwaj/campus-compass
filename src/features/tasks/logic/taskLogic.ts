import { Task, TaskCategory } from '../../../types/task';
import { getDayOfWeek, addDays } from '../../../lib/dateUtils';

/**
 * Pure function: Checks if a task is marked completed on a specific local date.
 * Recurring tasks check completedDates array; non-recurring check the boolean completed field.
 */
export function isTaskCompletedOnDate(task: Task, date: string): boolean {
  if (task.recurrence === 'none') {
    return task.completed;
  }
  return Boolean(task.completedDates && task.completedDates.includes(date));
}

/**
 * Pure function: Checks if a task is overdue relative to "today".
 * Only non-recurring, uncompleted tasks with dueDate < today are overdue.
 */
export function isTaskOverdue(task: Task, today: string): boolean {
  if (task.recurrence !== 'none') {
    return false;
  }
  return !task.completed && task.dueDate < today;
}

/**
 * Pure function: Evaluates whether a task belongs to the "Today" view.
 * 
 * Rules:
 * - Non-recurring:
 *   - Due today -> included.
 *   - Due in the past AND uncompleted -> included (overdue).
 *   - Due in the past AND completed -> excluded (past accomplishment).
 *   - Due in the future -> excluded.
 * - Daily:
 *   - dueDate <= today -> included every day once started.
 *   - dueDate > today -> excluded (has not started yet).
 * - Weekly:
 *   - dueDate <= today AND same day of the week -> included.
 *   - Otherwise -> excluded.
 */
export function isTaskForToday(task: Task, today: string): boolean {
  if (task.dueDate > today) {
    return false;
  }

  if (task.recurrence === 'none') {
    if (task.dueDate === today) {
      return true;
    }
    // Overdue: past dueDate and still incomplete
    return isTaskOverdue(task, today);
  }

  if (task.recurrence === 'daily') {
    return task.dueDate <= today;
  }

  if (task.recurrence === 'weekly') {
    return (
      task.dueDate <= today &&
      getDayOfWeek(task.dueDate) === getDayOfWeek(today)
    );
  }

  return false;
}

/**
 * Pure function: Sorts tasks for the Today view.
 * 
 * Sorting Hierarchy:
 * 1. Completion status: Incomplete tasks first, completed tasks last.
 * 2. Priority: 1 (High) -> 2 (Medium) -> 3 (Low).
 * 3. Overdue urgency: Overdue tasks precede non-overdue tasks at the same priority.
 * 4. Stable tie-breaker: Earlier dueDate, then earlier createdAt.
 */
export function sortTasksByPriority(tasks: Task[], today: string): Task[] {
  return [...tasks].sort((a, b) => {
    const aCompleted = isTaskCompletedOnDate(a, today);
    const bCompleted = isTaskCompletedOnDate(b, today);

    // 1. Incomplete before completed
    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1;
    }

    // 2. Priority: 1 (High) -> 2 (Medium) -> 3 (Low)
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }

    // 3. Overdue tasks come before non-overdue tasks
    const aOverdue = isTaskOverdue(a, today);
    const bOverdue = isTaskOverdue(b, today);
    if (aOverdue !== bOverdue) {
      return aOverdue ? -1 : 1;
    }

    // 4. Stable tie-breaker: Due date then creation date
    if (a.dueDate !== b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    return a.createdAt.localeCompare(b.createdAt);
  });
}

/**
 * Pure function: Filters tasks by category chip selection.
 */
export function filterTasksByCategory(
  tasks: Task[],
  category: TaskCategory | 'all'
): Task[] {
  if (category === 'all') {
    return tasks;
  }
  return tasks.filter((t) => t.category === category);
}

/**
 * Pure function: Combines filtering for today and priority sorting.
 */
export function filterAndSortTodayTasks(tasks: Task[], today: string): Task[] {
  const todayTasks = tasks.filter((task) => isTaskForToday(task, today));
  return sortTasksByPriority(todayTasks, today);
}

/**
 * Pure function: Returns an immutable updated copy of the task with its completion status toggled for `date`.
 */
export function toggleTaskCompletion(task: Task, date: string): Task {
  if (task.recurrence === 'none') {
    const nextCompleted = !task.completed;
    return {
      ...task,
      completed: nextCompleted,
    };
  }

  const existingDates = task.completedDates || [];
  const isAlreadyCompleted = existingDates.includes(date);
  const nextDates = isAlreadyCompleted
    ? existingDates.filter((d: string) => d !== date)
    : [...existingDates, date];

  return {
    ...task,
    completed: nextDates.includes(date),
    completedDates: nextDates,
  };
}

/**
 * Pure function: Returns an immutable updated copy of the task with modified fields.
 */
export function updateTaskDetails(
  task: Task,
  updates: Partial<Pick<Task, 'title' | 'category' | 'priority' | 'dueDate' | 'recurrence'>>
): Task {
  return {
    ...task,
    ...updates,
  };
}

export interface WeeklySummary {
  byCategory: Record<TaskCategory, number>;
  totalCompleted: number;
}

/**
 * Pure function: Computes completion counts per category for a given date range [startDate, endDate].
 * - Non-recurring: counted if completed and dueDate is within [startDate, endDate].
 * - Recurring: counts every completed date that falls within [startDate, endDate].
 */
export function getWeeklySummary(
  tasks: Task[],
  startDate: string,
  endDate: string
): WeeklySummary {
  const byCategory: Record<TaskCategory, number> = {
    study: 0,
    gym: 0,
    skincare: 0,
    chore: 0,
    other: 0,
  };

  let totalCompleted = 0;

  for (const task of tasks) {
    if (task.recurrence === 'none') {
      if (task.completed && task.dueDate >= startDate && task.dueDate <= endDate) {
        byCategory[task.category] += 1;
        totalCompleted += 1;
      }
    } else if (task.completedDates && task.completedDates.length > 0) {
      for (const d of task.completedDates) {
        if (d >= startDate && d <= endDate) {
          byCategory[task.category] += 1;
          totalCompleted += 1;
        }
      }
    }
  }

  return { byCategory, totalCompleted };
}

/**
 * Pure function: Computes the current active streak for a recurring task relative to `today`.
 * 
 * Rules:
 * - Non-recurring tasks return 0.
 * - If no completions recorded, returns 0.
 * - For daily tasks:
 *   - If completed today -> streak = 1 + consecutive completions backwards.
 *   - If NOT completed today:
 *     - If completed yesterday -> streak = 1 + consecutive completions prior to yesterday (active streak pending today).
 *     - If NOT completed yesterday -> streak is broken (0).
 * - For weekly tasks:
 *   - Computes consecutive weekly cycles on the task's scheduled weekday.
 */
export function computeStreak(task: Task, today: string): number {
  if (task.recurrence === 'none') {
    return 0;
  }

  const completedDates = task.completedDates || [];
  if (completedDates.length === 0) {
    return 0;
  }

  const completedSet = new Set(completedDates);

  if (task.recurrence === 'daily') {
    const isDoneToday = completedSet.has(today);
    const yesterday = addDays(today, -1);
    const isDoneYesterday = completedSet.has(yesterday);

    // If neither today nor yesterday was done, streak is broken
    if (!isDoneToday && !isDoneYesterday) {
      return 0;
    }

    let streak = 0;
    let cursor = isDoneToday ? today : yesterday;

    while (completedSet.has(cursor)) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }

    return streak;
  }

  if (task.recurrence === 'weekly') {
    const targetDayOfWeek = getDayOfWeek(task.dueDate);
    const todayDayOfWeek = getDayOfWeek(today);
    const diff = (todayDayOfWeek - targetDayOfWeek + 7) % 7;
    const mostRecentOccurrence = addDays(today, -diff);

    if (mostRecentOccurrence < task.dueDate) {
      return 0;
    }

    let cursor = mostRecentOccurrence;
    // If today is the scheduled day and not done yet, check the previous week
    if (mostRecentOccurrence === today && !completedSet.has(today)) {
      cursor = addDays(today, -7);
    }

    if (cursor < task.dueDate || !completedSet.has(cursor)) {
      return 0;
    }

    let streak = 0;
    while (cursor >= task.dueDate && completedSet.has(cursor)) {
      streak += 1;
      cursor = addDays(cursor, -7);
    }

    return streak;
  }

  return 0;
}
