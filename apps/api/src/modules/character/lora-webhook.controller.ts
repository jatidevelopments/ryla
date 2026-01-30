import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Inject,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoraWebhookDto } from './dto/lora-webhook.dto';
import { LoraTrainingService } from '@ryla/business/services/lora-training.service';
import { LoraModelsRepository, NotificationsRepository } from '@ryla/data';
import { CreditManagementService } from '../credits/services/credit-management.service';
import { eq } from 'drizzle-orm';
import * as schema from '@ryla/data/schema';

/**
 * Webhook controller for LoRA training callbacks from Modal
 *
 * This controller is NOT protected by JWT - it uses a shared secret for auth.
 * Modal calls this webhook when training completes or fails.
 */
@ApiTags('Webhooks')
@Controller('webhooks/lora')
export class LoraWebhookController {
  private readonly logger = new Logger(LoraWebhookController.name);
  private readonly loraTrainingService: LoraTrainingService;

  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: any,
    @Inject(CreditManagementService)
    private readonly creditService: CreditManagementService
  ) {
    // Initialize LoRA training service with repository
    const loraRepository = new LoraModelsRepository(this.db);
    this.loraTrainingService = new LoraTrainingService(loraRepository);
  }

  @Post('callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'LoRA training webhook callback',
    description:
      'Called by Modal when LoRA training completes or fails. Requires webhook secret.',
  })
  async handleLoraWebhook(@Body() dto: LoraWebhookDto) {
    // Verify webhook secret
    const expectedSecret = process.env.LORA_WEBHOOK_SECRET;
    if (!expectedSecret || dto.secret !== expectedSecret) {
      this.logger.warn(
        `Invalid webhook secret received for character ${dto.characterId}`
      );
      throw new UnauthorizedException('Invalid webhook secret');
    }

    this.logger.log(
      `Received LoRA webhook: status=${dto.status}, characterId=${dto.characterId}, callId=${dto.callId}`
    );

    // Find the LoRA model by external job ID (call ID)
    const loraRepository = new LoraModelsRepository(this.db);
    const loraModel = await loraRepository.getByExternalJobId(dto.callId);

    if (!loraModel) {
      this.logger.warn(`LoRA model not found for callId: ${dto.callId}`);
      return { success: false, message: 'LoRA model not found' };
    }

    // Get character info for notification
    const character = await this.db.query.characters.findFirst({
      where: eq(schema.characters.id, dto.characterId),
      columns: { name: true },
    });
    const characterName = character?.name || 'your character';

    const notificationsRepo = new NotificationsRepository(this.db);

    if (dto.status === 'completed') {
      // Mark training as completed
      await loraRepository.markTrainingCompleted(loraModel.id, {
        modelPath: dto.loraPath || '',
        trainingDurationMs: (dto.trainingTimeSeconds || 0) * 1000,
        trainingSteps: dto.trainingSteps || 0,
      });

      // Send success notification
      await notificationsRepo.create({
        userId: loraModel.userId,
        type: 'lora.training_completed',
        title: 'LoRA Training Complete!',
        body: `${characterName}'s AI model is ready. Your images will now have 95%+ face consistency.`,
        href: `/influencer/${dto.characterId}`,
        metadata: {
          loraModelId: loraModel.id,
          characterId: dto.characterId,
          characterName,
          triggerWord: loraModel.triggerWord,
          trainingSteps: dto.trainingSteps,
          trainingTimeSeconds: dto.trainingTimeSeconds,
        },
      });

      this.logger.log(
        `LoRA training completed for character ${dto.characterId}, model ${loraModel.id}`
      );

      return {
        success: true,
        message: 'Training completion recorded',
        loraModelId: loraModel.id,
      };
    } else if (dto.status === 'failed') {
      // Check if refund is needed
      const needsRefund =
        loraModel.creditsCharged != null &&
        loraModel.creditsCharged > 0 &&
        loraModel.creditsRefunded == null;

      let creditsRefunded = 0;

      if (needsRefund) {
        // Issue refund
        await this.creditService.refundCredits(
          loraModel.userId,
          loraModel.creditsCharged!,
          `LoRA training failed: ${dto.error || 'Unknown error'}`,
          loraModel.id
        );
        creditsRefunded = loraModel.creditsCharged!;
      }

      // Mark training as failed with refund info
      await loraRepository.markTrainingFailedWithRefund(
        loraModel.id,
        dto.error || 'Training failed',
        creditsRefunded
      );

      // Send failure notification
      await notificationsRepo.create({
        userId: loraModel.userId,
        type: 'lora.training_failed',
        title: 'LoRA Training Failed',
        body: needsRefund
          ? `Training for ${characterName} failed. ${creditsRefunded.toLocaleString()} credits have been refunded.`
          : `Training for ${characterName} failed.`,
        href: `/influencer/${dto.characterId}`,
        metadata: {
          loraModelId: loraModel.id,
          characterId: dto.characterId,
          characterName,
          error: dto.error,
          creditsRefunded,
        },
      });

      this.logger.log(
        `LoRA training failed for character ${dto.characterId}, model ${loraModel.id}, refunded ${creditsRefunded} credits`
      );

      return {
        success: true,
        message: 'Training failure recorded',
        loraModelId: loraModel.id,
        creditsRefunded,
      };
    }

    return { success: false, message: 'Invalid status' };
  }
}
