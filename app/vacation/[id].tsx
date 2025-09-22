import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '@/components/ui/layout/AppHeader';
import { ExpenseCard } from '@/components/ui/cards';
import { GlassCard } from '@/components/glass';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useVacations, useExpenses } from '@/lib/database';

export default function VacationDetailScreen() {
  const { id } = useLocalSearchParams();
  const vacationId = Array.isArray(id) ? id[0] : id;

  const colorScheme = useColorScheme();
  const { vacations } = useVacations();
  const { expenses, refresh: refreshExpenses } = useExpenses(vacationId);

  const vacation = vacations.find(v => v.id === vacationId);

  if (!vacation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#f5f5f5' }]}>
        <AppHeader
          title="Ferien nicht gefunden"
          showBackButton
          onBackPress={() => router.push('/(tabs)')}
        />
      </SafeAreaView>
    );
  }

  const handleAddExpense = () => {
    router.push(`/expense/add?vacationId=${vacationId}`);
  };

  const handleExpensePress = (expenseId: string) => {
    console.log('Expense pressed:', expenseId);
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amountCHF, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#f5f5f5' }]}>
      <AppHeader
        title={vacation.destination}
        subtitle={vacation.hotel}
        showBackButton
        onBackPress={() => router.push('/(tabs)')}
        rightButton={{
          title: "+",
          onPress: handleAddExpense,
          variant: "primary"
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refreshExpenses}
            tintColor={colorScheme === 'dark' ? '#fff' : '#000'}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Budget Overview */}
        <GlassCard intensity="light" style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={[styles.budgetTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Budget Übersicht
            </Text>
          </View>
          <View style={styles.budgetRow}>
            <Text style={[styles.budgetLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
              Budget:
            </Text>
            <Text style={[styles.budgetAmount, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              CHF {vacation.budget.toFixed(2)}
            </Text>
          </View>
          <View style={styles.budgetRow}>
            <Text style={[styles.budgetLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
              Ausgegeben:
            </Text>
            <Text style={[styles.budgetAmount, { color: totalExpenses > vacation.budget ? '#ff4444' : (colorScheme === 'dark' ? '#fff' : '#000') }]}>
              CHF {totalExpenses.toFixed(2)}
            </Text>
          </View>
          <View style={styles.budgetRow}>
            <Text style={[styles.budgetLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
              Verbleibt:
            </Text>
            <Text style={[styles.budgetAmount, { color: (vacation.budget - totalExpenses) < 0 ? '#ff4444' : '#00cc00' }]}>
              CHF {(vacation.budget - totalExpenses).toFixed(2)}
            </Text>
          </View>
        </GlassCard>

        {/* Expenses List */}
        <View style={styles.expensesSection}>
          <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            Ausgaben
          </Text>
          {expenses.length === 0 ? (
            <GlassCard intensity="light" style={styles.emptyExpenses}>
              <Text style={[styles.emptyText, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
                Noch keine Ausgaben erfasst
              </Text>
            </GlassCard>
          ) : (
            expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onPress={handleExpensePress}
              />
            ))
          )}
        </View>
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
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  budgetCard: {
    marginBottom: 24,
  },
  budgetHeader: {
    marginBottom: 16,
  },
  budgetTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 16,
    fontFamily: 'System',
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  expensesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    fontFamily: 'System',
  },
  emptyExpenses: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'System',
  },
});