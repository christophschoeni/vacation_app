import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';

import ExpenseCard from '@/components/ui/cards/ExpenseCard';
import SwipeableCard from '@/components/ui/SwipeableCard';
import { Card, FloatingActionButton } from '@/components/design';
import BudgetOverview from '@/components/ui/budget/BudgetOverview';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useVacations, useExpenses } from '@/lib/database';

export default function VacationBudgetScreen() {
  const { id } = useLocalSearchParams();
  const vacationId = Array.isArray(id) ? id[0] : id;

  const colorScheme = useColorScheme();
  const { vacations } = useVacations();
  const { expenses, refresh: refreshExpenses, deleteExpense } = useExpenses(vacationId);

  useFocusEffect(
    React.useCallback(() => {
      refreshExpenses();
    }, [refreshExpenses])
  );

  const vacation = vacations.find(v => v.id === vacationId);

  if (!vacation) {
    return null;
  }

  const handleAddExpense = () => {
    router.push(`/expense/add?vacationId=${vacationId}`);
  };

  const handleExpensePress = (expenseId: string) => {
    console.log('Expense pressed:', expenseId);
  };

  const handleExpenseDelete = (expenseId: string) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;

    Alert.alert(
      'Ausgabe löschen',
      `Möchten Sie die Ausgabe "${expense.description}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(expenseId);
            } catch {
              Alert.alert('Fehler', 'Ausgabe konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };


  return (
    <View style={styles.container}>
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
        {/* Enhanced Budget Overview */}
        <BudgetOverview vacation={vacation} expenses={expenses} />

        {/* Expenses List */}
        <View style={styles.expensesSection}>
          <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            Ausgaben
          </Text>
          {expenses.length === 0 ? (
            <Card style={[styles.emptyExpenses, styles.emptyContent]}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={[styles.emptyText, { color: colorScheme === 'dark' ? '#8E8E93' : '#6D6D70' }]}>
                Noch keine Ausgaben erfasst
              </Text>
              <Text style={[styles.emptySubtext, { color: colorScheme === 'dark' ? '#8E8E93' : '#6D6D70' }]}>
                Tippe auf ➕ um deine erste Ausgabe hinzuzufügen
              </Text>
            </Card>
          ) : (
            expenses.map((expense) => (
              <SwipeableCard
                key={expense.id}
                onPress={() => handleExpensePress(expense.id)}
                onDelete={() => handleExpenseDelete(expense.id)}
              >
                <ExpenseCard
                  expense={expense}
                  onPress={handleExpensePress}
                />
              </SwipeableCard>
            ))
          )}
        </View>
      </ScrollView>

      <FloatingActionButton
        icon="plus"
        onPress={handleAddExpense}
        style={styles.fab}
      />
    </View>
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
    paddingBottom: 140, // More space for FAB and tab bar
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
    marginBottom: 16,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'System',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 100, // Above tab bar
  },
});