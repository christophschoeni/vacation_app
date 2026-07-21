import { Icon, IconName, GroupedList, GroupedListHeader } from '@/components/design';
import { Spacing, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';
import AppHeader from '@/components/ui/AppHeader';
import { router } from 'expo-router';
import React from 'react';
import * as Haptics from 'expo-haptics';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation, type TranslationKey } from '@/lib/i18n';
import { useTabBarPadding } from '@/hooks/use-tab-bar-padding';

interface SettingsItem {
  id: string;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
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

/** A single navigable row inside one of the grouped settings lists. */
function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const theme = useIOSTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
    >
      <Icon name={icon} size={22} color={theme.accent} />
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: theme.label }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.rowSubtitle, { color: theme.secondaryLabel }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Icon name="chevron-right" size={16} color={theme.tertiaryLabel} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const tabBarPadding = useTabBarPadding();
  const theme = useIOSTheme();
  const { t } = useTranslation();

  const handleSettingsItemPress = async (route: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Use push for reliable navigation from settings
      router.push(route as any);
    } catch {
      // Fallback to navigate if push fails
      try {
        router.navigate(route as any);
      } catch {
        // Navigation failed - silent fail
      }
    }
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={[]}>
      <AppHeader
        title={t('settings.title')}
        variant="large"
        useSafeAreaPadding={true}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarPadding }]}
        showsVerticalScrollIndicator={false}
      >

        <GroupedList>
          {SETTINGS_ITEMS.map((item) => (
            <SettingsRow
              key={item.id}
              icon={item.icon}
              title={t(item.titleKey)}
              subtitle={t(item.subtitleKey)}
              onPress={() => handleSettingsItemPress(item.route)}
            />
          ))}
        </GroupedList>

        <GroupedListHeader title={t('settings.about.title')} />

        <GroupedList>
          <SettingsRow
            icon="globe"
            title={t('settings.about.website')}
            subtitle="vacation-budget.vomschoeni.com"
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const url = 'https://vacation-budget.vomschoeni.com/';
              const canOpen = await Linking.canOpenURL(url);
              if (canOpen) {
                await Linking.openURL(url);
              }
            }}
          />
        </GroupedList>

        <Text style={[styles.version, { color: theme.secondaryLabel }]}>
          Reise Budget · {t('settings.about.version')} 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
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
    // paddingBottom is set dynamically in contentContainerStyle with safe area insets
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: Typography.fontSize.callout,
  },
  rowSubtitle: {
    fontSize: Typography.fontSize.caption1,
    marginTop: 1,
  },
  version: {
    fontSize: Typography.fontSize.caption1,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
});