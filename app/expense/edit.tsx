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
import { useExpense, useUpdateExpense } from '@/hooks/queries';
import { ExpenseCategory } from '@/types';
import type { UpdateExpenseInput } from '@/lib/db/repositories/expense-repository';
import { currencyService } from '@/lib/currency';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTranslation } from '@/lib/i18n';
import { parseAmount } from '@/lib/utils/formatters';
import { logger } from '@/lib/utils/logger';
import * as Haptics from 'expo-haptics';

export default function EditExpenseScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { expenseId, vacationId } = useLocalSearchParams();
  const expenseIdParam = Array.isArray(expenseId) ? expenseId[0] : expenseId;
  const { data: expenseData, isLoading: isExpenseLoading } = useExpense(expenseIdParam);
  const { mutateAsync: updateExpense } = useUpdateExpense();
  const { defaultCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    amount: '',
    currency: defaultCurrency || 'CHF',
    description: '',
    category: 'food' as ExpenseCategory,
    date: new Date(),
  });

  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [converting, setConverting] = useState(false);
  // Guards against a double tap saving the same expense twice.
  const isSavingRef = React.useRef(false);
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);

  // Seed the form once the expense has been fetched.
  React.useEffect(() => {
    if (!expenseIdParam || isExpenseLoading) return;

    if (expenseData) {
      setFormData({
        amount: expenseData.amount.toString(),
        currency: expenseData.currency,
        description: expenseData.description,
        category: expenseData.category,
        date: expenseData.date,
      });
      setConvertedAmount(expenseData.amountCHF);
      setLoading(false);
    } else {
      // Fetch finished but no such expense.
      setLoading(false);
      Alert.alert(t('common.error'), t('errors.not_found', { item: 'Expense' }));
    }
  }, [expenseIdParam, expenseData, isExpenseLoading, t]);

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
      } catch (error) {
        logger.warn('Currency conversion failed:', error);
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

    if (!expenseId || Array.isArray(expenseId)) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('errors.not_found', { item: 'Expense ID' }));
      return;
    }

    // Reject non-numeric input before it reaches the database as NaN.
    const amount = parseAmount(formData.amount);
    if (amount === null || amount <= 0) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('errors.invalid_amount'));
      return;
    }

    if (isSavingRef.current) return;
    isSavingRef.current = true;

    try {
      const updatedExpense: UpdateExpenseInput = {
        amount: amount,
        currency: formData.currency,
        // ?? not ||: a legitimately converted 0 must not fall back to the
        // unconverted amount.
        amountCHF: convertedAmount ?? amount,
        category: formData.category,
        description: formData.description,
        date: formData.date,
      };

      // Debug logging (only in development)
      if (__DEV__) {
        console.log('=== Expense Edit Debug ===');
        console.log('Edit - expenseId:', expenseId);
        console.log('Edit - vacationId from params:', vacationId);
        console.log('=========================');
      }

      await updateExpense({ id: expenseId as string, data: updatedExpense });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate back to vacation budget screen explicitly
      if (vacationId && !Array.isArray(vacationId)) {
        router.replace(`/vacation/${vacationId}`);
      } else {
        router.back();
      }
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('errors.generic'));
      // Only release on failure; on success the screen navigates away.
      isSavingRef.current = false;
    }
  };

  const handleCancel = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Navigate back to vacation budget screen explicitly
    if (vacationId && !Array.isArray(vacationId)) {
      router.replace(`/vacation/${vacationId}`);
    } else {
      router.back();
    }
  };

  const updateField = (field: string, value: string | Date | ExpenseCategory) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculatorAmountChange = (amount: string, currency: string) => {
    setFormData(prev => ({
      ...prev,
      amount,
      currency,
    }));
  };

  const isDark = colorScheme === 'dark';

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
        <AppHeader
          variant="modal"
          showBack={true}
          onBackPress={handleCancel}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: isDark ? '#FFFFFF' : '#1C1C1E' }}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
              {t('expense.edit.title')}
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
