import { isProActive, PRO_ENTITLEMENT } from '../entitlement';
import type { CustomerInfo } from 'react-native-purchases';

// Minimal CustomerInfo shaped just enough for isProActive — it only reads
// entitlements.active. Cast through unknown so we don't have to satisfy the
// whole SDK type for a pure-logic test.
function customerInfo(activeKeys: string[]): CustomerInfo {
  const active = Object.fromEntries(activeKeys.map((k) => [k, { identifier: k }]));
  return { entitlements: { active } } as unknown as CustomerInfo;
}

describe('isProActive', () => {
  it('is true when the pro entitlement is active (paid or trial)', () => {
    expect(isProActive(customerInfo([PRO_ENTITLEMENT]))).toBe(true);
  });

  it('is false when no entitlements are active (trial lapsed, never bought)', () => {
    expect(isProActive(customerInfo([]))).toBe(false);
  });

  it('is false when a different entitlement is active but not pro', () => {
    expect(isProActive(customerInfo(['some_other']))).toBe(false);
  });

  it('is false for null/undefined customer info (SDK not resolved yet)', () => {
    expect(isProActive(null)).toBe(false);
    expect(isProActive(undefined)).toBe(false);
  });
});
