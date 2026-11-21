// IMPORTANT: statements are separated by `--> statement-breakpoint`. Without
// them the expo-sqlite migrator applies only the CREATE TABLE and silently
// drops the indexes, while still recording the migration as done.

export default `CREATE TABLE \`exchange_rates\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`base_currency\` text NOT NULL,
	\`target_currency\` text NOT NULL,
	\`rate\` real NOT NULL,
	\`source\` text NOT NULL,
	\`created_at\` text NOT NULL,
	\`updated_at\` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX \`exchange_rates_base_currency_idx\` ON \`exchange_rates\` (\`base_currency\`);
--> statement-breakpoint
CREATE INDEX \`exchange_rates_target_currency_idx\` ON \`exchange_rates\` (\`target_currency\`);
--> statement-breakpoint
CREATE INDEX \`exchange_rates_source_idx\` ON \`exchange_rates\` (\`source\`);
--> statement-breakpoint
CREATE INDEX \`exchange_rates_unique_pair_idx\` ON \`exchange_rates\` (\`base_currency\`,\`target_currency\`);`;
