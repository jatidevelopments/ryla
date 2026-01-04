import { IsString, IsOptional, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OutfitCompositionDto } from './create-outfit-preset.dto';

export class UpdateOutfitPresetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => OutfitCompositionDto)
  composition?: OutfitCompositionDto;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

