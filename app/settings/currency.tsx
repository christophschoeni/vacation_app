import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Icon } from '@/components/design';
import AppHeader from '@/components/ui/AppHeader';
import { logger } from '@/lib/utils/logger';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { currencyService, POPULAR_CURRENCIES, ALL_CURRENCIES, CurrencyInfo } from '@/lib/currency';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTranslation } from '@/lib/i18n';

const CURRENCIES_STORAGE_KEY = '@vacation_assist_currencies';

// Use the CurrencyInfo interface from lib/currency.ts instead of local Currency interface

export default function CurrencyScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { defaultCurrency, setDefaultCurrency, isLoading: currencyLoading } = useCurrency();
  const [currencies, setCurrencies] = useState<CurrencyInfo[]>(ALL_CURRENCIES);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const isOverallLoading = isLoading || currencyLoading;
  const isDark = colorScheme === 'dark';

  // Load currencies from storage on mount
  useEffect(() => {
    loadCurrencies();
  }, []);

  // Reload currencies when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      loadCurrencies();
    }, [])
  );

  const loadCurrencies = async () => {
    try {
      // Load custom currencies from storage (if any)
      const storedCurrencies = await AsyncStorage.getItem(CURRENCIES_STORAGE_KEY);
      if (storedCurrencies) {
        const parsed = JSON.parse(storedCurrencies) as CurrencyInfo[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with ALL_CURRENCIES, avoiding duplicates
          const customCurrencies = parsed.filter(custom =>
            !ALL_CURRENCIES.some(standard => standard.code === custom.code)
          );
          setCurrencies([...ALL_CURRENCIES, ...customCurrencies]);
        } else {
          setCurrencies(ALL_CURRENCIES);
        }
      } else {
        setCurrencies(ALL_CURRENCIES);
      }
    } catch (error) {
      await ErrorHandler.handleStorageError(error, 'load currencies', false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCurrencies = async (newCurrencies: CurrencyInfo[]) => {
    try {
      await AsyncStorage.setItem(CURRENCIES_STORAGE_KEY, JSON.stringify(newCurrencies));
    } catch (error) {
      await ErrorHandler.handleStorageError(error, 'save currencies', true);
    }
  };

  const handleCurrencySelect = async (currencyCode: string) => {
    try {
      await setDefaultCurrency(currencyCode);
    } catch (error) {
      await ErrorHandler.handleStorageError(error, 'save currency selection', true);
    }
  };

  const handleDeleteCurrency = (currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    if (!currency) return;

    // Prevent deletion of popular currencies
    const isPopularCurrency = POPULAR_CURRENCIES.some(c => c.code === currencyCode);
    if (isPopularCurrency) {
      Alert.alert(
        t('settings.currency.errors.popular_title'),
        t('settings.currency.errors.popular_message'),
        [{ text: t('common.ok'), style: 'default' }]
      );
      return;
    }

    Alert.alert(
      t('settings.currency.delete.title'),
      t('settings.currency.delete.message', { name: currency.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            const newCurrencies = currencies.filter(c => c.code !== currencyCode);
            setCurrencies(newCurrencies);
            saveCurrencies(newCurrencies);

            // If deleted currency was selected, switch to CHF
            if (defaultCurrency === currencyCode) {
              setDefaultCurrency('CHF');
            }
          },
        },
      ]
    );
  };

  const isPopularCurrency = (currencyCode: string) => {
    return POPULAR_CURRENCIES.some(c => c.code === currencyCode);
  };

  // Filter currencies based on search query
  const getFilteredCurrencies = () => {
    if (searchQuery.trim() === '') {
      // Show all currencies when no search query
      return currencies;
    } else {
      // Filter currencies based on code or name
      const searchTerm = searchQuery.toLowerCase();
      return currencies.filter(currency =>
        currency.code.toLowerCase().includes(searchTerm) ||
        currency.name.toLowerCase().includes(searchTerm)
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['bottom']}>
      <AppHeader
        title={t('settings.currency.title')}
        variant="large"
        showBack={true}
        onBackPress={() => router.back()}
        useSafeAreaPadding={true}
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/settings/currency-add')}
            style={styles.headerButton}
            accessibilityLabel={t('settings.currency.add_aria')}
          >
            <Icon name="plus" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
          <Icon name="search" size={16} color={isDark ? '#8E8E93' : '#6D6D70'} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}
            placeholder={t('settings.currency.search_placeholder')}
            placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={16} color={isDark ? '#8E8E93' : '#6D6D70'} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            {searchQuery.trim() ? t('settings.currency.search_results', { count: getFilteredCurrencies().length }) : t('settings.currency.all_currencies', { count: getFilteredCurrencies().length })}
          </Text>

          {getFilteredCurrencies().map((currency) => (
            <TouchableOpacity
              key={currency.code}
              onPress={() => handleCurrencySelect(currency.code)}
              activeOpacity={0.7}
            >
              <Card variant="clean" style={styles.currencyCard}>
                <View style={styles.currencyRow}>
                  <View style={styles.currencyInfo}>
                    <Text style={styles.flag}>{currency.flag}</Text>
                    <View style={styles.currencyText}>
                      <Text style={[styles.currencyName, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        {currency.name}
                      </Text>
                      <Text style={[styles.currencyCode, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                        {currency.code} • {currency.symbol}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.currencyActions}>
                    {!isPopularCurrency(currency.code) && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDeleteCurrency(currency.code);
                        }}
                        style={styles.deleteButton}
                        accessibilityLabel={t('settings.currency.delete_aria', { name: currency.name })}
                      >
                        <Icon name="delete" size={18} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                    {defaultCurrency === currency.code && (
                      <Icon name="check" size={20} color="#007AFF" />
                    )}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 0,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'System',
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
  flag: {
    fontSize: 24,
    marginRight: 0,
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