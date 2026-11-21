import { Task } from '../../../types/task';
import { getDayOfWeek } from '../../../lib/dateUtils';

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
 * Pure function: Combines filtering and sorting for today's view.
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
