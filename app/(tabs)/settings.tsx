import { Card, Icon, IconName } from '@/components/design';
import AppHeader from '@/components/ui/AppHeader';
import { router, useFocusEffect } from 'expo-router';
import React from 'react';
import * as Haptics from 'expo-haptics';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/lib/i18n';

interface SettingsItem {
  id: string;
  titleKey: string;
  subtitleKey: string;
  icon: IconName;
  route: string;
}

const SETTINGS_ITEMS: SettingsItem[] = [
  {
    id: 'language',
    titleKey: 'settings.language.title',
    subtitleKey: 'settings.language.subtitle',
    icon: 'globe',
    route: '/settings/language',
  },
  {
    id: 'templates',
    titleKey: 'settings.templates.title',
    subtitleKey: 'settings.templates.subtitle',
    icon: 'notepad-text',
    route: '/settings/templates',
  },
  {
    id: 'categories',
    titleKey: 'settings.categories.title',
    subtitleKey: 'settings.categories.subtitle',
    icon: 'settings',
    route: '/settings/categories',
  },
  {
    id: 'currency',
    titleKey: 'settings.currency.title',
    subtitleKey: 'settings.currency.subtitle',
    icon: 'currency',
    route: '/settings/currency',
  },
  {
    id: 'exchange_rates',
    titleKey: 'settings.exchange_rates.title',
    subtitleKey: 'settings.exchange_rates.subtitle',
    icon: 'arrow-left-right',
    route: '/settings/exchange-rates',
  },
  {
    id: 'notifications',
    titleKey: 'settings.notifications.title',
    subtitleKey: 'settings.notifications.subtitle',
    icon: 'warning',
    route: '/settings/notifications',
  },
];

// Debug items removed - no longer needed with SQLite CASCADE DELETE

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const { t, currentLanguage } = useTranslation();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const [, forceUpdate] = React.useState(0);

  // Force re-render when screen comes back into focus
  // This ensures translations update when returning from language selection
  useFocusEffect(
    React.useCallback(() => {
      forceUpdate(prev => prev + 1);
    }, [currentLanguage])
  );

  const handleSettingsItemPress = async (route: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    console.log('Navigating to:', route);

    try {
      // Use push for reliable navigation from settings
      router.push(route as any);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to navigate if push fails
      try {
        router.navigate(route as any);
      } catch (navError) {
        console.error('Navigate fallback also failed:', navError);
      }
    }
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* iOS-style large title in content area */}
        <View style={styles.titleSection}>
          <Text style={[styles.largeTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {t('settings.title')}
          </Text>
        </View>

        <View style={styles.section}>
          {SETTINGS_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleSettingsItemPress(item.route)}
              activeOpacity={0.7}
            >
              <Card variant="clean" style={styles.settingsCard}>
                <View style={styles.settingsRow}>
                  <View style={styles.settingsInfo}>
                    <Icon name={item.icon} size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                    <View style={styles.settingsText}>
                      <Text style={[styles.settingsTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        {t(item.titleKey)}
                      </Text>
                      <Text style={[styles.settingsSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                        {t(item.subtitleKey)}
                      </Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={16} color={isDark ? '#8E8E93' : '#6D6D70'} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>


        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {t('settings.about.title')}
          </Text>

          <Card variant="clean" style={styles.settingsCard}>
            <View style={styles.appInfo}>
              <Text style={[styles.appName, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                Reise Budget
              </Text>
              <Text style={[styles.appVersion, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                {t('settings.about.version')} 1.0.0
              </Text>
            </View>
          </Card>

          <TouchableOpacity
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const url = 'https://vacation-budget.vomschoeni.com/';
              const canOpen = await Linking.canOpenURL(url);
              if (canOpen) {
                await Linking.openURL(url);
              }
            }}
            activeOpacity={0.7}
          >
            <Card variant="clean" style={styles.settingsCard}>
              <View style={styles.settingsRow}>
                <View style={styles.settingsInfo}>
                  <Icon name="globe" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                  <View style={styles.settingsText}>
                    <Text style={[styles.settingsTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                      {t('settings.about.website')}
                    </Text>
                    <Text style={[styles.settingsSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                      vacation-budget.vomschoeni.com
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
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
  appInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'System',
  },
});