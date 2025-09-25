import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header, Button } from '@/components/design';
import { FormInput, DatePicker } from '@/components/ui/forms';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useVacations } from '@/hooks/use-vacations';

export default function AddVacationScreen() {
  const colorScheme = useColorScheme();
  const { createVacation } = useVacations();
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
      await createVacation({
        destination: formData.destination,
        country: formData.country,
        hotel: formData.hotel,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        currency: formData.currency,
      });
      router.back();
    } catch (error) {
      console.error('Failed to create vacation:', error);
      Alert.alert('Fehler', 'Ferien konnten nicht gespeichert werden.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const updateField = (field: string, value: string | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }]} edges={['top']}>
      <Header
        title="Neue Ferien"
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
          <View style={styles.formContainer}>
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

            <View style={styles.buttonContainer}>
              <Button
                title="Speichern"
                variant="primary"
                onPress={handleSave}
                style={styles.button}
                fullWidth
              />
            </View>
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
  buttonContainer: {
    marginTop: 32,
    gap: 12,
  },
  button: {
    marginVertical: 0,
  },
});