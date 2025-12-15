import { IsObject, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AppearanceDto {
  gender: 'female' | 'male';
  style: 'realistic' | 'anime';
  ethnicity: string;
  age: number;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  bodyType: string;
  breastSize?: string;
}

class IdentityDto {
  defaultOutfit: string;
  archetype: string;
  personalityTraits: string[];
  bio?: string;
}

export class GenerateBaseImagesDto {
  @IsObject()
  @ValidateNested()
  @Type(() => AppearanceDto)
  appearance: AppearanceDto;

  @IsObject()
  @ValidateNested()
  @Type(() => IdentityDto)
  identity: IdentityDto;

  @IsBoolean()
  nsfwEnabled: boolean;
}

