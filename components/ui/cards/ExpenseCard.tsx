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
import { currencyService } from '@/lib/currency';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: (id: string) => void;
  onLongPress?: (id: string) => void;
}

/**
 * A single expense as a grouped-list row: category swatch, description with
 * "category · date", and the amount in the display currency with the original
 * foreign amount beneath it.
 */
export default function ExpenseCard({
  expense,
  onPress,
  onLongPress,
}: ExpenseCardProps) {
  const theme = useIOSTheme();
  const { defaultCurrency } = useCurrency();
  const [convertedAmount, setConvertedAmount] = React.useState<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function convert() {
      if (expense.currency !== defaultCurrency) {
        try {
          const result = await currencyService.convertCurrency(
            expense.amount,
            expense.currency,
            defaultCurrency
          );
          if (!cancelled) setConvertedAmount(result);
        } catch {
          // Failed to convert - the original amount is shown on its own.
        }
      } else {
        setConvertedAmount(null);
      }
    }

    convert();

    return () => {
      cancelled = true;
    };
  }, [expense.amount, expense.currency, defaultCurrency]);

  const isForeign = convertedAmount !== null;

  // Lead with the amount in the user's own currency when we have it, and keep
  // the amount actually paid as the secondary line.
  const primary = isForeign
    ? formatCurrency(convertedAmount, defaultCurrency)
    : formatCurrency(expense.amount, expense.currency);
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
