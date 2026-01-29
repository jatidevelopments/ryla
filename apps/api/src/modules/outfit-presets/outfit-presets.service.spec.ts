import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { OutfitPresetsService } from './outfit-presets.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createTestDb } from '../../test/utils/test-db';
import { eq, and, sql, gt } from 'drizzle-orm';
import * as schema from '@ryla/data/schema';

describe('OutfitPresetsService', () => {
  let service: OutfitPresetsService;
  let db: any;
  let client: any;

  // OPTIMIZATION: Create DB once per test suite instead of per test
  beforeAll(async () => {
    const testDb = await createTestDb();
    db = testDb.db;
    client = testDb.client;

    service = new OutfitPresetsService(db);
  });

  // OPTIMIZATION: Clean up data between tests instead of recreating DB
  beforeEach(async () => {
    // Use DELETE with condition that's always true to delete all rows
    // Delete in reverse order of foreign key dependencies
    try {
      await db.delete(schema.outfitPresets).where(sql`1=1`);
      await db.delete(schema.characters).where(sql`1=1`);
      await db.delete(schema.users).where(sql`1=1`);
    } catch (error) {
      // If DELETE fails, tests will still run
      console.warn('Cleanup failed, continuing with test:', error);
    }
  });

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  describe('assertValidUserId', () => {
    it('should throw BadRequestException for empty userId', async () => {
      await expect(
        service.create('', {
          influencerId: 'char-1',
          name: 'Test',
          composition: {},
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-string userId', async () => {
      await expect(
        service.create(null as any, {
          influencerId: 'char-1',
          name: 'Test',
          composition: {},
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('should throw NotFoundException when influencer does not exist', async () => {
      await expect(
        service.create('user-123', {
          influencerId: 'non-existent',
          name: 'Test',
          composition: {},
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create outfit preset', async () => {
      // First create a character
      const [character] = await db
        .insert(schema.characters)
        .values({
          userId: 'user-123',
          name: 'Test Character',
          config: {},
        })
        .returning();

      const dto = {
        influencerId: character.id,
        name: 'Test Preset',
        description: 'Test Description',
        composition: { top: 'shirt', bottom: 'pants' },
        isDefault: false,
      };

      const result = await service.create('user-123', dto);

      expect(result).toMatchObject({
        influencerId: character.id,
        userId: 'user-123',
        name: 'Test Preset',
        description: 'Test Description',
        isDefault: false,
      });
    });

    it('should unset other defaults when setting new default', async () => {
      // Create character
      const [character] = await db
        .insert(schema.characters)
        .values({
          userId: 'user-123',
          name: 'Test Character',
          config: {},
        })
        .returning();

      // Create first default preset
      const [preset1] = await db
        .insert(schema.outfitPresets)
        .values({
          influencerId: character.id,
          userId: 'user-123',
          name: 'Default Preset',
          isDefault: true,
        })
        .returning();

      // Create new default preset
      const dto = {
        influencerId: character.id,
        name: 'New Default',
        composition: {},
        isDefault: true,
      };

      const result = await service.create('user-123', dto);

      // Check old default is unset
      const [oldPreset] = await db
        .select()
        .from(schema.outfitPresets)
        .where(eq(schema.outfitPresets.id, preset1.id));

      expect(oldPreset.isDefault).toBe(false);
      expect(result.isDefault).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should return all presets for influencer', async () => {
      // Create character
      const [character] = await db
        .insert(schema.characters)
        .values({
          userId: 'user-123',
          name: 'Test Character',
          config: {},
        })
        .returning();

      // Create presets
      await db.insert(schema.outfitPresets).values([
        {
          influencerId: character.id,
          userId: 'user-123',
          name: 'Preset 1',
          isDefault: true,
        },
        {
          influencerId: character.id,
          userId: 'user-123',
          name: 'Preset 2',
          isDefault: false,
        },
      ]);

      const result = await service.findAll('user-123', character.id);

      expect(result.length).toBe(2);
      expect(result[0].isDefault).toBe(true); // Defaults first
    });
  });

  describe('findOne', () => {
    it('should return preset when found', async () => {
      // Create character
      const [character] = await db
        .insert(schema.characters)
        .values({
          userId: 'user-123',
          name: 'Test Character',
          config: {},
        })
        .returning();

      // Create preset
      const [preset] = await db
        .insert(schema.outfitPresets)
        .values({
          influencerId: character.id,
          userId: 'user-123',
          name: 'Test Preset',
        })
        .returning();

      const result = await service.findOne('user-123', preset.id);

      expect(result.id).toBe(preset.id);
      expect(result.name).toBe('Test Preset');
    });

    it('should throw NotFoundException when preset not found', async () => {
      await expect(service.findOne('user-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update preset', async () => {
      // Create character
      const [character] = await db
        .insert(schema.characters)
        .values({
          userId: 'user-123',
          name: 'Test Character',
          config: {},
        })
        .returning();

      // Create preset
      const [preset] = await db
        .insert(schema.outfitPresets)
        .values({
          influencerId: character.id,
          userId: 'user-123',
          name: 'Old Name',
        })
        .returning();

      const result = await service.update('user-123', preset.id, {
        name: 'New Name',
      });

      expect(result.name).toBe('New Name');
    });

    it('should throw NotFoundException when preset not found', async () => {
      await expect(
        service.update('user-123', 'non-existent', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove preset', async () => {
      // Create character
      const [character] = await db
        .insert(schema.characters)
        .values({
          userId: 'user-123',
          name: 'Test Character',
          config: {},
        })
        .returning();

      // Create preset
      const [preset] = await db
        .insert(schema.outfitPresets)
        .values({
          influencerId: character.id,
          userId: 'user-123',
          name: 'Test Preset',
        })
        .returning();

      const result = await service.remove('user-123', preset.id);

      expect(result.success).toBe(true);

      // Verify deleted - check that record no longer exists
      const deleted = await db
        .select()
        .from(schema.outfitPresets)
        .where(eq(schema.outfitPresets.id, preset.id));

      expect(deleted.length).toBe(0);
    });

    it('should throw NotFoundException when preset not found', async () => {
      await expect(service.remove('user-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
