import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from '@/components/glass';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Vacation } from '@/types';

interface VacationCardProps {
  vacation: Vacation;
  onPress: (id: string) => void;
  onLongPress?: (id: string) => void;
}

export default function VacationCard({ vacation, onPress, onLongPress }: VacationCardProps) {
  const colorScheme = useColorScheme();

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short'
    };
    return `${startDate.toLocaleDateString('de-DE', options)} - ${endDate.toLocaleDateString('de-DE', options)}`;
  };

  return (
    <GlassCard
      onPress={() => onPress(vacation.id)}
      onLongPress={onLongPress ? () => onLongPress(vacation.id) : undefined}
      style={styles.card}
      intensity="medium"
    >
      <View style={styles.cardHeader}>
        <View style={styles.destinationContainer}>
          <Text style={[styles.destination, { color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E' }]}>
            {vacation.destination}
          </Text>
          <Text style={[styles.country, { color: colorScheme === 'dark' ? '#8E8E93' : '#6D6D70' }]}>
            {vacation.country}
          </Text>
        </View>
        <Text style={[styles.dates, { color: colorScheme === 'dark' ? '#8E8E93' : '#6D6D70' }]}>
          {formatDateRange(vacation.startDate, vacation.endDate)}
        </Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.hotelContainer}>
          <Text style={styles.hotelIcon}>🏨</Text>
          <Text style={[styles.hotel, { color: colorScheme === 'dark' ? '#D1D1D6' : '#48484A' }]}>
            {vacation.hotel}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  destinationContainer: {
    flex: 1,
  },
  destination: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'System',
  },
  country: {
    fontSize: 15,
    fontWeight: '400',
  },
  dates: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'right',
  },
  cardContent: {
    gap: 8,
  },
  hotelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hotelIcon: {
    fontSize: 16,
  },
  hotel: {
    fontSize: 15,
    fontWeight: '400',
    flex: 1,
  },
});