/**
 * Modal.com Utility Functions
 * 
 * Helper functions for interacting with Modal CLI, with proper timeout handling.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ModalLogsOptions {
  appName: string;
  timeoutSeconds?: number;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Get Modal app logs with timeout and retry logic
 * 
 * Modal CLI commands (especially `modal app logs`) can hang indefinitely.
 * This function adds proper timeout handling and retry logic.
 */
export async function getModalLogs(
  options: ModalLogsOptions
): Promise<string> {
  const {
    appName,
    timeoutSeconds = 30,
    maxRetries = 3,
    retryDelay = 5,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { stdout, stderr } = await Promise.race([
        execAsync(`modal app logs ${appName}`, {
          timeout: timeoutSeconds * 1000,
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        }),
        new Promise<never>((_, reject) => 
          setTimeout(
            () => reject(new Error('Timeout')),
            timeoutSeconds * 1000
          )
        )
      ]) as { stdout: string; stderr: string };
      
      return (stdout || '') + (stderr || '');
    } catch (error: any) {
      lastError = error;
      
      if (error.message === 'Timeout' || error.code === 'ETIMEDOUT') {
        if (attempt < maxRetries) {
          console.warn(
            `⚠️  Logs request timed out (attempt ${attempt}/${maxRetries}), retrying in ${retryDelay}s...`
          );
          await new Promise(resolve => setTimeout(resolve, retryDelay * 1000));
          continue;
        }
        return `⚠️  Logs request timed out after ${timeoutSeconds}s (${maxRetries} attempts).\n` +
               `   Try checking Modal dashboard: https://modal.com/apps\n` +
               `   Or run manually: timeout ${timeoutSeconds} modal app logs ${appName}`;
      }
      
      // Other errors, don't retry
      throw error;
    }
  }

  throw lastError || new Error('Failed to get logs after all retries');
}

/**
 * Check if Modal app is deployed
 * 
 * Note: Modal app names in list may be truncated, so we check for partial matches
 */
export async function checkModalAppDeployed(appName: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`modal app list`, {
      timeout: 10000,
    });
    
    // Modal truncates app names in list, so check for partial match
    // Also check for exact match and common variations
    const normalized = appName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const lines = stdout.toLowerCase();
    
    // Check for exact match, truncated match, or partial match
    return (
      lines.includes(appName.toLowerCase()) ||
      lines.includes(normalized) ||
      lines.includes(appName.toLowerCase().substring(0, 10)) // First 10 chars
    );
  } catch (error) {
    return false;
  }
}

/**
 * Get Modal app endpoint URL from deployment output
 * 
 * Attempts to extract the actual endpoint URL from Modal's deployment output.
 * Falls back to constructing URL from pattern if extraction fails.
 */
export async function getModalAppEndpoint(
  appName: string,
  workspace?: string,
  className?: string
): Promise<string | null> {
  try {
    // Try to get workspace from Modal profile
    let modalWorkspace = workspace;
    if (!modalWorkspace) {
      try {
        const { stdout } = await execAsync('modal profile current', {
          timeout: 5000,
        });
        modalWorkspace = stdout.trim();
      } catch {
        // Workspace not available
      }
    }

    if (!modalWorkspace) {
      return null;
    }

    // Try to get actual endpoint from Modal app inspect (if available)
    try {
      const { stdout } = await execAsync(`modal app inspect ${appName}`, {
        timeout: 10000,
      });
      
      // Look for web endpoint URL in output
      const urlMatch = stdout.match(/https:\/\/[^\s]+\.modal\.run/);
      if (urlMatch && urlMatch[0]) {
        return urlMatch[0];
      }
    } catch {
      // App inspect not available or failed, fall back to pattern
    }

    // Fallback: Construct endpoint URL from pattern
    // Pattern: https://{workspace}--{app-name}-{class-name}-fastapi-app.modal.run
    const safeAppName = appName.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    
    // If className provided, use it; otherwise derive from app name
    let classPart = className;
    if (!classPart) {
      // Derive class name from app name (remove "ryla-" prefix, convert to PascalCase)
      const nameWithoutPrefix = safeAppName.replace(/^ryla-/, '');
      classPart = nameWithoutPrefix
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('_'); // Modal uses underscores in class names for endpoint URLs
    }
    
      // Convert class name to Modal's format (hyphens, lowercase)
      // Modal converts underscores to hyphens in endpoint URLs
      const safeClassName = classPart.toLowerCase().replace(/[^a-z0-9]/gi, '-');
      
      return `https://${modalWorkspace}--${safeAppName}-${safeClassName}-fastapi-app.modal.run`;
  } catch (error) {
    return null;
  }
}

/**
 * Test Modal endpoint health
 */
export async function testModalEndpoint(
  url: string,
  timeoutSeconds = 30
): Promise<{ healthy: boolean; response?: any; error?: string }> {
  try {
    const fetch = (await import('node-fetch')).default;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutSeconds * 1000);

    try {
      const response = await fetch(`${url}/health`, {
        signal: controller.signal,
        timeout: timeoutSeconds * 1000,
      } as any);

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return { healthy: true, response: data };
      } else {
        return {
          healthy: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        return {
          healthy: false,
          error: `Request timeout after ${timeoutSeconds}s (cold start may be in progress)`,
        };
      }
      throw error;
    }
  } catch (error: any) {
    return {
      healthy: false,
      error: error.message || 'Unknown error',
    };
  }
}
