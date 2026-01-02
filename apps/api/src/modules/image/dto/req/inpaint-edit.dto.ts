import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class InpaintEditDto {
  @ApiProperty({ description: 'Character UUID (owner of the image asset)' })
  @IsUUID()
  characterId!: string;

  @ApiProperty({ description: 'Source image asset UUID to edit' })
  @IsUUID()
  sourceImageId!: string;

  @ApiProperty({ description: 'Edit prompt (e.g., "add a nano banana on the table")' })
  @IsString()
  prompt!: string;

  @ApiProperty({ required: false, description: 'Optional negative prompt' })
  @IsOptional()
  @IsString()
  negativePrompt?: string;

  @ApiProperty({
    description:
      'RGBA PNG as base64 data URL (alpha channel is the inpaint mask). Example: data:image/png;base64,...',
  })
  @IsString()
  maskedImageBase64Png!: string;

  @ApiProperty({ required: false, description: 'Optional seed for reproducibility' })
  @IsOptional()
  @IsInt()
  seed?: number;
}


