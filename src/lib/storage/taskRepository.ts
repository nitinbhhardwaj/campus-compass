import { Task } from '../../types/task';

/**
 * Abstract Repository Interface for Task persistence.
 * All methods are asynchronous returning Promises, enabling seamless swapping
 * between LocalStorage, Supabase, IndexedDB, or an external REST API
 * without modifying UI components or hooks.
 */
export interface TaskRepository {
  getTasks(): Promise<Task[]>;
  saveTask(task: Task): Promise<Task>;
  updateTask(task: Task): Promise<Task>;
  deleteTask(id: string): Promise<void>;
}
