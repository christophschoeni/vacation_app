import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ExpenseCategory } from '@/types';
import { useColorScheme } from 'react-native';
import { Icon } from '@/components/design';
import { EXPENSE_CATEGORIES } from '@/lib/constants/expense-categories';
import { Shadow } from '@/constants/design';
import * as Haptics from 'expo-haptics';

interface CategorySelectorProps {
  selectedCategory: ExpenseCategory;
  onSelect: (category: ExpenseCategory) => void;
  style?: any;
}

export default function CategorySelector({ selectedCategory, onSelect, style }: CategorySelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSelect = async (category: ExpenseCategory) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(category);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
        Kategorie
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {EXPENSE_CATEGORIES.map((option) => {
          const isSelected = selectedCategory === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.categoryItem,
                {
                  backgroundColor: isSelected
                    ? option.color
                    : isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.03)',
                  borderColor: isSelected
                    ? option.color
                    : isDark
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.1)',
                },
              ]}
              onPress={() => handleSelect(option.value)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                {
                  backgroundColor: isSelected
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'transparent',
                }
              ]}>
                <Icon
                  name={option.icon as any}
                  size={20}
                  color={isSelected ? '#FFFFFF' : option.color}
                />
              </View>

              <Text style={[
                styles.categoryLabel,
                {
                  color: isSelected
                    ? '#FFFFFF'
                    : isDark
                      ? '#FFFFFF'
                      : '#1C1C1E',
                  fontWeight: isSelected ? '600' : '500',
                }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'System',
  },
  scrollView: {
    flexDirection: 'row',
  },
  scrollContent: {
    paddingRight: 16,
  },
  categoryItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    ...Shadow.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 12,
    fontFamily: 'System',
    textAlign: 'center',
  },
});