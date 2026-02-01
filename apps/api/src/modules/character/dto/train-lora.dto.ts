import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  ArrayMinSize,
} from 'class-validator';

/**
 * Supported LoRA model types for training
 */
export enum LoraModelTypeDto {
  FLUX = 'flux',
  WAN = 'wan',
  WAN_14B = 'wan-14b',
  QWEN = 'qwen',
}

export class TrainLoraDto {
  @ApiProperty({
    description: 'Character ID to train LoRA for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  characterId!: string;

  @ApiProperty({
    description: 'Trigger word for the LoRA (e.g., character name)',
    example: 'mycharacter',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  triggerWord!: string;

  @ApiPropertyOptional({
    description:
      'Model type: flux (images), wan (video 1.3B), wan-14b (video 14B), qwen (images)',
    example: 'flux',
    enum: LoraModelTypeDto,
    default: 'flux',
  })
  @IsOptional()
  @IsEnum(LoraModelTypeDto)
  modelType?: LoraModelTypeDto;

  @ApiPropertyOptional({
    description:
      'List of media URLs to train on (images for flux/qwen, videos for wan)',
    example: [
      'https://example.com/media1.jpg',
      'https://example.com/media2.jpg',
      'https://example.com/media3.jpg',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @ApiPropertyOptional({
    description: '(deprecated) Use mediaUrls instead. List of image URLs.',
    example: [
      'https://example.com/img1.jpg',
      'https://example.com/img2.jpg',
      'https://example.com/img3.jpg',
    ],
    type: [String],
    deprecated: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(3)
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({
    description: 'Maximum training steps (default: 500)',
    example: 500,
    minimum: 100,
    maximum: 2000,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(2000)
  maxTrainSteps?: number;

  @ApiPropertyOptional({
    description: 'LoRA rank (default: 16)',
    example: 16,
    minimum: 4,
    maximum: 64,
  })
  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(64)
  rank?: number;

  @ApiPropertyOptional({
    description: 'Training image/video resolution (default: 512)',
    example: 512,
    minimum: 256,
    maximum: 1024,
  })
  @IsOptional()
  @IsNumber()
  @Min(256)
  @Max(1024)
  resolution?: number;

  @ApiPropertyOptional({
    description: 'Model size for Wan training: "1.3B" or "14B"',
    example: '1.3B',
  })
  @IsOptional()
  @IsString()
  modelSize?: string;

  @ApiPropertyOptional({
    description: 'Number of frames for video training (Wan only)',
    example: 17,
    minimum: 9,
    maximum: 49,
  })
  @IsOptional()
  @IsNumber()
  @Min(9)
  @Max(49)
  numFrames?: number;
}

export class GetLoraTrainingStatusDto {
  @ApiProperty({
    description: 'Job ID or Call ID returned from start training',
    example: 'lora-abc123-xyz789',
  })
  @IsString()
  jobId!: string;
}
