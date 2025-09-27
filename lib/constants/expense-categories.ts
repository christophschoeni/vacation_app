/**
 * Expense category configurations
 * Centralized constants for expense categorization across the app
 */

import { ExpenseCategory } from '@/types';
import { Colors } from '@/constants/design';

interface ExpenseCategoryConfig {
  value: ExpenseCategory;
  label: string;
  icon: string;
  color: string;
}

/**
 * Complete expense category configuration
 * Using design system colors where possible
 */
export const EXPENSE_CATEGORIES: ExpenseCategoryConfig[] = [
  {
    value: 'food',
    label: 'Essen',
    icon: 'restaurant',
    color: Colors.systemColors.orange, // #FF9500
  },
  {
    value: 'transport',
    label: 'Transport',
    icon: 'car',
    color: Colors.primary[500], // #007AFF
  },
  {
    value: 'accommodation',
    label: 'Unterkunft',
    icon: 'hotel',
    color: Colors.systemColors.green, // #34C759
  },
  {
    value: 'entertainment',
    label: 'Unterhaltung',
    icon: 'music',
    color: Colors.systemColors.purple, // #AF52DE
  },
  {
    value: 'shopping',
    label: 'Shopping',
    icon: 'shopping',
    color: Colors.systemColors.pink, // #FF2D92
  },
  {
    value: 'other',
    label: 'Sonstiges',
    icon: 'other',
    color: Colors.systemColors.gray, // #8E8E93
  },
];

/**
 * Get expense category configuration by value
 */
export function getExpenseCategoryConfig(category: ExpenseCategory): ExpenseCategoryConfig | undefined {
  return EXPENSE_CATEGORIES.find(config => config.value === category);
}

/**
 * Get expense category label
 */
export function getExpenseCategoryLabel(category: ExpenseCategory): string {
  return getExpenseCategoryConfig(category)?.label || 'Unbekannt';
}

/**
 * Get expense category icon
 */
export function getExpenseCategoryIcon(category: ExpenseCategory): string {
  return getExpenseCategoryConfig(category)?.icon || 'other';
}

/**
 * Get expense category color
 */
export function getExpenseCategoryColor(category: ExpenseCategory): string {
  return getExpenseCategoryConfig(category)?.color || Colors.systemColors.gray;
}