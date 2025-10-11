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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card, Icon } from '@/components/design';
import AppHeader from '@/components/ui/AppHeader';
import { currencyService, UpdatePolicy } from '@/lib/currency';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '@/lib/i18n';

export default function CurrencyCalculatorScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();

  const [settings, setSettings] = useState({
    updatePolicy: 'auto' as UpdatePolicy,
    allowMobileData: true,
    cacheExpiryHours: 24,
    lastUpdate: null as Date | null,
  });

  const [cacheStatus, setCacheStatus] = useState({
    hasCache: false,
    age: 0,
    isExpired: true,
    lastUpdate: null as Date | null,
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    loadCacheStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await currencyService.getUpdateSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.warn('Failed to load currency settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCacheStatus = async () => {
    try {
      const status = await currencyService.getCacheStatus();
      setCacheStatus(status);
    } catch (error) {
      console.warn('Failed to load cache status:', error);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await currencyService.updateSettings(newSettings);
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.currency.calculator.errors.save_failed'));
    }
  };

  const handleManualUpdate = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsUpdating(true);

    try {
      const result = await currencyService.manualUpdate();

      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(t('common.success'), t('settings.currency.calculator.update_success'));
        await loadCacheStatus();
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(t('common.error'), result.error || t('settings.currency.calculator.errors.update_failed'));
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('settings.currency.calculator.errors.update_failed'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      t('settings.currency.calculator.clear_cache.title'),
      t('settings.currency.calculator.clear_cache.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            try {
              await currencyService.clearCache();
              await loadCacheStatus();
              Alert.alert(t('common.success'), t('settings.currency.calculator.clear_cache.success'));
            } catch (error) {
              Alert.alert(t('common.error'), t('settings.currency.calculator.errors.clear_cache_failed'));
            }
          },
        },
      ]
    );
  };

  const formatAge = (ageMs: number): string => {
    const hours = Math.floor(ageMs / (1000 * 60 * 60));
    const minutes = Math.floor((ageMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return t('settings.currency.calculator.cache_age_hours', { hours, minutes });
    } else {
      return t('settings.currency.calculator.cache_age_minutes', { minutes });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
        <AppHeader
          title={t('settings.currency.calculator.title')}
          variant="large"
          showBack={true}
          onBackPress={() => router.push('/(tabs)/settings')}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#007AFF'} />
          <Text style={[styles.loadingText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {t('settings.currency.calculator.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
      <AppHeader
        title={t('settings.currency.calculator.title')}
        variant="large"
        showBack={true}
        onBackPress={() => router.push('/(tabs)/settings')}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Update Policy Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {t('settings.currency.calculator.sections.update_policy')}
          </Text>

          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                t('settings.currency.calculator.update_policy.title'),
                t('settings.currency.calculator.update_policy.message'),
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: t('settings.currency.calculator.update_policy.auto'), onPress: () => updateSetting('updatePolicy', 'auto') },
                  { text: t('settings.currency.calculator.update_policy.wifi_only'), onPress: () => updateSetting('updatePolicy', 'wifi-only') },
                  { text: t('settings.currency.calculator.update_policy.manual'), onPress: () => updateSetting('updatePolicy', 'manual') },
                ]
              );
            }}
            activeOpacity={0.7}
          >
            <Card variant="clean" style={styles.settingsCard}>
              <View style={styles.settingsRow}>
                <View style={styles.settingsInfo}>
                  <Icon name="refresh" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                  <View style={styles.settingsText}>
                    <Text style={[styles.settingsTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                      {t('settings.currency.calculator.update_policy.title')}
                    </Text>
                    <Text style={[styles.settingsSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                      {settings.updatePolicy === 'auto' && t('settings.currency.calculator.update_policy.auto')}
                      {settings.updatePolicy === 'wifi-only' && t('settings.currency.calculator.update_policy.wifi_only')}
                      {settings.updatePolicy === 'manual' && t('settings.currency.calculator.update_policy.manual')}
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={16} color={isDark ? '#8E8E93' : '#6D6D70'} />
              </View>
            </Card>
          </TouchableOpacity>

          <Card variant="clean" style={styles.settingsCard}>
            <View style={styles.settingsRow}>
              <View style={styles.settingsInfo}>
                <Icon name="signal" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                <View style={styles.settingsText}>
                  <Text style={[styles.settingsTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                    {t('settings.currency.calculator.mobile_data.title')}
                  </Text>
                  <Text style={[styles.settingsSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                    {t('settings.currency.calculator.mobile_data.subtitle')}
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.allowMobileData}
                onValueChange={(value) => updateSetting('allowMobileData', value)}
                trackColor={{ false: isDark ? '#3A3A3C' : '#E5E5EA', true: '#007AFF' }}
                thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </Card>
        </View>

        {/* Exchange Rates Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {t('settings.currency.calculator.sections.exchange_rates')}
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/settings/exchange-rates')}
            activeOpacity={0.7}
          >
            <Card variant="clean" style={styles.settingsCard}>
              <View style={styles.settingsRow}>
                <View style={styles.settingsInfo}>
                  <Icon name="arrow-left-right" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                  <View style={styles.settingsText}>
                    <Text style={[styles.settingsTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                      {t('settings.currency.calculator.exchange_rates.title')}
                    </Text>
                    <Text style={[styles.settingsSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                      {t('settings.currency.calculator.exchange_rates.subtitle')}
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={16} color={isDark ? '#8E8E93' : '#6D6D70'} />
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Cache Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {t('settings.currency.calculator.sections.cache')}
          </Text>

          <Card variant="clean" style={styles.settingsCard}>
            <View style={styles.settingsColumn}>
              <View style={styles.settingsRow}>
                <View style={styles.settingsInfo}>
                  <Icon name="clock" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                  <View style={styles.settingsText}>
                    <Text style={[styles.settingsTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                      {t('settings.currency.calculator.cache_status.title')}
                    </Text>
                    <Text style={[styles.settingsSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                      {cacheStatus.hasCache
                        ? `${formatAge(cacheStatus.age)} • ${cacheStatus.isExpired ? t('settings.currency.calculator.cache_status.expired') : t('settings.currency.calculator.cache_status.current')}`
                        : t('settings.currency.calculator.cache_status.no_cache')
                      }
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: cacheStatus.hasCache && !cacheStatus.isExpired ? '#30D158' : '#FF9500' }
                ]} />
              </View>

              {cacheStatus.lastUpdate && (
                <Text style={[styles.lastUpdateText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                  {t('settings.currency.calculator.last_update', {
                    date: cacheStatus.lastUpdate.toLocaleDateString('de-CH'),
                    time: cacheStatus.lastUpdate.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })
                  })}
                </Text>
              )}
            </View>
          </Card>

          <TouchableOpacity
            onPress={handleManualUpdate}
            disabled={isUpdating}
            activeOpacity={0.7}
          >
            <Card variant="clean" style={styles.settingsCard}>
              <View style={styles.settingsRow}>
                <View style={styles.settingsInfo}>
                  <Icon name="download" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                  <View style={styles.settingsText}>
                    <Text style={[styles.settingsTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                      {t('settings.currency.calculator.update_now.title')}
                    </Text>
                    <Text style={[styles.settingsSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                      {t('settings.currency.calculator.update_now.subtitle')}
                    </Text>
                  </View>
                </View>
                {isUpdating ? (
                  <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : '#007AFF'} />
                ) : (
                  <Icon name="chevron-right" size={16} color={isDark ? '#8E8E93' : '#6D6D70'} />
                )}
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearCache}
            activeOpacity={0.7}
          >
            <Card variant="clean" style={styles.settingsCard}>
              <View style={styles.settingsRow}>
                <View style={styles.settingsInfo}>
                  <Icon name="delete" size={24} color="#FF3B30" />
                  <View style={styles.settingsText}>
                    <Text style={[styles.settingsTitle, { color: '#FF3B30' }]}>
                      {t('settings.currency.calculator.clear_cache_button.title')}
                    </Text>
                    <Text style={[styles.settingsSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                      {t('settings.currency.calculator.clear_cache_button.subtitle')}
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={16} color={isDark ? '#8E8E93' : '#6D6D70'} />
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    fontFamily: 'System',
  },
  settingsCard: {
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsColumn: {
    gap: 12,
  },
  settingsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  settingsText: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'System',
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'System',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lastUpdateText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'System',
    marginLeft: 40,
  },
});