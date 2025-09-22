export interface Vacation {
  id: string;
  destination: string;
  country: string;
  hotel: string;
  startDate: Date;
  endDate: Date;
  budget?: number;
  currency: string;
  expenses: Expense[];
  checklists: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  vacationId: string;
  amount: number;
  currency: string;
  amountCHF: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
  imageUrl?: string;
  createdAt: Date;
}

export interface Checklist {
  id: string;
  title: string;
  isTemplate: boolean;
  items: ChecklistItem[];
  category: ChecklistCategory;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

export type ExpenseCategory =
  | 'transport'
  | 'accommodation'
  | 'food'
  | 'entertainment'
  | 'shopping'
  | 'other';

export type ChecklistCategory =
  | 'general'
  | 'beach'
  | 'city'
  | 'adventure'
  | 'business'
  | 'custom';

export interface AppSettings {
  defaultCurrency: string;
  language: 'de' | 'en';
  notifications: boolean;
  theme: 'auto' | 'light' | 'dark';
}

export interface ExchangeRates {
  [key: string]: number;
}