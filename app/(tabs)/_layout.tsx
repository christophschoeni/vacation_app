import { NativeTabs, Icon as TabIcon, Label } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { Platform, useColorScheme } from 'react-native';
import { useTranslation } from '@/lib/i18n';

export default function MainLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <NativeTabs
      screenOptions={{
        headerShown: false, // WICHTIG: Header deaktivieren!
      }}
      tabBarPosition="bottom"
      barTintColor="transparent"
      tintColor="#007AFF"
      unselectedTintColor={isDark ? '#8E8E93' : '#8E8E93'}
      materialStyle={isDark ? 'systemMaterialDark' : 'systemMaterialLight'}
    >
      <NativeTabs.Trigger name="index">
        <Label>{t('navigation.vacations')}</Label>
        <TabIcon sf="airplane" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Label>{t('navigation.settings')}</Label>
        <TabIcon sf="gearshape.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
