import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Vacation, Expense } from '@/types';
import { calculateBudgetAnalysisAsync, formatCurrency, getBudgetStatusColor, BudgetAnalysis } from '@/lib/budget-calculations';
import { useColorScheme } from 'react-native';
import { useTranslation } from '@/lib/i18n';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getVacationGradient } from '@/lib/vacation-colors';

interface VacationBudgetHeaderProps {
  vacation: Vacation;
  expenses: Expense[];
}

export default function VacationBudgetHeader({ vacation, expenses }: VacationBudgetHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { defaultCurrency } = useCurrency();
  const [analysis, setAnalysis] = React.useState<BudgetAnalysis | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Display currency is always the user's default currency from settings
  const displayCurrency = defaultCurrency;

  React.useEffect(() => {
    const loadAnalysis = async () => {
      setLoading(true);
      // Calculate and display in user's default currency
      const result = await calculateBudgetAnalysisAsync(vacation, expenses, displayCurrency);
      setAnalysis(result);
      setLoading(false);
    };
    loadAnalysis();
  }, [vacation, expenses, displayCurrency]);

  if (loading || !analysis) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
        <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#007AFF'} />
      </View>
    );
  }

  const progress = analysis.budgetPercentageUsed / 100;
  const statusColor = getBudgetStatusColor(analysis.budgetPercentageUsed);

  return (
    <View style={styles.container}>
      {/* Hero Image Section with Gradient Overlay */}
      {vacation.imageUrl ? (
        <ImageBackground
          source={{ uri: `${vacation.imageUrl}?t=${vacation.updatedAt?.getTime?.() || Date.now()}` }}
          style={[styles.imageBackground, { height: 260 }]}
          imageStyle={styles.image}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 0)',
              'rgba(0, 0, 0, 0.2)',
              'rgba(0, 0, 0, 0.6)'
            ]}
            style={styles.gradientOverlay}
          >
            {/* Large Centered Amount */}
            <View style={styles.amountContainer}>
              <Text style={styles.spentAmount}>
                {formatCurrency(analysis.totalExpenses, displayCurrency)}
              </Text>
              <Text style={styles.budgetSubtext}>
                von {formatCurrency(analysis.totalBudget, displayCurrency)}
              </Text>
            </View>

            {/* Progress Bar with Green-Blue Gradient */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={['#34C759', '#007AFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${Math.min(progress * 100, 100)}%` }]}
                />
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={getVacationGradient(vacation)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.imageBackground, { height: 260 }]}
        >
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 0)',
              'rgba(0, 0, 0, 0.15)',
              'rgba(0, 0, 0, 0.4)'
            ]}
            style={styles.gradientOverlay}
          >
            {/* Large Centered Amount */}
            <View style={styles.amountContainer}>
              <Text style={styles.spentAmount}>
                {formatCurrency(analysis.totalExpenses, displayCurrency)}
              </Text>
              <Text style={styles.budgetSubtext}>
                von {formatCurrency(analysis.totalBudget, displayCurrency)}
              </Text>
            </View>

            {/* Progress Bar with Green-Blue Gradient */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={['#34C759', '#007AFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${Math.min(progress * 100, 100)}%` }]}
                />
              </View>
            </View>
          </LinearGradient>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  loadingContainer: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBackground: {
    width: '100%',
  },
  image: {
    borderRadius: 0,
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  amountContainer: {
    marginBottom: 20,
  },
  spentAmount: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'System',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  budgetSubtext: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginTop: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  progressBarContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
