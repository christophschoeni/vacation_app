import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, SectionList, TextInput, useColorScheme } from 'react-native';
import { currencyService, CurrencyInfo } from '@/lib/currency';
import { Icon } from '@/components/design';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '@/lib/i18n';

interface CurrencySelectorProps {
  selectedCurrency: string;
  onSelect: (currency: string) => void;
  label?: string;
  style?: any;
}

export default function CurrencySelector({
  selectedCurrency,
  onSelect,
  label,
  style
}: CurrencySelectorProps) {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const selectedCurrencyInfo = currencyService.getCurrencyInfo(selectedCurrency);

  // Get filtered currencies based on search
  const getFilteredCurrencies = () => {
    if (searchQuery.trim() === '') {
      const sections = currencyService.getCurrencySections();
      return [
        { title: t('settings.currency.popular_currencies'), data: sections.popular },
        { title: t('settings.currency.all_currencies', { count: sections.all.length }), data: sections.all },
      ];
    } else {
      const filtered = currencyService.searchCurrencies(searchQuery);
      return [{ title: t('settings.currency.search_results', { count: filtered.length }), data: filtered }];
    }
  };

  const handleSelect = async (currency: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(currency);
    setModalVisible(false);
  };

  const openModal = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
    setSearchQuery(''); // Reset search when opening
  };

  const renderCurrencyItem = ({ item }: { item: CurrencyInfo }) => (
    <TouchableOpacity
      style={[
        styles.currencyItem,
        {
          backgroundColor: selectedCurrency === item.code
            ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')
            : 'transparent',
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        }
      ]}
      onPress={() => handleSelect(item.code)}
    >
      <View style={styles.currencyInfo}>
        <Text style={styles.flag}>{item.flag}</Text>
        <View style={styles.currencyText}>
          <Text style={[styles.currencyCode, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {item.code}
          </Text>
          <Text style={[styles.currencyName, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            {item.name}
          </Text>
        </View>
      </View>
      {selectedCurrency === item.code && (
        <Icon name="check" size={20} color={isDark ? '#007AFF' : '#007AFF'} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {(label !== undefined ? label : t('settings.currency.label')) && (
        <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
          {label || t('settings.currency.label')}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          }
        ]}
        onPress={openModal}
      >
        <View style={styles.selectedCurrency}>
          <Text style={styles.selectedFlag}>{selectedCurrencyInfo?.flag || '💱'}</Text>
          <Text style={[styles.selectedCode, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {selectedCurrency}
          </Text>
          <Text style={[styles.selectedSymbol, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            {selectedCurrencyInfo?.symbol || selectedCurrency}
          </Text>
        </View>
        <Icon
          name="chevron-down"
          size={16}
          color={isDark ? '#8E8E93' : '#6D6D70'}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[
          styles.modal,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
              {t('settings.currency.select_currency')}
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={20} color={isDark ? '#8E8E93' : '#6D6D70'} />
            </TouchableOpacity>
          </View>

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

          <SectionList
            sections={getFilteredCurrencies()}
            renderItem={renderCurrencyItem}
            renderSectionHeader={({ section }) => (
              <View style={[styles.sectionHeader, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                  {section.title}
                </Text>
              </View>
            )}
            keyExtractor={(item) => item.code}
            style={styles.currencyList}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={true}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'System',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectedCurrency: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  selectedCode: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
    marginRight: 8,
  },
  selectedSymbol: {
    fontSize: 14,
    fontFamily: 'System',
  },
  modal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
  },
  closeButton: {
    padding: 8,
  },
  currencyList: {
    flex: 1,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  currencyText: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 14,
    fontFamily: 'System',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
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
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});