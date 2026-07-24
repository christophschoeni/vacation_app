import { NativeTabs, Icon as TabIcon, Label } from 'expo-router/unstable-native-tabs';
import { goBack } from '@/lib/utils/navigation';
import { useRouteParam } from '@/hooks/use-route-param';
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/design';
import { useVacation } from '@/hooks/queries';
import { useTranslation } from '@/lib/i18n';
import { VacationProvider, useVacationContext } from '@/contexts/VacationContext';
import { AppTabs } from '@/components/navigation/AppTabs';

function VacationDetailContent() {
  const vacationId = useRouteParam('id');
  const { setCurrentVacationId } = useVacationContext();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const { data: vacation, isLoading } = useVacation(vacationId);

  // Publish the id for the inner tab screens, and clear it when this detail
  // layout unmounts. Without the reset, closing a trip leaves the last id in the
  // context; reopening the SAME trip then sets the id to a value it already
  // holds, so the effect doesn't re-run and the screen can come up stale/empty -
  // the "reopen does nothing" bug.
  useEffect(() => {
    if (vacationId) {
      setCurrentVacationId(vacationId);
    }
    return () => setCurrentVacationId(null);
  }, [vacationId, setCurrentVacationId]);

  // The tabs mount only once the vacation exists. Render nothing while the id is
  // still resolving or the first fetch is in flight - otherwise a momentarily
  // missing id (which disables the query, so isLoading is false) would fall
  // through to the "not found" dead-end and the trip would appear to not open.
  if (!vacationId || isLoading) {
    return null;
  }

  if (!vacation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => goBack('/(tabs)')}
            style={styles.backButton}
            accessibilityLabel={t('common.back')}
          >
            <Icon name="arrow-left" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {t('vacation.detail.not_found')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AppTabs>
      <NativeTabs.Trigger name="index">
        <TabIcon
          sf="dollarsign.circle"
          drawable="ic_cash"
        />
        <Label>{t('vacation.tabs.budget')}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="report">
        <TabIcon
          sf="chart.bar"
          drawable="ic_bar_chart"
        />
        <Label>{t('vacation.tabs.report')}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="checklists">
        <TabIcon
          sf="checklist"
          drawable="ic_checklist"
        />
        <Label>{t('vacation.tabs.lists')}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <TabIcon
          sf="gear"
          drawable="ic_settings"
        />
        <Label>{t('vacation.tabs.settings')}</Label>
      </NativeTabs.Trigger>
    </AppTabs>
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
