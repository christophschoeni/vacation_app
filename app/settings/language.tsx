import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Icon, GroupedList, GroupedListFooter } from '@/components/design';
import { Spacing, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';
import AppHeader from '@/components/ui/AppHeader';
import { useTranslation } from '@/lib/i18n';

export default function LanguageScreen() {
  const theme = useIOSTheme();
  // `locale` is reactive state; calling getCurrentLanguage() during render
  // instead would read the service directly, which React Compiler is free to
  // memoise away - the check mark then never moved.
  const { t, locale, setLanguage, getSupportedLanguages } = useTranslation();

  const currentLanguage = locale;
  const supportedLanguages = getSupportedLanguages();

  const handleLanguageSelect = async (languageCode: string) => {
    await setLanguage(languageCode);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <AppHeader
        title={t('settings.language.title')}
        variant="large"
        showBack={true}
        onBackPress={() => router.push('/(tabs)/settings')}
        useSafeAreaPadding={true}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GroupedList>
          {supportedLanguages.map((language) => (
            <TouchableOpacity
              key={language.code}
              onPress={() => handleLanguageSelect(language.code)}
              activeOpacity={0.7}
              style={styles.row}
              accessibilityRole="button"
              accessibilityLabel={`${language.nativeName}, ${language.name}`}
              accessibilityState={{ selected: currentLanguage === language.code }}
            >
              <Text style={styles.flag}>{language.flag || '🌐'}</Text>
              <View style={styles.text}>
                <Text style={[styles.name, { color: theme.label }]}>
                  {language.nativeName}
                </Text>
                <Text style={[styles.englishName, { color: theme.secondaryLabel }]}>
                  {language.name}
                </Text>
              </View>
              {currentLanguage === language.code && (
                <Icon name="check" size={20} color={theme.accent} />
              )}
            </TouchableOpacity>
          ))}
        </GroupedList>

        <GroupedListFooter text={t('settings.language.restart_required')} />
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
    paddingBottom: 120,
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
  text: {
    flex: 1,
  },
  name: {
    fontSize: Typography.fontSize.callout,
  },
  englishName: {
    fontSize: Typography.fontSize.caption1,
    marginTop: 1,
  },
});
