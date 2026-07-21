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
    <AppTabBarAppearance />   {/* required in every trigger */}
    <Icon sf="…" drawable="…" />
    <Label>{t('…')}</Label>
  </NativeTabs.Trigger>
</AppTabs>
```

Never set `labelStyle`/`tintColor` directly on `NativeTabs` in a layout — the
two layouts drifted apart exactly that way. Change `AppTabs.tsx` instead.

## Rules that caused real bugs

**1. `AppTabBarAppearance` belongs in *every* trigger.**
The underlying options (`disableTransparentOnScrollEdge`, `blurEffect`) are
per-tab, not per-tab-bar. A trigger without it becomes transparent while the
others do not.

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
