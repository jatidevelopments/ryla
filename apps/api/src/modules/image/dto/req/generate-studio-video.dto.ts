import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class GenerateStudioVideoDto {
  @ApiProperty({ description: 'Character UUID to generate video for' })
  @IsUUID()
  characterId!: string;

  @ApiProperty({
    required: false,
    description: 'Optional prompt/description for the video',
  })
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiProperty({
    description: 'Video duration in seconds',
    enum: [2, 4, 6, 8],
    default: 4,
  })
  @IsIn([2, 4, 6, 8])
  duration!: 2 | 4 | 6 | 8;

  @ApiProperty({
    required: false,
    description: 'Frames per second',
    enum: [24, 30],
    default: 24,
  })
  @IsOptional()
  @IsIn([24, 30])
  fps?: 24 | 30;

  @ApiProperty({
    enum: ['1:1', '9:16', '16:9'],
    description: 'Video aspect ratio',
  })
  @IsIn(['1:1', '9:16', '16:9'])
  aspectRatio!: '1:1' | '9:16' | '16:9';

  @ApiProperty({ default: false })
  @IsBoolean()
  nsfw!: boolean;

  @ApiProperty({
    required: false,
    description: 'Optional seed for reproducibility',
  })
  @IsOptional()
  @IsInt()
  seed?: number;

  @ApiProperty({
    required: false,
    default: true,
    description: 'Use character LoRA if available for better face consistency',
  })
  @IsOptional()
  @IsBoolean()
  useLora?: boolean;
}
