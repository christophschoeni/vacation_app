import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from '@/lib/i18n';
import GlassTabBar from '@/components/navigation/GlassTabBar';

export default function MainLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.vacations'),
          tabBarIcon: { sfSymbol: 'airplane.departure' } as any,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t('navigation.settings'),
          tabBarIcon: { sfSymbol: 'gear' } as any,
        }}
      />
    </Tabs>
  );
}
