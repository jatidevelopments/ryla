import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  ArrayMinSize,
} from 'class-validator';

export class TrainLoraDto {
  @ApiProperty({
    description: 'Character ID to train LoRA for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  characterId: string;

  @ApiProperty({
    description: 'Trigger word for the LoRA (e.g., character name)',
    example: 'mycharacter',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  triggerWord: string;

  @ApiProperty({
    description: 'List of image URLs to train on (min 3)',
    example: [
      'https://example.com/img1.jpg',
      'https://example.com/img2.jpg',
      'https://example.com/img3.jpg',
    ],
    type: [String],
    minItems: 3,
  })
  @IsArray()
  @ArrayMinSize(3)
  @IsString({ each: true })
  imageUrls: string[];

  @ApiPropertyOptional({
    description: 'Maximum training steps (default: 500)',
    example: 500,
    minimum: 100,
    maximum: 2000,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(2000)
  maxTrainSteps?: number;

  @ApiPropertyOptional({
    description: 'LoRA rank (default: 16)',
    example: 16,
    minimum: 4,
    maximum: 64,
  })
  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(64)
  rank?: number;

  @ApiPropertyOptional({
    description: 'Training image resolution (default: 512)',
    example: 512,
    minimum: 256,
    maximum: 1024,
  })
  @IsOptional()
  @IsNumber()
  @Min(256)
  @Max(1024)
  resolution?: number;
}

export class GetLoraTrainingStatusDto {
  @ApiProperty({
    description: 'Job ID or Call ID returned from start training',
    example: 'lora-abc123-xyz789',
  })
  @IsString()
  jobId: string;
}
