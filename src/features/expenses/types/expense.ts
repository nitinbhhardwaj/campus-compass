export type ExpenseCategory =
  | 'food'
  | 'travel'
  | 'rent'
  | 'subscriptions'
  | 'study'
  | 'other';

export interface Expense {
  id: string;
  date: string;              // Local date in 'YYYY-MM-DD' format
  amountPaise: number;       // Stored as integer paise (1 INR = 100 paise), never floats
  category: ExpenseCategory;
  note: string;
  createdAt: string;         // ISO 8601 timestamp
}

export interface ExpenseSettings {
  monthlyBudgetPaise: number;
  categoryBudgetsPaise?: Partial<Record<ExpenseCategory, number>>;
}

export type CreateExpenseDTO = Omit<Expense, 'id' | 'createdAt'>;
