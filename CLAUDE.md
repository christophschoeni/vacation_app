# Claude Code Development Guide

## Über dieses Projekt

**Ferien Budget** ist eine React Native App zur Verwaltung von Reisebudgets. Die App ist seit Version 1.0.1 im Apple App Store verfügbar.

- **Plattform**: iOS (produktiv), Android (in Entwicklung)
- **Framework**: React Native mit Expo
- **Sprache**: TypeScript
- **State Management**: React Hooks + AsyncStorage
- **Datenbank**: SQLite (expo-sqlite)
- **Navigation**: Expo Router
- **Design System**: Custom Design System in `/constants/design.ts`

---

## Git Workflow & Branching-Strategie

### Branch-Struktur

Da die App jetzt produktiv ist, arbeiten wir mit einem strukturierten Git-Workflow:

#### Main Branches
- `main` - Produktionscode, der im App Store ist
- `develop` - Entwicklungszweig für neue Features

#### Feature Branches
Für JEDE neue Arbeit wird ein Feature Branch erstellt:

```bash
# Für neue Features
git checkout develop
git pull origin develop
git checkout -b feature/kurze-beschreibung

# Für Bugfixes
git checkout -b bugfix/kurze-beschreibung

# Für Hotfixes (kritische Produktionsfehler)
git checkout main
git checkout -b hotfix/kurze-beschreibung
```

#### Branch-Naming Konventionen

- `feature/` - Neue Features (z.B. `feature/expense-categories`)
- `bugfix/` - Bugfixes (z.B. `bugfix/report-filtering`)
- `hotfix/` - Kritische Produktionsfehler (z.B. `hotfix/crash-on-startup`)
- `refactor/` - Code-Refactoring (z.B. `refactor/consolidate-spacing`)
- `chore/` - Wartungsarbeiten (z.B. `chore/update-dependencies`)

#### Workflow

1. **Vor jeder Arbeit neuen Branch erstellen**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/mein-feature
   ```

2. **Regelmäßig committen**
   ```bash
   git add .
   git commit -m "Add: Feature XYZ"
   ```

3. **Push zum Remote Repository**
   ```bash
   git push -u origin feature/mein-feature
   ```

4. **Pull Request erstellen**
   - Base: `develop` (oder `main` für Hotfixes)
   - Review und Test vor dem Merge

5. **Nach dem Merge: Branch löschen**
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feature/mein-feature
   ```

### Commit Message Format

```
Typ: Kurze Beschreibung (max 50 Zeichen)

Optionale längere Beschreibung des Changes.
Erkläre WARUM, nicht WAS (das sieht man im Diff).

- Bullet points für Details
- Weitere Erklärungen
```

**Typen:**
- `Add:` - Neue Features
- `Fix:` - Bugfixes
- `Update:` - Updates an existierendem Code
- `Refactor:` - Code-Refactoring ohne funktionale Änderungen
- `Remove:` - Code entfernen
- `Chore:` - Wartungsarbeiten, Dependencies, Config

---

## Code-Standards & Best Practices

### 1. TypeScript

- **Strict Mode ist aktiviert** - keine `any` Types verwenden
- Explizite Return Types für alle Funktionen
- Proper Type Definitions statt `any`
- Interfaces für Props und States

```typescript
// ❌ Schlecht
const handleChange = (value: any) => {
  console.log(value);
};

// ✅ Gut
interface HandleChangeParams {
  value: string;
  id: number;
}

const handleChange = ({ value, id }: HandleChangeParams): void => {
  logger.debug('Value changed', { value, id });
};
```

### 2. Design System verwenden

Das Design System ist in `/constants/design.ts` definiert. **IMMER** diese Konstanten verwenden!

```typescript
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '@/constants/design';

// ❌ Schlecht - Hardcoded Values
<View style={{
  backgroundColor: '#007AFF',
  padding: 16,
  borderRadius: 12
}} />

// ✅ Gut - Design System
<View style={{
  backgroundColor: Colors.systemColors.blue,
  padding: Spacing.md,
  borderRadius: BorderRadius.medium
}} />
```

