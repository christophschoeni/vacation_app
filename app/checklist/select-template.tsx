import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Card, Icon } from '@/components/design';
import AppHeader from '@/components/ui/AppHeader';
import { useChecklists } from '@/hooks/use-checklists';
import { useTranslation } from '@/lib/i18n';

export default function SelectTemplateScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { vacationId } = useLocalSearchParams<{ vacationId: string }>();
  const isDark = colorScheme === 'dark';

  const { templates, loadTemplates, createFromTemplate } = useChecklists(vacationId || '');

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleSelectTemplate = async (templateId: string) => {
    try {
      await createFromTemplate(templateId);
      router.back();
    } catch (error) {
      console.error('Failed to create from template:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
      <AppHeader
        title={t('vacation.checklists.templates.title')}
        variant="large"
        showBack={true}
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
          {t('vacation.checklists.templates.subtitle')}
        </Text>

        {templates.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="book-template" size={48} color={isDark ? '#8E8E93' : '#6D6D70'} />
            <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              {t('vacation.checklists.templates.empty')}
            </Text>
          </View>
        ) : (
          templates.map((template) => (
            <TouchableOpacity
              key={template.id}
              onPress={() => handleSelectTemplate(template.id)}
              activeOpacity={0.7}
            >
              <Card variant="clean" style={styles.templateCard}>
                <View style={styles.templateHeader}>
                  <View style={styles.templateIconContainer}>
                    <Icon
                      name={template.icon as any || 'check'}
                      size={24}
                      color={isDark ? '#FFFFFF' : '#007AFF'}
                    />
                  </View>
                  <View style={styles.templateInfo}>
                    <Text style={[styles.templateTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                      {template.title}
                    </Text>
                    <Text style={[styles.templateSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                      {template.items.length} {template.items.length === 1 ? t('vacation.checklists.item') : t('vacation.checklists.items')}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={20} color={isDark ? '#8E8E93' : '#C7C7CC'} />
                </View>

                {/* Preview first 3 items */}
                {template.items.slice(0, 3).length > 0 && (
                  <View style={styles.itemsPreview}>
                    {template.items.slice(0, 3).map((item, index) => (
                      <View key={item.id} style={styles.previewItem}>
                        <View style={[styles.checkbox, {
                          borderColor: isDark ? '#3A3A3C' : '#C7C7CC',
                          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF'
                        }]} />
                        <Text
                          style={[styles.previewItemText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}
                          numberOfLines={1}
                        >
                          {item.text}
                        </Text>
                      </View>
                    ))}
                    {template.items.length > 3 && (
                      <Text style={[styles.moreItemsText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                        +{template.items.length - 3} {t('vacation.checklists.more_items')}
                      </Text>
                    )}
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))
        )}
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
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 16,
    fontFamily: 'System',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'System',
    marginTop: 16,
    textAlign: 'center',
  },
  templateCard: {
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  templateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 2,
  },
  templateSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'System',
  },
  itemsPreview: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(60, 60, 67, 0.12)',
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    marginRight: 10,
  },
  previewItemText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'System',
    flex: 1,
  },
  moreItemsText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'System',
    marginTop: 6,
    marginLeft: 28,
  },
});
