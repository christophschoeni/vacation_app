import { Card, Icon, IconName } from '@/components/design';
import { ThemeToggleCard } from '@/components/theme-toggle-card';
import { useTheme } from '@/contexts/theme-context';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingsItem {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  route: string;
}

const SETTINGS_ITEMS: SettingsItem[] = [
  {
    id: 'templates',
    title: 'Standard-Listen',
    subtitle: 'Checklisten-Vorlagen verwalten',
    icon: 'notepad-text',
    route: '/settings/templates',
  },
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
  {
    id: 'debug',
    title: 'Debug',
    subtitle: 'Datenbank-Info und Debugging-Tools',
    icon: 'bug',
    route: '/debug',
  },
];

export default function SettingsScreen() {
  const { isDark } = useTheme();

  const handleSettingsItemPress = (route: string) => {
    switch (route) {
      case '/settings/categories':
        router.push('/settings/categories');
        break;
      case '/settings/templates':
        router.push('/settings/templates');
        break;
      case '/settings/currency':
        router.push('/settings/currency');
        break;
      case '/settings/notifications':
        router.push('/settings/notifications');
        break;
      case '/debug':
        router.push('/debug');
        break;
      default:
        break;
    }
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
          Einstellungen
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Erscheinungsbild
          </Text>
          <ThemeToggleCard />
        </View>

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
                    <Icon name={item.icon} size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
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
                Version 0.6.0
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60, 60, 67, 0.12)',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
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