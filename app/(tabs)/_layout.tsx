import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { useColorScheme } from 'react-native';
import { useTranslation } from '@/lib/i18n';

export default function MainLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === 'dark';

  return (
    <NativeTabs
      barTintColor={isDark ? '#1C1C1E' : '#F8F9FA'}
      tintColor={isDark ? '#007AFF' : '#007AFF'}
      unselectedTintColor={isDark ? '#8E8E93' : '#8E8E93'}
      labelStyle={{
        color: isDark ? '#FFFFFF' : '#000000',
      }}
      materialStyle={isDark ? 'systemMaterialDark' : 'systemMaterialLight'}
      screenOptions={{
        headerShown: false,
      }}
    >
      <NativeTabs.Trigger name="index">
        <Label>{t('navigation.vacations')}</Label>
        <Icon sf="airplane" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Label>{t('navigation.settings')}</Label>
        <Icon sf="gearshape.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
