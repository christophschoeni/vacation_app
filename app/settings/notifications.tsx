import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card, Icon, IconName } from '@/components/design';
import AppHeader from '@/components/ui/AppHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/lib/utils/logger';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { useTranslation } from '@/lib/i18n';
import { notificationService } from '@/lib/services/notification-service';
import * as Notifications from 'expo-notifications';
import { Linking, Alert } from 'react-native';

interface NotificationSetting {
  id: string;
  titleKey: string;
  subtitleKey: string;
  icon: IconName;
  enabled: boolean;
}

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === 'dark';
  const [hasPermissions, setHasPermissions] = useState(false);

  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'budget_alerts',
      titleKey: 'settings.notifications.budget_alerts',
      subtitleKey: 'settings.notifications.budget_alerts_subtitle',
      icon: 'warning',
      enabled: true,
    },
    {
      id: 'expense_reminders',
      titleKey: 'settings.notifications.expense_reminders',
      subtitleKey: 'settings.notifications.expense_reminders_subtitle',
      icon: 'wallet',
      enabled: false,
    },
  ]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Check permissions
        const perms = await notificationService.hasPermissions();
        setHasPermissions(perms);

        // Load settings from notification service
        const serviceSettings = await notificationService.getSettings();

        const updatedSettings = settings.map(setting => ({
          ...setting,
          enabled: serviceSettings[setting.id as keyof typeof serviceSettings] ?? setting.enabled,
        }));

        setSettings(updatedSettings);
      } catch (error) {
        logger.error('Failed to load notification settings', error);
      }
    };

    loadSettings();
  }, []);

  const handleToggle = async (settingId: string) => {
    // If no permissions, request them first
    if (!hasPermissions) {
      const granted = await notificationService.requestPermissions();
      if (!granted) {
        Alert.alert(
          t('settings.notifications.title'),
          t('settings.notifications.note_message'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.ok'),
              onPress: () => Linking.openSettings()
            }
          ]
        );
        return;
      }
      setHasPermissions(true);
    }

    const newSettings = settings.map(setting =>
      setting.id === settingId
        ? { ...setting, enabled: !setting.enabled }
        : setting
    );

    setSettings(newSettings);

    try {
      // Update notification service
      const serviceUpdate = {
        [settingId]: newSettings.find(s => s.id === settingId)?.enabled ?? false,
      };
      await notificationService.updateSettings(serviceUpdate);

      // Send test notification when enabling a setting
      const enabledSetting = newSettings.find(s => s.id === settingId);
      if (enabledSetting?.enabled) {
        await sendTestNotification(settingId);
      }
    } catch (error) {
      logger.error('Failed to save notification settings', error);
      Alert.alert(t('common.error'), t('errors.storage'));
    }
  };

  const sendTestNotification = async (settingId: string) => {
    switch (settingId) {
      case 'budget_alerts':
        await notificationService.sendBudgetAlert('Test Reise', 80, false);
        break;
      case 'expense_reminders':
        await notificationService.sendExpenseReminder('Test Reise');
        break;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
      <AppHeader
        title={t('settings.notifications.title')}
        variant="large"
        showBack={true}
        onBackPress={() => router.push('/(tabs)/settings')}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            {t('settings.notifications.subtitle')}
          </Text>

          {settings.map((setting) => (
            <Card key={setting.id} variant="clean" style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Icon name={setting.icon} size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                      {t(setting.titleKey)}
                    </Text>
                    <Text style={[styles.settingSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                      {t(setting.subtitleKey)}
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
            {t('settings.notifications.note_title')}
          </Text>
          <Card variant="clean" style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Icon name="info" size={20} color={isDark ? '#8E8E93' : '#6D6D70'} />
              <Text style={[styles.infoText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                {t('settings.notifications.note_message')}
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