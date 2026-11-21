import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, CreateTaskDTO } from '../../../types/task';
import { TaskRepository } from '../../../lib/storage/taskRepository';
import { taskRepository as defaultRepo } from '../../../lib/storage/localTaskRepository';
import {
  filterAndSortTodayTasks,
  toggleTaskCompletion,
  isTaskCompletedOnDate,
  isTaskOverdue,
  filterTasksByCategory,
  updateTaskDetails,
  getWeeklySummary,
} from '../logic/taskLogic';
import { formatLocalDate, getWeekRange } from '../../../lib/dateUtils';
import { CategoryFilterType } from '../components/CategoryFilter';

export function useTasks(
  repo: TaskRepository = defaultRepo,
  today: string = formatLocalDate()
) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterType>('all');

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

  const updateTask = async (
    taskId: string,
    updates: Partial<Pick<Task, 'title' | 'category' | 'priority' | 'dueDate' | 'recurrence'>>
  ): Promise<Task | null> => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return null;

    const updated = updateTaskDetails(target, updates);
    // Optimistic UI update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));

    try {
      await repo.updateTask(updated);
      return updated;
    } catch (err) {
      console.error('Failed to update task:', err);
      // Rollback on failure
      setTasks((prev) => prev.map((t) => (t.id === taskId ? target : t)));
      return null;
    }
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

  // Pure derived list of all tasks relevant for today (unfiltered by category)
  const todayTasks = useMemo(() => {
    return filterAndSortTodayTasks(tasks, today);
  }, [tasks, today]);

  // Filtered by selected category chip
  const filteredTasks = useMemo(() => {
    return filterTasksByCategory(todayTasks, categoryFilter);
  }, [todayTasks, categoryFilter]);

  // Counts for each category filter badge
  const categoryCounts = useMemo<Record<CategoryFilterType, number>>(() => {
    const counts: Record<CategoryFilterType, number> = {
      all: todayTasks.length,
      study: 0,
      gym: 0,
      skincare: 0,
      chore: 0,
      other: 0,
    };
    for (const t of todayTasks) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return counts;
  }, [todayTasks]);

  // Derived progress statistics for today's plan
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

  // Weekly summary and range
  const weekRange = useMemo(() => {
    return getWeekRange(today);
  }, [today]);

  const weeklySummary = useMemo(() => {
    return getWeeklySummary(tasks, weekRange.startDate, weekRange.endDate);
  }, [tasks, weekRange]);

  return {
    tasks,
    todayTasks,
    filteredTasks,
    categoryCounts,
    categoryFilter,
    setCategoryFilter,
    stats,
    weekRange,
    weeklySummary,
    isLoading,
    error,
    today,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    refreshTasks: loadTasks,
  };
}
