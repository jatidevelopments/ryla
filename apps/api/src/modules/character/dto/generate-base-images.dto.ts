import { IsObject, IsBoolean, ValidateNested, IsOptional, IsIn, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class AppearanceDto {
  gender!: 'female' | 'male';
  style!: 'realistic' | 'anime';
  ethnicity!: string;
  age!: number;
  hairStyle!: string;
  hairColor!: string;
  eyeColor!: string;
  bodyType!: string;
  breastSize?: string;
}

class IdentityDto {
  defaultOutfit!: string;
  archetype!: string;
  personalityTraits!: string[];
  bio?: string;
}

export class GenerateBaseImagesDto {
  @IsObject()
  @ValidateNested()
  @Type(() => AppearanceDto)
  appearance!: AppearanceDto;

  @IsObject()
  @ValidateNested()
  @Type(() => IdentityDto)
  identity!: IdentityDto;

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
}
