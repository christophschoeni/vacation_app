import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card, Icon } from '@/components/design';
import AppHeader from '@/components/ui/AppHeader';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CurrencyEditor from '@/components/ui/forms/CurrencyEditor';
import { logger } from '@/lib/utils/logger';
import { ErrorHandler } from '@/lib/utils/error-handler';

// Default currencies
const DEFAULT_CURRENCIES = [
  { code: 'CHF', name: 'Schweizer Franken', symbol: 'CHF' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US-Dollar', symbol: '$' },
  { code: 'GBP', name: 'Britisches Pfund', symbol: '£' },
  { code: 'JPY', name: 'Japanischer Yen', symbol: '¥' },
  { code: 'CAD', name: 'Kanadischer Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australischer Dollar', symbol: 'A$' },
];

const CURRENCIES_STORAGE_KEY = '@vacation_assist_currencies';

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export default function CurrencyScreen() {
  const colorScheme = useColorScheme();
  const [selectedCurrency, setSelectedCurrency] = useState('CHF');
  const [currencies, setCurrencies] = useState<Currency[]>(DEFAULT_CURRENCIES);
  const [showEditor, setShowEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isDark = colorScheme === 'dark';

  // Load currencies from storage on mount
  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      // Load stored currencies
      const storedCurrencies = await AsyncStorage.getItem(CURRENCIES_STORAGE_KEY);
      if (storedCurrencies) {
        const parsed = JSON.parse(storedCurrencies) as Currency[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCurrencies(parsed);
        }
      }

      // Load selected currency
      const storedCurrency = await AsyncStorage.getItem('@vacation_assist_default_currency');
      if (storedCurrency) {
        setSelectedCurrency(storedCurrency);
      }
    } catch (error) {
      await ErrorHandler.handleStorageError(error, 'load currencies', false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCurrencies = async (newCurrencies: Currency[]) => {
    try {
      await AsyncStorage.setItem(CURRENCIES_STORAGE_KEY, JSON.stringify(newCurrencies));
    } catch (error) {
      await ErrorHandler.handleStorageError(error, 'save currencies', true);
    }
  };

  const handleCurrencySelect = async (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    try {
      await AsyncStorage.setItem('@vacation_assist_default_currency', currencyCode);
    } catch (error) {
      await ErrorHandler.handleStorageError(error, 'save currency selection', true);
    }
  };

  const handleDeleteCurrency = (currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    if (!currency) return;

    // Prevent deletion of default currencies
    const isDefaultCurrency = DEFAULT_CURRENCIES.some(c => c.code === currencyCode);
    if (isDefaultCurrency) {
      Alert.alert(
        'Standardwährung',
        'Standardwährungen können nicht gelöscht werden.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      'Währung löschen',
      `Möchten Sie die Währung "${currency.name}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            const newCurrencies = currencies.filter(c => c.code !== currencyCode);
            setCurrencies(newCurrencies);
            saveCurrencies(newCurrencies);

            // If deleted currency was selected, switch to CHF
            if (selectedCurrency === currencyCode) {
              setSelectedCurrency('CHF');
            }
          },
        },
      ]
    );
  };

  const isDefaultCurrency = (currencyCode: string) => {
    return DEFAULT_CURRENCIES.some(c => c.code === currencyCode);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Zurück"
        >
          <Icon name="arrow-left" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
          Währung
        </Text>
        <TouchableOpacity
          onPress={() => setShowEditor(true)}
          style={styles.headerButton}
          accessibilityLabel="Neue Währung hinzufügen"
        >
          <Icon name="plus" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            Wählen Sie Ihre bevorzugte Währung
          </Text>

          {currencies.map((currency) => (
            <TouchableOpacity
              key={currency.code}
              onPress={() => handleCurrencySelect(currency.code)}
              activeOpacity={0.7}
            >
              <Card variant="clean" style={styles.currencyCard}>
                <View style={styles.currencyRow}>
                  <View style={styles.currencyInfo}>
                    <View style={styles.currencySymbol}>
                      <Text style={[styles.symbolText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        {currency.symbol}
                      </Text>
                    </View>
                    <View style={styles.currencyText}>
                      <Text style={[styles.currencyName, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        {currency.name}
                      </Text>
                      <Text style={[styles.currencyCode, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                        {currency.code}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.currencyActions}>
                    {!isDefaultCurrency(currency.code) && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDeleteCurrency(currency.code);
                        }}
                        style={styles.deleteButton}
                        accessibilityLabel={`Währung ${currency.name} löschen`}
                      >
                        <Icon name="delete" size={18} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                    {selectedCurrency === currency.code && (
                      <Icon name="check" size={20} color="#007AFF" />
                    )}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <CurrencyEditor
        visible={showEditor}
        onSave={(currency: Currency) => {
          // Check for duplicate currency codes
          const isDuplicate = currencies.some(c =>
            c.code.toUpperCase() === currency.code.toUpperCase()
          );

          if (isDuplicate) {
            Alert.alert(
              'Währung bereits vorhanden',
              'Eine Währung mit diesem Code existiert bereits.',
              [{ text: 'OK', style: 'default' }]
            );
            return;
          }

          const newCurrencies = [...currencies, currency];
          setCurrencies(newCurrencies);
          saveCurrencies(newCurrencies);
          setShowEditor(false);
        }}
        onCancel={() => setShowEditor(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60, 60, 67, 0.12)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  headerButton: {
    padding: 8,
    marginRight: -8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 16,
    fontFamily: 'System',
  },
  currencyCard: {
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  currencySymbol: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
  },
  currencyText: {
    flex: 1,
  },
  currencyName: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'System',
    marginBottom: 2,
  },
  currencyCode: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'System',
  },
  currencyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 8,
    marginRight: -8,
  },
});