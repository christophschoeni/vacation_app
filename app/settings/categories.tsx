import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { goBack } from '@/lib/utils/navigation';
import { Icon, IconName, GroupedList, GroupedListFooter } from '@/components/design';
import { Spacing, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';
import AppHeader from '@/components/ui/AppHeader';
import CategoryEditor, { Category } from '@/components/ui/forms/CategoryEditor';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '@/lib/i18n';

// Default categories for expenses
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Essen', icon: 'restaurant' as IconName },
  { id: '2', name: 'Transport', icon: 'car' as IconName },
  { id: '3', name: 'Hotel', icon: 'hotel' as IconName },
  { id: '4', name: 'Shopping', icon: 'shopping' as IconName },
  { id: '5', name: 'Sonstiges', icon: 'other' as IconName },
];

const CATEGORIES_STORAGE_KEY = '@vacation_assist_categories';

export default function CategoriesScreen() {
  const theme = useIOSTheme();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [showEditor, setShowEditor] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // Load categories from storage on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const storedCategories = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (storedCategories) {
        const parsed = JSON.parse(storedCategories) as Category[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCategories = async (newCategories: Category[]) => {
    try {
      await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(newCategories));
    } catch (error) {
      console.warn('Failed to save categories:', error);
      Alert.alert(
        t('settings.categories.errors.save_title'),
        t('settings.categories.errors.save_message'),
        [{ text: t('common.ok'), style: 'default' }]
      );
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setShowEditor(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowEditor(true);
  };

  const handleSaveCategory = (category: Category) => {
    // Validate category name
    const trimmedName = category.name.trim();
    if (!trimmedName) {
      Alert.alert(
        t('settings.categories.errors.invalid_name_title'),
        t('settings.categories.errors.invalid_name_message'),
        [{ text: t('common.ok'), style: 'default' }]
      );
      return;
    }

    // Check for duplicate names (excluding current category when editing)
    const isDuplicate = categories.some(cat =>
      cat.name.toLowerCase() === trimmedName.toLowerCase() &&
      (!editingCategory || cat.id !== editingCategory.id)
    );

    if (isDuplicate) {
      Alert.alert(
        t('settings.categories.errors.duplicate_title'),
        t('settings.categories.errors.duplicate_message'),
        [{ text: t('common.ok'), style: 'default' }]
      );
      return;
    }

    let newCategories: Category[];

    if (editingCategory) {
      // Edit existing category
      newCategories = categories.map(cat =>
        cat.id === category.id ? { ...category, name: trimmedName } : cat
      );
    } else {
      // Add new category
      newCategories = [...categories, { ...category, name: trimmedName }];
    }

    setCategories(newCategories);
    saveCategories(newCategories);
    setShowEditor(false);
    setEditingCategory(undefined);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    if (categories.length <= 1) {
      Alert.alert(
        t('settings.categories.errors.cannot_delete_title'),
        t('settings.categories.errors.cannot_delete_message'),
        [{ text: t('common.ok'), style: 'default' }]
      );
      return;
    }

    Alert.alert(
      t('settings.categories.delete.title'),
      t('settings.categories.delete.message', { name: category.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            const newCategories = categories.filter(cat => cat.id !== categoryId);
            setCategories(newCategories);
            saveCategories(newCategories);
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <AppHeader
          title={t('settings.categories.title')}
          variant="large"
          showBack={true}
          onBackPress={() => goBack('/(tabs)/settings')}
          useSafeAreaPadding={true}
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.secondaryLabel }]}>
            {t('settings.categories.loading')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <AppHeader
        title={t('settings.categories.title')}
        variant="large"
        showBack={true}
        onBackPress={() => goBack('/(tabs)/settings')}
        useSafeAreaPadding={true}
        rightAction={
          <TouchableOpacity
            onPress={handleAddCategory}
            style={styles.headerButton}
            accessibilityLabel={t('settings.categories.add_aria')}
          >
            <View style={[styles.headerButtonInner, { backgroundColor: theme.groupedBackground }]}>
              <Icon name="plus" size={18} color={theme.accent} />
            </View>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GroupedList>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleEditCategory(category)}
              activeOpacity={0.7}
              style={styles.row}
              accessibilityRole="button"
              accessibilityLabel={category.name}
            >
              <Icon name={category.icon} size={22} color={theme.accent} />
              <Text style={[styles.categoryName, { color: theme.label }]} numberOfLines={1}>
                {category.name}
              </Text>
              {categories.length > 1 && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(category.id);
                  }}
                  style={styles.deleteButton}
                  accessibilityLabel={t('settings.categories.delete_aria', { name: category.name })}
                >
                  <Icon name="delete" size={18} color={theme.danger} />
                </TouchableOpacity>
              )}
              <Icon name="chevron-right" size={16} color={theme.tertiaryLabel} />
            </TouchableOpacity>
          ))}
        </GroupedList>

        <GroupedListFooter text={t('settings.categories.subtitle')} />
      </ScrollView>

      <CategoryEditor
        visible={showEditor}
        category={editingCategory}
        onSave={handleSaveCategory}
        onCancel={() => {
          setShowEditor(false);
          setEditingCategory(undefined);
        }}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'System',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
  },
  categoryName: {
    flex: 1,
    fontSize: Typography.fontSize.callout,
  },
  deleteButton: {
    padding: 4,
  },
});