### 3. Logging

**NIEMALS `console.log` in Production Code!**

Verwende stattdessen das Logger-Utility:

```typescript
import logger from '@/lib/utils/logger';

// In Development: zeigt Logs
// In Production: silent

logger.debug('Debug info', { data });
logger.info('Important info');
logger.warn('Warning message');
logger.error('Error occurred', error);
```

### 4. Spacing & Layout

Verwende **IMMER** die Spacing-Konstanten aus `/constants/design.ts`:

```typescript
import { Spacing } from '@/constants/design';

// ❌ Schlecht
paddingHorizontal: 16,
marginBottom: 24,

// ✅ Gut
paddingHorizontal: Spacing.md,
marginBottom: Spacing.lg,
```

**Spacing System:**
- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 20px
- `xxl`: 24px
- `xxxl`: 32px

### 5. Colors & Theming

Verwende Theme-aware Colors für Dark Mode Support:

```typescript
import { Colors } from '@/constants/design';
import { useColorScheme } from 'react-native';

const MyComponent = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Theme-aware!</Text>
    </View>
  );
};
```

### 6. Error Handling

Alle Screens sollten in ErrorBoundary gewrappt sein:

```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

export default function MyScreen() {
  return (
    <ErrorBoundary>
      {/* Screen content */}
    </ErrorBoundary>
  );
}
```

### 7. Performance

- `useCallback` für Event Handlers
- `useMemo` für teure Berechnungen
- Proper cleanup in `useEffect`

```typescript
useEffect(() => {
  const subscription = someService.subscribe();

  return () => {
    subscription.unsubscribe(); // Cleanup!
  };
}, []);
```

---

## Projekt-Struktur

```
vacation_app/
├── app/                    # Screens (Expo Router)
│   ├── (tabs)/            # Tab Navigation Screens
│   ├── vacation/          # Vacation Detail Screens
│   ├── expense/           # Expense Management
│   └── settings/          # Settings Screens
├── components/            # Reusable Components
│   ├── design/           # Design System Components
│   ├── navigation/       # Navigation Components
│   ├── onboarding/       # Onboarding Components
│   └── ui/               # UI Components
│       ├── cards/        # Card Components
│       ├── forms/        # Form Components
│       └── selectors/    # Selector Components
├── constants/            # App Constants & Design System
│   ├── design.ts        # **PRIMARY DESIGN SYSTEM**
│   └── spacing.ts       # (Deprecated - Use design.ts!)
├── hooks/               # Custom React Hooks
├── lib/                 # Business Logic
│   ├── currency.ts     # Currency Conversion
│   ├── database/       # Database Layer
│   ├── i18n/          # Internationalization
│   └── utils/         # Utilities
├── types/              # TypeScript Type Definitions
└── assets/            # Images, Fonts, etc.
```

---

## Bekannte Technische Schulden (Stand: 2025-10-16)

### Kritisch (Sofort beheben)
1. ⚠️ **150+ console.log Statements** - Müssen durch Logger ersetzt werden
2. ⚠️ **Debug-Logging in Report Screen** (`app/vacation/[id]/report.tsx:69-84`)
3. ⚠️ **4 ungenutzte TabBar Components** - Löschen!

### Hoch (Nächster Sprint)
1. **62 Files mit hardcoded Colors** - Design System nutzen
2. **24x `any` Types** - Proper Types verwenden
3. **ErrorBoundary nur im Root** - Zu Feature Screens hinzufügen

### Medium (Nächste 2-4 Wochen)
1. **Spacing System Duplikate** - `/constants/spacing.ts` entfernen
2. **205 hardcoded Spacing Values** - Zu Design System migrieren
3. **22 veraltete Dependencies** - Aktualisieren

Siehe vollständigen Report im Branch: `feature/production-stability-review`

---

## Dependencies aktualisieren

### Vorsichtige Update-Strategie

Da die App produktiv ist, Updates in dieser Reihenfolge:

