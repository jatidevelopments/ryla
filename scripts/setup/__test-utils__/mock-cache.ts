export class MockCache {
  private cache: Map<string, { data: unknown; expires: number }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  async set<T>(key: string, data: T, ttlMs: number): Promise<void> {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlMs,
    });
  }

  clear(): void {
    this.cache.clear();
  }
}
