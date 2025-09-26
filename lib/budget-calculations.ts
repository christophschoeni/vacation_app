import { Vacation, Expense } from '@/types';

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
  return `${currency} ${amount.toFixed(2)}`;
}

export function getBudgetStatusColor(status: BudgetAnalysis['status'], budgetPercentageUsed?: number): string {
  // If we have percentage, use gradient colors
  if (budgetPercentageUsed !== undefined) {
    if (budgetPercentageUsed <= 50) {
      // 0-50%: Green
      return '#34C759'; // iOS System Green
    } else if (budgetPercentageUsed <= 80) {
      // 50-80%: Orange
      return '#FF9500'; // iOS System Orange
    } else {
      // 80%+: Red
      return '#FF3B30'; // iOS System Red
    }
  }

  // Fallback to status-based colors
  switch (status) {
    case 'on-track':
      return '#34C759'; // Green
    case 'under-budget':
      return '#34C759'; // Green
    case 'over-budget':
      return '#FF3B30'; // Red
    case 'future-trip':
      return '#8E8E93'; // Gray
    default:
      return '#8E8E93';
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