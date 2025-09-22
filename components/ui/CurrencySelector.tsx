import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { currencyService, CurrencyInfo } from '@/lib/currency';
import { Icon } from '@/components/design';
import * as Haptics from 'expo-haptics';

interface CurrencySelectorProps {
  selectedCurrency: string;
  onSelect: (currency: string) => void;
  label?: string;
  style?: any;
}

export default function CurrencySelector({
  selectedCurrency,
  onSelect,
  label = "Währung",
  style
}: CurrencySelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const popularCurrencies = currencyService.getPopularCurrencies();
  const selectedCurrencyInfo = currencyService.getCurrencyInfo(selectedCurrency);

  const handleSelect = async (currency: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(currency);
    setModalVisible(false);
  };

  const openModal = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
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
      {label && (
        <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
          {label}
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
              Währung auswählen
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={20} color={isDark ? '#8E8E93' : '#6D6D70'} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={popularCurrencies}
            renderItem={renderCurrencyItem}
            keyExtractor={(item) => item.code}
            style={styles.currencyList}
            showsVerticalScrollIndicator={false}
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
});