# iOS Design Guidelines - Native Tabs Implementation

## Overview

Diese App nutzt nun **Native Tabs** mit dem iOS **Liquid Glass Effect** für eine authentische iOS-Erfahrung.

## Was ist der Liquid Glass Effect?

Der **Liquid Glass Effect** ist Apples natives transluzentes Design für Tab Bars und Navigation Bars. Er zeichnet sich aus durch:

- ✨ **Transluzenter Blur**: Content wird durch die Tab Bar hindurch sichtbar
- 🎯 **Auto-Minimize**: Tab Bar minimiert sich beim Scrollen nach unten
- ⚡ **GPU-Rendering**: 60fps Performance durch native Implementierung
- 🌓 **Dark Mode Support**: Automatische Anpassung an Light/Dark Mode

## Implementation Details

### Native Tabs (Expo Router SDK 54)

**Datei:** [app/(tabs)/_layout.tsx](../app/(tabs)/_layout.tsx)

```typescript
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

<NativeTabs
  minimizeBehavior="onScrollDown"
  disableTransparentOnScrollEdge
>
  <NativeTabs.Trigger name="index">
    <Label>{t('navigation.vacations')}</Label>
    <Icon sf="airplane.departure" tintColor={tintColor} />
  </NativeTabs.Trigger>
</NativeTabs>
```

### Wichtige Props

#### `minimizeBehavior`
Steuert das Auto-Minimize-Verhalten der Tab Bar:
- `"automatic"` - System entscheidet (Standard)
- `"onScrollDown"` - Minimiert beim Runterscrollen (empfohlen)
- `"onScrollUp"` - Minimiert beim Hochscrollen
- `"never"` - Nie minimieren

**Unsere Wahl:** `"onScrollDown"` für maximalen Content-Bereich

#### `disableTransparentOnScrollEdge`
Wichtig für FlatList/ScrollView:
- Verhindert, dass die Tab Bar transparent wird wenn man am Anfang/Ende scrollt
- Notwendig für korrektes Scroll-Detection

#### Tint Colors
iOS System Blue:
- **Light Mode:** `#007AFF`
- **Dark Mode:** `#0A84FF`

### Content Scroll-Verhalten

Damit der Liquid Glass Effect funktioniert, muss Content **unter** die Tab Bar scrollen können.

**Padding-Bottom berechnen:**

```typescript
const insets = useSafeAreaInsets();

<ScrollView
  contentContainerStyle={{
    paddingBottom: insets.bottom + 100
  }}
>
```

**Formel:**
```
paddingBottom = Safe Area Bottom Inset + Tab Bar Height (~49pt) + Extra Space (~51pt)
```

### SF Symbols

Wir nutzen **SF Symbols** für Tab Bar Icons:
- Native iOS Icons
- Automatische Anpassung an Bold Text
- Konsistenz mit System-Apps
- Hierarchical Rendering

**Beispiele:**
- `airplane.departure` - Vacations
- `gear` - Settings
- `plus` - Add Button
- `chevron.right` - Navigation Arrows

**Dokumentation:** https://developer.apple.com/sf-symbols/

## Best Practices

### 1. Keine Custom Tab Bar Components mehr

❌ **Alt (BlurView-basiert):**
```typescript
<Tabs tabBar={(props) => <GlassTabBar {...props} />} />
```

✅ **Neu (Native Tabs):**
```typescript
<NativeTabs minimizeBehavior="onScrollDown">
  <NativeTabs.Trigger name="index">...</NativeTabs.Trigger>
</NativeTabs>
```

### 2. SafeAreaView Edges

Tabs sollten nur **top** Edge respektieren:

```typescript
<SafeAreaView edges={['top']}>
  <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
    {/* Content */}
  </ScrollView>
</SafeAreaView>
```

### 3. ScrollView Content Insets

Immer dynamisches paddingBottom:

```typescript
const insets = useSafeAreaInsets();

contentContainerStyle={[
  styles.scrollContent,
  { paddingBottom: insets.bottom + 100 }
]}
```

### 4. SF Symbol Naming

SF Symbols nutzen **Dot-Notation:**
- ✅ `airplane.departure`
- ✅ `gear`
- ✅ `house.fill`
- ❌ `airplane-departure` (Falsch!)

### 5. Haptic Feedback

Bei Tab-Wechsel automatisch durch Native Tabs:
- **Light Impact** beim Tap
- **Selection Feedback** bei aktivem Tab
- Keine manuelle Implementation nötig!

## Migration von JavaScript Tabs

### Vorher (JavaScript Tabs)

```typescript
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';

<Tabs
  tabBar={(props) => <CustomTabBar {...props} />}
  screenOptions={{
    headerShown: false,
    tabBarStyle: {
      position: 'absolute',
      backgroundColor: 'transparent',
    },
  }}
>
  <Tabs.Screen
    name="index"
    options={{
      title: 'Vacations',
      tabBarIcon: { sfSymbol: 'airplane.departure' } as any,
    }}
  />
</Tabs>
```

### Nachher (Native Tabs)

