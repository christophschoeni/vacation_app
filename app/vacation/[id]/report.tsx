import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import AppHeader from '@/components/ui/AppHeader';
import {
  Card,
  Icon,
  GroupedList,
  ProgressBar,
  SegmentedBar,
} from '@/components/design';
import { BorderRadius, Spacing, Typography } from '@/constants/design';
import { categoryColor, useIOSTheme } from '@/constants/ios-theme';
import { useRouteParam } from '@/hooks/use-route-param';
import {
  useVacation,
  useExpenses,
  useCategoryLimits,
  useSetCategoryLimit,
  useClearCategoryLimit,
} from '@/hooks/queries';
import { useTranslation } from '@/lib/i18n';
import { ExpenseCategory } from '@/types';
import { getExpenseCategoryLabel } from '@/lib/constants/expense-categories';
import { formatCurrency, parseAmount } from '@/lib/utils/formatters';
import { useCurrency } from '@/contexts/CurrencyContext';
import { currencyService } from '@/lib/currency';
import { useTabBarPadding } from '@/hooks/use-tab-bar-padding';
import { calculateBudgetAnalysisAsync, type BudgetAnalysis } from '@/lib/budget-calculations';

interface CategoryExpense {
  category: ExpenseCategory;
  total: number;
  count: number;
  percentage: number;
}

