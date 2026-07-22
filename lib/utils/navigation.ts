import { router, type Href } from 'expo-router';

/**
 * Go back to the previous screen, falling back to a known route.
 *
 * `router.back()` alone does nothing when a screen was reached without a
 * navigation stack to pop - e.g. via a deep link, or as a tab destination -
 * which made several back buttons appear dead. Conversely, always pushing a
 * fixed route inflates the stack and animates the wrong way. This picks the
 * right one: pop when possible, otherwise navigate to `fallback`.
 */
export function goBack(fallback: Href): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
