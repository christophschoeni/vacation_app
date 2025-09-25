import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import { BaseRepository, IRepository } from './base-repository';
import * as schema from '../schema';
import { Checklist, ChecklistItem, ChecklistCategory } from '@/types';

// Input types for repository operations
export interface CreateChecklistInput {
  title: string;
  description?: string;
  isTemplate: boolean;
  vacationId?: string;
  templateId?: string;
  category: ChecklistCategory;
  icon: string;
  order?: number;
}

export interface UpdateChecklistInput {
  title?: string;
  description?: string;
  category?: ChecklistCategory;
  icon?: string;
  order?: number;
}

export interface CreateChecklistItemInput {
  checklistId: string;
  text: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  quantity?: number;
  order?: number;
}

export interface UpdateChecklistItemInput {
  text?: string;
  completed?: boolean;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  quantity?: number;
  order?: number;
}

export class ChecklistRepository extends BaseRepository implements IRepository<Checklist, CreateChecklistInput, UpdateChecklistInput> {

  // Convert database row to domain object
  private toDomainObject(row: any, items: ChecklistItem[] = []): Checklist {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      isTemplate: row.isTemplate,
      vacationId: row.vacationId,
      templateId: row.templateId,
      category: row.category as ChecklistCategory,
      icon: row.icon,
      order: row.order || 0,
      items,
      createdAt: this.stringToDate(row.createdAt),
      updatedAt: this.stringToDate(row.updatedAt),
    };
  }

  private itemToDomainObject(row: any): ChecklistItem {
    return {
      id: row.id,
      text: row.text,
      completed: Boolean(row.completed), // Ensure boolean conversion
      notes: row.notes,
      priority: row.priority,
      dueDate: row.dueDate ? this.stringToDate(row.dueDate) : undefined,
      quantity: row.quantity,
      order: row.order,
    };
  }

  async findById(id: string): Promise<Checklist | null> {
    const checklist = await this.db
      .select()
      .from(schema.checklists)
      .where(eq(schema.checklists.id, id))
      .limit(1);

    if (checklist.length === 0) return null;

    const items = await this.db
      .select()
      .from(schema.checklistItems)
      .where(eq(schema.checklistItems.checklistId, id))
      .orderBy(schema.checklistItems.order);

    return this.toDomainObject(
      checklist[0],
      items.map(item => this.itemToDomainObject(item))
    );
  }

  async findAll(): Promise<Checklist[]> {
    const checklists = await this.db
      .select()
      .from(schema.checklists)
      .orderBy(desc(schema.checklists.updatedAt));

    // Load items for all checklists
    const checklistsWithItems = await Promise.all(
      checklists.map(async (checklist) => {
        const items = await this.db
          .select()
          .from(schema.checklistItems)
          .where(eq(schema.checklistItems.checklistId, checklist.id))
          .orderBy(schema.checklistItems.order);

        return this.toDomainObject(
          checklist,
          items.map(item => this.itemToDomainObject(item))
        );
      })
    );

    return checklistsWithItems;
  }

  async findByVacationId(vacationId: string): Promise<Checklist[]> {
    const checklists = await this.db
      .select()
      .from(schema.checklists)
      .where(eq(schema.checklists.vacationId, vacationId))
      .orderBy(desc(schema.checklists.updatedAt));

    console.log(`Repository: found ${checklists.length} checklists for vacation ${vacationId}`);

    const checklistsWithItems = await Promise.all(
      checklists.map(async (checklist) => {
        const items = await this.db
          .select()
          .from(schema.checklistItems)
          .where(eq(schema.checklistItems.checklistId, checklist.id))
          .orderBy(schema.checklistItems.order);

        console.log(`Repository: checklist "${checklist.title}" (${checklist.id}) has ${items.length} items`);

        return this.toDomainObject(
          checklist,
          items.map(item => this.itemToDomainObject(item))
        );
      })
    );

    return checklistsWithItems;
  }

  async findTemplates(): Promise<Checklist[]> {
    const templates = await this.db
      .select()
      .from(schema.checklists)
      .where(and(
        eq(schema.checklists.isTemplate, true),
        isNull(schema.checklists.vacationId)
      ))
      .orderBy(schema.checklists.order, schema.checklists.title);

    const templatesWithItems = await Promise.all(
      templates.map(async (template) => {
        const items = await this.db
          .select()
          .from(schema.checklistItems)
          .where(eq(schema.checklistItems.checklistId, template.id))
          .orderBy(schema.checklistItems.order);

        return this.toDomainObject(
          template,
          items.map(item => this.itemToDomainObject(item))
        );
      })
    );

    return templatesWithItems;
  }

  async create(data: CreateChecklistInput): Promise<Checklist> {
    const id = this.generateId();
    const now = this.getTimestamp();

    // For templates, set order to the next highest value
    let order = data.order || 0;
    if (data.isTemplate && data.order === undefined) {
      const maxOrderResult = await this.db
        .select({ maxOrder: sql<number>`MAX(${schema.checklists.order})` })
        .from(schema.checklists)
        .where(eq(schema.checklists.isTemplate, true));

      order = (maxOrderResult[0]?.maxOrder || -1) + 1;
    }

    const checklistData = {
      id,
      title: data.title,
      description: data.description,
      isTemplate: data.isTemplate,
      vacationId: data.vacationId,
      templateId: data.templateId,
      category: data.category,
      icon: data.icon,
      order,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(schema.checklists).values(checklistData);

    return this.toDomainObject(checklistData, []);
  }

  async update(id: string, data: UpdateChecklistInput): Promise<Checklist> {
    const updatedAt = this.getTimestamp();

    await this.db
      .update(schema.checklists)
      .set({
        ...data,
        updatedAt,
      })
      .where(eq(schema.checklists.id, id));

    const updated = await this.findById(id);
    if (!updated) throw new Error('Checklist not found after update');

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.checklists)
      .where(eq(schema.checklists.id, id));

    return result.changes > 0;
  }

  // Update template order
  async updateTemplateOrder(templateIds: string[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      for (let i = 0; i < templateIds.length; i++) {
        await tx
          .update(schema.checklists)
          .set({
            order: i,
            updatedAt: this.getTimestamp()
          })
          .where(eq(schema.checklists.id, templateIds[i]));
      }
    });
  }

  // Checklist Item operations
  async addItem(data: CreateChecklistItemInput): Promise<ChecklistItem> {
    const id = this.generateId();

    // Get next order if not provided
    let order = data.order;
    if (order === undefined) {
      const maxOrder = await this.db
        .select({ maxOrder: schema.checklistItems.order })
        .from(schema.checklistItems)
        .where(eq(schema.checklistItems.checklistId, data.checklistId))
        .orderBy(desc(schema.checklistItems.order))
        .limit(1);

      order = (maxOrder[0]?.maxOrder || 0) + 1;
    }

    const itemData = {
      id,
      checklistId: data.checklistId,
      text: data.text,
      completed: false,
      notes: data.notes,
      priority: data.priority || 'medium',
      dueDate: data.dueDate ? this.dateToString(data.dueDate) : null,
      quantity: data.quantity,
      order,
    };

    await this.db.insert(schema.checklistItems).values(itemData);

    // Update checklist updatedAt timestamp
    await this.db
      .update(schema.checklists)
      .set({ updatedAt: this.getTimestamp() })
      .where(eq(schema.checklists.id, data.checklistId));

    return this.itemToDomainObject(itemData);
  }

  async updateItem(itemId: string, data: UpdateChecklistItemInput): Promise<ChecklistItem> {
    const updateData: any = { ...data };

    if (data.dueDate) {
      updateData.dueDate = this.dateToString(data.dueDate);
    }

    await this.db
      .update(schema.checklistItems)
      .set(updateData)
      .where(eq(schema.checklistItems.id, itemId));

    // Get checklist ID to update timestamp
    const item = await this.db
      .select({ checklistId: schema.checklistItems.checklistId })
      .from(schema.checklistItems)
      .where(eq(schema.checklistItems.id, itemId))
      .limit(1);

    if (item.length > 0) {
      await this.db
        .update(schema.checklists)
        .set({ updatedAt: this.getTimestamp() })
        .where(eq(schema.checklists.id, item[0].checklistId));
    }

    const updated = await this.db
      .select()
      .from(schema.checklistItems)
      .where(eq(schema.checklistItems.id, itemId))
      .limit(1);

    return this.itemToDomainObject(updated[0]);
  }

  async deleteItem(itemId: string): Promise<boolean> {
    // Get checklist ID before deletion
    const item = await this.db
      .select({ checklistId: schema.checklistItems.checklistId })
      .from(schema.checklistItems)
      .where(eq(schema.checklistItems.id, itemId))
      .limit(1);

    const result = await this.db
      .delete(schema.checklistItems)
      .where(eq(schema.checklistItems.id, itemId));

    // Update checklist timestamp
    if (item.length > 0) {
      await this.db
        .update(schema.checklists)
        .set({ updatedAt: this.getTimestamp() })
        .where(eq(schema.checklists.id, item[0].checklistId));
    }

    return result.changes > 0;
  }

  async toggleItem(itemId: string): Promise<ChecklistItem> {
    // Get current item state
    const currentItem = await this.db
      .select()
      .from(schema.checklistItems)
      .where(eq(schema.checklistItems.id, itemId))
      .limit(1);

    if (currentItem.length === 0) {
      throw new Error('Item not found');
    }

    const newCompleted = !currentItem[0].completed;

    await this.db
      .update(schema.checklistItems)
      .set({ completed: newCompleted })
      .where(eq(schema.checklistItems.id, itemId));

    // Update checklist timestamp
    await this.db
      .update(schema.checklists)
      .set({ updatedAt: this.getTimestamp() })
      .where(eq(schema.checklists.id, currentItem[0].checklistId));

    return this.itemToDomainObject({
      ...currentItem[0],
      completed: newCompleted,
    });
  }

  // Copy template to create a new checklist
  async createFromTemplate(templateId: string, vacationId: string): Promise<Checklist> {
    const template = await this.findById(templateId);
    if (!template || !template.isTemplate) {
      throw new Error('Template not found');
    }

    // Create new checklist from template
    const newChecklist = await this.create({
      title: template.title,
      description: template.description,
      isTemplate: false,
      vacationId,
      templateId,
      category: template.category,
      icon: template.icon,
    });

    // Copy all items from template
    for (const item of template.items) {
      await this.addItem({
        checklistId: newChecklist.id,
        text: item.text,
        notes: item.notes,
        priority: item.priority,
        dueDate: item.dueDate,
        quantity: item.quantity,
        order: item.order,
      });
    }

    return this.findById(newChecklist.id) as Promise<Checklist>;
  }

  // Template-specific utility methods
  async duplicateTemplate(templateId: string): Promise<Checklist> {
    const template = await this.findById(templateId);
    if (!template || !template.isTemplate) {
      throw new Error('Template not found');
    }

    // Create duplicate template
    const duplicateTemplate = await this.create({
      title: `${template.title} (Kopie)`,
      description: template.description,
      isTemplate: true,
      category: template.category,
      icon: template.icon,
    });

    // Copy all items from original template
    for (const item of template.items) {
      await this.addItem({
        checklistId: duplicateTemplate.id,
        text: item.text,
        notes: item.notes,
        priority: item.priority,
        dueDate: item.dueDate,
        quantity: item.quantity,
        order: item.order,
      });
    }

    return this.findById(duplicateTemplate.id) as Promise<Checklist>;
  }

  async getTemplatesByCategory(category: ChecklistCategory): Promise<Checklist[]> {
    const templates = await this.db
      .select()
      .from(schema.checklists)
      .where(and(
        eq(schema.checklists.isTemplate, true),
        eq(schema.checklists.category, category),
        isNull(schema.checklists.vacationId)
      ))
      .orderBy(schema.checklists.title);

    const templatesWithItems = await Promise.all(
      templates.map(async (template) => {
        const items = await this.db
          .select()
          .from(schema.checklistItems)
          .where(eq(schema.checklistItems.checklistId, template.id))
          .orderBy(schema.checklistItems.order);

        return this.toDomainObject(
          template,
          items.map(item => this.itemToDomainObject(item))
        );
      })
    );

    return templatesWithItems;
  }

  async getTemplateStats() {
    const templates = await this.findTemplates();

    const stats = {
      total: templates.length,
      byCategory: {} as Record<ChecklistCategory, number>,
      totalItems: 0,
      averageItems: 0,
    };

    for (const template of templates) {
      stats.byCategory[template.category] = (stats.byCategory[template.category] || 0) + 1;
      stats.totalItems += template.items.length;
    }

    stats.averageItems = stats.total > 0 ? Math.round(stats.totalItems / stats.total) : 0;

    return stats;
  }

  // Bulk operations for template management
  async deleteMultipleTemplates(templateIds: string[]): Promise<number> {
    let deletedCount = 0;

    for (const id of templateIds) {
      const success = await this.delete(id);
      if (success) deletedCount++;
    }

    return deletedCount;
  }

  async updateTemplateItems(templateId: string, items: Array<{ text: string; notes?: string; priority?: 'low' | 'medium' | 'high'; quantity?: number }>): Promise<Checklist> {
    // Delete existing items
    await this.db
      .delete(schema.checklistItems)
      .where(eq(schema.checklistItems.checklistId, templateId));

    // Add new items
    for (let i = 0; i < items.length; i++) {
      await this.addItem({
        checklistId: templateId,
        text: items[i].text,
        notes: items[i].notes,
        priority: items[i].priority || 'medium',
        quantity: items[i].quantity,
        order: i,
      });
    }

    // Update template timestamp
    await this.db
      .update(schema.checklists)
      .set({ updatedAt: this.getTimestamp() })
      .where(eq(schema.checklists.id, templateId));

    return this.findById(templateId) as Promise<Checklist>;
  }
}

export const checklistRepository = new ChecklistRepository();