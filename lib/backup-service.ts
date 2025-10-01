import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { db, getDatabaseStats } from './db/database';
import * as schema from './db/schema';
import appConfig from '../app.json';
import { ErrorHandler } from './utils/error-handler';
import { logger } from './utils/logger';

export interface BackupData {
  version: string;
  exportDate: string;
  appVersion: string;
  data: {
    vacations: any[];
    expenses: any[];
    checklists: any[];
    checklistItems: any[];
    categories: any[];
    appSettings: any[];
  };
  metadata: {
    recordCounts: {
      vacations: number;
      expenses: number;
      checklists: number;
      checklistItems: number;
      categories: number;
      appSettings: number;
    };
    totalRecords: number;
  };
}

export interface BackupOptions {
  includeTemplates?: boolean;
  includeSettings?: boolean;
  format?: 'json' | 'sql';
  compression?: boolean;
}

class BackupService {
  private readonly BACKUP_VERSION = '1.0.0';

  // Export all data as JSON backup
  async createBackup(options: BackupOptions = {}): Promise<string> {
    try {
      const {
        includeTemplates = true,
        includeSettings = true,
        format = 'json',
      } = options;

      logger.debug('Creating backup...');

      // Fetch all data from database
      const [
        vacations,
        expenses,
        checklists,
        checklistItems,
        categories,
        appSettings,
      ] = await Promise.all([
        db.select().from(schema.vacations),
        db.select().from(schema.expenses),
        db.select().from(schema.checklists),
        db.select().from(schema.checklistItems),
        db.select().from(schema.categories),
        includeSettings ? db.select().from(schema.appSettings) : [],
      ]);

      // Filter out templates if not included
      const filteredChecklists = includeTemplates
        ? checklists
        : checklists.filter(c => !c.isTemplate);

      const filteredChecklistItems = checklistItems.filter(item =>
        filteredChecklists.some(c => c.id === item.checklistId)
      );

      const backupData: BackupData = {
        version: this.BACKUP_VERSION,
        exportDate: new Date().toISOString(),
        appVersion: appConfig.expo.version,
        data: {
          vacations,
          expenses,
          checklists: filteredChecklists,
          checklistItems: filteredChecklistItems,
          categories,
          appSettings: includeSettings ? appSettings : [],
        },
        metadata: {
          recordCounts: {
            vacations: vacations.length,
            expenses: expenses.length,
            checklists: filteredChecklists.length,
            checklistItems: filteredChecklistItems.length,
            categories: categories.length,
            appSettings: appSettings.length,
          },
          totalRecords: vacations.length + expenses.length +
                       filteredChecklists.length + filteredChecklistItems.length +
                       categories.length + appSettings.length,
        },
      };

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `vacation-assist-backup-${timestamp}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      // Write backup file
      await FileSystem.writeAsStringAsync(
        filePath,
        JSON.stringify(backupData, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 }
      );

      // Log backup to history
      await this.logBackup(fileName, backupData);

      logger.info(`Backup created: ${fileName}`);
      logger.info(`Total records: ${backupData.metadata.totalRecords}`);

      return filePath;
    } catch (error) {
      await ErrorHandler.handleStorageError(error, 'backup creation', true);
      throw error;
    }
  }

  // Share backup file
  async shareBackup(filePath: string): Promise<void> {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Vacation Assist Backup teilen',
        });
      } else {
        Alert.alert(
          'Teilen nicht verfügbar',
          'Backup wurde erstellt, aber Teilen wird auf diesem Gerät nicht unterstützt.'
        );
      }
    } catch (error) {
      await ErrorHandler.handleAsyncError(error, {
        showAlert: true,
        userMessage: 'Backup konnte nicht geteilt werden.',
        context: 'Share backup'
      });
      throw error;
    }
  }

  // Create and immediately share backup
  async exportAndShare(options: BackupOptions = {}): Promise<void> {
    try {
      const filePath = await this.createBackup(options);
      await this.shareBackup(filePath);

      // Clean up local file after sharing
      setTimeout(async () => {
        try {
          await FileSystem.deleteAsync(filePath, { idempotent: true });
        } catch (error) {
          await ErrorHandler.handleStorageError(error, 'backup cleanup', false);
        }
      }, 30000); // Delete after 30 seconds
    } catch (error) {
      await ErrorHandler.handleStorageError(error, 'export and share', true);
      throw error;
    }
  }

  // Import backup from file
  async importBackup(): Promise<boolean> {
    try {
      logger.debug('Selecting backup file...');

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return false;
      }

      const file = result.assets[0];
      logger.debug(`Reading backup file: ${file.name}`);

      const content = await FileSystem.readAsStringAsync(file.uri);
      const backupData: BackupData = JSON.parse(content);

      // Validate backup format
      if (!this.validateBackupData(backupData)) {
        Alert.alert(
          'Ungültiges Backup',
          'Die ausgewählte Datei ist kein gültiges Vacation Assist Backup.'
        );
        return false;
      }

      // Confirm import (this will overwrite existing data)
      return new Promise((resolve) => {
        Alert.alert(
          'Backup importieren',
          `Möchten Sie dieses Backup wirklich importieren?\n\n` +
          `📅 Erstellt: ${new Date(backupData.exportDate).toLocaleString()}\n` +
          `📊 Datensätze: ${backupData.metadata.totalRecords}\n\n` +
          `⚠️ ACHTUNG: Ihre aktuellen Daten werden überschrieben!`,
          [
            { text: 'Abbrechen', style: 'cancel', onPress: () => resolve(false) },
            {
              text: 'Importieren',
              style: 'destructive',
              onPress: async () => {
                try {
                  await this.restoreFromBackup(backupData);
                  Alert.alert(
                    'Import erfolgreich',
                    `${backupData.metadata.totalRecords} Datensätze wurden wiederhergestellt.`
                  );
                  resolve(true);
                } catch (error) {
                  await ErrorHandler.handleStorageError(error, 'backup import', true);
                  resolve(false);
                }
              },
            },
          ]
        );
      });
    } catch (error) {
      await ErrorHandler.handleStorageError(error, 'backup file reading', true);
      return false;
    }
  }

  // Restore data from backup
  private async restoreFromBackup(backupData: BackupData): Promise<void> {
    try {
      logger.debug('Restoring from backup...');

      // Clear existing data (in reverse order of dependencies)
      await db.delete(schema.checklistItems);
      await db.delete(schema.checklists);
      await db.delete(schema.expenses);
      await db.delete(schema.vacations);
      await db.delete(schema.categories);
      await db.delete(schema.appSettings);

      // Restore data (in order of dependencies)
      if (backupData.data.appSettings.length > 0) {
        await db.insert(schema.appSettings).values(backupData.data.appSettings);
      }

      if (backupData.data.categories.length > 0) {
        await db.insert(schema.categories).values(backupData.data.categories);
      }

      if (backupData.data.vacations.length > 0) {
        await db.insert(schema.vacations).values(backupData.data.vacations);
      }

      if (backupData.data.expenses.length > 0) {
        await db.insert(schema.expenses).values(backupData.data.expenses);
      }

      if (backupData.data.checklists.length > 0) {
        await db.insert(schema.checklists).values(backupData.data.checklists);
      }

      if (backupData.data.checklistItems.length > 0) {
        await db.insert(schema.checklistItems).values(backupData.data.checklistItems);
      }

      logger.info('Backup restored successfully');
    } catch (error) {
      await ErrorHandler.handleDatabaseError(error, 'backup restore', false);
      throw error;
    }
  }

  // Validate backup data structure
  private validateBackupData(data: any): data is BackupData {
    return (
      data &&
      typeof data.version === 'string' &&
      typeof data.exportDate === 'string' &&
      data.data &&
      Array.isArray(data.data.vacations) &&
      Array.isArray(data.data.expenses) &&
      Array.isArray(data.data.checklists) &&
      Array.isArray(data.data.checklistItems) &&
      data.metadata &&
      typeof data.metadata.totalRecords === 'number'
    );
  }

  // Log backup to history
  private async logBackup(fileName: string, backupData: BackupData): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(
        `${FileSystem.documentDirectory}${fileName}`
      );

      await db.insert(schema.backupHistory).values({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        fileName,
        fileSize: fileInfo.size || 0,
        recordCount: backupData.metadata.totalRecords,
        backupType: 'manual',
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      await ErrorHandler.handleDatabaseError(error, 'backup history logging', false);
    }
  }

  // Get backup history
  async getBackupHistory(): Promise<any[]> {
    try {
      return await db
        .select()
        .from(schema.backupHistory)
        .orderBy(schema.backupHistory.createdAt);
    } catch (error) {
      await ErrorHandler.handleDatabaseError(error, 'get backup history', false);
      return [];
    }
  }

  // Clean up old backup files
  async cleanupOldBackups(keepDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - keepDays);

      const oldBackups = await db
        .select()
        .from(schema.backupHistory)
        .where(schema.backupHistory.createdAt < cutoffDate.toISOString());

      for (const backup of oldBackups) {
        try {
          const filePath = `${FileSystem.documentDirectory}${backup.fileName}`;
          await FileSystem.deleteAsync(filePath, { idempotent: true });
          await db.delete(schema.backupHistory).where(
            schema.backupHistory.id === backup.id
          );
        } catch (error) {
          await ErrorHandler.handleStorageError(error, `cleanup backup ${backup.fileName}`, false);
        }
      }
    } catch (error) {
      await ErrorHandler.handleStorageError(error, 'cleanup old backups', false);
    }
  }
}

export const backupService = new BackupService();