import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from '@/components/glass';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Checklist } from '@/types';

interface ChecklistCardProps {
  checklist: Checklist;
  onPress: (id: string) => void;
}

export default function ChecklistCard({ checklist, onPress }: ChecklistCardProps) {
  const colorScheme = useColorScheme();

  const completedCount = checklist.items.filter(item => item.completed).length;
  const totalCount = checklist.items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <GlassCard
      onPress={() => onPress(checklist.id)}
      style={styles.card}
      intensity="light"
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E' }]}>
            {checklist.title}
          </Text>
          <Text style={[styles.progress, { color: colorScheme === 'dark' ? '#8E8E93' : '#6D6D70' }]}>
            {completedCount} von {totalCount} erledigt
          </Text>
        </View>
        <Text style={[styles.percentage, { color: colorScheme === 'dark' ? '#007AFF' : '#007AFF' }]}>
          {Math.round(progressPercentage)}%
        </Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarBg, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#E5E5EA' }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: '#007AFF'
              }
            ]}
          />
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'System',
  },
  progress: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'System',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'System',
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});