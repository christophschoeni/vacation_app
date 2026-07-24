import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { Icon } from '@/components/design';
import { BorderRadius, Spacing, Typography } from '@/constants/design';
import { categoryColor, useIOSTheme } from '@/constants/ios-theme';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import {
  getExpenseCategoryIcon,
  getExpenseCategoryLabel,
} from '@/lib/constants/expense-categories';
import type { Expense } from '@/types';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: (id: string) => void;
  onLongPress?: (id: string) => void;
}

/**
 * A single expense as a grouped-list row: category swatch, description with
 * "category · date", and the amount in the display currency with the original
 * foreign amount beneath it.
 *
 * The home-currency figure is the amount stored at capture time
 * (expense.amountCHF, held in the home currency), NOT a live re-conversion of
 * the original amount. This is the single source of truth: the totals shown on
 * the budget overview sum exactly these values, so the list and the summary can
 * never disagree because of a rate that moved since the expense was entered.
 */
export default function ExpenseCard({
  expense,
  onPress,
  onLongPress,
}: ExpenseCardProps) {
  const theme = useIOSTheme();
  const { defaultCurrency } = useCurrency();

  // The expense was paid in a foreign currency when its input currency differs
  // from the home figure's currency. In that case the home-currency amount
  // (amountCHF) leads and the amount actually paid is the secondary line.
  const isForeign = expense.currency !== defaultCurrency;

  const primary = formatCurrency(expense.amountCHF, defaultCurrency);
  const secondary = isForeign
    ? formatCurrency(expense.amount, expense.currency)
    : null;

  const swatch = categoryColor(theme, expense.category);

  return (
    <TouchableOpacity
      onPress={() => onPress?.(expense.id)}
      onLongPress={() => onLongPress?.(expense.id)}
      activeOpacity={0.7}
      style={[styles.row, { backgroundColor: theme.groupedBackground }]}
      accessibilityRole="button"
      accessibilityLabel={`${expense.description}, ${getExpenseCategoryLabel(
        expense.category
      )}, ${primary}`}
    >
      <View style={[styles.swatch, { backgroundColor: swatch }]}>
        <Icon
          name={getExpenseCategoryIcon(expense.category) as any}
          size={16}
          color="#FFFFFF"
        />
      </View>

      <View style={styles.text}>
        <Text style={[styles.description, { color: theme.label }]} numberOfLines={1}>
          {expense.description}
        </Text>
        <Text style={[styles.meta, { color: theme.secondaryLabel }]} numberOfLines={1}>
          {getExpenseCategoryLabel(expense.category)} · {formatDate(expense.date)}
        </Text>
      </View>

      <View style={styles.amounts}>
        <Text style={[styles.amount, { color: theme.label }]} numberOfLines={1}>
          −{primary}
        </Text>
        {secondary && (
          <Text style={[styles.original, { color: theme.secondaryLabel }]} numberOfLines={1}>
            {secondary}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 11,
    paddingHorizontal: Spacing.lg,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
  description: {
    fontSize: Typography.fontSize.callout,
  },
  meta: {
    fontSize: Typography.fontSize.caption1,
    marginTop: 1,
  },
  amounts: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: Typography.fontSize.callout,
    fontWeight: Typography.fontWeight.semibold,
  },
  original: {
    fontSize: Typography.fontSize.caption1,
    marginTop: 1,
  },
});
