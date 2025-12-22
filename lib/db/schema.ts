import { sqliteTable, text, integer, real, foreignKey, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

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
  imageUrl: text('image_url'),
  isShared: integer('is_shared', { mode: 'boolean' }).notNull().default(false), // Group sharing feature
  participantCount: integer('participant_count').notNull().default(1), // Number of participants
  createdAt: text('created_at').notNull(), // ISO date string
  updatedAt: text('updated_at').notNull(), // ISO date string
}, (table) => ({
  startDateIdx: index('vacations_start_date_idx').on(table.startDate),
  countryIdx: index('vacations_country_idx').on(table.country),
  isSharedIdx: index('vacations_is_shared_idx').on(table.isShared),
}));

// Expenses table
export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  vacationId: text('vacation_id').notNull(),
  amount: real('amount').notNull(),
  currency: text('currency').notNull(),
  amountCHF: real('amount_chf').notNull(),
  category: text('category').notNull(), // 'transport' | 'accommodation' | 'food' | 'entertainment' | 'shopping' | 'other'
  description: text('description').notNull(),
  date: text('date').notNull(), // ISO date string
  imageUrl: text('image_url'),
  paidBy: text('paid_by'), // Participant ID who paid
  splitType: text('split_type').notNull().default('equal'), // 'equal' | 'custom' | 'percentage' | 'shares'
  createdAt: text('created_at').notNull(), // ISO date string
}, (table) => ({
  vacationIdFk: foreignKey({
    columns: [table.vacationId],
    foreignColumns: [vacations.id],
    name: 'expenses_vacation_id_fk'
  }).onDelete('cascade'),
  vacationIdIdx: index('expenses_vacation_id_idx').on(table.vacationId),
  categoryIdx: index('expenses_category_idx').on(table.category),
  dateIdx: index('expenses_date_idx').on(table.date),
  paidByIdx: index('expenses_paid_by_idx').on(table.paidBy),
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
}, (table) => ({
  checklistIdFk: foreignKey({
    columns: [table.checklistId],
    foreignColumns: [checklists.id],
    name: 'checklist_items_checklist_id_fk'
  }).onDelete('cascade'),
  checklistIdIdx: index('checklist_items_checklist_id_idx').on(table.checklistId),
  completedIdx: index('checklist_items_completed_idx').on(table.completed),
  orderIdx: index('checklist_items_order_idx').on(table.order),
}));

// Categories table (for custom expense/checklist categories)
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  type: text('type').notNull(), // 'expense' | 'checklist'
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  typeIdx: index('categories_type_idx').on(table.type),
  isDefaultIdx: index('categories_is_default_idx').on(table.isDefault),
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
  // Unique constraint for base-target pair
  uniquePairIdx: index('exchange_rates_unique_pair_idx').on(table.baseCurrency, table.targetCurrency),
}));

// Participants table (for group sharing)
export const participants = sqliteTable('participants', {
  id: text('id').primaryKey(),
  vacationId: text('vacation_id').notNull(),
  name: text('name').notNull(),
  color: text('color').notNull(), // Hex color for avatar
  deviceId: text('device_id'), // Optional: for multi-device sync
  isOwner: integer('is_owner', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(), // ISO date string
}, (table) => ({
  vacationIdFk: foreignKey({
    columns: [table.vacationId],
    foreignColumns: [vacations.id],
    name: 'participants_vacation_id_fk'
  }).onDelete('cascade'),
  vacationIdIdx: index('participants_vacation_id_idx').on(table.vacationId),
  isOwnerIdx: index('participants_is_owner_idx').on(table.isOwner),
  // Unique constraint for vacation + name
  uniqueNameIdx: index('participants_unique_name_idx').on(table.vacationId, table.name),
}));

// Expense Splits table (how expenses are divided among participants)
export const expenseSplits = sqliteTable('expense_splits', {
  id: text('id').primaryKey(),
  expenseId: text('expense_id').notNull(),
  participantId: text('participant_id').notNull(),
  shareAmount: real('share_amount').notNull(), // Amount this participant owes
  sharePercentage: real('share_percentage'), // Optional: percentage share
  isPayer: integer('is_payer', { mode: 'boolean' }).notNull().default(false), // Is this participant the payer?
  createdAt: text('created_at').notNull(), // ISO date string
}, (table) => ({
  expenseIdFk: foreignKey({
    columns: [table.expenseId],
    foreignColumns: [expenses.id],
    name: 'expense_splits_expense_id_fk'
  }).onDelete('cascade'),
  participantIdFk: foreignKey({
    columns: [table.participantId],
    foreignColumns: [participants.id],
    name: 'expense_splits_participant_id_fk'
  }).onDelete('cascade'),
  expenseIdIdx: index('expense_splits_expense_id_idx').on(table.expenseId),
  participantIdIdx: index('expense_splits_participant_id_idx').on(table.participantId),
  isPayerIdx: index('expense_splits_is_payer_idx').on(table.isPayer),
  // Unique constraint for expense + participant
  uniqueSplitIdx: index('expense_splits_unique_split_idx').on(table.expenseId, table.participantId),
}));

// Access Codes table (for sharing vacations with groups)
export const accessCodes = sqliteTable('access_codes', {
  id: text('id').primaryKey(),
  vacationId: text('vacation_id').notNull(),
  code: text('code').notNull(), // Splid-style: XXX-XXX-XXX format
  expiresAt: text('expires_at'), // Optional expiration date (ISO string)
  maxUses: integer('max_uses'), // Optional max number of uses
  useCount: integer('use_count').notNull().default(0), // Current usage count
  createdAt: text('created_at').notNull(), // ISO date string
}, (table) => ({
  vacationIdFk: foreignKey({
    columns: [table.vacationId],
    foreignColumns: [vacations.id],
    name: 'access_codes_vacation_id_fk'
  }).onDelete('cascade'),
  vacationIdIdx: index('access_codes_vacation_id_idx').on(table.vacationId),
  codeIdx: index('access_codes_code_idx').on(table.code),
  expiresAtIdx: index('access_codes_expires_at_idx').on(table.expiresAt),
}));

// Relations
export const vacationsRelations = relations(vacations, ({ many }) => ({
  expenses: many(expenses),
  checklists: many(checklists),
  participants: many(participants),
  accessCodes: many(accessCodes),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  vacation: one(vacations, {
    fields: [expenses.vacationId],
    references: [vacations.id],
  }),
  payer: one(participants, {
    fields: [expenses.paidBy],
    references: [participants.id],
  }),
  splits: many(expenseSplits),
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

export const participantsRelations = relations(participants, ({ one, many }) => ({
  vacation: one(vacations, {
    fields: [participants.vacationId],
    references: [vacations.id],
  }),
  paidExpenses: many(expenses),
  splits: many(expenseSplits),
}));

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseSplits.expenseId],
    references: [expenses.id],
  }),
  participant: one(participants, {
    fields: [expenseSplits.participantId],
    references: [participants.id],
  }),
}));

export const accessCodesRelations = relations(accessCodes, ({ one }) => ({
  vacation: one(vacations, {
    fields: [accessCodes.vacationId],
    references: [vacations.id],
  }),
}));