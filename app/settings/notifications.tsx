import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
 Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Icon, IconName, GroupedList, GroupedListFooter } from '@/components/design';
import { Spacing, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';
import AppHeader from '@/components/ui/AppHeader';
import { logger } from '@/lib/utils/logger';
import { useTranslation, type TranslationKey } from '@/lib/i18n';
import { notificationService } from '@/lib/services/notification-service';

interface NotificationSetting {
  id: string;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  icon: IconName;
  enabled: boolean;
}

export default function NotificationsScreen() {
  const theme = useIOSTheme();
  const { t } = useTranslation();
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

        // Functional update so the effect does not depend on `settings`
        // (depending on it would re-run the effect on every setSettings -> infinite loop).
        setSettings(current =>
          current.map(setting => ({
            ...setting,
            enabled: serviceSettings[setting.id as keyof typeof serviceSettings] ?? setting.enabled,
          }))
        );
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <AppHeader
        title={t('settings.notifications.title')}
        variant="large"
        showBack={true}
        onBackPress={() => router.push('/(tabs)/settings')}
        useSafeAreaPadding={true}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GroupedList>
          {settings.map((setting) => (
            <View key={setting.id} style={styles.row}>
              <Icon name={setting.icon} size={22} color={theme.accent} />
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: theme.label }]}>
                  {t(setting.titleKey)}
                </Text>
                <Text style={[styles.rowSubtitle, { color: theme.secondaryLabel }]}>
                  {t(setting.subtitleKey)}
                </Text>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => handleToggle(setting.id)}
                trackColor={{ false: theme.isDark ? '#3A3A3C' : '#E5E5EA', true: theme.success }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={theme.isDark ? '#3A3A3C' : '#E5E5EA'}
              />
            </View>
          ))}
        </GroupedList>

        <GroupedListFooter text={t('settings.notifications.note_message')} />
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
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: Typography.fontSize.callout,
  },
  rowSubtitle: {
    fontSize: Typography.fontSize.caption1,
    marginTop: 1,
  },
});