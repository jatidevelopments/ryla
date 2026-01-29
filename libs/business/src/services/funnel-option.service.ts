/**
 * Funnel Option Service
 *
 * Business logic for funnel option management.
 */

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';
import { FunnelOptionsRepository } from '@ryla/data/repositories/funnel-options.repository';
import type { FunnelOption } from '@ryla/shared';

export class FunnelOptionService {
  private optionsRepo: FunnelOptionsRepository;

  constructor(db: NodePgDatabase<typeof schema>) {
    this.optionsRepo = new FunnelOptionsRepository(db);
  }

  /**
   * Save a single option (upsert)
   */
  async saveOption(
    sessionId: string,
    key: string,
    value: any
  ): Promise<boolean> {
    try {
      // Validate inputs
      if (!sessionId || sessionId.trim().length === 0) {
        throw new Error('Session ID is required');
      }

      if (!key || key.trim().length === 0) {
        throw new Error('Option key is required');
      }

      // Validate value is JSON-serializable
      try {
        JSON.stringify(value);
      } catch (_error) {
        throw new Error('Option value must be JSON-serializable');
      }

      // Upsert option
      await this.optionsRepo.upsert({
        sessionId,
        optionKey: key,
        optionValue: value,
      });

      return true;
    } catch (error) {
      console.error('Error saving funnel option:', error);
      return false; // Match Supabase behavior - return false on error
    }
  }

  /**
   * Save multiple options (upsert)
   */
  async saveAllOptions(
    sessionId: string,
    options: Record<string, any>
  ): Promise<boolean> {
    try {
      // Validate inputs
      if (!sessionId || sessionId.trim().length === 0) {
        throw new Error('Session ID is required');
      }

      if (!options || Object.keys(options).length === 0) {
        return true; // No options to save - return success
      }

      // Validate all values are JSON-serializable
      for (const [key, value] of Object.entries(options)) {
        if (!key || key.trim().length === 0) {
          throw new Error('Option key cannot be empty');
        }

        try {
          JSON.stringify(value);
        } catch (_error) {
          throw new Error(
            `Option value for key "${key}" must be JSON-serializable`
          );
        }
      }

      // Convert to array format
      const optionArray = Object.entries(options).map(([key, value]) => ({
        sessionId,
        optionKey: key,
        optionValue: value,
      }));

      // Upsert all options
      await this.optionsRepo.upsertMany(optionArray);

      return true;
    } catch (error) {
      console.error('Error saving funnel options:', error);
      return false; // Match Supabase behavior - return false on error
    }
  }

  /**
   * Get all options for a session
   */
  async getSessionOptions(sessionId: string): Promise<FunnelOption[]> {
    try {
      // Validate session ID
      if (!sessionId || sessionId.trim().length === 0) {
        return []; // Return empty array for invalid session ID
      }

      const options = await this.optionsRepo.findBySessionId(sessionId);

      return options;
    } catch (error) {
      console.error('Error getting funnel options:', error);
      return []; // Match Supabase behavior - return empty array on error
    }
  }
}
