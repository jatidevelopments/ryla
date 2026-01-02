import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID, IsIn, IsNumber } from 'class-validator';

export class RegenerateProfilePictureDto {
  @ApiProperty({ description: 'URL of the base image' })
  @IsString()
  baseImageUrl!: string;

  @ApiProperty({ description: 'Position ID of the profile picture to regenerate' })
  @IsString()
  positionId!: string;

  @ApiProperty({
    required: false,
    description: 'Optional prompt override for regeneration',
  })
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiProperty({ default: false, description: 'Enable NSFW content' })
  @IsBoolean()
  nsfwEnabled!: boolean;

  @ApiProperty({ required: false, description: 'Optional user UUID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    required: false,
    description: 'Profile picture set ID (defaults to classic-influencer)',
    enum: ['classic-influencer', 'professional-model', 'natural-beauty'],
  })
  @IsOptional()
  @IsIn(['classic-influencer', 'professional-model', 'natural-beauty'])
  setId?: 'classic-influencer' | 'professional-model' | 'natural-beauty';

  @ApiProperty({
    required: false,
    description: 'Generation mode: fast (speed-first) or consistent (face consistency, slower)',
    enum: ['fast', 'consistent'],
    default: 'fast',
  })
  @IsOptional()
  @IsIn(['fast', 'consistent'])
  generationMode?: 'fast' | 'consistent';

  @ApiProperty({
    required: false,
    description: 'Optional workflow override (defaults to recommended workflow on the pod)',
    enum: ['z-image-danrisi', 'z-image-simple', 'z-image-pulid'],
  })
  @IsOptional()
  @IsIn(['z-image-danrisi', 'z-image-simple', 'z-image-pulid'])
  workflowId?: 'z-image-danrisi' | 'z-image-simple' | 'z-image-pulid';

  @ApiProperty({ required: false, description: 'Optional inference steps (speed knob)' })
  @IsOptional()
  @IsNumber()
  steps?: number;

  @ApiProperty({ required: false, description: 'Optional CFG scale (guidance)' })
  @IsOptional()
  @IsNumber()
  cfg?: number;

  @ApiProperty({ required: false, description: 'Optional width override' })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiProperty({ required: false, description: 'Optional height override' })
  @IsOptional()
  @IsNumber()
  height?: number;
}

