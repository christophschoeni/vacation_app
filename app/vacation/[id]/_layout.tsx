import { Tabs, useLocalSearchParams, router, useSegments } from 'expo-router';
import React from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Icon, Colors, Button } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useVacations } from '@/hooks/use-vacations';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appEvents, EVENTS } from '@/lib/events';

export default function VacationDetailTabLayout() {
  const { id } = useLocalSearchParams();
  const vacationId = Array.isArray(id) ? id[0] : id;
  const segments = useSegments();
  const colorScheme = useColorScheme();
  const { vacations } = useVacations();

  const vacation = vacations.find(v => v.id === vacationId);
  const isDark = colorScheme === 'dark';
  const isEditPage = segments[segments.length - 1] === 'edit';

  if (!vacation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            style={styles.backButton}
            accessibilityLabel="Zurück"
          >
            <Icon name="arrow-left" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Ferien nicht gefunden
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
          style={styles.backButton}
          accessibilityLabel="Zurück"
        >
          <Icon name="arrow-left" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {isEditPage ? `${vacation.destination} bearbeiten` : vacation.destination}
          </Text>
          {!isEditPage && vacation.hotel && (
            <Text style={[styles.headerSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              {vacation.hotel}
            </Text>
          )}
        </View>
        <View style={styles.headerActions}>
          {isEditPage && (
            <Button
              title="Speichern"
              variant="ghost"
              size="small"
              onPress={() => {
                appEvents.emit(EVENTS.SAVE_VACATION);
              }}
              style={{ minWidth: 85 }}
            />
          )}
        </View>
      </View>

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
            paddingBottom: Platform.OS === 'ios' ? 0 : 0,
            paddingTop: Platform.OS === 'ios' ? 8 : 8,
            justifyContent: 'center',
            alignItems: 'center',
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
            title: 'Settings',
            tabBarIcon: ({ color }) => <Icon size={26} name="settings" color={color} />,
          }}
        />
        <Tabs.Screen
          name="edit"
          options={{
            href: null, // Hide from tab bar
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60, 60, 67, 0.12)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'System',
    marginTop: 2,
  },
  headerActions: {
    minWidth: 90,
    alignItems: 'flex-end',
  },
});