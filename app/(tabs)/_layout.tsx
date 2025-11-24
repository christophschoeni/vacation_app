import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { useColorScheme, Platform } from 'react-native';

export default function MainLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // iOS-specific tint colors (system blue)
  const tintColor = isDark ? '#0A84FF' : '#007AFF';

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      disableTransparentOnScrollEdge
    >
      <NativeTabs.Trigger name="index">
        <Label
          labelStyle={{
            color: tintColor,
          }}
        >
          {t('navigation.vacations')}
        </Label>
        <Icon
          sf={Platform.OS === 'ios' ? 'airplane.departure' : undefined}
          tintColor={tintColor}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Label
          labelStyle={{
            color: tintColor,
          }}
        >
          {t('navigation.settings')}
        </Label>
        <Icon
          sf={Platform.OS === 'ios' ? 'gear' : undefined}
          tintColor={tintColor}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
