import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { DynamicColorIOS } from 'react-native';
import { useTranslation } from '@/lib/i18n';

export default function MainLayout() {
  const { t } = useTranslation();

  return (
    <NativeTabs
      labelStyle={{
        color: DynamicColorIOS({
          dark: 'white',
          light: 'black',
        }),
      }}
      tintColor={DynamicColorIOS({
        dark: '#0A84FF',
        light: '#007AFF',
      })}
    >
      <NativeTabs.Trigger name="index">
        <Icon
          sf="airplane.departure"
          drawable="ic_airplane"
        />
        <Label>{t('navigation.vacations')}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Icon
          sf="gear"
          drawable="ic_settings"
        />
        <Label>{t('navigation.settings')}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
