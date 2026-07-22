import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

import { BorderRadius, Spacing, Typography } from '@/constants/design';
import { getVacationGradient } from '@/lib/vacation-colors';
import { formatDateRange } from '@/lib/utils/formatters';
import type { Vacation } from '@/types';

interface VacationHeroProps {
  vacation: Pick<Vacation, 'destination' | 'startDate' | 'endDate' | 'imageUrl' | 'country'>;
  height?: number;
  style?: ViewStyle;
}

/**
 * Photo (or gradient) hero band with the trip name and date range, as on the
 * report. A dark scrim under the text keeps it legible over any photo. The
 * gradient stands in when no photo is set.
 */
export function VacationHero({ vacation, height = 150, style }: VacationHeroProps) {
  const dateRange = formatDateRange(
    new Date(vacation.startDate),
    new Date(vacation.endDate)
  );

  return (
    <View style={[styles.container, { height }, style]}>
      {vacation.imageUrl ? (
        <Image source={{ uri: vacation.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <LinearGradient
          colors={getVacationGradient(vacation as Vacation)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Scrim: keeps the title readable over a bright photo. */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.text}>
        <Text style={styles.destination} numberOfLines={1}>
          {vacation.destination}
        </Text>
        <Text style={styles.dates} numberOfLines={1}>
          {dateRange}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  text: {
    padding: Spacing.lg,
  },
  destination: {
    fontSize: Typography.fontSize.title1,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  dates: {
    fontSize: Typography.fontSize.subheadline,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
});
