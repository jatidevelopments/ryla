import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class AppearanceDto {
  @ApiProperty({ enum: ['female', 'male'] })
  @IsIn(['female', 'male'])
  gender!: 'female' | 'male';

  @ApiProperty({ enum: ['realistic', 'anime'] })
  @IsIn(['realistic', 'anime'])
  style!: 'realistic' | 'anime';

  @ApiProperty()
  @IsString()
  ethnicity!: string;

  @ApiProperty({ minimum: 18, maximum: 80 })
  @IsInt()
  @Min(18)
  @Max(80)
  age!: number;

  @ApiProperty()
  @IsString()
  hairStyle!: string;

  @ApiProperty()
  @IsString()
  hairColor!: string;

  @ApiProperty()
  @IsString()
  eyeColor!: string;

  @ApiProperty()
  @IsString()
  bodyType!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  breastSize?: string;
}

class IdentityDto {
  @ApiProperty()
  @IsString()
  defaultOutfit!: string;

  @ApiProperty()
  @IsString()
  archetype!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  personalityTraits!: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;
}

export class GenerateBaseImagesDto {
  @ApiProperty({ description: 'UUID of the user (Option 1: unauthenticated MVP)' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ required: false, description: 'Optional character UUID' })
  @IsOptional()
  @IsUUID()
  characterId?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => AppearanceDto)
  appearance!: AppearanceDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => IdentityDto)
  identity!: IdentityDto;

  @ApiProperty({ default: false })
  @IsBoolean()
  nsfwEnabled!: boolean;

  @ApiProperty({ required: false, description: 'Optional deterministic seed' })
  @IsOptional()
  @IsInt()
  seed?: number;

  @ApiProperty({ required: false, default: false, description: 'Use Z-Image-Turbo endpoint' })
  @IsOptional()
  @IsBoolean()
  useZImage?: boolean;
}


