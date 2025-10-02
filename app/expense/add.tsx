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

import { Button, Icon } from '@/components/design';
import AppHeader from '@/components/ui/AppHeader';
import { FormInput, DatePicker } from '@/components/ui/forms';
import CategorySelector from '@/components/ui/CategorySelector';
import CurrencySelector from '@/components/ui/CurrencySelector';
import CurrencyCalculator from '@/components/ui/CurrencyCalculator';
import { useExpenses } from '@/lib/database';
import { Expense, ExpenseCategory } from '@/types';
import { currencyService } from '@/lib/currency';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTranslation } from '@/lib/i18n';
import * as Haptics from 'expo-haptics';

export default function AddExpenseScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { vacationId } = useLocalSearchParams();
  const { saveExpense } = useExpenses(vacationId as string);
  const { defaultCurrency } = useCurrency();

  const [formData, setFormData] = useState({
    amount: '',
    currency: defaultCurrency || 'CHF', // Use system default, fallback to CHF
    description: '',
    category: 'food' as ExpenseCategory,
    date: new Date(),
  });

  const [chfAmount, setChfAmount] = useState<number | null>(null);
  const [converting, setConverting] = useState(false);
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);

  // Update currency when defaultCurrency is loaded
  React.useEffect(() => {
    if (defaultCurrency && formData.currency === 'CHF' && defaultCurrency !== 'CHF') {
      setFormData(prev => ({ ...prev, currency: defaultCurrency }));
    }
  }, [defaultCurrency, formData.currency]);

  // Convert to CHF whenever amount or currency changes
  React.useEffect(() => {
    const convertAmount = async () => {
      if (!formData.amount || !parseFloat(formData.amount)) {
        setChfAmount(null);
        return;
      }

      if (formData.currency === 'CHF') {
        setChfAmount(parseFloat(formData.amount));
        return;
      }

      setConverting(true);
      try {
        const converted = await currencyService.convertToCHF(
          parseFloat(formData.amount),
          formData.currency
        );
        setChfAmount(converted);
      } catch (error) {
        console.warn('Currency conversion failed:', error);
        setChfAmount(parseFloat(formData.amount)); // Fallback to original amount
      } finally {
        setConverting(false);
      }
    };

    convertAmount();
  }, [formData.amount, formData.currency]);


  const handleSave = async () => {
    if (!formData.amount || !formData.description) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('errors.required_field'));
      return;
    }

    if (!vacationId || Array.isArray(vacationId)) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('errors.not_found', { item: 'Vacation ID' }));
      return;
    }

    try {
      const expense: Expense = {
        id: Date.now().toString(),
        vacationId: vacationId,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        amountCHF: chfAmount || parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
        createdAt: new Date(),
      };

      await saveExpense(expense);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('errors.generic'));
    }
  };

  const handleCancel = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top']}>
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

            {chfAmount !== null && formData.currency !== 'CHF' && (
              <View style={styles.conversionDisplay}>
                <Text style={[styles.conversionLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                  {t('expense.form.converted_amount')}:
                </Text>
                <Text style={[styles.conversionAmount, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                  {converting ? t('expense.form.converting') : `CHF ${chfAmount.toFixed(2)}`}
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
              toCurrency="CHF"
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