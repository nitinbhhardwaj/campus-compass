import { describe, it, expect, vi } from 'vitest';
import { executeIntents, mapIntentsToDomainActions } from './executeIntents';
import { AssistantIntent } from '../features/assistant/types/assistant';

describe('executeIntents adapter', () => {
  const today = '2026-11-24';

  const sampleIntents: AssistantIntent[] = [
    {
      type: 'add_task',
      title: 'Submit DBMS assignment',
      category: 'study',
      priority: 1,
      dueDate: '2026-11-25',
      recurrence: 'none',
    },
    {
      type: 'add_task',
      title: 'Daily pushups',
      category: 'gym',
      priority: 2,
      dueDate: null, // should fallback to today
      recurrence: 'daily',
    },
    {
      type: 'add_expense',
      amountRupees: '120.50',
      category: 'food',
      note: 'Lunch at canteen',
      date: '2026-11-24',
    },
    {
      type: 'add_protein',
      label: '2 boiled eggs',
      grams: 12,
    },
    {
      type: 'clarify',
      question: 'Did you mean to add this as a task?',
    },
  ];

  it('maps validated assistant intents into domain DTOs cleanly', () => {
    const actions = mapIntentsToDomainActions(sampleIntents, today);

    expect(actions.tasks).toEqual([
      {
        title: 'Submit DBMS assignment',
        category: 'study',
        priority: 1,
        dueDate: '2026-11-25',
        recurrence: 'none',
      },
      {
        title: 'Daily pushups',
        category: 'gym',
        priority: 2,
        dueDate: '2026-11-24',
        recurrence: 'daily',
      },
    ]);

    expect(actions.expenses).toEqual([
      {
        amountPaise: 12050,
        category: 'food',
        note: 'Lunch at canteen',
        date: '2026-11-24',
      },
    ]);

    expect(actions.protein).toEqual([
      {
        label: '2 boiled eggs',
        grams: 12,
        date: '2026-11-24',
      },
    ]);

    expect(actions.clarifications).toEqual([
      'Did you mean to add this as a task?',
    ]);
  });

  it('executes handlers for mapped domain entities and skips clarify intents', async () => {
    const addTaskMock = vi.fn().mockResolvedValue({ id: 'task-1' });
    const addExpenseMock = vi.fn().mockResolvedValue({ id: 'exp-1' });
    const addProteinMock = vi.fn().mockResolvedValue({ id: 'prot-1' });

    const summary = await executeIntents(
      sampleIntents,
      {
        addTask: addTaskMock,
        addExpense: addExpenseMock,
        addProtein: addProteinMock,
      },
      today
    );

    expect(summary).toEqual({
      tasksAdded: 2,
      expensesAdded: 1,
      proteinAdded: 1,
      clarificationsSkipped: 1,
    });

    expect(addTaskMock).toHaveBeenCalledTimes(2);
    expect(addExpenseMock).toHaveBeenCalledTimes(1);
    expect(addProteinMock).toHaveBeenCalledTimes(1);
    expect(addExpenseMock).toHaveBeenCalledWith({
      amountPaise: 12050,
      category: 'food',
      note: 'Lunch at canteen',
      date: '2026-11-24',
    });
  });
});
