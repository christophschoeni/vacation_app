import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { useTranslation } from '@/lib/i18n';

export default function MainLayout() {
  const { t } = useTranslation();

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon
          sf={{ default: 'airplane.departure', selected: 'airplane' }}
          drawable="airplane_outline"
        />
        <Label>{t('navigation.vacations')}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Icon
          sf={{ default: 'gear', selected: 'gearshape.fill' }}
          drawable="settings_outline"
        />
        <Label>{t('navigation.settings')}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
