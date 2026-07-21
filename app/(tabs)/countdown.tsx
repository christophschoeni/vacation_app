import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { ProgressBar } from '@/components/design';
import EmptyState from '@/components/ui/common/EmptyState';
import { BorderRadius, Spacing, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';
import { useVacations, useExpenseTotals } from '@/hooks/queries';
import { useBudgetSummaries } from '@/hooks/queries/use-budget-summary';
import { useCountdown } from '@/hooks/use-countdown';
import { useTabBarPadding } from '@/hooks/use-tab-bar-padding';
import { useTranslation } from '@/lib/i18n';
import { formatCurrencyCompact, formatDate } from '@/lib/utils/formatters';
import { featuredVacation, vacationStatus } from '@/lib/utils/vacation-status';
import { useCurrency } from '@/contexts/CurrencyContext';

/** One of the four glass tiles under the big day count. */
function UnitTile({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.unit}>
      <Text style={styles.unitValue}>{String(value).padStart(2, '0')}</Text>
      <Text style={styles.unitLabel}>{label}</Text>
    </View>
  );
}

/**
 * Countdown to the trip the user is living or waiting for.
 *
 * The hero is deliberately dark in both colour schemes - it stands in for the
 * trip photo, and the design keeps it constant rather than theming it.
 */
export default function CountdownScreen() {
  const theme = useIOSTheme();
  const { t } = useTranslation();
  const tabBarPadding = useTabBarPadding();
  const { defaultCurrency } = useCurrency();

  const { data: vacations = [] } = useVacations();
  const { data: expenseTotals } = useExpenseTotals();
  const { data: budgetSummaries } = useBudgetSummaries(vacations, expenseTotals);

  const vacation = React.useMemo(() => featuredVacation(vacations), [vacations]);

  const status = vacation ? vacationStatus(vacation) : null;
  // While a trip is running the interesting moment is its end, not its start.
  const target = vacation
    ? new Date(status === 'active' ? vacation.endDate : vacation.startDate)
    : undefined;

  const countdown = useCountdown(target);

  if (!vacation || !countdown) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={['top']}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: tabBarPadding }}>
          <EmptyState
            icon="airplane"
            title={t('countdown.empty.title')}
            subtitle={t('countdown.empty.subtitle')}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const summary = budgetSummaries?.get(vacation.id);
  const hasBudget = (summary?.totalBudget ?? 0) > 0;
  const spent = summary?.totalSpent ?? 0;
  const budget = summary?.totalBudget ?? 0;
  const remaining = budget - spent;

  return (
    <LinearGradient
      colors={['#0B1C2E', '#12324A', '#1B4A63']}
      style={styles.container}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: tabBarPadding }]}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/vacation/${vacation.id}`)}
            accessibilityRole="button"
          >
            <Text style={styles.eyebrow}>
              {status === 'active'
                ? t('countdown.in_progress')
                : t('countdown.next_trip')}
            </Text>
            <Text style={styles.destination}>{vacation.destination}</Text>
            <Text style={styles.dates}>
              {formatDate(new Date(vacation.startDate))} –{' '}
              {formatDate(new Date(vacation.endDate))}
            </Text>

            <Text style={styles.bigNumber}>{countdown.days}</Text>
            <Text style={styles.bigLabel}>{t('countdown.days_until')}</Text>

            <View style={styles.units}>
              <UnitTile value={countdown.days} label={t('countdown.unit.days')} />
              <UnitTile value={countdown.hours} label={t('countdown.unit.hours')} />
              <UnitTile value={countdown.minutes} label={t('countdown.unit.minutes')} />
              <UnitTile value={countdown.seconds} label={t('countdown.unit.seconds')} />
            </View>
          </TouchableOpacity>

          {hasBudget && (
            <View style={styles.budgetCard}>
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>
                  {t('countdown.remaining_budget')}
                </Text>
                <Text style={styles.budgetValue}>
                  {formatCurrencyCompact(remaining, defaultCurrency)}
                </Text>
              </View>
              <ProgressBar
                progress={spent / budget}
                color="#5AC8FA"
                trackColor="rgba(255,255,255,0.14)"
                style={styles.budgetBar}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['4xl'],
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: Typography.fontSize.footnote,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },
  destination: {
    fontSize: 36,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  dates: {
    fontSize: Typography.fontSize.subheadline,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
    textAlign: 'center',
  },
  bigNumber: {
    fontSize: 110,
    fontWeight: Typography.fontWeight.heavy,
    letterSpacing: -3,
    color: '#FFFFFF',
    marginTop: Spacing['2xl'],
    textAlign: 'center',
  },
  bigLabel: {
    fontSize: Typography.fontSize.body,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },
  units: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing['3xl'],
    justifyContent: 'center',
  },
  unit: {
    width: 76,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.tile,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  unitValue: {
    fontSize: 26,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  unitLabel: {
    fontSize: Typography.fontSize.caption2,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
  },
  budgetCard: {
    alignSelf: 'stretch',
    marginTop: Spacing['4xl'],
    padding: Spacing.lg,
    borderRadius: BorderRadius['4xl'],
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetLabel: {
    fontSize: Typography.fontSize.subheadline,
    color: 'rgba(255,255,255,0.6)',
  },
  budgetValue: {
    fontSize: Typography.fontSize.subheadline,
    fontWeight: Typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  budgetBar: {
    marginTop: 9,
  },
});
