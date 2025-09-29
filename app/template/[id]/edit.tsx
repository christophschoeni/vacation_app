import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/design';
import AppHeader from '@/components/ui/AppHeader';
import { useRouteId } from '@/hooks/use-route-param';
import { useTemplateEditor } from '@/hooks/use-template-editor';
import {
  TemplateBasicInfo,
  TemplateItemsList,
  TemplateCategorySelector,
  CATEGORY_CONFIG,
} from '@/components/template-editor';

export default function TemplateEditScreen() {
  const templateId = useRouteId();
  const colorScheme = useColorScheme();

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

  const handleCategorySelect = (category: any) => {
    updateFormData({
      category,
      icon: CATEGORY_CONFIG[category]?.icon || formData.icon,
    });
  };

  const isDark = colorScheme === 'dark';

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Zurück"
          >
            <Icon name="arrow-left" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {templateId === 'new' ? 'Neue Standard-Liste' : 'Standard-Liste bearbeiten'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            Lade...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Zurück"
        >
          <Icon name="arrow-left" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
          {templateId === 'new' ? 'Neue Standard-Liste' : 'Bearbeiten'}
        </Text>
        <TouchableOpacity
          onPress={saveTemplate}
          style={styles.headerButton}
          disabled={saving}
          accessibilityLabel="Speichern"
        >
          <Text style={[
            styles.saveButtonText,
            {
              color: saving ? (isDark ? '#8E8E93' : '#6D6D70') : '#007AFF',
              opacity: saving ? 0.5 : 1
            }
          ]}>
            {saving ? 'Speichern...' : 'Speichern'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information */}
          <TemplateBasicInfo
            title={formData.title}
            description={formData.description}
            onTitleChange={(text) => updateFormData({ title: text })}
            onDescriptionChange={(text) => updateFormData({ description: text })}
            isDark={isDark}
          />

          {/* Category & Icon Selection */}
          <TemplateCategorySelector
            selectedCategory={formData.category}
            selectedIcon={formData.icon}
            onCategoryChange={handleCategorySelect}
            onIconChange={(icon) => updateFormData({ icon })}
            isDark={isDark}
          />

          {/* Items List */}
          <TemplateItemsList
            items={items}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onDeleteItem={deleteItem}
            isDark={isDark}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerButton: {
    padding: 8,
    marginRight: -8,
  },
  headerSpacer: {
    width: 40,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  bottomPadding: {
    height: 50,
  },
});