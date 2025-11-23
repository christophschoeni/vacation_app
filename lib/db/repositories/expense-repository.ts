import { eq, desc, and } from 'drizzle-orm';
import { BaseRepository, IRepository } from './base-repository';
import * as schema from '../schema';
import { Expense } from '@/types';

// Input types for repository operations
export interface CreateExpenseInput {
  id?: string;              // Optional ID for specific expense creation
  vacationId: string;
  amount: number;
  currency: string;
  amountCHF: number;
  category: string;
  description: string;
  date: Date;
  imageUrl?: string;
}

export interface UpdateExpenseInput {
  vacationId?: string;
  amount?: number;
  currency?: string;
  amountCHF?: number;
  category?: string;
  description?: string;
  date?: Date;
  imageUrl?: string;
}

export class ExpenseRepository extends BaseRepository implements IRepository<Expense, CreateExpenseInput, UpdateExpenseInput> {

  // Convert database row to domain object
  private toDomainObject(row: any): Expense {
    return {
      id: row.id,
      vacationId: row.vacationId,
      amount: row.amount,
      currency: row.currency,
      amountCHF: row.amountCHF,
      category: row.category,
      description: row.description,
      date: this.stringToDate(row.date),
      imageUrl: row.imageUrl,
      createdAt: this.stringToDate(row.createdAt),
    };
  }

  async findById(id: string): Promise<Expense | null> {
    const expense = await this.db
      .select()
      .from(schema.expenses)
      .where(eq(schema.expenses.id, id))
      .limit(1);

    if (expense.length === 0) return null;

    return this.toDomainObject(expense[0]);
  }

  async findAll(): Promise<Expense[]> {
    const expenses = await this.db
      .select()
      .from(schema.expenses)
      .orderBy(desc(schema.expenses.date));

    return expenses.map(expense => this.toDomainObject(expense));
  }

  async create(data: CreateExpenseInput): Promise<Expense> {
    const id = data.id || this.generateId();
    const now = this.getTimestamp();

    const expenseData = {
      id,
      vacationId: data.vacationId,
      amount: data.amount,
      currency: data.currency,
      amountCHF: data.amountCHF,
      category: data.category,
      description: data.description,
      date: this.dateToString(data.date),
      imageUrl: data.imageUrl,
      createdAt: now,
    };

    await this.db.insert(schema.expenses).values(expenseData);

    return this.toDomainObject(expenseData);
  }

  async update(id: string, data: UpdateExpenseInput): Promise<Expense> {
    const updateData: any = { ...data };

    // Convert date to string if provided
    if (data.date) {
      updateData.date = this.dateToString(data.date);
    }

    await this.db
      .update(schema.expenses)
      .set(updateData)
      .where(eq(schema.expenses.id, id));

    const updated = await this.findById(id);
    if (!updated) throw new Error('Expense not found after update');

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.expenses)
      .where(eq(schema.expenses.id, id));

    return result.changes > 0;
  }

  // Additional expense-specific methods

  /**
   * Find all expenses for a specific vacation
   * @param vacationId The vacation ID to filter by
   * @returns Array of expenses for the vacation, ordered by date descending
   */
  async findByVacationId(vacationId: string): Promise<Expense[]> {
    const expenses = await this.db
      .select()
      .from(schema.expenses)
      .where(eq(schema.expenses.vacationId, vacationId))
      .orderBy(desc(schema.expenses.date));

    return expenses.map(expense => this.toDomainObject(expense));
  }

  /**
   * Find expenses by category
   * @param category The expense category to filter by
   * @returns Array of expenses in the category
   */
  async findByCategory(category: string): Promise<Expense[]> {
    const expenses = await this.db
      .select()
      .from(schema.expenses)
      .where(eq(schema.expenses.category, category))
      .orderBy(desc(schema.expenses.date));

    return expenses.map(expense => this.toDomainObject(expense));
  }

  /**
   * Find expenses by vacation and category
   * @param vacationId The vacation ID
   * @param category The expense category
   * @returns Array of expenses matching both criteria
   */
  async findByVacationAndCategory(vacationId: string, category: string): Promise<Expense[]> {
    const expenses = await this.db
      .select()
      .from(schema.expenses)
      .where(
        and(
          eq(schema.expenses.vacationId, vacationId),
          eq(schema.expenses.category, category)
        )
      )
      .orderBy(desc(schema.expenses.date));

    return expenses.map(expense => this.toDomainObject(expense));
  }

  /**
   * Find expenses within a date range
   * @param startDate Start date of the range
   * @param endDate End date of the range
   * @returns Array of expenses within the date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    const expenses = await this.db
      .select()
      .from(schema.expenses)
      .orderBy(desc(schema.expenses.date));

    // Filter by date range in JavaScript since SQLite date comparison needs careful handling
    return expenses
      .map(expense => this.toDomainObject(expense))
      .filter(expense => expense.date >= startDate && expense.date <= endDate);
  }

  /**
   * Get total expense amount for a vacation in CHF
   * @param vacationId The vacation ID
   * @returns Total amount in CHF
   */
  async getTotalByVacation(vacationId: string): Promise<number> {
    const expenses = await this.findByVacationId(vacationId);
    return expenses.reduce((total, expense) => total + expense.amountCHF, 0);
  }

  /**
   * Get total expense amount by category for a vacation in CHF
   * @param vacationId The vacation ID
   * @param category The expense category
   * @returns Total amount in CHF for the category
   */
  async getTotalByVacationAndCategory(vacationId: string, category: string): Promise<number> {
    const expenses = await this.findByVacationAndCategory(vacationId, category);
    return expenses.reduce((total, expense) => total + expense.amountCHF, 0);
  }

  /**
   * Delete all expenses for a specific vacation
   * This should be called automatically via CASCADE DELETE when a vacation is deleted
   * But can also be called manually if needed
   * @param vacationId The vacation ID
   * @returns Number of expenses deleted
   */
  async deleteByVacationId(vacationId: string): Promise<number> {
    const result = await this.db
      .delete(schema.expenses)
      .where(eq(schema.expenses.vacationId, vacationId));

    return result.changes;
  }

  /**
   * Count expenses for a vacation
   * @param vacationId The vacation ID
   * @returns Number of expenses
   */
  async countByVacation(vacationId: string): Promise<number> {
    const expenses = await this.findByVacationId(vacationId);
    return expenses.length;
  }
}

export const expenseRepository = new ExpenseRepository();
