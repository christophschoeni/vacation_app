import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header, Icon } from '@/components/design';
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
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E' }]}>
          Neue Ferien
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
          accessible={true}
          accessibilityLabel="Ferien speichern"
          accessibilityRole="button"
        >
          <Icon name="check" size={28} color={colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E'} />
        </TouchableOpacity>
      </View>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(60, 60, 67, 0.12)',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'System',
  },
  saveButton: {
    padding: 8,
    borderRadius: 8,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
});