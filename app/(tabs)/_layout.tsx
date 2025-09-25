import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { Colors, Icon } from '@/components/design';
import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function MainLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary[500],
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark'
            ? Colors.dark.surface
            : Colors.light.surface,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 70 : 60,
          paddingBottom: Platform.OS === 'ios' ? 8 : 5,
          paddingTop: Platform.OS === 'ios' ? 8 : 5,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Meine Ferien',
          tabBarIcon: ({ color }) => <Icon size={26} name="airplane" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Entdecken',
          tabBarIcon: ({ color }) => <Icon size={26} name="compass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Einstellungen',
          tabBarIcon: ({ color }) => <Icon size={26} name="settings" color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
