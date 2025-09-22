import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/design';
import { Vacation, Expense } from '@/types';
import { calculateBudgetAnalysis, formatCurrency, getBudgetStatusColor, getBudgetStatusText } from '@/lib/budget-calculations';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { spacing } from '@/constants/spacing';

interface BudgetOverviewProps {
  vacation: Vacation;
  expenses: Expense[];
}

interface ProgressBarProps {
  progress: number;
  color: string;
  style?: any;
}

function ProgressBar({ progress, color, style }: ProgressBarProps) {
  return (
    <View style={[{ height: 8, backgroundColor: 'rgba(142, 142, 147, 0.3)', borderRadius: 4 }, style]}>
      <View
        style={{
          height: '100%',
          width: `${Math.min(progress * 100, 100)}%`,
          backgroundColor: color,
          borderRadius: 4
        }}
      />
    </View>
  );
}

export default function BudgetOverview({ vacation, expenses }: BudgetOverviewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const analysis = calculateBudgetAnalysis(vacation, expenses);

  const progressColor = getBudgetStatusColor(analysis.status);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Budget Übersicht
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: progressColor }]}>
            <Text style={styles.statusText}>
              {getBudgetStatusText(analysis.status)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <ProgressBar
            progress={Math.min(analysis.budgetPercentageUsed / 100, 1)}
            color={progressColor}
            style={styles.progressBar}
          />
          <Text style={[styles.progressText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            {analysis.budgetPercentageUsed.toFixed(1)}% verwendet
          </Text>
        </View>

        {/* Budget Rows */}
        <View style={styles.budgetSection}>
          <BudgetRow
            label="Gesamtbudget"
            amount={formatCurrency(analysis.totalBudget)}
            color={isDark ? '#FFFFFF' : '#1C1C1E'}
          />
          <BudgetRow
            label="Ausgegeben"
            amount={formatCurrency(analysis.totalExpenses)}
            color={analysis.isOverBudget ? '#F44336' : (isDark ? '#FFFFFF' : '#1C1C1E')}
          />
          <BudgetRow
            label="Verbleibt"
            amount={formatCurrency(analysis.remainingBudget)}
            color={analysis.remainingBudget < 0 ? '#F44336' : '#00C853'}
          />
        </View>

        {/* Daily Analysis */}
        {analysis.status !== 'future-trip' && (
          <View style={styles.dailySection}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
              Tägliche Analyse
            </Text>

            <BudgetRow
              label="Budget pro Tag"
              amount={formatCurrency(analysis.budgetPerDay)}
              color={isDark ? '#8E8E93' : '#6D6D70'}
            />

            {analysis.elapsedDays > 0 && (
              <BudgetRow
                label={`Ø Ausgaben/Tag (${analysis.elapsedDays} Tage)`}
                amount={formatCurrency(analysis.averageSpentPerDay)}
                color={isDark ? '#8E8E93' : '#6D6D70'}
              />
            )}

            {analysis.remainingDays > 0 && (
              <BudgetRow
                label={`Verfügbar/Tag (${analysis.remainingDays} Tage)`}
                amount={formatCurrency(analysis.remainingBudgetPerDay)}
                color={analysis.remainingBudgetPerDay > analysis.budgetPerDay ? '#00C853' : '#F44336'}
              />
            )}
          </View>
        )}

        {/* Projection */}
        {analysis.status !== 'future-trip' && analysis.elapsedDays > 0 && (
          <View style={styles.projectionSection}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
              Prognose
            </Text>
            <BudgetRow
              label="Geschätzte Gesamtausgaben"
              amount={formatCurrency(analysis.projectedTotalSpend)}
              color={isDark ? '#8E8E93' : '#6D6D70'}
            />
            <BudgetRow
              label={analysis.projectedOverOrUnder >= 0 ? 'Voraussichtlich gespart' : 'Voraussichtlich überzogen'}
              amount={formatCurrency(Math.abs(analysis.projectedOverOrUnder))}
              color={analysis.projectedOverOrUnder >= 0 ? '#00C853' : '#F44336'}
            />
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

interface BudgetRowProps {
  label: string;
  amount: string;
  color: string;
}

function BudgetRow({ label, amount, color }: BudgetRowProps) {
  return (
    <View style={styles.budgetRow}>
      <Text style={[styles.budgetLabel, { color }]}>{label}</Text>
      <Text style={[styles.budgetAmount, { color }]}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: spacing.sm,
    borderRadius: spacing.xs,
    marginBottom: spacing.sm,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'System',
  },
  budgetSection: {
    marginBottom: spacing.md,
  },
  dailySection: {
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(142, 142, 147, 0.3)',
  },
  projectionSection: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(142, 142, 147, 0.3)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
    fontFamily: 'System',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  budgetLabel: {
    fontSize: 16,
    fontFamily: 'System',
    flex: 1,
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});