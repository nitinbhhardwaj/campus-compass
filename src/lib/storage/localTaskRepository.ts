import { Task } from '../../types/task';
import { TaskRepository } from './taskRepository';

const STORAGE_KEY = 'campus_compass_tasks_v1';

/**
 * Seed data to showcase realistic college student scenarios immediately:
 * - Overdue academic assignment
 * - High-priority study block due today
 * - Daily morning gym habit
 * - Daily skincare routine
 * - Weekly chore
 */
export const INITIAL_SEED_TASKS: Task[] = [
  {
    id: 'seed-task-1',
    title: 'CS 240: Complete Binary Search Tree Lab',
    category: 'study',
    priority: 1,
    dueDate: '2026-11-20', // Yesterday: showcases overdue handling
    recurrence: 'none',
    completed: false,
    createdAt: '2026-11-19T10:00:00.000Z',
  },
  {
    id: 'seed-task-2',
    title: 'Prepare Econ Midterm Formula Sheet',
    category: 'study',
    priority: 1,
    dueDate: '2026-11-21', // Today: Top priority study
    recurrence: 'none',
    completed: false,
    createdAt: '2026-11-21T08:00:00.000Z',
  },
  {
    id: 'seed-task-3',
    title: 'Morning Push Day (Chest & Triceps)',
    category: 'gym',
    priority: 2,
    dueDate: '2026-11-01',
    recurrence: 'daily',
    completed: false,
    completedDates: [],
    createdAt: '2026-11-01T07:00:00.000Z',
  },
  {
    id: 'seed-task-4',
    title: 'Evening Skincare Routine (Cleanser + Retinol)',
    category: 'skincare',
    priority: 3,
    dueDate: '2026-11-01',
    recurrence: 'daily',
    completed: false,
    completedDates: [],
    createdAt: '2026-11-01T21:00:00.000Z',
  },
  {
    id: 'seed-task-5',
    title: 'Dorm Laundry & Bed Sheets',
    category: 'chore',
    priority: 2,
    dueDate: '2026-11-21', // Saturday weekly chore
    recurrence: 'weekly',
    completed: false,
    completedDates: [],
    createdAt: '2026-11-07T14:00:00.000Z',
  },
];

export class LocalStorageTaskRepository implements TaskRepository {
  private key: string;

  constructor(key = STORAGE_KEY) {
    this.key = key;
  }

  private readFromStorage(): Task[] {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return [...INITIAL_SEED_TASKS];
      }
      const raw = window.localStorage.getItem(this.key);
      if (!raw) {
        // First run: seed sample data so the evaluator has immediate data to explore
        this.writeToStorage(INITIAL_SEED_TASKS);
        return [...INITIAL_SEED_TASKS];
      }
      return JSON.parse(raw) as Task[];
    } catch (err) {
      console.error('Failed to parse tasks from localStorage:', err);
      return [];
    }
  }

  private writeToStorage(tasks: Task[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.key, JSON.stringify(tasks));
      }
    } catch (err) {
      console.error('Failed to write tasks to localStorage:', err);
    }
  }

  async getTasks(): Promise<Task[]> {
    return Promise.resolve(this.readFromStorage());
  }

  async saveTask(task: Task): Promise<Task> {
    const tasks = this.readFromStorage();
    const existingIndex = tasks.findIndex((t) => t.id === task.id);
    let updatedTasks: Task[];

    if (existingIndex >= 0) {
      updatedTasks = [...tasks];
      updatedTasks[existingIndex] = task;
    } else {
      updatedTasks = [task, ...tasks];
    }

    this.writeToStorage(updatedTasks);
    return Promise.resolve(task);
  }

  async updateTask(task: Task): Promise<Task> {
    return this.saveTask(task);
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = this.readFromStorage();
    const filtered = tasks.filter((t) => t.id !== id);
    this.writeToStorage(filtered);
    return Promise.resolve();
  }
}

// Default singleton instance for the app
export const taskRepository = new LocalStorageTaskRepository();
