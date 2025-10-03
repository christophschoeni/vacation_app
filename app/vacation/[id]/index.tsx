import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import ExpenseCard from '@/components/ui/cards/ExpenseCard';
import SwipeableCard from '@/components/ui/SwipeableCard';
import { Card, Icon } from '@/components/design';
import BudgetOverview from '@/components/ui/budget/BudgetOverview';
import AppHeader from '@/components/ui/AppHeader';
import { useRouteParam } from '@/hooks/use-route-param';
import { useVacations } from '@/hooks/use-vacations';
import { useExpenses } from '@/lib/database';
import { useTranslation } from '@/lib/i18n';
import { Vacation } from '@/types';

export default function VacationBudgetScreen() {
  const vacationId = useRouteParam('id');
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { vacations, loading, refreshVacations } = useVacations();
  const { expenses, refresh: refreshExpenses, deleteExpense } = useExpenses(vacationId || '');
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const [cachedVacation, setCachedVacation] = React.useState<Vacation | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      refreshVacations();
      refreshExpenses();
    }, [refreshVacations, refreshExpenses])
  );

  const vacation = vacations.find(v => v.id === vacationId);

  // Cache the vacation to prevent flickering during refresh
  React.useEffect(() => {
    if (vacation) {
      setCachedVacation(vacation);
      setIsInitialLoad(false);
    }
  }, [vacation]);

  // Use cached vacation if current vacation is undefined but we have a cache
  const displayVacation = vacation || cachedVacation;

  if (!displayVacation && (loading || isInitialLoad)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }]} edges={['top']}>
        <AppHeader
          title={t('common.loading')}
          showBack={true}
          onBackPress={() => router.push('/(tabs)')}
        />
        <View style={styles.content}>
          <Text style={{ color: colorScheme === 'dark' ? '#FFFFFF' : '#000000', textAlign: 'center', marginTop: 50 }}>
            {t('vacation.detail.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!displayVacation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }]} edges={['top']}>
        <AppHeader
          title={t('common.error')}
          showBack={true}
          onBackPress={() => router.push('/(tabs)')}
        />
        <View style={styles.content}>
          <Text style={{ color: colorScheme === 'dark' ? '#FFFFFF' : '#000000', textAlign: 'center', marginTop: 50 }}>
            {t('vacation.detail.not_found')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  const handleExpensePress = (expenseId: string) => {
    // Handle expense press (future: navigate to expense detail)
  };

  const handleExpenseDelete = (expenseId: string) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;

    Alert.alert(
      t('expense.delete.title'),
      t('expense.delete.message', { description: expense.description }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(expenseId);
            } catch {
              Alert.alert(t('common.error'), t('expense.delete.error'));
            }
          },
        },
      ]
    );
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }]} edges={['top']}>
      <AppHeader
        showBack={true}
        onBackPress={() => router.push('/(tabs)')}
        rightAction={
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push(`/expense/add?vacationId=${vacationId}`)}
            activeOpacity={0.8}
          >
            <View style={[styles.headerButtonInner, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.98)' }]}>
              <Icon name="plus" size={18} color={colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E'} />
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
            {t('budget.overview.title')}
          </Text>
        </View>

        {/* Enhanced Budget Overview */}
        <BudgetOverview vacation={displayVacation} expenses={expenses} />

        {/* Expenses Grid */}
        <View style={[styles.expensesSection, { paddingHorizontal: 16 }]}>
          {expenses.length === 0 ? (
            <Card style={[styles.emptyExpenses, styles.emptyContent]}>
              <Icon name="budget" size={48} color={colorScheme === 'dark' ? '#8E8E93' : '#6D6D70'} style={styles.emptyIconStyle} />
              <Text style={[styles.emptyText, { color: colorScheme === 'dark' ? '#8E8E93' : '#6D6D70' }]}>
                {t('expense.empty.title')}
              </Text>
              <Text style={[styles.emptySubtext, { color: colorScheme === 'dark' ? '#8E8E93' : '#6D6D70' }]}>
                {t('expense.empty.subtitle')}
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
    </SafeAreaView>
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
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'System',
    lineHeight: 34,
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
    flexDirection: 'column',
    gap: 0,
  },
  gridItem: {
    width: '100%', // Full width
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