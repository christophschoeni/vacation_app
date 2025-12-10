import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { Platform } from 'react-native';

export default function MainLayout() {
  const { t } = useTranslation();

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      disableTransparentOnScrollEdge
    >
      <NativeTabs.Trigger name="index">
        <Label>
          {t('navigation.vacations')}
        </Label>
        <Icon
          sf={Platform.OS === 'ios' ? 'airplane.departure' : undefined}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Label>
          {t('navigation.settings')}
        </Label>
        <Icon
          sf={Platform.OS === 'ios' ? 'gear' : undefined}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
