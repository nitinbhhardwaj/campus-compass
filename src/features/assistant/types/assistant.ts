export type AssistantTaskCategory = 'study' | 'gym' | 'skincare' | 'chore' | 'other';

export type AssistantExpenseCategory =
  | 'food'
  | 'travel'
  | 'rent'
  | 'subscriptions'
  | 'study'
  | 'other';

export type AssistantRecurrence = 'none' | 'daily' | 'weekly';

export interface AddTaskIntent {
  type: 'add_task';
  title: string;
  category: AssistantTaskCategory;
  priority: 1 | 2 | 3;
  dueDate: string | null; // YYYY-MM-DD or null
  recurrence: AssistantRecurrence;
}

export interface AddExpenseIntent {
  type: 'add_expense';
  amountRupees: string; // e.g. "120" or "12.5"
  category: AssistantExpenseCategory;
  note: string;
  date: string; // YYYY-MM-DD
}

export interface AddProteinIntent {
  type: 'add_protein';
  label: string;
  grams: number;
}

export interface ClarifyIntent {
  type: 'clarify';
  question: string;
}

export type AssistantIntent =
  | AddTaskIntent
  | AddExpenseIntent
  | AddProteinIntent
  | ClarifyIntent;

export interface AssistantContext {
  today: string; // YYYY-MM-DD
  allowedTaskCategories: AssistantTaskCategory[];
  allowedExpenseCategories: AssistantExpenseCategory[];
  dietPreference?: string;
}

export interface LLMProvider {
  parse(transcript: string, context: AssistantContext): Promise<unknown>;
}

export interface AssistantSettings {
  assistantName: string;
  voiceReplyEnabled: boolean;
  recognitionLanguage: string;
}
