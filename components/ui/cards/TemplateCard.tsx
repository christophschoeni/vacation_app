import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Card, Icon } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Checklist, ChecklistCategory } from '@/types';

// Category configuration - could be moved to a shared constants file
const CATEGORY_CONFIG: Record<ChecklistCategory, { label: string; icon: string; color: string }> = {
  packing: { label: 'Packlisten', icon: '🧳', color: '#007AFF' },
  shopping: { label: 'Einkaufslisten', icon: '🛒', color: '#FF9500' },
  bucket: { label: 'Bucket Lists', icon: '🌟', color: '#AF52DE' },
  todo: { label: 'To-Do Listen', icon: '✅', color: '#34C759' },
  planning: { label: 'Planungslisten', icon: '📋', color: '#FF3B30' },
  general: { label: 'Allgemein', icon: '📝', color: '#8E8E93' },
  custom: { label: 'Benutzerdefiniert', icon: '⚙️', color: '#5856D6' },
};

interface TemplateCardProps {
  template: Checklist;
  onPress?: (template: Checklist) => void;
  showItemCount?: boolean;
  showCategory?: boolean;
  compact?: boolean;
  style?: any;
}

export default function TemplateCard({
  template,
  onPress,
  showItemCount = true,
  showCategory = true,
  compact = false,
  style,
}: TemplateCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const categoryConfig = CATEGORY_CONFIG[template.category];

  return (
    <TouchableOpacity
      onPress={() => onPress?.(template)}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <Card
        variant="clean"
        style={[
          compact ? styles.compactCard : styles.card,
          style
        ]}
      >
        <View style={compact ? styles.compactContent : styles.content}>
          <View style={styles.templateInfo}>
            <Text style={styles.templateIcon}>{template.icon}</Text>
            <View style={styles.templateText}>
              <Text style={[styles.templateTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                {template.title}
              </Text>
              {!compact && template.description && (
                <Text style={[styles.templateDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                  {template.description}
                </Text>
              )}
              <View style={styles.templateMeta}>
                {showCategory && categoryConfig && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryEmoji}>
                      {categoryConfig.icon}
                    </Text>
                    <Text style={[styles.categoryText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                      {categoryConfig.label}
                    </Text>
                  </View>
                )}
                {showItemCount && (
                  <Text style={[styles.itemCount, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                    {template.items.length} Einträge
                  </Text>
                )}
              </View>
            </View>
          </View>
          {onPress && (
            <Icon name="chevron-right" size={16} color={isDark ? '#8E8E93' : '#6D6D70'} />
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  compactCard: {
    marginBottom: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  templateIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  templateText: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  templateDescription: {
    fontSize: 14,
    marginBottom: 4,
    numberOfLines: 1,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemCount: {
    fontSize: 12,
    fontWeight: '500',
  },
});