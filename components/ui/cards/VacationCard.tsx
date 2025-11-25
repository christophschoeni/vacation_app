import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Icon } from '@/components/design';
import { useColorScheme } from 'react-native';
import { useExpenses } from '@/lib/database';
import {
  getVacationGradient,
  getVacationTextColor,
  getVacationSecondaryTextColor,
  getVacationIconColor
} from '@/lib/vacation-colors';
import { formatDateRange, formatCurrencyCompact } from '@/lib/utils/formatters';
import { useTranslation } from '@/lib/i18n';
import { currencyService } from '@/lib/currency';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { Vacation } from '@/types';

interface VacationCardProps {
  vacation: Vacation;
}

export default function VacationCard({ vacation }: VacationCardProps) {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { expenses } = useExpenses(vacation.id);
  const { defaultCurrency } = useCurrency();
  const [totalExpenses, setTotalExpenses] = React.useState(0);

  // Display currency is always the user's default currency from settings
  // Budget is displayed as-is (no conversion) - the numeric value stays the same
  const displayCurrency = defaultCurrency;
  const vacationBudget = vacation.budget || 0;

  // Calculate total expenses - convert each expense to user's display currency
  React.useEffect(() => {
    let cancelled = false;

    async function calculateTotals() {
      // Convert all expenses to the user's display currency
      let total = 0;
      for (const expense of expenses) {
        const converted = await currencyService.convertCurrency(
          expense.amount,
          expense.currency,
          displayCurrency  // Convert to user's default currency
        );
        total += converted;
      }

      if (!cancelled) {
        setTotalExpenses(total);
      }
    }

    calculateTotals();

    return () => {
      cancelled = true;
    };
  }, [expenses, displayCurrency]);

  // Budget is NOT converted - it's displayed as-is in the user's default currency
  const remainingBudget = vacationBudget - totalExpenses;
  const budgetStatus = vacationBudget && remainingBudget < 0 ? 'over' : 'normal';

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
                {formatCurrencyCompact(totalExpenses, displayCurrency)} / {formatCurrencyCompact(vacationBudget, displayCurrency)}
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
                {formatCurrencyCompact(Math.abs(remainingBudget), displayCurrency)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </>
  );

  if (vacation.imageUrl) {
    return (
      <View
        style={styles.imageCard}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Reise nach ${vacation.destination}, ${vacation.country}. ${formatDateRange(vacation.startDate, vacation.endDate)}. Hotel: ${vacation.hotel}${vacation.budget ? `. Budget: ${formatCurrencyCompact(totalExpenses, displayCurrency)} von ${formatCurrencyCompact(vacationBudget, displayCurrency)} ausgegeben. ${budgetStatus === 'over' ? `Überschreitung: ${formatCurrencyCompact(Math.abs(remainingBudget), displayCurrency)}` : `Verbleibend: ${formatCurrencyCompact(remainingBudget, displayCurrency)}`}` : ''}`}
        accessibilityHint="Doppeltippen zum Öffnen der Reisedetails"
      >
        <ImageBackground
          source={{ uri: `${vacation.imageUrl}?t=${vacation.updatedAt?.getTime?.() || Date.now()}` }}
          style={styles.imageBackground}
          imageStyle={styles.backgroundImage}
        />

        <LinearGradient
          colors={['transparent', 'transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.5)']}
          locations={[0, 0.5, 0.75, 1]}
          style={styles.gradientOverlay}
        />

        <BlurView intensity={60} tint="dark" style={styles.infoContainer}>
          <View style={styles.infoContent}>
            <View style={styles.headerRow}>
              <View style={styles.destinationInfo}>
                <Text style={styles.imageDestination}>
                  {vacation.destination}
                </Text>
                <Text style={styles.imageCountry}>
                  {vacation.country}
                </Text>
              </View>
              <Text style={styles.imageDates}>
                {formatDateRange(vacation.startDate, vacation.endDate)}
              </Text>
            </View>

            {vacation.budget && (
              <View style={styles.budgetRow}>
                <View style={styles.budgetItem}>
                  <Icon name="budget" size={14} color="#FFFFFF" />
                  <Text style={styles.budgetLabel}>
                    {formatCurrencyCompact(totalExpenses, displayCurrency)} / {formatCurrencyCompact(vacationBudget, displayCurrency)}
                  </Text>
                </View>
                <Text style={[
                  styles.budgetBadge,
                  { backgroundColor: budgetStatus === 'over' ? 'rgba(255, 69, 58, 0.8)' : 'rgba(52, 199, 89, 0.8)' }
                ]}>
                  {budgetStatus === 'over' ? '-' : '+'}{formatCurrencyCompact(Math.abs(remainingBudget), displayCurrency)}
                </Text>
              </View>
            )}
          </View>
        </BlurView>
      </View>
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
      accessibilityLabel={`Reise nach ${vacation.destination}, ${vacation.country}. ${formatDateRange(vacation.startDate, vacation.endDate)}. Hotel: ${vacation.hotel}${vacation.budget ? `. Budget: ${formatCurrencyCompact(totalExpenses, displayCurrency)} von ${formatCurrencyCompact(vacationBudget, displayCurrency)} ausgegeben. ${budgetStatus === 'over' ? `Überschreitung: ${formatCurrencyCompact(Math.abs(remainingBudget), displayCurrency)}` : `Verbleibend: ${formatCurrencyCompact(remainingBudget, displayCurrency)}`}` : ''}`}
      accessibilityHint="Doppeltippen zum Öffnen der Reisedetails"
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
  imageCard: {
    marginBottom: 16,
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  imageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    borderRadius: 20,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  infoContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  destinationInfo: {
    flex: 1,
  },
  imageDestination: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: 'System',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  imageCountry: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'System',
  },
  imageDates: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: 'System',
    textAlign: 'right',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  budgetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  budgetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  budgetBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'System',
    overflow: 'hidden',
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