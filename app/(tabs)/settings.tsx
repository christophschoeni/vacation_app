import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card, Icon } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SettingsItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
}

const SETTINGS_ITEMS: SettingsItem[] = [
  {
    id: 'categories',
    title: 'Kategorien',
    subtitle: 'Ausgaben-Kategorien verwalten',
    icon: 'settings',
    route: '/settings/categories',
  },
  {
    id: 'currency',
    title: 'Währung',
    subtitle: 'Standard-Währung festlegen',
    icon: 'currency',
    route: '/settings/currency',
  },
  {
    id: 'notifications',
    title: 'Benachrichtigungen',
    subtitle: 'Push-Benachrichtigungen verwalten',
    icon: 'warning',
    route: '/settings/notifications',
  },
];

export default function SettingsScreen() {
  const colorScheme = useColorScheme();

  const handleSettingsItemPress = (route: string) => {
    switch (route) {
      case '/settings/categories':
        router.push('/settings/categories');
        break;
      case '/settings/currency':
        router.push('/settings/currency');
        break;
      case '/settings/notifications':
        router.push('/settings/notifications');
        break;
      default:
        break;
    }
  };

  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Allgemein
          </Text>

          {SETTINGS_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleSettingsItemPress(item.route)}
              activeOpacity={0.7}
            >
              <Card variant="clean" style={styles.settingsCard}>
                <View style={styles.settingsRow}>
                  <View style={styles.settingsInfo}>
                    <Icon name={item.icon as any} size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                    <View style={styles.settingsText}>
                      <Text style={[styles.settingsTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.settingsSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={16} color={isDark ? '#8E8E93' : '#6D6D70'} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Über die App
          </Text>

          <Card variant="clean" style={styles.settingsCard}>
            <View style={styles.appInfo}>
              <Text style={[styles.appName, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                Vacation Assistant
              </Text>
              <Text style={[styles.appVersion, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                Version 1.0.0
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    fontFamily: 'System',
  },
  settingsCard: {
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  settingsText: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'System',
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'System',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'System',
  },
});