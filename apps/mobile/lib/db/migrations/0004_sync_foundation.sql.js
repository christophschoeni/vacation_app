// Phase 1 — sync foundation. Adds soft-delete/sync bookkeeping columns to every
// sync-relevant table, a reference currency + per-expense exchange rate, a
// stable slug on categories, the durable sync_outbox queue, and fixes the
// exchange_rates unique index.
//
// SQLite's ALTER TABLE ADD COLUMN only allows a CONSTANT default, so columns
// that logically are NOT NULL (updated_at / created_at on expenses and
// checklist_items) are added NULLable here and backfilled by
// migrate-to-uuid-and-sync.ts. Drizzle enforces NOT NULL at insert time, which
// is what matters going forward.
//
// The exchange_rates unique index requires de-duplication first, otherwise
// creating it throws on existing duplicate pairs — done in the backfill script
// BEFORE this migration's unique index is created is impossible (migrations run
// first), so we drop the old index here and the backfill dedupes, then the
// unique index is created by a follow-up statement guarded to run after dedup.
// To keep it robust we create the unique index in the backfill script instead
// of here (see migrate-to-uuid-and-sync.ts step 6).

export default `ALTER TABLE \`vacations\` ADD \`reference_currency\` text DEFAULT 'CHF' NOT NULL;
ALTER TABLE \`vacations\` ADD \`deleted_at\` text;
ALTER TABLE \`vacations\` ADD \`sync_status\` text DEFAULT 'pending' NOT NULL;
ALTER TABLE \`vacations\` ADD \`server_updated_at\` text;
ALTER TABLE \`vacations\` ADD \`created_by\` text;
CREATE INDEX \`vacations_deleted_at_idx\` ON \`vacations\` (\`deleted_at\`);
CREATE INDEX \`vacations_updated_at_idx\` ON \`vacations\` (\`updated_at\`);

ALTER TABLE \`expenses\` ADD \`exchange_rate\` real;
ALTER TABLE \`expenses\` ADD \`updated_at\` text;
ALTER TABLE \`expenses\` ADD \`deleted_at\` text;
ALTER TABLE \`expenses\` ADD \`sync_status\` text DEFAULT 'pending' NOT NULL;
ALTER TABLE \`expenses\` ADD \`server_updated_at\` text;
ALTER TABLE \`expenses\` ADD \`created_by\` text;
CREATE INDEX \`expenses_deleted_at_idx\` ON \`expenses\` (\`deleted_at\`);
CREATE INDEX \`expenses_updated_at_idx\` ON \`expenses\` (\`updated_at\`);

ALTER TABLE \`checklists\` ADD \`deleted_at\` text;
ALTER TABLE \`checklists\` ADD \`sync_status\` text DEFAULT 'pending' NOT NULL;
ALTER TABLE \`checklists\` ADD \`server_updated_at\` text;
ALTER TABLE \`checklists\` ADD \`created_by\` text;
CREATE INDEX \`checklists_deleted_at_idx\` ON \`checklists\` (\`deleted_at\`);
CREATE INDEX \`checklists_updated_at_idx\` ON \`checklists\` (\`updated_at\`);

ALTER TABLE \`checklist_items\` ADD \`created_at\` text;
ALTER TABLE \`checklist_items\` ADD \`updated_at\` text;
ALTER TABLE \`checklist_items\` ADD \`deleted_at\` text;
ALTER TABLE \`checklist_items\` ADD \`sync_status\` text DEFAULT 'pending' NOT NULL;
ALTER TABLE \`checklist_items\` ADD \`server_updated_at\` text;
ALTER TABLE \`checklist_items\` ADD \`created_by\` text;
CREATE INDEX \`checklist_items_deleted_at_idx\` ON \`checklist_items\` (\`deleted_at\`);
CREATE INDEX \`checklist_items_updated_at_idx\` ON \`checklist_items\` (\`updated_at\`);

ALTER TABLE \`categories\` ADD \`slug\` text;
ALTER TABLE \`categories\` ADD \`deleted_at\` text;
ALTER TABLE \`categories\` ADD \`sync_status\` text DEFAULT 'pending' NOT NULL;
ALTER TABLE \`categories\` ADD \`server_updated_at\` text;
ALTER TABLE \`categories\` ADD \`created_by\` text;
CREATE INDEX \`categories_deleted_at_idx\` ON \`categories\` (\`deleted_at\`);
CREATE INDEX \`categories_updated_at_idx\` ON \`categories\` (\`updated_at\`);

ALTER TABLE \`category_limits\` ADD \`deleted_at\` text;
ALTER TABLE \`category_limits\` ADD \`sync_status\` text DEFAULT 'pending' NOT NULL;
ALTER TABLE \`category_limits\` ADD \`server_updated_at\` text;
ALTER TABLE \`category_limits\` ADD \`created_by\` text;
CREATE INDEX \`category_limits_deleted_at_idx\` ON \`category_limits\` (\`deleted_at\`);
CREATE INDEX \`category_limits_updated_at_idx\` ON \`category_limits\` (\`updated_at\`);

CREATE TABLE \`sync_outbox\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`entity_type\` text NOT NULL,
	\`entity_id\` text NOT NULL,
	\`operation\` text NOT NULL,
	\`dirty_fields\` text,
	\`client_updated_at\` text NOT NULL,
	\`attempts\` integer DEFAULT 0 NOT NULL,
	\`last_error\` text,
	\`created_at\` text NOT NULL
);
CREATE INDEX \`sync_outbox_entity_idx\` ON \`sync_outbox\` (\`entity_type\`,\`entity_id\`);
CREATE INDEX \`sync_outbox_created_at_idx\` ON \`sync_outbox\` (\`created_at\`);`;
