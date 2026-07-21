import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Height of the native tab bar itself, excluding the home-indicator inset.
 *
 * NativeTabs renders a platform tab bar that floats above the screen content,
 * so a scroll view has to reserve room for it or its last rows end up hidden
 * behind the bar. The bar does not report its height through
 * useBottomTabBarHeight (that hook belongs to the JS bottom-tabs navigator),
 * so the platform default is used and the safe-area inset added on top.
 */
const NATIVE_TAB_BAR_HEIGHT = Platform.select({ ios: 49, android: 56, default: 49 });

/**
 * Bottom padding that clears the native tab bar.
 *
 * Screens inside a NativeTabs layout must not take the bottom safe-area edge on
 * their SafeAreaView - the tab bar already occupies that region, and consuming
 * it there shrinks the scroll area and pushes content upwards. Instead they use
 * edges={['top']} and add this padding to the scroll content.
 */
export function useTabBarPadding(extra = 16): number {
  const insets = useSafeAreaInsets();
  return NATIVE_TAB_BAR_HEIGHT + insets.bottom + extra;
}
