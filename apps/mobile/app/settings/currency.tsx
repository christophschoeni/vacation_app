import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { goBack } from '@/lib/utils/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, GroupedList } from '@/components/design';
import { Spacing, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';
import AppHeader from '@/components/ui/AppHeader';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { POPULAR_CURRENCIES, ALL_CURRENCIES, CurrencyInfo } from '@/lib/currency';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTranslation } from '@/lib/i18n';

const CURRENCIES_STORAGE_KEY = '@vacation_assist_currencies';

// Use the CurrencyInfo interface from lib/currency.ts instead of local Currency interface

export default function CurrencyScreen() {
  const theme = useIOSTheme();
  const { t } = useTranslation();
  const { defaultCurrency, setDefaultCurrency } = useCurrency();
  const [currencies, setCurrencies] = useState<CurrencyInfo[]>(ALL_CURRENCIES);
  // Only the setter is consumed today; no loading state is rendered on this screen.
  const [, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');


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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <AppHeader
        title={t('settings.currency.title')}
        variant="large"
        showBack={true}
        onBackPress={() => goBack('/(tabs)/settings')}
        useSafeAreaPadding={true}
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/settings/currency-add')}
            style={styles.headerButton}
            accessibilityLabel={t('settings.currency.add_aria')}
          >
            <View style={[styles.headerButtonInner, { backgroundColor: theme.groupedBackground }]}>
              <Icon name="plus" size={18} color={theme.accent} />
            </View>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.tile }]}>
          <Icon name="search" size={16} color={theme.secondaryLabel} />
          <TextInput
            style={[styles.searchInput, { color: theme.label }]}
            placeholder={t('settings.currency.search_placeholder')}
            placeholderTextColor={theme.secondaryLabel}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={16} color={theme.secondaryLabel} />
            </TouchableOpacity>
          )}
        </View>

        <GroupedList>
          {getFilteredCurrencies().map((currency) => (
            <TouchableOpacity
              key={currency.code}
              onPress={() => handleCurrencySelect(currency.code)}
              activeOpacity={0.7}
              style={styles.row}
              accessibilityRole="button"
              accessibilityLabel={`${currency.name}, ${currency.code}`}
              accessibilityState={{ selected: defaultCurrency === currency.code }}
            >
              <Text style={styles.flag}>{currency.flag}</Text>
              <View style={styles.currencyText}>
                <Text style={[styles.currencyName, { color: theme.label }]} numberOfLines={1}>
                  {currency.name}
                </Text>
                <Text style={[styles.currencyCode, { color: theme.secondaryLabel }]}>
                  {currency.code} • {currency.symbol}
                </Text>
              </View>
              {!isPopularCurrency(currency.code) && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteCurrency(currency.code);
                  }}
                  style={styles.deleteButton}
                  accessibilityLabel={t('settings.currency.delete_aria', { name: currency.name })}
                >
                  <Icon name="delete" size={18} color={theme.danger} />
                </TouchableOpacity>
              )}
              {defaultCurrency === currency.code && (
                <Icon name="check" size={20} color={theme.accent} />
              )}
            </TouchableOpacity>
          ))}
        </GroupedList>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    marginRight: -8,
  },
  headerButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 120,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: 10,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'System',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
  },
  flag: {
    fontSize: 24,
  },
  currencyText: {
    flex: 1,
  },
  currencyName: {
    fontSize: Typography.fontSize.callout,
  },
  currencyCode: {
    fontSize: Typography.fontSize.caption1,
    marginTop: 1,
  },
  deleteButton: {
    padding: 4,
  },
});