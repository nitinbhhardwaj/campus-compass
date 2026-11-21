import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, CreateTaskDTO } from '../../../types/task';
import { TaskRepository } from '../../../lib/storage/taskRepository';
import { taskRepository as defaultRepo } from '../../../lib/storage/localTaskRepository';
import {
  filterAndSortTodayTasks,
  toggleTaskCompletion,
  isTaskCompletedOnDate,
  isTaskOverdue,
} from '../logic/taskLogic';
import { formatLocalDate } from '../../../lib/dateUtils';

export function useTasks(
  repo: TaskRepository = defaultRepo,
  today: string = formatLocalDate()
) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await repo.getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Could not load your tasks.');
    } finally {
      setIsLoading(false);
    }
  }, [repo]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = async (dto: CreateTaskDTO): Promise<Task> => {
    const newTask: Task = {
      ...dto,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      completed: false,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };

    const saved = await repo.saveTask(newTask);
    setTasks((prev) => [saved, ...prev]);
    return saved;
  };

  const toggleTask = async (taskId: string): Promise<void> => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const updated = toggleTaskCompletion(target, today);
    // Optimistic UI update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));

    try {
      await repo.updateTask(updated);
    } catch (err) {
      console.error('Failed to update task:', err);
      // Rollback on failure
      setTasks((prev) => prev.map((t) => (t.id === taskId ? target : t)));
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    const previous = [...tasks];
    // Optimistic UI update
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await repo.deleteTask(taskId);
    } catch (err) {
      console.error('Failed to delete task:', err);
      // Rollback on failure
      setTasks(previous);
    }
  };

  // Pure derived view for today
  const todayTasks = useMemo(() => {
    return filterAndSortTodayTasks(tasks, today);
  }, [tasks, today]);

  // Derived progress statistics
  const stats = useMemo(() => {
    const total = todayTasks.length;
    const completed = todayTasks.filter((t) => isTaskCompletedOnDate(t, today)).length;
    const overdueCount = todayTasks.filter((t) => isTaskOverdue(t, today)).length;
    return {
      total,
      completed,
      overdueCount,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [todayTasks, today]);

  return {
    tasks,
    todayTasks,
    stats,
    isLoading,
    error,
    today,
    addTask,
    toggleTask,
    deleteTask,
    refreshTasks: loadTasks,
  };
}
