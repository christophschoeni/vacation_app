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
import { useRouteParam } from '@/hooks/use-route-param';
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
import { useCurrency } from '@/contexts/CurrencyContext';
import { currencyService } from '@/lib/currency';

interface CategoryExpense {
  category: ExpenseCategory;
  total: number;
  count: number;
  percentage: number;
}

export default function VacationReportScreen() {
  const vacationId = useRouteParam('id');
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { vacations, refreshVacations } = useVacations();
  const { expenses, refresh: refreshExpenses } = useExpenses(vacationId || '');
  const { defaultCurrency } = useCurrency();
  const [categoryData, setCategoryData] = useState<CategoryExpense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const insets = useSafeAreaInsets();

  const isDark = colorScheme === 'dark';
  const vacation = vacations.find(v => v.id === vacationId);

  useFocusEffect(
    React.useCallback(() => {
      refreshVacations();
      refreshExpenses();
    }, [refreshVacations, refreshExpenses])
  );

  // Calculate category expenses for this vacation
  React.useEffect(() => {
    let cancelled = false;

    async function calculateExpenses() {
      const categoryMap = new Map<ExpenseCategory, { total: number; count: number }>();
      let total = 0;

      // Convert all expenses to the default currency
      for (const expense of expenses) {
        const convertedAmount = await currencyService.convertCurrency(
          expense.amountCHF,
          'CHF',
          defaultCurrency
        );

        total += convertedAmount;

        const existing = categoryMap.get(expense.category) || { total: 0, count: 0 };
        categoryMap.set(expense.category, {
          total: existing.total + convertedAmount,
          count: existing.count + 1,
        });
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

      setCategoryData(data);
      setTotalExpenses(total);
    }

    calculateExpenses();

    return () => {
      cancelled = true;
    };
  }, [expenses, defaultCurrency]);

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
      edges={['top', 'bottom']}
    >
      <AppHeader
        title={t('vacation.tabs.report')}
        variant="large"
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryContent}>
            <Text style={[styles.summaryLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              {t('report.total_expenses')}
            </Text>
            <Text style={[styles.summaryAmount, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
              {formatCurrency(totalExpenses, defaultCurrency)}
            </Text>
            <Text style={[styles.summarySubtext, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              {vacation?.destination}
            </Text>
          </View>
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
                    {formatCurrency(item.total, defaultCurrency)}
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
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 16,
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
