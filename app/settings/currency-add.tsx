import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '@/components/ui/AppHeader';
import { FormInput } from '@/components/ui/forms';
import { useTranslation } from '@/lib/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_CURRENCIES, CurrencyInfo } from '@/lib/currency';

const CURRENCIES_STORAGE_KEY = '@vacation_assist_currencies';

export default function AddCurrencyScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    symbol: '',
    flag: '',
  });

  const handleSave = async () => {
    if (!formData.code || !formData.name || !formData.symbol || !formData.flag) {
      Alert.alert(t('common.error'), t('errors.required_field'));
      return;
    }

    try {
      // Load existing currencies
      const storedCurrencies = await AsyncStorage.getItem(CURRENCIES_STORAGE_KEY);
      const currencies = storedCurrencies ? JSON.parse(storedCurrencies) : [];

      // Check for duplicate
      const allCurrencies = [...ALL_CURRENCIES, ...currencies];
      const isDuplicate = allCurrencies.some(c =>
        c.code.toUpperCase() === formData.code.trim().toUpperCase()
      );

      if (isDuplicate) {
        Alert.alert(
          t('settings.currency.errors.duplicate_title'),
          t('settings.currency.errors.duplicate_message')
        );
        return;
      }

      // Create new currency
      const newCurrency: CurrencyInfo = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        symbol: formData.symbol.trim(),
        flag: formData.flag.trim(),
      };

      // Save to storage
      const updatedCurrencies = [...currencies, newCurrency];
      await AsyncStorage.setItem(CURRENCIES_STORAGE_KEY, JSON.stringify(updatedCurrencies));

      router.dismiss();
    } catch (error) {
      console.error('Failed to create currency:', error);
      Alert.alert(t('common.error'), t('errors.generic'));
    }
  };

  const handleCancel = () => {
    router.dismiss();
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
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
            <Text style={[styles.largeTitle, { color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E' }]}>
              {t('components.currency_editor.title')}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <FormInput
              label={t('components.currency_editor.code_label')}
              value={formData.code}
              onChangeText={(value) => updateField('code', value)}
              placeholder={t('components.currency_editor.code_placeholder')}
              autoCapitalize="characters"
              maxLength={5}
              required
            />

            <FormInput
              label={t('components.currency_editor.name_label')}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder={t('components.currency_editor.name_placeholder')}
              required
            />

            <FormInput
              label={t('components.currency_editor.symbol_label')}
              value={formData.symbol}
              onChangeText={(value) => updateField('symbol', value)}
              placeholder={t('components.currency_editor.symbol_placeholder')}
              maxLength={3}
              required
            />

            <FormInput
              label={t('components.currency_editor.flag_label')}
              value={formData.flag}
              onChangeText={(value) => updateField('flag', value)}
              placeholder={t('components.currency_editor.flag_placeholder')}
              maxLength={4}
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
