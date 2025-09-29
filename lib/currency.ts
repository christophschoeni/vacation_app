import { appSettingsRepository } from '@/lib/db/repositories/app-settings-repository';

export interface ExchangeRates {
  [currency: string]: number;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export type UpdatePolicy = 'auto' | 'manual' | 'wifi-only';

export interface CurrencyUpdateSettings {
  updatePolicy: UpdatePolicy;
  allowMobileData: boolean;
  cacheExpiryHours: number;
  lastUpdate: Date | null;
}

const DEFAULT_CACHE_DURATION = 86400000; // 24 hours in milliseconds

// Popular currencies (most commonly used)
export const POPULAR_CURRENCIES: CurrencyInfo[] = [
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
];

// Complete list of all supported currencies
export const ALL_CURRENCIES: CurrencyInfo[] = [
  // Popular currencies first
  ...POPULAR_CURRENCIES,

  // European currencies
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', flag: '🇧🇬' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', flag: '🇭🇷' },
  { code: 'ISK', name: 'Icelandic Krona', symbol: 'kr', flag: '🇮🇸' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'din', flag: '🇷🇸' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', flag: '🇺🇦' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br', flag: '🇧🇾' },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'lei', flag: '🇲🇩' },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', flag: '🇲🇰' },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L', flag: '🇦🇱' },
  { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM', flag: '🇧🇦' },

  // Asian currencies
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨', flag: '🇱🇰' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', flag: '🇳🇵' },
  { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf', flag: '🇲🇻' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', flag: '🇲🇲' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', flag: '🇰🇭' },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭', flag: '🇱🇦' },
  { code: 'BND', name: 'Brunei Dollar', symbol: 'B$', flag: '🇧🇳' },
  { code: 'MOP', name: 'Macanese Pataca', symbol: 'P', flag: '🇲🇴' },

  // Middle Eastern currencies
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼', flag: '🇶🇦' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', flag: '🇧🇭' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼' },
  { code: 'OMR', name: 'Omani Rial', symbol: '﷼', flag: '🇴🇲' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', flag: '🇯🇴' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: '£', flag: '🇱🇧' },
  { code: 'SYP', name: 'Syrian Pound', symbol: '£', flag: '🇸🇾' },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د', flag: '🇮🇶' },
  { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', flag: '🇮🇷' },
  { code: 'AFN', name: 'Afghan Afghani', symbol: '؋', flag: '🇦🇫' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', flag: '🇮🇱' },

  // African currencies
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£', flag: '🇪🇬' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', flag: '🇲🇦' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', flag: '🇹🇳' },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', flag: '🇩🇿' },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د', flag: '🇱🇾' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', flag: '🇬🇭' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', flag: '🇪🇹' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', flag: '🇺🇬' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', flag: '🇷🇼' },
  { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', flag: '🌍' },
  { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', flag: '🌍' },
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P', flag: '🇧🇼' },
  { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', flag: '🇳🇦' },
  { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'L', flag: '🇸🇿' },
  { code: 'LSL', name: 'Lesotho Loti', symbol: 'L', flag: '🇱🇸' },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', flag: '🇲🇿' },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', flag: '🇿🇲' },
  { code: 'ZWL', name: 'Zimbabwean Dollar', symbol: 'Z$', flag: '🇿🇼' },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', flag: '🇲🇺' },
  { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨', flag: '🇸🇨' },

  // North American currencies
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', flag: '🇬🇹' },
  { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$', flag: '🇧🇿' },
  { code: 'CRC', name: 'Costa Rican Colon', symbol: '₡', flag: '🇨🇷' },
  { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', flag: '🇭🇳' },
  { code: 'NIO', name: 'Nicaraguan Cordoba', symbol: 'C$', flag: '🇳🇮' },
  { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', flag: '🇵🇦' },
  { code: 'SVC', name: 'Salvadoran Colon', symbol: '$', flag: '🇸🇻' },
  { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', flag: '🇩🇴' },
  { code: 'HTG', name: 'Haitian Gourde', symbol: 'G', flag: '🇭🇹' },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', flag: '🇯🇲' },
  { code: 'TTD', name: 'Trinidad & Tobago Dollar', symbol: 'TT$', flag: '🇹🇹' },
  { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$', flag: '🇧🇧' },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$', flag: '🌴' },
  { code: 'BSD', name: 'Bahamian Dollar', symbol: 'B$', flag: '🇧🇸' },
  { code: 'KYD', name: 'Cayman Islands Dollar', symbol: 'CI$', flag: '🇰🇾' },
  { code: 'BMD', name: 'Bermudian Dollar', symbol: 'BD$', flag: '🇧🇲' },

  // South American currencies
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', flag: '🇨🇱' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', flag: '🇨🇴' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', flag: '🇵🇪' },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', flag: '🇺🇾' },
  { code: 'PYG', name: 'Paraguayan Guarani', symbol: 'Gs', flag: '🇵🇾' },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: '$b', flag: '🇧🇴' },
  { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs', flag: '🇻🇪' },
  { code: 'GYD', name: 'Guyanese Dollar', symbol: 'G$', flag: '🇬🇾' },
  { code: 'SRD', name: 'Surinamese Dollar', symbol: 'Sr$', flag: '🇸🇷' },
  { code: 'FKP', name: 'Falkland Islands Pound', symbol: '£', flag: '🇫🇰' },

  // Oceania currencies
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$', flag: '🇫🇯' },
  { code: 'PGK', name: 'Papua New Guinea Kina', symbol: 'K', flag: '🇵🇬' },
  { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$', flag: '🇸🇧' },
  { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT', flag: '🇻🇺' },
  { code: 'WST', name: 'Samoan Tala', symbol: 'WS$', flag: '🇼🇸' },
  { code: 'TOP', name: 'Tongan Pa\'anga', symbol: 'T$', flag: '🇹🇴' },
  { code: 'XPF', name: 'CFP Franc', symbol: '₣', flag: '🇵🇫' },

  // Additional major currencies
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', flag: '🇰🇿' },
  { code: 'UZS', name: 'Uzbekistani Som', symbol: 'лв', flag: '🇺🇿' },
  { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'лв', flag: '🇰🇬' },
  { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'SM', flag: '🇹🇯' },
  { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'T', flag: '🇹🇲' },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', flag: '🇦🇿' },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾', flag: '🇬🇪' },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏', flag: '🇦🇲' },
  { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮', flag: '🇲🇳' },
  { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.', flag: '🇧🇹' },
];

// Backward compatibility - use ALL_CURRENCIES as default CURRENCIES export
export const CURRENCIES: CurrencyInfo[] = ALL_CURRENCIES;

class CurrencyService {
  private apiKey = 'demo'; // Using demo mode for now
  private baseUrl = 'https://api.exchangerate-api.com/v4/latest';
  private alternativeUrl = 'https://api.fxratesapi.com/latest'; // More accurate API
  private ecbUrl = 'https://api.exchangerate.host/latest'; // European Central Bank data
  private currencyApiUrl = 'https://api.currencyapi.com/v3/latest'; // High-accuracy API
  private freeForexUrl = 'https://www.freeforexapi.com/api/live'; // Real-time forex data
  private defaultSettings: CurrencyUpdateSettings = {
    updatePolicy: 'auto',
    allowMobileData: true,
    cacheExpiryHours: 24,
    lastUpdate: null,
  };

  // Fallback rates for offline use (approximate rates as of late 2024)
  private fallbackRates: ExchangeRates = {
    'CHF': 1.0,
    'EUR': 0.93,
    'USD': 1.11,
    'GBP': 0.80,
    'JPY': 164.5,
    'CAD': 1.48,
    'AUD': 1.66,
    'SEK': 11.45,
    'NOK': 11.89,
    'DKK': 6.95,
    'TRY': 52.18, // Turkish Lira (updated rate as of Sep 2024)
  };

  async getExchangeRates(baseCurrency: string = 'CHF', forceUpdate: boolean = false): Promise<ExchangeRates> {
    try {
      const settings = await appSettingsRepository.getCurrencySettings();

      // Check cache first unless force update is requested
      if (!forceUpdate) {
        const cachedRates = await this.getCachedRates();
        if (cachedRates) {
          return cachedRates;
        }
      }

      // Check if we should fetch based on update policy
      if (!forceUpdate && settings.updatePolicy === 'manual') {
        console.warn('Manual update policy active, using cached/fallback rates');
        return this.fallbackRates;
      }

      // Check network connectivity and policy
      const canFetch = await this.canFetchRates(settings);
      if (!canFetch && !forceUpdate) {
        console.warn('Network policy prevents fetching, using cached/fallback rates');
        return this.fallbackRates;
      }

      // Fetch fresh rates using improved multi-source approach
      const rates = await this.fetchRatesWithFallback(baseCurrency);

      // Cache the rates and update settings
      await this.cacheRates(rates);
      await appSettingsRepository.setLastRateUpdate(new Date());

      return rates;
    } catch (error) {
      console.warn('Failed to fetch exchange rates, using fallback:', error);
      return this.fallbackRates;
    }
  }

  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rates = await this.getExchangeRates('CHF'); // Use CHF as base

    // Convert from source currency to CHF, then to target currency
    let chfAmount = amount;
    if (fromCurrency !== 'CHF') {
      chfAmount = amount / (rates[fromCurrency] || 1);
    }

    let targetAmount = chfAmount;
    if (toCurrency !== 'CHF') {
      targetAmount = chfAmount * (rates[toCurrency] || 1);
    }

    return Math.round(targetAmount * 100) / 100;
  }

  async convertToCHF(amount: number, fromCurrency: string): Promise<number> {
    return this.convertCurrency(amount, fromCurrency, 'CHF');
  }

  formatCurrency(amount: number, currency: string): string {
    const currencyInfo = CURRENCIES.find(c => c.code === currency);
    const symbol = currencyInfo?.symbol || currency;

    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount).replace(currency, symbol);
  }

  getCurrencyInfo(code: string): CurrencyInfo | undefined {
    return CURRENCIES.find(c => c.code === code);
  }

  private async getCachedRates(): Promise<ExchangeRates | null> {
    try {
      const settings = await appSettingsRepository.getCurrencySettings();
      const timestamp = await appSettingsRepository.getCacheTimestamp();
      if (!timestamp) return null;

      const age = Date.now() - timestamp;
      const maxAge = settings.cacheExpiryHours * 3600000; // Convert hours to milliseconds
      if (age > maxAge) return null;

      const cachedData = await appSettingsRepository.getCachedRates();
      return cachedData ? JSON.parse(cachedData) : null;
    } catch {
      return null;
    }
  }

  private async cacheRates(rates: ExchangeRates): Promise<void> {
    try {
      await appSettingsRepository.setCachedRates(JSON.stringify(rates));
      await appSettingsRepository.setCacheTimestamp(Date.now());
    } catch (error) {
      console.warn('Failed to cache exchange rates:', error);
    }
  }

  // Get popular currencies for quick access
  getPopularCurrencies(): CurrencyInfo[] {
    return POPULAR_CURRENCIES;
  }

  // Get all available currencies
  getAllCurrencies(): CurrencyInfo[] {
    return ALL_CURRENCIES;
  }

  // Get currencies organized by sections for UI
  getCurrencySections(): { popular: CurrencyInfo[]; all: CurrencyInfo[] } {
    const popular = this.getPopularCurrencies();
    const all = ALL_CURRENCIES.filter(currency =>
      !popular.some(pop => pop.code === currency.code)
    );

    return { popular, all };
  }

  // Search currencies
  searchCurrencies(query: string): CurrencyInfo[] {
    const searchTerm = query.toLowerCase();
    return CURRENCIES.filter(currency =>
      currency.code.toLowerCase().includes(searchTerm) ||
      currency.name.toLowerCase().includes(searchTerm)
    );
  }

  // Settings management
  async getUpdateSettings(): Promise<CurrencyUpdateSettings> {
    try {
      const settings = await appSettingsRepository.getCurrencySettings();
      return settings;
    } catch {
      return this.defaultSettings;
    }
  }

  async updateSettings(settings: Partial<CurrencyUpdateSettings>): Promise<void> {
    try {
      await appSettingsRepository.setCurrencySettings({
        updatePolicy: settings.updatePolicy,
        allowMobileData: settings.allowMobileData,
        cacheExpiryHours: settings.cacheExpiryHours,
      });
    } catch (error) {
      console.warn('Failed to save currency settings:', error);
    }
  }

  async manualUpdate(baseCurrency: string = 'CHF'): Promise<{ success: boolean; rates?: ExchangeRates; error?: string }> {
    try {
      const rates = await this.getExchangeRates(baseCurrency, true);
      return { success: true, rates };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async canFetchRates(settings: CurrencyUpdateSettings): Promise<boolean> {
    try {
      // For Expo managed workflow, we'll use a simpler approach
      // and always allow fetching unless the policy is manual
      if (settings.updatePolicy === 'manual') {
        return false;
      }

      // Try a simple fetch test to check connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        await fetch('https://www.google.com', {
          method: 'HEAD',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return true;
      } catch {
        clearTimeout(timeoutId);
        return false;
      }
    } catch {
      // If we can't determine network state, be conservative
      return settings.updatePolicy === 'auto';
    }
  }

  async getLastUpdateTime(): Promise<Date | null> {
    return await appSettingsRepository.getLastRateUpdate();
  }

  async getCacheStatus(): Promise<{
    hasCache: boolean;
    age: number;
    isExpired: boolean;
    lastUpdate: Date | null;
  }> {
    try {
      const settings = await appSettingsRepository.getCurrencySettings();
      const timestamp = await appSettingsRepository.getCacheTimestamp();

      if (!timestamp) {
        return {
          hasCache: false,
          age: 0,
          isExpired: true,
          lastUpdate: settings.lastUpdate,
        };
      }

      const age = Date.now() - timestamp;
      const maxAge = settings.cacheExpiryHours * 3600000;

      return {
        hasCache: true,
        age,
        isExpired: age > maxAge,
        lastUpdate: settings.lastUpdate,
      };
    } catch {
      return {
        hasCache: false,
        age: 0,
        isExpired: true,
        lastUpdate: null,
      };
    }
  }

  async clearCache(): Promise<void> {
    try {
      await appSettingsRepository.clearExchangeRatesCache();
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  private async fetchRatesWithFallback(baseCurrency: string): Promise<ExchangeRates> {
    // More comprehensive API list with different data sources
    const apiConfigs = [
      {
        url: `https://api.exchangerate.host/latest?base=${baseCurrency}`,
        name: 'ExchangeRate.host',
        parser: (data: any) => data.rates
      },
      {
        url: `https://open.er-api.com/v6/latest/${baseCurrency}`,
        name: 'OpenExchangeRates',
        parser: (data: any) => data.rates
      },
      {
        url: `${this.baseUrl}/${baseCurrency}`,
        name: 'ExchangeRate-API',
        parser: (data: any) => data.rates
      },
      {
        url: `https://api.fxratesapi.com/latest?base=${baseCurrency}`,
        name: 'FxRatesAPI',
        parser: (data: any) => data.rates
      }
    ];

    const allRates: ExchangeRates[] = [];
    let successfulApi = '';

    // Try to get rates from multiple sources
    for (const config of apiConfigs) {
      try {
        console.log(`Fetching from ${config.name}...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(config.url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'VacationApp/1.0',
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const rates = config.parser(data);

        if (rates && typeof rates === 'object' && Object.keys(rates).length > 0) {
          allRates.push(rates);
          successfulApi = config.name;

          // Log the specific TRY rate for debugging
          if (rates.TRY) {
            const tryFor100CHF = (100 * rates.TRY).toFixed(2);
            console.log(`${config.name}: 100 CHF = ${tryFor100CHF} TRY (rate: ${rates.TRY})`);
          }

          // Use the first successful result for now
          // In future, we could implement averaging here
          return rates as ExchangeRates;
        }
      } catch (error) {
        console.warn(`${config.name} failed:`, error);
      }
    }

    // If no API worked, throw error
    throw new Error('All exchange rate APIs failed to provide valid data');
  }

  // Add method to manually override rates (for users who want more accurate rates)
  async setManualRate(fromCurrency: string, toCurrency: string, rate: number): Promise<void> {
    try {
      const currentRates = await this.getExchangeRates();

      // Update the specific rate
      if (fromCurrency === 'CHF') {
        currentRates[toCurrency] = rate;
      } else if (toCurrency === 'CHF') {
        currentRates[fromCurrency] = 1 / rate;
      }

      // Cache the updated rates
      await this.cacheRates(currentRates);
      console.log(`Manual rate set: ${fromCurrency}/${toCurrency} = ${rate}`);
    } catch (error) {
      console.warn('Failed to set manual rate:', error);
      throw error;
    }
  }
}

export const currencyService = new CurrencyService();