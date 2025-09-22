import { Tabs, useLocalSearchParams, router } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Icon, Colors, Header } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useVacations } from '@/lib/database';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VacationDetailTabLayout() {
  const { id } = useLocalSearchParams();
  const vacationId = Array.isArray(id) ? id[0] : id;
  const colorScheme = useColorScheme();
  const { vacations } = useVacations();

  const vacation = vacations.find(v => v.id === vacationId);

  if (!vacation) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#f5f5f5' }}>
        <Header
          title="Ferien nicht gefunden"
          showBackButton
          onBackPress={() => router.push('/(tabs)')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#f5f5f5' }}>
      <Header
        title={vacation.destination}
        subtitle={vacation.hotel}
        showBackButton
        onBackPress={() => router.push('/(tabs)')}
      />

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
            height: Platform.OS === 'ios' ? 85 : 65,
            paddingBottom: Platform.OS === 'ios' ? 25 : 5,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Budget',
            tabBarIcon: ({ color }) => <Icon size={26} name="wallet" color={color} />,
          }}
        />
        <Tabs.Screen
          name="checklists"
          options={{
            title: 'Listen',
            tabBarIcon: ({ color }) => <Icon size={26} name="check" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Einstellungen',
            tabBarIcon: ({ color }) => <Icon size={26} name="settings" color={color} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}