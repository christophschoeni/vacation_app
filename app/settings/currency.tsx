import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card, Icon } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';

const CURRENCIES = [
  { code: 'CHF', name: 'Schweizer Franken', symbol: 'CHF' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US-Dollar', symbol: '$' },
  { code: 'GBP', name: 'Britisches Pfund', symbol: '£' },
  { code: 'JPY', name: 'Japanischer Yen', symbol: '¥' },
  { code: 'CAD', name: 'Kanadischer Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australischer Dollar', symbol: 'A$' },
];

export default function CurrencyScreen() {
  const colorScheme = useColorScheme();
  const [selectedCurrency, setSelectedCurrency] = useState('CHF');
  const isDark = colorScheme === 'dark';

  const handleCurrencySelect = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    // TODO: Save to settings/database
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
        <View style={styles.headerSpacer} />
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

          {CURRENCIES.map((currency) => (
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
                  {selectedCurrency === currency.code && (
                    <Icon name="check" size={20} color="#007AFF" />
                  )}
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
  headerSpacer: {
    width: 40,
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
});