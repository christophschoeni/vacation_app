# Architektur: Reise teilen + offline-fähiger Sync

Referenzdokument. Entscheidung getroffen (2026-07-27): **Server (Postgres) =
Source of Truth**, App = offline-fähiger Cache mit Outbox, **feldbasiertes
Last-Writer-Wins-Merge**, **gleichberechtigtes** Sharing (mit role-Feld als
Leitplanke).

## Ausgangslage (verifiziert)

- **App-DB (SQLite/Drizzle):** funktional, aber NICHT sync-fähig. IDs =
  `Date.now()+Math.random()` (keine UUID), kein Owner, kein Sharing, `updated_at`
  fehlt bei `expenses`+`checklist_items`, kein Soft-Delete. Drei parallele
  Kategorie-Stores (Enum-Konstante / SQLite-Tabelle `categories` / AsyncStorage).
  `exchange_rates`-"unique"-Index ist faktisch nicht unique. `amount_chf`
  denormalisiert ohne gespeicherten Kurs.
- **Backend (Postgres):** `BaseModel` (UUID-PK + created/updated/deleted_at) da.
  `Vacation`+`Expense` mit `owner`-FK. Auth komplett fertig. KEINE
  Checklists/Categories, KEIN Membership, KEINE CRUD/Sync-Endpoints.

## Leitentscheidungen

- **E1** UUID sofort, kein Dual-ID. Bestehende Legacy-IDs per Backfill auf UUIDv4.
- **E2** Client generiert UUIDs; Server akzeptiert Client-UUID als PK (Offline-First).
- **E3** Kein Per-Feld-Timestamp. Client pusht nur geänderte Felder (Dirty-Fields
  aus Outbox) + Record-`updated_at`; Server merged feldweise per LWW.
- **E4** Membership mit `role` (owner/editor). Jetzt: beide dürfen alles bearbeiten;
  nur owner darf Reise löschen + Mitglieder verwalten. `Vacation.owner` bleibt,
  Zugriffsprüfung läuft einheitlich über Memberships (owner bekommt Auto-Membership).
- **E5 (KRITISCH — Währung beim Teilen):** `amount_chf` = Betrag in
  `vacation.reference_currency` (default CHF, reiseweit, NICHT Home-Währung eines
  Nutzers). Pro Ausgabe zusätzlich `exchange_rate` speichern. Budget + Limits
  ebenfalls in reference_currency. Home-Währung (`defaultCurrency`) bleibt
  gerätelokal + unsynced (reine Anzeige-Präferenz). Sonst sehen zwei Partner mit
  unterschiedlicher Home-Währung divergierende Summen.

## Phasen

| Phase | Ziel | Aufwand | Risiko | Braucht |
|---|---|---|---|---|
| 0 | Test-Baseline, REFERENCE_CURRENCY-Konstante | XS | sehr niedrig | — |
| 1 | App-DB-Sanierung: UUID-Backfill, updated_at/deleted_at überall, sync_status/server_updated_at/created_by, Kategorie-Konsolidierung (SQLite=Truth, Enum=Seed mit deterministischer UUIDv5, AsyncStorage weg), exchange_rates-Unique fixen, budget/limits→reference_currency, exchange_rate pro Ausgabe | L | **hoch** | 0 |
| 2 | Backend: Checklist/ChecklistItem/Category/CategoryLimit Models; Vacation.reference_currency; Expense.exchange_rate+created_by; VacationMembership; VacationInvite (Code+optional Resend-Mail); owner→Membership-Backfill | M | niedrig | 0 |
| 3 | DRF CRUD-ViewSets + IsVacationMember-Permission; Delta-Sync `GET /api/sync/?since=` (inkl. Tombstones) + `POST /api/sync/` (feldweiser LWW, select_for_update, FK-Reihenfolge, delete-wins-bei-Gleichstand, Server-Zeit als Cursor) | L | **hoch** | 1,2 |
| 4 | App-Sync-Layer: sync_outbox-Tabelle, BaseRepository erweitern (dirty-fields, soft-delete, UUID via Crypto.randomUUID), sync/engine.ts (push→pull, backoff, NetInfo-Trigger, TanStack-Invalidation über keys.ts) | L | **hoch** | 1,3 |
| 5 | Sharing-UI: teilen (Invite/Code/Link+WhatsApp), annehmen (Deep-Link laflax.com + Code), Mitglieder, geteilt-Badge, created_by pro Ausgabe, i18n 7 Locales | M | niedrig-mittel | 2,3,4 |
| 6 | packages/api-client: openapi-typescript + openapi-fetch (NICHT orval — behält bestehende Refresh-Logik in client.ts), Sync-Endpoint handgeschrieben gegen generierte Typen | S-M | niedrig | 3 |

Phasen 1 & 2 parallelisierbar. Phase 6 ab stabilem Schema (nach 3).

## Drei kritischste Fallstricke
1. **UUID-Migration bestehender Daten (1b):** FK-Remap in Reihenfolge
   (vacations→expenses/checklists→items; checklists.template_id self-FK),
   `PRAGMA foreign_keys=OFF` in Transaktion, `foreign_key_check`-Assertion,
   idempotenter Marker. Reihenfolge: erst migrate-expenses-to-sqlite, DANN UUID.
   Fehler = stiller Datenverlust bei echten Nutzern.
2. **Feld-Merge-Semantik (3/4):** delete-wins-bei-Gleichstand, Dirty-Field-Push,
   deterministische Kategorie-UUIDv5 gegen Create-Create-Duplikate, Server-Zeit
   als einziger Pull-Cursor gegen Clock-Skew, Outbox-Einträge pro entity_id mergen.
3. **reference_currency ≠ Home-Währung (E5):** siehe oben.

Siehe auch [[monorepo-backend-plan]], [[category-systems-drift]], [[laflax-branding]].
