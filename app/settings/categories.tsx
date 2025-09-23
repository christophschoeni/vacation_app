import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card, Icon, IconName, Colors } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import CategoryEditor, { Category } from '@/components/ui/forms/CategoryEditor';

// Default categories for expenses
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Essen', icon: 'restaurant' as IconName },
  { id: '2', name: 'Transport', icon: 'car' as IconName },
  { id: '3', name: 'Hotel', icon: 'hotel' as IconName },
  { id: '4', name: 'Shopping', icon: 'shopping' as IconName },
  { id: '5', name: 'Sonstiges', icon: 'other' as IconName },
];

export default function CategoriesScreen() {
  const colorScheme = useColorScheme();
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [showEditor, setShowEditor] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setShowEditor(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowEditor(true);
  };

  const handleSaveCategory = (category: Category) => {
    if (editingCategory) {
      // Edit existing category
      setCategories(categories.map(cat =>
        cat.id === category.id ? category : cat
      ));
    } else {
      // Add new category
      setCategories([...categories, category]);
    }
    setShowEditor(false);
    setEditingCategory(undefined);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    Alert.alert(
      'Kategorie löschen',
      `Möchten Sie die Kategorie "${category.name}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            setCategories(categories.filter(cat => cat.id !== categoryId));
          },
        },
      ]
    );
  };

  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleEditCategory(category)}
              activeOpacity={0.7}
            >
              <Card variant="clean" style={styles.categoryCard}>
                <View style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <Icon name={category.icon} size={20} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                    <Text style={[styles.categoryName, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                      {category.name}
                    </Text>
                  </View>
                  <View style={styles.categoryActions}>
                    <Icon name="chevron-right" size={16} color={isDark ? '#8E8E93' : '#6D6D70'} />
                    {categories.length > 1 && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                        style={styles.deleteButton}
                      >
                        <Icon name="delete" size={18} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.addCategoryButton, { borderColor: isDark ? '#3A3A3C' : '#E5E5EA' }]}
            onPress={handleAddCategory}
          >
            <Icon name="plus" size={20} color={isDark ? '#8E8E93' : '#6D6D70'} />
            <Text style={[styles.addCategoryText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              Neue Kategorie hinzufügen
            </Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 16,
    fontFamily: 'System',
  },
  categoryCard: {
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'System',
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    padding: 8,
    marginRight: -8,
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: 'dashed',
    gap: 8,
  },
  addCategoryText: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'System',
  },
});