# Database Architecture

## Overview

Die Reise Budget App nutzt **SQLite** als primäre Datenbankquelle mit dem **Drizzle ORM** für typsichere Datenbankoperationen.

Alle Daten werden in einer einzigen SQLite-Datenbank gespeichert, die über das **Expo SQLite** Modul bereitgestellt wird.

## Architektur

### Layer-Struktur

```
┌─────────────────────────────────────┐
│     React Components & Hooks        │
│  (useVacations, useExpenses, etc.)  │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│       Backend Abstraction Layer     │
│     (BackendFactory, Interfaces)    │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│          Repository Layer           │
│    (vacationRepository, etc.)       │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│           Drizzle ORM               │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      SQLite Database (Expo)         │
└─────────────────────────────────────┘
```

### Backend Abstraction Layer

Der Backend Abstraction Layer ermöglicht es, in Zukunft einfach zwischen verschiedenen Backend-Implementierungen zu wechseln:

- **SQLite**: Lokale Datenbank (aktuell implementiert)
- **Supabase**: Cloud-Datenbank (zukünftig)
- **Hybrid**: SQLite + Supabase mit Synchronisierung (zukünftig)

**Verwendung:**

```typescript
import { getBackend } from '@/lib/backend';

const backend = getBackend();
const vacations = await backend.vacations.findAll();
```

## Datenbank-Schema

### Tables

#### `vacations`
Speichert alle Urlaubsinformationen.

```typescript
{
  id: string (UUID)
  destination: string
  country: string
  hotel: string
  startDate: string (ISO Date)
  endDate: string (ISO Date)
  budget: number?
  currency: string?
  imageUrl: string?
  createdAt: string (ISO Date)
  updatedAt: string (ISO Date)
}
```

**Foreign Keys:**
- `expenses.vacationId` → CASCADE DELETE
- `checklists.vacationId` → CASCADE DELETE

#### `expenses`
Speichert alle Ausgaben pro Urlaub.

```typescript
{
  id: string (UUID)
  vacationId: string (FK → vacations.id)
  amount: number
  currency: string
  category: string
  description: string?
  date: string (ISO Date)
  location: string?
  paymentMethod: string?
  notes: string?
  createdAt: string (ISO Date)
  updatedAt: string (ISO Date)
}
```

**Foreign Keys:**
- `vacationId` → `vacations.id` (ON DELETE CASCADE)

#### `checklists`
Speichert Checklisten (Templates und Vacation-spezifisch).

```typescript
{
  id: string (UUID)
  title: string
  description: string?
  isTemplate: boolean
  vacationId: string? (FK → vacations.id)
  templateId: string?
  category: string
  icon: string
  createdAt: string (ISO Date)
  updatedAt: string (ISO Date)
}
```

**Foreign Keys:**
- `vacationId` → `vacations.id` (ON DELETE CASCADE, NULLABLE)

#### `checklist_items`
Speichert einzelne Checklist-Einträge.

```typescript
{
  id: string (UUID)
  checklistId: string (FK → checklists.id)
  text: string
  completed: boolean
  notes: string?
  priority: string
  dueDate: string? (ISO Date)
  quantity: number?
  order: number
  createdAt: string (ISO Date)
  updatedAt: string (ISO Date)
}
```

**Foreign Keys:**
- `checklistId` → `checklists.id` (ON DELETE CASCADE)

#### `app_settings`
Key-Value Store für App-Einstellungen.

```typescript
{
  key: string (PRIMARY KEY)
  value: string
  createdAt: string (ISO Date)
  updatedAt: string (ISO Date)
}
```

**Gespeicherte Settings:**
- `language`: 'de' | 'en' | 'fr' | 'it'
- `onboarding_completed`: 'true' | 'false'
- `notifications_enabled`: 'true' | 'false'
- `notifications_permission`: 'granted' | 'denied' | 'not-determined'
- `defaultCurrency`: z.B. 'CHF', 'EUR'
- `theme`: 'auto' | 'light' | 'dark'
- Exchange rate cache und weitere...

## Migration von AsyncStorage zu SQLite

### Migration-Ablauf

Die App führt beim ersten Start nach dem Update automatisch eine einmalige Migration durch:

1. **Settings Migration** (`migrate-settings-to-sqlite.ts`)
   - Migriert: Sprache, Onboarding-Status, Notification-Einstellungen
   - Läuft VOR der i18n-Initialisierung

2. **Vacation Migration** (`migrate-vacations-to-sqlite.ts`)
   - Migriert alle Urlaubsdaten von AsyncStorage

3. **Expense Migration** (`migrate-expenses-to-sqlite.ts`)
   - Migriert alle Ausgaben von AsyncStorage

### Migration Verification

