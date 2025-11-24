# Migration Guide: AsyncStorage → SQLite

## Overview

Diese App hat eine vollständige Migration von **AsyncStorage** zu **SQLite** durchgeführt. Alle Daten werden nun in einer zentralen SQLite-Datenbank gespeichert.

## Was wurde migriert?

### 1. Vacation Data
- **Von:** `@vacation_assist_vacations` (AsyncStorage)
- **Nach:** `vacations` table (SQLite)
- **Migration:** `lib/db/migrations/migrate-vacations-to-sqlite.ts`

### 2. Expense Data
- **Von:** `@vacation_assist_expenses` (AsyncStorage)
- **Nach:** `expenses` table (SQLite)
- **Migration:** `lib/db/migrations/migrate-expenses-to-sqlite.ts`

### 3. App Settings
- **Von:** Verschiedene AsyncStorage Keys
- **Nach:** `app_settings` table (SQLite)
- **Migration:** `lib/db/migrations/migrate-settings-to-sqlite.ts`

**Migrierte Settings:**
- `@vacation_assist_language` → `app_settings.language`
- `@reise_budget_onboarding_completed` → `app_settings.onboarding_completed`
- Notification Settings → `app_settings.notifications_*`

### 4. Checklist Data
- **Von:** `@vacation_assist_checklists` (AsyncStorage)
- **Nach:** `checklists` + `checklist_items` tables (SQLite)
- **Migration:** `lib/migration-service.ts`

## Migration Ablauf

### Automatische Migration beim App-Start

Die Migration erfolgt automatisch beim ersten App-Start nach dem Update:

```typescript
// app/_layout.tsx

// 1. Settings Migration (VOR i18n Init!)
await settingsMigrationService.migrateSettingsToSQLite();

// 2. i18n Initialization (liest jetzt von SQLite)
await translationService.initialize();

// 3. Vacation Migration
await vacationMigrationService.migrateVacationsToSQLite();

// 4. Expense Migration
await ExpensesMigration.migrate();

// 5. Checklist Migration (in appInitialization)
await migrationService.migrateAsyncStorageToSQLite();
```

### Migration-Flags

Jede Migration setzt ein Flag, um nicht mehrfach zu laufen:

- **Settings:** `@vacation_assist:settings_migrated_to_sqlite`
- **Vacations:** `@vacation_assist_migrated_to_sqlite`
- **Expenses:** Im Expense Storage verwaltet
- **Checklists:** `@vacation_assist_migrated_to_sqlite`

### Verification

Nach erfolgreicher Migration wird die Datenintegrität verifiziert:

```typescript
const verification = await settingsMigrationService.verifyMigration();
console.log('Settings Migration:', verification);
// {
//   sqliteLanguage: 'de',
//   sqliteOnboarding: true,
//   asyncStorageLanguage: 'de',  // Noch vorhanden für Vergleich
//   asyncStorageOnboarding: 'true',
//   migrationCompleted: true
// }
```

### Cleanup

Nach erfolgreicher Verification werden die alten AsyncStorage-Daten entfernt:

```typescript
await settingsMigrationService.cleanupAsyncStorage();
```

## Services die migriert wurden

### 1. i18n Service
**Vorher:**
```typescript
const language = await AsyncStorage.getItem('@vacation_assist_language');
await AsyncStorage.setItem('@vacation_assist_language', 'de');
```

**Nachher:**
```typescript
const language = await appSettingsRepository.getLanguage();
await appSettingsRepository.setLanguage('de');
```

### 2. Onboarding Service
**Vorher:**
```typescript
const completed = await AsyncStorage.getItem('@reise_budget_onboarding_completed');
await AsyncStorage.setItem('@reise_budget_onboarding_completed', 'true');
```

**Nachher:**
```typescript
const completed = await appSettingsRepository.getOnboardingCompleted();
await appSettingsRepository.setOnboardingCompleted(true);
```

### 3. Notification Service
**Vorher:**
```typescript
const settings = await AsyncStorage.getItem('@vacation_assist_notification_settings');
await AsyncStorage.setItem('@vacation_assist_notification_permission', 'granted');
```

**Nachher:**
```typescript
const settings = await appSettingsRepository.getNotificationSettings();
await appSettingsRepository.setNotificationsPermission('granted');
```

## Vorteile der SQLite-Migration

### 1. CASCADE DELETE
Verhindert verwaiste Daten (Orphaned Records):

```sql
DELETE FROM vacations WHERE id = 'abc'
  → Automatisch gelöscht: alle expenses mit vacationId = 'abc'
  → Automatisch gelöscht: alle checklists mit vacationId = 'abc'
```

