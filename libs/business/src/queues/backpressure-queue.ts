/**
 * Backpressure Queue
 * 
 * Prevents system overload by limiting concurrent operations and queuing excess requests.
 * Inspired by Elixir's Broadway pattern for data processing.
 * 
 * Features:
 * - Configurable concurrency limits
 * - Queue capacity limits
 * - Priority levels (higher priority = processed first)
 * - Queue position tracking
 * - Graceful rejection with retry-after
 */

import { Result, success, failure } from '@ryla/shared';

export type Priority = 'high' | 'normal' | 'low';

const PRIORITY_VALUES: Record<Priority, number> = {
  high: 3,
  normal: 2,
  low: 1,
};

export interface QueueConfig {
  /** Maximum concurrent operations */
  maxConcurrent: number;
  /** Maximum queue depth before rejection */
  maxQueueSize: number;
  /** Queue timeout in ms */
  queueTimeout: number;
  /** Default priority for jobs */
  defaultPriority: Priority;
}

export interface QueuedJob<T> {
  id: string;
  priority: Priority;
  operation: () => Promise<T>;
  enqueuedAt: Date;
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
  timeoutId?: NodeJS.Timeout;
}

export interface QueueStats {
  currentConcurrent: number;
  queueDepth: number;
  maxConcurrent: number;
  maxQueueSize: number;
  totalProcessed: number;
  totalRejected: number;
  totalTimedOut: number;
  averageWaitTimeMs: number;
}

export interface QueuePosition {
  position: number;
  estimatedWaitMs: number;
}

export class QueueFullError extends Error {
  constructor(
    message: string,
    public readonly retryAfterMs: number,
    public readonly queueDepth: number,
  ) {
    super(message);
    this.name = 'QueueFullError';
  }
}

export class QueueTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueueTimeoutError';
  }
}

const DEFAULT_CONFIG: QueueConfig = {
  maxConcurrent: 10,
  maxQueueSize: 100,
  queueTimeout: 60000, // 1 minute
  defaultPriority: 'normal',
};

export class BackpressureQueue {
  private config: QueueConfig;
  private currentConcurrent: number = 0;
  private queue: QueuedJob<unknown>[] = [];
  private totalProcessed: number = 0;
  private totalRejected: number = 0;
  private totalTimedOut: number = 0;
  private waitTimes: number[] = [];

  constructor(
    private readonly name: string,
    config: Partial<QueueConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Enqueue a job for processing
   * Returns immediately if capacity available, otherwise waits in queue
   */
  async enqueue<T>(
    id: string,
    operation: () => Promise<T>,
    priority: Priority = this.config.defaultPriority
  ): Promise<Result<T, Error>> {
    // Check if we can process immediately
    if (this.currentConcurrent < this.config.maxConcurrent) {
      return this.processImmediately(operation);
    }

    // Check if queue is full
    if (this.queue.length >= this.config.maxQueueSize) {
      this.totalRejected++;
      const retryAfter = this.estimateWaitTime();
      return failure(new QueueFullError(
        `Queue "${this.name}" is full (${this.queue.length}/${this.config.maxQueueSize})`,
        retryAfter,
        this.queue.length
      ));
    }

    // Add to queue
    return this.addToQueue(id, operation, priority);
  }

  /**
   * Get current queue position for a job
   */
  getPosition(jobId: string): QueuePosition | null {
    const index = this.queue.findIndex(j => j.id === jobId);
    if (index === -1) return null;

    return {
      position: index + 1,
      estimatedWaitMs: this.estimateWaitTime(index + 1),
    };
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    return {
      currentConcurrent: this.currentConcurrent,
      queueDepth: this.queue.length,
      maxConcurrent: this.config.maxConcurrent,
      maxQueueSize: this.config.maxQueueSize,
      totalProcessed: this.totalProcessed,
      totalRejected: this.totalRejected,
      totalTimedOut: this.totalTimedOut,
      averageWaitTimeMs: this.calculateAverageWaitTime(),
    };
  }

  /**
   * Check if queue has capacity
   */
  hasCapacity(): boolean {
    return (
      this.currentConcurrent < this.config.maxConcurrent ||
      this.queue.length < this.config.maxQueueSize
    );
  }

  /**
   * Get queue utilization (0-1)
   */
  getUtilization(): number {
    return this.currentConcurrent / this.config.maxConcurrent;
  }

  /**
   * Cancel a queued job
   */
  cancel(jobId: string): boolean {
    const index = this.queue.findIndex(j => j.id === jobId);
    if (index === -1) return false;

    const job = this.queue[index];
    if (job.timeoutId) {
      clearTimeout(job.timeoutId);
    }
    job.reject(new Error('Job cancelled'));
    this.queue.splice(index, 1);
    return true;
  }

  /**
   * Clear all queued jobs
   */
  clear(): number {
    const count = this.queue.length;
    for (const job of this.queue) {
      if (job.timeoutId) {
        clearTimeout(job.timeoutId);
      }
      job.reject(new Error('Queue cleared'));
    }
    this.queue = [];
    return count;
  }

  /**
   * Update configuration dynamically
   */
  updateConfig(config: Partial<QueueConfig>): void {
    this.config = { ...this.config, ...config };
    // Process any waiting jobs if concurrency increased
    this.processNext();
  }

  private async processImmediately<T>(operation: () => Promise<T>): Promise<Result<T, Error>> {
    this.currentConcurrent++;
    const startTime = Date.now();

    try {
      const result = await operation();
      this.totalProcessed++;
      return success(result);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.currentConcurrent--;
      this.recordWaitTime(Date.now() - startTime);
      this.processNext();
    }
  }

  private addToQueue<T>(
    id: string,
    operation: () => Promise<T>,
    priority: Priority
  ): Promise<Result<T, Error>> {
    return new Promise<Result<T, Error>>((resolve) => {
      const job: QueuedJob<T> = {
        id,
        priority,
        operation,
        enqueuedAt: new Date(),
        resolve: (value: T) => resolve(success(value)),
        reject: (error: Error) => resolve(failure(error)),
      };

      // Set up timeout
      job.timeoutId = setTimeout(() => {
        const index = this.queue.findIndex(j => j.id === id);
        if (index !== -1) {
          this.queue.splice(index, 1);
          this.totalTimedOut++;
          job.reject(new QueueTimeoutError(`Job ${id} timed out after ${this.config.queueTimeout}ms in queue`));
        }
      }, this.config.queueTimeout);

      // Insert in priority order
      this.insertByPriority(job);
    });
  }

  private insertByPriority<T>(job: QueuedJob<T>): void {
    const priorityValue = PRIORITY_VALUES[job.priority];
    
    // Find insertion point (after same-priority jobs, before lower-priority)
    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      if (PRIORITY_VALUES[this.queue[i].priority] < priorityValue) {
        insertIndex = i;
        break;
      }
    }
    
    this.queue.splice(insertIndex, 0, job as QueuedJob<unknown>);
  }

