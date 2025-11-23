import { Button, Icon } from '@/components/design';
import AppHeader from '@/components/ui/AppHeader';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DatePicker, FormInput } from '@/components/ui/forms';
import CurrencySelector from '@/components/ui/CurrencySelector';
import ImagePicker from '@/components/ui/ImagePicker';
import { useVacations } from '@/hooks/use-vacations';
import { logger } from '@/lib/utils/logger';
import { useTranslation } from '@/lib/i18n';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useVacationId } from '@/contexts/VacationContext';

export default function VacationEditScreen() {
  const params = useLocalSearchParams();
  const vacationIdFromContext = useVacationId();
  const vacationIdFromParams = params.vacationId as string;

  // Try multiple sources for vacationId: Context first, then params
  const vacationId = vacationIdFromContext || vacationIdFromParams;

  const { t } = useTranslation();

  const colorScheme = useColorScheme();
  const { vacations, updateVacation, loading } = useVacations();
  const { defaultCurrency } = useCurrency();

  const vacation = vacations.find(v => v.id === vacationId);
  const isDark = colorScheme === 'dark';


  const [formData, setFormData] = useState({
    destination: '',
    country: '',
    hotel: '',
    startDate: new Date(),
    endDate: new Date(),
    budget: '',
    currency: defaultCurrency || 'CHF',
    imageUrl: '',
  });

  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (vacation) {
      setFormData({
        destination: vacation.destination,
        country: vacation.country,
        hotel: vacation.hotel,
        startDate: vacation.startDate,
        endDate: vacation.endDate,
        budget: vacation.budget ? vacation.budget.toString() : '',
        currency: vacation.currency || defaultCurrency || 'CHF',
        imageUrl: vacation.imageUrl || '',
      });
    }
  }, [vacation, defaultCurrency]);


  // Show loading state while vacations are being loaded
  if (loading && !vacation) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#FFFFFF' }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {t('vacation.edit_screen.loading')}
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

  const handleCancel = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!vacation) {
      Alert.alert(t('common.error'), t('vacation.edit_screen.errors.not_found'));
      return;
    }

    if (!formData.destination || !formData.hotel || !formData.budget) {
      Alert.alert(t('common.error'), t('vacation.edit_screen.errors.required_fields'));
      return;
    }

    if (formData.startDate >= formData.endDate) {
      Alert.alert(t('common.error'), t('vacation.edit_screen.errors.invalid_dates'));
      return;
    }

    try {
      setFormLoading(true);
      const updatedVacation = await updateVacation(vacation.id, {
        destination: formData.destination,
        country: formData.country,
        hotel: formData.hotel,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: parseFloat(formData.budget),
        budgetCurrency: vacation.budgetCurrency,  // Keep existing budget currency
        currency: formData.currency,               // Vacation currency for expenses
        imageUrl: formData.imageUrl || undefined,
      });

      if (updatedVacation) {
        router.back();
      } else {
        Alert.alert(t('common.error'), t('vacation.edit_screen.errors.update_failed'));
      }
    } catch {
      Alert.alert(t('common.error'), t('vacation.edit_screen.errors.update_failed'));
    } finally {
      setFormLoading(false);
    }
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
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
              {t('vacation.edit_screen.title')}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={[styles.subtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              {t('vacation.edit_screen.subtitle')}
            </Text>

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
              required
            />

            <DatePicker
              label={t('vacation.form.end_date')}
              value={formData.endDate}
              onChange={(date) => updateField('endDate', date)}
              mode="datetime"
              required
            />

            <FormInput
              label={`${t('vacation.form.budget')} (${defaultCurrency || 'CHF'})`}
              value={formData.budget}
              onChangeText={(value) => updateField('budget', value)}
              placeholder={t('vacation.form.budget_placeholder')}
              keyboardType="numeric"
              required
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'System',
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
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
    paddingHorizontal: 0,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 100,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
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