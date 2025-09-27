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
import { Card, Icon } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/lib/i18n';

export default function LanguageScreen() {
  const colorScheme = useColorScheme();
  const { t, getCurrentLanguage, setLanguage, getSupportedLanguages } = useTranslation();
  const isDark = colorScheme === 'dark';
  const currentLanguage = getCurrentLanguage();
  const supportedLanguages = getSupportedLanguages();

  const handleLanguageSelect = async (languageCode: string) => {
    await setLanguage(languageCode);
    // The app would need to be restarted for full effect, but immediate UI will update
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel={t('common.back')}
        >
          <Icon name="arrow-left" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
          {t('settings.language.title')}
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
            {t('settings.language.subtitle')}
          </Text>

          {supportedLanguages.map((language) => (
            <TouchableOpacity
              key={language.code}
              onPress={() => handleLanguageSelect(language.code)}
              activeOpacity={0.7}
            >
              <Card variant="clean" style={styles.languageCard}>
                <View style={styles.languageRow}>
                  <View style={styles.languageInfo}>
                    <View style={styles.languageFlag}>
                      <Text style={[styles.flagText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        {language.code === 'de' ? '🇩🇪' : '🇺🇸'}
                      </Text>
                    </View>
                    <View style={styles.languageText}>
                      <Text style={[styles.languageName, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        {language.nativeName}
                      </Text>
                      <Text style={[styles.languageEnglishName, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                        {language.name}
                      </Text>
                    </View>
                  </View>
                  {currentLanguage === language.code && (
                    <Icon name="check" size={20} color="#007AFF" />
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Hinweis
          </Text>
          <Card variant="clean" style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Icon name="info" size={20} color={isDark ? '#8E8E93' : '#6D6D70'} />
              <Text style={[styles.infoText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                Die App muss neu gestartet werden, damit alle Änderungen wirksam werden.
              </Text>
            </View>
          </Card>
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    fontFamily: 'System',
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 16,
    fontFamily: 'System',
  },
  languageCard: {
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  languageFlag: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagText: {
    fontSize: 20,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'System',
    marginBottom: 2,
  },
  languageEnglishName: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'System',
  },
  infoCard: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'System',
    lineHeight: 20,
    flex: 1,
  },
});