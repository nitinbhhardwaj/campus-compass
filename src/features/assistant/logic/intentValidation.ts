import {
  AssistantIntent,
  AddTaskIntent,
  AddExpenseIntent,
  AddProteinIntent,
  ClarifyIntent,
  AssistantTaskCategory,
  AssistantExpenseCategory,
  AssistantRecurrence,
} from '../types/assistant';
import { rupeeStringToPaise } from '../../../lib/currency';

export const MAX_INTENTS_PER_UTTERANCE = 5;

const VALID_TASK_CATEGORIES: Set<AssistantTaskCategory> = new Set([
  'study',
  'gym',
  'skincare',
  'chore',
  'other',
]);

const VALID_EXPENSE_CATEGORIES: Set<AssistantExpenseCategory> = new Set([
  'food',
  'travel',
  'rent',
  'subscriptions',
  'study',
  'other',
]);

const VALID_RECURRENCES: Set<AssistantRecurrence> = new Set([
  'none',
  'daily',
  'weekly',
]);

export interface IntentValidationResult {
  validIntents: AssistantIntent[];
  errors: string[];
}

/**
 * Pure function: Strips leading conversational wake/assistant name ("hey Nova", "hi nova,", "nova:")
 * case-insensitively, returning the stripped user utterance.
 */
export function stripAssistantName(transcript: string, name: string): string {
  if (!transcript || typeof transcript !== 'string') return '';
  const trimmed = transcript.trim();
  if (!name || typeof name !== 'string') return trimmed;

  const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!escapedName) return trimmed;

  const pattern = new RegExp(`^(?:(?:hey|hi|hello)\\s+)?${escapedName}\\b[\\s,:!?-]*`, 'i');
  return trimmed.replace(pattern, '').trim();
}

/**
 * Pure function: Verifies if a date string is a valid calendar date in YYYY-MM-DD format.
 * Validates days per month including leap years.
 */
export function isValidCalendarDate(dateStr: string): boolean {
  if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }

  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) return false;
  if (day < 1) return false;

  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [
    31,
    isLeap ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return day <= daysInMonth[month - 1];
}

/**
 * Pure function: Validates raw LLM response payload defensively against the intent schema.
 * - Caps at 5 intents per utterance.
 * - Discards unknown intent types.
 * - Validates dates against calendar days.
 * - Validates money using string parser without float errors.
 * - Never executes prompt-injection strings; preserves plain text.
 */
