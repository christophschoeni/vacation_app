import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vacation, Expense, Checklist } from '@/types';

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
      return data ? JSON.parse(data) : [];
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
      const expenses = data ? JSON.parse(data) : [];
      return vacationId ? expenses.filter((e: Expense) => e.vacationId === vacationId) : expenses;
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
      const checklists = data ? JSON.parse(data) : [];
      return vacationId ? checklists.filter((c: Checklist) => c.vacationId === vacationId) : checklists;
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