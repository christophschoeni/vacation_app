import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Icon } from '@/components/design';
import AppHeader from '@/components/ui/AppHeader';
import { checklistRepository } from '@/lib/db/repositories/checklist-repository';
import { ensureDefaultTemplates } from '@/lib/seed-templates';
import { Checklist } from '@/types';
import { logger } from '@/lib/utils/logger';
import { useTranslation } from '@/lib/i18n';

export default function TemplatesScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      let templateList = await checklistRepository.findTemplates();
      logger.debug(`Found ${templateList.length} templates`);

      // Smart auto-creation: If no templates found, try to create defaults
      if (templateList.length === 0) {
        logger.info('No templates found, attempting to create defaults...');
        try {
          await ensureDefaultTemplates();
          templateList = await checklistRepository.findTemplates();
          logger.info(`After auto-creation: ${templateList.length} templates`);
        } catch (createError) {
          logger.error('Failed to auto-create templates:', createError);
          // Continue with empty list, fallback button will be available
        }
      }

      setTemplates(templateList);
    } catch (error) {
      logger.error('Failed to load templates:', error);
      Alert.alert(t('common.error'), t('settings.templates.error_load'));
    } finally {
      setLoading(false);
    }
  // `t` from useTranslation is re-bound on every render; including it would recreate this
  // callback each render and make the calling effect loop forever. Translations are only
  // read at call time, so omitting it is safe.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useFocusEffect(
    React.useCallback(() => {
      loadTemplates();
    }, [loadTemplates])
  );

  const handleTemplatePress = (template: Checklist) => {
    router.push(`/template/${template.id}`);
  };

  const handleAddTemplate = () => {
    router.push('/template/new/edit');
  };

  const createDefaultTemplates = async () => {
    try {
      setLoading(true);
      logger.info('Manually creating default templates...');

      await ensureDefaultTemplates();

      Alert.alert(t('common.success'), t('settings.templates.created_success'));
      await loadTemplates();

    } catch (error) {
      logger.error('Failed to create default templates:', error);
      Alert.alert(t('common.error'), t('settings.templates.created_error'));
    } finally {
      setLoading(false);
    }
  };

  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['bottom']}>
      <AppHeader
        title={t('settings.templates.title')}
        variant="large"
        useSafeAreaPadding={true}
        showBack={true}
        onBackPress={() => router.push('/(tabs)/settings')}
        rightAction={
          <TouchableOpacity
            onPress={handleAddTemplate}
            style={styles.headerButton}
            accessibilityLabel={t('template.add.button')}
          >
            <Icon name="plus" size={20} color={isDark ? '#FFFFFF' : '#007AFF'} />
          </TouchableOpacity>
        }
      />


      {loading ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            {t('common.loading')}
          </Text>
        </View>
      ) : templates.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="check-square" size={48} color={isDark ? '#8E8E93' : '#6D6D70'} />
          <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {t('template.empty.title')}
          </Text>
          <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            {t('template.empty.subtitle')}
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: '#007AFF' }]}
            onPress={createDefaultTemplates}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              {t('template.empty.create_defaults')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={[styles.pageTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {t('settings.templates.title')}
          </Text>

          <View style={styles.descriptionContainer}>
            <Text style={[styles.descriptionText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              {t('settings.templates.description')}
            </Text>
          </View>

          {templates.map((template, index) => (
            <View key={template.id} style={styles.templateItem}>
              <Card variant="clean" style={styles.templateCard}>
                <TouchableOpacity
                  onPress={() => handleTemplatePress(template)}
                  style={styles.templateContent}
                >
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateIcon}>{template.icon}</Text>
                    <View style={styles.templateText}>
                      <Text style={[styles.templateTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        {template.title}
                      </Text>
                      {template.description && (
                        <Text style={[styles.templateDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                          {template.description}
                        </Text>
                      )}
                      <Text style={[styles.templateItems, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                        {template.items.length} Einträge
                      </Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={16} color={isDark ? '#8E8E93' : '#6D6D70'} />
                </TouchableOpacity>
              </Card>
            </View>
          ))}
        </View>
      )}
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  headerButton: {
    padding: 8,
    marginRight: -8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 16,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'System',
    lineHeight: 20,
    textAlign: 'left',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  templateItem: {
    marginBottom: 8,
  },
  templateCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  templateContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dragHandle: {
    paddingRight: 12,
    paddingVertical: 4,
  },
  templateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  templateIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  templateText: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  templateDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  templateItems: {
    fontSize: 12,
    fontWeight: '500',
  },
});