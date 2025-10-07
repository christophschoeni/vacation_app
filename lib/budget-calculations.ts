import { Vacation, Expense } from '@/types';
import { formatCurrency as sharedFormatCurrency } from '@/lib/utils/formatters';
import { Colors } from '@/constants/design';
import { currencyService } from '@/lib/currency';

export interface BudgetAnalysis {
  totalBudget: number;
  totalExpenses: number;
  remainingBudget: number;
  budgetPercentageUsed: number;

  // Trip duration
  totalDays: number;
  elapsedDays: number;
  remainingDays: number;

  // Daily calculations
  budgetPerDay: number;
  averageSpentPerDay: number;
  remainingBudgetPerDay: number;

  // Projections
  projectedTotalSpend: number;
  projectedOverOrUnder: number;
  isOverBudget: boolean;

  // Status
  status: 'on-track' | 'over-budget' | 'under-budget' | 'future-trip';
}

// Async version with currency conversion
export async function calculateBudgetAnalysisAsync(
  vacation: Vacation,
  expenses: Expense[],
  targetCurrency: string = 'CHF'
): Promise<BudgetAnalysis> {
  const today = new Date();
  const startDate = new Date(vacation.startDate);
  const endDate = new Date(vacation.endDate);

  // Calculate trip duration
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  let elapsedDays = 0;
  let remainingDays = totalDays;

  if (today >= startDate && today <= endDate) {
    // During vacation
    elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    remainingDays = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  } else if (today > endDate) {
    // After vacation
    elapsedDays = totalDays;
    remainingDays = 0;
  } else {
    // Before vacation
    elapsedDays = 0;
    remainingDays = totalDays;
  }

  // Budget is already in budgetCurrency (system currency), convert to target if needed
  const totalBudget = await currencyService.convertCurrency(
    vacation.budget || 0,
    vacation.budgetCurrency || 'CHF',
    targetCurrency
  );

  // Convert all expenses to target currency
  let totalExpenses = 0;
  for (const expense of expenses) {
    const convertedAmount = await currencyService.convertCurrency(
      expense.amountCHF,
      'CHF',
      targetCurrency
    );
    totalExpenses += convertedAmount;
  }

  const remainingBudget = totalBudget - totalExpenses;
  const budgetPercentageUsed = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

  // Daily calculations
  const budgetPerDay = totalBudget / totalDays;
  const averageSpentPerDay = elapsedDays > 0 ? totalExpenses / elapsedDays : 0;
  const remainingBudgetPerDay = remainingDays > 0 ? remainingBudget / remainingDays : 0;

  // Projections
  const projectedTotalSpend = averageSpentPerDay * totalDays;
  const projectedOverOrUnder = totalBudget - projectedTotalSpend;
  const isOverBudget = totalExpenses > totalBudget;

  // Determine status
  let status: BudgetAnalysis['status'] = 'on-track';
  if (today < startDate) {
    status = 'future-trip';
  } else if (isOverBudget) {
    status = 'over-budget';
  } else if (projectedOverOrUnder < 0) {
    status = 'over-budget';
  } else if (averageSpentPerDay < budgetPerDay * 0.8) {
    status = 'under-budget';
  }

  return {
    totalBudget,
    totalExpenses,
    remainingBudget,
    budgetPercentageUsed,

    totalDays,
    elapsedDays,
    remainingDays,

    budgetPerDay,
    averageSpentPerDay,
    remainingBudgetPerDay,

    projectedTotalSpend,
    projectedOverOrUnder,
    isOverBudget,

    status,
  };
}

// Synchronous version for backward compatibility (uses CHF only)
export function calculateBudgetAnalysis(vacation: Vacation, expenses: Expense[]): BudgetAnalysis {
  const today = new Date();
  const startDate = new Date(vacation.startDate);
  const endDate = new Date(vacation.endDate);

  // Calculate trip duration
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  let elapsedDays = 0;
  let remainingDays = totalDays;

  if (today >= startDate && today <= endDate) {
    // During vacation
    elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    remainingDays = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  } else if (today > endDate) {
    // After vacation
    elapsedDays = totalDays;
    remainingDays = 0;
  } else {
    // Before vacation
    elapsedDays = 0;
    remainingDays = totalDays;
  }

  // Basic budget calculations
  const totalBudget = vacation.budget || 0;
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amountCHF, 0);
  const remainingBudget = totalBudget - totalExpenses;
  const budgetPercentageUsed = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

  // Daily calculations
  const budgetPerDay = totalBudget / totalDays;
  const averageSpentPerDay = elapsedDays > 0 ? totalExpenses / elapsedDays : 0;
  const remainingBudgetPerDay = remainingDays > 0 ? remainingBudget / remainingDays : 0;

  // Projections
  const projectedTotalSpend = averageSpentPerDay * totalDays;
  const projectedOverOrUnder = totalBudget - projectedTotalSpend;
  const isOverBudget = totalExpenses > totalBudget;

  // Determine status
  let status: BudgetAnalysis['status'] = 'on-track';
  if (today < startDate) {
    status = 'future-trip';
  } else if (isOverBudget) {
    status = 'over-budget';
  } else if (projectedOverOrUnder < 0) {
    status = 'over-budget';
  } else if (averageSpentPerDay < budgetPerDay * 0.8) {
    status = 'under-budget';
  }

  return {
    totalBudget,
    totalExpenses,
    remainingBudget,
    budgetPercentageUsed,

    totalDays,
    elapsedDays,
    remainingDays,

    budgetPerDay,
    averageSpentPerDay,
    remainingBudgetPerDay,

    projectedTotalSpend,
    projectedOverOrUnder,
    isOverBudget,

    status,
  };
}

export function formatCurrency(amount: number, currency: string = 'CHF'): string {
  return sharedFormatCurrency(amount, currency);
}

export function getBudgetStatusColor(status: BudgetAnalysis['status'], budgetPercentageUsed?: number): string {
  // If we have percentage, use gradient colors
  if (budgetPercentageUsed !== undefined) {
    if (budgetPercentageUsed <= 50) {
      // 0-50%: Green
      return Colors.systemColors.green;
    } else if (budgetPercentageUsed <= 80) {
      // 50-80%: Orange
      return Colors.systemColors.orange;
    } else {
      // 80%+: Red
      return Colors.systemColors.red;
    }
  }

  // Fallback to status-based colors
  switch (status) {
    case 'on-track':
      return Colors.systemColors.green;
    case 'under-budget':
      return Colors.systemColors.green;
    case 'over-budget':
      return Colors.systemColors.red;
    case 'future-trip':
      return Colors.systemColors.gray;
    default:
      return Colors.systemColors.gray;
  }
}

export function getBudgetStatusText(status: BudgetAnalysis['status']): string {
  switch (status) {
    case 'on-track':
      return 'Im Budget';
    case 'under-budget':
      return 'Unter Budget';
    case 'over-budget':
      return 'Über Budget';
    case 'future-trip':
      return 'Zukünftige Reise';
    default:
      return 'Unbekannt';
  }
}