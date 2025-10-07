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
        headerShown: false,
      }}
      tabBarPosition="bottom"
      barTintColor={isDark ? '#1C1C1E' : '#F9F9F9'}
      tintColor="#007AFF"
      unselectedTintColor="#8E8E93"
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
