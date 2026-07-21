/**
 * Shared formatting utilities for consistent data presentation across the app
 */

import { currencyService } from '@/lib/currency';
import { staticDefaultCurrency } from '@/contexts/CurrencyContext';

/**
 * Parse a user-entered monetary amount.
 *
 * parseFloat alone is unsafe here: it returns NaN for non-numeric input and
 * silently truncates German-style input ("1.200,50" -> 1.2). A NaN that reaches
 * the database poisons every downstream budget calculation and cannot be
 * corrected from the UI.
 *
 * Returns null if the input is not a usable amount, so callers must handle the
 * invalid case explicitly instead of storing a broken number.
 */
export function parseAmount(input: string): number | null {
  if (typeof input !== 'string') return null;

  const trimmed = input.trim();
  if (trimmed === '') return null;

  // Accept both German ("1.200,50") and English ("1,200.50") notation by
  // treating the last separator as the decimal mark.
  const lastComma = trimmed.lastIndexOf(',');
  const lastDot = trimmed.lastIndexOf('.');
  let normalized: string;

  if (lastComma > lastDot) {
    normalized = trimmed.replace(/\./g, '').replace(',', '.');
  } else {
    normalized = trimmed.replace(/,/g, '');
  }

  // Reject anything that is not a plain decimal number (letters, multiple
  // separators, stray symbols) rather than letting parseFloat salvage a prefix.
  if (!/^-?\d*\.?\d+$/.test(normalized)) return null;

  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;

  return value;
}

/**
 * Format currency with proper locale and symbols
 */
export function formatCurrency(amount: number, currency?: string): string {
  const targetCurrency = currency || staticDefaultCurrency;
  return currencyService.formatCurrency(amount, targetCurrency);
}

/**
 * Format currency for display without decimals (for whole amounts)
 */
export function formatCurrencyCompact(amount: number, currency?: string): string {
  const targetCurrency = currency || staticDefaultCurrency;
  const currencyInfo = currencyService.getCurrencyInfo(targetCurrency);
  const symbol = currencyInfo?.symbol || targetCurrency;

  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: targetCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace(targetCurrency, symbol);
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
 * Format date and time for display
 */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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