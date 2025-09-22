import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header, Card } from '@/components/design';
import { FormInput, DatePicker } from '@/components/ui/forms';
import CategorySelector from '@/components/ui/CategorySelector';
import CurrencySelector from '@/components/ui/CurrencySelector';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useExpenses } from '@/lib/database';
import { Expense, ExpenseCategory } from '@/types';
import { currencyService } from '@/lib/currency';
import * as Haptics from 'expo-haptics';

export default function AddExpenseScreen() {
  const colorScheme = useColorScheme();
  const { vacationId } = useLocalSearchParams();
  const { saveExpense } = useExpenses(vacationId as string);

  const [formData, setFormData] = useState({
    amount: '',
    currency: 'CHF',
    description: '',
    category: 'food' as ExpenseCategory,
    date: new Date(),
  });

  const [chfAmount, setChfAmount] = useState<number | null>(null);
  const [converting, setConverting] = useState(false);

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
      Alert.alert('Fehler', 'Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    if (!vacationId || Array.isArray(vacationId)) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Fehler', 'Keine gültige Ferien-ID gefunden.');
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
      Alert.alert('Fehler', 'Ausgabe konnte nicht gespeichert werden.');
    }
  };

  const handleCancel = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const updateField = (field: string, value: string | Date | ExpenseCategory) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <Header
        title="Neue Ausgabe"
        leftButton={{
          title: "Abbrechen",
          onPress: handleCancel,
          variant: "outline"
        }}
        rightButton={{
          title: "Speichern",
          onPress: handleSave,
          variant: "primary"
        }}
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
          <Card style={styles.formCard}>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <FormInput
                  label="Betrag"
                  value={formData.amount}
                  onChangeText={(value) => updateField('amount', value)}
                  placeholder="52.50"
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
                  Umgerechnet in CHF:
                </Text>
                <Text style={[styles.conversionAmount, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                  {converting ? 'Umrechnung...' : `CHF ${chfAmount.toFixed(2)}`}
                </Text>
              </View>
            )}

            <FormInput
              label="Beschreibung"
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              placeholder="z.B. Flughafen Kiosk"
              required
            />

            <CategorySelector
              selectedCategory={formData.category}
              onSelect={(category) => updateField('category', category)}
            />

            <DatePicker
              label="Datum"
              value={formData.date}
              onChange={(date) => updateField('date', date)}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  formCard: {
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
});