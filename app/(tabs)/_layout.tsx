import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme, Platform, StyleSheet } from 'react-native';
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
        },
        tabBarActiveTintColor: isDark ? '#007AFF' : '#007AFF',
        tabBarInactiveTintColor: isDark ? '#8E8E93' : '#8E8E93',
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'System',
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
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
                name="house.fill"
                size={24}
                tintColor={color}
                type="hierarchical"
              />
            ) : (
              <SymbolView
                name="house.fill"
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
