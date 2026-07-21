import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/design';
import AppHeader from '@/components/ui/AppHeader';
import { FormInput, DatePicker } from '@/components/ui/forms';
import CategorySelector from '@/components/ui/CategorySelector';
import CurrencySelector from '@/components/ui/CurrencySelector';
import CurrencyCalculator from '@/components/ui/CurrencyCalculator';
import { useCreateExpense, useVacation } from '@/hooks/queries';
import { expenseRepository } from '@/lib/db/repositories/expense-repository';
import { ExpenseCategory } from '@/types';
import { currencyService } from '@/lib/currency';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTranslation } from '@/lib/i18n';
import { parseAmount } from '@/lib/utils/formatters';
import * as Haptics from 'expo-haptics';
import { notificationService } from '@/lib/services/notification-service';

export default function AddExpenseScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { vacationId } = useLocalSearchParams();
  const { mutateAsync: createExpense } = useCreateExpense();
  const { defaultCurrency } = useCurrency();
  const resolvedVacationId = Array.isArray(vacationId) ? undefined : vacationId;
  const { data: vacation } = useVacation(resolvedVacationId);
  const vacationCurrency = vacation?.currency ?? null;

  const [formData, setFormData] = useState({
    amount: '',
    currency: defaultCurrency || 'CHF', // Use system default, fallback to CHF
    description: '',
    category: 'food' as ExpenseCategory,
    date: new Date(),
  });

  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [converting, setConverting] = useState(false);
  // Guards against a double tap saving the same expense twice.
  const isSavingRef = React.useRef(false);
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);

  // Apply the vacation's currency as the form default, but only once per
  // vacation: re-applying it on every render would undo a manual selection.
  const appliedVacationCurrencyRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!vacationCurrency) return;
    if (appliedVacationCurrencyRef.current === vacationCurrency) return;
    appliedVacationCurrencyRef.current = vacationCurrency;
    setFormData(prev => ({ ...prev, currency: vacationCurrency }));
  }, [vacationCurrency]);

  // Update currency when defaultCurrency is loaded (only if no vacation currency)
  React.useEffect(() => {
    if (!vacationCurrency && defaultCurrency && formData.currency === 'CHF' && defaultCurrency !== 'CHF') {
      setFormData(prev => ({ ...prev, currency: defaultCurrency }));
    }
  }, [defaultCurrency, formData.currency, vacationCurrency]);

  // Convert to default currency whenever amount or currency changes
  React.useEffect(() => {
    // Guards against a slow earlier request overwriting a newer result.
    let cancelled = false;

    const convertAmount = async () => {
      const parsed = parseAmount(formData.amount);
      if (parsed === null || parsed <= 0) {
        setConvertedAmount(null);
        return;
      }

      if (formData.currency === defaultCurrency) {
        setConvertedAmount(parsed);
        return;
      }

      setConverting(true);
      try {
        const converted = await currencyService.convertCurrency(
          parsed,
          formData.currency,
          defaultCurrency
        );
        if (!cancelled) setConvertedAmount(converted);
      } catch {
        // Currency conversion failed - fallback to original amount
        if (!cancelled) setConvertedAmount(parsed);
      } finally {
        if (!cancelled) setConverting(false);
      }
    };

    convertAmount();
    return () => {
      cancelled = true;
    };
  }, [formData.amount, formData.currency, defaultCurrency]);


  const handleSave = async () => {
    if (!formData.amount || !formData.description) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('errors.required_field'));
      return;
    }

    // Reject non-numeric input before it reaches the database as NaN.
    const amount = parseAmount(formData.amount);
    if (amount === null || amount <= 0) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('errors.invalid_amount'));
      return;
    }

    if (!vacationId || Array.isArray(vacationId)) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('errors.not_found', { item: 'Vacation ID' }));
      return;
    }

    if (isSavingRef.current) return;
    isSavingRef.current = true;

    try {
      // ?? not ||: a legitimately converted 0 must not fall back to the
      // unconverted amount.
      const amountCHF = convertedAmount ?? amount;

      await createExpense({
        id: Date.now().toString(),
        vacationId: vacationId,
        amount: amount,
        currency: formData.currency,
        amountCHF,
        category: formData.category,
        description: formData.description,
        date: formData.date,
        createdAt: new Date(),
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Check budget and send notification if needed
      await checkBudgetAndNotify(vacationId, amountCHF);

      // Navigate back to vacation budget screen explicitly
      router.replace(`/vacation/${vacationId}`);
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('errors.generic'));
      // Only release on failure; on success the screen navigates away.
      isSavingRef.current = false;
    }
  };

  const handleCancel = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const updateField = (field: string, value: string | Date | ExpenseCategory) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const checkBudgetAndNotify = async (targetVacationId: string, expenseAmount: number) => {
    try {
      // The vacation is already in the query cache via useVacation above.
      if (!vacation || !vacation.budget) {
        return;
      }

      // Imperative one-shot read after saving: the freshly written total is not
      // part of any rendered data flow, so it is read straight from the
      // repository instead of going through a cached query.
      const totalSpent = await expenseRepository.getTotalSpent(targetVacationId);
      const percentageUsed = (totalSpent / vacation.budget) * 100;

      // Send notification if over budget
      if (totalSpent > vacation.budget) {
        await notificationService.sendBudgetAlert(
          vacation.destination,
          Math.round(percentageUsed),
          true
        );
      }
      // Send warning at 80% and 90%
      else if (percentageUsed >= 80 && percentageUsed < 100) {
        const previousTotal = totalSpent - expenseAmount;
        const previousPercentage = (previousTotal / vacation.budget) * 100;

        // Only send notification if we just crossed a threshold
        if ((percentageUsed >= 90 && previousPercentage < 90) ||
            (percentageUsed >= 80 && previousPercentage < 80)) {
          await notificationService.sendBudgetAlert(
            vacation.destination,
            Math.round(percentageUsed),
            false
          );
        }
      }
    } catch {
      // Failed to check budget and send notification - silent fail
    }
  };

  const handleCalculatorAmountChange = (amount: string, currency: string) => {
    setFormData(prev => ({
      ...prev,
      amount,
      currency,
    }));
  };

  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
      <AppHeader
        variant="modal"
        showBack={true}
        onBackPress={handleCancel}
        onRightPress={handleSave}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* iOS-style large title in content area */}
          <View style={styles.titleSection}>
            <Text style={[styles.largeTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
              {t('expense.add.title')}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <FormInput
                  label={t('expense.form.amount')}
                  value={formData.amount}
                  onChangeText={(value) => updateField('amount', value)}
                  placeholder={t('expense.form.amount_placeholder')}
                  keyboardType="numeric"
                  required
                />
              </View>
              <View style={styles.halfWidth}>
                <CurrencySelector
                  selectedCurrency={formData.currency}
                  onSelect={(currency) => updateField('currency', currency)}
                />
              </View>
            </View>

            {convertedAmount !== null && formData.currency !== defaultCurrency && (
              <View style={styles.conversionDisplay}>
                <Text style={[styles.conversionLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                  {t('expense.form.converted_amount')}:
                </Text>
                <Text style={[styles.conversionAmount, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                  {converting ? t('expense.form.converting') : `${defaultCurrency} ${convertedAmount.toFixed(2)}`}
                </Text>
              </View>
            )}

            {/* Calculator Button */}
            <TouchableOpacity
              style={[styles.calculatorButton, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsCalculatorVisible(true);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.calculatorButtonContent}>
                <Icon name="calculator" size={20} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                <Text style={[styles.calculatorButtonText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                  {t('expense.form.currency_calculator')}
                </Text>
                <Icon name="chevron-right" size={16} color={isDark ? '#8E8E93' : '#6D6D70'} />
              </View>
            </TouchableOpacity>

            {/* Calculator Modal */}
            <CurrencyCalculator
              visible={isCalculatorVisible}
              onClose={() => setIsCalculatorVisible(false)}
              fromCurrency={formData.currency}
              toCurrency={defaultCurrency}
              initialAmount={formData.amount}
              onAmountChange={handleCalculatorAmountChange}
            />

            <FormInput
              label={t('expense.form.description')}
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              placeholder={t('expense.form.description_placeholder')}
              required
            />

            <CategorySelector
              selectedCategory={formData.category}
              onSelect={(category) => updateField('category', category)}
            />

            <DatePicker
              label={t('expense.form.date')}
              value={formData.date}
              onChange={(date) => updateField('date', date)}
              mode="datetime"
            />

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'System',
    lineHeight: 41,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  conversionDisplay: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  conversionLabel: {
    fontSize: 14,
    fontFamily: 'System',
    marginBottom: 4,
  },
  conversionAmount: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  buttonContainer: {
    marginTop: 32,
    gap: 12,
  },
  button: {
    marginVertical: 0,
  },
  calculatorButton: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  calculatorButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calculatorButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
    flex: 1,
    marginLeft: 12,
  },
});