1. **Patch Updates** (1.0.x → 1.0.y) - Sicher
   ```bash
   npm update
   ```

2. **Minor Updates** (1.x.0 → 1.y.0) - Test erforderlich
   ```bash
   npm update --save
   npm test
   ```

3. **Major Updates** (x.0.0 → y.0.0) - Vorsichtig!
   - Changelog lesen
   - Migration Guide befolgen
   - Ausgiebig testen
   - Feature Branch erstellen
   - Staging testen vor Production

### Aktuell veraltete Packages (Stand: 2025-10-16)

**Safe to update (patches):**
- `expo`: 54.0.12 → 54.0.13
- `typescript`: 5.9.2 → 5.9.3
- `@react-navigation/*` packages
- Diverse `expo-*` packages

**Vorsichtig (minors):**
- `react` / `react-dom`: 19.1.0 → 19.2.0
- `react-native`: 0.81.4 → 0.82.0
- `eslint`: 9.36.0 → 9.37.0

---

## Testing vor Release

### Pre-Release Checklist

- [ ] Alle console.log Statements entfernt?
- [ ] Design System konsequent verwendet?
- [ ] No TypeScript errors (`npm run lint`)
- [ ] App startet ohne Crashes
- [ ] Alle Hauptfeatures getestet:
  - [ ] Vacation erstellen/bearbeiten/löschen
  - [ ] Expense hinzufügen/bearbeiten/löschen
  - [ ] Budget-Übersicht korrekt
  - [ ] Report generiert korrekt
  - [ ] Currency Conversion funktioniert
  - [ ] Checklists funktionieren
- [ ] Dark Mode funktioniert
- [ ] Lokalisierung (DE/EN) funktioniert
- [ ] Version Nummer erhöht
- [ ] Build Number erhöht (iOS)

---

## Deployment

### iOS App Store Release

1. **Version erhöhen**
   - `package.json` → `version`
   - `app.json` → `expo.version`
   - `app.json` → `expo.ios.buildNumber`

2. **Build erstellen**
   ```bash
   eas build --platform ios --profile production
   ```

3. **TestFlight Upload**
   - Automatisch nach Build

4. **App Store Submission**
   - Via App Store Connect

---

## Hilfreiche Commands

```bash
# Development
npm start                 # Start Metro Bundler
npm run ios              # Run on iOS Simulator
npm run android          # Run on Android Emulator

# Code Quality
npm run lint             # ESLint Check
npm run lint -- --fix    # Auto-fix Lint Errors

# Build
eas build --platform ios
eas build --platform android

# Update OTA (Over-The-Air)
eas update --branch production
```

---

## Support & Dokumentation

- **Expo Docs**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs

---

## Wichtige Notizen für Claude Code

### Beim Arbeiten an diesem Projekt:

1. **IMMER einen Feature Branch erstellen** vor Änderungen
2. **NIEMALS direkt auf `main` oder `develop` committen**
3. **Design System verwenden** - Keine hardcoded Values!
4. **Logger statt console.log** verwenden
5. **TypeScript strict** - Keine `any` Types
6. **Tests ausführen** vor Push
7. **Version Bumping** nur in Release Branches

### Häufige Aufgaben:

**Neues Feature:**
```bash
git checkout develop
git checkout -b feature/mein-feature
# Code changes...
git add .
git commit -m "Add: Mein neues Feature"
git push -u origin feature/mein-feature
# Create Pull Request
```

**Bugfix:**
```bash
git checkout develop
git checkout -b bugfix/bug-beschreibung
# Fix bug...
git add .
git commit -m "Fix: Bug XYZ"
git push -u origin bugfix/bug-beschreibung
```

**Hotfix (Production):**
```bash
git checkout main
git checkout -b hotfix/critical-bug
# Fix critical bug...
git add .
git commit -m "Hotfix: Critical bug XYZ"
git push -u origin hotfix/critical-bug
# Merge zu main UND develop!
```

---

**Letzte Aktualisierung:** 2025-10-16
**App Version:** 1.0.1
**Status:** Production (iOS App Store)
