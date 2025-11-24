import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Card } from '@/components/design';
import { Vacation, Expense } from '@/types';
import { calculateBudgetAnalysisAsync, formatCurrency, getBudgetStatusColor, BudgetAnalysis } from '@/lib/budget-calculations';
import { useColorScheme } from 'react-native';
import { spacing } from '@/constants/spacing';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTranslation } from '@/lib/i18n';

interface BudgetOverviewProps {
  vacation: Vacation;
  expenses: Expense[];
}

interface ProgressBarProps {
  progress: number;
  color: string;
  style?: any;
}

function ProgressBar({ progress, color, style }: ProgressBarProps) {
  return (
    <View style={[{
      height: 6,
      backgroundColor: 'rgba(142, 142, 147, 0.12)',
      borderRadius: 3,
      overflow: 'hidden'
    }, style]}>
      <View
        style={{
          height: '100%',
          width: `${Math.min(progress * 100, 100)}%`,
          backgroundColor: color,
          borderRadius: 3
        }}
      />
    </View>
  );
}

export default function BudgetOverview({ vacation, expenses }: BudgetOverviewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const { defaultCurrency } = useCurrency();
  const [analysis, setAnalysis] = React.useState<BudgetAnalysis | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function loadAnalysis() {
      setLoading(true);
      try {
        const result = await calculateBudgetAnalysisAsync(vacation, expenses, defaultCurrency);
        if (!cancelled) {
          setAnalysis(result);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAnalysis();

    return () => {
      cancelled = true;
    };
  }, [vacation, expenses, defaultCurrency]);

  if (loading || !analysis) {
    return (
      <View style={[styles.container, {
        backgroundColor: isDark ? '#000000' : '#FFFFFF',
      }]}>
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator color={isDark ? '#FFFFFF' : '#000000'} />
        </View>
      </View>
    );
  }

  const progressColor = getBudgetStatusColor(analysis.status, analysis.budgetPercentageUsed);

  const getBudgetStatusText = (status: typeof analysis.status): string => {
    switch (status) {
      case 'upcoming':
        return t('components.budget_overview.status.upcoming');
      case 'active':
        return t('components.budget_overview.status.active');
      case 'completed':
        return t('components.budget_overview.status.completed');
      default:
        return '';
    }
  };

  return (
    <View style={[styles.container, {
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    }]}>
      {/* Clean progress indication */}
      <View style={styles.progressSection}>
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={Math.min(analysis.budgetPercentageUsed / 100, 1)}
            color={progressColor}
            style={styles.progressBar}
          />
          <Text style={[styles.progressText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            {t('components.budget_overview.progress', { percentage: analysis.budgetPercentageUsed.toFixed(1) })}
          </Text>
        </View>
      </View>

      {/* Main budget numbers in 2x2 grid */}
      <View style={styles.mainBudgetSection}>
        <View style={styles.budgetGrid2x2}>
          {/* First row */}
          <View style={styles.budgetGridRow}>
            <View style={styles.budgetGridItem}>
              <Text style={[styles.budgetGridLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                {t('components.budget_overview.total_budget')}
              </Text>
              <Text style={[styles.budgetGridAmount, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                {formatCurrency(analysis.totalBudget, defaultCurrency)}
              </Text>
            </View>
            <View style={styles.budgetGridItem}>
              <Text style={[styles.budgetGridLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                {t('components.budget_overview.spent')}
              </Text>
              <Text style={[styles.budgetGridAmount, {
                color: analysis.isOverBudget ? '#FF3B30' : (isDark ? '#FFFFFF' : '#1C1C1E')
              }]}>
                {formatCurrency(analysis.totalExpenses, defaultCurrency)}
              </Text>
            </View>
          </View>

          {/* Second row */}
          <View style={styles.budgetGridRow}>
            <View style={styles.budgetGridItem}>
              <Text style={[styles.budgetGridLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                {t('components.budget_overview.remaining')}
              </Text>
              <Text style={[styles.budgetGridAmount, {
                color: analysis.remainingBudget < 0 ? '#FF3B30' : '#34C759'
              }]}>
                {formatCurrency(analysis.remainingBudget, defaultCurrency)}
              </Text>
            </View>
            <View style={styles.budgetGridItem}>
              <Text style={[styles.budgetGridLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                {analysis.remainingDays > 0
                  ? t('components.budget_overview.per_day', { days: analysis.remainingDays })
                  : t('components.budget_overview.vacation_ended')}
              </Text>
              <Text style={[styles.budgetGridAmount, {
                color: analysis.remainingBudget < 0 ? '#FF3B30' :
                       analysis.remainingDays <= 0 ? (isDark ? '#8E8E93' : '#6D6D70') : '#34C759'
              }]}>
                {analysis.remainingDays > 0 ?
                  formatCurrency(analysis.remainingBudget / analysis.remainingDays, defaultCurrency) :
                  '--'
                }
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

interface BudgetRowProps {
  label: string;
  amount: string;
  color: string;
}

function BudgetRow({ label, amount, color }: BudgetRowProps) {
  return (
    <View style={styles.budgetRow}>
      <Text style={[styles.budgetLabel, { color }]}>{label}</Text>
      <Text style={[styles.budgetAmount, { color }]}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'System',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'System',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressContainer: {
    gap: 8,
    paddingHorizontal: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'System',
    fontWeight: '500',
  },
  mainBudgetSection: {
    marginTop: 8,
  },
  budgetGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  budgetGrid2x2: {
    gap: 16,
  },
  budgetGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  budgetGridItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  budgetGridLabel: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'System',
    marginBottom: 6,
    textAlign: 'center',
  },
  budgetGridAmount: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'System',
    textAlign: 'center',
  },
  // Keep old styles for compatibility
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 16,
    fontFamily: 'System',
    flex: 1,
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});