// Phase 1 — sync foundation. Adds soft-delete/sync bookkeeping columns to every
// sync-relevant table, a reference currency + per-expense exchange rate, a
// stable slug on categories, and the durable sync_outbox queue.
//
// SQLite ALTER TABLE ADD COLUMN only allows a CONSTANT default, so columns that
// are logically NOT NULL (updated_at / created_at on expenses + checklist_items)
// are added NULLable here and backfilled by migrate-to-uuid-and-sync.ts.
//
// IMPORTANT: statements are separated by `--> statement-breakpoint`. The
// expo-sqlite drizzle migrator splits on that marker and runs each piece as its
// own query; WITHOUT it, only the FIRST statement runs while the migration is
// still recorded as done — the exact bug this file previously had. The
// exchange_rates unique index is (re)created by the backfill script after it
// dedupes existing rows, so it is intentionally not created here.

export default `ALTER TABLE \`vacations\` ADD \`reference_currency\` text DEFAULT 'CHF' NOT NULL;
--> statement-breakpoint
ALTER TABLE \`vacations\` ADD \`deleted_at\` text;
--> statement-breakpoint
ALTER TABLE \`vacations\` ADD \`sync_status\` text DEFAULT 'pending' NOT NULL;
--> statement-breakpoint
ALTER TABLE \`vacations\` ADD \`server_updated_at\` text;
--> statement-breakpoint
ALTER TABLE \`vacations\` ADD \`created_by\` text;
--> statement-breakpoint
CREATE INDEX \`vacations_deleted_at_idx\` ON \`vacations\` (\`deleted_at\`);
--> statement-breakpoint
CREATE INDEX \`vacations_updated_at_idx\` ON \`vacations\` (\`updated_at\`);
--> statement-breakpoint
ALTER TABLE \`expenses\` ADD \`exchange_rate\` real;
--> statement-breakpoint
ALTER TABLE \`expenses\` ADD \`updated_at\` text;
--> statement-breakpoint
ALTER TABLE \`expenses\` ADD \`deleted_at\` text;
--> statement-breakpoint
ALTER TABLE \`expenses\` ADD \`sync_status\` text DEFAULT 'pending' NOT NULL;
--> statement-breakpoint
ALTER TABLE \`expenses\` ADD \`server_updated_at\` text;
--> statement-breakpoint
ALTER TABLE \`expenses\` ADD \`created_by\` text;
--> statement-breakpoint
CREATE INDEX \`expenses_deleted_at_idx\` ON \`expenses\` (\`deleted_at\`);
--> statement-breakpoint
CREATE INDEX \`expenses_updated_at_idx\` ON \`expenses\` (\`updated_at\`);
--> statement-breakpoint
ALTER TABLE \`checklists\` ADD \`deleted_at\` text;
--> statement-breakpoint
ALTER TABLE \`checklists\` ADD \`sync_status\` text DEFAULT 'pending' NOT NULL;
--> statement-breakpoint
ALTER TABLE \`checklists\` ADD \`server_updated_at\` text;
--> statement-breakpoint
ALTER TABLE \`checklists\` ADD \`created_by\` text;
--> statement-breakpoint
CREATE INDEX \`checklists_deleted_at_idx\` ON \`checklists\` (\`deleted_at\`);
--> statement-breakpoint
CREATE INDEX \`checklists_updated_at_idx\` ON \`checklists\` (\`updated_at\`);
--> statement-breakpoint
ALTER TABLE \`checklist_items\` ADD \`created_at\` text;
--> statement-breakpoint
ALTER TABLE \`checklist_items\` ADD \`updated_at\` text;
--> statement-breakpoint
ALTER TABLE \`checklist_items\` ADD \`deleted_at\` text;
--> statement-breakpoint
ALTER TABLE \`checklist_items\` ADD \`sync_status\` text DEFAULT 'pending' NOT NULL;
--> statement-breakpoint
ALTER TABLE \`checklist_items\` ADD \`server_updated_at\` text;
--> statement-breakpoint
ALTER TABLE \`checklist_items\` ADD \`created_by\` text;
--> statement-breakpoint
CREATE INDEX \`checklist_items_deleted_at_idx\` ON \`checklist_items\` (\`deleted_at\`);
--> statement-breakpoint
CREATE INDEX \`checklist_items_updated_at_idx\` ON \`checklist_items\` (\`updated_at\`);
--> statement-breakpoint
ALTER TABLE \`categories\` ADD \`slug\` text;
--> statement-breakpoint
ALTER TABLE \`categories\` ADD \`deleted_at\` text;
--> statement-breakpoint
ALTER TABLE \`categories\` ADD \`sync_status\` text DEFAULT 'pending' NOT NULL;
--> statement-breakpoint
ALTER TABLE \`categories\` ADD \`server_updated_at\` text;
--> statement-breakpoint
ALTER TABLE \`categories\` ADD \`created_by\` text;
--> statement-breakpoint
CREATE INDEX \`categories_deleted_at_idx\` ON \`categories\` (\`deleted_at\`);
--> statement-breakpoint
CREATE INDEX \`categories_updated_at_idx\` ON \`categories\` (\`updated_at\`);
--> statement-breakpoint
ALTER TABLE \`category_limits\` ADD \`deleted_at\` text;
--> statement-breakpoint
ALTER TABLE \`category_limits\` ADD \`sync_status\` text DEFAULT 'pending' NOT NULL;
--> statement-breakpoint
ALTER TABLE \`category_limits\` ADD \`server_updated_at\` text;
--> statement-breakpoint
ALTER TABLE \`category_limits\` ADD \`created_by\` text;
--> statement-breakpoint
CREATE INDEX \`category_limits_deleted_at_idx\` ON \`category_limits\` (\`deleted_at\`);
--> statement-breakpoint
CREATE INDEX \`category_limits_updated_at_idx\` ON \`category_limits\` (\`updated_at\`);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX \`sync_outbox_entity_idx\` ON \`sync_outbox\` (\`entity_type\`,\`entity_id\`);
--> statement-breakpoint
CREATE INDEX \`sync_outbox_created_at_idx\` ON \`sync_outbox\` (\`created_at\`);`;
