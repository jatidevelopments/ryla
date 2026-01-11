import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OutfitCompositionDto {
  @IsOptional()
  @IsString()
  top?: string;

  @IsOptional()
  @IsString()
  bottom?: string;

  @IsOptional()
  @IsString()
  shoes?: string;

  @IsOptional()
  @IsString()
  headwear?: string;

  @IsOptional()
  @IsString()
  outerwear?: string;

  @IsOptional()
  @IsString({ each: true })
  accessories?: string[];
}

export class CreateOutfitPresetDto {
  @IsString()
  @IsNotEmpty()
  influencerId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => OutfitCompositionDto)
  composition!: OutfitCompositionDto;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

