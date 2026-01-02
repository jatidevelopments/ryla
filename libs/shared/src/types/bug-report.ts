/**
 * Bug Report Types
 *
 * Client-safe type definitions for bug reports.
 * These mirror the types in @ryla/data but can be imported safely in client code.
 */

/**
 * Console log entry from the log buffer
 */
export interface ConsoleLogEntry {
  level: 'log' | 'error' | 'warn' | 'info' | 'debug';
  timestamp: number; // Unix timestamp in ms
  message: string;
  stack?: string; // For errors
  args?: unknown[]; // Additional arguments (filtered for sensitive data)
}

/**
 * Browser metadata collected during bug report
 */
export interface BrowserMetadata {
  userAgent: string;
  url: string;
  viewport: {
    width: number;
    height: number;
  };
  platform: string;
  language: string;
  timezone: string;
}

