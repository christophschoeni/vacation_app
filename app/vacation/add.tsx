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
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/design';
import AppHeader from '@/components/ui/AppHeader';
import { FormInput, DatePicker } from '@/components/ui/forms';
import CurrencySelector from '@/components/ui/CurrencySelector';
import ImagePicker from '@/components/ui/ImagePicker';
import { useVacations } from '@/hooks/use-vacations';
import { useTranslation } from '@/lib/i18n';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function AddVacationScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { createVacation } = useVacations();
  const { defaultCurrency } = useCurrency();
  const [formData, setFormData] = useState({
    destination: '',
    country: '',
    hotel: '',
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    budget: '',
    currency: defaultCurrency || 'CHF',
    imageUrl: '',
  });

  const handleSave = async () => {
    if (!formData.destination || !formData.country || !formData.hotel) {
      Alert.alert(t('common.error'), t('errors.required_field'));
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
        budgetCurrency: defaultCurrency || 'CHF',  // Budget is in system currency
        currency: formData.currency,                // Vacation currency for expenses
        imageUrl: formData.imageUrl || undefined,
      });
      // Navigate back to trigger useFocusEffect and refresh vacation list
      router.back();
    } catch (error) {
      console.error('Failed to create vacation:', error);
      Alert.alert(t('common.error'), t('errors.generic'));
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const updateField = (field: string, value: string | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
      <AppHeader
        variant="modal"
        title={t('vacation.add.title')}
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
          <View style={styles.formContainer}>
            <ImagePicker
              imageUri={formData.imageUrl}
              onImageSelected={(uri) => updateField('imageUrl', uri)}
              onImageRemoved={() => updateField('imageUrl', '')}
              label={t('vacation.form.image')}
            />

            <FormInput
              label={t('vacation.form.destination')}
              value={formData.destination}
              onChangeText={(value) => updateField('destination', value)}
              placeholder={t('vacation.form.destination_placeholder')}
              required
            />

            <FormInput
              label={t('vacation.form.country')}
              value={formData.country}
              onChangeText={(value) => updateField('country', value)}
              placeholder={t('vacation.form.country_placeholder')}
              required
            />

            <FormInput
              label={t('vacation.form.hotel')}
              value={formData.hotel}
              onChangeText={(value) => updateField('hotel', value)}
              placeholder={t('vacation.form.hotel_placeholder')}
              required
            />

            <DatePicker
              label={t('vacation.form.start_date')}
              value={formData.startDate}
              onChange={(date) => updateField('startDate', date)}
              mode="datetime"
            />

            <DatePicker
              label={t('vacation.form.end_date')}
              value={formData.endDate}
              onChange={(date) => updateField('endDate', date)}
              mode="datetime"
            />

            <FormInput
              label={`${t('vacation.form.budget')} (${defaultCurrency || 'CHF'})`}
              value={formData.budget}
              onChangeText={(value) => updateField('budget', value)}
              placeholder={t('vacation.form.budget_placeholder')}
              keyboardType="numeric"
            />

            <CurrencySelector
              label={`${t('vacation.form.currency')} (${t('vacation.form.currency_hint')})`}
              selectedCurrency={formData.currency}
              onSelect={(value) => updateField('currency', value)}
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