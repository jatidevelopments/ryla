import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, sql, desc } from 'drizzle-orm';
import * as schema from '@ryla/data/schema';
import { CreateOutfitPresetDto } from './dto/create-outfit-preset.dto';
import { UpdateOutfitPresetDto } from './dto/update-outfit-preset.dto';

@Injectable()
export class OutfitPresetsService {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
  ) { }

  private assertValidUserId(userId: unknown): asserts userId is string {
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      throw new BadRequestException('Invalid userId');
    }
  }

  async create(userId: string, dto: CreateOutfitPresetDto) {
    this.assertValidUserId(userId);
    // Verify influencer belongs to user
    const influencer = await this.db
      .select()
      .from(schema.characters)
      .where(and(eq(schema.characters.id, dto.influencerId), eq(schema.characters.userId, userId)))
      .limit(1);

    if (influencer.length === 0) {
      throw new NotFoundException('Influencer not found');
    }

    // If setting as default, unset other defaults for this influencer
    if (dto.isDefault) {
      await this.db
        .update(schema.outfitPresets)
        .set({ isDefault: false })
        .where(
          and(
            eq(schema.outfitPresets.influencerId, dto.influencerId),
            eq(schema.outfitPresets.isDefault, true),
          ),
        );
    }

    const [preset] = await this.db
      .insert(schema.outfitPresets)
      .values({
        influencerId: dto.influencerId,
        userId,
        name: dto.name,
        description: dto.description,
        composition: dto.composition as any,
        isDefault: dto.isDefault ?? false,
      })
      .returning();

    return preset;
  }

  async findAll(userId: string, influencerId: string) {
    this.assertValidUserId(userId);
    const presets = await this.db
      .select()
      .from(schema.outfitPresets)
      .where(
        and(
          eq(schema.outfitPresets.influencerId, influencerId),
          eq(schema.outfitPresets.userId, userId),
        ),
      )
      .orderBy(desc(schema.outfitPresets.isDefault), desc(schema.outfitPresets.createdAt));

    return presets;
  }

  async findOne(userId: string, presetId: string) {
    this.assertValidUserId(userId);
    const [preset] = await this.db
      .select()
      .from(schema.outfitPresets)
      .where(
        and(eq(schema.outfitPresets.id, presetId), eq(schema.outfitPresets.userId, userId)),
      )
      .limit(1);

    if (!preset) {
      throw new NotFoundException('Outfit preset not found');
    }

    return preset;
  }

  async update(userId: string, presetId: string, dto: UpdateOutfitPresetDto) {
    this.assertValidUserId(userId);
    // Verify preset belongs to user
    const [existing] = await this.db
      .select()
      .from(schema.outfitPresets)
      .where(
        and(eq(schema.outfitPresets.id, presetId), eq(schema.outfitPresets.userId, userId)),
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Outfit preset not found');
    }

    // If setting as default, unset other defaults for this influencer
    if (dto.isDefault && !existing.isDefault) {
      await this.db
        .update(schema.outfitPresets)
        .set({ isDefault: false })
        .where(
          and(
            eq(schema.outfitPresets.influencerId, existing.influencerId),
            eq(schema.outfitPresets.isDefault, true),
            sql`${schema.outfitPresets.id} != ${presetId}`,
          ),
        );
    }

    const [updated] = await this.db
      .update(schema.outfitPresets)
      .set({
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.composition && { composition: dto.composition as any }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        updatedAt: new Date(),
      })
      .where(eq(schema.outfitPresets.id, presetId))
      .returning();

    return updated;
  }

  async remove(userId: string, presetId: string) {
    this.assertValidUserId(userId);
    const [preset] = await this.db
      .select()
      .from(schema.outfitPresets)
      .where(
        and(eq(schema.outfitPresets.id, presetId), eq(schema.outfitPresets.userId, userId)),
      )
      .limit(1);

    if (!preset) {
      throw new NotFoundException('Outfit preset not found');
    }

    await this.db.delete(schema.outfitPresets).where(eq(schema.outfitPresets.id, presetId));

    return { success: true };
  }
}

