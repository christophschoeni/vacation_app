import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Icon } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import {
  EXPENSE_CATEGORIES,
  getExpenseCategoryIcon,
  getExpenseCategoryLabel,
  getExpenseCategoryColor
} from '@/lib/constants/expense-categories';
import type { Expense } from '@/types';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: (id: string) => void;
  onLongPress?: (id: string) => void;
}

export default function ExpenseCard({ expense, onPress, onLongPress }: ExpenseCardProps) {
  const colorScheme = useColorScheme();

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

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryContainer}>
            <Icon
              name={getExpenseCategoryIcon(expense.category) as any}
              size={20}
              color={colorScheme === 'dark' ? '#8E8E93' : '#6D6D70'}
            />
            <View style={styles.descriptionContainer}>
              <Text style={[styles.description, { color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E' }]}>
                {expense.description}
              </Text>
              <Text style={[styles.category, { color: colorScheme === 'dark' ? '#8E8E93' : '#6D6D70' }]}>
                {getExpenseCategoryLabel(expense.category)}
              </Text>
            </View>
          </View>
          <View style={styles.amountContainer}>
            <Text style={[styles.amount, { color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E' }]}>
              {formatCurrency(expense.amount, expense.currency)}
            </Text>
            <Text style={[styles.date, { color: colorScheme === 'dark' ? '#8E8E93' : '#6D6D70' }]}>
              {formatDate(expense.date)}
            </Text>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
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
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
    fontFamily: 'System',
  },
  date: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'System',
  },
});