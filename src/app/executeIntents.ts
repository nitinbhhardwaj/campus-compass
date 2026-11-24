import { AssistantIntent } from '../features/assistant/types/assistant';
import { CreateTaskDTO } from '../types/task';
import { CreateExpenseDTO } from '../features/expenses/types/expense';
import { CreateProteinEntryDTO } from '../features/protein/types/protein';
import { rupeeStringToPaise } from '../lib/currency';

export interface IntentExecutionHandlers {
  addTask: (dto: CreateTaskDTO) => Promise<unknown> | unknown;
  addExpense: (dto: CreateExpenseDTO) => Promise<unknown> | unknown;
  addProtein: (dto: CreateProteinEntryDTO) => Promise<unknown> | unknown;
}

export interface MappedDomainActions {
  tasks: CreateTaskDTO[];
  expenses: CreateExpenseDTO[];
  protein: CreateProteinEntryDTO[];
  clarifications: string[];
}

export interface ExecutionSummary {
  tasksAdded: number;
  expensesAdded: number;
  proteinAdded: number;
  clarificationsSkipped: number;
}

/**
 * Pure mapping function converting validated AssistantIntents into domain DTOs.
 * Guaranteed no side-effects and deterministic outputs.
 */
export function mapIntentsToDomainActions(
  intents: AssistantIntent[],
  today: string
): MappedDomainActions {
  const result: MappedDomainActions = {
    tasks: [],
    expenses: [],
    protein: [],
    clarifications: [],
  };

  for (const intent of intents) {
    switch (intent.type) {
      case 'add_task':
        result.tasks.push({
          title: intent.title.trim(),
          category: intent.category,
          priority: intent.priority,
          dueDate: intent.dueDate || today,
          recurrence: intent.recurrence,
        });
        break;

      case 'add_expense': {
        const parseResult = rupeeStringToPaise(intent.amountRupees);
        result.expenses.push({
          amountPaise: parseResult.amountPaise,
          category: intent.category,
          note: intent.note.trim(),
          date: intent.date || today,
        });
        break;
      }

      case 'add_protein':
        result.protein.push({
          label: intent.label.trim(),
          grams: intent.grams,
          date: today,
        });
        break;

      case 'clarify':
        if (intent.question.trim()) {
          result.clarifications.push(intent.question.trim());
        }
        break;
    }
  }

  return result;
}

/**
 * Executes a batch of validated intents by calling domain module creation handlers.
 * Clarify intents are not persisted as domain mutations.
 */
export async function executeIntents(
  intents: AssistantIntent[],
  handlers: IntentExecutionHandlers,
  today: string
): Promise<ExecutionSummary> {
  const actions = mapIntentsToDomainActions(intents, today);

  for (const taskDTO of actions.tasks) {
    await handlers.addTask(taskDTO);
  }

  for (const expenseDTO of actions.expenses) {
    await handlers.addExpense(expenseDTO);
  }

  for (const proteinDTO of actions.protein) {
    await handlers.addProtein(proteinDTO);
  }

  return {
    tasksAdded: actions.tasks.length,
    expensesAdded: actions.expenses.length,
    proteinAdded: actions.protein.length,
    clarificationsSkipped: actions.clarifications.length,
  };
}