Jede Migration:
- Prüft ob bereits durchgeführt
- Setzt Migration-Flag nach erfolgreichem Abschluss
- Verifiziert Datenintegrität
- Bereinigt AsyncStorage bei Erfolg

**Migration-Flags in AsyncStorage:**
- `@vacation_assist:settings_migrated_to_sqlite`
- `@vacation_assist_migrated_to_sqlite` (Vacations)
- Im Expense Storage direkt verwaltet

## CASCADE DELETE

Beim Löschen eines Urlaubs werden automatisch alle verknüpften Daten gelöscht:

```
DELETE vacation(id='abc')
  ↓ CASCADE
  ├─ DELETE expenses WHERE vacationId='abc'
  └─ DELETE checklists WHERE vacationId='abc'
       ↓ CASCADE
       └─ DELETE checklist_items WHERE checklistId IN (...)
```

Dies verhindert verwaiste Daten (Orphaned Records).

## Repositories

### Base Repository

Alle Repositories erweitern `BaseRepository`, der gemeinsame Funktionalität bereitstellt:

```typescript
abstract class BaseRepository {
  protected db: DrizzleDB;

  protected getTimestamp(): string;
  protected stringToDate(dateString: string): Date;
  protected dateToString(date: Date): string;
}
```

### Verfügbare Repositories

- **VacationRepository** (`vacation-repository.ts`)
- **ExpenseRepository** (`expense-repository.ts`)
- **ChecklistRepository** (`checklist-repository.ts`)
- **AppSettingsRepository** (`app-settings-repository.ts`)

### Verwendung

```typescript
import { vacationRepository } from '@/lib/db/repositories/vacation-repository';

// Alle Urlaube laden
const vacations = await vacationRepository.findAll();

// Neuen Urlaub erstellen
const vacation = await vacationRepository.create({
  destination: 'Malediven',
  country: 'MV',
  hotel: 'Paradise Resort',
  startDate: new Date('2024-06-01'),
  endDate: new Date('2024-06-15'),
  budget: 5000,
  currency: 'CHF',
});

// Urlaub löschen (inkl. CASCADE DELETE)
await vacationRepository.delete(vacation.id);
```

## Services die SQLite nutzen

### i18n Service (`lib/i18n/index.ts`)
- Liest/Schreibt Spracheinstellungen in `app_settings`
- Key: `language`

### Onboarding Service (`lib/onboarding-service.ts`)
- Liest/Schreibt Onboarding-Status in `app_settings`
- Key: `onboarding_completed`

### Notification Service (`lib/services/notification-service.ts`)
- Liest/Schreibt Notification-Einstellungen in `app_settings`
- Keys: `notifications_enabled`, `notifications_permission`

## Zukünftige Erweiterungen

### Supabase Integration

Die Backend Abstraction Layer ist bereit für Supabase:

```typescript
// lib/backend/implementations/supabase-backend.ts
export class SupabaseBackend implements IBackend {
  // Implementation using Supabase client
}

// Aktivierung
await BackendFactory.switchBackend(BackendType.SUPABASE);
```

### Hybrid Mode mit Sync

```typescript
// lib/backend/implementations/hybrid-backend.ts
export class HybridBackend implements IBackend {
  private sqlite: SQLiteBackend;
  private supabase: SupabaseBackend;

  async sync(): Promise<void> {
    // Synchronisiere lokale Änderungen mit Cloud
  }
}
```

## Best Practices

### 1. Immer Repositories verwenden

❌ **Nicht direkt auf die DB zugreifen:**
```typescript
const result = await db.select().from(schema.vacations);
```

✅ **Repositories verwenden:**
```typescript
const vacations = await vacationRepository.findAll();
```

### 2. Typsichere Domain Objects

Repositories geben immer typsichere Domain Objects zurück (Date statt string).

### 3. Fehlerbehandlung

Repositories werfen Fehler, die in den Hooks/Components behandelt werden.

```typescript
try {
  const vacation = await vacationRepository.create(data);
} catch (error) {
  logger.error('Failed to create vacation:', error);
  // Handle error
}
```

### 4. Transaktionen

Für komplexe Operationen Transaktionen verwenden:

```typescript
await db.transaction(async (tx) => {
  // Multiple operations
  await tx.insert(schema.vacations).values(vacationData);
  await tx.insert(schema.expenses).values(expenseData);
});
```

## Debugging

### Logs aktivieren

```typescript
import { logger } from '@/lib/utils/logger';
logger.setLevel('debug');
```

### Migration Status prüfen

```typescript
import { settingsMigrationService } from '@/lib/db/migrations/migrate-settings-to-sqlite';

const stats = await settingsMigrationService.getMigrationStats();
console.log(stats);
```

### Datenbank inspizieren

Verwende den Debug-Screen in der App: `/debug`
