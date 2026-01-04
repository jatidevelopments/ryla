import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { getAllFalBackendModelIds } from '@ryla/shared';
import { getAllFalModelIds, type FalFluxModelId } from '../../services/fal-image.service';

// Get all valid model IDs for validation from registry (single source of truth)
// Fallback to service function for backward compatibility
const ALL_FAL_MODEL_IDS = (() => {
  try {
    const registryIds = getAllFalBackendModelIds();
    // Merge with service IDs to ensure we don't miss any
    const serviceIds = getAllFalModelIds();
    return Array.from(new Set([...registryIds, ...serviceIds]));
  } catch {
    // Fallback if registry not available
    return getAllFalModelIds();
  }
})();

export class GenerateStudioImagesDto {
  @ApiProperty({
    required: false,
    enum: ['comfyui', 'fal'],
    description:
      'Which provider to use for Studio generation. NSFW will always force comfyui.',
    default: 'comfyui',
  })
  @IsOptional()
  @IsIn(['comfyui', 'fal'])
  modelProvider?: 'comfyui' | 'fal';

  @ApiProperty({
    required: false,
    enum: ALL_FAL_MODEL_IDS,
    description:
      'When modelProvider=fal, which Fal model to use. See fal-ai pricing for cost details.',
    example: 'fal-ai/flux/schnell',
  })
  @IsOptional()
  @IsIn(ALL_FAL_MODEL_IDS)
  modelId?: FalFluxModelId;

  @ApiProperty({
    required: false,
    description:
      'Optional additional details to add to the prompt. All other components (character, scene, pose, etc.) are built automatically.',
  })
  @IsOptional()
  @IsString()
  additionalDetails?: string;

  @ApiProperty({ description: 'Character UUID to generate images for' })
  @IsUUID()
  characterId!: string;

  @ApiProperty({ description: 'Scene preset (snake_case or kebab-case)' })
  @IsString()
  scene!: string;

  @ApiProperty({ description: 'Environment preset (snake_case or kebab-case)' })
  @IsString()
  environment!: string;

  @ApiProperty({ 
    description: 'Outfit - can be string (legacy) or JSON object (OutfitComposition)',
    oneOf: [
      { type: 'string' },
      { type: 'object' }
    ]
  })
  outfit!: string | object;

  @ApiProperty({ 
    required: false,
    description: 'Pose ID (e.g., "standing-casual", "sitting-elegant")' 
  })
  @IsOptional()
  @IsString()
  poseId?: string;

  @ApiProperty({ 
    required: false,
    description: 'Lighting preset (e.g., "natural.goldenHour", "studio.soft")' 
  })
  @IsOptional()
  @IsString()
  lighting?: string;

  @ApiProperty({ 
    required: false,
    description: 'Expression preset (e.g., "positive.smile", "neutral.calm")' 
  })
  @IsOptional()
  @IsString()
  expression?: string;

  @ApiProperty({ enum: ['1:1', '9:16', '2:3'] })
  @IsIn(['1:1', '9:16', '2:3'])
  aspectRatio!: '1:1' | '9:16' | '2:3';

  @ApiProperty({ enum: ['draft', 'hq'], default: 'draft' })
  @IsIn(['draft', 'hq'])
  qualityMode!: 'draft' | 'hq';

  @ApiProperty({ minimum: 1, maximum: 10, default: 1 })
  @IsInt()
  @Min(1)
  @Max(10)
  count!: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  nsfw!: boolean;

  @ApiProperty({ required: false, description: 'Optional base seed. Each image increments this seed.' })
  @IsOptional()
  @IsInt()
  seed?: number;
}


