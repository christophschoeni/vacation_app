import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  useColorScheme,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card, Icon } from '@/components/design';
import AppHeader from '@/components/ui/AppHeader';
import { currencyService } from '@/lib/currency';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { ErrorHandler } from '@/lib/utils/error-handler';

interface CacheStatus {
  hasCache: boolean;
  age: number;
  isExpired: boolean;
  lastUpdate: Date | null;
}

interface CurrencySettings {
  updatePolicy: string;
  allowMobileData: boolean;
  cacheExpiryHours: number;
  lastUpdate: Date | null;
}

const UPDATE_POLICIES = [
  { value: 'auto', label: 'Automatisch', description: 'Aktualisiert Wechselkurse automatisch wenn verfügbar' },
  { value: 'wifi-only', label: 'Nur WLAN', description: 'Aktualisiert nur über WLAN-Verbindungen' },
  { value: 'manual', label: 'Manuell', description: 'Nur auf Anfrage aktualisieren' },
];

const CACHE_EXPIRY_OPTIONS = [
  { value: 1, label: '1 Stunde' },
  { value: 6, label: '6 Stunden' },
  { value: 12, label: '12 Stunden' },
  { value: 24, label: '1 Tag' },
  { value: 48, label: '2 Tage' },
  { value: 168, label: '1 Woche' },
];

