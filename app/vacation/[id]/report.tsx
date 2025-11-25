import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import AppHeader from '@/components/ui/AppHeader';
import { Card, Icon } from '@/components/design';
import { useVacationContext } from '@/contexts/VacationContext';
import { useVacations } from '@/hooks/use-vacations';
import { useExpenses } from '@/lib/database';
import { useTranslation } from '@/lib/i18n';
import { ExpenseCategory } from '@/types';
import {
  getExpenseCategoryLabel,
  getExpenseCategoryColor,
  getExpenseCategoryIcon,
} from '@/lib/constants/expense-categories';
import { formatCurrency } from '@/lib/utils/formatters';
import { currencyService } from '@/lib/currency';
import { useCurrency } from '@/contexts/CurrencyContext';

interface CategoryExpense {
  category: ExpenseCategory;
  total: number;
  count: number;
  percentage: number;
}

export default function VacationReportScreen() {
  const { currentVacationId: vacationId } = useVacationContext();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { vacations, refreshVacations } = useVacations();
  const { expenses, loading: expensesLoading, refresh: refreshExpenses } = useExpenses(vacationId ?? '');
  const { defaultCurrency } = useCurrency();
  const [categoryData, setCategoryData] = useState<CategoryExpense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const insets = useSafeAreaInsets();

  const isDark = colorScheme === 'dark';
  const vacation = vacations.find(v => v.id === vacationId);

  // Display currency is always the user's default currency from settings
  // Fallback to CHF if not yet loaded
  const displayCurrency = defaultCurrency || 'CHF';
  // Budget is NOT converted - it's displayed as-is in the user's default currency
  const vacationBudget = vacation?.budget || 0;

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (__DEV__) {
        console.log('Report - Screen focused, refreshing data...');
        console.log('Report - Current vacationId:', vacationId);
      }
      refreshVacations();
      refreshExpenses();
    }, [refreshVacations, refreshExpenses, vacationId])
  );

  // Calculate category expenses for this vacation
  React.useEffect(() => {
    let cancelled = false;

    async function calculateExpenses() {
      // Skip calculation if still loading or no valid data
      if (expensesLoading) {
        if (__DEV__) {
          console.log('Report - Still loading expenses, skipping calculation');
        }
        return;
      }

      // Skip calculation if no vacationId or displayCurrency
      if (!vacationId || !displayCurrency) {
        if (__DEV__) {
          console.log('Report - Skipping calculation: vacationId=', vacationId, 'displayCurrency=', displayCurrency);
        }
        return;
      }

      const categoryMap = new Map<ExpenseCategory, { total: number; count: number }>();
      let total = 0;

      // Debugging logs (only in development)
      if (__DEV__) {
        console.log('=== Report Screen Debug ===');
        console.log('Report - vacationId:', vacationId);
        console.log('Report - displayCurrency:', displayCurrency);
        console.log('Report - expenses from hook:', expenses.length);
        if (expenses.length > 0) {
          expenses.forEach((expense, idx) => {
            console.log(`Expense ${idx + 1}:`, {
              id: expense.id,
              category: expense.category,
              amount: expense.amount,
              currency: expense.currency,
              vacationId: expense.vacationId,
            });
          });
        }
        console.log('==========================');
      }

      // Convert all expenses to the user's display currency
      for (const expense of expenses) {
        try {
          const convertedAmount = await currencyService.convertCurrency(
            expense.amount,
            expense.currency,
            displayCurrency
          );

          total += convertedAmount;

          const existing = categoryMap.get(expense.category) || { total: 0, count: 0 };
          categoryMap.set(expense.category, {
            total: existing.total + convertedAmount,
            count: existing.count + 1,
          });
        } catch (error) {
          console.warn('Report - Currency conversion failed for expense:', expense.id, error);
          // Fallback: use original amount
          total += expense.amount;
          const existing = categoryMap.get(expense.category) || { total: 0, count: 0 };
          categoryMap.set(expense.category, {
            total: existing.total + expense.amount,
            count: existing.count + 1,
          });
        }
      }

      if (cancelled) return;

      const data: CategoryExpense[] = Array.from(categoryMap.entries()).map(([category, { total: catTotal, count }]) => ({
        category,
        total: catTotal,
        count,
        percentage: catTotal > 0 && total > 0 ? (catTotal / total) * 100 : 0,
      }));

      // Sort by total descending
      data.sort((a, b) => b.total - a.total);

      if (__DEV__) {
        console.log('Report - Final total:', total);
        console.log('Report - Category data:', data);
      }

      setCategoryData(data);
      setTotalExpenses(total);
    }

    calculateExpenses();

    return () => {
      cancelled = true;
    };
  }, [expenses, expensesLoading, displayCurrency, vacationId]);

  // Recalculate percentages when total changes
  React.useEffect(() => {
    if (totalExpenses > 0) {
      setCategoryData(prevData =>
        prevData.map(item => ({
          ...item,
          percentage: (item.total / totalExpenses) * 100
        }))
      );
    }
  }, [totalExpenses]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}
      edges={['top']}
    >
      <AppHeader
        title={t('vacation.tabs.report')}
        variant="default"
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryContent}>
            <Text style={[styles.summaryLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              {t('report.total_expenses')}
            </Text>
            <Text style={[styles.summaryAmount, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
              {formatCurrency(totalExpenses, displayCurrency)}
            </Text>
            <Text style={[styles.summarySubtext, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              {vacation?.destination}
            </Text>
          </View>

          {/* Budget Details */}
          {vacation?.budget && (
            <>
              <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />

              <View style={styles.budgetDetailsGrid}>
                {/* Total Budget */}
                <View style={styles.budgetDetailItem}>
                  <Text style={[styles.budgetDetailLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                    {t('report.total_budget')}
                  </Text>
                  <Text style={[styles.budgetDetailValue, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                    {formatCurrency(vacationBudget, displayCurrency)}
                  </Text>
                </View>

                {/* Remaining Budget */}
                <View style={styles.budgetDetailItem}>
                  <Text style={[styles.budgetDetailLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                    {t('report.remaining_budget')}
                  </Text>
                  <Text style={[
                    styles.budgetDetailValue,
                    {
                      color: vacationBudget - totalExpenses >= 0
                        ? (isDark ? '#34C759' : '#28A745')
                        : (isDark ? '#FF453A' : '#DC3545')
                    }
                  ]}>
                    {formatCurrency(vacationBudget - totalExpenses, displayCurrency)}
                  </Text>
                </View>

                {/* Available per remaining day */}
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const endDate = new Date(vacation.endDate);
                  endDate.setHours(0, 0, 0, 0);
                  const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
                  const remainingBudget = vacationBudget - totalExpenses;
                  const perDay = remainingDays > 0 ? remainingBudget / remainingDays : 0;

                  return (
                    <>
                      <View style={styles.budgetDetailItem}>
                        <Text style={[styles.budgetDetailLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                          {t('report.remaining_days')}
                        </Text>
                        <Text style={[styles.budgetDetailValue, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                          {remainingDays} {remainingDays === 1 ? t('report.day') : t('report.days')}
                        </Text>
                      </View>

                      {remainingDays > 0 && (
                        <View style={styles.budgetDetailItem}>
                          <Text style={[styles.budgetDetailLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                            {t('report.per_day')}
                          </Text>
                          <Text style={[
                            styles.budgetDetailValue,
                            {
                              color: perDay >= 0
                                ? (isDark ? '#34C759' : '#28A745')
                                : (isDark ? '#FF453A' : '#DC3545')
                            }
                          ]}>
                            {formatCurrency(perDay, displayCurrency)}
                          </Text>
                        </View>
                      )}
                    </>
                  );
                })()}
              </View>
            </>
          )}
        </Card>

        {/* Category Breakdown */}
        {categoryData.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Icon name="chart-bar" size={48} color={isDark ? '#8E8E93' : '#6D6D70'} />
            <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              {t('report.no_data')}
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              {t('report.no_data_subtitle')}
            </Text>
          </Card>
        ) : (
          categoryData.map((item) => (
            <Card key={item.category} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <View
                    style={[
                      styles.categoryIconContainer,
                      { backgroundColor: getExpenseCategoryColor(item.category) + '20' }
                    ]}
                  >
                    <Icon
                      name={getExpenseCategoryIcon(item.category) as any}
                      size={20}
                      color={getExpenseCategoryColor(item.category)}
                    />
                  </View>
                  <View style={styles.categoryTextContainer}>
                    <Text style={[styles.categoryName, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                      {getExpenseCategoryLabel(item.category)}
                    </Text>
                    <Text style={[styles.categoryCount, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                      {item.count === 1 ? t('report.expense_count', { count: item.count }) : t('report.expense_count_plural', { count: item.count })}
                    </Text>
                  </View>
                </View>
                <View style={styles.categoryAmountContainer}>
                  <Text style={[styles.categoryAmount, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                    {formatCurrency(item.total, displayCurrency)}
                  </Text>
                  <Text style={[styles.categoryPercentage, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                    {item.percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${item.percentage}%`,
                      backgroundColor: getExpenseCategoryColor(item.category)
                    }
                  ]}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 85,
  },
  summaryCard: {
    marginBottom: 24,
    padding: 20,
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 13,
    fontFamily: 'System',
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  budgetDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  budgetDetailItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  budgetDetailLabel: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'System',
    marginBottom: 6,
    textAlign: 'center',
  },
  budgetDetailValue: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'System',
    textAlign: 'center',
  },
  categoryCard: {
    marginBottom: 12,
    padding: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 13,
    fontFamily: 'System',
  },
  categoryAmountContainer: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 13,
    fontFamily: 'System',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
