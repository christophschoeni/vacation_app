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
    router.push('/expense/add');
  };

  const handleExpensePress = (expenseId: string) => {
    console.log('Expense pressed:', expenseId);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amountCHF, 0);

  const renderExpenseItem = (expense: Expense) => (
    <TouchableOpacity
      key={expense.id}
      onPress={() => handleExpensePress(expense.id)}
      activeOpacity={0.7}
    >
      <View style={styles.expenseItem}>
        <View style={styles.expenseLeft}>
          <Text style={[styles.expenseDate, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
            {formatDate(expense.date)}
          </Text>
          <Text style={[styles.expenseDescription, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            {expense.description}
          </Text>
        </View>
        <Text style={[styles.expenseAmount, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          CHF {expense.amountCHF.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#f5f5f5' }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={colorScheme === 'dark'
          ? ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)']
          : ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)']
        }
        style={styles.header}
      >
        <GlassContainer intensity="light" style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.push('/(tabs)')}>
              <Text style={[styles.backButton, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                ← Zurück
              </Text>
            </TouchableOpacity>
            <GlassButton
              title="+"
              onPress={handleAddExpense}
              size="small"
              style={styles.addButton}
            />
          </View>
          <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            {vacation.destination}
          </Text>
          <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
            {vacation.hotel}
          </Text>
        </GlassContainer>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
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
          <View style={[styles.budgetRow, styles.budgetTotalRow]}>
            <Text style={[styles.budgetLabel, styles.budgetTotalLabel, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Verbleibt:
            </Text>
            <Text style={[styles.budgetAmount, styles.budgetTotalAmount, {
              color: (vacation.budget - totalExpenses) < 0 ? '#ff4444' : '#4CAF50'
            }]}>
              CHF {(vacation.budget - totalExpenses).toFixed(2)}
            </Text>
          </View>
        </GlassCard>

        {/* Expenses List */}
        <GlassCard intensity="light" style={styles.expenseCard}>
          <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            Ausgaben
          </Text>
          <View style={styles.expensesList}>
            {expenses.map(renderExpenseItem)}
          </View>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    paddingVertical: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  budgetCard: {
    marginBottom: 16,
  },
  budgetHeader: {
    marginBottom: 16,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetTotalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  budgetLabel: {
    fontSize: 14,
  },
  budgetTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  budgetAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  budgetTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expenseCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  expensesList: {
    gap: 2,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  expenseLeft: {
    flex: 1,
  },
  expenseDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  expenseDescription: {
    fontSize: 14,
    fontWeight: '500',
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
});