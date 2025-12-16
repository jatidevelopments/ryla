import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';

export class GenerateCharacterSheetDto {
  @ApiProperty({ description: 'UUID of the user (Option 1: unauthenticated MVP)' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  characterId?: string;

  @ApiProperty({ description: 'Base image URL for PuLID character sheet generation' })
  @IsUrl()
  baseImageUrl!: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  nsfw!: boolean;

  @ApiProperty({ required: false, type: [String], description: 'Optional list of angle presets' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  angles?: string[];
}


