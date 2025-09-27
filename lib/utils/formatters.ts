/**
 * Shared formatting utilities for consistent data presentation across the app
 */

import { currencyService } from '@/lib/currency';

/**
 * Format currency with proper locale and symbols
 */
export function formatCurrency(amount: number, currency: string = 'CHF'): string {
  return currencyService.formatCurrency(amount, currency);
}

/**
 * Format currency for display without decimals (for whole amounts)
 */
export function formatCurrencyCompact(amount: number, currency: string = 'CHF'): string {
  const currencyInfo = currencyService.getCurrencyInfo(currency);
  const symbol = currencyInfo?.symbol || currency;

  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace(currency, symbol);
}

/**
 * Format a date range for display
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const formatter = new Intl.DateTimeFormat('de-CH', {
    day: '2-digit',
    month: '2-digit',
  });

  const start = formatter.format(startDate);
  const end = formatter.format(endDate);

  return `${start} - ${end}`;
}

/**
 * Format a single date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Format a date for display with day name
 */
export function formatDateWithDay(date: Date): string {
  return new Intl.DateTimeFormat('de-CH', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

/**
 * Get relative time string (e.g., "2 days ago", "in 3 days")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Heute';
  } else if (diffDays === 1) {
    return 'Morgen';
  } else if (diffDays === -1) {
    return 'Gestern';
  } else if (diffDays > 0) {
    return `in ${diffDays} Tagen`;
  } else {
    return `vor ${Math.abs(diffDays)} Tagen`;
  }
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('de-CH').format(num);
}

/**
 * Format percentage with locale
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('de-CH', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}