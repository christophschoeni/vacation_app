import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card, Icon } from '@/components/design';
import AppHeader from '@/components/ui/AppHeader';
import { currencyService, POPULAR_CURRENCIES, ALL_CURRENCIES, CurrencyInfo, RateWithSource } from '@/lib/currency';
import { RateSource } from '@/lib/db/repositories/exchange-rates-repository';
import { useCurrency } from '@/contexts/CurrencyContext';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '@/lib/i18n';

interface RateDisplay {
  targetCurrency: string;
  rate: number;
  source: RateSource;
  currencyInfo?: CurrencyInfo;
}

export default function ExchangeRatesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const { defaultCurrency } = useCurrency();

  const [rates, setRates] = useState<RateDisplay[]>([]);
  const [filteredRates, setFilteredRates] = useState<RateDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRate, setSelectedRate] = useState<RateDisplay | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRates();
  }, [defaultCurrency]);

  const loadRates = async () => {
    try {
      setIsLoading(true);
      const allRates = await currencyService.getAllRatesWithSources(defaultCurrency);

      // Show all available currencies
      const ratesDisplay: RateDisplay[] = allRates.map(rate => {
        const currencyInfo = ALL_CURRENCIES.find(c => c.code === rate.currency);
        return {
          targetCurrency: rate.currency,
          rate: rate.rate,
          source: rate.source,
          currencyInfo: currencyInfo,
        };
      });

      // Sort: Manual rates first, then by currency code
      ratesDisplay.sort((a, b) => {
        if (a.source === 'manual' && b.source !== 'manual') return -1;
        if (a.source !== 'manual' && b.source === 'manual') return 1;
        return a.targetCurrency.localeCompare(b.targetCurrency);
      });

      setRates(ratesDisplay);
      setFilteredRates(ratesDisplay);
    } catch (error) {
      console.warn('Failed to load rates:', error);
      Alert.alert(t('common.error'), t('settings.exchange_rates.errors.load_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Filter rates based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRates(rates);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = rates.filter(rate => {
        const currencyCode = rate.targetCurrency.toLowerCase();
        const currencyName = rate.currencyInfo?.name.toLowerCase() || '';
        return currencyCode.includes(query) || currencyName.includes(query);
      });
      setFilteredRates(filtered);
    }
  }, [searchQuery, rates]);

  const handleManualUpdate = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsUpdating(true);

      const result = await currencyService.manualUpdate(defaultCurrency);

      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await loadRates();
        Alert.alert(t('common.success'), t('settings.exchange_rates.update_success'));
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(t('common.error'), result.error || t('settings.exchange_rates.errors.update_failed'));
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('settings.exchange_rates.errors.update_failed'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditRate = (rate: RateDisplay) => {
    setSelectedRate(rate);
    setEditValue(rate.rate.toString());
    setEditModalVisible(true);
  };

  const handleSaveRate = async () => {
    if (!selectedRate) return;

    const newRate = parseFloat(editValue);
    if (isNaN(newRate) || newRate <= 0) {
      Alert.alert(t('common.error'), t('settings.exchange_rates.errors.invalid_rate'));
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await currencyService.setManualRate(defaultCurrency, selectedRate.targetCurrency, newRate);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setEditModalVisible(false);
      await loadRates();

      Alert.alert(t('common.success'), t('settings.exchange_rates.rate_updated'));
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('settings.exchange_rates.errors.save_failed'));
    }
  };

  const handleDeleteRate = (rate: RateDisplay) => {
    if (rate.source !== 'manual') {
      Alert.alert(
        t('settings.exchange_rates.errors.cannot_delete_title'),
        t('settings.exchange_rates.errors.cannot_delete_message')
      );
      return;
    }

    Alert.alert(
      t('settings.exchange_rates.delete.title'),
      t('settings.exchange_rates.delete.message', {
        from: defaultCurrency,
        to: rate.targetCurrency
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await currencyService.deleteManualRate(defaultCurrency, rate.targetCurrency);
              await loadRates();
            } catch (error) {
              Alert.alert(t('common.error'), t('settings.exchange_rates.errors.delete_failed'));
            }
          },
        },
      ]
    );
  };

  const handleDeleteAllManualRates = () => {
    const manualRatesCount = rates.filter(r => r.source === 'manual').length;

    if (manualRatesCount === 0) {
      Alert.alert(
        t('settings.exchange_rates.no_manual_rates_title'),
        t('settings.exchange_rates.no_manual_rates_message')
      );
      return;
    }

    Alert.alert(
      t('settings.exchange_rates.delete_all.title'),
      t('settings.exchange_rates.delete_all.message', { count: manualRatesCount }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              await currencyService.deleteAllManualRates();
              await loadRates();
              Alert.alert(t('common.success'), t('settings.exchange_rates.delete_all.success'));
            } catch (error) {
              Alert.alert(t('common.error'), t('settings.exchange_rates.errors.delete_all_failed'));
            }
          },
        },
      ]
    );
  };

  const getSourceIcon = (source: RateSource) => {
    switch (source) {
      case 'manual':
        return '✏️';
      case 'api':
        return '🌐';
      case 'fallback':
        return '📦';
      default:
        return '❓';
    }
  };

  const getSourceLabel = (source: RateSource) => {
    switch (source) {
      case 'manual':
        return t('settings.exchange_rates.source.manual');
      case 'api':
        return t('settings.exchange_rates.source.api');
      case 'fallback':
        return t('settings.exchange_rates.source.fallback');
      default:
        return t('settings.exchange_rates.source.unknown');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['bottom']}>
        <AppHeader
          title={t('settings.exchange_rates.title')}
          variant="large"
          useSafeAreaPadding={true}
          showBack={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#007AFF'} />
          <Text style={[styles.loadingText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {t('settings.exchange_rates.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['bottom']}>
      <AppHeader
        title={t('settings.exchange_rates.title')}
        variant="large"
        useSafeAreaPadding={true}
        showBack={true}
        onBackPress={() => router.back()}
        rightAction={
          <TouchableOpacity
            onPress={handleManualUpdate}
            disabled={isUpdating}
            style={styles.headerButton}
            accessibilityLabel={t('settings.exchange_rates.update_button_aria')}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : '#007AFF'} />
            ) : (
              <Icon name="refresh" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
            )}
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

        {/* Info Card */}
        <Card variant="clean" style={[styles.infoCard, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
          <View style={styles.infoContent}>
            <Icon name="info" size={20} color={isDark ? '#0A84FF' : '#007AFF'} />
            <Text style={[styles.infoText, { color: isDark ? '#EBEBF5' : '#3C3C43' }]}>
              {t('settings.exchange_rates.info')}
            </Text>
          </View>
        </Card>

        {/* Base Currency Display */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {t('settings.exchange_rates.base_currency')}
          </Text>
          <Card variant="clean" style={styles.baseCurrencyCard}>
            <View style={styles.baseCurrencyContent}>
              <Text style={styles.baseCurrencyFlag}>
                {POPULAR_CURRENCIES.find(c => c.code === defaultCurrency)?.flag || '🌍'}
              </Text>
              <Text style={[styles.baseCurrencyText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                {defaultCurrency}
              </Text>
            </View>
          </Card>
        </View>

        {/* Rates List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
              {t('settings.exchange_rates.rates_title')}
            </Text>
            <TouchableOpacity onPress={handleDeleteAllManualRates}>
              <Text style={[styles.deleteAllButton, { color: '#FF3B30' }]}>
                {t('settings.exchange_rates.delete_all_button')}
              </Text>
            </TouchableOpacity>
          </View>

          {filteredRates.length === 0 ? (
            <Card variant="clean" style={styles.rateCard}>
              <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                {searchQuery ? t('settings.exchange_rates.no_results') : t('settings.exchange_rates.no_rates')}
              </Text>
            </Card>
          ) : (
            filteredRates.map((rate) => (
            <Card key={rate.targetCurrency} variant="clean" style={styles.rateCard}>
              <View style={styles.rateRow}>
                <View style={styles.rateInfo}>
                  <Text style={styles.rateFlag}>
                    {rate.currencyInfo?.flag || '🌍'}
                  </Text>
                  <View style={styles.rateDetails}>
                    <Text style={[styles.rateCurrency, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                      {rate.targetCurrency}
                    </Text>
                    <Text style={[styles.rateValue, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                      1 {defaultCurrency} = {rate.rate.toFixed(4)} {rate.targetCurrency}
                    </Text>
                    <View style={styles.sourceContainer}>
                      <Text style={styles.sourceIcon}>{getSourceIcon(rate.source)}</Text>
                      <Text style={[styles.sourceLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                        {getSourceLabel(rate.source)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.rateActions}>
                  <TouchableOpacity onPress={() => handleEditRate(rate)} style={styles.actionButton}>
                    <Icon name="edit" size={18} color={isDark ? '#0A84FF' : '#007AFF'} />
                  </TouchableOpacity>
                  {rate.source === 'manual' && (
                    <TouchableOpacity onPress={() => handleDeleteRate(rate)} style={styles.actionButton}>
                      <Icon name="delete" size={18} color="#FF3B30" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Card>
          )))}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
              {t('settings.exchange_rates.edit_modal.title')}
            </Text>

            {selectedRate && (
              <>
                <Text style={[styles.modalSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                  {t('settings.exchange_rates.edit_modal.subtitle', {
                    from: defaultCurrency,
                    to: selectedRate.targetCurrency
                  })}
                </Text>

                <TextInput
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                      color: isDark ? '#FFFFFF' : '#1C1C1E',
                    },
                  ]}
                  value={editValue}
                  onChangeText={setEditValue}
                  keyboardType="decimal-pad"
                  placeholder={t('settings.exchange_rates.edit_modal.placeholder')}
                  placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={[styles.buttonText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton, { backgroundColor: '#007AFF' }]}
                    onPress={handleSaveRate}
                  >
                    <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                      {t('common.save')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'System',
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
  infoCard: {
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'System',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'System',
  },
  deleteAllButton: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'System',
  },
  baseCurrencyCard: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  baseCurrencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  baseCurrencyFlag: {
    fontSize: 32,
  },
  baseCurrencyText: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'System',
  },
  rateCard: {
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  rateFlag: {
    fontSize: 24,
  },
  rateDetails: {
    flex: 1,
  },
  rateCurrency: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 2,
  },
  rateValue: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'System',
    marginBottom: 4,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sourceIcon: {
    fontSize: 12,
  },
  sourceLabel: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'System',
  },
  rateActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'System',
    textAlign: 'center',
    paddingVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'System',
    textAlign: 'center',
  },
  modalInput: {
    fontSize: 17,
    fontFamily: 'System',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {},
  saveButton: {},
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
});
