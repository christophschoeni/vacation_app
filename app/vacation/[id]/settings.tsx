import { Icon, GroupedList, GroupedListHeader, type IconName } from '@/components/design';
import { Spacing, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';
import AppHeader from '@/components/ui/AppHeader';
import { router } from 'expo-router';
import { useTranslation } from '@/lib/i18n';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVacationId } from '@/contexts/VacationContext';
import { useTabBarPadding } from '@/hooks/use-tab-bar-padding';

export default function VacationSettingsScreen() {
  const tabBarPadding = useTabBarPadding();
  const theme = useIOSTheme();
  const { t } = useTranslation();
  const vacationId = useVacationId();

  // Modular and expandable: further per-vacation settings rows can be added.
  const settingsItems: {
    id: string;
    title: string;
    subtitle: string;
    icon: IconName;
    onPress: () => void;
  }[] = [
    {
      id: 'vacation-details',
      title: t('vacation.settings_screen.vacation_details.title'),
      subtitle: t('vacation.settings_screen.vacation_details.subtitle'),
      icon: 'settings',
      onPress: () => {
        if (vacationId) router.push(`/vacation-edit?vacationId=${vacationId}`);
      },
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <AppHeader
        variant="large"
        title={t('vacation.settings_screen.title')}
        showBack={true}
        onBackPress={() => router.push('/(tabs)')}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <GroupedListHeader title={t('vacation.settings_screen.general')} />

        <GroupedList>
          {settingsItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              activeOpacity={0.7}
              style={styles.row}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}. ${item.subtitle}`}
            >
              <Icon name={item.icon} size={22} color={theme.accent} />
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: theme.label }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.rowSubtitle, { color: theme.secondaryLabel }]} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
              <Icon name="chevron-right" size={16} color={theme.tertiaryLabel} />
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 0,
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
});
