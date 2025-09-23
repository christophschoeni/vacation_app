import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card, Icon } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface NotificationSetting {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  enabled: boolean;
}

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'budget_alerts',
      title: 'Budget-Warnungen',
      subtitle: 'Benachrichtigung bei Budgetüberschreitung',
      icon: 'warning',
      enabled: true,
    },
    {
      id: 'expense_reminders',
      title: 'Ausgaben-Erinnerungen',
      subtitle: 'Erinnerung für nicht erfasste Ausgaben',
      icon: 'budget',
      enabled: false,
    },
    {
      id: 'trip_updates',
      title: 'Reise-Updates',
      subtitle: 'Wichtige Updates zu Ihren Reisen',
      icon: 'airplane',
      enabled: true,
    },
  ]);

  const handleToggle = (settingId: string) => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === settingId
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
    // TODO: Save to settings/database
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>

          {settings.map((setting) => (
            <Card key={setting.id} variant="clean" style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Icon name={setting.icon as any} size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                      {setting.title}
                    </Text>
                    <Text style={[styles.settingSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                      {setting.subtitle}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={setting.enabled}
                  onValueChange={() => handleToggle(setting.id)}
                  trackColor={{
                    false: isDark ? '#3A3A3C' : '#E5E5EA',
                    true: '#007AFF',
                  }}
                  thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
                  ios_backgroundColor={isDark ? '#3A3A3C' : '#E5E5EA'}
                />
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Hinweis
          </Text>
          <Card variant="clean" style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Icon name="info" size={20} color={isDark ? '#8E8E93' : '#6D6D70'} />
              <Text style={[styles.infoText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                Benachrichtigungen müssen in den Systemeinstellungen Ihres Geräts aktiviert sein.
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
    paddingTop: 0,
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
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 16,
    fontFamily: 'System',
  },
  settingCard: {
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'System',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'System',
  },
  infoCard: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'System',
    lineHeight: 20,
    flex: 1,
  },
});