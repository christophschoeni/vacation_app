import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassCard } from '@/components/glass';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Expense, ExpenseCategory } from '@/types';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: (id: string) => void;
  onLongPress?: (id: string) => void;
}

const categoryIcons: Record<ExpenseCategory, string> = {
  food: '🍽️',
  transport: '🚗',
  accommodation: '🏨',
  entertainment: '🎭',
  shopping: '🛍️',
  other: '📝',
};

const categoryNames: Record<ExpenseCategory, string> = {
  food: 'Essen',
  transport: 'Transport',
  accommodation: 'Unterkunft',
  entertainment: 'Unterhaltung',
  shopping: 'Einkaufen',
  other: 'Sonstiges',
};

export default function ExpenseCard({ expense, onPress, onLongPress }: ExpenseCardProps) {
  const colorScheme = useColorScheme();

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    };
    return date.toLocaleDateString('de-DE', options);
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency}`;
  };

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
      <GlassCard intensity="light" style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryIcon}>
              {categoryIcons[expense.category]}
            </Text>
            <View style={styles.descriptionContainer}>
              <Text style={[styles.description, { color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E' }]}>
                {expense.description}
              </Text>
              <Text style={[styles.category, { color: colorScheme === 'dark' ? '#8E8E93' : '#6D6D70' }]}>
                {categoryNames[expense.category]}
              </Text>
            </View>
          </View>
          <View style={styles.amountContainer}>
            <Text style={[styles.amount, { color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E' }]}>
              {formatAmount(expense.amount, expense.currency)}
            </Text>
            <Text style={[styles.date, { color: colorScheme === 'dark' ? '#8E8E93' : '#6D6D70' }]}>
              {formatDate(expense.date)}
            </Text>
          </View>
        </View>
      </GlassCard>
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
  categoryIcon: {
    fontSize: 20,
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