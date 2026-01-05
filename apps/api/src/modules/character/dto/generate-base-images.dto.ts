import { IsObject, IsBoolean, ValidateNested, IsOptional, IsIn, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class AppearanceDto {
  gender!: 'female' | 'male';
  style!: 'realistic' | 'anime';
  ethnicity!: string;
  age!: number;
  ageRange?: string;
  skinColor?: string;
  eyeColor!: string;
  faceShape?: string;
  hairStyle!: string;
  hairColor!: string;
  bodyType!: string;
  assSize?: string;
  breastSize?: string;
  breastType?: string;
  freckles?: string;
  scars?: string;
  beautyMarks?: string;
  piercings?: string;
  tattoos?: string;
}

class IdentityDto {
  defaultOutfit!: string;
  archetype!: string;
  personalityTraits!: string[];
  bio?: string;
}

export class GenerateBaseImagesDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AppearanceDto)
  appearance?: AppearanceDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => IdentityDto)
  identity?: IdentityDto;

  @IsBoolean()
  nsfwEnabled!: boolean;

  /**
   * Optional workflow override (defaults to recommended workflow on the pod)
   */
  @IsOptional()
  @IsIn(['z-image-danrisi', 'z-image-simple', 'z-image-pulid'])
  workflowId?: 'z-image-danrisi' | 'z-image-simple' | 'z-image-pulid';

  /**
   * Optional seed for reproducibility
   */
  @IsOptional()
  @IsNumber()
  seed?: number;

  /**
   * Optional speed knobs
   */
  @IsOptional()
  @IsNumber()
  steps?: number;

  @IsOptional()
  @IsNumber()
  cfg?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsString()
  promptInput?: string;

  @IsOptional()
  @IsBoolean()
  promptEnhance?: boolean;

  /**
   * Idempotency key to prevent duplicate generation.
   * If a job with this key is already in progress, returns existing job IDs.
   * Recommended: hash of userId + promptInput + promptEnhance
   */
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
