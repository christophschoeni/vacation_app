import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { goBack } from '@/lib/utils/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, GroupedList, GroupedListHeader, StatusBadge } from '@/components/design';
import { BorderRadius, Spacing, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';
import AppHeader from '@/components/ui/AppHeader';
import { useRouteId } from '@/hooks/use-route-param';
import { useChecklist, useDeleteTemplate, useDuplicateTemplate } from '@/hooks/queries';
import { CATEGORY_CONFIG } from '@/lib/constants/categories';
import { useTranslation } from '@/lib/i18n';

export default function TemplateDetailScreen() {
  const templateId = useRouteId();
  const theme = useIOSTheme();
  const { t } = useTranslation();

  const { data: template, isLoading, isRefetching, error, refetch } = useChecklist(templateId);
  const { mutateAsync: deleteTemplate } = useDeleteTemplate();
  const { mutateAsync: duplicateTemplate } = useDuplicateTemplate();

  React.useEffect(() => {
    if (error) {
      console.error('Failed to load template:', error);
      Alert.alert(t('common.error'), t('template.detail.load_error'));
    }
  }, [error, t]);

  const handleEdit = () => {
    router.push(`/template/${templateId}/edit`);
  };

  const handleDelete = async () => {
    if (!template) return;

    Alert.alert(
      t('template.delete.title'),
      t('template.delete.message', { title: template.title }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTemplate(template.id);
              goBack('/settings/templates');
            } catch {
              Alert.alert(t('common.error'), t('template.delete.error'));
            }
          },
        },
      ]
    );
  };

  const handleDuplicate = async () => {
    if (!template) return;
    try {
      await duplicateTemplate(template.id);
      Alert.alert(t('common.success'), t('template.duplicate.success'));
      goBack('/settings/templates');
    } catch {
      Alert.alert(t('common.error'), t('template.duplicate.error'));
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        <AppHeader title={t('template.detail.title')} showBack onBackPress={() => goBack('/settings/templates')} />
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.secondaryLabel }]}>
            {t('template.detail.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!template) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        <AppHeader title={t('template.detail.title')} showBack onBackPress={() => goBack('/settings/templates')} />
        <View style={styles.emptyState}>
          <Icon name="alert-circle" size={48} color={theme.secondaryLabel} />
          <Text style={[styles.emptyTitle, { color: theme.label }]}>
            {t('template.detail.not_found')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const categoryLabel = CATEGORY_CONFIG[template.category]?.label || template.category;
  const categoryIcon = CATEGORY_CONFIG[template.category]?.icon || '📝';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <AppHeader
        variant="large"
        title={template.title}
        showBack
        onBackPress={() => goBack('/settings/templates')}
        rightAction={
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.headerButton}
            accessibilityLabel={t('common.edit')}
          >
            <View style={[styles.headerButtonInner, { backgroundColor: theme.groupedBackground }]}>
              <Icon name="edit" size={18} color={theme.accent} />
            </View>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.isDark ? '#fff' : '#000'}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Template summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.groupedBackground }]}>
          <View style={[styles.templateIcon, { backgroundColor: theme.tile }]}>
            <Text style={styles.iconText}>{template.icon}</Text>
          </View>
          <View style={styles.templateInfo}>
            <Text style={[styles.templateTitle, { color: theme.label }]}>{template.title}</Text>
            {template.description ? (
              <Text style={[styles.templateDescription, { color: theme.secondaryLabel }]}>
                {template.description}
              </Text>
            ) : null}
            <View style={styles.templateMeta}>
              <Text style={[styles.categoryText, { color: theme.secondaryLabel }]}>
                {categoryIcon} {categoryLabel}
              </Text>
              <Text style={[styles.itemCount, { color: theme.secondaryLabel }]}>
                {t('template.items_count', { count: template.items.length })}
              </Text>
            </View>
          </View>
        </View>

        {/* Items */}
        {template.items.length > 0 && (
          <>
            <GroupedListHeader title={t('template.items_title')} />
            <GroupedList>
              {template.items.map((item, index) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={[styles.itemNumber, { backgroundColor: theme.tile }]}>
                    <Text style={[styles.itemNumberText, { color: theme.secondaryLabel }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemText, { color: theme.label }]}>{item.text}</Text>
                    {item.notes ? (
                      <Text style={[styles.itemNotes, { color: theme.secondaryLabel }]}>
                        {item.notes}
                      </Text>
                    ) : null}
                    {(item.priority !== 'medium' || item.quantity) && (
                      <View style={styles.itemMeta}>
                        {item.priority !== 'medium' && (
                          <StatusBadge
                            label={item.priority === 'high' ? t('template.priority.high') : t('template.priority.low')}
                            tone={item.priority === 'high' ? 'danger' : 'neutral'}
                          />
                        )}
                        {item.quantity ? (
                          <Text style={[styles.quantity, { color: theme.secondaryLabel }]}>
                            {t('template.quantity', { count: item.quantity })}
                          </Text>
                        ) : null}
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </GroupedList>
          </>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            onPress={handleDuplicate}
            style={[styles.actionButton, { backgroundColor: theme.groupedBackground }]}
            activeOpacity={0.7}
          >
            <Icon name="copy" size={20} color={theme.label} />
            <Text style={[styles.actionButtonText, { color: theme.label }]}>
              {t('template.actions.duplicate')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.actionButton, { backgroundColor: theme.danger }]}
            activeOpacity={0.7}
          >
            <Icon name="trash-2" size={20} color="#FFFFFF" />
            <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
              {t('common.delete')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: Spacing['3xl'],
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
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.lg,
  },
  templateIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.tile,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 28,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: Typography.fontSize.title3,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: Typography.fontSize.subheadline,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  templateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryText: {
    fontSize: Typography.fontSize.footnote,
    fontWeight: Typography.fontWeight.medium,
  },
  itemCount: {
    fontSize: Typography.fontSize.footnote,
    fontWeight: Typography.fontWeight.medium,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  itemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  itemNumberText: {
    fontSize: Typography.fontSize.caption1,
    fontWeight: Typography.fontWeight.semibold,
  },
  itemDetails: {
    flex: 1,
  },
  itemText: {
    fontSize: Typography.fontSize.callout,
  },
  itemNotes: {
    fontSize: Typography.fontSize.footnote,
    marginTop: 2,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 6,
  },
  quantity: {
    fontSize: Typography.fontSize.caption1,
    fontWeight: Typography.fontWeight.medium,
  },
  actionsSection: {
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.tile,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.callout,
    fontWeight: Typography.fontWeight.medium,
  },
});
