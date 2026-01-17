import { IsObject, IsBoolean, ValidateNested, IsOptional, IsIn, IsNumber, IsString, IsInt, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class AppearanceDto {
  @IsIn(['female', 'male'])
  gender!: 'female' | 'male';

  @IsIn(['realistic', 'anime'])
  style!: 'realistic' | 'anime';

  @IsString()
  ethnicity!: string;

  @IsInt()
  @Min(18)
  @Max(80)
  age!: number;

  @IsOptional()
  @IsString()
  ageRange?: string;

  @IsOptional()
  @IsString()
  skinColor?: string;

  @IsString()
  eyeColor!: string;

  @IsOptional()
  @IsString()
  faceShape?: string;

  @IsString()
  hairStyle!: string;

  @IsString()
  hairColor!: string;

  @IsString()
  bodyType!: string;

  @IsOptional()
  @IsString()
  assSize?: string;

  @IsOptional()
  @IsString()
  breastSize?: string;

  @IsOptional()
  @IsString()
  breastType?: string;

  @IsOptional()
  @IsString()
  freckles?: string;

  @IsOptional()
  @IsString()
  scars?: string;

  @IsOptional()
  @IsString()
  beautyMarks?: string;

  @IsOptional()
  @IsString()
  piercings?: string;

  @IsOptional()
  @IsString()
  tattoos?: string;
}

class IdentityDto {
  @IsString()
  defaultOutfit!: string;

  @IsString()
  archetype!: string;

  @IsArray()
  @IsString({ each: true })
  personalityTraits!: string[];

  @IsOptional()
  @IsString()
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

  /**
   * Skip credit deduction for deferred billing (wizard flow).
   * When true, credits are NOT deducted during base image generation.
   * Credits should be deducted at character creation time instead.
   * Default: false (backward compatible - credits deducted immediately)
   */
  @IsOptional()
  @IsBoolean()
  skipCreditDeduction?: boolean;
}
