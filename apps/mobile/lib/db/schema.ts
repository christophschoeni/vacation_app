import { sqliteTable, text, integer, real, foreignKey, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Shared sync columns. Every sync-relevant table carries these so the offline
// sync layer (see docs/sharing-sync-architecture.md) can do a field-based
// last-writer-wins merge with soft-delete tombstones.
//
//  - deletedAt:       soft-delete tombstone (ISO string); null = live row
//  - syncStatus:      'pending' (local change not yet pushed) | 'synced' | 'conflict'
//  - serverUpdatedAt: the updatedAt the server last confirmed for this row
//  - createdBy:       UUID of the user who created the row (null until known)
const syncColumns = {
  deletedAt: text('deleted_at'),
  syncStatus: text('sync_status').notNull().default('pending'),
  serverUpdatedAt: text('server_updated_at'),
  createdBy: text('created_by'),
};

// Vacations table
export const vacations = sqliteTable('vacations', {
  id: text('id').primaryKey(),
  destination: text('destination').notNull(),
  country: text('country').notNull(),
  hotel: text('hotel').notNull(),
  startDate: text('start_date').notNull(), // ISO date string
  endDate: text('end_date').notNull(),     // ISO date string
  budget: real('budget'),
  budgetCurrency: text('budget_currency').notNull().default('CHF'), // Currency in which budget is specified (system currency)
  currency: text('currency').notNull().default('CHF'), // Vacation currency for expenses
  // Shared reference currency for stored totals (budget, limits, expense
  // amountCHF). Defaults to CHF; owner-set, not a per-user home currency.
  referenceCurrency: text('reference_currency').notNull().default('CHF'),
  imageUrl: text('image_url'),
  createdAt: text('created_at').notNull(), // ISO date string
  updatedAt: text('updated_at').notNull(), // ISO date string
  ...syncColumns,
}, (table) => ({
  startDateIdx: index('vacations_start_date_idx').on(table.startDate),
  countryIdx: index('vacations_country_idx').on(table.country),
  deletedAtIdx: index('vacations_deleted_at_idx').on(table.deletedAt),
  updatedAtIdx: index('vacations_updated_at_idx').on(table.updatedAt),
}));

// Expenses table
export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  vacationId: text('vacation_id').notNull(),
  amount: real('amount').notNull(),
  currency: text('currency').notNull(),
  amountCHF: real('amount_chf').notNull(), // amount in the vacation's referenceCurrency
  // Rate used to convert `amount` (in `currency`) into `amountCHF` at capture
  // time, so the reference amount is reproducible and stays identical across
  // devices. Null for historical rows where it couldn't be reconstructed.
  exchangeRate: real('exchange_rate'),
  category: text('category').notNull(), // 'transport' | 'accommodation' | 'food' | 'entertainment' | 'shopping' | 'other'
  description: text('description').notNull(),
  date: text('date').notNull(), // ISO date string
  imageUrl: text('image_url'),
  createdAt: text('created_at').notNull(), // ISO date string
  updatedAt: text('updated_at').notNull(), // ISO date string (added for sync)
  ...syncColumns,
}, (table) => ({
  vacationIdFk: foreignKey({
    columns: [table.vacationId],
    foreignColumns: [vacations.id],
    name: 'expenses_vacation_id_fk'
  }).onDelete('cascade'),
  vacationIdIdx: index('expenses_vacation_id_idx').on(table.vacationId),
  categoryIdx: index('expenses_category_idx').on(table.category),
  dateIdx: index('expenses_date_idx').on(table.date),
  deletedAtIdx: index('expenses_deleted_at_idx').on(table.deletedAt),
  updatedAtIdx: index('expenses_updated_at_idx').on(table.updatedAt),
}));

