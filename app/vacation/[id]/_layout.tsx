import { router, useSegments, useFocusEffect, Slot } from 'expo-router';
import { NativeTabs, Icon as NativeIcon, Label } from 'expo-router/unstable-native-tabs';
import { useRouteParam } from '@/hooks/use-route-param';
import React, { useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
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

  // Set vacation ID in context whenever it changes
  useEffect(() => {
    if (vacationId) {
      setCurrentVacationId(vacationId);
    }
  }, [vacationId, setCurrentVacationId]);

  // Refresh vacation data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshVacations();
    }, [refreshVacations])
  );

  // Force refresh if vacation not found
  useEffect(() => {
    if (vacationId && !vacation) {
      refreshVacations();
    }
  }, [vacationId, vacation, refreshVacations]);

  if (!vacation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
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

  // iOS-specific tint colors (system blue)
  const tintColor = isDark ? '#0A84FF' : '#007AFF';

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      disableTransparentOnScrollEdge
      navigationTitle={vacation.destination}
      backBehavior="pop"
    >
      <NativeTabs.Trigger name="budget">
        <Label
          labelStyle={{
            color: tintColor,
          }}
        >
          {t('vacation.tabs.budget')}
        </Label>
        <NativeIcon
          sf={Platform.OS === 'ios' ? 'dollarsign.circle' : undefined}
          tintColor={tintColor}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="report">
        <Label
          labelStyle={{
            color: tintColor,
          }}
        >
          {t('vacation.tabs.report')}
        </Label>
        <NativeIcon
          sf={Platform.OS === 'ios' ? 'chart.bar' : undefined}
          tintColor={tintColor}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="checklists">
        <Label
          labelStyle={{
            color: tintColor,
          }}
        >
          {t('vacation.tabs.lists')}
        </Label>
        <NativeIcon
          sf={Platform.OS === 'ios' ? 'checklist' : undefined}
          tintColor={tintColor}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Label
          labelStyle={{
            color: tintColor,
          }}
        >
          {t('vacation.tabs.settings')}
        </Label>
        <NativeIcon
          sf={Platform.OS === 'ios' ? 'gear' : undefined}
          tintColor={tintColor}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
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
