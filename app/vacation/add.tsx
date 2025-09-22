import React, { useState } from 'react';
import {
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '@/components/ui/layout/AppHeader';
import { FormInput, DatePicker } from '@/components/ui/forms';
import { GlassContainer } from '@/components/glass';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useVacations } from '@/lib/database';
import { Vacation } from '@/types';

export default function AddVacationScreen() {
  const colorScheme = useColorScheme();
  const { saveVacation } = useVacations();
  const [formData, setFormData] = useState({
    destination: '',
    country: '',
    hotel: '',
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    budget: '',
    currency: 'CHF',
  });

  const handleSave = async () => {
    if (!formData.destination || !formData.country || !formData.hotel) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    try {
      const vacation: Vacation = {
        id: Date.now().toString(), // Simple ID generation
        destination: formData.destination,
        country: formData.country,
        hotel: formData.hotel,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        currency: formData.currency,
        expenses: [],
        checklists: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await saveVacation(vacation);

      Alert.alert(
        'Erfolg',
        'Ferien erfolgreich erstellt!',
        [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
      );
    } catch (error) {
      Alert.alert('Fehler', 'Ferien konnten nicht gespeichert werden.');
    }
  };

  const handleCancel = () => {
    router.push('/(tabs)');
  };

  const updateField = (field: string, value: string | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#f5f5f5' }]}>
      <AppHeader
        title="Neue Ferien"
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
            <FormInput
              label="Reiseziel"
              value={formData.destination}
              onChangeText={(value) => updateField('destination', value)}
              placeholder="z.B. Antalya"
              required
            />

            <FormInput
              label="Land"
              value={formData.country}
              onChangeText={(value) => updateField('country', value)}
              placeholder="z.B. Türkei"
              required
            />

            <FormInput
              label="Hotel"
              value={formData.hotel}
              onChangeText={(value) => updateField('hotel', value)}
              placeholder="z.B. Akka Beach Resort"
              required
            />

            <DatePicker
              label="Startdatum"
              value={formData.startDate}
              onChange={(date) => updateField('startDate', date)}
            />

            <DatePicker
              label="Enddatum"
              value={formData.endDate}
              onChange={(date) => updateField('endDate', date)}
            />

            <FormInput
              label="Budget"
              value={formData.budget}
              onChangeText={(value) => updateField('budget', value)}
              placeholder="2500"
              keyboardType="numeric"
            />

            <FormInput
              label="Währung"
              value={formData.currency}
              onChangeText={(value) => updateField('currency', value)}
              placeholder="CHF"
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
});