/** One category row: swatch, name, spend, and its limit bar. */
function CategoryRow({
  item,
  limit,
  currency,
  onEditLimit,
}: {
  item: CategoryExpense;
  limit: number | undefined;
  currency: string;
  onEditLimit: () => void;
}) {
  const theme = useIOSTheme();
  const { t } = useTranslation();

  const swatch = categoryColor(theme, item.category);
  const hasLimit = limit !== undefined && limit > 0;
  const ratio = hasLimit ? item.total / limit : 0;
  const isOver = hasLimit && item.total > limit;

  return (
    <TouchableOpacity
      onPress={onEditLimit}
      activeOpacity={0.7}
      style={styles.categoryRow}
      accessibilityRole="button"
      accessibilityLabel={`${getExpenseCategoryLabel(item.category)}, ${formatCurrency(
        item.total,
        currency
      )}. ${hasLimit ? t('report.limit.label', { limit: formatCurrency(limit, currency), percent: Math.round(ratio * 100) }) : t('report.limit.none')}`}
    >
      <View style={styles.categoryHead}>
        <View style={[styles.swatch, { backgroundColor: swatch }]} />
        <Text style={[styles.categoryName, { color: theme.label }]} numberOfLines={1}>
          {getExpenseCategoryLabel(item.category)}
        </Text>
        <Text
          style={[
            styles.categoryAmount,
            { color: isOver ? theme.danger : theme.label },
          ]}
        >
          {formatCurrency(item.total, currency)}
        </Text>
      </View>

      <View style={styles.limitRow}>
        <ProgressBar
          progress={hasLimit ? ratio : 0}
          color={isOver ? theme.danger : swatch}
          height={5}
          style={styles.limitBar}
        />
        <Text
          style={[
            styles.limitLabel,
            {
              color: isOver ? theme.danger : theme.secondaryLabel,
              fontWeight: isOver
                ? Typography.fontWeight.semibold
                : Typography.fontWeight.regular,
            },
          ]}
          numberOfLines={1}
        >
          {!hasLimit
            ? t('report.limit.none')
            : isOver
              ? t('report.limit.exceeded', { limit: formatCurrency(limit, currency) })
              : t('report.limit.label', {
                  limit: formatCurrency(limit, currency),
                  percent: Math.round(ratio * 100),
                })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function VacationReportScreen() {
  const tabBarPadding = useTabBarPadding();
  const vacationId = useRouteParam('id');
  const theme = useIOSTheme();
  const { t } = useTranslation();
  const { data: vacation } = useVacation(vacationId);
  const { data: expenses = [] } = useExpenses(vacationId || undefined);
  const { data: limits } = useCategoryLimits(vacationId);
  const { mutateAsync: setLimit } = useSetCategoryLimit();
  const { mutateAsync: clearLimit } = useClearCategoryLimit();
  const { defaultCurrency } = useCurrency();
  const [categoryData, setCategoryData] = useState<CategoryExpense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function calculateExpenses() {
      const categoryMap = new Map<ExpenseCategory, { total: number; count: number }>();
      let total = 0;

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

      const data: CategoryExpense[] = Array.from(categoryMap.entries()).map(
        ([category, { total: catTotal, count }]) => ({
          category,
          total: catTotal,
          count,
          percentage: total > 0 ? (catTotal / total) * 100 : 0,
        })
      );

      data.sort((a, b) => b.total - a.total);

      setCategoryData(data);
      setTotalExpenses(total);
    }

    calculateExpenses();

    return () => {
      cancelled = true;
    };
  }, [expenses, defaultCurrency, vacationId]);

  // Pace forecast needs the same budget figures the detail screen shows.
  React.useEffect(() => {
    let cancelled = false;
    if (!vacation) return;

    calculateBudgetAnalysisAsync(vacation, expenses, defaultCurrency).then((result) => {
      if (!cancelled) setAnalysis(result);
    });

    return () => {
      cancelled = true;
    };
  }, [vacation, expenses, defaultCurrency]);

  const handleEditLimit = (category: ExpenseCategory) => {
    const current = limits?.get(category);

    Alert.prompt(
      getExpenseCategoryLabel(category),
      t('report.limit.set'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        ...(current
          ? [
              {
                text: t('common.delete'),
                style: 'destructive' as const,
                onPress: async () => {
                  if (!vacationId) return;
                  try {
                    await clearLimit({ vacationId, category });
                  } catch {
                    Alert.alert(t('common.error'));
                  }
                },
              },
            ]
          : []),
        {
          text: t('common.save'),
          onPress: async (value?: string) => {
            if (!vacationId) return;
            const amount = parseAmount(value ?? '');
            // An unparseable or negative entry is ignored rather than stored as
            // a zero limit, which would read as "everything is over budget".
            if (amount === null || amount <= 0) return;
            try {
              await setLimit({ vacationId, category, limitAmount: amount });
            } catch {
              Alert.alert(t('common.error'));
            }
          },
        },
      ],
      'plain-text',
      current ? String(current.limitAmount) : '',
      'decimal-pad'
    );
  };

  // Forecast: at the current daily rate, does the budget run out before the
  // trip ends? Only meaningful once the trip is under way and has a budget.
  const pace = React.useMemo(() => {
    if (!analysis || analysis.totalBudget <= 0) return null;
    if (analysis.remainingDays <= 0 || analysis.averageSpentPerDay <= 0) return null;

    const daysCovered = analysis.remainingBudget / analysis.averageSpentPerDay;
    const shortfall = Math.round(analysis.remainingDays - daysCovered);

    return {
      shortfall,
      actual: formatCurrency(analysis.averageSpentPerDay, defaultCurrency),
      target: formatCurrency(
        analysis.remainingBudget / analysis.remainingDays,
        defaultCurrency
      ),
    };
  }, [analysis, defaultCurrency]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      <AppHeader
        variant="large"
        title={t('report.title')}
        showBack={true}
        onBackPress={() => router.push('/(tabs)')}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summary}>
          <Text style={[styles.summaryMeta, { color: theme.secondaryLabel }]}>
            {vacation?.destination}
          </Text>
          <Text style={[styles.summaryAmount, { color: theme.label }]}>
            {formatCurrency(totalExpenses, defaultCurrency)}
            {analysis && analysis.totalBudget > 0 && (
              <Text style={[styles.summaryOf, { color: theme.secondaryLabel }]}>
                {'  '}
                {t('report.of_budget', {
                  budget: formatCurrency(analysis.totalBudget, defaultCurrency),
                  percent: Math.round(
                    (totalExpenses / analysis.totalBudget) * 100
                  ),
                })}
              </Text>
            )}
          </Text>

          {categoryData.length > 0 && (
            <SegmentedBar
              style={styles.segmented}
              segments={categoryData.map((item) => ({
                value: item.total,
                color: categoryColor(theme, item.category),
              }))}
            />
          )}
        </View>

        {categoryData.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Icon name="chart-bar" size={48} color={theme.secondaryLabel} />
            <Text style={[styles.emptyText, { color: theme.secondaryLabel }]}>
              {t('report.no_data')}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.secondaryLabel }]}>
              {t('report.no_data_subtitle')}
            </Text>
          </Card>
        ) : (
          <GroupedList>
            {categoryData.map((item) => (
              <CategoryRow
                key={item.category}
                item={item}
                limit={limits?.get(item.category)?.limitAmount}
                currency={defaultCurrency}
                onEditLimit={() => handleEditLimit(item.category)}
              />
            ))}
          </GroupedList>
        )}

        {pace && pace.shortfall > 0 && (
          <View style={[styles.notice, { backgroundColor: theme.warning + '1F' }]}>
            <View style={[styles.noticeIcon, { backgroundColor: theme.warning }]}>
              <Text style={styles.noticeMark}>!</Text>
            </View>
            <Text style={[styles.noticeText, { color: theme.label }]}>
              {t('report.pace.warning', {
                days: pace.shortfall,
                actual: pace.actual,
                target: pace.target,
              })}
            </Text>
          </View>
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
    paddingTop: 0,
    paddingHorizontal: Spacing.lg,
  },
  summary: {
    paddingBottom: Spacing.lg,
  },
  summaryMeta: {
    fontSize: Typography.fontSize.subheadline,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 2,
  },
  summaryOf: {
    fontSize: Typography.fontSize.subheadline,
    fontWeight: Typography.fontWeight.medium,
  },
  segmented: {
    marginTop: Spacing.md,
  },
  categoryRow: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  categoryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  categoryName: {
    flex: 1,
    fontSize: Typography.fontSize.callout,
  },
  categoryAmount: {
    fontSize: Typography.fontSize.callout,
    fontWeight: Typography.fontWeight.semibold,
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 7,
    paddingLeft: 22,
  },
  limitBar: {
    flex: 1,
  },
  limitLabel: {
    fontSize: Typography.fontSize.caption1,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: Spacing.lg,
    padding: 13,
    borderRadius: BorderRadius['3xl'],
  },
  noticeIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeMark: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.subheadline,
    fontWeight: Typography.fontWeight.bold,
  },
  noticeText: {
    flex: 1,
    fontSize: Typography.fontSize.footnote,
    lineHeight: Typography.fontSize.footnote * 1.35,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: Spacing['2xl'],
  },
  emptyText: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.subheadline,
    textAlign: 'center',
  },
});
