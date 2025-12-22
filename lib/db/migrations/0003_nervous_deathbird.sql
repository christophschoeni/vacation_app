CREATE TABLE `access_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`vacation_id` text NOT NULL,
	`code` text NOT NULL,
	`expires_at` text,
	`max_uses` integer,
	`use_count` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`vacation_id`) REFERENCES `vacations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `access_codes_vacation_id_idx` ON `access_codes` (`vacation_id`);--> statement-breakpoint
CREATE INDEX `access_codes_code_idx` ON `access_codes` (`code`);--> statement-breakpoint
CREATE INDEX `access_codes_expires_at_idx` ON `access_codes` (`expires_at`);--> statement-breakpoint
CREATE TABLE `exchange_rates` (
	`id` text PRIMARY KEY NOT NULL,
	`base_currency` text NOT NULL,
	`target_currency` text NOT NULL,
	`rate` real NOT NULL,
	`source` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `exchange_rates_base_currency_idx` ON `exchange_rates` (`base_currency`);--> statement-breakpoint
CREATE INDEX `exchange_rates_target_currency_idx` ON `exchange_rates` (`target_currency`);--> statement-breakpoint
CREATE INDEX `exchange_rates_source_idx` ON `exchange_rates` (`source`);--> statement-breakpoint
CREATE INDEX `exchange_rates_unique_pair_idx` ON `exchange_rates` (`base_currency`,`target_currency`);--> statement-breakpoint
CREATE TABLE `expense_splits` (
	`id` text PRIMARY KEY NOT NULL,
	`expense_id` text NOT NULL,
	`participant_id` text NOT NULL,
	`share_amount` real NOT NULL,
	`share_percentage` real,
	`is_payer` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `expense_splits_expense_id_idx` ON `expense_splits` (`expense_id`);--> statement-breakpoint
CREATE INDEX `expense_splits_participant_id_idx` ON `expense_splits` (`participant_id`);--> statement-breakpoint
CREATE INDEX `expense_splits_is_payer_idx` ON `expense_splits` (`is_payer`);--> statement-breakpoint
CREATE INDEX `expense_splits_unique_split_idx` ON `expense_splits` (`expense_id`,`participant_id`);--> statement-breakpoint
CREATE TABLE `participants` (
	`id` text PRIMARY KEY NOT NULL,
	`vacation_id` text NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`device_id` text,
	`is_owner` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`vacation_id`) REFERENCES `vacations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `participants_vacation_id_idx` ON `participants` (`vacation_id`);--> statement-breakpoint
CREATE INDEX `participants_is_owner_idx` ON `participants` (`is_owner`);--> statement-breakpoint
CREATE INDEX `participants_unique_name_idx` ON `participants` (`vacation_id`,`name`);--> statement-breakpoint
ALTER TABLE `expenses` ADD `paid_by` text;--> statement-breakpoint
ALTER TABLE `expenses` ADD `split_type` text DEFAULT 'equal' NOT NULL;--> statement-breakpoint
CREATE INDEX `expenses_paid_by_idx` ON `expenses` (`paid_by`);--> statement-breakpoint
ALTER TABLE `vacations` ADD `budget_currency` text DEFAULT 'CHF' NOT NULL;--> statement-breakpoint
ALTER TABLE `vacations` ADD `is_shared` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `vacations` ADD `participant_count` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX `vacations_is_shared_idx` ON `vacations` (`is_shared`);