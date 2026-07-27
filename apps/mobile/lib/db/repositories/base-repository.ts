import * as Crypto from 'expo-crypto';

import { db } from '../database';

// Base repository class with common functionality
export abstract class BaseRepository {
  protected db = db;

  // Globally-unique UUIDv4. Uses expo-crypto (native, works in Hermes without a
  // polyfill) rather than Math.random, so IDs stay collision-safe across
  // devices — a hard requirement for syncing and sharing a vacation.
  protected generateId(): string {
    return Crypto.randomUUID();
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