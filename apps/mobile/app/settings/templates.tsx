import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { goBack } from '@/lib/utils/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, GroupedList, GroupedListFooter } from '@/components/design';
import { Spacing, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';
import AppHeader from '@/components/ui/AppHeader';
import { useTemplates } from '@/hooks/queries';
import { Checklist } from '@/types';
import { logger } from '@/lib/utils/logger';
import { useTranslation } from '@/lib/i18n';

export default function TemplatesScreen() {
  const theme = useIOSTheme();
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <AppHeader
        title={t('settings.templates.title')}
        variant="large"
        useSafeAreaPadding={true}
        showBack={true}
        onBackPress={() => goBack('/(tabs)/settings')}
        rightAction={
          <TouchableOpacity
            onPress={handleAddTemplate}
            style={styles.headerButton}
            accessibilityLabel={t('template.add.button')}
          >
            <View style={[styles.headerButtonInner, { backgroundColor: theme.groupedBackground }]}>
              <Icon name="plus" size={18} color={theme.accent} />
            </View>
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.secondaryLabel }]}>
            {t('common.loading')}
          </Text>
        </View>
      ) : templates.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="check-square" size={48} color={theme.secondaryLabel} />
          <Text style={[styles.emptyTitle, { color: theme.label }]}>
            {t('template.empty.title')}
          </Text>
          <Text style={[styles.emptyText, { color: theme.secondaryLabel }]}>
            {t('template.empty.subtitle')}
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: theme.accent }]}
            onPress={createDefaultTemplates}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              {t('template.empty.create_defaults')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GroupedList>
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                onPress={() => handleTemplatePress(template)}
                style={styles.row}
                accessibilityRole="button"
                accessibilityLabel={template.title}
              >
                <Text style={styles.templateIcon}>{template.icon}</Text>
                <View style={styles.templateText}>
                  <Text style={[styles.templateTitle, { color: theme.label }]} numberOfLines={1}>
                    {template.title}
                  </Text>
                  <Text style={[styles.templateItems, { color: theme.secondaryLabel }]}>
                    {t('template.items_count', { count: template.items.length })}
                  </Text>
                </View>
                <Icon name="chevron-right" size={16} color={theme.tertiaryLabel} />
              </TouchableOpacity>
            ))}
          </GroupedList>

          <GroupedListFooter text={t('settings.templates.description')} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    marginRight: -8,
  },
  headerButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: Spacing.lg,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
  },
  templateIcon: {
    fontSize: 24,
  },
  templateText: {
    flex: 1,
  },
  templateTitle: {
    fontSize: Typography.fontSize.callout,
  },
  templateItems: {
    fontSize: Typography.fontSize.caption1,
    marginTop: 1,
  },
});