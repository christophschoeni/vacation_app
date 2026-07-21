---
name: expo-native-tabs
description: Layout, safe areas and tab bar appearance for this app's Expo Router NativeTabs. Use when touching a _layout.tsx with tabs, when content overlaps or hides behind the tab bar, when adding a screen inside a tab group, or when a SafeAreaView/padding change is needed near the bottom of the screen.
---

# NativeTabs in this project

Both tab groups (`app/(tabs)/` and `app/vacation/[id]/`) use **NativeTabs** from
`expo-router/unstable-native-tabs`, which is backed by `react-native-screens` —
**not** by `@react-navigation/bottom-tabs`.

## Shared configuration — do not duplicate

All tab styling lives in `components/navigation/AppTabs.tsx`:

```tsx
<AppTabs>
  <NativeTabs.Trigger name="index">
    <Icon sf="…" drawable="…" />
    <Label>{t('…')}</Label>
  </NativeTabs.Trigger>
</AppTabs>
```

Never set appearance props on `NativeTabs` or on a trigger inside a layout —
the two layouts drifted apart exactly that way. Change `AppTabs.tsx` instead.

## Rules that caused real bugs

**1. An opaque tab bar needs `backgroundColor` AND
`disableTransparentOnScrollEdge`, both on `NativeTabs` itself.**

iOS keeps a second "scroll edge" appearance that is transparent by default.
`createScrollEdgeAppearanceFromOptions` (in expo-router) forces
`blurEffect: 'none'` and `backgroundColor: null` unless
`disableTransparentOnScrollEdge` is set. A `blurEffect` alone is **not** enough:
blur over no fill still reads as transparent — that was the actual bug, and two
attempts to fix it via padding and via a per-trigger `blurEffect` both failed.

Verify a change by running the library's own logic rather than guessing:

```bash
node -e "
const ap=require('./node_modules/expo-router/build/native-tabs/NativeBottomTabs/appearance.js');
const c={light:'#F9F9F9',dark:'#1C1C1E'};
const base=ap.convertStyleToAppearance({backgroundColor:c});
console.log(ap.createScrollEdgeAppearanceFromOptions(
  {disableTransparentOnScrollEdge:true, backgroundColor:c}, base).tabBarBackgroundColor);
"
```
`undefined` means the bar will be see-through; a colour means it is opaque.

**2. Screens inside a tab group use `edges={['top']}` — never `'bottom'`.**
The native tab bar already covers the bottom inset. Consuming it again in the
screen shrinks the scroll area and shifts content. `top` is still needed because
`AppHeader` only applies the top inset when `useSafeAreaPadding` is set.

**3. Bottom padding comes from `useTabBarPadding()`.**
Never hardcode a value. Six screens had `paddingBottom: 140`, which
over-reserved by 41–75 px depending on the device.

```tsx
const tabBarPadding = useTabBarPadding();
<ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarPadding }]}>
```

**4. `useBottomTabBarHeight()` does not work here.**
It belongs to the JS bottom-tabs navigator. It exists in `node_modules` and type-checks,
but returns nothing useful under NativeTabs. This is why `useTabBarPadding`
derives the height from the platform default plus the safe-area inset.

**5. Route params reach every tab screen.**
Use `useRouteParam('id')`. A screen in `app/vacation/[id]/` once read
`vacations[0]` behind a comment claiming NativeTabs does not pass params — it
does, and that workaround showed the wrong vacation.

## Verifying a change

`tsc` and `lint` cannot see layout problems. After any tab or safe-area change,
have the user check on a device — especially the **last row of a long list** and
a device **without a home indicator** (iPhone SE), where the inset is 0 and
errors are largest.
