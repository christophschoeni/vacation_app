/**
 * Expense category configurations
 * Centralized constants for expense categorization across the app
 */

import { ExpenseCategory } from '@/types';
import { Colors } from '@/constants/design';
import { translationService } from '@/lib/i18n';

interface ExpenseCategoryConfig {
  value: ExpenseCategory;
  labelKey: string; // Translation key instead of hardcoded label
  icon: string;
  color: string;
}

/**
 * Complete expense category configuration
 * Using design system colors where possible
 * Labels are now translation keys that will be translated at runtime
 */
export const EXPENSE_CATEGORIES: ExpenseCategoryConfig[] = [
  {
    value: 'food',
    labelKey: 'categories.food',
    icon: 'restaurant',
    color: Colors.systemColors.orange, // #FF9500
  },
  {
    value: 'transport',
    labelKey: 'categories.transport',
    icon: 'car',
    color: Colors.primary[500], // #007AFF
  },
  {
    value: 'accommodation',
    labelKey: 'categories.accommodation',
    icon: 'hotel',
    color: Colors.systemColors.green, // #34C759
  },
  {
    value: 'entertainment',
    labelKey: 'categories.entertainment',
    icon: 'music',
    color: Colors.systemColors.purple, // #AF52DE
  },
  {
    value: 'shopping',
    labelKey: 'categories.shopping',
    icon: 'shopping',
    color: Colors.systemColors.pink, // #FF2D92
  },
  {
    value: 'other',
    labelKey: 'categories.other',
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
 * Get expense category label (translated)
 */
export function getExpenseCategoryLabel(category: ExpenseCategory): string {
  const config = getExpenseCategoryConfig(category);
  if (!config) {
    return translationService.t('categories.unknown');
  }
  return translationService.t(config.labelKey);
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