import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class RegenerateProfilePictureDto {
  @ApiProperty({ description: 'URL of the base image' })
  @IsString()
  baseImageUrl!: string;

  @ApiProperty({ description: 'Position ID of the profile picture to regenerate' })
  @IsString()
  positionId!: string;

  @ApiProperty({
    required: false,
    description: 'Optional prompt override for regeneration',
  })
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiProperty({ default: false, description: 'Enable NSFW content' })
  @IsBoolean()
  nsfwEnabled!: boolean;

  @ApiProperty({ required: false, description: 'Optional user UUID' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

