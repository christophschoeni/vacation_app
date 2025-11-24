import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Icon } from '@/components/design';
import { useColorScheme } from 'react-native';
import { formatDateTime, formatCurrency } from '@/lib/utils/formatters';
import {
  EXPENSE_CATEGORIES,
  getExpenseCategoryIcon,
  getExpenseCategoryLabel,
  getExpenseCategoryColor
} from '@/lib/constants/expense-categories';
import type { Expense } from '@/types';
import { useCurrency } from '@/contexts/CurrencyContext';
import { currencyService } from '@/lib/currency';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: (id: string) => void;
  onLongPress?: (id: string) => void;
}

export default function ExpenseCard({ expense, onPress, onLongPress }: ExpenseCardProps) {
  const colorScheme = useColorScheme();
  const { defaultCurrency } = useCurrency();
  const [convertedAmount, setConvertedAmount] = React.useState<number | null>(null);

  // Convert amount to default currency if different
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
          if (!cancelled) {
            setConvertedAmount(result);
          }
        } catch (error) {
          console.warn('Failed to convert currency:', error);
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

  const handlePress = () => {
    if (onPress) {
      onPress(expense.id);
    }
  };

  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress(expense.id);
    }
  };

  const categoryColor = getExpenseCategoryColor(expense.category);

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <Card style={[styles.card, { backgroundColor: categoryColor }]}>
        {/* Date at top */}
        <Text style={[styles.date, { color: 'rgba(255, 255, 255, 0.8)' }]}>
          {formatDateTime(expense.date)}
        </Text>

        {/* Main content row */}
        <View style={styles.cardContent}>
          <View style={styles.leftContent}>
            <Icon
              name={getExpenseCategoryIcon(expense.category) as any}
              size={20}
              color="rgba(255, 255, 255, 0.9)"
            />
            <View style={styles.descriptionContainer}>
              <Text style={[styles.description, { color: '#FFFFFF' }]}>
                {expense.description}
              </Text>
              <Text style={[styles.category, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                {getExpenseCategoryLabel(expense.category)}
              </Text>
            </View>
          </View>
          <View style={styles.amountContainer}>
            <Text style={[styles.amount, { color: '#FFFFFF' }]}>
              {formatCurrency(expense.amount, expense.currency)}
            </Text>
            {convertedAmount !== null && (
              <Text style={[styles.convertedAmount, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                {formatCurrency(convertedAmount, defaultCurrency)}
              </Text>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  date: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'System',
    marginBottom: 8,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  descriptionContainer: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'System',
  },
  category: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'System',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
    fontFamily: 'System',
  },
  convertedAmount: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'System',
  },
});