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
  description?: string;
  isTemplate: boolean;          // Global template vs ferienspezifisch
  vacationId?: string;          // null für Templates
  templateId?: string;          // Referenz zur ursprünglichen Vorlage
  category: ChecklistCategory;  // Art der Liste
  icon: string;                 // Lucide Icon name
  order: number;                // Für custom Sortierung von Templates
  items: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  notes?: string;              // Zusätzliche Notizen
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  quantity?: number;           // Für Einkaufslisten
  order: number;               // Für custom Sortierung
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  isDefault: boolean;
  type: 'expense' | 'checklist';
}

export type ExpenseCategory =
  | 'transport'
  | 'accommodation'
  | 'food'
  | 'entertainment'
  | 'shopping'
  | 'other';

export type ChecklistCategory =
  | 'packing'      // Packliste
  | 'shopping'     // Einkaufsliste
  | 'bucket'       // Bucket List (Sehenswürdigkeiten)
  | 'todo'         // To-Do Liste
  | 'planning'     // Planungsliste
  | 'general'      // Allgemein
  | 'custom';      // Benutzerdefiniert

export interface AppSettings {
  defaultCurrency: string;
  language: 'de' | 'en';
  notifications: boolean;
  theme: 'auto' | 'light' | 'dark';
}

export interface ExchangeRates {
  [key: string]: number;
}