import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vacation, Expense, Checklist, ChecklistItem } from '@/types';

// Raw data interfaces for storage (with string dates)
interface RawVacationData {
  id: string;
  destination: string;
  country: string;
  hotel: string;
  startDate: string;
  endDate: string;
  budget?: number;
  currency: string;
  expenses: string[];
  checklists: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface RawExpenseData {
  id: string;
  vacationId: string;
  amount: number;
  currency: string;
  amountCHF: number;
  category: string;
  description: string;
  date: string;
  imageUrl?: string;
  createdAt: string;
}

interface RawChecklistItemData {
  id: string;
  text: string;
  completed: boolean;
  notes?: string;
  priority: string;
  dueDate?: string;
  quantity?: number;
  order: number;
}

interface RawChecklistData {
  id: string;
  title: string;
  description?: string;
  isTemplate: boolean;
  vacationId?: string;
  templateId?: string;
  category: string;
  icon: string;
  order: number;
  items: RawChecklistItemData[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEYS = {
  VACATIONS: '@vacation_assist:vacations',
  EXPENSES: '@vacation_assist:expenses',
  CHECKLISTS: '@vacation_assist:checklists',
} as const;

export class LocalDatabase {
  // Vacation operations
  static async getVacations(): Promise<Vacation[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.VACATIONS);
      if (!data) return [];

      const vacations = JSON.parse(data) as RawVacationData[];
      // Convert date strings back to Date objects
      return vacations.map((vacation: RawVacationData) => ({
        ...vacation,
        startDate: new Date(vacation.startDate),
        endDate: new Date(vacation.endDate),
        createdAt: new Date(vacation.createdAt),
        updatedAt: new Date(vacation.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading vacations:', error);
      return [];
    }
  }

  static async saveVacation(vacation: Vacation): Promise<void> {
    try {
      const vacations = await this.getVacations();
      const existingIndex = vacations.findIndex(v => v.id === vacation.id);

      if (existingIndex >= 0) {
        vacations[existingIndex] = vacation;
      } else {
        vacations.push(vacation);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.VACATIONS, JSON.stringify(vacations));
    } catch (error) {
      console.error('Error saving vacation:', error);
      throw error;
    }
  }

  static async deleteVacation(id: string): Promise<void> {
    try {
      const vacations = await this.getVacations();
      const filtered = vacations.filter(v => v.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.VACATIONS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting vacation:', error);
      throw error;
    }
  }

  // Expense operations
  static async getExpenses(vacationId?: string): Promise<Expense[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (!data) return [];

      const expenses = JSON.parse(data) as RawExpenseData[];
      // Convert date strings back to Date objects
      const expensesWithDates = expenses.map((expense: RawExpenseData) => ({
        ...expense,
        date: new Date(expense.date),
        createdAt: new Date(expense.createdAt),
      }));

      // Strict type-safe filtering with String conversion to handle type mismatches
      return vacationId
        ? expensesWithDates.filter((e: Expense) => {
            // Convert both to strings for comparison to handle any type inconsistencies
            const expenseVacationId = String(e.vacationId || '');
            const targetVacationId = String(vacationId || '');
            return expenseVacationId === targetVacationId && expenseVacationId !== '';
          })
        : expensesWithDates;
    } catch (error) {
      console.error('Error loading expenses:', error);
      return [];
    }
  }

  static async saveExpense(expense: Expense): Promise<void> {
    try {
      const expenses = await this.getExpenses();
      const existingIndex = expenses.findIndex(e => e.id === expense.id);

      if (existingIndex >= 0) {
        expenses[existingIndex] = expense;
      } else {
        expenses.push(expense);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expense:', error);
      throw error;
    }
  }

  static async deleteExpense(id: string): Promise<void> {
    try {
      const expenses = await this.getExpenses();
      const filtered = expenses.filter(e => e.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  // Checklist operations
  static async getChecklists(vacationId?: string): Promise<Checklist[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CHECKLISTS);
      if (!data) return [];

      const checklists = JSON.parse(data) as RawChecklistData[];
      // Convert date strings back to Date objects
      const checklistsWithDates = checklists.map((checklist: RawChecklistData) => ({
        ...checklist,
        createdAt: new Date(checklist.createdAt),
        updatedAt: new Date(checklist.updatedAt),
        items: checklist.items.map((item: RawChecklistItemData) => ({
          ...item,
          dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
        })),
      }));

      return vacationId ? checklistsWithDates.filter((c: Checklist) => c.vacationId === vacationId) : checklistsWithDates;
    } catch (error) {
      console.error('Error loading checklists:', error);
      return [];
    }
  }

  static async saveChecklist(checklist: Checklist): Promise<void> {
    try {
      const checklists = await this.getChecklists();
      const existingIndex = checklists.findIndex(c => c.id === checklist.id);

      if (existingIndex >= 0) {
        checklists[existingIndex] = checklist;
      } else {
        checklists.push(checklist);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(checklists));
    } catch (error) {
      console.error('Error saving checklist:', error);
      throw error;
    }
  }

  static async deleteChecklist(id: string): Promise<void> {
    try {
      const checklists = await this.getChecklists();
      const filtered = checklists.filter(c => c.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting checklist:', error);
      throw error;
    }
  }

  // Clear all data (useful for development/testing)
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.VACATIONS,
        STORAGE_KEYS.EXPENSES,
        STORAGE_KEYS.CHECKLISTS,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}