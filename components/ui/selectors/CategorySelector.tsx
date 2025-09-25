import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ChecklistCategory } from '@/types';

// Category configuration
const CATEGORY_CONFIG: Record<ChecklistCategory, { label: string; icon: string; description: string }> = {
  packing: {
    label: 'Packlisten',
    icon: '🧳',
    description: 'Was mitnehmen für die Reise'
  },
  shopping: {
    label: 'Einkaufslisten',
    icon: '🛒',
    description: 'Was vor oder während der Reise kaufen'
  },
  bucket: {
    label: 'Bucket Lists',
    icon: '🌟',
    description: 'Sehenswürdigkeiten und Aktivitäten'
  },
  todo: {
    label: 'To-Do Listen',
    icon: '✅',
    description: 'Aufgaben vor und während der Reise'
  },
  planning: {
    label: 'Planungslisten',
    icon: '📋',
    description: 'Reiseplanung und Organisation'
  },
  general: {
    label: 'Allgemein',
    icon: '📝',
    description: 'Allgemeine Listen und Notizen'
  },
  custom: {
    label: 'Benutzerdefiniert',
    icon: '⚙️',
    description: 'Individuelle Listen'
  },
};

interface CategorySelectorProps {
  selectedCategory: ChecklistCategory;
  onCategorySelect: (category: ChecklistCategory) => void;
  layout?: 'grid' | 'list';
  showDescriptions?: boolean;
}

export default function CategorySelector({
  selectedCategory,
  onCategorySelect,
  layout = 'grid',
  showDescriptions = false,
}: CategorySelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const renderCategoryOption = (category: ChecklistCategory) => {
    const config = CATEGORY_CONFIG[category];
    const isSelected = selectedCategory === category;

    return (
      <TouchableOpacity
        key={category}
        style={[
          layout === 'grid' ? styles.gridOption : styles.listOption,
          {
            backgroundColor: isSelected
              ? (isDark ? '#1C1C1E' : '#F2F2F7')
              : 'transparent',
            borderColor: isSelected
              ? '#007AFF'
              : (isDark ? '#38383A' : '#E5E5EA'),
          }
        ]}
        onPress={() => onCategorySelect(category)}
        activeOpacity={0.7}
      >
        <View style={layout === 'grid' ? styles.gridContent : styles.listContent}>
          <Text style={styles.categoryIcon}>{config.icon}</Text>
          <View style={styles.categoryTextContainer}>
            <Text style={[
              styles.categoryLabel,
              { color: isDark ? '#FFFFFF' : '#1C1C1E' }
            ]}>
              {config.label}
            </Text>
            {showDescriptions && layout === 'list' && (
              <Text style={[
                styles.categoryDescription,
                { color: isDark ? '#8E8E93' : '#6D6D70' }
              ]}>
                {config.description}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (layout === 'list') {
    return (
      <ScrollView contentContainerStyle={styles.listContainer}>
        {Object.keys(CATEGORY_CONFIG).map(category =>
          renderCategoryOption(category as ChecklistCategory)
        )}
      </ScrollView>
    );
  }

  return (
    <View style={styles.gridContainer}>
      {Object.keys(CATEGORY_CONFIG).map(category =>
        renderCategoryOption(category as ChecklistCategory)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  listContainer: {
    gap: 8,
  },
  gridOption: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  listOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  gridContent: {
    alignItems: 'center',
    gap: 8,
  },
  listContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 12,
    marginTop: 2,
  },
});