export function validateIntents(raw: unknown, today: string): IntentValidationResult {
  const validIntents: AssistantIntent[] = [];
  const errors: string[] = [];

  if (raw === null || raw === undefined) {
    return { validIntents: [], errors: ['Model output was empty.'] };
  }

  let candidates: unknown[] = [];

  if (Array.isArray(raw)) {
    candidates = raw;
  } else if (typeof raw === 'object' && raw !== null && 'intents' in raw && Array.isArray((raw as { intents: unknown }).intents)) {
    candidates = (raw as { intents: unknown[] }).intents;
  } else if (typeof raw === 'object' && raw !== null && 'type' in raw && typeof (raw as { type: unknown }).type === 'string') {
    candidates = [raw];
  } else {
    return { validIntents: [], errors: ['Model output is not a valid list of intents.'] };
  }

  if (candidates.length === 0) {
    return { validIntents: [], errors: ['No intents found in output.'] };
  }

  if (candidates.length > MAX_INTENTS_PER_UTTERANCE) {
    errors.push(`Capped output to the first ${MAX_INTENTS_PER_UTTERANCE} actions for safety.`);
    candidates = candidates.slice(0, MAX_INTENTS_PER_UTTERANCE);
  }

  for (let i = 0; i < candidates.length; i++) {
    const item = candidates[i];
    if (typeof item !== 'object' || item === null) {
      errors.push(`Action #${i + 1} is not a valid object.`);
      continue;
    }

    const obj = item as Record<string, unknown>;
    const type = obj.type;

    if (typeof type !== 'string') {
      errors.push(`Action #${i + 1} is missing intent type.`);
      continue;
    }

    switch (type) {
      case 'add_task': {
        const titleRaw = obj.title;
        if (typeof titleRaw !== 'string' || !titleRaw.trim()) {
          errors.push(`Action #${i + 1} (add_task): title is required.`);
          continue;
        }
        const title = titleRaw.trim().slice(0, 200);

        let category = obj.category as AssistantTaskCategory;
        if (!VALID_TASK_CATEGORIES.has(category)) {
          category = 'other';
        }

        const prioRaw = Number(obj.priority);
        let priority: 1 | 2 | 3 = 2;
        if (prioRaw === 1 || prioRaw === 2 || prioRaw === 3) {
          priority = prioRaw;
        }

        let dueDate: string | null = null;
        if (obj.dueDate === null || obj.dueDate === undefined || obj.dueDate === '') {
          dueDate = null;
        } else if (typeof obj.dueDate === 'string') {
          if (!isValidCalendarDate(obj.dueDate)) {
            errors.push(`Action #${i + 1} (add_task): invalid due date "${obj.dueDate}".`);
            continue;
          }
          dueDate = obj.dueDate;
        } else {
          errors.push(`Action #${i + 1} (add_task): invalid due date format.`);
          continue;
        }

        let recurrence = obj.recurrence as AssistantRecurrence;
        if (!VALID_RECURRENCES.has(recurrence)) {
          recurrence = 'none';
        }

        const taskIntent: AddTaskIntent = {
          type: 'add_task',
          title,
          category,
          priority,
          dueDate,
          recurrence,
        };
        validIntents.push(taskIntent);
        break;
      }

      case 'add_expense': {
        let amountStr = '';
        if (typeof obj.amountRupees === 'string') {
          amountStr = obj.amountRupees;
        } else if (typeof obj.amountRupees === 'number' && !isNaN(obj.amountRupees)) {
          amountStr = String(obj.amountRupees);
        } else {
          errors.push(`Action #${i + 1} (add_expense): valid amount is required.`);
          continue;
        }

        const parsedMoney = rupeeStringToPaise(amountStr);
        if (!parsedMoney.isValid) {
          errors.push(`Action #${i + 1} (add_expense): ${parsedMoney.error || 'invalid amount'}`);
          continue;
        }

        let category = obj.category as AssistantExpenseCategory;
        if (!VALID_EXPENSE_CATEGORIES.has(category)) {
          category = 'other';
        }

        const noteRaw = obj.note;
        if (typeof noteRaw !== 'string' || !noteRaw.trim()) {
          errors.push(`Action #${i + 1} (add_expense): note description is required.`);
          continue;
        }
        const note = noteRaw.trim().slice(0, 200);

        let date = typeof obj.date === 'string' ? obj.date : today;
        if (!isValidCalendarDate(date)) {
          errors.push(`Action #${i + 1} (add_expense): invalid date "${date}".`);
          continue;
        }

        const expenseIntent: AddExpenseIntent = {
          type: 'add_expense',
          amountRupees: amountStr.trim(),
          category,
          note,
          date,
        };
        validIntents.push(expenseIntent);
        break;
      }

      case 'add_protein': {
        const labelRaw = obj.label;
        if (typeof labelRaw !== 'string' || !labelRaw.trim()) {
          errors.push(`Action #${i + 1} (add_protein): food label is required.`);
          continue;
        }
        const label = labelRaw.trim().slice(0, 100);

        const gramsNum = typeof obj.grams === 'number' ? obj.grams : parseFloat(String(obj.grams));
        if (isNaN(gramsNum) || gramsNum <= 0 || gramsNum > 500) {
          errors.push(`Action #${i + 1} (add_protein): grams must be between 1 and 500g.`);
          continue;
        }

        const proteinIntent: AddProteinIntent = {
          type: 'add_protein',
          label,
          grams: Math.round(gramsNum * 10) / 10,
        };
        validIntents.push(proteinIntent);
        break;
      }

      case 'clarify': {
        const questionRaw = obj.question;
        if (typeof questionRaw !== 'string' || !questionRaw.trim()) {
          errors.push(`Action #${i + 1} (clarify): question text is required.`);
          continue;
        }

        const clarifyIntent: ClarifyIntent = {
          type: 'clarify',
          question: questionRaw.trim().slice(0, 300),
        };
        validIntents.push(clarifyIntent);
        break;
      }

      default: {
        errors.push(`Dropped unsupported intent type: "${String(type)}".`);
        break;
      }
    }
  }

  return { validIntents, errors };
}
