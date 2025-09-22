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

import AppHeader from '@/components/ui/layout/AppHeader';
import { FormInput, DatePicker } from '@/components/ui/forms';
import { GlassButton, GlassContainer } from '@/components/glass';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useExpenses } from '@/lib/database';
import { Expense, ExpenseCategory } from '@/types';

export default function AddExpenseScreen() {
  const colorScheme = useColorScheme();
  const { vacationId } = useLocalSearchParams();
  const { saveExpense } = useExpenses();

  const [formData, setFormData] = useState({
    amount: '',
    currency: 'CHF',
    description: '',
    category: 'food' as ExpenseCategory,
    date: new Date(),
  });

  const categories: { value: ExpenseCategory; label: string }[] = [
    { value: 'food', label: 'Essen' },
    { value: 'transport', label: 'Transport' },
    { value: 'accommodation', label: 'Unterkunft' },
    { value: 'entertainment', label: 'Unterhaltung' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'other', label: 'Sonstiges' },
  ];

  const handleSave = async () => {
    if (!formData.amount || !formData.description) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    if (!vacationId || Array.isArray(vacationId)) {
      Alert.alert('Fehler', 'Keine gültige Ferien-ID gefunden.');
      return;
    }

    try {
      const expense: Expense = {
        id: Date.now().toString(),
        vacationId: vacationId,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        amountCHF: parseFloat(formData.amount), // TODO: Add currency conversion
        category: formData.category,
        description: formData.description,
        date: formData.date,
        createdAt: new Date(),
      };

      await saveExpense(expense);

      Alert.alert(
        'Erfolg',
        'Ausgabe erfolgreich hinzugefügt!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Fehler', 'Ausgabe konnte nicht gespeichert werden.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const updateField = (field: string, value: string | Date | ExpenseCategory) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#f5f5f5' }]}>
      <AppHeader
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
          <GlassContainer intensity="light" style={styles.formCard}>
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
                <FormInput
                  label="Währung"
                  value={formData.currency}
                  onChangeText={(value) => updateField('currency', value)}
                  placeholder="CHF"
                />
              </View>
            </View>

            <FormInput
              label="Beschreibung"
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              placeholder="z.B. Flughafen Kiosk"
              required
            />

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E' }]}>
                Kategorie
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map((category) => (
                  <GlassButton
                    key={category.value}
                    title={category.label}
                    onPress={() => updateField('category', category.value)}
                    size="small"
                    variant={formData.category === category.value ? 'primary' : 'outline'}
                    style={styles.categoryButton}
                  />
                ))}
              </ScrollView>
            </View>

            <DatePicker
              label="Datum"
              value={formData.date}
              onChange={(date) => updateField('date', date)}
            />
          </GlassContainer>
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
  },
  formGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'System',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    marginRight: 8,
    paddingHorizontal: 16,
  },
});