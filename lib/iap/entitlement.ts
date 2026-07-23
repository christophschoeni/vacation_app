import type { CustomerInfo } from 'react-native-purchases';

/**
 * The entitlement identifier configured in the RevenueCat dashboard. A customer
 * with this entitlement active — whether via the 7-day free trial or a paid
 * subscription — has full access. RevenueCat reports both the same way, so the
 * app never has to track trial timing itself.
 */
export const PRO_ENTITLEMENT = 'pro';

/**
 * Whether the customer currently has Pro access.
 *
 * Pure and SDK-free so it can be unit-tested against CustomerInfo fixtures.
 * `entitlements.active` only contains entitlements that are valid *right now*
 * (trial, paid, or in a grace period RevenueCat still counts as active), so a
 * presence check is the whole rule — no expiry maths on our side.
 */
export function isProActive(customerInfo: CustomerInfo | null | undefined): boolean {
  if (!customerInfo) return false;
  return customerInfo.entitlements.active[PRO_ENTITLEMENT] !== undefined;
}
