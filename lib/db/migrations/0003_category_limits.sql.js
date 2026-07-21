export default `CREATE TABLE \`category_limits\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`vacation_id\` text NOT NULL,
	\`category\` text NOT NULL,
	\`limit_amount\` real NOT NULL,
	\`created_at\` text NOT NULL,
	\`updated_at\` text NOT NULL,
	FOREIGN KEY (\`vacation_id\`) REFERENCES \`vacations\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX \`category_limits_vacation_id_idx\` ON \`category_limits\` (\`vacation_id\`);
CREATE UNIQUE INDEX \`category_limits_unique_idx\` ON \`category_limits\` (\`vacation_id\`,\`category\`);`;