export default function CurrencyDataScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showManualRateEditor, setShowManualRateEditor] = useState(false);
  const [manualFromCurrency, setManualFromCurrency] = useState('CHF');
  const [manualToCurrency, setManualToCurrency] = useState('TRY');
  const [manualRate, setManualRate] = useState('');
  const [settings, setSettings] = useState<CurrencySettings>({
    updatePolicy: 'auto',
    allowMobileData: true,
    cacheExpiryHours: 24,
    lastUpdate: null,
  });
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    hasCache: false,
    age: 0,
    isExpired: true,
    lastUpdate: null,
  });

  useEffect(() => {
    loadSettings();
    loadCacheStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await currencyService.getUpdateSettings();
      setSettings(currentSettings);
    } catch (error) {
      await ErrorHandler.handleError(error, 'load currency settings', false);
    }
  };

  const loadCacheStatus = async () => {
    try {
      const status = await currencyService.getCacheStatus();
      setCacheStatus(status);
    } catch (error) {
      await ErrorHandler.handleError(error, 'load cache status', false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<CurrencySettings>) => {
    try {
      await currencyService.updateSettings(newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (error) {
      await ErrorHandler.handleError(error, 'update currency settings', true);
    }
  };

  const handleManualUpdate = async () => {
    setIsUpdating(true);
    try {
      const result = await currencyService.manualUpdate();
      if (result.success) {
        Alert.alert(
          'Erfolgreich aktualisiert',
          'Wechselkurse wurden erfolgreich aktualisiert.',
          [{ text: 'OK', style: 'default' }]
        );
        // Reload status to show updated information
        await loadCacheStatus();
        await loadSettings();
      } else {
        Alert.alert(
          'Aktualisierung fehlgeschlagen',
          result.error || 'Unbekannter Fehler beim Aktualisieren der Wechselkurse.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      await ErrorHandler.handleError(error, 'manual currency update', true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Cache leeren',
      'Möchten Sie den Cache für Wechselkurse wirklich leeren? Dies wird alle gespeicherten Kursdaten löschen.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Leeren',
          style: 'destructive',
          onPress: async () => {
            try {
              await currencyService.clearCache();
              await loadCacheStatus();
              Alert.alert(
                'Cache geleert',
                'Der Wechselkurs-Cache wurde erfolgreich geleert.',
                [{ text: 'OK', style: 'default' }]
              );
            } catch (error) {
              await ErrorHandler.handleError(error, 'clear cache', true);
            }
          },
        },
      ]
    );
  };

  const handleSetManualRate = async () => {
    if (!manualRate || isNaN(parseFloat(manualRate))) {
      Alert.alert(
        'Ungültiger Wert',
        'Bitte geben Sie einen gültigen Wechselkurs ein.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    try {
      const rate = parseFloat(manualRate);
      await currencyService.setManualRate(manualFromCurrency, manualToCurrency, rate);

      Alert.alert(
        'Kurs gesetzt',
        `Manueller Wechselkurs ${manualFromCurrency}/${manualToCurrency} = ${rate} wurde gespeichert.`,
        [{ text: 'OK', style: 'default' }]
      );

      setShowManualRateEditor(false);
      setManualRate('');
      await loadCacheStatus();
    } catch (error) {
      await ErrorHandler.handleError(error, 'set manual rate', true);
    }
  };

  const formatCacheAge = (ageMs: number): string => {
    const hours = Math.floor(ageMs / (1000 * 60 * 60));
    const minutes = Math.floor((ageMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getCacheStatusColor = (): string => {
    if (!cacheStatus.hasCache) return isDark ? '#8E8E93' : '#6D6D70';
    if (cacheStatus.isExpired) return '#FF9500';
    return '#34C759';
  };

  const getCacheStatusText = (): string => {
    if (!cacheStatus.hasCache) return 'Kein Cache vorhanden';
    if (cacheStatus.isExpired) return 'Abgelaufen';
    return 'Aktuell';
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
        <AppHeader
          title="Währungsdaten"
          variant="large"
          showBack={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#007AFF'} />
          <Text style={[styles.loadingText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            Einstellungen laden...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <AppHeader
        title="Währungsdaten"
        variant="large"
        showBack={true}
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cache Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Cache Status
          </Text>
          <Card variant="clean" style={styles.card}>
            <View style={styles.statusRow}>
              <View style={styles.statusInfo}>
                <View style={styles.statusHeader}>
                  <Text style={[styles.statusLabel, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                    Status
                  </Text>
                  <View style={[styles.statusIndicator, { backgroundColor: getCacheStatusColor() }]} />
                  <Text style={[styles.statusValue, { color: getCacheStatusColor() }]}>
                    {getCacheStatusText()}
                  </Text>
                </View>
                {cacheStatus.hasCache && (
                  <Text style={[styles.statusDetail, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                    Alter: {formatCacheAge(cacheStatus.age)}
                  </Text>
                )}
                {cacheStatus.lastUpdate && (
                  <Text style={[styles.statusDetail, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                    Letzte Aktualisierung: {formatRelativeTime(cacheStatus.lastUpdate)}
                  </Text>
                )}
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={handleManualUpdate}
                  disabled={isUpdating}
                  style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
                  accessibilityLabel="Wechselkurse aktualisieren"
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Icon name="refresh" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleClearCache}
                  style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
                  accessibilityLabel="Cache leeren"
                >
                  <Icon name="delete" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowManualRateEditor(true)}
                  style={[styles.actionButton, { backgroundColor: '#FF9500' }]}
                  accessibilityLabel="Manuellen Kurs setzen"
                >
                  <Icon name="edit" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </View>

        {/* Manual Rate Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Manuelle Kurskorrektur
          </Text>
          <Card variant="clean" style={styles.card}>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionLabel, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                Kurse manuell korrigieren
              </Text>
              <Text style={[styles.optionDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                Falls die automatischen Kurse ungenau sind, können Sie diese manuell überschreiben.
                {'\n'}Beispiel: Google zeigt 100 CHF = 5'218.40 TRY, aber die App zeigt einen anderen Wert.
              </Text>
            </View>
          </Card>
        </View>

        {/* Update Policy */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Update-Richtlinie
          </Text>
          {UPDATE_POLICIES.map((policy) => (
            <TouchableOpacity
              key={policy.value}
              onPress={() => updateSettings({ updatePolicy: policy.value })}
              activeOpacity={0.7}
            >
              <Card variant="clean" style={styles.card}>
                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Text style={[styles.optionLabel, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                      {policy.label}
                    </Text>
                    <Text style={[styles.optionDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                      {policy.description}
                    </Text>
                  </View>
                  {settings.updatePolicy === policy.value && (
                    <Icon name="check" size={20} color="#007AFF" />
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mobile Data Usage */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Datennutzung
          </Text>
          <Card variant="clean" style={styles.card}>
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchLabel, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                  Mobile Daten verwenden
                </Text>
                <Text style={[styles.switchDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                  Wechselkurse auch über mobile Datenverbindung aktualisieren
                </Text>
              </View>
              <Switch
                value={settings.allowMobileData}
                onValueChange={(value) => updateSettings({ allowMobileData: value })}
                trackColor={{ false: isDark ? '#3A3A3C' : '#E5E5EA', true: '#34C759' }}
                thumbColor={'#FFFFFF'}
              />
            </View>
          </Card>
        </View>

        {/* Cache Expiry */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Cache-Gültigkeitsdauer
          </Text>
          {CACHE_EXPIRY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => updateSettings({ cacheExpiryHours: option.value })}
              activeOpacity={0.7}
            >
              <Card variant="clean" style={styles.card}>
                <View style={styles.optionRow}>
                  <Text style={[styles.optionLabel, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                    {option.label}
                  </Text>
                  {settings.cacheExpiryHours === option.value && (
                    <Icon name="check" size={20} color="#007AFF" />
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Manual Rate Editor Modal */}
      <Modal
        visible={showManualRateEditor}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowManualRateEditor(false)}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setShowManualRateEditor(false)}
              style={styles.backButton}
              accessibilityLabel="Abbrechen"
            >
              <Text style={[styles.headerButton, { color: '#007AFF' }]}>Abbrechen</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
              Manueller Kurs
            </Text>
            <TouchableOpacity
              onPress={handleSetManualRate}
              style={styles.backButton}
              accessibilityLabel="Speichern"
            >
              <Text style={[styles.headerButton, { color: '#007AFF' }]}>Speichern</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                Wechselkurs korrigieren
              </Text>

              <Card variant="clean" style={styles.card}>
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionLabel, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                    Beispiel für TRY (Türkische Lira)
                  </Text>
                  <Text style={[styles.optionDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                    Google: 100 CHF = 5'218.40 TRY{'\n'}
                    Geben Sie 52.184 ein (für 1 CHF = 52.184 TRY)
                  </Text>
                </View>
              </Card>

              <Card variant="clean" style={styles.card}>
                <View style={styles.currencyPairRow}>
                  <View style={styles.currencyInput}>
                    <Text style={[styles.inputLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>Von</Text>
                    <TextInput
                      style={[styles.currencyCode, {
                        color: isDark ? '#FFFFFF' : '#1C1C1E',
                        backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7'
                      }]}
                      value={manualFromCurrency}
                      onChangeText={setManualFromCurrency}
                      placeholder="CHF"
                      placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                      autoCapitalize="characters"
                      maxLength={3}
                    />
                  </View>

                  <Icon name="arrow-right" size={20} color={isDark ? '#8E8E93' : '#6D6D70'} />

                  <View style={styles.currencyInput}>
                    <Text style={[styles.inputLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>Zu</Text>
                    <TextInput
                      style={[styles.currencyCode, {
                        color: isDark ? '#FFFFFF' : '#1C1C1E',
                        backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7'
                      }]}
                      value={manualToCurrency}
                      onChangeText={setManualToCurrency}
                      placeholder="TRY"
                      placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                      autoCapitalize="characters"
                      maxLength={3}
                    />
                  </View>
                </View>
              </Card>

              <Card variant="clean" style={styles.card}>
                <View style={styles.optionInfo}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                    Wechselkurs (1 {manualFromCurrency} = ? {manualToCurrency})
                  </Text>
                  <TextInput
                    style={[styles.rateInput, {
                      color: isDark ? '#FFFFFF' : '#1C1C1E',
                      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7'
                    }]}
                    value={manualRate}
                    onChangeText={setManualRate}
                    placeholder="z.B. 52.184"
                    placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                    keyboardType="decimal-pad"
                    autoFocus
                  />
                </View>
              </Card>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 120,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 16,
  },
  card: {
    marginBottom: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusInfo: {
    flex: 1,
    marginRight: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statusLabel: {
    fontSize: 17,
    fontWeight: '500',
    fontFamily: 'System',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusValue: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'System',
  },
  statusDetail: {
    fontSize: 14,
    fontFamily: 'System',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'System',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'System',
    lineHeight: 18,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'System',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 14,
    fontFamily: 'System',
    lineHeight: 18,
  },
  // Modal specific styles
  currencyPairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  currencyInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'System',
    marginBottom: 8,
  },
  currencyCode: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'System',
    textAlign: 'center',
    fontWeight: '600',
  },
  rateInput: {
    padding: 16,
    borderRadius: 8,
    fontSize: 20,
    fontFamily: 'System',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 8,
  },
  headerButton: {
    fontSize: 17,
    fontFamily: 'System',
  },
});