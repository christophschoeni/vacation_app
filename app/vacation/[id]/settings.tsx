import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '@/components/design';

import { FormInput, DatePicker } from '@/components/ui/forms';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useVacations } from '@/hooks/use-vacations';

export default function VacationSettingsScreen() {
  const { id } = useLocalSearchParams();
  const vacationId = Array.isArray(id) ? id[0] : id;

  const colorScheme = useColorScheme();
  const { vacations, updateVacation, deleteVacation } = useVacations();

  const vacation = vacations.find(v => v.id === vacationId);

  const [formData, setFormData] = useState({
    destination: '',
    hotel: '',
    startDate: new Date(),
    endDate: new Date(),
    budget: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vacation) {
      setFormData({
        destination: vacation.destination,
        hotel: vacation.hotel,
        startDate: vacation.startDate,
        endDate: vacation.endDate,
        budget: vacation.budget.toString(),
      });
    }
  }, [vacation]);

  if (!vacation) {
    return null;
  }

  const updateField = (field: string, value: string | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.destination || !formData.hotel || !formData.budget) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    if (formData.startDate >= formData.endDate) {
      Alert.alert('Fehler', 'Das Enddatum muss nach dem Startdatum liegen.');
      return;
    }

    try {
      setLoading(true);
      await updateVacation(vacation.id, {
        destination: formData.destination,
        hotel: formData.hotel,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: parseFloat(formData.budget),
      });
      Alert.alert('Erfolg', 'Ferien erfolgreich aktualisiert!');
    } catch {
      Alert.alert('Fehler', 'Ferien konnten nicht aktualisiert werden.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Ferien löschen',
      `Möchten Sie die Ferien "${vacation.destination}" wirklich löschen? Alle zugehörigen Ausgaben und Checklisten werden ebenfalls gelöscht.`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVacation(vacation.id);
              router.push('/(tabs)');
            } catch {
              Alert.alert('Fehler', 'Ferien konnten nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#f5f5f5' }]}>
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
            <Card.Content>
              <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                Ferien bearbeiten
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

              <View style={styles.buttonContainer}>
                <Button
                  title="Speichern"
                  variant="primary"
                  onPress={handleSave}
                  loading={loading}
                  disabled={loading}
                  style={styles.saveButton}
                  fullWidth
                />

                <Button
                  title="Ferien löschen"
                  variant="destructive"
                  onPress={handleDelete}
                  style={styles.deleteButton}
                  fullWidth
                />
              </View>
            </Card.Content>
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
    paddingBottom: 85, // Reduced space for compact tab bar
  },
  formCard: {
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  saveButton: {
    marginBottom: 8,
  },
  deleteButton: {
    marginTop: 8,
  },
});