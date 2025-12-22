import { eq } from 'drizzle-orm';
import { BaseRepository, IRepository } from './base-repository';
import * as schema from '../schema';
import { ExpenseSplit, Participant, Expense, SplitType } from '@/types';

// Input types for repository operations
export interface CreateExpenseSplitInput {
  id?: string;
  expenseId: string;
  participantId: string;
  shareAmount: number;
  sharePercentage?: number;
  isPayer?: boolean;
}

export interface UpdateExpenseSplitInput {
  shareAmount?: number;
  sharePercentage?: number;
  isPayer?: boolean;
}

export class ExpenseSplitRepository extends BaseRepository implements IRepository<ExpenseSplit, CreateExpenseSplitInput, UpdateExpenseSplitInput> {

  // Convert database row to domain object
  private toDomainObject(row: any): ExpenseSplit {
    return {
      id: row.id,
      expenseId: row.expenseId,
      participantId: row.participantId,
      shareAmount: row.shareAmount,
      sharePercentage: row.sharePercentage,
      isPayer: Boolean(row.isPayer),
      createdAt: this.stringToDate(row.createdAt),
    };
  }

  async findById(id: string): Promise<ExpenseSplit | null> {
    const split = await this.db
      .select()
      .from(schema.expenseSplits)
      .where(eq(schema.expenseSplits.id, id))
      .limit(1);

    if (split.length === 0) return null;

    return this.toDomainObject(split[0]);
  }

  async findAll(): Promise<ExpenseSplit[]> {
    const splits = await this.db
      .select()
      .from(schema.expenseSplits);

    return splits.map(s => this.toDomainObject(s));
  }

  async create(data: CreateExpenseSplitInput): Promise<ExpenseSplit> {
    const id = data.id || this.generateId();
    const now = this.getTimestamp();

    const splitData = {
      id,
      expenseId: data.expenseId,
      participantId: data.participantId,
      shareAmount: data.shareAmount,
      sharePercentage: data.sharePercentage,
      isPayer: data.isPayer ? 1 : 0,
      createdAt: now,
    };

    await this.db.insert(schema.expenseSplits).values(splitData);

    return this.toDomainObject(splitData);
  }

  async update(id: string, data: UpdateExpenseSplitInput): Promise<ExpenseSplit | null> {
    const updateData: any = { ...data };

    if (data.isPayer !== undefined) {
      updateData.isPayer = data.isPayer ? 1 : 0;
    }

    await this.db
      .update(schema.expenseSplits)
      .set(updateData)
      .where(eq(schema.expenseSplits.id, id));

    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.expenseSplits)
      .where(eq(schema.expenseSplits.id, id));

    return result.changes > 0;
  }

  // ExpenseSplit-specific methods

  /**
   * Find all splits for a given expense
   */
  async findByExpenseId(expenseId: string): Promise<ExpenseSplit[]> {
    const splits = await this.db
      .select()
      .from(schema.expenseSplits)
      .where(eq(schema.expenseSplits.expenseId, expenseId));

    return splits.map(s => this.toDomainObject(s));
  }

  /**
   * Find all splits for a given participant
   */
  async findByParticipantId(participantId: string): Promise<ExpenseSplit[]> {
    const splits = await this.db
      .select()
      .from(schema.expenseSplits)
      .where(eq(schema.expenseSplits.participantId, participantId));

    return splits.map(s => this.toDomainObject(s));
  }

  /**
   * Delete all splits for an expense
   */
  async deleteByExpenseId(expenseId: string): Promise<number> {
    const result = await this.db
      .delete(schema.expenseSplits)
      .where(eq(schema.expenseSplits.expenseId, expenseId));

    return result.changes;
  }

  /**
   * Calculate splits based on split type and participants
   */
  async calculateSplits(
    expense: Expense,
    participants: Participant[],
    splitType: SplitType,
    customAmounts?: Map<string, number>
  ): Promise<CreateExpenseSplitInput[]> {
    const splits: CreateExpenseSplitInput[] = [];

    switch (splitType) {
      case 'equal': {
        // Divide equally among all participants
        const shareAmount = expense.amount / participants.length;

        participants.forEach(participant => {
          splits.push({
            expenseId: expense.id,
            participantId: participant.id,
            shareAmount,
            sharePercentage: 100 / participants.length,
            isPayer: participant.id === expense.paidBy,
          });
        });
        break;
      }

      case 'custom': {
        // Use custom amounts provided
        if (!customAmounts) {
          throw new Error('Custom amounts required for custom split type');
        }

        participants.forEach(participant => {
          const amount = customAmounts.get(participant.id) || 0;
          splits.push({
            expenseId: expense.id,
            participantId: participant.id,
            shareAmount: amount,
            sharePercentage: (amount / expense.amount) * 100,
            isPayer: participant.id === expense.paidBy,
          });
        });
        break;
      }

      case 'percentage': {
        // Use percentages from customAmounts (where value is percentage)
        if (!customAmounts) {
          throw new Error('Percentages required for percentage split type');
        }

        participants.forEach(participant => {
          const percentage = customAmounts.get(participant.id) || 0;
          const amount = (expense.amount * percentage) / 100;
          splits.push({
            expenseId: expense.id,
            participantId: participant.id,
            shareAmount: amount,
            sharePercentage: percentage,
            isPayer: participant.id === expense.paidBy,
          });
        });
        break;
      }

      case 'shares': {
        // Use shares from customAmounts (where value is number of shares)
        if (!customAmounts) {
          throw new Error('Shares required for shares split type');
        }

        const totalShares = Array.from(customAmounts.values()).reduce((sum, shares) => sum + shares, 0);
        const amountPerShare = expense.amount / totalShares;

        participants.forEach(participant => {
          const shares = customAmounts.get(participant.id) || 0;
          const amount = amountPerShare * shares;
          splits.push({
            expenseId: expense.id,
            participantId: participant.id,
            shareAmount: amount,
            sharePercentage: (shares / totalShares) * 100,
            isPayer: participant.id === expense.paidBy,
          });
        });
        break;
      }
    }

    return splits;
  }

  /**
   * Save multiple splits at once (for new expense or re-split)
   */
  async saveSplits(splits: CreateExpenseSplitInput[]): Promise<ExpenseSplit[]> {
    const created: ExpenseSplit[] = [];

    for (const splitData of splits) {
      const split = await this.create(splitData);
      created.push(split);
    }

    return created;
  }

  /**
   * Update splits for an expense (delete old, create new)
   */
  async updateExpenseSplits(
    expenseId: string,
    splits: CreateExpenseSplitInput[]
  ): Promise<ExpenseSplit[]> {
    // Delete existing splits
    await this.deleteByExpenseId(expenseId);

    // Create new splits
    return await this.saveSplits(splits);
  }
}

// Export singleton instance
export const expenseSplitRepository = new ExpenseSplitRepository();
