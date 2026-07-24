import { Category } from '@/types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'transport',
    name: 'Transport',
    icon: '🚗',
    isDefault: true,
    type: 'expense',
  },
  {
    id: 'accommodation',
    name: 'Unterkunft',
    icon: '🏨',
    isDefault: true,
    type: 'expense',
  },
  {
    id: 'food',
    name: 'Essen & Trinken',
    icon: '🍽️',
    isDefault: true,
    type: 'expense',
  },
  {
    id: 'activities',
    name: 'Aktivitäten',
    icon: '🎯',
    isDefault: true,
    type: 'expense',
  },
  {
    id: 'shopping',
    name: 'Einkaufen',
    icon: '🛍️',
    isDefault: true,
    type: 'expense',
  },
  {
    id: 'entertainment',
    name: 'Unterhaltung',
    icon: '🎭',
    isDefault: true,
    type: 'expense',
  },
  {
    id: 'healthcare',
    name: 'Gesundheit',
    icon: '💊',
    isDefault: true,
    type: 'expense',
  },
  {
    id: 'other',
    name: 'Sonstiges',
    icon: '📝',
    isDefault: true,
    type: 'expense',
  },
];

// Default App Settings
export const DEFAULT_APP_SETTINGS = {
  defaultCurrency: 'EUR',
  theme: 'system',
  language: 'de',
  notificationsEnabled: true,
  backupEnabled: false,
  migrationCompleted: true, // Mark as completed for new installations
  version: '1.0.0',
};