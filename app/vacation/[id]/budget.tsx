import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Icon } from '@/components/design';
import { useTranslation } from '@/lib/i18n';
import { useVacationId } from '@/contexts/VacationContext';
import { useVacations } from '@/hooks/use-vacations';
import { useExpenses } from '@/lib/database';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/lib/utils/formatters';

export default function BudgetDetailScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const vacationId = useVacationId();
  const { vacations } = useVacations();
  const { expenses } = useExpenses(vacationId);
  const { defaultCurrency } = useCurrency();

  const vacation = vacations.find(v => v.id === vacationId);

  if (!vacation) {
    return null;
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amountCHF, 0);
  const remainingBudget = vacation.budget ? vacation.budget - totalExpenses : 0;
  const budgetUsedPercentage = vacation.budget ? (totalExpenses / vacation.budget) * 100 : 0;
  const isOverBudget = remainingBudget < 0;

  // Mock category breakdown
  const categoryBreakdown = [
    { category: 'Transport', amount: totalExpenses * 0.35, icon: 'airplane', color: '#007AFF' },
    { category: 'Unterkunft', amount: totalExpenses * 0.40, icon: 'hotel', color: '#34C759' },
    { category: 'Essen', amount: totalExpenses * 0.15, icon: 'utensils', color: '#FF9500' },
    { category: 'Unterhaltung', amount: totalExpenses * 0.10, icon: 'ticket', color: '#FF3B30' },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Image */}
        {vacation.imageUrl ? (
          <View style={styles.imageHeader}>
            <ImageBackground
              source={{ uri: vacation.imageUrl }}
              style={styles.headerImage}
              imageStyle={styles.headerImageStyle}
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.imageGradient}
              >
                <BlurView intensity={40} tint="dark" style={styles.headerInfo}>
                  <Text style={styles.headerTitle}>{vacation.destination}</Text>
                  <Text style={styles.headerSubtitle}>{vacation.country}</Text>
                </BlurView>
              </LinearGradient>
            </ImageBackground>
          </View>
        ) : (
          <View style={styles.headerNoImageContainer}>
            <View style={[styles.headerNoImage, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                {vacation.destination}
              </Text>
              <Text style={[styles.headerSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                {vacation.country}
              </Text>
            </View>
          </View>
        )}

        {/* Budget Overview Card */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Budget Übersicht
          </Text>

          <View style={[styles.budgetCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            {/* Main Budget Display */}
            <View style={styles.budgetMain}>
              <View style={styles.budgetColumn}>
                <Text style={[styles.budgetLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                  Ausgegeben
                </Text>
                <Text style={[styles.budgetAmount, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                  {formatCurrency(totalExpenses, defaultCurrency)}
                </Text>
              </View>

              <View style={styles.budgetDivider} />

              <View style={styles.budgetColumn}>
                <Text style={[styles.budgetLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                  {isOverBudget ? 'Überschritten' : 'Verbleibend'}
                </Text>
                <Text style={[
                  styles.budgetAmount,
                  { color: isOverBudget ? '#FF3B30' : '#34C759' }
                ]}>
                  {formatCurrency(Math.abs(remainingBudget), defaultCurrency)}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBackground, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(budgetUsedPercentage, 100)}%`,
                      backgroundColor: isOverBudget ? '#FF3B30' : '#34C759'
                    }
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                {budgetUsedPercentage.toFixed(0)}% verwendet
              </Text>
            </View>

            {/* Total Budget */}
            <View style={[styles.totalBudgetRow, { borderTopColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
              <Text style={[styles.totalLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                Gesamtbudget
              </Text>
              <Text style={[styles.totalAmount, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                {formatCurrency(vacation.budget || 0, defaultCurrency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Ausgaben nach Kategorie
          </Text>

          {categoryBreakdown.map((item, index) => (
            <View
              key={index}
              style={[
                styles.categoryCard,
                { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
              ]}
            >
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryIcon, { backgroundColor: `${item.color}20` }]}>
                  <Icon name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={[styles.categoryName, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                  {item.category}
                </Text>
              </View>

              <View style={styles.categoryRight}>
                <Text style={[styles.categoryAmount, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                  {formatCurrency(item.amount, defaultCurrency)}
                </Text>
                <Text style={[styles.categoryPercentage, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                  {((item.amount / totalExpenses) * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Statistiken
          </Text>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <Icon name="receipt" size={24} color="#007AFF" />
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                {expenses.length}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                Ausgaben
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <Icon name="trending-up" size={24} color="#34C759" />
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                {formatCurrency(totalExpenses / (expenses.length || 1), defaultCurrency)}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                Durchschnitt
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageHeader: {
    height: 220,
    marginBottom: 24,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerImageStyle: {
    resizeMode: 'cover',
  },
  imageGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerInfo: {
    padding: 20,
    overflow: 'hidden',
  },
  headerNoImageContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerNoImage: {
    padding: 24,
    marginBottom: 24,
    borderRadius: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'System',
  },
  headerSubtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'System',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'System',
  },
  budgetCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  budgetMain: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  budgetColumn: {
    flex: 1,
    alignItems: 'center',
  },
  budgetDivider: {
    width: 1,
    backgroundColor: '#3A3A3C',
    marginHorizontal: 16,
  },
  budgetLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: 'System',
  },
  budgetAmount: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'System',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'System',
  },
  totalBudgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'System',
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'System',
  },
  categoryPercentage: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'System',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
    fontFamily: 'System',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'System',
  },
});
