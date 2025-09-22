import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ExchangeRates {
  [currency: string]: number;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

const STORAGE_KEY = 'exchange_rates';
const STORAGE_KEY_TIMESTAMP = 'exchange_rates_timestamp';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Common currencies with their info
export const CURRENCIES: CurrencyInfo[] = [
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'SEK', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'NOK', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'DKK', flag: '🇩🇰' },
];

class CurrencyService {
  private apiKey = 'demo'; // Using demo mode for now
  private baseUrl = 'https://api.exchangerate-api.com/v4/latest';

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
  };

  async getExchangeRates(baseCurrency: string = 'CHF'): Promise<ExchangeRates> {
    try {
      // Check cache first
      const cachedRates = await this.getCachedRates();
      if (cachedRates) {
        return cachedRates;
      }

      // Fetch fresh rates
      const response = await fetch(`${this.baseUrl}/${baseCurrency}`);

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      const rates = data.rates as ExchangeRates;

      // Cache the rates
      await this.cacheRates(rates);

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
      const timestamp = await AsyncStorage.getItem(STORAGE_KEY_TIMESTAMP);
      if (!timestamp) return null;

      const age = Date.now() - parseInt(timestamp);
      if (age > CACHE_DURATION) return null;

      const cachedData = await AsyncStorage.getItem(STORAGE_KEY);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch {
      return null;
    }
  }

  private async cacheRates(rates: ExchangeRates): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
      await AsyncStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.warn('Failed to cache exchange rates:', error);
    }
  }

  // Get popular currencies for quick access
  getPopularCurrencies(): CurrencyInfo[] {
    return CURRENCIES.slice(0, 6); // First 6 most common
  }

  // Search currencies
  searchCurrencies(query: string): CurrencyInfo[] {
    const searchTerm = query.toLowerCase();
    return CURRENCIES.filter(currency =>
      currency.code.toLowerCase().includes(searchTerm) ||
      currency.name.toLowerCase().includes(searchTerm)
    );
  }
}

export const currencyService = new CurrencyService();