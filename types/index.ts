export interface Vacation {
  id: string;
  destination: string;
  country: string;
  hotel: string;
  startDate: Date;
  endDate: Date;
  budget?: number;
  budgetCurrency: string;    // Currency in which budget is specified (system currency)
  currency: string;          // Vacation currency for expenses
  expenses: Expense[];
  checklists: string[];
  imageUrl?: string;
  isShared: boolean;         // Group sharing feature enabled
  participantCount: number;  // Number of participants
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
  paidBy?: string;           // Participant ID who paid
  splitType: SplitType;      // How expense is split among participants
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

// Group Sharing Types

export interface Participant {
  id: string;
  vacationId: string;
  name: string;
  color: string;             // Hex color for avatar
  deviceId?: string;         // Optional: for multi-device sync
  isOwner: boolean;
  createdAt: Date;
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  participantId: string;
  shareAmount: number;       // Amount this participant owes
  sharePercentage?: number;  // Optional: percentage share
  isPayer: boolean;          // Is this participant the payer?
  createdAt: Date;
}

export interface AccessCode {
  id: string;
  vacationId: string;
  code: string;              // Splid-style: XXX-XXX-XXX format
  expiresAt?: Date;          // Optional expiration date
  maxUses?: number;          // Optional max number of uses
  useCount: number;          // Current usage count
  createdAt: Date;
}

export type SplitType = 'equal' | 'custom' | 'percentage' | 'shares';

export interface ExpenseWithSplits extends Expense {
  splits: ExpenseSplit[];
}

export interface Settlement {
  from: Participant;
  to: Participant;
  amount: number;
  currency: string;
}