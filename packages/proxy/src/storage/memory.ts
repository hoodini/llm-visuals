import type { RequestRecord } from '@llm-visuals/shared';

export class MemoryStorage {
  private records: RequestRecord[] = [];
  private index = new Map<string, RequestRecord>();
  private maxSize: number;

  constructor(maxSize = 10_000) {
    this.maxSize = maxSize;
  }

  save(record: RequestRecord) {
    const existing = this.index.get(record.id);
    if (existing) {
      // Update in place
      Object.assign(existing, record);
      return;
    }

    if (this.records.length >= this.maxSize) {
      const evicted = this.records.shift()!;
      this.index.delete(evicted.id);
    }

    this.records.push(record);
    this.index.set(record.id, record);
  }

  get(id: string): RequestRecord | undefined {
    return this.index.get(id);
  }

  getAll(limit = 200): RequestRecord[] {
    return this.records.slice(-limit).reverse();
  }

  getRecent(ms: number): RequestRecord[] {
    const cutoff = Date.now() - ms;
    return this.records.filter((r) => r.startedAt >= cutoff);
  }

  getAllRecords(): RequestRecord[] {
    return this.records;
  }

  clear() {
    this.records = [];
    this.index.clear();
  }
}
