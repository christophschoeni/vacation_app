import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';

// Import translation files
import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import it from './locales/it.json';

const LANGUAGE_STORAGE_KEY = '@vacation_assist_language';

// Supported languages
export const SUPPORTED_LOCALES = ['de', 'en', 'fr', 'it'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

class TranslationService {
  private i18n: I18n;
  private currentLocale: string = 'de';
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.i18n = new I18n({
      de,
      en,
      fr,
      it,
    });

    // Set default locale and fallback
    this.i18n.defaultLocale = 'de';
    this.i18n.locale = 'de';
    this.i18n.enableFallback = true;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Detects the device locale and returns a supported locale
   * Falls back to 'de' if the device locale is not supported
   */
  private detectDeviceLocale(): SupportedLocale {
    try {
      const deviceLocales = Localization.getLocales();

      // Check primary locale first
      if (deviceLocales && deviceLocales.length > 0) {
        const primaryLocale = deviceLocales[0].languageCode;

        // Check if the language code matches any of our supported locales
        if (SUPPORTED_LOCALES.includes(primaryLocale as SupportedLocale)) {
          return primaryLocale as SupportedLocale;
        }
      }

      // Fallback to German
      return 'de';
    } catch (error) {
      logger.warn('Failed to detect device locale, using default (de):', error);
      return 'de';
    }
  }

  async initialize(): Promise<void> {
    try {
      // Try to load saved language preference
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

      if (savedLanguage && SUPPORTED_LOCALES.includes(savedLanguage as SupportedLocale)) {
        this.currentLocale = savedLanguage;
      } else {
        // Auto-detect device locale
        this.currentLocale = this.detectDeviceLocale();
        logger.debug(`Auto-detected locale: ${this.currentLocale}`);
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
      if (SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
        this.currentLocale = locale;
        this.i18n.locale = locale;
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
        logger.debug(`Language changed to: ${locale}`);
        this.notifyListeners();
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

  getSupportedLanguages(): Array<{ code: string; name: string; nativeName: string; flag: string }> {
    return [
      { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
      { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
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
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const unsubscribe = translationService.subscribe(() => {
      forceUpdate(prev => prev + 1);
    });
    return unsubscribe;
  }, []);

  return {
    t: translationService.t.bind(translationService),
    setLanguage: translationService.setLanguage.bind(translationService),
    getCurrentLanguage: translationService.getCurrentLanguage.bind(translationService),
    getSupportedLanguages: translationService.getSupportedLanguages.bind(translationService),
  };
};