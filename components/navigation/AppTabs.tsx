import React from 'react';
import { DynamicColorIOS, Platform } from 'react-native';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

/**
 * Shared configuration for every native tab bar in the app.
 *
 * Defined once here rather than repeated per _layout: the two tab groups had
 * already drifted apart when each configured its own colours.
 */
const tabLabelStyle = {
  color: DynamicColorIOS({ dark: 'white', light: 'black' }),
};

const tabTintColor = DynamicColorIOS({ dark: '#0A84FF', light: '#007AFF' });

/**
 * Opaque tab bar background.
 *
 * iOS gives a tab bar a separate "scroll edge" appearance that is transparent
 * by default, so list content shows through the bar. Two options are required
 * together, and both belong on NativeTabs itself:
 *
 * - `disableTransparentOnScrollEdge` makes the scroll-edge appearance reuse the
 *   normal background instead of forcing blurEffect 'none' and backgroundColor
 *   null (see createScrollEdgeAppearanceFromOptions in expo-router).
 * - `backgroundColor` supplies the actual fill. A blurEffect alone is not
 *   enough - blur over nothing still reads as transparent.
 *
 * DynamicColorIOS keeps the bar correct in light and dark mode. The values are
 * UIKit's standard system chrome greys.
 */
const tabBarBackgroundColor = DynamicColorIOS({
  light: '#F9F9F9',
  dark: '#1C1C1E',
});

/**
 * NativeTabs with the app's shared styling.
 *
 * Use this instead of NativeTabs directly, and do not set appearance props on
 * individual triggers - the per-trigger override exists but makes it easy to
 * configure tabs inconsistently.
 */
export function AppTabs({ children }: { children: React.ReactNode }) {
  return (
    <NativeTabs
      labelStyle={tabLabelStyle}
      tintColor={tabTintColor}
      // Android draws an opaque bar itself; these options are iOS-only.
      {...(Platform.OS === 'ios'
        ? {
            backgroundColor: tabBarBackgroundColor,
            disableTransparentOnScrollEdge: true,
          }
        : null)}
    >
      {children}
    </NativeTabs>
  );
}
