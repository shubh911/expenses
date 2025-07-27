// src/app/models/expense.model.ts
export interface Expense {
  id?: string; // Optional for new expenses
  date: string; // YYYY-MM-DD
  amount: number;
  category: string;
  description: string;
  notes?: string;
}

export interface MonthlyReport {
  [key: string]: { // Key is YYYY-MM
    total: number;
    categories: {
      [key: string]: number; // Category name: total amount
    };
  };
}

export interface ComparisonReport {
  [key: string]: { // Key is YYYY-MM
    total: number;
    categories: {
      [key: string]: number;
    };
    details: Expense[]; // Individual expenses for the month
  };
}

// Interface for recurring expense data (used by recurring-expenses component)
export interface RecurringExpense {
  description: string;
  category: string;
  amount: number;
}

// Interface for expense tags (used by expense-form for quick add)
export interface ExpenseTag {
  description: string;
  category: string;
  amount: number;
}