// Checklists table
export const checklists = sqliteTable('checklists', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  isTemplate: integer('is_template', { mode: 'boolean' }).notNull().default(false),
  vacationId: text('vacation_id'), // null for templates
  templateId: text('template_id'), // reference to original template
  category: text('category').notNull(), // 'packing' | 'shopping' | 'bucket' | 'todo' | 'planning' | 'general' | 'custom'
  icon: text('icon').notNull(),
  order: integer('order').notNull().default(0),
  createdAt: text('created_at').notNull(), // ISO date string
  updatedAt: text('updated_at').notNull(), // ISO date string
  ...syncColumns,
}, (table) => ({
  vacationIdFk: foreignKey({
    columns: [table.vacationId],
    foreignColumns: [vacations.id],
    name: 'checklists_vacation_id_fk'
  }).onDelete('cascade'),
  templateIdFk: foreignKey({
    columns: [table.templateId],
    foreignColumns: [table.id],
    name: 'checklists_template_id_fk'
  }).onDelete('set null'),
  vacationIdIdx: index('checklists_vacation_id_idx').on(table.vacationId),
  isTemplateIdx: index('checklists_is_template_idx').on(table.isTemplate),
  categoryIdx: index('checklists_category_idx').on(table.category),
  orderIdx: index('checklists_order_idx').on(table.order),
  deletedAtIdx: index('checklists_deleted_at_idx').on(table.deletedAt),
  updatedAtIdx: index('checklists_updated_at_idx').on(table.updatedAt),
}));

// Checklist Items table
export const checklistItems = sqliteTable('checklist_items', {
  id: text('id').primaryKey(),
  checklistId: text('checklist_id').notNull(),
  text: text('text').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),
  priority: text('priority').notNull().default('medium'), // 'low' | 'medium' | 'high'
  dueDate: text('due_date'), // ISO date string
  quantity: integer('quantity'),
  order: integer('order').notNull().default(0),
  createdAt: text('created_at').notNull(), // ISO date string (added for sync)
  updatedAt: text('updated_at').notNull(), // ISO date string (added for sync)
  ...syncColumns,
}, (table) => ({
  checklistIdFk: foreignKey({
    columns: [table.checklistId],
    foreignColumns: [checklists.id],
    name: 'checklist_items_checklist_id_fk'
  }).onDelete('cascade'),
  checklistIdIdx: index('checklist_items_checklist_id_idx').on(table.checklistId),
  completedIdx: index('checklist_items_completed_idx').on(table.completed),
  orderIdx: index('checklist_items_order_idx').on(table.order),
  deletedAtIdx: index('checklist_items_deleted_at_idx').on(table.deletedAt),
  updatedAtIdx: index('checklist_items_updated_at_idx').on(table.updatedAt),
}));

// Categories table (for custom expense/checklist categories)
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  type: text('type').notNull(), // 'expense' | 'checklist'
  // Stable slug (e.g. 'food') for default categories, so the same category has
  // the same identity across devices. Null for user-created custom categories.
  slug: text('slug'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  ...syncColumns,
}, (table) => ({
  typeIdx: index('categories_type_idx').on(table.type),
  isDefaultIdx: index('categories_is_default_idx').on(table.isDefault),
  deletedAtIdx: index('categories_deleted_at_idx').on(table.deletedAt),
  updatedAtIdx: index('categories_updated_at_idx').on(table.updatedAt),
}));

