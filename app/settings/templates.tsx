import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Icon } from '@/components/design';
import AppHeader from '@/components/ui/AppHeader';
import { useTemplates } from '@/hooks/queries';
import { Checklist } from '@/types';
import { logger } from '@/lib/utils/logger';
import { useTranslation } from '@/lib/i18n';

export default function TemplatesScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  // useTemplates() seeds the defaults itself when none exist, so the screen
  // only has to render what the query returns.
  const { data: templates = [], isLoading, error, refetch } = useTemplates();
  const [recreating, setRecreating] = useState(false);

  useEffect(() => {
    if (error) {
      logger.error('Failed to load templates:', error);
      Alert.alert(t('common.error'), t('settings.templates.error_load'));
    }
  }, [error, t]);

  const handleTemplatePress = (template: Checklist) => {
    router.push(`/template/${template.id}`);
  };

  const handleAddTemplate = () => {
    router.push('/template/new/edit');
  };

  const createDefaultTemplates = async () => {
    try {
      setRecreating(true);
      logger.info('Manually creating default templates...');

      // The query re-runs its own seeding step when it finds no templates.
      const { data, error: refetchError } = await refetch();
      if (refetchError) throw refetchError;

      logger.info(`After manual creation: ${data?.length ?? 0} templates`);
      Alert.alert(t('common.success'), t('settings.templates.created_success'));
    } catch (createError) {
      logger.error('Failed to create default templates:', createError);
      Alert.alert(t('common.error'), t('settings.templates.created_error'));
    } finally {
      setRecreating(false);
    }
  };

  const loading = isLoading || recreating;

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