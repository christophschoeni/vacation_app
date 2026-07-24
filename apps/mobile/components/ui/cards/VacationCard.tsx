import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

import { ProgressBar, StatusBadge } from '@/components/design';
import { BorderRadius, Spacing, Typography } from '@/constants/design';
import { budgetColor, useIOSTheme } from '@/constants/ios-theme';
import { getVacationGradient } from '@/lib/vacation-colors';
import { formatDateRange, formatCurrencyCompact } from '@/lib/utils/formatters';
import { daysUntil, vacationStatus } from '@/lib/utils/vacation-status';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTranslation } from '@/lib/i18n';
import type { Vacation } from '@/types';

interface VacationCardProps {
  vacation: Vacation;
  /**
   * Budget and spend, both already converted into the display currency by the
   * parent via useBudgetSummaries.
   *
   * The card must not do this itself: it used to compare a CHF expense total
   * against a budget held in the vacation's own currency and label both with
   * the display currency, so its figures disagreed with the detail screen.
   * It also used to query its own expenses, which meant one query per card.
   */
  totalSpent: number;
  totalBudget: number;
  /**
   * Same figures in the trip currency, shown small under the main line so the
   * user gets a feel for the local-money amounts. Omitted when the trip
   * currency equals the display currency or no rate was available.
   */
  totalSpentTrip?: number;
  totalBudgetTrip?: number;
  tripCurrency?: string;
}

/**
 * Vacation card in the iOS 26 style: a gradient header standing in for the
 * trip photo, then destination, status and a budget bar on a plain surface.
 */
export default function VacationCard({
  vacation,
  totalSpent,
  totalBudget,
  totalSpentTrip,
  totalBudgetTrip,
  tripCurrency,
}: VacationCardProps) {
  const { t } = useTranslation();
  const theme = useIOSTheme();
  const { defaultCurrency } = useCurrency();

  const hasBudget = totalBudget > 0;
  const ratio = hasBudget ? totalSpent / totalBudget : 0;

  const status = vacationStatus(vacation);
  const days = daysUntil(new Date(vacation.startDate));

  const tone = status === 'active' ? 'success' : status === 'planned' ? 'accent' : 'neutral';

  const timing =
    status === 'past'
      ? t('components.vacation_card.completed')
      : status === 'active'
        ? t('components.vacation_card.status.active')
        : days === 0
          ? t('components.vacation_card.today')
          : t('components.vacation_card.in_days', { count: days });

  const dateRange = formatDateRange(
    new Date(vacation.startDate),
    new Date(vacation.endDate)
  );

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.groupedBackground },
        // A past trip is de-emphasised rather than hidden.
        status === 'past' && styles.past,
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${vacation.destination}, ${vacation.country}. ${dateRange}. ${timing}.${
        hasBudget
          ? ` ${t('components.vacation_card.budget')}: ${formatCurrencyCompact(
              totalSpent,
              defaultCurrency
            )} / ${formatCurrencyCompact(totalBudget, defaultCurrency)}.`
          : ''
      }`}
    >
      {/* The trip photo when set, otherwise the generated gradient. */}
      {vacation.imageUrl ? (
        <Image source={{ uri: vacation.imageUrl }} style={styles.hero} contentFit="cover" />
      ) : (
        <LinearGradient
          colors={getVacationGradient(vacation)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        />
      )}

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <Text style={[styles.destination, { color: theme.label }]} numberOfLines={1}>
              {vacation.destination}
            </Text>
            <Text style={[styles.meta, { color: theme.secondaryLabel }]} numberOfLines={1}>
              {dateRange} · {timing}
            </Text>
          </View>
          <StatusBadge
            label={t(`components.vacation_card.status.${status}`)}
            tone={tone}
          />
        </View>

        {hasBudget && (
          <View style={styles.budget}>
            <View style={styles.budgetRow}>
              <Text style={[styles.budgetLabel, { color: theme.secondaryLabel }]}>
                {t('components.vacation_card.budget')}
              </Text>
              <View style={styles.budgetValues}>
                <Text style={[styles.budgetValue, { color: theme.label }]}>
                  {formatCurrencyCompact(totalSpent, defaultCurrency)} /{' '}
                  {formatCurrencyCompact(totalBudget, defaultCurrency)}
                </Text>
                {tripCurrency && totalSpentTrip !== undefined && totalBudgetTrip !== undefined && (
                  <Text style={[styles.budgetSubValue, { color: theme.secondaryLabel }]} numberOfLines={1}>
                    {formatCurrencyCompact(totalSpentTrip, tripCurrency)} /{' '}
                    {formatCurrencyCompact(totalBudgetTrip, tripCurrency)}
                  </Text>
                )}
              </View>
            </View>
            <ProgressBar progress={ratio} color={budgetColor(theme, ratio)} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  past: {
    opacity: 0.65,
  },
  hero: {
    // Reference 1a: 108 for the featured card. A fixed height is essential -
    // the gradient has no intrinsic size and stretches to fill otherwise.
    height: 108,
  },
  body: {
    padding: Spacing.lg,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  titleText: {
    flex: 1,
  },
  destination: {
    fontSize: Typography.fontSize.title3,
    fontWeight: Typography.fontWeight.semibold,
  },
  meta: {
    fontSize: Typography.fontSize.footnote,
    marginTop: 2,
  },
  budget: {
    gap: 6,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  budgetLabel: {
    fontSize: Typography.fontSize.footnote,
  },
  budgetValues: {
    alignItems: 'flex-end',
  },
  budgetValue: {
    fontSize: Typography.fontSize.footnote,
    fontWeight: Typography.fontWeight.semibold,
  },
  budgetSubValue: {
    fontSize: Typography.fontSize.caption2,
    marginTop: 1,
  },
});
