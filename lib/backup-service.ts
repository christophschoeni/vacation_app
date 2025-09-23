import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { db, getDatabaseStats } from './db/database';
import * as schema from './db/schema';

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

      console.log('🔄 Creating backup...');

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
        appVersion: '1.0.0', // TODO: Get from app.json
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

      console.log(`✅ Backup created: ${fileName}`);
      console.log(`📊 Total records: ${backupData.metadata.totalRecords}`);

      return filePath;
    } catch (error) {
      console.error('❌ Backup creation failed:', error);
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
      console.error('Failed to share backup:', error);
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
          console.warn('Failed to clean up backup file:', error);
        }
      }, 30000); // Delete after 30 seconds
    } catch (error) {
      Alert.alert(
        'Backup-Fehler',
        'Backup konnte nicht erstellt werden. Bitte versuchen Sie es erneut.'
      );
      throw error;
    }
  }

  // Import backup from file
  async importBackup(): Promise<boolean> {
    try {
      console.log('📁 Selecting backup file...');

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return false;
      }

      const file = result.assets[0];
      console.log(`📖 Reading backup file: ${file.name}`);

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
                  console.error('Import failed:', error);
                  Alert.alert(
                    'Import-Fehler',
                    'Das Backup konnte nicht importiert werden.'
                  );
                  resolve(false);
                }
              },
            },
          ]
        );
      });
    } catch (error) {
      console.error('Failed to import backup:', error);
      Alert.alert(
        'Import-Fehler',
        'Die Backup-Datei konnte nicht gelesen werden.'
      );
      return false;
    }
  }

  // Restore data from backup
  private async restoreFromBackup(backupData: BackupData): Promise<void> {
    try {
      console.log('🔄 Restoring from backup...');

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

      console.log('✅ Backup restored successfully');
    } catch (error) {
      console.error('❌ Failed to restore backup:', error);
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
      console.warn('Failed to log backup to history:', error);
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
      console.error('Failed to get backup history:', error);
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
          console.warn(`Failed to cleanup backup ${backup.fileName}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
    }
  }
}

export const backupService = new BackupService();