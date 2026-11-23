import { describe, it, expect } from 'vitest';
import { buildDaySnapshot } from './buildDaySnapshot';
import { Task } from '../types/task';

describe('buildDaySnapshot adapter', () => {
  const today = '2026-11-23';

  const mockTasks: Task[] = [
    {
      id: 't1',
      title: 'CS 301 Midterm Prep',
      category: 'study',
      priority: 1,
      dueDate: '2026-11-24', // Tomorrow (1 day away)
      recurrence: 'none',
      completed: false,
      createdAt: '2026-11-20T10:00:00Z',
    },
    {
      id: 't2',
      title: 'Gym Push Day',
      category: 'gym',
      priority: 2,
      dueDate: '2026-11-23',
      recurrence: 'daily',
      completed: false,
      completedDates: [],
      createdAt: '2026-11-01T07:00:00Z',
    },
    {
      id: 't3',
      title: 'Overdue chore 1',
      category: 'chore',
      priority: 3,
      dueDate: '2026-11-20',
      recurrence: 'none',
      completed: false,
      createdAt: '2026-11-20T10:00:00Z',
    },
    {
      id: 't4',
      title: 'Overdue chore 2',
      category: 'chore',
      priority: 3,
      dueDate: '2026-11-21',
      recurrence: 'none',
      completed: false,
      createdAt: '2026-11-21T10:00:00Z',
    },
  ];

  it('correctly adapts domain models into a plain DaySnapshot', () => {
    const snapshot = buildDaySnapshot({
      tasks: mockTasks,
      today,
      hour: 18,
      protein: {
        totalGrams: 45,
        goalGrams: 112,
      },
      expenses: {
        totalSpentPaise: 1200000,
        monthlyBudgetPaise: 1500000,
        categoryTotals: {
          food: 520000,
          travel: 100000,
          rent: 400000,
          subscriptions: 100000,
          study: 80000,
          other: 0,
        },
        categoryBudgetsPaise: {
          food: 600000, // 520000 / 600000 = 86.6% -> 87%
        },
      },
      weekRange: {
        startDate: '2026-11-23',
        endDate: '2026-11-29',
      },
    });

    expect(snapshot.today).toBe('2026-11-23');
    expect(snapshot.hour).toBe(18);
    expect(snapshot.tasks.overdueCount).toBe(2);
    expect(snapshot.tasks.nearestP1StudyDueDaysAway).toBe(1);
    expect(snapshot.gym.isGymPendingToday).toBe(true);
    expect(snapshot.protein.totalGrams).toBe(45);
    expect(snapshot.expenses.foodBudgetUsedPercent).toBe(87);
    expect(snapshot.expenses.overallBudgetUsedPercent).toBe(80);
  });
});
