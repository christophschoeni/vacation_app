import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Icon } from '@/components/design';
import { useColorScheme } from 'react-native';
import { useExpenses } from '@/lib/database';
import {
  getVacationGradient,
  getVacationTextColor,
  getVacationSecondaryTextColor,
  getVacationIconColor
} from '@/lib/vacation-colors';
import { formatDateRange, formatCurrencyCompact } from '@/lib/utils/formatters';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTranslation } from '@/lib/i18n';
import type { Vacation } from '@/types';

interface VacationCardProps {
  vacation: Vacation;
}

export default function VacationCard({ vacation }: VacationCardProps) {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { expenses } = useExpenses(vacation.id);
  const { defaultCurrency } = useCurrency();

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amountCHF, 0);
  const remainingBudget = vacation.budget ? vacation.budget - totalExpenses : 0;
  const budgetStatus = vacation.budget && remainingBudget < 0 ? 'over' : 'normal';

  // Gradient colors for this vacation
  const gradientColors = getVacationGradient(vacation);
  const textColor = getVacationTextColor(gradientColors);
  const secondaryTextColor = getVacationSecondaryTextColor(gradientColors);
  const iconColor = getVacationIconColor(gradientColors);

  const CardContent = () => (
    <>
      <View style={styles.cardHeader}>
        <View style={styles.destinationContainer}>
          <Text style={[styles.destination, { color: textColor }]}>
            {vacation.destination}
          </Text>
          <Text style={[styles.country, { color: secondaryTextColor }]}>
            {vacation.country}
          </Text>
        </View>
        <Text style={[styles.dates, { color: secondaryTextColor }]}>
          {formatDateRange(vacation.startDate, vacation.endDate)}
        </Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.hotelContainer}>
          <Icon name="hotel" size={16} color={iconColor} />
          <Text style={[styles.hotel, { color: textColor }]}>
            {vacation.hotel}
          </Text>
        </View>

        {vacation.budget && (
          <View style={styles.budgetContainer}>
            <Icon name="budget" size={16} color={iconColor} />
            <View style={styles.budgetInfo}>
              <Text style={[styles.budgetText, { color: textColor }]}>
                {formatCurrencyCompact(totalExpenses, defaultCurrency)} / {formatCurrencyCompact(vacation.budget, defaultCurrency)}
              </Text>
              <Text style={[
                styles.remainingText,
                {
                  color: budgetStatus === 'over'
                    ? '#FFB3B3' // Light red for over budget
                    : '#B3FFB3' // Light green for remaining budget
                }
              ]}>
                {budgetStatus === 'over' ? t('components.vacation_card.over_budget') : t('components.vacation_card.remaining')}{' '}
                {formatCurrencyCompact(Math.abs(remainingBudget), defaultCurrency)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </>
  );

  if (vacation.imageUrl) {
    return (
      <ImageBackground
        source={{ uri: vacation.imageUrl }}
        style={styles.gradientCard}
        imageStyle={styles.backgroundImage}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Ferien nach ${vacation.destination}, ${vacation.country}. ${formatDateRange(vacation.startDate, vacation.endDate)}. Hotel: ${vacation.hotel}${vacation.budget ? `. Budget: ${formatCurrencyCompact(totalExpenses, defaultCurrency)} von ${formatCurrencyCompact(vacation.budget, defaultCurrency)} ausgegeben. ${budgetStatus === 'over' ? `Überschreitung: ${formatCurrencyCompact(Math.abs(remainingBudget), defaultCurrency)}` : `Verbleibend: ${formatCurrencyCompact(remainingBudget, defaultCurrency)}`}` : ''}`}
        accessibilityHint="Doppeltippen zum Öffnen der Feriendetails"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.imageOverlay}
        >
          <CardContent />
        </LinearGradient>
      </ImageBackground>
    );
  }

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientCard}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Ferien nach ${vacation.destination}, ${vacation.country}. ${formatDateRange(vacation.startDate, vacation.endDate)}. Hotel: ${vacation.hotel}${vacation.budget ? `. Budget: ${formatCurrencyCompact(totalExpenses, defaultCurrency)} von ${formatCurrencyCompact(vacation.budget, defaultCurrency)} ausgegeben. ${budgetStatus === 'over' ? `Überschreitung: ${formatCurrencyCompact(Math.abs(remainingBudget), defaultCurrency)}` : `Verbleibend: ${formatCurrencyCompact(remainingBudget, defaultCurrency)}`}` : ''}`}
      accessibilityHint="Doppeltippen zum Öffnen der Feriendetails"
    >
      <CardContent />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientCard: {
    marginBottom: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  backgroundImage: {
    borderRadius: 16,
  },
  imageOverlay: {
    paddingVertical: 20,
    paddingHorizontal: 16,
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