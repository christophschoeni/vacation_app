import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassButton, GlassContainer } from '@/components/glass';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AddExpenseScreen() {
  const colorScheme = useColorScheme();
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'CHF',
    description: '',
    category: 'food',
    date: new Date().toLocaleDateString('de-DE'),
  });

  const categories = [
    { value: 'food', label: 'Essen' },
    { value: 'transport', label: 'Transport' },
    { value: 'accommodation', label: 'Unterkunft' },
    { value: 'activities', label: 'Aktivitäten' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'other', label: 'Sonstiges' },
  ];

  const handleSave = () => {
    if (!formData.amount || !formData.description) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    // TODO: Implement actual save logic
    console.log('Saving expense:', formData);
    Alert.alert(
      'Erfolg',
      'Ausgabe erfolgreich hinzugefügt!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleCancel = () => {
    router.back();
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#f5f5f5' }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={colorScheme === 'dark'
          ? ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)']
          : ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)']
        }
        style={styles.header}
      >
        <GlassContainer intensity="light" style={styles.headerContent}>
          <View style={styles.headerTop}>
            <GlassButton
              title="Abbrechen"
              onPress={handleCancel}
              size="small"
              variant="outline"
              style={styles.cancelButton}
            />
            <GlassButton
              title="Speichern"
              onPress={handleSave}
              size="small"
              style={styles.saveButton}
            />
          </View>
          <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            Neue Ausgabe
          </Text>
        </GlassContainer>
      </LinearGradient>

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
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                  Betrag *
                </Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    color: colorScheme === 'dark' ? '#fff' : '#000',
                  }]}
                  value={formData.amount}
                  onChangeText={(value) => updateField('amount', value)}
                  placeholder="52.50"
                  placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                  Währung
                </Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    color: colorScheme === 'dark' ? '#fff' : '#000',
                  }]}
                  value={formData.currency}
                  onChangeText={(value) => updateField('currency', value)}
                  placeholder="CHF"
                  placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                Beschreibung *
              </Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: colorScheme === 'dark' ? '#fff' : '#000',
                }]}
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                placeholder="z.B. Flughafen Kiosk"
                placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
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
                    style={[
                      styles.categoryButton,
                      formData.category === category.value && styles.selectedCategory
                    ]}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                Datum
              </Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: colorScheme === 'dark' ? '#fff' : '#000',
                }]}
                value={formData.date}
                onChangeText={(value) => updateField('date', value)}
                placeholder="TT.MM.JJJJ"
                placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
              />
            </View>
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
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    paddingVertical: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelButton: {
    paddingHorizontal: 16,
    minWidth: 80,
  },
  saveButton: {
    paddingHorizontal: 16,
    minWidth: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
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
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    marginRight: 8,
    paddingHorizontal: 16,
  },
  selectedCategory: {
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
  },
});