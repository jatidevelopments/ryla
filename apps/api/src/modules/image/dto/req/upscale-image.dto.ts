import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { getAllFalBackendModelIds } from '@ryla/shared';
import { getAllFalModelIds, type FalFluxModelId } from '../../services/fal-image.service';

// Get all valid upscaling model IDs
const ALL_UPSCALING_MODEL_IDS = (() => {
  const upscalingModels: FalFluxModelId[] = [
    'fal-ai/clarity-upscaler',
    'fal-ai/aura-sr',
    'clarityai/crystal-upscaler',
    'fal-ai/seedvr/upscale/image',
    'fal-ai/topaz/upscale/image',
  ];
  try {
    const registryIds = getAllFalBackendModelIds();
    const serviceIds = getAllFalModelIds();
    const allIds = Array.from(new Set([...registryIds, ...serviceIds]));
    // Filter to only upscaling models
    return allIds.filter((id) => upscalingModels.includes(id as FalFluxModelId));
  } catch {
    return upscalingModels;
  }
})();

export class UpscaleImageDto {
  @ApiProperty({ description: 'Image UUID to upscale' })
  @IsUUID()
  imageId!: string;

  @ApiProperty({
    required: false,
    enum: ALL_UPSCALING_MODEL_IDS,
    description: 'Which Fal.ai upscaling model to use. Defaults to clarity-upscaler.',
    example: 'fal-ai/clarity-upscaler',
    default: 'fal-ai/clarity-upscaler',
  })
  @IsOptional()
  @IsIn(ALL_UPSCALING_MODEL_IDS)
  modelId?: FalFluxModelId;

  @ApiProperty({
    required: false,
    description: 'Upscale factor (2x, 4x, etc.). Some models may ignore this.',
    example: 2,
    default: 2,
  })
  @IsOptional()
  @IsIn([2, 4])
  scale?: number;
}

