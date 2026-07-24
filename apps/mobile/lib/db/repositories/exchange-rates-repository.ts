import { eq, and } from 'drizzle-orm';
import { BaseRepository } from './base-repository';
import * as schema from '../schema';

export type RateSource = 'manual' | 'api' | 'fallback';

export interface ExchangeRate {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  source: RateSource;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExchangeRateInput {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  source: RateSource;
}

export interface UpdateExchangeRateInput {
  rate?: number;
  source?: RateSource;
}

// Database row interface
interface ExchangeRateRow {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export class ExchangeRatesRepository extends BaseRepository {

  private toDomainObject(row: ExchangeRateRow): ExchangeRate {
    return {
      id: row.id,
      baseCurrency: row.baseCurrency,
      targetCurrency: row.targetCurrency,
      rate: row.rate,
      source: row.source as RateSource,
      createdAt: this.stringToDate(row.createdAt),
      updatedAt: this.stringToDate(row.updatedAt),
    };
  }

  async findById(id: string): Promise<ExchangeRate | null> {
    const results = await this.db
      .select()
      .from(schema.exchangeRates)
      .where(eq(schema.exchangeRates.id, id))
      .limit(1);

    if (results.length === 0) return null;

    return this.toDomainObject(results[0]);
  }

  async findAll(): Promise<ExchangeRate[]> {
    const results = await this.db
      .select()
      .from(schema.exchangeRates);

    return results.map((row) => this.toDomainObject(row));
  }

  async findByBaseCurrency(baseCurrency: string): Promise<ExchangeRate[]> {
    const results = await this.db
      .select()
      .from(schema.exchangeRates)
      .where(eq(schema.exchangeRates.baseCurrency, baseCurrency));

    return results.map((row) => this.toDomainObject(row));
  }

  async findByPair(baseCurrency: string, targetCurrency: string): Promise<ExchangeRate | null> {
    const results = await this.db
      .select()
      .from(schema.exchangeRates)
      .where(
        and(
          eq(schema.exchangeRates.baseCurrency, baseCurrency),
          eq(schema.exchangeRates.targetCurrency, targetCurrency)
        )
      )
      .limit(1);

    if (results.length === 0) return null;

    return this.toDomainObject(results[0]);
  }

  async findBySource(source: RateSource): Promise<ExchangeRate[]> {
    const results = await this.db
      .select()
      .from(schema.exchangeRates)
      .where(eq(schema.exchangeRates.source, source));

    return results.map((row) => this.toDomainObject(row));
  }

  async create(data: CreateExchangeRateInput): Promise<ExchangeRate> {
    const now = this.getTimestamp();
    const id = this.generateId();

    // Check if rate already exists for this pair
    const existing = await this.findByPair(data.baseCurrency, data.targetCurrency);
    if (existing) {
      // Update existing rate instead
      return await this.update(existing.id, { rate: data.rate, source: data.source }) as ExchangeRate;
    }

    const newRate = {
      id,
      baseCurrency: data.baseCurrency,
      targetCurrency: data.targetCurrency,
      rate: data.rate,
      source: data.source,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(schema.exchangeRates).values(newRate);

    return this.toDomainObject(newRate);
  }

  async update(id: string, data: UpdateExchangeRateInput): Promise<ExchangeRate | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const now = this.getTimestamp();

    const updateData: any = {
      updatedAt: now,
    };

    if (data.rate !== undefined) {
      updateData.rate = data.rate;
    }

    if (data.source !== undefined) {
      updateData.source = data.source;
    }

    await this.db
      .update(schema.exchangeRates)
      .set(updateData)
      .where(eq(schema.exchangeRates.id, id));

    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    await this.db
      .delete(schema.exchangeRates)
      .where(eq(schema.exchangeRates.id, id));

    return true;
  }

  async deleteByPair(baseCurrency: string, targetCurrency: string): Promise<boolean> {
    await this.db
      .delete(schema.exchangeRates)
      .where(
        and(
          eq(schema.exchangeRates.baseCurrency, baseCurrency),
          eq(schema.exchangeRates.targetCurrency, targetCurrency)
        )
      );

    return true;
  }

  async deleteBySource(source: RateSource): Promise<number> {
    const rates = await this.findBySource(source);

    await this.db
      .delete(schema.exchangeRates)
      .where(eq(schema.exchangeRates.source, source));

    return rates.length;
  }

  async clearAll(): Promise<void> {
    await this.db.delete(schema.exchangeRates);
  }

  // Upsert operation: insert or update if exists
  async upsert(data: CreateExchangeRateInput): Promise<ExchangeRate> {
    const existing = await this.findByPair(data.baseCurrency, data.targetCurrency);

    if (existing) {
      return await this.update(existing.id, { rate: data.rate, source: data.source }) as ExchangeRate;
    } else {
      return await this.create(data);
    }
  }

  // Bulk upsert for multiple rates
  async upsertMany(rates: CreateExchangeRateInput[]): Promise<ExchangeRate[]> {
    const results: ExchangeRate[] = [];

    for (const rate of rates) {
      const result = await this.upsert(rate);
      results.push(result);
    }

    return results;
  }
}

export const exchangeRatesRepository = new ExchangeRatesRepository();
