import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageTaskRepository } from './localTaskRepository';
import { Task } from '../../types/task';

describe('LocalStorageTaskRepository', () => {
  let mockStorage: Record<string, string> = {};
  const testKey = 'test_tasks_repo';

  beforeEach(() => {
    mockStorage = {};
    // Mock global window and localStorage for node environment
    (globalThis as unknown as { window: { localStorage: Storage } }).window = {
      localStorage: {
        getItem: (k: string) => mockStorage[k] ?? null,
        setItem: (k: string, v: string) => {
          mockStorage[k] = v;
        },
        removeItem: (k: string) => {
          delete mockStorage[k];
        },
        clear: () => {
          mockStorage = {};
        },
        key: (_index: number) => null,
        length: Object.keys(mockStorage).length,
      } as Storage,
    };
  });

  it('seeds initial data on empty storage', async () => {
    const repo = new LocalStorageTaskRepository(testKey);
    const tasks = await repo.getTasks();
    expect(tasks.length).toBeGreaterThan(0);
    expect(mockStorage[testKey]).toBeDefined();
  });

  it('saves and retrieves a new task asynchronously', async () => {
    const repo = new LocalStorageTaskRepository(testKey);
    const newTask: Task = {
      id: 'custom-task-1',
      title: 'Review Chem notes',
      category: 'study',
      priority: 2,
      dueDate: '2026-11-21',
      recurrence: 'none',
      completed: false,
      createdAt: '2026-11-21T09:00:00.000Z',
    };

    const saved = await repo.saveTask(newTask);
    expect(saved).toEqual(newTask);

    const tasks = await repo.getTasks();
    const found = tasks.find((t) => t.id === 'custom-task-1');
    expect(found).toBeDefined();
    expect(found?.title).toBe('Review Chem notes');
  });

  it('updates an existing task', async () => {
    const repo = new LocalStorageTaskRepository(testKey);
    const task: Task = {
      id: 'task-update-test',
      title: 'Water plants',
      category: 'chore',
      priority: 3,
      dueDate: '2026-11-21',
      recurrence: 'none',
      completed: false,
      createdAt: '2026-11-21T09:00:00.000Z',
    };

    await repo.saveTask(task);
    const updated = await repo.updateTask({ ...task, completed: true });
    expect(updated.completed).toBe(true);

    const tasks = await repo.getTasks();
    const retrieved = tasks.find((t) => t.id === 'task-update-test');
    expect(retrieved?.completed).toBe(true);
  });

  it('deletes a task by id', async () => {
    const repo = new LocalStorageTaskRepository(testKey);
    const task: Task = {
      id: 'task-to-delete',
      title: 'Delete me',
      category: 'other',
      priority: 3,
      dueDate: '2026-11-21',
      recurrence: 'none',
      completed: false,
      createdAt: '2026-11-21T09:00:00.000Z',
    };

    await repo.saveTask(task);
    await repo.deleteTask('task-to-delete');

    const tasks = await repo.getTasks();
    expect(tasks.some((t) => t.id === 'task-to-delete')).toBe(false);
  });
});
