import { promises as fs } from 'fs';
import path from 'path';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class Cache {
  constructor(private readonly cacheDir: string) {}

  async get<T>(key: string): Promise<T | null> {
    const filePath = this.getFilePath(key);
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const entry = JSON.parse(raw) as CacheEntry<T>;
      if (Date.now() > entry.expiresAt) {
        await fs.unlink(filePath);
        return null;
      }
      return entry.value;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    await fs.mkdir(this.cacheDir, { recursive: true });
    const filePath = this.getFilePath(key);
    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + ttlMs,
    };
    await fs.writeFile(filePath, JSON.stringify(entry, null, 2));
  }

  private getFilePath(key: string): string {
    const safeKey = key.replace(/[^a-zA-Z0-9-_]/g, '_');
    return path.join(this.cacheDir, `${safeKey}.json`);
  }
}
