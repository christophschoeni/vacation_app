# Claude Code Development Guide

## Über dieses Projekt

**Ferien Budget** - React Native App zur Verwaltung von Reisebudgets (iOS App Store - Production)

### Tech Stack
- **Framework**: Expo SDK 54 (React Native 0.81.4)
- **Sprache**: TypeScript (Strict Mode)
- **Navigation**: Expo Router (file-based routing)
- **Database**: expo-sqlite (SQLite)
- **Storage**: @react-native-async-storage/async-storage
- **UI**: Expo Components + Custom Design System
- **Icons**: lucide-react-native + expo-symbols
- **i18n**: i18n-js mit expo-localization
- **Animations**: react-native-reanimated

### Wichtige Expo Features
- expo-router für Navigation (file-based)
- expo-haptics für Haptisches Feedback
- expo-localization für Spracherkennung
- expo-file-system für File Operations
- expo-sharing für Share Funktionalität
- expo-document-picker für Dokument-Import
- expo-blur für Blur-Effekte
- expo-linear-gradient für Gradienten

---

## Git Workflow - WICHTIG!

**Für JEDE neue Arbeit einen Branch erstellen!**

### Branches
- `main` → Production (App Store)
- `develop` → Development
- `feature/*` → Neue Features
- `bugfix/*` → Bugfixes
- `hotfix/*` → Kritische Production Fixes

### Workflow
```bash
# Feature starten
git checkout develop && git pull
git checkout -b feature/name

# Committen
git add . && git commit -m "Add: Feature"

# Push & PR
git push -u origin feature/name
# → Pull Request zu develop erstellen
```

### Commit Types
`Add:` Feature | `Fix:` Bugfix | `Update:` Change | `Refactor:` Refactor | `Remove:` Delete | `Chore:` Maintenance

---

## Code-Standards - MUST FOLLOW!

### 1. Design System (IMMER verwenden!)
```typescript
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '@/constants/design';

// ❌ NICHT: Hardcoded values
backgroundColor: '#007AFF', padding: 16

// ✅ JA: Design System
backgroundColor: Colors.systemColors.blue, padding: Spacing.md
```
**Spacing:** `xs:4 | sm:8 | md:12 | lg:16 | xl:20 | xxl:24 | xxxl:32`

### 2. Logging (NIE console.log!)
```typescript
import logger from '@/lib/utils/logger';
logger.debug('Info', { data });  // Silent in production
```

### 3. TypeScript (No ANY!)
- Strict Mode aktiv - keine `any` Types
- Explizite Return Types
- Proper Interfaces

### 4. Expo Components verwenden
```typescript
// ✅ Expo Components verwenden
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// ❌ NICHT React Native Basis-Components wenn Expo Alternative existiert
```

### 5. Navigation (Expo Router)
```typescript
// File-based routing in /app
import { router } from 'expo-router';
router.push('/vacation/123');
```

### 6. Dark Mode Support
```typescript
import { useColorScheme } from 'react-native';
const colorScheme = useColorScheme();
const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
```

---

## Projekt-Struktur

```
app/              # Screens (Expo Router - file-based)
├── (tabs)/       # Tab Navigation
├── vacation/     # Vacation Details
├── expense/      # Expense Management
└── settings/     # Settings

components/       # Reusable Components
├── ui/           # UI Components (cards, forms, selectors)
├── navigation/   # Navigation Components
└── design/       # Design System Components

constants/        # Constants & Design System
└── design.ts     # PRIMARY DESIGN SYSTEM ⭐

lib/              # Business Logic
├── database/     # SQLite Repository Layer
├── i18n/         # Internationalization
└── utils/        # Utilities

hooks/            # Custom React Hooks
types/            # TypeScript Definitions
assets/           # Images, Fonts
```

---

## Technische Schulden (Details: PRODUCTION_STABILITY_REPORT.md)

### 🔴 Kritisch
- 150+ console.log Statements → Durch logger.* ersetzen
- 4 ungenutzte TabBar Components → Löschen
- Debug-Code in Report Screen → Entfernen

### 🟡 Hoch
- 62 Files mit hardcoded Colors → Design System verwenden
- 24x `any` Types → Proper Types
- ErrorBoundary fehlt in Feature Screens

### 🟢 Medium
- 22 veraltete Dependencies → `npm update`
- 205 hardcoded Spacing Values → Design System

---

## Commands

```bash
# Development
npm start              # Metro Bundler
npm run ios            # iOS Simulator
npm run lint           # ESLint

# Build & Deploy
eas build --platform ios --profile production
eas update --branch production  # OTA Update
```

---

## Pre-Release Checklist

- [ ] Keine console.log Statements
- [ ] Design System konsequent verwendet
- [ ] TypeScript errors (`npm run lint`)
- [ ] Alle Features getestet (Vacations, Expenses, Budget, Report, Checklists)
- [ ] Dark Mode funktioniert
- [ ] i18n (DE/EN) funktioniert
- [ ] Version + Build Number erhöht

---

## Wichtig für Claude Code

### MUST DO:
1. ✅ **IMMER Feature Branch** erstellen (`feature/*`, `bugfix/*`, `hotfix/*`)
2. ✅ **Design System** verwenden (keine hardcoded values!)
3. ✅ **Logger** statt console.log
4. ✅ **Expo Components** bevorzugen (expo-image, expo-blur, etc.)
5. ✅ **TypeScript strict** (keine `any` types)
6. ✅ **Expo Router** für Navigation (file-based in /app)

### NEVER:
- ❌ Direkt auf `main` oder `develop` committen
- ❌ console.log in Production Code
- ❌ Hardcoded Colors/Spacing
- ❌ `any` Types
- ❌ React Native Basis-Components wenn Expo Alternative existiert

---

**Version:** 1.0.1 | **SDK:** Expo 54 | **Status:** Production (iOS App Store)
**Vollständiger Report:** [PRODUCTION_STABILITY_REPORT.md](PRODUCTION_STABILITY_REPORT.md)
