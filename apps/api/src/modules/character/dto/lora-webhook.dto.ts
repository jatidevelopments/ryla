import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for LoRA training webhook callback from Modal
 */
export class LoraWebhookDto {
  @ApiProperty({
    description: 'Webhook secret for authentication',
    example: 'your-webhook-secret',
  })
  @IsString()
  secret: string;

  @ApiProperty({
    description: 'Modal call ID for the training job',
    example: 'fc-xxxxx',
  })
  @IsString()
  callId: string;

  @ApiProperty({
    description: 'Training status',
    enum: ['completed', 'failed'],
  })
  @IsString()
  @IsIn(['completed', 'failed'])
  status: 'completed' | 'failed';

  @ApiProperty({
    description: 'Character ID',
    example: 'uuid-here',
  })
  @IsString()
  characterId: string;

  @ApiProperty({
    description: 'Path to the trained LoRA model',
    example: '/root/models/loras/uuid-here/lora.safetensors',
    required: false,
  })
  @IsString()
  @IsOptional()
  loraPath?: string;

  @ApiProperty({
    description: 'Training time in seconds',
    example: 180,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  trainingTimeSeconds?: number;

  @ApiProperty({
    description: 'Number of training steps',
    example: 500,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  trainingSteps?: number;

  @ApiProperty({
    description: 'Error message if training failed',
    required: false,
  })
  @IsString()
  @IsOptional()
  error?: string;
}