### 2. Foreign Key Constraints
Datenkonsistenz wird erzwungen:

```typescript
// ❌ Fehler: Vacation existiert nicht
await expenseRepository.create({
  vacationId: 'non-existent-id',
  amount: 100,
  // ...
});
```

### 3. Transaktionen
Atomare Operationen:

```typescript
await db.transaction(async (tx) => {
  const vacation = await tx.insert(schema.vacations).values(data);
  await tx.insert(schema.expenses).values(expenseData);
  // Beide Operationen oder keine
});
```

### 4. Typsicherheit
Drizzle ORM bietet vollständige TypeScript-Typisierung:

```typescript
// Autocomplete und Type-Checking
const vacation: Vacation = await vacationRepository.findById(id);
vacation.startDate; // Date (nicht string!)
```

### 5. Bessere Performance
- Indizes auf Foreign Keys
- Effiziente Joins
- Optimierte Queries

### 6. SQL Queries
Komplexe Abfragen sind einfacher:

```typescript
// Alle aktiven Urlaube mit ihren Ausgaben
const activeVacationsWithExpenses = await db
  .select()
  .from(schema.vacations)
  .leftJoin(schema.expenses, eq(schema.expenses.vacationId, schema.vacations.id))
  .where(gte(schema.vacations.endDate, new Date().toISOString()));
```

## Probleme beheben

### Migration schlägt fehl

Wenn die Migration fehlschlägt:

1. **Logs prüfen:**
   ```typescript
   const stats = await settingsMigrationService.getMigrationStats();
   console.log(stats);
   ```

2. **Migration-Flag zurücksetzen:**
   ```typescript
   await AsyncStorage.removeItem('@vacation_assist:settings_migrated_to_sqlite');
   ```

3. **App neu starten** (Migration läuft erneut)

### Daten fehlen nach Migration

1. **Verification ausführen:**
   ```typescript
   const verification = await settingsMigrationService.verifyMigration();
   console.log(verification);
   ```

2. **AsyncStorage-Daten prüfen:**
   ```typescript
   const allKeys = await AsyncStorage.getAllKeys();
   console.log(allKeys.filter(k => k.startsWith('@vacation_assist')));
   ```

3. **SQLite-Daten prüfen:**
   ```typescript
   const settings = await appSettingsRepository.getAll();
   console.log(settings);
   ```

### Migration-Flag manuell setzen

Nur in Notfällen:

```typescript
await AsyncStorage.setItem('@vacation_assist:settings_migrated_to_sqlite', 'true');
```

## Testing

### Migration testen

1. **Testdaten in AsyncStorage erstellen:**
   ```typescript
   await AsyncStorage.setItem('@vacation_assist_language', 'de');
   await AsyncStorage.setItem('@reise_budget_onboarding_completed', 'true');
   ```

2. **Migration ausführen:**
   ```typescript
   const result = await settingsMigrationService.migrateSettingsToSQLite();
   console.log(result);
   ```

3. **Verification:**
   ```typescript
   const verification = await settingsMigrationService.verifyMigration();
   expect(verification.sqliteLanguage).toBe('de');
   expect(verification.sqliteOnboarding).toBe(true);
   ```

4. **Cleanup testen:**
   ```typescript
   await settingsMigrationService.cleanupAsyncStorage();
   const language = await AsyncStorage.getItem('@vacation_assist_language');
   expect(language).toBeNull();
   ```

## Rollback (Nicht empfohlen)

Falls absolut notwendig, kann man theoretisch zurück zu AsyncStorage:

```typescript
// 1. Daten aus SQLite exportieren
const settings = await appSettingsRepository.getAll();

// 2. In AsyncStorage schreiben
for (const [key, value] of Object.entries(settings)) {
  await AsyncStorage.setItem(`@vacation_assist_${key}`, value);
}

// 3. Migration-Flags löschen
await AsyncStorage.removeItem('@vacation_assist:settings_migrated_to_sqlite');

// 4. Code auf alte Version zurücksetzen (Git)
```

**⚠️ WARNUNG:** Dies wird NICHT empfohlen, da CASCADE DELETE und andere Features verloren gehen!

## Nächste Schritte

Nach erfolgreicher Migration:

1. ✅ Alle Daten in SQLite
2. ✅ AsyncStorage bereinigt
3. ✅ Services nutzen SQLite
4. ⏭️ Bereit für Supabase-Integration (Backend Abstraction Layer vorhanden)

## Support

Bei Problemen:
1. Debug-Screen öffnen: `/debug`
2. Migration Stats prüfen
3. Logs analysieren
4. Issue auf GitHub erstellen
