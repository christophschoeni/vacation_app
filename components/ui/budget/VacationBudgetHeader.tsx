import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Vacation, Expense } from '@/types';
import { calculateBudgetAnalysisAsync, formatCurrency, getBudgetStatusColor, BudgetAnalysis } from '@/lib/budget-calculations';
import { useColorScheme } from 'react-native';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTranslation } from '@/lib/i18n';

interface VacationBudgetHeaderProps {
  vacation: Vacation;
  expenses: Expense[];
}

export default function VacationBudgetHeader({ vacation, expenses }: VacationBudgetHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const { defaultCurrency } = useCurrency();
  const insets = useSafeAreaInsets();
  const [analysis, setAnalysis] = React.useState<BudgetAnalysis | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadAnalysis = async () => {
      setLoading(true);
      const result = await calculateBudgetAnalysisAsync(vacation, expenses, defaultCurrency);
      setAnalysis(result);
      setLoading(false);
    };
    loadAnalysis();
  }, [vacation, expenses, defaultCurrency]);

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
          source={{ uri: vacation.imageUrl }}
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
                {formatCurrency(analysis.totalExpenses, defaultCurrency)}
              </Text>
              <Text style={styles.budgetSubtext}>
                von {formatCurrency(analysis.totalBudget, defaultCurrency)}
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
        <View style={[styles.imageBackground, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', height: 260 }]}>
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
                {formatCurrency(analysis.totalExpenses, defaultCurrency)}
              </Text>
              <Text style={styles.budgetSubtext}>
                von {formatCurrency(analysis.totalBudget, defaultCurrency)}
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
        </View>
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
