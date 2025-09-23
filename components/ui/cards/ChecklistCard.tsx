import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Icon } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Checklist } from '@/types';

interface ChecklistCardProps {
  checklist: Checklist;
  onPress: (id: string) => void;
  onLongPress?: (id: string) => void;
}

export default function ChecklistCard({ checklist, onPress, onLongPress }: ChecklistCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Debug: Log checklist data
  console.log(`ChecklistCard "${checklist.title}":`, {
    itemsLength: checklist.items?.length,
    items: checklist.items,
    hasItems: !!checklist.items
  });

  const completedItems = checklist.items?.filter(item => item.completed).length || 0;
  const totalItems = checklist.items?.length || 0;
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const getCategoryColor = (category: string) => {
    const colors = {
      packing: '#007AFF',
      shopping: '#34C759',
      bucket: '#FF9500',
      todo: '#FF3B30',
      planning: '#5856D6',
      general: '#8E8E93',
      custom: '#6D6D70',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getCategoryName = (category: string) => {
    const names = {
      packing: 'Packen',
      shopping: 'Einkaufen',
      bucket: 'Bucket List',
      todo: 'Aufgaben',
      planning: 'Planung',
      general: 'Allgemein',
      custom: 'Benutzerdefiniert',
    };
    return names[category as keyof typeof names] || 'Allgemein';
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(checklist.id)}
      onLongPress={() => onLongPress?.(checklist.id)}
      activeOpacity={0.7}
    >
      <Card variant="clean" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Icon
                name={checklist.icon as any}
                size={20}
                color={getCategoryColor(checklist.category)}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                {checklist.title}
              </Text>
              <Text style={[styles.category, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                {getCategoryName(checklist.category)}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <Text style={[styles.progress, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
              {completedItems}/{totalItems}
            </Text>
            {totalItems > 0 && (
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progressPercent}%`,
                        backgroundColor: getCategoryColor(checklist.category),
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {checklist.description && (
          <Text style={[styles.description, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            {checklist.description}
          </Text>
        )}

        {/* Preview von den ersten paar Items */}
        {checklist.items && checklist.items.length > 0 && (
          <View style={styles.itemsPreview}>
            {checklist.items.slice(0, 3).map((item, index) => (
              <View key={item.id} style={styles.previewItem}>
                <Icon
                  name={item.completed ? 'check' : 'check'}
                  size={14}
                  color={item.completed ? getCategoryColor(checklist.category) : (isDark ? '#3A3A3C' : '#E5E5EA')}
                />
                <Text
                  style={[
                    styles.previewText,
                    {
                      color: item.completed
                        ? (isDark ? '#8E8E93' : '#6D6D70')
                        : (isDark ? '#FFFFFF' : '#1C1C1E'),
                      textDecorationLine: item.completed ? 'line-through' : 'none',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.text}
                </Text>
              </View>
            ))}
            {checklist.items && checklist.items.length > 3 && (
              <Text style={[styles.moreItems, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                +{checklist.items.length - 3} weitere
              </Text>
            )}
          </View>
        )}

        {(!checklist.items || checklist.items.length === 0) && (
          <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            Noch keine Einträge
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 2,
  },
  category: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'System',
  },
  statsContainer: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  progress: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 4,
  },
  progressBarContainer: {
    width: 60,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  description: {
    fontSize: 14,
    fontFamily: 'System',
    marginBottom: 12,
    lineHeight: 20,
  },
  itemsPreview: {
    gap: 6,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewText: {
    fontSize: 14,
    fontFamily: 'System',
    flex: 1,
  },
  moreItems: {
    fontSize: 12,
    fontFamily: 'System',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'System',
    fontStyle: 'italic',
  },
});