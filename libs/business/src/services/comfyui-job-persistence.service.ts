/**
 * ComfyUI Job Persistence Service
 *
 * Redis-based job state persistence for ComfyUI workflows.
 * Enables job recovery after server restarts.
 *
 * @see EP-040: Redis Job Persistence and Recovery
 * @see IN-007: ComfyUI Infrastructure Improvements
 */

import Redis from 'ioredis';
import type { JobState } from '../interfaces/comfyui-job-state.interface';

export interface ComfyUIJobPersistenceConfig {
  /** Redis client instance */
  redisClient: Redis;
  /** Key prefix for job state keys (default: 'comfyui:job:') */
  keyPrefix?: string;
  /** TTL for job state in seconds (default: 7200 = 2 hours) */
  ttl?: number;
  /** Max age for job recovery in seconds (default: 600 = 10 minutes) */
  maxRecoveryAge?: number;
}

export class ComfyUIJobPersistenceService {
  private redisClient: Redis;
  private keyPrefix: string;
  private ttl: number;
  private maxRecoveryAge: number;

  constructor(config: ComfyUIJobPersistenceConfig) {
    this.redisClient = config.redisClient;
    this.keyPrefix = config.keyPrefix || 'comfyui:job:';
    this.ttl = config.ttl || 7200; // 2 hours
    this.maxRecoveryAge = config.maxRecoveryAge || 600; // 10 minutes
  }

  /**
   * Get Redis key for a job
   */
  private getJobKey(promptId: string): string {
    return `${this.keyPrefix}${promptId}`;
  }

  /**
   * Save job state to Redis
   */
  async saveJobState(jobState: JobState): Promise<void> {
    const key = this.getJobKey(jobState.promptId);
    const value = JSON.stringify(jobState);

    await this.redisClient.set(key, value, 'EX', this.ttl);
    console.log(`Saved job state for ${jobState.promptId} to Redis`);
  }

  /**
   * Update job state in Redis
   */
  async updateJobState(
    promptId: string,
    updates: Partial<JobState>
  ): Promise<void> {
    const existing = await this.getJobState(promptId);
    if (!existing) {
      console.warn(`Job state not found for ${promptId}, cannot update`);
      return;
    }

    const updated: JobState = {
      ...existing,
      ...updates,
      promptId, // Ensure promptId doesn't change
    };

    await this.saveJobState(updated);
  }

  /**
   * Get job state from Redis
   */
  async getJobState(promptId: string): Promise<JobState | null> {
    const key = this.getJobKey(promptId);
    const value = await this.redisClient.get(key);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as JobState;
    } catch (error) {
      console.error(`Failed to parse job state for ${promptId}: ${error}`);
      return null;
    }
  }

  /**
   * Delete job state from Redis
   */
  async deleteJobState(promptId: string): Promise<void> {
    const key = this.getJobKey(promptId);
    await this.redisClient.del(key);
    console.log(`Deleted job state for ${promptId} from Redis`);
  }

  /**
   * Recover all active jobs from Redis
   * Filters out jobs older than maxRecoveryAge
   */
  async recoverActiveJobs(): Promise<JobState[]> {
    const pattern = `${this.keyPrefix}*`;
    const keys = await this.redisClient.keys(pattern);
    const now = Date.now();
    const recovered: JobState[] = [];

    for (const key of keys) {
      try {
        const value = await this.redisClient.get(key);
        if (!value) continue;

        const jobState = JSON.parse(value) as JobState;
        const age = (now - jobState.startedAt) / 1000; // age in seconds

        // Skip jobs older than maxRecoveryAge
        if (age > this.maxRecoveryAge) {
          console.log(
            `Skipping job ${jobState.promptId} (age: ${Math.round(age)}s, max: ${this.maxRecoveryAge}s)`
          );
          continue;
        }

        // Only recover jobs that are still processing
        if (jobState.status === 'processing' || jobState.status === 'queued') {
          recovered.push(jobState);
          console.log(`Recovered job ${jobState.promptId} (age: ${Math.round(age)}s)`);
        }
      } catch (error) {
        console.error(`Failed to recover job from key ${key}: ${error}`);
      }
    }

    return recovered;
  }

  /**
   * Clean up stale jobs (older than TTL)
   * This is a maintenance operation that can be called periodically
   */
  async cleanupStaleJobs(): Promise<number> {
    const pattern = `${this.keyPrefix}*`;
    const keys = await this.redisClient.keys(pattern);
    const now = Date.now();
    let cleaned = 0;

    for (const key of keys) {
      try {
        const value = await this.redisClient.get(key);
        if (!value) {
          // Key expired or deleted, skip
          continue;
        }

        const jobState = JSON.parse(value) as JobState;
        const age = (now - jobState.startedAt) / 1000; // age in seconds

        // Delete jobs older than TTL
        if (age > this.ttl) {
          await this.redisClient.del(key);
          cleaned++;
          console.log(`Cleaned up stale job ${jobState.promptId} (age: ${Math.round(age)}s)`);
        }
      } catch (error) {
        console.error(`Failed to check job from key ${key}: ${error}`);
      }
    }

    return cleaned;
  }

  /**
   * Check if Redis is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.redisClient.ping();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create ComfyUI Job Persistence Service from environment variables
 * Expects Redis to be configured via REDIS_URL or REDIS_HOST/REDIS_PORT
 */
export function createComfyUIJobPersistenceService(): ComfyUIJobPersistenceService {
  let redisClient: Redis;

  // Parse REDIS_URL if provided
  const redisUrl = process.env['REDIS_URL'];
  if (redisUrl) {
    try {
      const url = new URL(redisUrl);
      const port = Number(url.port) || 6379;
      const host = url.hostname;

      let password = '';
      if (url.username && url.password) {
        password = url.password;
      } else if (url.password) {
        password = url.password;
      } else if (url.username && !url.password) {
        password = url.username;
      }

      const useTls = redisUrl.startsWith('rediss://') ||
                     host.includes('upstash.io');

      if (useTls) {
        redisClient = new Redis({
          port,
          host,
          password: password || undefined,
          tls: {
            rejectUnauthorized: false,
          },
          lazyConnect: true,
        });
      } else {
        redisClient = new Redis({
          port,
          host,
          password: password || undefined,
          lazyConnect: true,
        });
      }
    } catch (error) {
      console.warn('Failed to parse REDIS_URL, using individual variables:', error);
      redisClient = new Redis({
        port: Number(process.env['REDIS_PORT']) || 6379,
        host: process.env['REDIS_HOST'] || 'localhost',
        password: process.env['REDIS_PASSWORD'] || undefined,
        lazyConnect: true,
      });
    }
  } else {
    // Use individual variables
    redisClient = new Redis({
      port: Number(process.env['REDIS_PORT']) || 6379,
      host: process.env['REDIS_HOST'] || 'localhost',
      password: process.env['REDIS_PASSWORD'] || undefined,
      lazyConnect: true,
    });
  }

  return new ComfyUIJobPersistenceService({ redisClient });
}
