export default `CREATE TABLE \`app_settings\` (
	\`key\` text PRIMARY KEY NOT NULL,
	\`value\` text NOT NULL,
	\`created_at\` text NOT NULL,
	\`updated_at\` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE \`backup_history\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`file_name\` text NOT NULL,
	\`file_size\` integer NOT NULL,
	\`record_count\` integer NOT NULL,
	\`backup_type\` text NOT NULL,
	\`created_at\` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX \`backup_history_created_at_idx\` ON \`backup_history\` (\`created_at\`);--> statement-breakpoint
CREATE INDEX \`backup_history_backup_type_idx\` ON \`backup_history\` (\`backup_type\`);--> statement-breakpoint
CREATE TABLE \`categories\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`name\` text NOT NULL,
	\`icon\` text NOT NULL,
	\`is_default\` integer DEFAULT false NOT NULL,
	\`type\` text NOT NULL,
	\`created_at\` text NOT NULL,
	\`updated_at\` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX \`categories_type_idx\` ON \`categories\` (\`type\`);--> statement-breakpoint
CREATE INDEX \`categories_is_default_idx\` ON \`categories\` (\`is_default\`);--> statement-breakpoint
CREATE TABLE \`checklist_items\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`checklist_id\` text NOT NULL,
	\`text\` text NOT NULL,
	\`completed\` integer DEFAULT false NOT NULL,
	\`notes\` text,
	\`priority\` text DEFAULT 'medium' NOT NULL,
	\`due_date\` text,
	\`quantity\` integer,
	\`order\` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (\`checklist_id\`) REFERENCES \`checklists\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX \`checklist_items_checklist_id_idx\` ON \`checklist_items\` (\`checklist_id\`);--> statement-breakpoint
CREATE INDEX \`checklist_items_completed_idx\` ON \`checklist_items\` (\`completed\`);--> statement-breakpoint
CREATE INDEX \`checklist_items_order_idx\` ON \`checklist_items\` (\`order\`);--> statement-breakpoint
CREATE TABLE \`checklists\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`title\` text NOT NULL,
	\`description\` text,
	\`is_template\` integer DEFAULT false NOT NULL,
	\`vacation_id\` text,
	\`template_id\` text,
	\`category\` text NOT NULL,
	\`icon\` text NOT NULL,
	\`order\` integer DEFAULT 0 NOT NULL,
	\`created_at\` text NOT NULL,
	\`updated_at\` text NOT NULL,
	FOREIGN KEY (\`vacation_id\`) REFERENCES \`vacations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`template_id\`) REFERENCES \`checklists\`(\`id\`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX \`checklists_vacation_id_idx\` ON \`checklists\` (\`vacation_id\`);--> statement-breakpoint
CREATE INDEX \`checklists_is_template_idx\` ON \`checklists\` (\`is_template\`);--> statement-breakpoint
CREATE INDEX \`checklists_category_idx\` ON \`checklists\` (\`category\`);--> statement-breakpoint
CREATE INDEX \`checklists_order_idx\` ON \`checklists\` (\`order\`);--> statement-breakpoint
CREATE TABLE \`expenses\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`vacation_id\` text NOT NULL,
	\`amount\` real NOT NULL,
	\`currency\` text NOT NULL,
	\`amount_chf\` real NOT NULL,
	\`category\` text NOT NULL,
	\`description\` text NOT NULL,
	\`date\` text NOT NULL,
	\`image_url\` text,
	\`created_at\` text NOT NULL,
	FOREIGN KEY (\`vacation_id\`) REFERENCES \`vacations\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX \`expenses_vacation_id_idx\` ON \`expenses\` (\`vacation_id\`);--> statement-breakpoint
CREATE INDEX \`expenses_category_idx\` ON \`expenses\` (\`category\`);--> statement-breakpoint
CREATE INDEX \`expenses_date_idx\` ON \`expenses\` (\`date\`);--> statement-breakpoint
CREATE TABLE \`vacations\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`destination\` text NOT NULL,
	\`country\` text NOT NULL,
	\`hotel\` text NOT NULL,
	\`start_date\` text NOT NULL,
	\`end_date\` text NOT NULL,
	\`budget\` real,
	\`currency\` text DEFAULT 'CHF' NOT NULL,
	\`image_url\` text,
	\`created_at\` text NOT NULL,
	\`updated_at\` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX \`vacations_start_date_idx\` ON \`vacations\` (\`start_date\`);--> statement-breakpoint
CREATE INDEX \`vacations_country_idx\` ON \`vacations\` (\`country\`);`;