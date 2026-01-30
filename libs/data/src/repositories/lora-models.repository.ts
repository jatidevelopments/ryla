import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, desc } from 'drizzle-orm';

import * as schema from '../schema';

export type LoraModelRow = typeof schema.loraModels.$inferSelect;
export type NewLoraModelRow = typeof schema.loraModels.$inferInsert;

export class LoraModelsRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  /**
   * Create a new LoRA model record
   */
  async create(
    values: Omit<NewLoraModelRow, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<LoraModelRow> {
    const [row] = await this.db
      .insert(schema.loraModels)
      .values(values)
      .returning();

    return row;
  }

  /**
   * Get LoRA model by ID
   */
  async getById(id: string): Promise<LoraModelRow | undefined> {
    return this.db.query.loraModels.findFirst({
      where: eq(schema.loraModels.id, id),
    });
  }

  /**
   * Get LoRA model by external job ID (Modal call ID)
   */
  async getByExternalJobId(
    externalJobId: string
  ): Promise<LoraModelRow | undefined> {
    return this.db.query.loraModels.findFirst({
      where: eq(schema.loraModels.externalJobId, externalJobId),
    });
  }

  /**
   * Get LoRA model for a character
   */
  async getByCharacterId(
    characterId: string
  ): Promise<LoraModelRow | undefined> {
    return this.db.query.loraModels.findFirst({
      where: eq(schema.loraModels.characterId, characterId),
      orderBy: [desc(schema.loraModels.createdAt)],
    });
  }

  /**
   * Get ready LoRA model for a character
   */
  async getReadyByCharacterId(
    characterId: string
  ): Promise<LoraModelRow | undefined> {
    return this.db.query.loraModels.findFirst({
      where: and(
        eq(schema.loraModels.characterId, characterId),
        eq(schema.loraModels.status, 'ready')
      ),
      orderBy: [desc(schema.loraModels.createdAt)],
    });
  }

  /**
   * Get all LoRA models for a character (for training history)
   */
  async getAllByCharacterId(characterId: string): Promise<LoraModelRow[]> {
    return this.db.query.loraModels.findMany({
      where: eq(schema.loraModels.characterId, characterId),
      orderBy: [desc(schema.loraModels.createdAt)],
    });
  }

  /**
   * Get all LoRA models for a user
   */
  async getByUserId(userId: string): Promise<LoraModelRow[]> {
    return this.db.query.loraModels.findMany({
      where: eq(schema.loraModels.userId, userId),
      orderBy: [desc(schema.loraModels.createdAt)],
    });
  }

  /**
   * Get all LoRA models with a specific status
   */
  async getByStatus(
    status: 'pending' | 'training' | 'ready' | 'failed' | 'expired'
  ): Promise<LoraModelRow[]> {
    return this.db.query.loraModels.findMany({
      where: eq(schema.loraModels.status, status),
      orderBy: [desc(schema.loraModels.createdAt)],
    });
  }

  /**
   * Update LoRA model by ID
   */
  async updateById(
    id: string,
    patch: Partial<NewLoraModelRow>
  ): Promise<LoraModelRow | undefined> {
    const [row] = await this.db
      .update(schema.loraModels)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(schema.loraModels.id, id))
      .returning();

    return row;
  }

  /**
   * Update LoRA model by external job ID
   */
  async updateByExternalJobId(
    externalJobId: string,
    patch: Partial<NewLoraModelRow>
  ): Promise<LoraModelRow | undefined> {
    const [row] = await this.db
      .update(schema.loraModels)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(schema.loraModels.externalJobId, externalJobId))
      .returning();

    return row;
  }

  /**
   * Mark training as started
   */
  async markTrainingStarted(id: string): Promise<LoraModelRow | undefined> {
    return this.updateById(id, {
      status: 'training',
      trainingStartedAt: new Date(),
    });
  }

  /**
   * Mark training as completed
   */
  async markTrainingCompleted(
    id: string,
    result: {
      modelPath: string;
      modelUrl?: string;
      trainingDurationMs: number;
      trainingSteps: number;
    }
  ): Promise<LoraModelRow | undefined> {
    return this.updateById(id, {
      status: 'ready',
      modelPath: result.modelPath,
      modelUrl: result.modelUrl,
      trainingDurationMs: result.trainingDurationMs,
      trainingSteps: result.trainingSteps,
      trainingCompletedAt: new Date(),
    });
  }

  /**
   * Mark training as failed
   */
  async markTrainingFailed(
    id: string,
    errorMessage: string
  ): Promise<LoraModelRow | undefined> {
    const current = await this.getById(id);
    return this.updateById(id, {
      status: 'failed',
      errorMessage,
      retryCount: (current?.retryCount ?? 0) + 1,
    });
  }

  /**
   * Mark training as failed and record refund
   */
  async markTrainingFailedWithRefund(
    id: string,
    errorMessage: string,
    creditsRefunded: number
  ): Promise<LoraModelRow | undefined> {
    const current = await this.getById(id);
    return this.updateById(id, {
      status: 'failed',
      errorMessage,
      creditsRefunded,
      retryCount: (current?.retryCount ?? 0) + 1,
    });
  }

  /**
   * Get failed LoRAs that need refund (creditsCharged > 0 and creditsRefunded is null)
   */
  async getFailedNeedingRefund(): Promise<LoraModelRow[]> {
    const failed = await this.getByStatus('failed');
    return failed.filter(
      (lora) =>
        lora.creditsCharged != null &&
        lora.creditsCharged > 0 &&
        lora.creditsRefunded == null
    );
  }

  /**
   * Delete LoRA model by ID
   */
  async deleteById(id: string): Promise<void> {
    await this.db.delete(schema.loraModels).where(eq(schema.loraModels.id, id));
  }
}
