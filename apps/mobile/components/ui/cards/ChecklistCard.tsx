import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { Icon, ProgressBar } from '@/components/design';
import { BorderRadius, Spacing, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';
import { Checklist } from '@/types';
import { useTranslation } from '@/lib/i18n';

interface ChecklistCardProps {
  checklist: Checklist;
  onPress: (id: string) => void;
  onLongPress?: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  packing: '#007AFF',
  shopping: '#34C759',
  bucket: '#FF9500',
  todo: '#FF3B30',
  planning: '#5856D6',
  general: '#8E8E93',
  custom: '#6D6D70',
};

/**
 * A checklist as a card: icon, title, completion count and a progress bar,
 * followed by a preview of the first few items.
 */
export default function ChecklistCard({
  checklist,
  onPress,
  onLongPress,
}: ChecklistCardProps) {
  const theme = useIOSTheme();
  // The category id is data, so its label key is assembled at runtime and
  // cannot be checked against TranslationKey.
  const { t, tDynamic } = useTranslation();

  const items = checklist.items ?? [];
  const completedItems = items.filter((item) => item.completed).length;
  const totalItems = items.length;
  const progress = totalItems > 0 ? completedItems / totalItems : 0;
  const isFullyCompleted = totalItems > 0 && completedItems === totalItems;

  const accent = CATEGORY_COLORS[checklist.category] ?? CATEGORY_COLORS.general;
  const barColor = isFullyCompleted ? theme.success : accent;

  return (
    <TouchableOpacity
      onPress={() => onPress(checklist.id)}
      onLongPress={() => onLongPress?.(checklist.id)}
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: theme.groupedBackground }]}
      accessibilityRole="button"
      accessibilityLabel={`${checklist.title}. ${t('checklist.progress', {
        completed: completedItems,
        total: totalItems,
      })}`}
    >
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: barColor + '22' }]}>
          <Icon
            name={isFullyCompleted ? 'check' : (checklist.icon as any)}
            size={20}
            color={barColor}
          />
        </View>

        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.label }]} numberOfLines={1}>
            {checklist.title}
          </Text>
          <Text style={[styles.category, { color: theme.secondaryLabel }]} numberOfLines={1}>
            {tDynamic(`checklist.categories.${checklist.category}`)}
          </Text>
        </View>

        <Text style={[styles.count, { color: theme.secondaryLabel }]}>
          {completedItems}/{totalItems}
        </Text>
      </View>

      {totalItems > 0 && (
        <ProgressBar progress={progress} color={barColor} style={styles.bar} />
      )}

      {items.length > 0 ? (
        <View style={styles.preview}>
          {items.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.previewItem}>
              <Icon
                name="check"
                size={14}
                color={item.completed ? barColor : theme.tertiaryLabel}
              />
              <Text
                style={[
                  styles.previewText,
                  {
                    color: item.completed ? theme.secondaryLabel : theme.label,
                    textDecorationLine: item.completed ? 'line-through' : 'none',
                  },
                ]}
                numberOfLines={1}
              >
                {item.text}
              </Text>
            </View>
          ))}
          {items.length > 3 && (
            <Text style={[styles.more, { color: theme.secondaryLabel }]}>
              {t('checklist.more_items', { count: items.length - 3 })}
            </Text>
          )}
        </View>
      ) : (
        <Text style={[styles.empty, { color: theme.secondaryLabel }]}>
          {t('checklist.no_items')}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
  },
  category: {
    fontSize: Typography.fontSize.footnote,
    marginTop: 1,
  },
  count: {
    fontSize: Typography.fontSize.subheadline,
    fontWeight: Typography.fontWeight.semibold,
  },
  bar: {
    marginTop: Spacing.md,
  },
  preview: {
    gap: 6,
    marginTop: Spacing.md,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  previewText: {
    fontSize: Typography.fontSize.subheadline,
    flex: 1,
  },
  more: {
    fontSize: Typography.fontSize.caption1,
    marginTop: 2,
  },
  empty: {
    fontSize: Typography.fontSize.subheadline,
    marginTop: Spacing.md,
  },
});
