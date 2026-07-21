import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { AppTabs, AppTabBarAppearance } from '@/components/navigation/AppTabs';

export default function MainLayout() {
  const { t } = useTranslation();

  return (
    <AppTabs>
      <NativeTabs.Trigger name="index">
        <AppTabBarAppearance />
        <Icon
          sf="airplane.departure"
          drawable="ic_airplane"
        />
        <Label>{t('navigation.vacations')}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <AppTabBarAppearance />
        <Icon
          sf="gear"
          drawable="ic_settings"
        />
        <Label>{t('navigation.settings')}</Label>
      </NativeTabs.Trigger>
    </AppTabs>
  );
}
