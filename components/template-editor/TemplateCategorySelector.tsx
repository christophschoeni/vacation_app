import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChecklistCategory } from '@/types';
import { GroupedListHeader, GroupedListFooter } from '@/components/design';
import { BorderRadius, Spacing, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';
import { CATEGORY_CONFIG, TEMPLATE_ICONS } from './constants';

interface TemplateCategorySelectorProps {
  selectedCategory: ChecklistCategory;
  selectedIcon: string;
  onCategoryChange: (category: ChecklistCategory) => void;
  onIconChange: (icon: string) => void;
}

export function TemplateCategorySelector({
  selectedCategory,
  selectedIcon,
  onCategoryChange,
  onIconChange,
}: TemplateCategorySelectorProps) {
  const theme = useIOSTheme();

  return (
    <View style={styles.section}>
      {/* TODO i18n: KATEGORIE & SYMBOL */}
      <GroupedListHeader title="Kategorie & Symbol" />

      <View style={[styles.selectorContainer, { backgroundColor: theme.groupedBackground }]}>
        {/* Category Selection */}
        <View style={styles.subsection}>
          {/* TODO i18n: Kategorie */}
          <Text style={[styles.subsectionTitle, { color: theme.label }]}>
            Kategorie
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <View style={styles.categoryGrid}>
              {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
                const selected = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      {
                        backgroundColor: selected ? theme.tile : 'transparent',
                        borderColor: selected ? theme.accent : theme.separator,
                      },
                    ]}
                    onPress={() => onCategoryChange(category as ChecklistCategory)}
                  >
                    <Text style={styles.categoryIcon}>{config.icon}</Text>
                    <Text style={[
                      styles.categoryLabel,
                      {
                        color: selected ? theme.accent : theme.label,
                        fontWeight: selected ? '600' : '400',
                      },
                    ]}>
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Icon Selection */}
        <View style={styles.subsection}>
          {/* TODO i18n: Symbol */}
          <Text style={[styles.subsectionTitle, { color: theme.label }]}>
            Symbol
          </Text>
          <View style={styles.iconGrid}>
            {TEMPLATE_ICONS.map((icon) => {
              const selected = selectedIcon === icon;
              return (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    {
                      backgroundColor: selected ? theme.accent : theme.tile,
                      borderColor: selected ? theme.accent : theme.separator,
                    },
                  ]}
                  onPress={() => onIconChange(icon)}
                >
                  <Text style={[
                    styles.iconText,
                    { opacity: selected ? 1 : 0.7 }
                  ]}>
                    {icon}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* TODO i18n: Wählen Sie eine Kategorie und ein Symbol für Ihre Standard-Liste */}
      <GroupedListFooter text="Wählen Sie eine Kategorie und ein Symbol für Ihre Standard-Liste" />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.md,
  },
  selectorContainer: {
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    marginTop: Spacing.xs,
  },
  subsection: {
    marginBottom: Spacing['2xl'],
  },
  subsectionTitle: {
    fontSize: Typography.fontSize.callout,
    fontWeight: '600',
    marginBottom: Spacing.md,
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
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: 4,
    borderRadius: BorderRadius.tile,
    borderWidth: 1,
    minWidth: 90,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: Typography.fontSize.caption1,
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
    borderRadius: BorderRadius.tile,
    borderWidth: 1,
  },
  iconText: {
    fontSize: 20,
  },
});
