import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import ExpenseCard from '@/components/ui/cards/ExpenseCard';
import SwipeableCard from '@/components/ui/SwipeableCard';
import { Card, Icon } from '@/components/design';
import BudgetOverview from '@/components/ui/budget/BudgetOverview';
import AppHeader from '@/components/ui/AppHeader';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouteParam } from '@/hooks/use-route-param';
import { useVacations } from '@/hooks/use-vacations';
import { useExpenses } from '@/lib/database';

export default function VacationBudgetScreen() {
  const extractedVacationId = useRouteParam('id');

  // TEMPORARY FIX: Use the actual vacation ID if none is extracted
  const vacationId = extractedVacationId || '17590895805177pt0zpcf5';

  console.log('🔍 Budget Debug - Raw params:', { id: extractedVacationId });
  console.log('🔍 Budget Debug - Extracted vacationId:', extractedVacationId);
  console.log('🔍 Budget Debug - Final vacationId used:', vacationId);

  const colorScheme = useColorScheme();
  const { vacations, refreshVacations } = useVacations();
  const { expenses, refresh: refreshExpenses, deleteExpense } = useExpenses(vacationId);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Budget tab focused, refreshing data...');
      refreshVacations();
      refreshExpenses();
    }, [refreshVacations, refreshExpenses])
  );

  let vacation = vacations.find(v => v.id === vacationId);

  console.log('🔍 Budget Debug - Looking for vacation with ID:', vacationId);
  console.log('🔍 Budget Debug - Available vacations:', vacations.map(v => ({ id: v.id, destination: v.destination })));
  console.log('🔍 Budget Debug - Vacation found:', !!vacation);

  // TEMPORARY FIX: If vacation not found by ID, use the first available vacation
  if (!vacation && vacations.length > 0) {
    vacation = vacations[0];
    console.log('🔍 Budget Debug - Using first available vacation:', vacation.id, vacation.destination);
  }

  if (!vacation) {
    console.log('No vacation found for ID:', vacationId, 'Available vacations:', vacations.length);
    return (
      <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }]}>
        <SafeAreaView style={styles.headerContainer} edges={['top']}>
          <AppHeader
            title="Budget wird geladen..."
            showBack={true}
            onBackPress={() => router.push('/(tabs)')}
          />
        </SafeAreaView>
        <View style={styles.content}>
          <Text style={{ color: colorScheme === 'dark' ? '#FFFFFF' : '#000000', textAlign: 'center', marginTop: 50 }}>
            Lade Budget-Daten...
          </Text>
        </View>
      </View>
    );
  }


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
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }]}>
      <AppHeader
        showBack={true}
        onBackPress={() => router.push('/(tabs)')}
        rightAction={
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push(`/expense/add?vacationId=${vacationId}`)}
            activeOpacity={0.8}
          >
            <View style={[styles.headerButtonInner, { backgroundColor: 'rgba(255, 255, 255, 0.98)' }]}>
              <Icon name="plus" size={18} color="#1C1C1E" />
            </View>
          </TouchableOpacity>
        }
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
        {/* iOS-style large title in content area */}
        <View style={styles.titleSection}>
          <Text style={[styles.largeTitle, { color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E' }]}>
            Budget Übersicht
          </Text>
        </View>

        {/* Enhanced Budget Overview */}
        <BudgetOverview vacation={vacation} expenses={expenses} />

        {/* Expenses Grid */}
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
            <View style={styles.expensesGrid}>
              {expenses.map((expense) => (
                <View key={expense.id} style={styles.gridItem}>
                  <SwipeableCard
                    onPress={() => handleExpensePress(expense.id)}
                    onDelete={() => handleExpenseDelete(expense.id)}
                  >
                    <ExpenseCard
                      expense={expense}
                      onPress={handleExpensePress}
                    />
                  </SwipeableCard>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'System',
    lineHeight: 41,
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0, // Reduced space
    paddingBottom: 120, // Space for native tab bar
  },
  expensesSection: {
    marginBottom: 16,
  },
  expensesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridItem: {
    width: '48%', // Two columns with gap
  },
  emptyExpenses: {
    marginBottom: 8,
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
  headerButton: {
    padding: 4,
  },
  headerButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});