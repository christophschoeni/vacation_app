import { eq, desc } from 'drizzle-orm';
import { BaseRepository, IRepository } from './base-repository';
import * as schema from '../schema';
import { Expense, ExpenseCategory } from '@/types';

// Database row interface
interface ExpenseRow {
  id: string;
  vacationId: string;
  amount: number;
  currency: string;
  amountCHF: number;
  category: string;
  description: string;
  date: string;
  imageUrl: string | null;
  createdAt: string;
}

export interface CreateExpenseInput {
  id?: string;              // Optional, for migrating existing records
  vacationId: string;
  amount: number;
  currency: string;
  amountCHF: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
  imageUrl?: string;
  createdAt?: Date;
}

export interface UpdateExpenseInput {
  amount?: number;
  currency?: string;
  amountCHF?: number;
  category?: ExpenseCategory;
  description?: string;
  date?: Date;
  imageUrl?: string;
}

export class ExpenseRepository
  extends BaseRepository
  implements IRepository<Expense, CreateExpenseInput, UpdateExpenseInput>
{
  private toDomainObject(row: ExpenseRow): Expense {
    return {
      id: row.id,
      vacationId: row.vacationId,
      amount: row.amount,
      currency: row.currency,
      amountCHF: row.amountCHF,
      // Stored as free text in SQLite; fall back to 'other' for unknown values.
      category: this.toCategory(row.category),
      description: row.description,
      date: this.stringToDate(row.date),
      imageUrl: row.imageUrl ?? undefined,
      createdAt: this.stringToDate(row.createdAt),
    };
  }

  private toCategory(value: string): ExpenseCategory {
    const known: ExpenseCategory[] = [
      'transport',
      'accommodation',
      'food',
      'entertainment',
      'shopping',
      'other',
    ];
    return (known as string[]).includes(value) ? (value as ExpenseCategory) : 'other';
  }

  async findById(id: string): Promise<Expense | null> {
    const rows = await this.db
      .select()
      .from(schema.expenses)
      .where(eq(schema.expenses.id, id))
      .limit(1);

    return rows.length > 0 ? this.toDomainObject(rows[0]) : null;
  }

  async findAll(): Promise<Expense[]> {
    const rows = await this.db
      .select()
      .from(schema.expenses)
      .orderBy(desc(schema.expenses.date));

    return rows.map(row => this.toDomainObject(row));
  }

  async findByVacation(vacationId: string): Promise<Expense[]> {
    const rows = await this.db
      .select()
      .from(schema.expenses)
      .where(eq(schema.expenses.vacationId, vacationId))
      .orderBy(desc(schema.expenses.date));

    return rows.map(row => this.toDomainObject(row));
  }

  async create(data: CreateExpenseInput): Promise<Expense> {
    const id = data.id || this.generateId();

    const values = {
      id,
      vacationId: data.vacationId,
      amount: data.amount,
      currency: data.currency,
      amountCHF: data.amountCHF,
      category: data.category,
      description: data.description,
      date: this.dateToString(data.date),
      imageUrl: data.imageUrl,
      createdAt: data.createdAt ? this.dateToString(data.createdAt) : this.getTimestamp(),
    };

    await this.db.insert(schema.expenses).values(values);

    const created = await this.findById(id);
    if (!created) throw new Error('Expense not found after create');
    return created;
  }

  async update(id: string, data: UpdateExpenseInput): Promise<Expense | null> {
    const updateData: Record<string, unknown> = {};

    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.amountCHF !== undefined) updateData.amountCHF = data.amountCHF;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.date !== undefined) updateData.date = this.dateToString(data.date);
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

    if (Object.keys(updateData).length > 0) {
      await this.db
        .update(schema.expenses)
        .set(updateData)
        .where(eq(schema.expenses.id, id));
    }

    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    await this.db.delete(schema.expenses).where(eq(schema.expenses.id, id));
    return true;
  }

  async deleteByVacation(vacationId: string): Promise<number> {
    const existing = await this.findByVacation(vacationId);
    if (existing.length === 0) return 0;

    await this.db
      .delete(schema.expenses)
      .where(eq(schema.expenses.vacationId, vacationId));

    return existing.length;
  }

  async getTotalSpent(vacationId: string): Promise<number> {
    const expenses = await this.findByVacation(vacationId);
    return expenses.reduce((total, expense) => total + expense.amountCHF, 0);
  }
}

export const expenseRepository = new ExpenseRepository();
