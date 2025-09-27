import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

// Import translation files
import de from './locales/de.json';
import en from './locales/en.json';

const LANGUAGE_STORAGE_KEY = '@vacation_assist_language';

class TranslationService {
  private i18n: I18n;
  private currentLocale: string = 'de';

  constructor() {
    this.i18n = new I18n({
      de,
      en,
    });

    // Set default locale and fallback
    this.i18n.defaultLocale = 'de';
    this.i18n.locale = 'de';
    this.i18n.enableFallback = true;
  }

  async initialize(): Promise<void> {
    try {
      // Try to load saved language preference
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

      if (savedLanguage) {
        this.currentLocale = savedLanguage;
      } else {
        // For now, use German as default until development build is ready
        this.currentLocale = 'de';
        logger.debug('Using default locale (de) until expo-localization is available');
      }

      this.i18n.locale = this.currentLocale;
      logger.debug(`i18n initialized with locale: ${this.currentLocale}`);
    } catch (error) {
      logger.warn('Failed to initialize i18n, using default locale (de):', error);
      this.i18n.locale = 'de';
    }
  }

  t(key: string, options?: object): string {
    return this.i18n.t(key, options);
  }

  async setLanguage(locale: string): Promise<void> {
    try {
      if (['de', 'en'].includes(locale)) {
        this.currentLocale = locale;
        this.i18n.locale = locale;
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
        logger.debug(`Language changed to: ${locale}`);
      } else {
        logger.warn(`Unsupported locale: ${locale}`);
      }
    } catch (error) {
      logger.error('Failed to save language preference:', error);
    }
  }

  getCurrentLanguage(): string {
    return this.currentLocale;
  }

  getSupportedLanguages(): Array<{ code: string; name: string; nativeName: string }> {
    return [
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'en', name: 'English', nativeName: 'English' },
    ];
  }
}

export const translationService = new TranslationService();

// Convenience function for translations
export const t = (key: string, options?: object): string => {
  return translationService.t(key, options);
};

// Hook for React components
export const useTranslation = () => {
  return {
    t: translationService.t.bind(translationService),
    setLanguage: translationService.setLanguage.bind(translationService),
    getCurrentLanguage: translationService.getCurrentLanguage.bind(translationService),
    getSupportedLanguages: translationService.getSupportedLanguages.bind(translationService),
  };
};