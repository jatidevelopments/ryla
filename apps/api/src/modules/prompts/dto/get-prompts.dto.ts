import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPromptsDto {
  @ApiPropertyOptional({
    description: 'Filter by category',
    enum: ['portrait', 'fullbody', 'lifestyle', 'fashion', 'fitness', 'social_media', 'artistic', 'video_reference'],
  })
  @IsOptional()
  @IsEnum(['portrait', 'fullbody', 'lifestyle', 'fashion', 'fitness', 'social_media', 'artistic', 'video_reference'])
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by rating',
    enum: ['sfw', 'suggestive', 'nsfw'],
  })
  @IsOptional()
  @IsEnum(['sfw', 'suggestive', 'nsfw'])
  rating?: 'sfw' | 'suggestive' | 'nsfw';

  @ApiPropertyOptional({
    description: 'Search in name, description, or tags',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Number of results to return',
    default: 50,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of results to skip',
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

