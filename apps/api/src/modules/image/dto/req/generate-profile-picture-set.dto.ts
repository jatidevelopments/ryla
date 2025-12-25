import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID, IsIn } from 'class-validator';

export class GenerateProfilePictureSetDto {
  @ApiProperty({ description: 'URL of the selected base image' })
  @IsString()
  baseImageUrl!: string;

  @ApiProperty({ required: false, description: 'Optional character UUID' })
  @IsOptional()
  @IsUUID()
  characterId?: string;

  @ApiProperty({
    description: 'Profile picture set ID',
    enum: ['classic-influencer', 'professional-model', 'natural-beauty'],
  })
  @IsIn(['classic-influencer', 'professional-model', 'natural-beauty'])
  setId!: 'classic-influencer' | 'professional-model' | 'natural-beauty';

  @ApiProperty({ default: false, description: 'Enable NSFW content' })
  @IsBoolean()
  nsfwEnabled!: boolean;

  @ApiProperty({ required: false, description: 'Optional user UUID' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

