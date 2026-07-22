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
import { router } from 'expo-router';
import { goBack } from '@/lib/utils/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import ExpenseCard from '@/components/ui/cards/ExpenseCard';
import SwipeableCard from '@/components/ui/SwipeableCard';
import { Card, Icon, GroupedList } from '@/components/design';
import { useIOSTheme } from '@/constants/ios-theme';
import BudgetOverview from '@/components/ui/budget/BudgetOverview';
import AppHeader from '@/components/ui/AppHeader';
import { useRouteParam } from '@/hooks/use-route-param';
import { useVacationId } from '@/contexts/VacationContext';
import { useVacation, useExpenses, useDeleteExpense } from '@/hooks/queries';
import { useTranslation } from '@/lib/i18n';
import { useTabBarPadding } from '@/hooks/use-tab-bar-padding';

export default function VacationBudgetScreen() {
  const tabBarPadding = useTabBarPadding();
  // Prefer the id from the vacation layout's context: inside NativeTabs,
  // useLocalSearchParams (via useRouteParam) returns the focused tab's params,
  // which go empty when switching tabs and back - leaving this screen blank.
  // The route param is the fallback for the very first mount.
  const routeId = useRouteParam('id');
  const contextId = useVacationId();
  const vacationId = contextId || routeId;
  const colorScheme = useColorScheme();
  const theme = useIOSTheme();
  const { t } = useTranslation();
  const { data: vacation, isLoading } = useVacation(vacationId);
  const { data: expenses = [], refetch: refetchExpenses } = useExpenses(vacationId || undefined);
  const { mutateAsync: deleteExpense } = useDeleteExpense();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load sort preference from AsyncStorage
  useEffect(() => {
    const loadSortPreference = async () => {
      if (!vacationId) return;
      try {
        const saved = await AsyncStorage.getItem(`expense_sort_order_${vacationId}`);
        if (saved === 'asc' || saved === 'desc') {
          setSortOrder(saved);
        }
      } catch {
        // Failed to load sort preference - use default
      }
    };
    loadSortPreference();
  }, [vacationId]);

  // Sort expenses by date
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [expenses, sortOrder]);

  // The query cache keeps the previous vacation available across refetches, so
  // the local mirror that used to prevent flickering is no longer needed.
  const displayVacation = vacation;

  if (!displayVacation && isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <AppHeader
          title={t('common.loading')}
          showBack={true}
          onBackPress={() => goBack('/(tabs)')}
        />
        <View style={styles.content}>
          <Text style={{ color: theme.label, textAlign: 'center', marginTop: 50 }}>
            {t('vacation.detail.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!displayVacation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <AppHeader
          title={t('common.error')}
          showBack={true}
          onBackPress={() => goBack('/(tabs)')}
        />
        <View style={styles.content}>
          <Text style={{ color: theme.label, textAlign: 'center', marginTop: 50 }}>
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
      } catch {
        // Failed to save sort preference - silent fail
      }
    }
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/*
        Compact header instead of a full-bleed photo: the hero image ate the top
        third of the screen, so the destination is a plain large title with the
        budget summary right below it, keeping the expenses list in view.
      */}
      <AppHeader
        title={displayVacation.destination}
        variant="large"
        showBack={true}
        onBackPress={() => goBack('/(tabs)')}
        rightAction={
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push(`/expense/add?vacationId=${vacationId}`)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('expense.add.title')}
          >
            <View style={[styles.headerButtonInner, { backgroundColor: theme.groupedBackground }]}>
              <Icon name="plus" size={18} color={theme.accent} />
            </View>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: tabBarPadding }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => refetchExpenses()}
            tintColor={colorScheme === 'dark' ? '#fff' : '#000'}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          <BudgetOverview vacation={displayVacation} expenses={expenses} />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.label }]}>
            {t('vacation.detail.recent_expenses')}
          </Text>
          {sortedExpenses.length > 0 && (
            <TouchableOpacity
              onPress={handleSortToggle}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('expense.sort.toggle')}
            >
              <Icon
                name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'}
                size={18}
                color={theme.accent}
              />
            </TouchableOpacity>
          )}
        </View>

        {sortedExpenses.length === 0 ? (
          <Card style={[styles.emptyExpenses, styles.emptyContent]}>
            <Icon name="budget" size={48} color={theme.secondaryLabel} style={styles.emptyIconStyle} />
            <Text style={[styles.emptyText, { color: theme.secondaryLabel }]}>
              {t('expense.empty.title')}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.secondaryLabel }]}>
              {t('expense.empty.subtitle')}
            </Text>
          </Card>
        ) : (
          // Each row keeps its own swipe actions, so the rows are grouped by a
          // shared container rather than rendered as separate cards.
          <GroupedList>
            {sortedExpenses.map((expense) => (
              <SwipeableCard
                key={expense.id}
                onPress={() => handleExpensePress(expense.id)}
                onEdit={() => handleExpenseEdit(expense.id)}
                onDelete={() => handleExpenseDelete(expense.id)}
              >
                <ExpenseCard expense={expense} onPress={handleExpensePress} />
              </SwipeableCard>
            ))}
          </GroupedList>
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
  // Content below the full-bleed hero header keeps the horizontal inset; the
  // hero itself is edge to edge, so the padding lives here rather than on the
  // scroll container.
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // center, not baseline: the sort control is an Icon with no text baseline,
    // so baseline alignment dropped it below the title. center puts the icon on
    // the same line as "Letzte Ausgaben".
    alignItems: 'center',
    paddingTop: 22,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  sectionAction: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
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
    paddingHorizontal: 16,
    // paddingBottom is set dynamically in contentContainerStyle with safe area insets
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