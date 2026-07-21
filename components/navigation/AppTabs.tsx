import React from 'react';
import { DynamicColorIOS, Platform } from 'react-native';
import {
  NativeTabs,
  NativeTabsTriggerTabBar,
} from 'expo-router/unstable-native-tabs';

/**
 * Shared appearance for every native tab bar in the app.
 *
 * Defined once here rather than repeated in each _layout: the two layouts had
 * drifted apart, and the tab bar appearance has to be attached per trigger
 * (see AppTabBarAppearance), which makes copy-pasting it especially error-prone.
 */
const tabLabelStyle = {
  color: DynamicColorIOS({ dark: 'white', light: 'black' }),
};

const tabTintColor = DynamicColorIOS({ dark: '#0A84FF', light: '#007AFF' });

/**
 * Opaque tab bar background.
 *
 * iOS makes the tab bar transparent once a scroll view reaches its edge, so
 * list content showed through the bar. `disableTransparentOnScrollEdge` keeps
 * the material in place; `systemChromeMaterial` is the standard adaptive
 * background that follows light/dark mode.
 *
 * Must be rendered inside each `NativeTabs.Trigger` — the underlying option is
 * per-tab, not a property of the tab bar as a whole.
 */
export function AppTabBarAppearance() {
  // Android draws its own opaque bar; these options are iOS-only and are
  // ignored there, so the element is simply omitted.
  if (Platform.OS !== 'ios') return null;

  return (
    <NativeTabsTriggerTabBar
      disableTransparentOnScrollEdge
      blurEffect="systemChromeMaterial"
    />
  );
}

/** NativeTabs with the app's shared styling applied. */
export function AppTabs({ children }: { children: React.ReactNode }) {
  return (
    <NativeTabs labelStyle={tabLabelStyle} tintColor={tabTintColor}>
      {children}
    </NativeTabs>
  );
}
