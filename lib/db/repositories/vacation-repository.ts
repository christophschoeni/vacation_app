import { eq, desc } from 'drizzle-orm';
import { BaseRepository, IRepository } from './base-repository';
import * as schema from '../schema';
import { Vacation } from '@/types';

// Input types for repository operations
export interface CreateVacationInput {
  id?: string;              // Optional ID for specific vacation creation
  destination: string;
  country: string;
  hotel: string;
  startDate: Date;
  endDate: Date;
  budget?: number;
  imageUrl?: string;
}

export interface UpdateVacationInput {
  destination?: string;
  country?: string;
  hotel?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  imageUrl?: string;
}

export class VacationRepository extends BaseRepository implements IRepository<Vacation, CreateVacationInput, UpdateVacationInput> {

  // Convert database row to domain object
  private toDomainObject(row: any): Vacation {
    return {
      id: row.id,
      destination: row.destination,
      country: row.country,
      hotel: row.hotel,
      startDate: this.stringToDate(row.startDate),
      endDate: this.stringToDate(row.endDate),
      budget: row.budget,
      currency: row.currency || 'CHF',
      expenses: [], // Will be loaded separately if needed
      checklists: [], // Will be loaded separately if needed
      imageUrl: row.imageUrl,
      createdAt: this.stringToDate(row.createdAt),
      updatedAt: this.stringToDate(row.updatedAt),
    };
  }

  async findById(id: string): Promise<Vacation | null> {
    const vacation = await this.db
      .select()
      .from(schema.vacations)
      .where(eq(schema.vacations.id, id))
      .limit(1);

    if (vacation.length === 0) return null;

    return this.toDomainObject(vacation[0]);
  }

  async findAll(): Promise<Vacation[]> {
    const vacations = await this.db
      .select()
      .from(schema.vacations)
      .orderBy(desc(schema.vacations.startDate));

    return vacations.map(vacation => this.toDomainObject(vacation));
  }

  async create(data: CreateVacationInput): Promise<Vacation> {
    const id = data.id || this.generateId(); // Use provided ID or generate new one
    const now = this.getTimestamp();

    const vacationData = {
      id,
      destination: data.destination,
      country: data.country,
      hotel: data.hotel,
      startDate: this.dateToString(data.startDate),
      endDate: this.dateToString(data.endDate),
      budget: data.budget,
      currency: 'CHF', // Default currency
      imageUrl: data.imageUrl,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(schema.vacations).values(vacationData);

    return this.toDomainObject(vacationData);
  }

  async update(id: string, data: UpdateVacationInput): Promise<Vacation> {
    const updatedAt = this.getTimestamp();
    const updateData: any = { ...data, updatedAt };

    // Convert dates to strings
    if (data.startDate) {
      updateData.startDate = this.dateToString(data.startDate);
    }
    if (data.endDate) {
      updateData.endDate = this.dateToString(data.endDate);
    }

    await this.db
      .update(schema.vacations)
      .set(updateData)
      .where(eq(schema.vacations.id, id));

    const updated = await this.findById(id);
    if (!updated) throw new Error('Vacation not found after update');

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.vacations)
      .where(eq(schema.vacations.id, id));

    return result.changes > 0;
  }

  // Additional vacation-specific methods
  async findByDateRange(startDate: Date, endDate: Date): Promise<Vacation[]> {
    const vacations = await this.db
      .select()
      .from(schema.vacations)
      .where(
        // Find vacations that overlap with the given date range
        // (vacation.startDate <= endDate AND vacation.endDate >= startDate)
        eq(schema.vacations.startDate, this.dateToString(startDate))
      )
      .orderBy(desc(schema.vacations.startDate));

    return vacations.map(vacation => this.toDomainObject(vacation));
  }

  async findByDestination(destination: string): Promise<Vacation[]> {
    const vacations = await this.db
      .select()
      .from(schema.vacations)
      .where(eq(schema.vacations.destination, destination))
      .orderBy(desc(schema.vacations.startDate));

    return vacations.map(vacation => this.toDomainObject(vacation));
  }

  async findUpcoming(): Promise<Vacation[]> {
    const today = this.dateToString(new Date());

    const vacations = await this.db
      .select()
      .from(schema.vacations)
      .orderBy(schema.vacations.startDate);

    // Filter upcoming vacations in JavaScript since SQLite date comparison is tricky
    return vacations
      .map(vacation => this.toDomainObject(vacation))
      .filter(vacation => vacation.startDate >= new Date())
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  async findCurrent(): Promise<Vacation[]> {
    const today = new Date();

    const vacations = await this.db
      .select()
      .from(schema.vacations)
      .orderBy(desc(schema.vacations.startDate));

    // Filter current vacations in JavaScript
    return vacations
      .map(vacation => this.toDomainObject(vacation))
      .filter(vacation => vacation.startDate <= today && vacation.endDate >= today);
  }

  async getTotalBudget(): Promise<number> {
    const vacations = await this.findAll();
    return vacations.reduce((total, vacation) => total + (vacation.budget || 0), 0);
  }
}

export const vacationRepository = new VacationRepository();