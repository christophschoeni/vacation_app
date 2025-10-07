import { router, useSegments, useFocusEffect, Slot, Tabs } from 'expo-router';
import { useRouteParam } from '@/hooks/use-route-param';
import React, { useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/design';
import { useColorScheme } from 'react-native';
import { useVacations } from '@/hooks/use-vacations';
import { useTranslation } from '@/lib/i18n';
import { VacationProvider, useVacationContext } from '@/contexts/VacationContext';

function VacationDetailContent() {
  const vacationId = useRouteParam('id');
  const segments = useSegments();
  const { setCurrentVacationId } = useVacationContext();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const { vacations, refreshVacations } = useVacations();
  const insets = useSafeAreaInsets();

  const vacation = vacations.find(v => v.id === vacationId);
  const isEditPage = segments[segments.length - 1] === 'edit';

  // Set vacation ID in context whenever it changes
  useEffect(() => {
    if (vacationId) {
      setCurrentVacationId(vacationId);
    }
  }, [vacationId, setCurrentVacationId]);

  // Refresh vacation data when returning from edit page
  useFocusEffect(
    useCallback(() => {
      if (!isEditPage) {
        // Only refresh when we're not on the edit page
        // This ensures fresh data when returning from edit
        refreshVacations();
      }
    }, [isEditPage, refreshVacations])
  );

  // Force refresh if vacation not found
  useEffect(() => {
    if (vacationId && !vacation && !isEditPage) {
      refreshVacations();
    }
  }, [vacationId, vacation, isEditPage, refreshVacations]);

  if (!vacation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF', paddingTop: insets.top }]} edges={[]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            style={styles.backButton}
            accessibilityLabel="Zurück"
          >
            <Icon name="arrow-left" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Ferien nicht gefunden
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>
    );
  }

  // For edit page, render without tabs but still provide layout
  if (isEditPage) {
    return <Slot />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1C1C1E' : '#F9F9F9',
          borderTopColor: isDark ? '#2C2C2E' : '#E5E5EA',
          borderTopWidth: 0.5,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('vacation.tabs.budget'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="credit-card" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="report"
        options={{
          title: t('vacation.tabs.report'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="bar-chart-2" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="checklists"
        options={{
          title: t('vacation.tabs.lists'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="list-checks" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t('vacation.tabs.settings'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function VacationDetailTabLayout() {
  return (
    <VacationProvider>
      <VacationDetailContent />
    </VacationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerSpacer: {
    width: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
});
