ALTER TABLE `checklists` ADD `order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `checklists_order_idx` ON `checklists` (`order`);