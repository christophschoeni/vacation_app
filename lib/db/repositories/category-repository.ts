import { eq } from 'drizzle-orm';
import { BaseRepository, IRepository } from './base-repository';
import * as schema from '../schema';
import { Category } from '@/types';

// Input types for repository operations
export interface CreateCategoryInput {
  id?: string;
  name: string;
  icon: string;
  isDefault?: boolean;
  type: 'expense' | 'checklist';
}

export interface UpdateCategoryInput {
  name?: string;
  icon?: string;
  isDefault?: boolean;
  type?: 'expense' | 'checklist';
}

export class CategoryRepository extends BaseRepository implements IRepository<Category, CreateCategoryInput, UpdateCategoryInput> {

  private toDomainObject(row: any): Category {
    return {
      id: row.id,
      name: row.name,
      icon: row.icon,
      isDefault: Boolean(row.isDefault),
      type: row.type,
    };
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, id))
      .limit(1);

    if (category.length === 0) return null;

    return this.toDomainObject(category[0]);
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.db
      .select()
      .from(schema.categories)
      .orderBy(schema.categories.name);

    return categories.map(category => this.toDomainObject(category));
  }

  async findDefaults(): Promise<Category[]> {
    const categories = await this.db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.isDefault, true))
      .orderBy(schema.categories.name);

    return categories.map(category => this.toDomainObject(category));
  }

  async findCustom(): Promise<Category[]> {
    const categories = await this.db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.isDefault, false))
      .orderBy(schema.categories.name);

    return categories.map(category => this.toDomainObject(category));
  }

  async create(data: CreateCategoryInput): Promise<Category> {
    const id = data.id || this.generateId();
    const now = this.getTimestamp();

    const categoryData = {
      id,
      name: data.name,
      icon: data.icon,
      isDefault: data.isDefault || false,
      type: data.type,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(schema.categories).values(categoryData);

    return this.toDomainObject(categoryData);
  }

  async update(id: string, data: UpdateCategoryInput): Promise<Category | null> {
    const now = this.getTimestamp();

    const updateData = {
      ...data,
      updatedAt: now,
    };

    await this.db
      .update(schema.categories)
      .set(updateData)
      .where(eq(schema.categories.id, id));

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.categories)
      .where(eq(schema.categories.id, id));

    return true;
  }

  // Check if default categories are already installed
  async areDefaultCategoriesInstalled(): Promise<boolean> {
    const defaultCategories = await this.findDefaults();
    return defaultCategories.length > 0;
  }

  // Install default categories if not already present
  async installDefaultCategories(categories: CreateCategoryInput[]): Promise<Category[]> {
    console.log('📦 Installing default categories...');

    const installedCategories: Category[] = [];

    for (const categoryData of categories) {
      try {
        // Check if category with this ID already exists
        let category: Category | null = null;

        if (categoryData.id) {
          category = await this.findById(categoryData.id);
        }

        if (category) {
          console.log(`ℹ️ Category ${categoryData.name} already exists, skipping`);
          installedCategories.push(category);
        } else {
          category = await this.create({
            ...categoryData,
            isDefault: true,
          });
          installedCategories.push(category);
          console.log(`✅ Installed category: ${category.name}`);
        }
      } catch (error) {
        console.error(`❌ Failed to install category ${categoryData.name}:`, error);
      }
    }

    console.log(`📦 Installed ${installedCategories.length} default categories`);
    return installedCategories;
  }
}

export const categoryRepository = new CategoryRepository();