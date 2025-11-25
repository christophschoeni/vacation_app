import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Vacation, Expense } from '@/types';
import { calculateBudgetAnalysisAsync, formatCurrency, BudgetAnalysis } from '@/lib/budget-calculations';
import { useColorScheme } from 'react-native';
import { useTranslation } from '@/lib/i18n';
import { useCurrency } from '@/contexts/CurrencyContext';

interface BudgetInfoRowProps {
  vacation: Vacation;
  expenses: Expense[];
}

export default function BudgetInfoRow({ vacation, expenses }: BudgetInfoRowProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const { defaultCurrency } = useCurrency();
  const [analysis, setAnalysis] = React.useState<BudgetAnalysis | null>(null);

  // Display currency is always the user's default currency from settings
  const displayCurrency = defaultCurrency;

  React.useEffect(() => {
    const loadAnalysis = async () => {
      // Calculate and display in user's default currency
      const result = await calculateBudgetAnalysisAsync(vacation, expenses, displayCurrency);
      setAnalysis(result);
    };
    loadAnalysis();
  }, [vacation, expenses, displayCurrency]);

  if (!analysis) {
    return null;
  }

  return (
    <View style={[styles.budgetInfoRow, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <View style={styles.budgetInfoItem}>
        <Text style={[styles.budgetInfoAmount, { color: analysis.isOverBudget ? '#FF3B30' : (isDark ? '#FFFFFF' : '#1C1C1E') }]} numberOfLines={1}>
          {formatCurrency(Math.abs(analysis.remainingBudget), displayCurrency)}
        </Text>
        <Text style={[styles.budgetInfoLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
          {analysis.isOverBudget ? 'Über Budget' : 'Restbetrag'}
        </Text>
      </View>
      <View style={styles.budgetInfoItem}>
        <Text style={[styles.budgetInfoAmount, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]} numberOfLines={1}>
          {formatCurrency(analysis.averageSpentPerDay, displayCurrency)}
        </Text>
        <Text style={[styles.budgetInfoLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
          Ø Pro Tag
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  budgetInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(142, 142, 147, 0.2)',
  },
  budgetInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  budgetInfoAmount: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 4,
  },
  budgetInfoLabel: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'System',
  },
});