```typescript
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

<NativeTabs minimizeBehavior="onScrollDown" disableTransparentOnScrollEdge>
  <NativeTabs.Trigger name="index">
    <Label>Vacations</Label>
    <Icon sf="airplane.departure" tintColor="#007AFF" />
  </NativeTabs.Trigger>
</NativeTabs>
```

## Performance-Vorteile

### Native Tabs vs JavaScript Tabs

| Feature | JavaScript Tabs | Native Tabs |
|---------|----------------|-------------|
| Blur Rendering | JavaScript (CPU) | Native (GPU) |
| FPS | ~45-55 fps | 60 fps |
| Auto-Minimize | ❌ Manual | ✅ Automatic |
| Memory Usage | Höher | Niedriger |
| Dark Mode | Manual Implementation | ✅ System |
| Haptics | Manual | ✅ Automatic |

### GPU vs CPU Rendering

**JavaScript Tabs (BlurView):**
```
User Scrolls → JavaScript → Calculate Blur → Render → Display
                ↓ CPU intensive
                ↓ ~45-55 fps
```

**Native Tabs:**
```
User Scrolls → UITabBarController → GPU Blur → Display
                ↓ GPU accelerated
                ↓ 60 fps
```

## iOS Design Consistency

### Apple's Human Interface Guidelines

Native Tabs befolgen automatisch:
- ✅ Tab Bar Height: 49pt
- ✅ Safe Area Handling
- ✅ Dark Mode Colors
- ✅ Dynamic Type Support
- ✅ Accessibility Labels
- ✅ VoiceOver Support

### Vergleich mit System-Apps

Unsere Tab Bar verhält sich identisch zu:
- **App Store** - Auto-minimize beim Scrollen
- **Music** - Liquid Glass Blur
- **Photos** - Tab Switching mit Haptics

## Testing

### Auf iOS Simulator

```bash
npm run ios
```

**Test-Szenarien:**
1. ✅ Tab-Wechsel (Haptic Feedback spürbar?)
2. ✅ Nach unten scrollen (Tab Bar minimiert?)
3. ✅ Nach oben scrollen (Tab Bar erscheint?)
4. ✅ Dark Mode umschalten (Blur passt sich an?)
5. ✅ Content sichtbar unter Tab Bar?

### Auf echtem iOS Device

```bash
npx expo run:ios --device
```

**Zusätzliche Tests:**
- Haptic Feedback Intensität
- Blur-Qualität bei verschiedenen Backgrounds
- Performance bei langen Listen

## Troubleshooting

### Tab Bar verschwindet nicht beim Scrollen

**Problem:** `minimizeBehavior` funktioniert nicht

**Lösung:**
```typescript
// disableTransparentOnScrollEdge hinzufügen
<NativeTabs
  minimizeBehavior="onScrollDown"
  disableTransparentOnScrollEdge
>
```

### Content wird von Tab Bar verdeckt

**Problem:** Nicht genug `paddingBottom`

**Lösung:**
```typescript
const insets = useSafeAreaInsets();

contentContainerStyle={{
  paddingBottom: insets.bottom + 100 // 100 = Tab Bar Height + Extra
}}
```

### SF Symbols werden nicht angezeigt

**Problem:** Falsches Format oder Symbol existiert nicht

**Lösung:**
- Check SF Symbols App: https://developer.apple.com/sf-symbols/
- Verwende Dot-Notation: `house.fill` statt `house-fill`
- Platform check: `Platform.OS === 'ios' ? 'gear' : undefined`

### Blur sieht nicht "glassy" aus

**Problem:** Alte JavaScript-Tab-Implementation aktiv

**Lösung:**
- Sicherstellen, dass `expo-router/unstable-native-tabs` importiert ist
- Nicht `expo-router` mit `Tabs` verwenden
- Custom Tab Bar Component entfernen

## Zukünftige Entwicklung

### Expo SDK 55+

Native Tabs werden aus `unstable-native-tabs` zu stabilem API:

```typescript
// Zukünftig (SDK 55+)
import { NativeTabs, Icon, Label } from 'expo-router/tabs';
// Statt
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
```

### Zusätzliche Features (geplant)

- **Badge Support** - Notification Counts auf Tabs
- **Long Press Actions** - Context Menus bei Tab Bar
- **Customizable Tab Bar Height** - Variable Höhen

## Referenzen

- [Expo Native Tabs Docs](https://docs.expo.dev/router/advanced/native-tabs/)
- [Apple HIG - Tab Bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
- [SF Symbols](https://developer.apple.com/sf-symbols/)
- [Liquid Glass Effect Blog](https://www.amillionmonkeys.co.uk/blog/expo-liquid-glass-tab-bar-ios)

## Zusammenfassung

✅ **Native Tabs implementiert**
- Echter iOS Liquid Glass Effect
- Auto-minimize beim Scrollen
- 60fps GPU-Rendering
- System-konforme Haptics

✅ **Content Scroll-Verhalten optimiert**
- Dynamisches paddingBottom mit Safe Area Insets
- Content scrollt unter Tab Bar
- Korrekte SafeAreaView Edges

✅ **iOS Design Guidelines befolgt**
- SF Symbols für Icons
- System Blue Tint Colors
- Transluzenter Blur
- Dark Mode Support

🎉 **Die App fühlt sich jetzt wie eine native iOS-App an!**
