import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';

import { isProActive } from '@/lib/iap/entitlement';
import { logger } from '@/lib/utils/logger';

interface EntitlementContextValue {
  /** True while the RevenueCat SDK is still resolving the first CustomerInfo. */
  isLoading: boolean;
  /** Full access via trial or paid subscription. */
  isPro: boolean;
  /** The offering's purchasable packages (yearly / monthly), empty until loaded. */
  packages: PurchasesPackage[];
  /** Buy a package; resolves true if it left the customer with Pro access. */
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  /** Restore prior purchases (Apple requires a visible restore action). */
  restore: () => Promise<boolean>;
  /** Whether the native SDK is configured — false in Expo Go / bare Node. */
  isConfigured: boolean;
}

const EntitlementContext = createContext<EntitlementContextValue | undefined>(undefined);

// EXPO_PUBLIC_ so the value is inlined into the JS bundle at build time. Set the
// same appl_… iOS SDK key in .env.dev and .env.prod (it works for both sandbox
// and production; the store environment, not the key, decides which).
const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;

export function EntitlementProvider({ children }: { children: ReactNode }) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // RevenueCat is iOS-only here for now (Android store setup is separate). On
    // other platforms we resolve "not pro, not loading" so the gate can decide.
    if (Platform.OS !== 'ios' || !IOS_KEY) {
      if (!IOS_KEY) {
        logger.warn(
          'EXPO_PUBLIC_REVENUECAT_IOS_KEY is not set; subscriptions are disabled'
        );
      }
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    // Keep RevenueCat quiet: at DEBUG it routes even normal outcomes (like a
    // user-cancelled purchase) through console.error, which React Native's
    // LogBox then shows as a full-screen red error on every app load. WARN keeps
    // real problems visible without the noise.
    Purchases.setLogLevel(LOG_LEVEL.WARN);
    Purchases.configure({ apiKey: IOS_KEY });
    setIsConfigured(true);

    // Push updates keep isPro correct after a purchase, a restore, a renewal, or
    // an expiry — without polling.
    const onUpdate = (info: CustomerInfo) => {
      if (!cancelled) setCustomerInfo(info);
    };
    Purchases.addCustomerInfoUpdateListener(onUpdate);

    (async () => {
      try {
        const [info, offerings] = await Promise.all([
          Purchases.getCustomerInfo(),
          Purchases.getOfferings(),
        ]);
        if (cancelled) return;
        setCustomerInfo(info);
        setPackages(offerings.current?.availablePackages ?? []);
      } catch (error) {
        logger.warn('Failed to load RevenueCat state', { error });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      Purchases.removeCustomerInfoUpdateListener(onUpdate);
    };
  }, []);

  const purchase = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      const { customerInfo: info } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(info);
      return isProActive(info);
    } catch (error: unknown) {
      // A user cancelling is a normal outcome, not an error to surface.
      if ((error as { userCancelled?: boolean })?.userCancelled) return false;
      logger.warn('Purchase failed', { error });
      throw error;
    }
  }, []);

  const restore = useCallback(async (): Promise<boolean> => {
    const info = await Purchases.restorePurchases();
    setCustomerInfo(info);
    return isProActive(info);
  }, []);

  const value: EntitlementContextValue = {
    isLoading,
    isPro: isProActive(customerInfo),
    packages,
    purchase,
    restore,
    isConfigured,
  };

  return (
    <EntitlementContext.Provider value={value}>
      {children}
    </EntitlementContext.Provider>
  );
}

export function useEntitlement(): EntitlementContextValue {
  const context = useContext(EntitlementContext);
  if (!context) {
    throw new Error('useEntitlement must be used within an EntitlementProvider');
  }
  return context;
}
