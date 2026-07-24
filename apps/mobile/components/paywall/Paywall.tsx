import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { PurchasesPackage } from 'react-native-purchases';

import { Icon, Button } from '@/components/design';
import { useIOSTheme } from '@/constants/ios-theme';
import { useTranslation } from '@/lib/i18n';
import { useEntitlement } from '@/contexts/EntitlementContext';

const TERMS_URL = 'https://vomschoeni.ch/ferien-budget/terms';
const PRIVACY_URL = 'https://vomschoeni.ch/ferien-budget/privacy';

/** A single benefit row above the plan selector. */
function Feature({ label }: { label: string }) {
  const theme = useIOSTheme();
  return (
    <View style={styles.featureRow}>
      <Icon name="check" size={20} color={theme.accent} />
      <Text style={[styles.featureText, { color: theme.label }]}>{label}</Text>
    </View>
  );
}

/**
 * Hard paywall shown when the user has no active Pro entitlement. The 7-day free
 * trial is a StoreKit introductory offer on the products; RevenueCat applies it
 * automatically, so this screen only presents the plans and buys — it never
 * tracks trial timing.
 */
export default function Paywall() {
  const theme = useIOSTheme();
  const { t } = useTranslation();
  const { packages, purchase, restore } = useEntitlement();
  const [busy, setBusy] = useState(false);

  // Prefer the annual package as the default selection (best value).
  const yearly = useMemo(
    () => packages.find((p) => p.packageType === 'ANNUAL'),
    [packages]
  );
  const monthly = useMemo(
    () => packages.find((p) => p.packageType === 'MONTHLY'),
    [packages]
  );

  const [selected, setSelected] = useState<PurchasesPackage | undefined>();
  const active = selected ?? yearly ?? monthly ?? packages[0];

  const handlePurchase = async () => {
    if (!active) return;
    setBusy(true);
    try {
      await purchase(active);
      // On success the entitlement listener flips isPro and the gate re-renders.
    } catch {
      Alert.alert(t('common.error'), t('paywall.error_purchase'));
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    setBusy(true);
    try {
      const restored = await restore();
      if (!restored) {
        Alert.alert(t('common.info'), t('paywall.error_restore'));
      } else {
        Alert.alert(t('common.success'), t('paywall.restored'));
      }
    } catch {
      Alert.alert(t('common.error'), t('paywall.error_restore'));
    } finally {
      setBusy(false);
    }
  };

  const priceForActive = active?.product.priceString ?? '';
  const periodForActive =
    active?.packageType === 'ANNUAL'
      ? t('paywall.period_year')
      : t('paywall.period_month');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.label }]}>{t('paywall.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryLabel }]}>
          {t('paywall.subtitle')}
        </Text>

        <View style={styles.features}>
          <Feature label={t('paywall.feature_unlimited')} />
          <Feature label={t('paywall.feature_reports')} />
          <Feature label={t('paywall.feature_widget')} />
          <Feature label={t('paywall.feature_sync')} />
        </View>

        <View style={styles.plans}>
          {yearly && (
            <PlanCard
              label={t('paywall.plan_yearly')}
              price={yearly.product.priceString}
              period={t('paywall.period_year')}
              badge={t('paywall.badge_best_value')}
              selected={active?.identifier === yearly.identifier}
              onPress={() => setSelected(yearly)}
            />
          )}
          {monthly && (
            <PlanCard
              label={t('paywall.plan_monthly')}
              price={monthly.product.priceString}
              period={t('paywall.period_month')}
              selected={active?.identifier === monthly.identifier}
              onPress={() => setSelected(monthly)}
            />
          )}
        </View>

        {active ? (
          <Text style={[styles.trialNote, { color: theme.secondaryLabel }]}>
            {t('paywall.trial_note', { price: priceForActive, period: periodForActive })}
          </Text>
        ) : (
          <ActivityIndicator color={theme.secondaryLabel} style={{ marginVertical: 24 }} />
        )}

        <Button
          title={t('paywall.cta_trial')}
          onPress={handlePurchase}
          disabled={!active || busy}
          loading={busy}
        />

        <TouchableOpacity onPress={handleRestore} disabled={busy} style={styles.restore}>
          <Text style={[styles.restoreText, { color: theme.accent }]}>
            {t('paywall.restore')}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.legal, { color: theme.tertiaryLabel }]}>
          {t('paywall.legal_note')}
        </Text>

        <View style={styles.links}>
          <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
            <Text style={[styles.linkText, { color: theme.secondaryLabel }]}>
              {t('paywall.terms')}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.linkText, { color: theme.tertiaryLabel }]}>·</Text>
          <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
            <Text style={[styles.linkText, { color: theme.secondaryLabel }]}>
              {t('paywall.privacy')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** One selectable subscription option. */
function PlanCard({
  label,
  price,
  period,
  badge,
  selected,
  onPress,
}: {
  label: string;
  price: string;
  period: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useIOSTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.planCard,
        { backgroundColor: theme.tile, borderColor: selected ? theme.accent : 'transparent' },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View style={styles.planHeader}>
        <Text style={[styles.planLabel, { color: theme.label }]}>{label}</Text>
        {badge && (
          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.planPrice, { color: theme.label }]}>
        {price}
        <Text style={[styles.planPeriod, { color: theme.secondaryLabel }]}> / {period}</Text>
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', marginTop: 24, textAlign: 'center' },
  subtitle: { fontSize: 15, marginTop: 8, textAlign: 'center', marginBottom: 24 },
  features: { gap: 12, marginBottom: 28, alignSelf: 'center' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 16 },
  plans: { gap: 12, marginBottom: 16 },
  planCard: { borderRadius: 14, borderWidth: 2, padding: 16 },
  planHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planLabel: { fontSize: 17, fontWeight: '600' },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  planPrice: { fontSize: 22, fontWeight: '700', marginTop: 6 },
  planPeriod: { fontSize: 15, fontWeight: '400' },
  trialNote: { fontSize: 13, textAlign: 'center', marginBottom: 16 },
  restore: { alignItems: 'center', paddingVertical: 14 },
  restoreText: { fontSize: 15, fontWeight: '600' },
  legal: { fontSize: 11, textAlign: 'center', marginTop: 8, lineHeight: 16 },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 16 },
  linkText: { fontSize: 13 },
});
