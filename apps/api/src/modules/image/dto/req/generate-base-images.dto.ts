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

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AppearanceDto)
  appearance?: AppearanceDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => IdentityDto)
  identity?: IdentityDto;

  @ApiProperty({ default: false })
  @IsBoolean()
  nsfwEnabled!: boolean;

  @ApiProperty({ required: false, description: 'Optional deterministic seed' })
  @IsOptional()
  @IsInt()
  seed?: number;

  @ApiProperty({
    required: false,
    default: false,
    description: 'Use Z-Image-Turbo endpoint (deprecated - use workflowId instead)',
    deprecated: true,
  })
  @IsOptional()
  @IsBoolean()
  useZImage?: boolean;

  @ApiProperty({
    required: false,
    enum: ['z-image-danrisi', 'z-image-simple'],
    description: 'ComfyUI workflow to use for generation. z-image-danrisi is optimized, z-image-simple is fallback.',
  })
  @IsOptional()
  @IsIn(['z-image-danrisi', 'z-image-simple'])
  workflowId?: 'z-image-danrisi' | 'z-image-simple';

  @ApiProperty({
    required: false,
    description: 'Prompt template ID from the prompt library (e.g., "portrait-selfie-casual")',
  })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiProperty({
    required: false,
    description: 'Scene path from categories (e.g., "indoor.cafe", "outdoor.beach")',
  })
  @IsOptional()
  @IsString()
  scene?: string;

  @ApiProperty({
    required: false,
    description: 'Lighting path from categories (e.g., "natural.goldenHour", "studio.softbox")',
  })
  @IsOptional()
  @IsString()
  lighting?: string;

  @ApiProperty({
    required: false,
    description: 'Expression path from categories (e.g., "positive.smile", "neutral.relaxed")',
  })
  @IsOptional()
  @IsString()
  expression?: string;

  @ApiProperty({
    required: false,
    description: 'Raw prompt input for prompt-based character creation (alternative to structured appearance/identity)',
  })
  @IsOptional()
  @IsString()
  promptInput?: string;

  @ApiProperty({
    required: false,
    default: true,
    description: 'Enable AI prompt enhancement using OpenRouter/Gemini/OpenAI. Improves prompts with photography techniques and realism keywords.',
  })
  @IsOptional()
  @IsBoolean()
  promptEnhance?: boolean;

  @ApiProperty({
    required: false,
    description: 'Idempotency key to prevent duplicate generation. If a job with this key is already in progress, returns existing job IDs instead of starting a new one. Recommended: hash of userId + promptInput + promptEnhance.',
  })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}


