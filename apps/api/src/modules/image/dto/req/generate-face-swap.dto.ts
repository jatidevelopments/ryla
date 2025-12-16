import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';

export class GenerateFaceSwapDto {
  @ApiProperty({ description: 'UUID of the user (Option 1: unauthenticated MVP)' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  characterId?: string;

  @ApiProperty({ description: 'Reference/base image URL to swap the face from' })
  @IsUrl()
  baseImageUrl!: string;

  @ApiProperty({ description: 'Prompt for the target image' })
  @IsString()
  prompt!: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  nsfw!: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  seed?: number;
}


