import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card, Icon } from '@/components/design';
import AppHeader from '@/components/ui/AppHeader';
import { useTranslation } from '@/lib/i18n';

export default function LanguageScreen() {
  const colorScheme = useColorScheme();
  const { t, getCurrentLanguage, setLanguage, getSupportedLanguages } = useTranslation();
  const isDark = colorScheme === 'dark';

  // Call these inside the render to ensure they update when language changes
  const currentLanguage = getCurrentLanguage();
  const supportedLanguages = getSupportedLanguages();

  const handleLanguageSelect = async (languageCode: string) => {
    await setLanguage(languageCode);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
      <AppHeader
        showBack={true}
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* iOS-style large title in content area */}
        <View style={styles.titleSection}>
          <Text style={[styles.largeTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {t('settings.language.title')}
          </Text>
        </View>

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
                        {language.flag || '🌐'}
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
          <Card variant="clean" style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Icon name="info" size={20} color={isDark ? '#8E8E93' : '#6D6D70'} />
              <Text style={[styles.infoText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                {t('settings.language.restart_required')}
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