import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme, StyleSheet, Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { BlurView } from 'expo-blur';
import { useTranslation } from '@/lib/i18n';

export default function MainLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: 85,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: isDark ? '#8E8E93' : '#8E8E93',
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'System',
          fontWeight: '500',
        },
        tabBarBackground: () => (
          <BlurView
            intensity={100}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.vacations'),
          tabBarIcon: ({ color, focused }) => (
            Platform.OS === 'ios' ? (
              <SymbolView
                name="airplane"
                size={24}
                tintColor={color}
                type="hierarchical"
                weight={focused ? 'semibold' : 'regular'}
              />
            ) : (
              <SymbolView
                name="airplane"
                size={24}
                tintColor={color}
              />
            )
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t('navigation.settings'),
          tabBarIcon: ({ color, focused }) => (
            Platform.OS === 'ios' ? (
              <SymbolView
                name="gearshape.fill"
                size={24}
                tintColor={color}
                type="hierarchical"
                weight={focused ? 'semibold' : 'regular'}
              />
            ) : (
              <SymbolView
                name="gearshape.fill"
                size={24}
                tintColor={color}
              />
            )
          ),
        }}
      />
    </Tabs>
  );
}
