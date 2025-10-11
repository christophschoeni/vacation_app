import React, { useState, useEffect, useMemo } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

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
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const insets = useSafeAreaInsets();

  // Load sort preference from AsyncStorage
  useEffect(() => {
    const loadSortPreference = async () => {
      if (!vacationId) return;
      try {
        const saved = await AsyncStorage.getItem(`expense_sort_order_${vacationId}`);
        if (saved === 'asc' || saved === 'desc') {
          setSortOrder(saved);
        }
      } catch (error) {
        console.warn('Failed to load sort preference:', error);
      }
    };
    loadSortPreference();
  }, [vacationId]);

  useFocusEffect(
    React.useCallback(() => {
      refreshVacations();
      refreshExpenses();
    }, [refreshVacations, refreshExpenses])
  );

  const vacation = vacations.find(v => v.id === vacationId);

  // Debug logging for expense data (only in development)
  React.useEffect(() => {
    if (__DEV__) {
      console.log('=== Budget Screen Debug ===');
      console.log('Budget - vacationId:', vacationId);
      console.log('Budget - vacationId type:', typeof vacationId);
      console.log('Budget - expenses.length:', expenses.length);
      if (expenses.length > 0) {
        console.log('Budget - first expense.vacationId:', expenses[0].vacationId);
        console.log('Budget - comparison:', expenses[0].vacationId === vacationId);
      }
      console.log('=========================');
    }
  }, [expenses, vacationId]);

  // Sort expenses by date
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [expenses, sortOrder]);

  // Cache the vacation to prevent flickering during refresh
  React.useEffect(() => {
    if (vacation) {
      setCachedVacation(vacation);
      setIsInitialLoad(false);
    }
  }, [vacation]);

  // Use cached vacation if current vacation is undefined but we have a cache
  const displayVacation = vacation || cachedVacation;

  // Only show loading if we don't have any vacation data (not even cached)
  if (!displayVacation && (loading || isInitialLoad)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
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

  // If we have cached vacation but loading, show the cached data
  // This prevents the "loading" screen from showing after navigation
  if (!vacation && cachedVacation && loading) {
    // Continue rendering with cachedVacation below
  }

  if (!displayVacation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
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

  const handleExpenseEdit = (expenseId: string) => {
    router.push(`/expense/edit?expenseId=${expenseId}&vacationId=${vacationId}`);
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

  const handleSortToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newSortOrder);

    // Save preference to AsyncStorage
    if (vacationId) {
      try {
        await AsyncStorage.setItem(`expense_sort_order_${vacationId}`, newSortOrder);
      } catch (error) {
        console.warn('Failed to save sort preference:', error);
      }
    }
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
      <AppHeader
        showBack={true}
        onBackPress={() => router.push('/(tabs)')}
        rightAction={
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleSortToggle}
              activeOpacity={0.8}
            >
              <View style={[styles.headerButtonInner, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.98)' }]}>
                <Icon
                  name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'}
                  size={18}
                  color={colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E'}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push(`/expense/add?vacationId=${vacationId}`)}
              activeOpacity={0.8}
            >
              <View style={[styles.headerButtonInner, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.98)' }]}>
                <Icon name="plus" size={18} color={colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E'} />
              </View>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
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
          {sortedExpenses.length === 0 ? (
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
              {sortedExpenses.map((expense) => (
                <View key={expense.id} style={styles.gridItem}>
                  <SwipeableCard
                    onPress={() => handleExpensePress(expense.id)}
                    onEdit={() => handleExpenseEdit(expense.id)}
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
    paddingTop: 0,
    // paddingBottom is set dynamically in contentContainerStyle with safe area insets
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
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