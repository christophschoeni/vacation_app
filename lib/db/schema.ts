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
  currency: text('currency').notNull().default('CHF'),
  imageUrl: text('image_url'),
  createdAt: text('created_at').notNull(), // ISO date string
  updatedAt: text('updated_at').notNull(), // ISO date string
}, (table) => ({
  startDateIdx: index('vacations_start_date_idx').on(table.startDate),
  countryIdx: index('vacations_country_idx').on(table.country),
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