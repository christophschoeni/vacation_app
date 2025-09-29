import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { useColorScheme } from 'react-native';

export default function MainLayout() {
  const colorScheme = useColorScheme();
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
    >
      <NativeTabs.Trigger name="index">
        <Label>Ferien</Label>
        <Icon
          sf="house.fill"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Label>Einstellungen</Label>
        <Icon
          sf="gearshape.fill"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
