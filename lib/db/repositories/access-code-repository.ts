import { eq, and, lt, gt } from 'drizzle-orm';
import { BaseRepository, IRepository } from './base-repository';
import * as schema from '../schema';
import { AccessCode } from '@/types';

// Input types for repository operations
export interface CreateAccessCodeInput {
  id?: string;
  vacationId: string;
  code: string;
  expiresAt?: Date;
  maxUses?: number;
}

export interface UpdateAccessCodeInput {
  code?: string;
  expiresAt?: Date;
  maxUses?: number;
  useCount?: number;
}

export interface CodeOptions {
  expiresAt?: Date;
  maxUses?: number;
}

export class AccessCodeRepository extends BaseRepository implements IRepository<AccessCode, CreateAccessCodeInput, UpdateAccessCodeInput> {

  // Convert database row to domain object
  private toDomainObject(row: any): AccessCode {
    return {
      id: row.id,
      vacationId: row.vacationId,
      code: row.code,
      expiresAt: row.expiresAt ? this.stringToDate(row.expiresAt) : undefined,
      maxUses: row.maxUses,
      useCount: row.useCount,
      createdAt: this.stringToDate(row.createdAt),
    };
  }

  async findById(id: string): Promise<AccessCode | null> {
    const accessCode = await this.db
      .select()
      .from(schema.accessCodes)
      .where(eq(schema.accessCodes.id, id))
      .limit(1);

    if (accessCode.length === 0) return null;

    return this.toDomainObject(accessCode[0]);
  }

  async findAll(): Promise<AccessCode[]> {
    const accessCodes = await this.db
      .select()
      .from(schema.accessCodes);

    return accessCodes.map(ac => this.toDomainObject(ac));
  }

  async create(data: CreateAccessCodeInput): Promise<AccessCode> {
    const id = data.id || this.generateId();
    const now = this.getTimestamp();

    const accessCodeData = {
      id,
      vacationId: data.vacationId,
      code: data.code,
      expiresAt: data.expiresAt ? this.dateToString(data.expiresAt) : undefined,
      maxUses: data.maxUses,
      useCount: 0,
      createdAt: now,
    };

    await this.db.insert(schema.accessCodes).values(accessCodeData);

    return this.toDomainObject(accessCodeData);
  }

  async update(id: string, data: UpdateAccessCodeInput): Promise<AccessCode | null> {
    const updateData: any = { ...data };

    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt ? this.dateToString(data.expiresAt) : null;
    }

    await this.db
      .update(schema.accessCodes)
      .set(updateData)
      .where(eq(schema.accessCodes.id, id));

    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.accessCodes)
      .where(eq(schema.accessCodes.id, id));

    return result.changes > 0;
  }

  // AccessCode-specific methods

  /**
   * Generate a Splid-style access code (XXX-XXX-XXX)
   * Uses only characters that are not easily confused: ABCDEFGHJKLMNPQRSTUVWXYZ23456789
   * (excludes 0, O, I, 1)
   */
  private generateCodeString(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 9; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Format as XXX-XXX-XXX
    return code.match(/.{1,3}/g)!.join('-');
  }

  /**
   * Check if a code already exists
   */
  private async codeExists(code: string): Promise<boolean> {
    const existing = await this.db
      .select()
      .from(schema.accessCodes)
      .where(eq(schema.accessCodes.code, code))
      .limit(1);

    return existing.length > 0;
  }

  /**
   * Generate a unique access code for a vacation
   */
  async generateCode(vacationId: string, options?: CodeOptions): Promise<AccessCode> {
    // Generate unique code
    let code = this.generateCodeString();
    let attempts = 0;
    const maxAttempts = 10;

    while (await this.codeExists(code) && attempts < maxAttempts) {
      code = this.generateCodeString();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique access code');
    }

    // Create access code
    return await this.create({
      vacationId,
      code,
      expiresAt: options?.expiresAt,
      maxUses: options?.maxUses,
    });
  }

  /**
   * Validate and retrieve an access code
   */
  async validateCode(code: string): Promise<AccessCode | null> {
    const accessCode = await this.db
      .select()
      .from(schema.accessCodes)
      .where(eq(schema.accessCodes.code, code))
      .limit(1);

    if (accessCode.length === 0) return null;

    const ac = this.toDomainObject(accessCode[0]);

    // Check if expired
    if (ac.expiresAt && ac.expiresAt < new Date()) {
      return null; // Code expired
    }

    // Check if max uses reached
    if (ac.maxUses && ac.useCount >= ac.maxUses) {
      return null; // Max uses reached
    }

    return ac;
  }

  /**
   * Increment the use count for an access code
   */
  async incrementUseCount(code: string): Promise<void> {
    const accessCode = await this.db
      .select()
      .from(schema.accessCodes)
      .where(eq(schema.accessCodes.code, code))
      .limit(1);

    if (accessCode.length === 0) {
      throw new Error('Access code not found');
    }

    const currentCount = accessCode[0].useCount;

    await this.db
      .update(schema.accessCodes)
      .set({ useCount: currentCount + 1 })
      .where(eq(schema.accessCodes.code, code));
  }

  /**
   * Find all access codes for a vacation
   */
  async findByVacationId(vacationId: string): Promise<AccessCode[]> {
    const accessCodes = await this.db
      .select()
      .from(schema.accessCodes)
      .where(eq(schema.accessCodes.vacationId, vacationId));

    return accessCodes.map(ac => this.toDomainObject(ac));
  }

  /**
   * Revoke an access code (delete it)
   */
  async revokeCode(id: string): Promise<void> {
    const deleted = await this.delete(id);
    if (!deleted) {
      throw new Error('Failed to revoke access code');
    }
  }

  /**
   * Revoke all codes for a vacation
   */
  async revokeAllForVacation(vacationId: string): Promise<number> {
    const result = await this.db
      .delete(schema.accessCodes)
      .where(eq(schema.accessCodes.vacationId, vacationId));

    return result.changes;
  }

  /**
   * Get active (non-expired, not max-used) codes for a vacation
   */
  async getActiveCodesForVacation(vacationId: string): Promise<AccessCode[]> {
    const allCodes = await this.findByVacationId(vacationId);
    const now = new Date();

    return allCodes.filter(ac => {
      // Not expired
      if (ac.expiresAt && ac.expiresAt < now) return false;

      // Not max uses reached
      if (ac.maxUses && ac.useCount >= ac.maxUses) return false;

      return true;
    });
  }
}

// Export singleton instance
export const accessCodeRepository = new AccessCodeRepository();
