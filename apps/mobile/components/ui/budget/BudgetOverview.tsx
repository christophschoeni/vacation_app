import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import { BudgetRing } from '@/components/design';
import { BorderRadius, Spacing, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';
import { Vacation, Expense } from '@/types';
import {
  calculateBudgetAnalysisAsync,
  formatCurrency,
  BudgetAnalysis,
} from '@/lib/budget-calculations';
import { currencyService } from '@/lib/currency';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTranslation } from '@/lib/i18n';

interface BudgetOverviewProps {
  vacation: Vacation;
  expenses: Expense[];
}

/** One of the three compact figures under the ring. */
function StatTile({ label, value, subValue }: { label: string; value: string; subValue?: string }) {
  const theme = useIOSTheme();
  return (
    <View style={[styles.tile, { backgroundColor: theme.tile }]}>
      <Text style={[styles.tileLabel, { color: theme.secondaryLabel }]} numberOfLines={1}>
        {label}
      </Text>
      <Text
        style={[styles.tileValue, { color: theme.label }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {value}
      </Text>
      {subValue && (
        <Text style={[styles.tileSubValue, { color: theme.secondaryLabel }]} numberOfLines={1}>
          {subValue}
        </Text>
      )}
    </View>
  );
}

/**
 * Budget hero for the vacation detail screen: a ring showing how much is left,
 * with budget / spent / average-per-day underneath.
 */
export default function BudgetOverview({ vacation, expenses }: BudgetOverviewProps) {
  const theme = useIOSTheme();
  const { t } = useTranslation();
  const { defaultCurrency } = useCurrency();
  const [analysis, setAnalysis] = React.useState<BudgetAnalysis | null>(null);
  const [loading, setLoading] = React.useState(true);

  // The trip currency is shown as a small secondary figure alongside the home
  // currency, so the user gets a feel for the local-money amounts. Only
  // meaningful when the trip currency differs from the home currency.
  const tripCurrency = vacation.currency || defaultCurrency;
  const showTrip = Boolean(tripCurrency) && tripCurrency !== defaultCurrency;
  const [tripValues, setTripValues] = React.useState<{
    budget: number;
    spent: number;
    perDay: number;
  } | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function loadAnalysis() {
      setLoading(true);
      try {
        const result = await calculateBudgetAnalysisAsync(
          vacation,
          expenses,
          defaultCurrency
        );
        if (cancelled) return;
        setAnalysis(result);

        if (showTrip) {
          try {
            const [budget, spent, perDay] = await Promise.all([
              currencyService.convertCurrency(result.totalBudget, defaultCurrency, tripCurrency),
              currencyService.convertCurrency(result.totalExpenses, defaultCurrency, tripCurrency),
              currencyService.convertCurrency(result.averageSpentPerDay, defaultCurrency, tripCurrency),
            ]);
            if (!cancelled) setTripValues({ budget, spent, perDay });
          } catch {
            // No rate available - just omit the secondary figure.
            if (!cancelled) setTripValues(null);
          }
        } else if (!cancelled) {
          setTripValues(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAnalysis();

    return () => {
      cancelled = true;
    };
  }, [vacation, expenses, defaultCurrency, showTrip, tripCurrency]);

  if (loading || !analysis) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.secondaryLabel} />
      </View>
    );
  }

  const ratio = analysis.totalBudget > 0
    ? analysis.totalExpenses / analysis.totalBudget
    : 0;

  // The ring shows what is left; over budget it shows the overspend instead.
  const isOver = analysis.remainingBudget < 0;

  return (
    <View style={styles.container}>
      <BudgetRing
        progress={ratio}
        value={formatCurrency(Math.abs(analysis.remainingBudget), defaultCurrency)}
        caption={
          isOver
            ? t('components.vacation_card.over_budget')
            : `${defaultCurrency} ${t('vacation.detail.remaining_short')}`
        }
      />

      <View style={styles.tiles}>
        <StatTile
          label={t('components.budget_overview.total_budget')}
          value={formatCurrency(analysis.totalBudget, defaultCurrency)}
          subValue={tripValues ? formatCurrency(tripValues.budget, tripCurrency) : undefined}
        />
        <StatTile
          label={t('vacation.detail.spent')}
          value={formatCurrency(analysis.totalExpenses, defaultCurrency)}
          subValue={tripValues ? formatCurrency(tripValues.spent, tripCurrency) : undefined}
        />
        <StatTile
          label={t('vacation.detail.per_day')}
          value={formatCurrency(analysis.averageSpentPerDay, defaultCurrency)}
          subValue={tripValues ? formatCurrency(tripValues.perDay, tripCurrency) : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  loading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  tiles: {
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'stretch',
  },
  tile: {
    flex: 1,
    borderRadius: BorderRadius.tile,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  tileLabel: {
    fontSize: Typography.fontSize.caption1,
  },
  tileValue: {
    fontSize: Typography.fontSize.subheadline,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: 2,
  },
  tileSubValue: {
    fontSize: Typography.fontSize.caption2,
    marginTop: 1,
  },
});
