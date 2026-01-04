/**
 * Console Log Buffer
 *
 * Captures console logs in memory for bug reporting.
 * Filters sensitive data before storage.
 */

export interface LogEntry {
  level: 'log' | 'error' | 'warn' | 'info' | 'debug';
  timestamp: number;
  message: string;
  stack?: string;
  args?: unknown[];
}

class ConsoleLogBuffer {
  private logs: LogEntry[] = [];
  private maxSize = 200; // Keep last 200 entries
  private originalConsole: {
    log: typeof console.log;
    error: typeof console.error;
    warn: typeof console.warn;
    info: typeof console.info;
    debug: typeof console.debug;
  };

  constructor() {
    this.originalConsole = {
      log: console.log.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console),
    };
  }

  /**
   * Start capturing console logs
   */
  start(): void {
    console.log = (...args: unknown[]) => {
      this.capture('log', args);
      this.originalConsole.log(...args);
    };

    console.error = (...args: unknown[]) => {
      const stack = new Error().stack;
      this.capture('error', args, stack);
      this.originalConsole.error(...args);
    };

    console.warn = (...args: unknown[]) => {
      this.capture('warn', args);
      this.originalConsole.warn(...args);
    };

    console.info = (...args: unknown[]) => {
      this.capture('info', args);
      this.originalConsole.info(...args);
    };

    console.debug = (...args: unknown[]) => {
      this.capture('debug', args);
      this.originalConsole.debug(...args);
    };
  }

  /**
   * Stop capturing (restore original console)
   */
  stop(): void {
    console.log = this.originalConsole.log;
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.info = this.originalConsole.info;
    console.debug = this.originalConsole.debug;
  }

  /**
   * Capture a log entry
   */
  private capture(
    level: LogEntry['level'],
    args: unknown[],
    stack?: string
  ): void {
    const message = args
      .map((arg) => {
        if (typeof arg === 'string') return arg;
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      })
      .join(' ');

    // Filter sensitive data from args
    const filteredArgs = this.filterSensitive(args) as unknown[];

    this.logs.push({
      level,
      timestamp: Date.now(),
      message: this.filterSensitiveString(message),
      stack,
      args: filteredArgs,
    });

    // Keep only last maxSize entries
    if (this.logs.length > this.maxSize) {
      this.logs = this.logs.slice(-this.maxSize);
    }
  }

  /**
   * Get captured logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Filter sensitive data from objects/arrays
   */
  private filterSensitive(data: unknown): unknown {
    if (typeof data === 'string') {
      return this.filterSensitiveString(data);
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.filterSensitive(item));
    }

    if (data && typeof data === 'object') {
      const filtered: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        // Filter common sensitive keys
        if (
          lowerKey.includes('token') ||
          lowerKey.includes('password') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('key') ||
          lowerKey.includes('auth') ||
          lowerKey.includes('api')
        ) {
          filtered[key] = '[FILTERED]';
        } else {
          filtered[key] = this.filterSensitive(value);
        }
      }
      return filtered;
    }

    return data;
  }

  /**
   * Filter sensitive patterns from strings
   */
  private filterSensitiveString(str: string): string {
    // Filter JWT tokens (base64-like strings)
    str = str.replace(
      /[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g,
      '[JWT_TOKEN]'
    );

    // Filter API keys (long alphanumeric strings)
    str = str.replace(/[A-Za-z0-9]{32,}/g, (match) => {
      // Don't filter if it looks like a normal word or number
      if (/^\d+$/.test(match) || match.length < 40) return match;
      return '[API_KEY]';
    });

    // Filter email-like patterns that might be tokens
    str = str.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) => {
      // Only filter if it's in a suspicious context
      if (str.includes('token') || str.includes('key') || str.includes('secret')) {
        return '[EMAIL_FILTERED]';
      }
      return match;
    });

    return str;
  }
}

// Singleton instance
let bufferInstance: ConsoleLogBuffer | null = null;

/**
 * Get or create the console log buffer singleton
 */
export function getConsoleLogBuffer(): ConsoleLogBuffer {
  if (!bufferInstance) {
    bufferInstance = new ConsoleLogBuffer();
    bufferInstance.start();
  }
  return bufferInstance;
}

/**
 * Initialize console log buffer (call on app startup)
 */
export function initConsoleLogBuffer(): void {
  getConsoleLogBuffer();
}

