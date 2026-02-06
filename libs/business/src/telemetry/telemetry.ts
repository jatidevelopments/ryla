/**
 * Structured Telemetry
 * 
 * Provides span-based telemetry for all operations.
 * Inspired by Phoenix's built-in telemetry and OpenTelemetry concepts.
 * 
 * Usage:
 * ```typescript
 * const result = await telemetry.span('ai.modal.generate', {
 *   model: 'flux-dev',
 *   userId: '123',
 * }, async () => {
 *   return await modalClient.generate(input);
 * });
 * ```
 */

export type SpanStatus = 'ok' | 'error';

export interface SpanAttributes {
  [key: string]: string | number | boolean | undefined;
}

export interface SpanEvent {
  name: string;
  timestamp: Date;
  durationMs: number;
  status: SpanStatus;
  attributes: SpanAttributes;
  error?: {
    message: string;
    name: string;
    stack?: string;
  };
  parentSpanId?: string;
}

export interface TelemetryEvent {
  name: string;
  timestamp: Date;
  attributes: SpanAttributes;
}

export type SpanHandler = (event: SpanEvent) => void;
export type EventHandler = (event: TelemetryEvent) => void;

interface TelemetryConfig {
  /** Enable telemetry */
  enabled: boolean;
  /** Log to console */
  logToConsole: boolean;
  /** Sample rate (0-1) for high-volume events */
  sampleRate: number;
  /** Service name */
  serviceName: string;
}

const DEFAULT_CONFIG: TelemetryConfig = {
  enabled: true,
  logToConsole: process.env['NODE_ENV'] !== 'production',
  sampleRate: 1.0,
  serviceName: 'ryla-api',
};

class TelemetryCore {
  private config: TelemetryConfig;
  private spanHandlers: SpanHandler[] = [];
  private eventHandlers: EventHandler[] = [];
  private spanStack: string[] = [];
  private spanIdCounter = 0;

  constructor(config: Partial<TelemetryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Default handler: log to console
    if (this.config.logToConsole) {
      this.addSpanHandler(this.consoleSpanHandler.bind(this));
    }
  }

  /**
   * Execute an operation within a span
   */
  async span<T>(
    name: string,
    attributes: SpanAttributes,
    operation: () => Promise<T>
  ): Promise<T> {
    if (!this.config.enabled) {
      return operation();
    }

    // Sample decision
    if (Math.random() > this.config.sampleRate) {
      return operation();
    }

    const spanId = this.generateSpanId();
    const parentSpanId = this.spanStack[this.spanStack.length - 1];
    this.spanStack.push(spanId);
    
    const startTime = Date.now();
    let status: SpanStatus = 'ok';
    let error: Error | undefined;

    try {
      const result = await operation();
      return result;
    } catch (err) {
      status = 'error';
      error = err instanceof Error ? err : new Error(String(err));
      throw err;
    } finally {
      const durationMs = Date.now() - startTime;
      this.spanStack.pop();

      const event: SpanEvent = {
        name,
        timestamp: new Date(),
        durationMs,
        status,
        attributes: {
          ...attributes,
          'span.id': spanId,
          'service.name': this.config.serviceName,
        },
        error: error ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        } : undefined,
        parentSpanId,
      };

      this.emitSpan(event);
    }
  }

  /**
   * Synchronous span for non-async operations
   */
  spanSync<T>(
    name: string,
    attributes: SpanAttributes,
    operation: () => T
  ): T {
    if (!this.config.enabled) {
      return operation();
    }

    if (Math.random() > this.config.sampleRate) {
      return operation();
    }

    const spanId = this.generateSpanId();
    const parentSpanId = this.spanStack[this.spanStack.length - 1];
    this.spanStack.push(spanId);
    
    const startTime = Date.now();
    let status: SpanStatus = 'ok';
    let error: Error | undefined;

    try {
      const result = operation();
      return result;
    } catch (err) {
      status = 'error';
      error = err instanceof Error ? err : new Error(String(err));
      throw err;
    } finally {
      const durationMs = Date.now() - startTime;
      this.spanStack.pop();

      const event: SpanEvent = {
        name,
        timestamp: new Date(),
        durationMs,
        status,
        attributes: {
          ...attributes,
          'span.id': spanId,
          'service.name': this.config.serviceName,
        },
        error: error ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        } : undefined,
        parentSpanId,
      };

      this.emitSpan(event);
    }
  }

  /**
   * Emit a standalone event (fire-and-forget)
   */
  emit(name: string, attributes: SpanAttributes = {}): void {
    if (!this.config.enabled) return;
    if (Math.random() > this.config.sampleRate) return;

    const event: TelemetryEvent = {
      name,
      timestamp: new Date(),
      attributes: {
        ...attributes,
        'service.name': this.config.serviceName,
      },
    };

    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (err) {
        console.error('[Telemetry] Event handler error:', err);
      }
    }
  }

  /**
   * Add a span handler
   */
  addSpanHandler(handler: SpanHandler): void {
    this.spanHandlers.push(handler);
  }

  /**
   * Add an event handler
   */
  addEventHandler(handler: EventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove all handlers
   */
  clearHandlers(): void {
    this.spanHandlers = [];
    this.eventHandlers = [];
  }

  /**
   * Update configuration
   */
  configure(config: Partial<TelemetryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): TelemetryConfig {
    return { ...this.config };
  }

  private emitSpan(event: SpanEvent): void {
    for (const handler of this.spanHandlers) {
      try {
        handler(event);
      } catch (err) {
        console.error('[Telemetry] Span handler error:', err);
      }
    }
  }

  private generateSpanId(): string {
    this.spanIdCounter++;
    return `span-${Date.now()}-${this.spanIdCounter}`;
  }

  private consoleSpanHandler(event: SpanEvent): void {
    const icon = event.status === 'ok' ? '✓' : '✗';
    const color = event.status === 'ok' ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    
    const attrs = Object.entries(event.attributes)
      .filter(([k]) => !k.startsWith('span.') && !k.startsWith('service.'))
      .map(([k, v]) => `${k}=${v}`)
      .join(' ');

    console.log(
      `${color}[${icon}]${reset} ${event.name} (${event.durationMs}ms) ${attrs}`
    );

    if (event.error) {
      console.error(`    Error: ${event.error.message}`);
    }
  }
}

// Singleton instance
export const telemetry = new TelemetryCore();

// Named exports for convenience
export const span = telemetry.span.bind(telemetry);
export const spanSync = telemetry.spanSync.bind(telemetry);
export const emit = telemetry.emit.bind(telemetry);

/**
 * Create a new telemetry instance (for testing or isolation)
 */
export function createTelemetry(config: Partial<TelemetryConfig> = {}): TelemetryCore {
  return new TelemetryCore(config);
}

/**
 * JSON exporter for production logging
 */
export function createJsonSpanHandler(): SpanHandler {
  return (event: SpanEvent) => {
    const log = {
      timestamp: event.timestamp.toISOString(),
      name: event.name,
      duration_ms: event.durationMs,
      status: event.status,
      ...event.attributes,
      ...(event.error ? {
        error_message: event.error.message,
        error_name: event.error.name,
      } : {}),
      ...(event.parentSpanId ? { parent_span_id: event.parentSpanId } : {}),
    };
    console.log(JSON.stringify(log));
  };
}
