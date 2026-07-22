import { router, type Href } from 'expo-router';

/**
 * Navigate "back" to a known destination.
 *
 * We do NOT rely on router.back() / router.canGoBack(): with nested navigators
 * (this app's NativeTabs) canGoBack() returns true even when back() does
 * nothing, and after a deep link or reload there is no history at all - both
 * left the back buttons dead (expo/expo#38536, #35140).
 *
 * `dismissTo` unwinds the stack down to `fallback`, *removing* the screens above
 * it. This matters over `navigate`: `navigate` to an ancestor leaves the detail
 * route lingering in the stack, so pushing the SAME route again is treated as a
 * no-op and the trip won't reopen after being closed. Falling back to
 * `navigate` keeps back working when there is nothing to dismiss (fresh deep
 * link, no history).
 */
export function goBack(fallback: Href): void {
  if (router.canDismiss()) {
    router.dismissTo(fallback);
  } else {
    router.navigate(fallback);
  }
}
