import { v4 as uuidv4 } from 'uuid';

import { db } from '../database';

// Base repository class with common functionality
export abstract class BaseRepository {
  protected db = db;

  // Globally-unique UUIDv4 instead of Math.random, so IDs stay collision-safe
  // across devices — a hard requirement for syncing and sharing a vacation.
  // uuid uses crypto.getRandomValues, polyfilled app-wide by
  // react-native-get-random-values (imported first in app/_layout.tsx).
  protected generateId(): string {
    return uuidv4();
  }

  // Helper to convert Date objects to ISO strings for storage
  protected dateToString(date: Date): string {
    return date.toISOString();
  }

  // Helper to convert ISO strings back to Date objects
  protected stringToDate(dateString: string): Date {
    return new Date(dateString);
  }

  // Helper to ensure consistent timestamp creation
  protected getTimestamp(): string {
    return this.dateToString(new Date());
  }
}

// Common interfaces for repository operations
export interface IRepository<T, CreateInput, UpdateInput> {
  // Basic CRUD operations
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: CreateInput): Promise<T>;
  update(id: string, data: UpdateInput): Promise<T | null>;
  delete(id: string): Promise<boolean>;

  // Bulk operations
  createMany?(data: CreateInput[]): Promise<T[]>;
  deleteMany?(ids: string[]): Promise<number>;
}