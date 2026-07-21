import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { useState, useEffect, useMemo } from 'react';
import { logger } from '../utils/logger';
import type { TranslationKey } from './generated-keys';

export type { TranslationKey };

// Import translation files
import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import es from './locales/es.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';

const LANGUAGE_STORAGE_KEY = '@vacation_assist_language';

// Supported languages
export const SUPPORTED_LOCALES = ['de', 'en', 'fr', 'it', 'es', 'zh', 'ja'] as const;
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
      es,
      zh,
      ja,
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

  t(key: TranslationKey, options?: object): string {
    return this.i18n.t(key, options);
  }

  /**
   * Escape hatch for keys assembled at runtime, e.g.
   * `checklist.categories.${category}`, which cannot be checked statically.
   */
  tDynamic(key: string, options?: object): string {
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

  getSupportedLanguages(): { code: string; name: string; nativeName: string; flag: string }[] {
    return [
      { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
      { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
      { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
      { code: 'zh', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    ];
  }
}

export const translationService = new TranslationService();

// Convenience function for translations outside React components
export const t = (key: TranslationKey, options?: object): string => {
  return translationService.t(key, options);
};

/**
 * Translation hook.
 *
 * The returned object is memoised per locale. Previously every render produced
 * fresh `.bind()` results, which made `t` unusable as a hook dependency: adding
 * it to a dependency array recreated the callback on every render and sent the
 * consuming effect into a loop. Several screens had to suppress
 * react-hooks/exhaustive-deps because of this.
 */
export const useTranslation = () => {
  const [locale, setLocale] = useState(() => translationService.getCurrentLanguage());

  useEffect(() => {
    return translationService.subscribe(() => {
      setLocale(translationService.getCurrentLanguage());
    });
  }, []);

  return useMemo(
    () => ({
      locale,
      t: (key: TranslationKey, options?: object) => translationService.t(key, options),
      tDynamic: (key: string, options?: object) => translationService.tDynamic(key, options),
      setLanguage: (next: string) => translationService.setLanguage(next),
      getCurrentLanguage: () => translationService.getCurrentLanguage(),
      getSupportedLanguages: () => translationService.getSupportedLanguages(),
    }),
    // `locale` is the only input that changes what t() returns; re-creating the
    // object on a locale switch is exactly what re-renders consumers.
    [locale]
  );
};