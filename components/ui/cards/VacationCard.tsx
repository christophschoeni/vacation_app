import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Icon } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useExpenses } from '@/lib/database';
import type { Vacation } from '@/types';

interface VacationCardProps {
  vacation: Vacation;
  onPress: (id: string) => void;
  onLongPress?: (id: string) => void;
}

export default function VacationCard({ vacation, onPress, onLongPress }: VacationCardProps) {
  const colorScheme = useColorScheme();
  const { expenses } = useExpenses(vacation.id);

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short'
    };
    return `${startDate.toLocaleDateString('de-DE', options)} - ${endDate.toLocaleDateString('de-DE', options)}`;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amountCHF, 0);
  const remainingBudget = vacation.budget ? vacation.budget - totalExpenses : 0;
  const budgetStatus = vacation.budget && remainingBudget < 0 ? 'over' : 'normal';

  return (
    <TouchableOpacity
      onPress={() => onPress(vacation.id)}
      onLongPress={onLongPress ? () => onLongPress(vacation.id) : undefined}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Ferien nach ${vacation.destination}, ${vacation.country}. ${formatDateRange(vacation.startDate, vacation.endDate)}. Hotel: ${vacation.hotel}${vacation.budget ? `. Budget: ${formatCurrency(totalExpenses, vacation.currency)} von ${formatCurrency(vacation.budget, vacation.currency)} ausgegeben. ${budgetStatus === 'over' ? `Überschreitung: ${formatCurrency(Math.abs(remainingBudget), vacation.currency)}` : `Verbleibend: ${formatCurrency(remainingBudget, vacation.currency)}`}` : ''}`}
      accessibilityHint="Doppeltippen zum Öffnen der Feriendetails"
    >
      <Card variant="clean" style={styles.card}>
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

        {vacation.budget && (
          <View style={styles.budgetContainer}>
            <Icon name="budget" size={16} color={colorScheme === 'dark' ? '#8E8E93' : '#6D6D70'} />
            <View style={styles.budgetInfo}>
              <Text style={[styles.budgetText, { color: colorScheme === 'dark' ? '#D1D1D6' : '#48484A' }]}>
                {formatCurrency(totalExpenses, vacation.currency)} / {formatCurrency(vacation.budget, vacation.currency)}
              </Text>
              <Text style={[
                styles.remainingText,
                {
                  color: budgetStatus === 'over'
                    ? '#FF3B30'
                    : colorScheme === 'dark' ? '#34C759' : '#30D158'
                }
              ]}>
                {budgetStatus === 'over' ? 'Überschreitung: ' : 'Verbleibend: '}
                {formatCurrency(Math.abs(remainingBudget), vacation.currency)}
              </Text>
            </View>
          </View>
        )}
      </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16, // Clean spacing
    paddingVertical: 20,
    paddingHorizontal: 16, // Consistent padding for content
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
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 8,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  remainingText: {
    fontSize: 13,
    fontWeight: '600',
  },
});