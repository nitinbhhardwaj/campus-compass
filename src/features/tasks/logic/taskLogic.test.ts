import { describe, it, expect } from 'vitest';
import { Task } from '../../../types/task';
import {
  isTaskCompletedOnDate,
  isTaskOverdue,
  isTaskForToday,
  sortTasksByPriority,
  filterAndSortTodayTasks,
  toggleTaskCompletion,
} from './taskLogic';

describe('taskLogic pure functions', () => {
  const baseTask: Task = {
    id: 'task-1',
    title: 'Study Algorithms',
    category: 'study',
    priority: 1,
    dueDate: '2026-11-21',
    recurrence: 'none',
    completed: false,
    createdAt: '2026-11-21T08:00:00.000Z',
  };

  describe('1. Daily recurrence across days', () => {
    const dailyTask: Task = {
      ...baseTask,
      id: 'daily-gym',
      title: 'Morning Gym',
      category: 'gym',
      recurrence: 'daily',
      dueDate: '2026-11-20',
      completedDates: ['2026-11-21'],
    };

    it('shows completed on the date it was completed (2026-11-21)', () => {
      expect(isTaskCompletedOnDate(dailyTask, '2026-11-21')).toBe(true);
    });

    it('shows incomplete on the next day (2026-11-22)', () => {
      expect(isTaskCompletedOnDate(dailyTask, '2026-11-22')).toBe(false);
    });

    it('shows incomplete on a previous date it was not completed on (2026-11-20)', () => {
      expect(isTaskCompletedOnDate(dailyTask, '2026-11-20')).toBe(false);
    });

    it('correctly toggles completion on the next day without affecting the previous day', () => {
      const updated = toggleTaskCompletion(dailyTask, '2026-11-22');
      expect(isTaskCompletedOnDate(updated, '2026-11-21')).toBe(true);
      expect(isTaskCompletedOnDate(updated, '2026-11-22')).toBe(true);
      expect(updated.completedDates).toEqual(['2026-11-21', '2026-11-22']);

      const untoggled = toggleTaskCompletion(updated, '2026-11-21');
      expect(isTaskCompletedOnDate(untoggled, '2026-11-21')).toBe(false);
      expect(isTaskCompletedOnDate(untoggled, '2026-11-22')).toBe(true);
    });
  });

  describe('2. Weekly recurrence on the wrong weekday', () => {
    // 2026-11-18 is Wednesday
    const weeklyTask: Task = {
      ...baseTask,
      id: 'weekly-laundry',
      title: 'Laundry',
      category: 'chore',
      dueDate: '2026-11-18', // Wednesday
      recurrence: 'weekly',
    };

    it('does not appear on a different weekday (2026-11-19 is Thursday)', () => {
      expect(isTaskForToday(weeklyTask, '2026-11-19')).toBe(false);
    });

    it('does not appear on 2026-11-21 (Saturday)', () => {
      expect(isTaskForToday(weeklyTask, '2026-11-21')).toBe(false);
    });

    it('appears on the next Wednesday (2026-11-25)', () => {
      expect(isTaskForToday(weeklyTask, '2026-11-25')).toBe(true);
    });

    it('does not appear prior to its start dueDate even on the same weekday', () => {
      // 2026-11-11 was Wednesday, but task starts 2026-11-18
      expect(isTaskForToday(weeklyTask, '2026-11-11')).toBe(false);
    });
  });

  describe('3. Overdue tasks', () => {
    const overdueTask: Task = {
      ...baseTask,
      id: 'overdue-cs',
      title: 'Submit Lab 1',
      category: 'study',
      dueDate: '2026-11-19', // 2 days past
      completed: false,
    };

    it('marks non-recurring past incomplete task as overdue', () => {
      expect(isTaskOverdue(overdueTask, '2026-11-21')).toBe(true);
    });

    it('includes overdue tasks in the Today view', () => {
      expect(isTaskForToday(overdueTask, '2026-11-21')).toBe(true);
    });

    it('does not include past completed tasks in the Today view', () => {
      const completedPastTask: Task = {
        ...overdueTask,
        completed: true,
      };
      expect(isTaskOverdue(completedPastTask, '2026-11-21')).toBe(false);
      expect(isTaskForToday(completedPastTask, '2026-11-21')).toBe(false);
    });

    it('does not mark today tasks or future tasks as overdue', () => {
      const todayTask = { ...baseTask, dueDate: '2026-11-21' };
      const futureTask = { ...baseTask, dueDate: '2026-11-22' };
      expect(isTaskOverdue(todayTask, '2026-11-21')).toBe(false);
      expect(isTaskOverdue(futureTask, '2026-11-21')).toBe(false);
    });
  });

  describe('4. Priority sorting with completed tasks last', () => {
    const today = '2026-11-21';

    const p1Incomplete: Task = {
      ...baseTask,
      id: 'p1-inc',
      title: 'P1 Incomplete',
      priority: 1,
      completed: false,
    };

    const p2Incomplete: Task = {
      ...baseTask,
      id: 'p2-inc',
      title: 'P2 Incomplete',
      priority: 2,
      completed: false,
    };

    const p3Incomplete: Task = {
      ...baseTask,
      id: 'p3-inc',
      title: 'P3 Incomplete',
      priority: 3,
      completed: false,
    };

    const p1Completed: Task = {
      ...baseTask,
      id: 'p1-comp',
      title: 'P1 Completed',
      priority: 1,
      completed: true,
    };

    const p2Completed: Task = {
      ...baseTask,
      id: 'p2-comp',
      title: 'P2 Completed',
      priority: 2,
      completed: true,
    };

    it('places all incomplete tasks before completed tasks, regardless of priority', () => {
      // Even P3 incomplete should appear before P1 completed!
      const tasks = [p1Completed, p3Incomplete, p2Completed, p1Incomplete, p2Incomplete];
      const sorted = sortTasksByPriority(tasks, today);

      expect(sorted.map((t) => t.id)).toEqual([
        'p1-inc',
        'p2-inc',
        'p3-inc',
        'p1-comp',
        'p2-comp',
      ]);
    });

    it('prioritizes overdue tasks ahead of regular tasks at the same priority', () => {
      const overdueP1: Task = {
        ...baseTask,
        id: 'overdue-p1',
        title: 'Overdue P1',
        dueDate: '2026-11-19',
        priority: 1,
        completed: false,
      };

      const tasks = [p1Incomplete, overdueP1];
      const sorted = sortTasksByPriority(tasks, today);
      expect(sorted[0].id).toBe('overdue-p1');
      expect(sorted[1].id).toBe('p1-inc');
    });
  });

  describe('5. filterAndSortTodayTasks integration', () => {
    const today = '2026-11-21';

    const allTasks: Task[] = [
      {
        id: '1',
        title: 'Future exam prep',
        category: 'study',
        priority: 1,
        dueDate: '2026-11-25',
        recurrence: 'none',
        completed: false,
        createdAt: '2026-11-21T01:00:00Z',
      },
      {
        id: '2',
        title: 'Past completed chore',
        category: 'chore',
        priority: 1,
        dueDate: '2026-11-19',
        recurrence: 'none',
        completed: true,
        createdAt: '2026-11-19T01:00:00Z',
      },
      {
        id: '3',
        title: 'Overdue chore',
        category: 'chore',
        priority: 2,
        dueDate: '2026-11-20',
        recurrence: 'none',
        completed: false,
        createdAt: '2026-11-20T01:00:00Z',
      },
      {
        id: '4',
        title: 'Daily skincare',
        category: 'skincare',
        priority: 3,
        dueDate: '2026-11-01',
        recurrence: 'daily',
        completed: false,
        completedDates: ['2026-11-20'],
        createdAt: '2026-11-01T01:00:00Z',
      },
      {
        id: '5',
        title: 'Important lecture',
        category: 'study',
        priority: 1,
        dueDate: '2026-11-21',
        recurrence: 'none',
        completed: false,
        createdAt: '2026-11-21T02:00:00Z',
      },
    ];

    it('filters out future tasks and completed past tasks, and sorts remaining correctly', () => {
      const result = filterAndSortTodayTasks(allTasks, today);
      // Expected included:
      // - '5' (P1, due today)
      // - '3' (P2, overdue)
      // - '4' (P3, daily, incomplete today)
      // Excluded: '1' (future), '2' (completed past)
      expect(result.map((t) => t.id)).toEqual(['5', '3', '4']);
    });
  });
});