  private processNext(): void {
    while (
      this.currentConcurrent < this.config.maxConcurrent &&
      this.queue.length > 0
    ) {
      const job = this.queue.shift()!;
      if (job.timeoutId) {
        clearTimeout(job.timeoutId);
      }

      const waitTime = Date.now() - job.enqueuedAt.getTime();
      this.recordWaitTime(waitTime);

      this.currentConcurrent++;
      
      job.operation()
        .then((result) => {
          this.totalProcessed++;
          job.resolve(result);
        })
        .catch((error) => {
          job.reject(error instanceof Error ? error : new Error(String(error)));
        })
        .finally(() => {
          this.currentConcurrent--;
          this.processNext();
        });
    }
  }

  private estimateWaitTime(position: number = this.queue.length): number {
    const avgWait = this.calculateAverageWaitTime();
    if (avgWait === 0) {
      // Default estimate: 30 seconds per position
      return position * 30000 / this.config.maxConcurrent;
    }
    return avgWait * position / this.config.maxConcurrent;
  }

  private calculateAverageWaitTime(): number {
    if (this.waitTimes.length === 0) return 0;
    const sum = this.waitTimes.reduce((a, b) => a + b, 0);
    return sum / this.waitTimes.length;
  }

  private recordWaitTime(ms: number): void {
    this.waitTimes.push(ms);
    // Keep only last 100 samples
    if (this.waitTimes.length > 100) {
      this.waitTimes.shift();
    }
  }
}

/**
 * Create a queue for generation jobs
 */
export function createGenerationQueue(config: Partial<QueueConfig> = {}): BackpressureQueue {
  return new BackpressureQueue('generation', {
    maxConcurrent: 10,
    maxQueueSize: 50,
    queueTimeout: 120000, // 2 minutes
    ...config,
  });
}

/**
 * Create a queue for Modal.com jobs
 */
export function createModalQueue(config: Partial<QueueConfig> = {}): BackpressureQueue {
  return new BackpressureQueue('modal', {
    maxConcurrent: 10, // GPU availability
    maxQueueSize: 100,
    queueTimeout: 300000, // 5 minutes
    ...config,
  });
}

/**
 * Create a queue for webhook processing
 */
export function createWebhookQueue(config: Partial<QueueConfig> = {}): BackpressureQueue {
  return new BackpressureQueue('webhook', {
    maxConcurrent: 20,
    maxQueueSize: 500,
    queueTimeout: 30000, // 30 seconds
    ...config,
  });
}
