/**
 * Backend Abstraction Layer Interfaces
 *
 * This file defines the interfaces for all backend operations.
 * Implementations can use SQLite, Supabase, or a hybrid approach.
 */

import { Vacation } from '@/types';

// ============================================================================
// Vacation Backend Interface
// ============================================================================

export interface IVacationBackend {
  findAll(): Promise<Vacation[]>;
  findById(id: string): Promise<Vacation | null>;
  create(data: {
    destination: string;
    country: string;
    hotel: string;
    startDate: Date;
    endDate: Date;
    budget?: number;
    currency?: string;
    imageUrl?: string;
  }): Promise<Vacation>;
  update(id: string, data: Partial<Vacation>): Promise<Vacation | null>;
  delete(id: string): Promise<boolean>;
  findActive(): Promise<Vacation[]>;
  findUpcoming(): Promise<Vacation[]>;
  findPast(): Promise<Vacation[]>;
}

// ============================================================================
// Expense Backend Interface
// ============================================================================

export interface IExpenseBackend {
  findAll(vacationId?: string): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  create(data: {
    vacationId: string;
    amount: number;
    currency: string;
    category: string;
    description?: string;
    date?: Date;
    location?: string;
    paymentMethod?: string;
    notes?: string;
  }): Promise<any>;
  update(id: string, data: Partial<any>): Promise<any | null>;
  delete(id: string): Promise<boolean>;
  findByVacation(vacationId: string): Promise<any[]>;
  getTotalByVacation(vacationId: string): Promise<number>;
}

// ============================================================================
// Checklist Backend Interface
// ============================================================================

export interface IChecklistBackend {
  findAll(vacationId?: string): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  create(data: {
    title: string;
    description?: string;
    isTemplate?: boolean;
    vacationId?: string;
    templateId?: string;
    category?: string;
    icon?: string;
  }): Promise<any>;
  update(id: string, data: Partial<any>): Promise<any | null>;
  delete(id: string): Promise<boolean>;
  findTemplates(): Promise<any[]>;
  findByVacation(vacationId: string): Promise<any[]>;
  addItem(data: {
    checklistId: string;
    text: string;
    notes?: string;
    priority?: string;
    dueDate?: Date;
    quantity?: number;
    order?: number;
  }): Promise<any>;
  updateItem(itemId: string, data: Partial<any>): Promise<any | null>;
  deleteItem(itemId: string): Promise<boolean>;
}

// ============================================================================
// App Settings Backend Interface
// ============================================================================

export interface IAppSettingsBackend {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  getAll(): Promise<Record<string, string>>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;

  // Convenience methods
  getLanguage(): Promise<string>;
  setLanguage(language: string): Promise<void>;
  getOnboardingCompleted(): Promise<boolean>;
  setOnboardingCompleted(completed: boolean): Promise<void>;
  getNotificationsEnabled(): Promise<boolean>;
  setNotificationsEnabled(enabled: boolean): Promise<void>;
  getNotificationsPermission(): Promise<'granted' | 'denied' | 'not-determined'>;
  setNotificationsPermission(permission: 'granted' | 'denied' | 'not-determined'): Promise<void>;
}

// ============================================================================
// Complete Backend Interface
// ============================================================================

export interface IBackend {
  vacations: IVacationBackend;
  expenses: IExpenseBackend;
  checklists: IChecklistBackend;
  settings: IAppSettingsBackend;

  // Connection/initialization
  initialize(): Promise<void>;
  isInitialized(): boolean;

  // Optional sync capabilities
  sync?(): Promise<void>;
  getSyncStatus?(): Promise<{
    lastSync: Date | null;
    pendingChanges: number;
    syncEnabled: boolean;
  }>;
}

// ============================================================================
// Backend Type Enum
// ============================================================================

export enum BackendType {
  SQLITE = 'sqlite',
  SUPABASE = 'supabase',
  HYBRID = 'hybrid', // SQLite + Supabase with sync
}