// App Settings table (key-value store)
export const appSettings = sqliteTable('app_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Backup History table (for tracking exports/backups)
export const backupHistory = sqliteTable('backup_history', {
  id: text('id').primaryKey(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  recordCount: integer('record_count').notNull(),
  backupType: text('backup_type').notNull(), // 'manual' | 'auto' | 'export'
  createdAt: text('created_at').notNull(),
}, (table) => ({
  createdAtIdx: index('backup_history_created_at_idx').on(table.createdAt),
  backupTypeIdx: index('backup_history_backup_type_idx').on(table.backupType),
}));

// Exchange Rates table (for manual currency rates and tracking)
export const exchangeRates = sqliteTable('exchange_rates', {
  id: text('id').primaryKey(),
  baseCurrency: text('base_currency').notNull(), // e.g., 'CHF'
  targetCurrency: text('target_currency').notNull(), // e.g., 'EUR'
  rate: real('rate').notNull(), // Exchange rate value
  source: text('source').notNull(), // 'manual' | 'api' | 'fallback'
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  baseCurrencyIdx: index('exchange_rates_base_currency_idx').on(table.baseCurrency),
  targetCurrencyIdx: index('exchange_rates_target_currency_idx').on(table.targetCurrency),
  sourceIdx: index('exchange_rates_source_idx').on(table.source),
  // One rate per base-target pair. Was mistakenly a non-unique index before;
  // migration 0004 dedupes existing rows then recreates it as unique.
  uniquePairIdx: uniqueIndex('exchange_rates_unique_pair_idx').on(table.baseCurrency, table.targetCurrency),
}));

// Per-category spending limits for a vacation.
//
// A limit is optional: a category without a row here has no cap, which is what
// the report renders as "kein Limit". The amount is stored in the vacation's
// own budgetCurrency so it stays comparable with vacation.budget without a
// conversion at read time.
export const categoryLimits = sqliteTable('category_limits', {
  id: text('id').primaryKey(),
  vacationId: text('vacation_id').notNull(),
  category: text('category').notNull(),
  limitAmount: real('limit_amount').notNull(), // stored in the vacation's referenceCurrency
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  ...syncColumns,
}, (table) => ({
  vacationIdFk: foreignKey({
    columns: [table.vacationId],
    foreignColumns: [vacations.id],
    name: 'category_limits_vacation_id_fk'
  }).onDelete('cascade'),
  vacationIdIdx: index('category_limits_vacation_id_idx').on(table.vacationId),
  // One limit per category per vacation.
  uniqueCategoryIdx: uniqueIndex('category_limits_unique_idx').on(table.vacationId, table.category),
  deletedAtIdx: index('category_limits_deleted_at_idx').on(table.deletedAt),
  updatedAtIdx: index('category_limits_updated_at_idx').on(table.updatedAt),
}));

// Sync outbox: durable queue of local changes waiting to be pushed to the
// server. A write is recorded here in the SAME transaction as the data change,
// so a change survives an app kill or network loss and is never silently lost —
// the push happens later when connectivity allows. One row per pending change;
// the sync engine coalesces multiple rows for the same entity before pushing.
export const syncOutbox = sqliteTable('sync_outbox', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(), // 'vacation' | 'expense' | 'checklist' | ...
  entityId: text('entity_id').notNull(),
  operation: text('operation').notNull(), // 'upsert' | 'delete'
  // JSON array of changed field names (dirty fields) for a field-based merge.
  dirtyFields: text('dirty_fields'),
  clientUpdatedAt: text('client_updated_at').notNull(),
  attempts: integer('attempts').notNull().default(0),
  lastError: text('last_error'),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  entityIdx: index('sync_outbox_entity_idx').on(table.entityType, table.entityId),
  createdAtIdx: index('sync_outbox_created_at_idx').on(table.createdAt),
}));

// Relations
export const vacationsRelations = relations(vacations, ({ many }) => ({
  expenses: many(expenses),
  checklists: many(checklists),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  vacation: one(vacations, {
    fields: [expenses.vacationId],
    references: [vacations.id],
  }),
}));

export const checklistsRelations = relations(checklists, ({ one, many }) => ({
  vacation: one(vacations, {
    fields: [checklists.vacationId],
    references: [vacations.id],
  }),
  template: one(checklists, {
    fields: [checklists.templateId],
    references: [checklists.id],
  }),
  items: many(checklistItems),
}));

export const checklistItemsRelations = relations(checklistItems, ({ one }) => ({
  checklist: one(checklists, {
    fields: [checklistItems.checklistId],
    references: [checklists.id],
  }),
}));