import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { goBack } from '@/lib/utils/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '@/components/ui/AppHeader';
import { Spacing, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';
import { useRouteId } from '@/hooks/use-route-param';
import { useTemplateEditor } from '@/hooks/use-template-editor';
import {
  TemplateBasicInfo,
  TemplateItemsList,
  TemplateCategorySelector,
  CATEGORY_CONFIG,
} from '@/components/template-editor';
import { ChecklistCategory } from '@/types';
import { useTranslation } from '@/lib/i18n';

export default function TemplateEditScreen() {
  const templateId = useRouteId();
  const theme = useIOSTheme();
  const { t } = useTranslation();

  const {
    loading,
    saving,
    formData,
    items,
    loadTemplate,
    updateFormData,
    addItem,
    updateItem,
    deleteItem,
    saveTemplate,
  } = useTemplateEditor(templateId);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const handleCategorySelect = (category: ChecklistCategory) => {
    updateFormData({
      category,
      icon: CATEGORY_CONFIG[category]?.icon || formData.icon,
    });
  };

  const screenTitle =
    templateId === 'new'
      ? t('template.editor.new_title')
      : t('template.editor.edit_title');

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={['top', 'bottom']}
      >
        <AppHeader
          variant="modal"
          showBack={true}
          onBackPress={() => goBack('/settings/templates')}
        />
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.secondaryLabel }]}>
            {t('template.editor.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top', 'bottom']}
    >
      <AppHeader
        variant="modal"
        showBack={true}
        onBackPress={() => goBack('/settings/templates')}
        onRightPress={saving ? undefined : saveTemplate}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* iOS-style large title in content area */}
          <View style={styles.titleSection}>
            <Text style={[styles.largeTitle, { color: theme.label }]}>
              {screenTitle}
            </Text>
          </View>

          {/* Basic Information */}
          <TemplateBasicInfo
            title={formData.title}
            description={formData.description}
            onTitleChange={(text) => updateFormData({ title: text })}
            onDescriptionChange={(text) => updateFormData({ description: text })}
          />

          {/* Category & Icon Selection */}
          <TemplateCategorySelector
            selectedCategory={formData.category}
            selectedIcon={formData.icon}
            onCategoryChange={handleCategorySelect}
            onIconChange={(icon) => updateFormData({ icon })}
          />

          {/* Items List */}
          <TemplateItemsList
            items={items}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onDeleteItem={deleteItem}
          />

          {/* Bottom padding for keyboard */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  largeTitle: {
    fontSize: Typography.fontSize.largeTitle,
    fontWeight: '700',
    fontFamily: 'System',
    lineHeight: 41,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.callout,
  },
  bottomPadding: {
    height: 50,
  },
});
