export type TaskCategory = 'study' | 'gym' | 'skincare' | 'chore' | 'other';

/**
 * Priority Levels:
 * 1 = High (Urgent / Core priority)
 * 2 = Medium (Standard)
 * 3 = Low (Nice-to-have)
 */
export type TaskPriority = 1 | 2 | 3;

export type TaskRecurrence = 'none' | 'daily' | 'weekly';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string;           // Local date string in 'YYYY-MM-DD' format
  recurrence: TaskRecurrence;
  completed: boolean;        // Completion state for non-recurring, or cached status
  completedDates?: string[]; // Array of 'YYYY-MM-DD' dates for recurring task completions
  createdAt: string;         // ISO 8601 creation timestamp
}

export type CreateTaskDTO = Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedDates'>;
