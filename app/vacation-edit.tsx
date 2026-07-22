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
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DatePicker, FormInput } from '@/components/ui/forms';
import { ImagePickerField } from '@/components/ui/forms/ImagePickerField';
import CurrencySelector from '@/components/ui/CurrencySelector';
import { useVacation, useUpdateVacation } from '@/hooks/queries';
import { useTranslation } from '@/lib/i18n';
import { parseAmount } from '@/lib/utils/formatters';
import { useCurrency } from '@/contexts/CurrencyContext';
import { currencyService } from '@/lib/currency';
import { useVacationId } from '@/contexts/VacationContext';

export default function VacationEditScreen() {
  const params = useLocalSearchParams();
  const vacationIdFromContext = useVacationId();
  const vacationIdFromParams = params.vacationId as string;

  // Try multiple sources for vacationId: Context first, then params
  const vacationId = vacationIdFromContext || vacationIdFromParams;

  const { t } = useTranslation();

  const colorScheme = useColorScheme();
  const { data: vacation, isLoading } = useVacation(vacationId);
  const { mutateAsync: updateVacation } = useUpdateVacation();
  const { defaultCurrency } = useCurrency();

  const isDark = colorScheme === 'dark';


  const [formData, setFormData] = useState({
    destination: '',
    country: '',
    hotel: '',
    startDate: new Date(),
    endDate: new Date(),
    budget: '',
    currency: defaultCurrency || 'CHF',
    imageUrl: null as string | null,
  });

  // Only the setter is consumed today; the value is not yet surfaced in the UI.
  const [, setFormLoading] = useState(false);

  useEffect(() => {
    if (!vacation) return;
    let cancelled = false;

    const fillForm = async () => {
      // The budget field is labelled with the trip currency, so a value stored
      // under a different budgetCurrency (older records saved it in the system
      // currency) is converted into the trip currency before it is shown -
      // otherwise the form displays e.g. a CHF amount under an EUR label and
      // saving it back would silently change the budget.
      const tripCurrency = vacation.currency || defaultCurrency || 'CHF';
      const storedCurrency = vacation.budgetCurrency || 'CHF';
      let budgetForDisplay = vacation.budget ?? null;

      if (budgetForDisplay !== null && storedCurrency !== tripCurrency) {
        try {
          budgetForDisplay = await currencyService.convertCurrency(
            budgetForDisplay,
            storedCurrency,
            tripCurrency
          );
        } catch {
          // Keep the stored value if no rate is available; better a slightly
          // off number than an empty field.
        }
      }

      if (cancelled) return;
      setFormData({
        destination: vacation.destination,
        country: vacation.country,
        hotel: vacation.hotel,
        startDate: vacation.startDate,
        endDate: vacation.endDate,
        budget:
          budgetForDisplay !== null
            ? String(Math.round(budgetForDisplay * 100) / 100)
            : '',
        currency: tripCurrency,
        imageUrl: vacation.imageUrl ?? null,
      });
    };

    fillForm();
    return () => {
      cancelled = true;
    };
  }, [vacation, defaultCurrency]);


  // Show loading state while vacations are being loaded
  if (isLoading && !vacation) {
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

    // Reject non-numeric input before it reaches the database as NaN.
    const budget = parseAmount(formData.budget);
    if (budget === null || budget <= 0) {
      Alert.alert(t('common.error'), t('errors.invalid_amount'));
      return;
    }

    try {
      setFormLoading(true);
      const updatedVacation = await updateVacation({
        id: vacation.id,
        data: {
          destination: formData.destination,
          country: formData.country,
          hotel: formData.hotel,
          startDate: formData.startDate,
          endDate: formData.endDate,
          budget: budget,
          // The input is labelled with the trip currency and prefilled in it,
          // so the value the user typed is in that currency - store it as
          // budgetCurrency. This is consistent with the create form; older
          // records that stored the budget in the system currency are migrated
          // to the trip currency on the next save, with the number converted.
          budgetCurrency: formData.currency,
          currency: formData.currency,               // Vacation currency for expenses
          imageUrl: formData.imageUrl ?? undefined,
        },
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

            <ImagePickerField
              label={t('vacation.form.image.label')}
              value={formData.imageUrl}
              onChange={(uri) => setFormData((prev) => ({ ...prev, imageUrl: uri }))}
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

            {/* Currency first, then budget in that currency - as in create. */}
            <CurrencySelector
              label={`${t('vacation.form.currency')} (${t('vacation.form.currency_hint')})`}
              selectedCurrency={formData.currency}
              onSelect={(value) => updateField('currency', value)}
            />

            <FormInput
              label={`${t('vacation.form.budget')} (${formData.currency})`}
              value={formData.budget}
              onChangeText={(value) => updateField('budget', value)}
              placeholder={t('vacation.form.budget_placeholder')}
              keyboardType="numeric"
              required
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