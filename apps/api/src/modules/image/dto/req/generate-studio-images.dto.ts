import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUrl, IsUUID, Max, Min } from 'class-validator';
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
    enum: ['modal', 'comfyui', 'fal'],
    description:
      'Which provider to use for Studio generation. Modal.com is preferred for LoRA and reference image support.',
    default: 'modal',
  })
  @IsOptional()
  @IsIn(['modal', 'comfyui', 'fal'])
  modelProvider?: 'modal' | 'comfyui' | 'fal';

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

  // qualityMode removed - see EP-045

  @ApiProperty({ minimum: 1, maximum: 10, default: 1 })
  @IsInt()
  @Min(1)
  @Max(10)
  count!: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  nsfw!: boolean;

  @ApiProperty({ 
    required: false, 
    default: true,
    description: 'Enable AI prompt enhancement using OpenRouter/Gemini/OpenAI. Improves prompts with photography techniques and realism keywords.' 
  })
  @IsOptional()
  @IsBoolean()
  promptEnhance?: boolean;

  @ApiProperty({ required: false, description: 'Optional base seed. Each image increments this seed.' })
  @IsOptional()
  @IsInt()
  seed?: number;

  // LoRA Support - for character consistency with trained LoRA
  @ApiProperty({
    required: false,
    default: false,
    description: 'Enable LoRA-based generation for character consistency. Requires trained LoRA for the character.',
  })
  @IsOptional()
  @IsBoolean()
  useLora?: boolean;

  @ApiProperty({
    required: false,
    description: 'LoRA ID to use (if useLora is true). Defaults to character-{characterId} if not provided.',
  })
  @IsOptional()
  @IsString()
  loraId?: string;

  @ApiProperty({
    required: false,
    default: 1.0,
    minimum: 0.1,
    maximum: 2.0,
    description: 'LoRA strength (0.1-2.0). Higher values = stronger character likeness but may reduce prompt adherence.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(2.0)
  loraStrength?: number;

  // Reference Image Support - for face consistency without trained LoRA
  @ApiProperty({
    required: false,
    description: 'Reference image URL for face consistency (uses InstantID/PuLID). Alternative to LoRA.',
  })
  @IsOptional()
  @IsString()
  referenceImageUrl?: string;

  @ApiProperty({
    required: false,
    default: 0.8,
    minimum: 0.1,
    maximum: 1.0,
    description: 'Reference image strength (0.1-1.0). Higher = more face similarity, lower = more prompt freedom.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(1.0)
  referenceStrength?: number;

  @ApiProperty({
    required: false,
    enum: ['instantid', 'pulid', 'ipadapter'],
    default: 'instantid',
    description: 'Which reference image method to use. InstantID is recommended for best face consistency.',
  })
  @IsOptional()
  @IsIn(['instantid', 'pulid', 'ipadapter'])
  referenceMethod?: 'instantid' | 'pulid' | 'ipadapter';
}


