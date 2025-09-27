import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import ExpenseCard from '@/components/ui/cards/ExpenseCard';
import SwipeableCard from '@/components/ui/SwipeableCard';
import { Card, FloatingActionButton, Icon } from '@/components/design';
import BudgetOverview from '@/components/ui/budget/BudgetOverview';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouteParam } from '@/hooks/use-route-param';
import { useVacations } from '@/hooks/use-vacations';
import { useExpenses } from '@/lib/database';

export default function VacationBudgetScreen() {
  const vacationId = useRouteParam('id');
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
        <View style={[styles.expensesSection, { paddingHorizontal: 16 }]}>
          {expenses.length === 0 ? (
            <Card style={[styles.emptyExpenses, styles.emptyContent]}>
              <Icon name="budget" size={48} color={colorScheme === 'dark' ? '#8E8E93' : '#6D6D70'} style={styles.emptyIconStyle} />
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
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 85, // Reduced space for compact tab bar
  },
  expensesSection: {
    marginBottom: 24,
  },
  emptyExpenses: {
    marginBottom: 16,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIconStyle: {
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
    bottom: 85, // Above tab bar - adjusted for smaller tab bar
  },
});