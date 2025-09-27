import { Button } from '@/components/design';
import { router } from 'expo-router';
import { useRouteParam } from '@/hooks/use-route-param';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DatePicker, FormInput } from '@/components/ui/forms';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useVacations } from '@/hooks/use-vacations';
import { logger } from '@/lib/utils/logger';

export default function VacationEditScreen() {
  const vacationId = useRouteParam('id');

  // Fallback: If no vacationId, go back to settings
  if (!vacationId || vacationId === 'undefined') {
    logger.warn('No valid vacationId, redirecting back');
    router.back();
    return null;
  }

  const colorScheme = useColorScheme();
  const { vacations, updateVacation, loading } = useVacations();

  const vacation = vacations.find(v => v.id === vacationId);
  const isDark = colorScheme === 'dark';

  logger.debug('Edit Screen Debug:', {
    vacationId,
    vacationsCount: vacations.length,
    vacation: vacation ? `Found: ${vacation.destination}` : 'Not found',
    loading
  });

  const [formData, setFormData] = useState(() => {
    if (vacation) {
      return {
        destination: vacation.destination,
        hotel: vacation.hotel,
        startDate: vacation.startDate,
        endDate: vacation.endDate,
        budget: vacation.budget.toString(),
      };
    }
    return {
      destination: '',
      hotel: '',
      startDate: new Date(),
      endDate: new Date(),
      budget: '',
    };
  });

  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (vacation) {
      logger.debug('Loading vacation data:', vacation);
      setFormData({
        destination: vacation.destination,
        hotel: vacation.hotel,
        startDate: vacation.startDate,
        endDate: vacation.endDate,
        budget: vacation.budget.toString(),
      });
    }
  }, [vacation]);


  // Show loading state while vacations are being loaded
  if (loading && !vacation) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#FFFFFF' }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Lade Ferien...
          </Text>
        </View>
      </View>
    );
  }

  // Continue showing form even if vacation is not found yet
  // The form will update when vacation data is loaded

  const updateField = (field: string, value: string | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!vacation) {
      Alert.alert('Fehler', 'Ferien nicht gefunden.');
      return;
    }

    if (!formData.destination || !formData.hotel || !formData.budget) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    if (formData.startDate >= formData.endDate) {
      Alert.alert('Fehler', 'Das Enddatum muss nach dem Startdatum liegen.');
      return;
    }

    try {
      setFormLoading(true);
      const updatedVacation = await updateVacation(vacation.id, {
        destination: formData.destination,
        hotel: formData.hotel,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: parseFloat(formData.budget),
      });

      if (updatedVacation) {
        Alert.alert('Erfolg', 'Ferien erfolgreich aktualisiert!', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to settings tab, maintaining tab navigation state
              router.back();
            }
          }
        ]);
      } else {
        Alert.alert('Fehler', 'Ferien konnten nicht aktualisiert werden.');
      }
    } catch {
      Alert.alert('Fehler', 'Ferien konnten nicht aktualisiert werden.');
    } finally {
      setFormLoading(false);
    }
  };


  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>

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
            <Text style={[styles.subtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              Ändern Sie hier die Details Ihrer Ferien
            </Text>

            <FormInput
              label="Reiseziel"
              value={formData.destination}
              onChangeText={(value) => updateField('destination', value)}
              placeholder="z.B. Spanien"
              required
            />

            <FormInput
              label="Hotel"
              value={formData.hotel}
              onChangeText={(value) => updateField('hotel', value)}
              placeholder="z.B. Hotel Paradiso"
              required
            />

            <DatePicker
              label="Startdatum"
              value={formData.startDate}
              onChange={(date) => updateField('startDate', date)}
              required
            />

            <DatePicker
              label="Enddatum"
              value={formData.endDate}
              onChange={(date) => updateField('endDate', date)}
              required
            />

            <FormInput
              label="Budget (CHF)"
              value={formData.budget}
              onChangeText={(value) => updateField('budget', value)}
              placeholder="z.B. 2500"
              keyboardType="numeric"
              required
            />

            <Button
              title="Speichern"
              variant="primary"
              onPress={handleSave}
              style={styles.saveButton}
              fullWidth
              loading={formLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'System',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'System',
    lineHeight: 20,
    marginBottom: 20,
  },
  saveButton: {
    marginTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'System',
    textAlign: 'center',
  },
});