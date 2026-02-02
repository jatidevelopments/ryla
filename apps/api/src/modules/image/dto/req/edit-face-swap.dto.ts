import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class EditFaceSwapDto {
  @ApiProperty({ description: 'Character UUID whose face to use' })
  @IsUUID()
  characterId!: string;

  @ApiProperty({
    required: false,
    description: 'Source image ID to apply face swap to',
  })
  @IsOptional()
  @IsUUID()
  sourceImageId?: string;

  @ApiProperty({
    required: false,
    description: 'Source video ID to apply face swap to',
  })
  @IsOptional()
  @IsUUID()
  sourceVideoId?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  nsfw!: boolean;

  @ApiProperty({
    required: false,
    default: true,
    description: 'Apply GFPGAN face restoration after swap',
  })
  @IsOptional()
  @IsBoolean()
  restoreFace?: boolean;
}
