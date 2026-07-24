import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

import { StatusBadge } from '@/components/design';
import { BorderRadius, Spacing, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';
import { currencyService } from '@/lib/currency';
import type { RateSource } from '@/lib/db/repositories/exchange-rates-repository';
import { useTranslation } from '@/lib/i18n';

interface AmountHeroProps {
  amount: string;
  onAmountChange: (value: string) => void;
  currency: string;
  /** Currency the converted figure is shown in. */
  displayCurrency: string;
  onCurrencyPress: () => void;
  /** Converted value, or null while there is nothing to convert. */
  convertedAmount: number | null;
  converting: boolean;
  placeholder?: string;
}

/**
 * The amount entry from screen 1c: a currency chip beside a large amount, with
 * the converted value and the rate that produced it underneath.
 *
 * Showing the rate and where it came from is the point - a conversion the user
 * cannot explain is one they cannot trust when it disagrees with their bank.
 */
export function AmountHero({
  amount,
  onAmountChange,
  currency,
  displayCurrency,
  onCurrencyPress,
  convertedAmount,
  converting,
  placeholder = '0',
}: AmountHeroProps) {
  const theme = useIOSTheme();
  const { t } = useTranslation();
  const [rateSource, setRateSource] = React.useState<RateSource | null>(null);
  const [rate, setRate] = React.useState<number | null>(null);

  const isForeign = currency !== displayCurrency;

  React.useEffect(() => {
    let cancelled = false;

    if (!isForeign) {
      setRate(null);
      setRateSource(null);
      return;
    }

    currencyService
      .getRateWithSource(currency, displayCurrency)
      .then((result) => {
        if (cancelled) return;
        setRate(result.rate);
        setRateSource(result.source);
      })
      .catch(() => {
        // Leave the rate line hidden rather than showing a rate we are not
        // sure about.
        if (!cancelled) {
          setRate(null);
          setRateSource(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currency, displayCurrency, isForeign]);

  return (
    <View style={styles.container}>
      <View style={styles.amountRow}>
        <TouchableOpacity
          onPress={onCurrencyPress}
          activeOpacity={0.7}
          style={[styles.currencyChip, { backgroundColor: theme.track }]}
          accessibilityRole="button"
          accessibilityLabel={t('settings.currency.title')}
        >
          <Text style={[styles.currencyCode, { color: theme.secondaryLabel }]}>
            {currency} ▾
          </Text>
        </TouchableOpacity>

        <TextInput
          value={amount}
          onChangeText={onAmountChange}
          placeholder={placeholder}
          placeholderTextColor={theme.tertiaryLabel}
          keyboardType="decimal-pad"
          style={[styles.amountInput, { color: theme.label }]}
          accessibilityLabel={t('expense.form.amount')}
        />
      </View>

      {isForeign && convertedAmount !== null && (
        <View style={styles.conversion}>
          <Text style={[styles.converted, { color: theme.accent }]}>
            ≈ {currencyService.formatCurrency(convertedAmount, displayCurrency)}
          </Text>

          {rate !== null && !converting && (
            <View style={styles.rateRow}>
              <Text style={[styles.rateText, { color: theme.secondaryLabel }]}>
                1 {currency} = {rate.toFixed(4)} {displayCurrency}
              </Text>
              {rateSource && (
                <StatusBadge
                  label={t(
                    rateSource === 'manual'
                      ? 'settings.exchange_rates.source.manual'
                      : rateSource === 'api'
                        ? 'settings.exchange_rates.source.api'
                        : 'settings.exchange_rates.source.fallback'
                  )}
                  tone={rateSource === 'manual' ? 'warning' : 'success'}
                />
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  currencyChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius['2xl'],
  },
  currencyCode: {
    fontSize: Typography.fontSize.subheadline,
    fontWeight: Typography.fontWeight.semibold,
  },
  amountInput: {
    fontSize: 52,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: -1,
    minWidth: 120,
    // The field grows with the number rather than centring a fixed box.
    paddingVertical: 0,
  },
  conversion: {
    marginTop: 10,
    alignItems: 'center',
  },
  converted: {
    fontSize: Typography.fontSize.title3,
    fontWeight: Typography.fontWeight.semibold,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  rateText: {
    fontSize: Typography.fontSize.caption1,
  },
});
