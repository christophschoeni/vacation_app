import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/lib/utils/logger';

const STORAGE_KEY = '@vacation_assist_notification_settings';
const PERMISSION_KEY = '@vacation_assist_notification_permission';

export interface NotificationSettings {
  budget_alerts: boolean;
  expense_reminders: boolean;
  trip_updates: boolean;
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private settings: NotificationSettings = {
    budget_alerts: true,
    expense_reminders: false,
    trip_updates: true,
  };

  private permissionGranted = false;

  async initialize() {
    try {
      // Load saved settings
      const savedSettings = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        this.settings = JSON.parse(savedSettings);
      }

      // Check if permission was previously granted
      const permissionStatus = await AsyncStorage.getItem(PERMISSION_KEY);
      this.permissionGranted = permissionStatus === 'granted';

      // Request permissions if not already asked
      if (!permissionStatus) {
        await this.requestPermissions();
      }

      logger.info('Notification service initialized', { settings: this.settings });
    } catch (error) {
      logger.error('Failed to initialize notification service', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.permissionGranted = finalStatus === 'granted';
      await AsyncStorage.setItem(PERMISSION_KEY, finalStatus);

      if (!this.permissionGranted) {
        logger.warn('Notification permissions not granted');
      }

      return this.permissionGranted;
    } catch (error) {
      logger.error('Failed to request notification permissions', error);
      return false;
    }
  }

  async getSettings(): Promise<NotificationSettings> {
    return this.settings;
  }

  async updateSettings(newSettings: Partial<NotificationSettings>) {
    try {
      this.settings = { ...this.settings, ...newSettings };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      logger.info('Notification settings updated', { settings: this.settings });
    } catch (error) {
      logger.error('Failed to update notification settings', error);
      throw error;
    }
  }

  async scheduleNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string | null> {
    if (!this.permissionGranted) {
      logger.warn('Cannot schedule notification: permissions not granted');
      return null;
    }

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: trigger || null, // null = immediate
      });

      logger.info('Notification scheduled', { id, title });
      return id;
    } catch (error) {
      logger.error('Failed to schedule notification', error);
      return null;
    }
  }

  async sendBudgetAlert(vacationName: string, percentageUsed: number, overBudget: boolean) {
    if (!this.settings.budget_alerts) {
      return;
    }

    const title = overBudget ? '⚠️ Budget überschritten' : '⚠️ Budget-Warnung';
    const body = overBudget
      ? `Sie haben das Budget für "${vacationName}" überschritten!`
      : `Sie haben ${percentageUsed}% des Budgets für "${vacationName}" verbraucht.`;

    return this.scheduleNotification(title, body, {
      type: 'budget_alert',
      vacationName,
      percentageUsed,
      overBudget,
    });
  }

  async sendExpenseReminder(vacationName: string) {
    if (!this.settings.expense_reminders) {
      return;
    }

    const title = '📝 Ausgaben erfassen';
    const body = `Vergessen Sie nicht, Ihre Ausgaben für "${vacationName}" zu erfassen.`;

    return this.scheduleNotification(title, body, {
      type: 'expense_reminder',
      vacationName,
    });
  }

  async sendTripUpdate(title: string, message: string, vacationId?: string) {
    if (!this.settings.trip_updates) {
      return;
    }

    return this.scheduleNotification(`✈️ ${title}`, message, {
      type: 'trip_update',
      vacationId,
    });
  }

  async scheduleDailyExpenseReminder(vacationName: string, vacationId: string, hour = 20) {
    if (!this.settings.expense_reminders) {
      return;
    }

    try {
      // Schedule daily reminder at specified hour
      const trigger: Notifications.NotificationTriggerInput = {
        hour,
        minute: 0,
        repeats: true,
      };

      const id = await this.scheduleNotification(
        '📝 Ausgaben erfassen',
        `Vergessen Sie nicht, Ihre Ausgaben für "${vacationName}" zu erfassen.`,
        {
          type: 'daily_expense_reminder',
          vacationName,
          vacationId,
        },
        trigger
      );

      logger.info('Daily expense reminder scheduled', { vacationId, hour });
      return id;
    } catch (error) {
      logger.error('Failed to schedule daily expense reminder', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      logger.info('Notification canceled', { notificationId });
    } catch (error) {
      logger.error('Failed to cancel notification', error);
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      logger.info('All notifications canceled');
    } catch (error) {
      logger.error('Failed to cancel all notifications', error);
    }
  }

  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      logger.error('Failed to get scheduled notifications', error);
      return [];
    }
  }

  async hasPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      logger.error('Failed to check notification permissions', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
