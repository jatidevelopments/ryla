import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsUrl } from 'class-validator';

export class GenerateCharacterSheetDto {
  @ApiProperty({
    description: 'Base image URL (from selected base image)',
    example: 'https://storage.supabase.co/.../base-image.jpg',
  })
  @IsUrl()
  baseImageUrl!: string;

  @ApiProperty({
    description: 'Character ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  characterId!: string;

  @ApiProperty({
    description: 'Whether NSFW content is enabled',
    example: false,
  })
  @IsBoolean()
  nsfwEnabled!: boolean;
}
