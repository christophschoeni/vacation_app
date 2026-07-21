import { eq, and } from 'drizzle-orm';
import { BaseRepository } from './base-repository';
import * as schema from '../schema';

export interface CategoryLimit {
  id: string;
  vacationId: string;
  category: string;
  /** Cap in the vacation's budgetCurrency. */
  limitAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryLimitRow {
  id: string;
  vacationId: string;
  category: string;
  limitAmount: number;
  createdAt: string;
  updatedAt: string;
}

export class CategoryLimitRepository extends BaseRepository {
  private toDomainObject(row: CategoryLimitRow): CategoryLimit {
    return {
      id: row.id,
      vacationId: row.vacationId,
      category: row.category,
      limitAmount: row.limitAmount,
      createdAt: this.stringToDate(row.createdAt),
      updatedAt: this.stringToDate(row.updatedAt),
    };
  }

  async findByVacation(vacationId: string): Promise<CategoryLimit[]> {
    const rows = await this.db
      .select()
      .from(schema.categoryLimits)
      .where(eq(schema.categoryLimits.vacationId, vacationId));

    return rows.map((row) => this.toDomainObject(row));
  }

  /**
   * Create or replace the limit for one category.
   *
   * Upsert rather than insert: the unique index on (vacation, category) means a
   * plain insert would throw the second time a user edits the same limit.
   */
  async setLimit(
    vacationId: string,
    category: string,
    limitAmount: number
  ): Promise<CategoryLimit> {
    const now = this.getTimestamp();

    const existing = await this.db
      .select()
      .from(schema.categoryLimits)
      .where(
        and(
          eq(schema.categoryLimits.vacationId, vacationId),
          eq(schema.categoryLimits.category, category)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await this.db
        .update(schema.categoryLimits)
        .set({ limitAmount, updatedAt: now })
        .where(eq(schema.categoryLimits.id, existing[0].id));

      return this.toDomainObject({ ...existing[0], limitAmount, updatedAt: now });
    }

    const row: CategoryLimitRow = {
      id: this.generateId(),
      vacationId,
      category,
      limitAmount,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(schema.categoryLimits).values(row);
    return this.toDomainObject(row);
  }

  /** Remove a category's cap, returning it to "no limit". */
  async clearLimit(vacationId: string, category: string): Promise<void> {
    await this.db
      .delete(schema.categoryLimits)
      .where(
        and(
          eq(schema.categoryLimits.vacationId, vacationId),
          eq(schema.categoryLimits.category, category)
        )
      );
  }
}

export const categoryLimitRepository = new CategoryLimitRepository();
