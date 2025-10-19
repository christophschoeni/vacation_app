# AppHeader Usage Guide

## Übersicht
Jede Seite in der App MUSS einen konsistenten Header haben. Verwende die `AppHeader` Komponente für einheitliches Design.

## Varianten

### 1. `variant="large"` - Hauptseiten (Tab-Level)
Für Top-Level Seiten in der Tab-Navigation (z.B. Vacations, Settings)

```tsx
import AppHeader from '@/components/ui/AppHeader';

<AppHeader
  title={t('navigation.vacations')}
  variant="large"
  useSafeAreaPadding={true}
  rightAction={<YourButton />}
/>
```

**Features:**
- Großer Titel (34px, Bold) unter dem Header
- Top Padding für Safe Area
- Optional: rightAction für Buttons

### 2. `variant="standard"` - Unterseiten (NEU!)
Für alle anderen Seiten (Detail-Screens, Settings-Unterseiten, etc.)

```tsx
<AppHeader
  title={t('settings.currency')}
  variant="standard"
  showBack={true}
  onBackPress={() => router.back()}
  useSafeAreaPadding={true}
/>
```

**Features:**
- Zentrierter Titel (17px, Semibold) im Header
- Gleiche Höhe auf allen Seiten (minHeight: 44px)
- Immer gleiche Position
- Optional: Back-Button links
- Optional: rightAction für Buttons

### 3. `variant="modal"` - Modale Dialoge
Für Modal-Screens

```tsx
<AppHeader
  title="Add Vacation"
  variant="modal"
  showBack={true}
  onBackPress={() => router.back()}
  onRightPress={handleSave}
/>
```

**Features:**
- × Symbol zum Schließen (links)
- ✓ Symbol zum Speichern (rechts)

### 4. `variant="default"` - Minimalistisch
Nur Buttons, kein Titel

```tsx
<AppHeader
  variant="default"
  showBack={true}
  onBackPress={() => router.back()}
/>
```

## Konsistenz-Regeln

### ✅ DO
1. **Jede Seite** braucht einen AppHeader
2. **Tab-Screens** nutzen `variant="large"`
3. **Detail/Settings-Screens** nutzen `variant="standard"`
4. **Immer** `useSafeAreaPadding={true}` setzen
5. **Gleiche Abstände** auf allen Seiten (wird von AppHeader gehandhabt)

### ❌ DON'T
1. Keine custom Header-Implementierungen
2. Keine unterschiedlichen Titel-Größen
3. Keine unterschiedlichen Positionierungen
4. Kein Titel direkt im Content (nutze AppHeader)

## Beispiele

### Vacation Detail Screen
```tsx
<SafeAreaView style={styles.container} edges={['bottom']}>
  <AppHeader
    title={vacation.destination}
    variant="standard"
    showBack={true}
    onBackPress={() => router.back()}
    useSafeAreaPadding={true}
  />
  <ScrollView>
    {/* Content */}
  </ScrollView>
</SafeAreaView>
```

### Settings Unterseite
```tsx
<SafeAreaView style={styles.container} edges={['bottom']}>
  <AppHeader
    title={t('settings.currency')}
    variant="standard"
    showBack={true}
    onBackPress={() => router.back()}
    useSafeAreaPadding={true}
  />
  <ScrollView>
    {/* Content */}
  </ScrollView>
</SafeAreaView>
```

### Template Edit Screen
```tsx
<SafeAreaView style={styles.container} edges={['bottom']}>
  <AppHeader
    title={template.name}
    variant="standard"
    showBack={true}
    onBackPress={() => router.back()}
    useSafeAreaPadding={true}
    rightAction={
      <TouchableOpacity onPress={handleSave}>
        <Text>Save</Text>
      </TouchableOpacity>
    }
  />
  {/* Content */}
</SafeAreaView>
```

## Titel-Spezifikationen

| Variant   | Größe | Weight | Position | Verwendung |
|-----------|-------|--------|----------|------------|
| large     | 34px  | 700    | Unter Header | Tab-Screens |
| standard  | 17px  | 600    | Zentriert in Header | Alle anderen |
| modal     | -     | -      | Kein Titel | Modale |
| default   | -     | -      | Kein Titel | Minimalistisch |

## Header-Höhe
- **Konsistente Höhe:** minHeight 44px (iOS HIG Standard)
- **Safe Area Padding:** Wird automatisch hinzugefügt mit `useSafeAreaPadding={true}`
- **Position:** Immer ganz oben, direkt unter der Safe Area

## Migration Checklist

Für jede Seite ohne Header:
- [ ] AppHeader importieren
- [ ] Passende variant wählen (standard für die meisten)
- [ ] title aus i18n setzen
- [ ] showBack + onBackPress wenn nötig
- [ ] useSafeAreaPadding={true} setzen
- [ ] SafeAreaView edges={['bottom']} setzen (nicht 'top'!)
