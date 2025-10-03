import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import React, { useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import { useTranslation } from '@/lib/i18n';

export default function MainLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === 'dark';

  // iOS-specific: Hide navigation bar for all tab screens
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // This will be executed when the component mounts
      // We need to set the navigation bar hidden for the tab bar controller
      console.log('Setting iOS navigation bar hidden for tabs');
    }
  }, []);

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
        headerStyle: { backgroundColor: 'transparent' },
        headerTransparent: true,
        headerShadowVisible: false,
        // iOS specific options
        headerLargeTitle: false,
        headerLargeTitleShadowVisible: false,
        headerBackVisible: false,
      }}
    >
      <NativeTabs.Trigger name="index">
        <Label>{t('navigation.vacations')}</Label>
        <Icon
          sf="house.fill"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Label>{t('navigation.settings')}</Label>
        <Icon
          sf="gearshape.fill"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
