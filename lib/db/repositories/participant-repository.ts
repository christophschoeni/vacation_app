import { eq, and } from 'drizzle-orm';
import { BaseRepository, IRepository } from './base-repository';
import * as schema from '../schema';
import { Participant } from '@/types';

// Input types for repository operations
export interface CreateParticipantInput {
  id?: string;
  vacationId: string;
  name: string;
  color: string;
  deviceId?: string;
  isOwner?: boolean;
}

export interface UpdateParticipantInput {
  name?: string;
  color?: string;
  deviceId?: string;
}

export class ParticipantRepository extends BaseRepository implements IRepository<Participant, CreateParticipantInput, UpdateParticipantInput> {

  // Convert database row to domain object
  private toDomainObject(row: any): Participant {
    return {
      id: row.id,
      vacationId: row.vacationId,
      name: row.name,
      color: row.color,
      deviceId: row.deviceId,
      isOwner: Boolean(row.isOwner),
      createdAt: this.stringToDate(row.createdAt),
    };
  }

  async findById(id: string): Promise<Participant | null> {
    const participant = await this.db
      .select()
      .from(schema.participants)
      .where(eq(schema.participants.id, id))
      .limit(1);

    if (participant.length === 0) return null;

    return this.toDomainObject(participant[0]);
  }

  async findAll(): Promise<Participant[]> {
    const participants = await this.db
      .select()
      .from(schema.participants);

    return participants.map(p => this.toDomainObject(p));
  }

  async create(data: CreateParticipantInput): Promise<Participant> {
    const id = data.id || this.generateId();
    const now = this.getTimestamp();

    const participantData = {
      id,
      vacationId: data.vacationId,
      name: data.name,
      color: data.color,
      deviceId: data.deviceId,
      isOwner: data.isOwner ? 1 : 0,
      createdAt: now,
    };

    await this.db.insert(schema.participants).values(participantData);

    return this.toDomainObject(participantData);
  }

  async update(id: string, data: UpdateParticipantInput): Promise<Participant | null> {
    const updateData: any = { ...data };

    await this.db
      .update(schema.participants)
      .set(updateData)
      .where(eq(schema.participants.id, id));

    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.participants)
      .where(eq(schema.participants.id, id));

    return result.changes > 0;
  }

  // Participant-specific methods

  /**
   * Find all participants for a given vacation
   */
  async findByVacationId(vacationId: string): Promise<Participant[]> {
    const participants = await this.db
      .select()
      .from(schema.participants)
      .where(eq(schema.participants.vacationId, vacationId));

    return participants.map(p => this.toDomainObject(p));
  }

  /**
   * Find the owner of a vacation
   */
  async findOwner(vacationId: string): Promise<Participant | null> {
    const owner = await this.db
      .select()
      .from(schema.participants)
      .where(
        and(
          eq(schema.participants.vacationId, vacationId),
          eq(schema.participants.isOwner, 1)
        )
      )
      .limit(1);

    if (owner.length === 0) return null;

    return this.toDomainObject(owner[0]);
  }

  /**
   * Check if a participant name already exists for a vacation
   */
  async existsByVacationAndName(vacationId: string, name: string): Promise<boolean> {
    const existing = await this.db
      .select()
      .from(schema.participants)
      .where(
        and(
          eq(schema.participants.vacationId, vacationId),
          eq(schema.participants.name, name)
        )
      )
      .limit(1);

    return existing.length > 0;
  }

  /**
   * Add a participant with validation
   */
  async addParticipant(data: CreateParticipantInput): Promise<Participant> {
    // Check if name already exists
    const exists = await this.existsByVacationAndName(data.vacationId, data.name);
    if (exists) {
      throw new Error(`Participant with name "${data.name}" already exists for this vacation`);
    }

    return await this.create(data);
  }

  /**
   * Remove a participant (with validation to prevent removing owner)
   */
  async removeParticipant(id: string): Promise<void> {
    const participant = await this.findById(id);
    if (!participant) {
      throw new Error('Participant not found');
    }

    if (participant.isOwner) {
      throw new Error('Cannot remove vacation owner');
    }

    const deleted = await this.delete(id);
    if (!deleted) {
      throw new Error('Failed to delete participant');
    }
  }

  /**
   * Get participant count for a vacation
   */
  async getCountByVacationId(vacationId: string): Promise<number> {
    const participants = await this.findByVacationId(vacationId);
    return participants.length;
  }
}

// Export singleton instance
export const participantRepository = new ParticipantRepository();
