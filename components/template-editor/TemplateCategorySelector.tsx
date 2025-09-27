import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChecklistCategory } from '@/types';
import { CATEGORY_CONFIG, TEMPLATE_ICONS } from './constants';

interface TemplateCategorySelectorProps {
  selectedCategory: ChecklistCategory;
  selectedIcon: string;
  onCategoryChange: (category: ChecklistCategory) => void;
  onIconChange: (icon: string) => void;
  isDark: boolean;
}

export function TemplateCategorySelector({
  selectedCategory,
  selectedIcon,
  onCategoryChange,
  onIconChange,
  isDark,
}: TemplateCategorySelectorProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
          KATEGORIE & SYMBOL
        </Text>
        <Text style={[styles.sectionDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
          Wählen Sie eine Kategorie und ein Symbol für Ihre Standard-Liste
        </Text>
      </View>

      <View style={[styles.selectorContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        {/* Category Selection */}
        <View style={styles.subsection}>
          <Text style={[styles.subsectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Kategorie
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <View style={styles.categoryGrid}>
              {Object.entries(CATEGORY_CONFIG).map(([category, config]) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryOption,
                    {
                      backgroundColor: selectedCategory === category
                        ? (isDark ? '#2C2C2E' : '#F2F2F7')
                        : 'transparent',
                      borderColor: selectedCategory === category
                        ? '#007AFF'
                        : (isDark ? '#2C2C2E' : '#E5E5E5'),
                    },
                  ]}
                  onPress={() => onCategoryChange(category as ChecklistCategory)}
                >
                  <Text style={styles.categoryIcon}>{config.icon}</Text>
                  <Text style={[
                    styles.categoryLabel,
                    {
                      color: selectedCategory === category
                        ? '#007AFF'
                        : (isDark ? '#FFFFFF' : '#1C1C1E'),
                      fontWeight: selectedCategory === category ? '600' : '400',
                    },
                  ]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Icon Selection */}
        <View style={styles.subsection}>
          <Text style={[styles.subsectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Symbol
          </Text>
          <View style={styles.iconGrid}>
            {TEMPLATE_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconOption,
                  {
                    backgroundColor: selectedIcon === icon
                      ? '#007AFF'
                      : (isDark ? '#2C2C2E' : '#F2F2F7'),
                    borderColor: selectedIcon === icon
                      ? '#007AFF'
                      : (isDark ? '#3A3A3C' : '#E5E5E5'),
                  },
                ]}
                onPress={() => onIconChange(icon)}
              >
                <Text style={[
                  styles.iconText,
                  { opacity: selectedIcon === icon ? 1 : 0.7 }
                ]}>
                  {icon}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 15,
    lineHeight: 20,
  },
  selectorContainer: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  subsection: {
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryScroll: {
    marginHorizontal: -4,
  },
  categoryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  categoryOption: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 90,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  iconOption: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconText: {
    fontSize: 20,
  },
});