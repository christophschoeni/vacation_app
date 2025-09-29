import { router, useSegments, useFocusEffect, Slot } from 'expo-router';
import { NativeTabs, Icon as TabIcon, Label } from 'expo-router/unstable-native-tabs';
import { useRouteParam } from '@/hooks/use-route-param';
import React, { useCallback, useState, useEffect } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { Icon } from '@/components/design';
import { useColorScheme } from 'react-native';
import { useVacations } from '@/hooks/use-vacations';

export default function VacationDetailTabLayout() {
  const extractedVacationId = useRouteParam('id');

  // TEMPORARY FIX: Use the actual vacation ID if none is extracted
  const vacationId = extractedVacationId || '17590895805177pt0zpcf5';

  const segments = useSegments();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { vacations, refreshVacations } = useVacations();

  const vacation = vacations.find(v => v.id === vacationId);
  const isEditPage = segments[segments.length - 1] === 'edit';
  const currentTab = segments[segments.length - 1];

  const getHeaderTitle = () => {
    if (isEditPage) {
      return `${vacation?.destination} bearbeiten`;
    }

    switch (currentTab) {
      case 'index':
        return 'Budget Übersicht';
      case 'checklists':
        return 'Listen';
      case 'settings':
        return 'Einstellungen';
      default:
        return vacation?.destination || 'Ferien';
    }
  };

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

  if (!vacation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top']}>
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

  const tabItems = [
    {
      name: 'index',
      label: 'Budget',
      icon: 'budget',
      route: `/vacation/${vacationId}`
    },
    {
      name: 'checklists',
      label: 'Listen',
      icon: 'checklist',
      route: `/vacation/${vacationId}/checklists`
    },
    {
      name: 'settings',
      label: 'Settings',
      icon: 'settings',
      route: `/vacation/${vacationId}/settings`
    }
  ];

  const getActionButton = () => {
    if (currentTab === 'index') {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push(`/expense/add?vacationId=${vacationId}`);
          }}
        >
          <Icon name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.actionText}>Ausgabe</Text>
        </TouchableOpacity>
      );
    }
    if (currentTab === 'checklists') {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push(`/checklist/add?vacationId=${vacationId}`);
          }}
        >
          <Icon name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.actionText}>Liste</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  // For edit page, render without tabs but still provide layout
  if (isEditPage) {
    return <Slot />;
  }

  return (
    <NativeTabs
      tabBarPosition="leading"
      barTintColor={isDark ? '#1C1C1E' : '#F8F9FA'}
      tintColor={isDark ? '#007AFF' : '#007AFF'}
      unselectedTintColor={isDark ? '#8E8E93' : '#8E8E93'}
      labelStyle={{
        color: isDark ? '#FFFFFF' : '#000000',
      }}
      materialStyle={isDark ? 'systemMaterialDark' : 'systemMaterialLight'}
    >
      <NativeTabs.Trigger name="index">
        <Label>Budget</Label>
        <TabIcon
          sf="creditcard.fill"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="checklists">
        <Label>Listen</Label>
        <TabIcon
          sf="checklist"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Label>Settings</Label>
        <TabIcon
          sf="gearshape.fill"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
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