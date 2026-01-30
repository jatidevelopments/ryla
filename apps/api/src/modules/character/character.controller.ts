import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CharacterService } from './services/character.service';
import { BaseImageGenerationService } from '../image/services/base-image-generation.service';
import { CharacterSheetService } from '../image/services/character-sheet.service';
import { ProfilePictureSetService } from '../image/services/profile-picture-set.service';
import { CreditManagementService } from '../credits/services/credit-management.service';
import { GenerateBaseImagesDto } from './dto/generate-base-images.dto';
import { GenerateCharacterSheetDto } from './dto/generate-character-sheet.dto';
import { GenerateProfilePictureSetDto } from '../image/dto/req/generate-profile-picture-set.dto';
import { RegenerateProfilePictureDto } from '../image/dto/req/regenerate-profile-picture.dto';
import { TrainLoraDto } from './dto/train-lora.dto';
import { calculateLoraTrainingCost, type FeatureId } from '@ryla/shared';
import { LoraTrainingService } from '@ryla/business/services/lora-training.service';
import {
  LoraModelsRepository,
  NotificationsRepository,
  ImagesRepository,
} from '@ryla/data';
import { eq, and } from 'drizzle-orm';
import * as schema from '@ryla/data/schema';
import type { CharacterConfig } from '@ryla/data/schema';

@ApiTags('Characters')
@Controller('characters')
@UseGuards(JwtAccessGuard)
@ApiBearerAuth()
export class CharacterController {
  private readonly loraTrainingService: LoraTrainingService;

  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: any, // NodePgDatabase<typeof schema>
    @Inject(CharacterService)
    private readonly characterService: CharacterService,
    @Inject(BaseImageGenerationService)
    private readonly baseImageGenerationService: BaseImageGenerationService,
    @Inject(CharacterSheetService)
    private readonly characterSheetService: CharacterSheetService,
    @Inject(ProfilePictureSetService)
    private readonly profilePictureSetService: ProfilePictureSetService,
    @Inject(CreditManagementService)
    private readonly creditService: CreditManagementService
  ) {
    // Initialize LoRA training service with repository
    const loraRepository = new LoraModelsRepository(this.db);
    this.loraTrainingService = new LoraTrainingService(loraRepository);
  }

  /**
   * Map generation mode to feature ID for credit pricing
   * Uses feature IDs from @ryla/shared/credits pricing
   */
  private getFeatureId(
    generationMode?: 'fast' | 'consistent',
    type:
      | 'profile_picture'
      | 'base_image'
      | 'character_sheet' = 'profile_picture'
  ): FeatureId {
    // Profile picture sets use fast (z-image) or consistent (PuLID) mode
    if (type === 'profile_picture') {
      return generationMode === 'consistent'
        ? 'profile_set_quality' // PuLID for face consistency
        : 'profile_set_fast'; // Z-Image for speed
    }
    // Base images use fast generation (3 images)
    if (type === 'base_image') {
      return 'base_images';
    }
    // Character sheets use quality generation (PuLID)
    return 'profile_set_quality';
  }

  @Get('my')
  @ApiOperation({ summary: 'Get all characters for the current user' })
  async getMyCharacters(@CurrentUser() user: IJwtPayload) {
    return this.characterService.findAll(user.userId);
  }

  @Post('generate-base-images')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Generate 3 base image options from wizard config. Credits are deducted per image (unless skipCreditDeduction=true).',
  })
  async generateBaseImages(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: GenerateBaseImagesDto
  ) {
    const imageCount = 3; // Base images always generate 3 options
    const featureId = this.getFeatureId(undefined, 'base_image');

    // Calculate credit cost (needed for response even if skipping deduction)
    const _creditCost = (imageCount * 80) / 3; // base_images feature is 80 credits for 3 images (reserved for future use)
    const totalCreditCost = 80; // Fixed cost for base images

    let creditResult:
      | { creditsDeducted: number; balanceAfter: number }
      | undefined;

    // Check and deduct credits upfront (unless skipCreditDeduction is true)
    if (!dto.skipCreditDeduction) {
      creditResult = await this.creditService.deductCredits(
        user.userId,
        featureId,
        imageCount,
        undefined,
        `Base image generation (${dto.workflowId ?? 'default'})`
      );
    }

    const result = await this.baseImageGenerationService.generateBaseImages({
      appearance: dto.appearance,
      identity: dto.identity,
      nsfwEnabled: dto.nsfwEnabled,
      workflowId: dto.workflowId,
      seed: dto.seed,
      steps: dto.steps,
      cfg: dto.cfg,
      width: dto.width,
      height: dto.height,
      promptInput: dto.promptInput,
      promptEnhance: dto.promptEnhance,
      idempotencyKey: dto.idempotencyKey,
    });

    // Build response based on whether credits were deducted or skipped
    if (dto.skipCreditDeduction) {
      return {
        jobId: result.jobId,
        allJobIds: result.allJobIds || [result.jobId],
        userId: user.userId,
        status: 'queued',
        message: 'Base image generation started (3 images, credits deferred)',
        creditSkipped: true,
        creditsToBeCharged: totalCreditCost,
      };
    }

    return {
      jobId: result.jobId,
      allJobIds: result.allJobIds || [result.jobId],
      userId: user.userId,
      status: 'queued',
      message: 'Base image generation started (3 images)',
      creditsDeducted: creditResult!.creditsDeducted,
      creditBalance: creditResult!.balanceAfter,
    };
  }

  @Get('base-images/:jobId')
  @ApiOperation({
    summary: 'Get base image generation results (single job or batch)',
  })
  async getBaseImageResults(
    @CurrentUser() user: IJwtPayload,
    @Param('jobId') jobId: string,
    @Query('allJobIds') allJobIds?: string // Comma-separated list of all job IDs for batch
  ) {
    // TODO: Verify job ownership via DB lookup when jobs are persisted
    // Pass userId for proper S3 storage organization

    // If allJobIds query param is provided, use batch method
    if (allJobIds) {
      const jobIds = allJobIds.split(',').filter((id) => id.trim());
      const results = await this.baseImageGenerationService.getBatchJobResults(
        jobIds,
        user.userId
      );
      return {
        status: results.status,
        images: results.images,
        error: results.error,
      };
    }

    // Otherwise, get single job results
    const results = await this.baseImageGenerationService.getJobResults(
      jobId,
      user.userId
    );

    return {
      status: results.status,
      images: results.images,
    };
  }

  @Post('generate-character-sheet')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate character sheet (7-10 variations) from base image',
    description:
      'This runs in the background after character creation. Credits are deducted per variation.',
  })
  async generateCharacterSheet(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: GenerateCharacterSheetDto
  ) {
    const featureId = this.getFeatureId('consistent', 'character_sheet');

    // Check and deduct credits upfront (flat cost per sheet, not per variation)
    const creditResult = await this.creditService.deductCredits(
      user.userId,
      featureId,
      1, // Flat cost per character sheet
      dto.characterId,
      `Character sheet generation${dto.nsfwEnabled ? ' (with NSFW)' : ''}`
    );

    const result = await this.characterSheetService.generateCharacterSheet({
      baseImageUrl: dto.baseImageUrl,
      characterId: dto.characterId,
      nsfwEnabled: dto.nsfwEnabled,
    });

    return {
      jobId: result.jobId,
      userId: user.userId,
      status: 'queued',
      message: 'Character sheet generation started',
      variations: result.variations,
      creditsDeducted: creditResult.creditsDeducted,
      creditBalance: creditResult.balanceAfter,
    };
  }

  @Get('character-sheet/:jobId')
  @ApiOperation({ summary: 'Get character sheet generation results' })
  async getCharacterSheetResults(
    @CurrentUser() user: IJwtPayload,
    @Param('jobId') jobId: string
  ) {
    // TODO: Verify job ownership via DB lookup when jobs are persisted
    // Pass userId for proper S3 storage organization
    const results = await this.characterSheetService.getJobResults(
      jobId,
      user.userId
    );

    return {
      status: results.status,
      images: results.images,
    };
  }

  @Post('generate-profile-picture-set')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate profile picture set (7-10 images) from base image',
    description:
      'Generates a set of profile pictures with different positions using PuLID for face consistency. Credits are deducted per image.',
  })
  async generateProfilePictureSet(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: GenerateProfilePictureSetDto
  ) {
    // Profile set is a FLAT cost (1 set = 200 or 300 credits), not per-image
    // NSFW adds extra cost if enabled
    const featureId = this.getFeatureId(dto.generationMode, 'profile_picture');

    // Base cost is flat per set (count=1), plus NSFW addon if enabled
    const nsfwExtraCost = dto.nsfwEnabled ? 50 : 0;

    // Check and deduct credits upfront (count=1 for flat set cost)
    const creditResult = await this.creditService.deductCredits(
      user.userId,
      featureId,
      1, // Flat cost per set, not per image
      dto.characterId,
      `Profile picture set (${dto.setId}, ${dto.generationMode ?? 'fast'} mode${
        dto.nsfwEnabled ? ' + NSFW' : ''
      })`
    );

    // If NSFW enabled, deduct the extra cost
    if (nsfwExtraCost > 0) {
      await this.creditService.deductCreditsRaw(
        user.userId,
        nsfwExtraCost,
        dto.characterId,
        `NSFW addon for profile picture set`
      );
    }

    // Fetch character config if characterId is provided
    let characterConfig: CharacterConfig | undefined;
    let characterName: string | undefined;
    if (dto.characterId) {
      const character = await this.db.query.characters.findFirst({
        where: and(
          eq(schema.characters.id, dto.characterId),
          eq(schema.characters.userId, user.userId)
        ),
        columns: { config: true, name: true },
      });
      if (character) {
        characterConfig = character.config as CharacterConfig;
        characterName = character.name;
      }
    }

    // Always use authenticated user's ID for profile picture generation
    // This ensures generation jobs can be looked up correctly in getJobResult
    const result =
      await this.profilePictureSetService.generateProfilePictureSet({
        baseImageUrl: dto.baseImageUrl,
        characterId: dto.characterId,
        userId: user.userId, // Always use authenticated user's ID
        characterConfig, // Pass full character config with all wizard options
        characterName, // Pass character name for DNA
        setId: dto.setId,
        nsfwEnabled: dto.nsfwEnabled,
        generationMode: dto.generationMode,
        workflowId: dto.workflowId,
        steps: dto.steps,
        cfg: dto.cfg,
        width: dto.width,
        height: dto.height,
      });

    // Calculate total credits deducted (base + NSFW addon)
    const totalCreditsDeducted = creditResult.creditsDeducted + nsfwExtraCost;

    return {
      jobId: result.jobId,
      allJobIds: result.allJobIds || [result.jobId],
      jobPositions: result.jobPositions || [],
      userId: dto.userId || user.userId,
      status: 'queued',
      message: 'Profile picture set generation started',
      imageCount: result.allJobIds?.length || 0,
      creditsDeducted: totalCreditsDeducted,
      creditBalance: creditResult.balanceAfter - nsfwExtraCost,
    };
  }

  @Get('profile-picture-set/:jobId')
  @ApiOperation({
    summary: 'Get profile picture set generation results (single job or batch)',
  })
  async getProfilePictureSetResults(
    @CurrentUser() user: IJwtPayload,
    @Param('jobId') jobId: string,
    @Query('allJobIds') allJobIds?: string // Comma-separated list of all job IDs for batch
  ) {
    // If allJobIds query param is provided, poll all jobs individually
    if (allJobIds) {
      const jobIds = allJobIds.split(',').filter((id) => id.trim());
      const results = await Promise.allSettled(
        jobIds.map((id) =>
          this.profilePictureSetService.getJobResult(id, user.userId)
        )
      );

      const allImages: Array<{
        id: string;
        url: string;
        thumbnailUrl: string;
        s3Key?: string;
      }> = [];

      let allCompleted = true;
      let anyInProgress = false;
      let hasError = false;
      let errorMessage: string | undefined;

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'fulfilled') {
          const jobResult = result.value;
          if (jobResult.status === 'completed' && jobResult.images) {
            allImages.push(...jobResult.images);
          } else if (
            jobResult.status === 'in_progress' ||
            jobResult.status === 'queued'
          ) {
            allCompleted = false;
            anyInProgress = true;
          } else if (jobResult.status === 'failed') {
            allCompleted = false;
            hasError = true;
            if (jobResult.error) {
              errorMessage = jobResult.error;
            }
          }
        } else {
          allCompleted = false;
          hasError = true;
          errorMessage =
            (result.reason instanceof Error
              ? result.reason.message
              : undefined) || 'One or more jobs failed';
        }
      }

      return {
        status:
          hasError && allImages.length === 0
            ? 'failed'
            : allCompleted
            ? 'completed'
            : anyInProgress
            ? 'in_progress'
            : 'partial',
        images: allImages,
        error: hasError ? errorMessage : undefined,
      };
    }

    // Otherwise, get single job result
    const result = await this.profilePictureSetService.getJobResult(
      jobId,
      user.userId
    );
    return {
      status: result.status,
      images: result.images,
      error: result.error,
    };
  }

  @Post('regenerate-profile-picture')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Regenerate a single profile picture with optional prompt override. Deducts 1 credit.',
  })
  async regenerateProfilePicture(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: RegenerateProfilePictureDto
  ) {
    const featureId = this.getFeatureId(dto.generationMode, 'profile_picture');

    // Check and deduct credits for single image
    const creditResult = await this.creditService.deductCredits(
      user.userId,
      featureId,
      1, // Single image regeneration
      undefined,
      `Profile picture regeneration (${dto.positionId})`
    );

    const result = await this.profilePictureSetService.regenerateProfilePicture(
      {
        baseImageUrl: dto.baseImageUrl,
        positionId: dto.positionId,
        prompt: dto.prompt,
        nsfwEnabled: dto.nsfwEnabled,
        setId: dto.setId || 'classic-influencer',
        generationMode: dto.generationMode,
        workflowId: dto.workflowId,
        steps: dto.steps,
        cfg: dto.cfg,
        width: dto.width,
        height: dto.height,
      }
    );

    return {
      jobId: result.jobId,
      userId: dto.userId || user.userId,
      status: 'queued',
      message: 'Profile picture regeneration started',
      creditsDeducted: creditResult.creditsDeducted,
      creditBalance: creditResult.balanceAfter,
    };
  }

  // ============================================================
  // LoRA Training Endpoints
  // ============================================================

  @Get('lora-training-cost')
  @ApiOperation({
    summary: 'Get LoRA training cost estimate',
    description:
      'Calculate credit cost for LoRA training based on number of images.',
  })
  getLoraTrainingCost(@Query('imageCount') imageCountStr: string) {
    const imageCount = parseInt(imageCountStr, 10) || 3;
    const validImageCount = Math.max(3, Math.min(50, imageCount)); // 3-50 images

    const totalCredits = calculateLoraTrainingCost('flux', validImageCount);

    return {
      imageCount: validImageCount,
      model: 'flux',
      baseCost: 25000, // lora_training_flux_base
      perImageCost: 1000, // lora_training_flux_per_image
      totalCredits,
      estimatedMinutes: 5 + Math.ceil(validImageCount / 5), // Rough estimate
    };
  }

  @Post('train-lora')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Start LoRA training for a character',
    description:
      'Trains a custom LoRA model for character consistency. Requires at least 3 images. Training runs in background (5-10 minutes).',
  })
  async trainLora(@CurrentUser() user: IJwtPayload, @Body() dto: TrainLoraDto) {
    // Verify character ownership
    const character = await this.db.query.characters.findFirst({
      where: and(
        eq(schema.characters.id, dto.characterId),
        eq(schema.characters.userId, user.userId)
      ),
      columns: { id: true, name: true },
    });

    if (!character) {
      throw new NotFoundException('Character not found or access denied');
    }

    // Calculate LoRA training cost (base + per-image)
    // Using 'flux' model since we're training on Modal with FLUX.1-dev
    const totalCredits = calculateLoraTrainingCost(
      'flux',
      dto.imageUrls.length
    );

    // Deduct credits for LoRA training using base feature ID
    // The total is pre-calculated, we pass count=1 to avoid double-multiplying
    const creditResult = await this.creditService.deductCreditsRaw(
      user.userId,
      totalCredits,
      dto.characterId,
      `LoRA training for ${character.name} (${dto.imageUrls.length} images)`
    );

    const result = await this.loraTrainingService.startTraining({
      characterId: dto.characterId,
      userId: user.userId,
      triggerWord: dto.triggerWord,
      imageUrls: dto.imageUrls,
      creditsCharged: totalCredits,
      config: {
        maxTrainSteps: dto.maxTrainSteps,
        rank: dto.rank,
        resolution: dto.resolution,
      },
    });

    if (result.status === 'error') {
      // Refund credits on immediate failure
      await this.creditService.refundCredits(
        user.userId,
        totalCredits,
        `LoRA training failed to start: ${result.error}`,
        result.loraModelId
      );

      // Mark as failed with refund
      if (result.loraModelId) {
        await this.loraTrainingService.markFailedWithRefund(
          result.loraModelId,
          result.error || 'Failed to start training',
          totalCredits
        );
      }

      throw new Error(result.error || 'Failed to start LoRA training');
    }

    // Send training started notification
    try {
      const notificationsRepo = new NotificationsRepository(this.db);
      await notificationsRepo.create({
        userId: user.userId,
        type: 'lora.training_started',
        title: 'LoRA Training Started',
        body: `Training model for ${character.name}... This will take 5-10 minutes. We'll notify you when it's ready!`,
        href: `/influencer/${dto.characterId}/settings`,
        metadata: {
          characterId: dto.characterId,
          loraModelId: result.loraModelId,
          imageCount: dto.imageUrls.length,
        },
      });
    } catch (notifError) {
      // Don't fail the training if notification fails
      console.error(
        'Failed to send training started notification:',
        notifError
      );
    }

    return {
      jobId: result.jobId,
      loraModelId: result.loraModelId,
      callId: result.callId,
      characterId: dto.characterId,
      characterName: character.name,
      status: 'training',
      message: 'LoRA training started. This will take 5-10 minutes.',
      imageCount: dto.imageUrls.length,
      estimatedMinutes: 5,
      creditsDeducted: creditResult.creditsDeducted,
      creditBalance: creditResult.balanceAfter,
    };
  }

  @Get('lora-status/:jobId')
  @ApiOperation({
    summary: 'Get LoRA training status',
    description: 'Check the status of a LoRA training job.',
  })
  async getLoraTrainingStatus(
    @CurrentUser() user: IJwtPayload,
    @Param('jobId') jobId: string
  ) {
    const result = await this.loraTrainingService.getTrainingStatus(jobId);
    const notificationsRepo = new NotificationsRepository(this.db);

    // Check if refund is needed for failed training
    let refundIssued = false;
    let creditsRefunded = 0;
    let notificationSent = false;

    // Get LoRA model to check if notification already sent
    let loraModel = result.loraModelId
      ? await this.loraTrainingService.getLoraById(result.loraModelId)
      : null;

    // Get character info for notification
    let characterName = 'your character';
    if (loraModel?.characterId) {
      const character = await this.db.query.characters.findFirst({
        where: eq(schema.characters.id, loraModel.characterId),
        columns: { name: true },
      });
      if (character) {
        characterName = character.name;
      }
    }

    if (result.status === 'completed' && result.loraModelId && loraModel) {
      // Training completed successfully - send notification if not already sent
      // We use the trainingCompletedAt field to determine if notification was sent
      // (If it was just updated, it means we're processing completion now)
      const wasJustCompleted =
        loraModel.trainingCompletedAt &&
        Date.now() - new Date(loraModel.trainingCompletedAt).getTime() < 60000; // Within last minute

      if (wasJustCompleted) {
        await notificationsRepo.create({
          userId: user.userId,
          type: 'lora.training_completed',
          title: 'LoRA Training Complete!',
          body: `${characterName}'s AI model is ready. Your images will now have 95%+ face consistency.`,
          href: `/influencer/${loraModel.characterId}`,
          metadata: {
            loraModelId: result.loraModelId,
            characterId: loraModel.characterId,
            characterName,
            triggerWord: loraModel.triggerWord,
            trainingSteps: result.result?.trainingSteps,
            trainingTimeSeconds: result.result?.trainingTimeSeconds,
          },
        });
        notificationSent = true;
      }
    }

    if (result.status === 'error' && result.loraModelId) {
      const refundCheck = await this.loraTrainingService.needsRefund(
        result.loraModelId
      );

      if (refundCheck.needsRefund && refundCheck.userId === user.userId) {
        // Issue refund
        await this.creditService.refundCredits(
          user.userId,
          refundCheck.creditsToRefund,
          `LoRA training failed: ${result.error || 'Unknown error'}`,
          result.loraModelId
        );

        // Mark as refunded
        await this.loraTrainingService.markFailedWithRefund(
          result.loraModelId,
          result.error || 'Training failed',
          refundCheck.creditsToRefund
        );

        refundIssued = true;
        creditsRefunded = refundCheck.creditsToRefund;

        // Send failure notification with refund info
        await notificationsRepo.create({
          userId: user.userId,
          type: 'lora.training_failed',
          title: 'LoRA Training Failed',
          body: `Training for ${characterName} failed. ${refundCheck.creditsToRefund.toLocaleString()} credits have been refunded.`,
          href: `/influencer/${loraModel?.characterId}`,
          metadata: {
            loraModelId: result.loraModelId,
            characterId: loraModel?.characterId,
            characterName,
            error: result.error,
            creditsRefunded: refundCheck.creditsToRefund,
          },
        });
        notificationSent = true;
      }
    }

    return {
      jobId,
      loraModelId: result.loraModelId,
      status: result.status,
      result: result.result,
      error: result.error,
      message: result.message,
      refundIssued,
      creditsRefunded,
      notificationSent,
    };
  }

  @Get('my-loras')
  @ApiOperation({
    summary: 'Get all LoRA models for current user',
    description: 'Returns all LoRA models trained for the current user.',
  })
  async getMyLoras(@CurrentUser() user: IJwtPayload) {
    const loras = await this.loraTrainingService.getLorasForUser(user.userId);
    return {
      loras: loras.map((lora) => ({
        id: lora.id,
        characterId: lora.characterId,
        status: lora.status,
        triggerWord: lora.triggerWord,
        modelPath: lora.modelPath,
        trainingSteps: lora.trainingSteps,
        trainingDurationMs: lora.trainingDurationMs,
        creditsCharged: lora.creditsCharged,
        creditsRefunded: lora.creditsRefunded,
        errorMessage: lora.errorMessage,
        createdAt: lora.createdAt,
        completedAt: lora.trainingCompletedAt,
      })),
    };
  }

  @Get(':characterId/lora')
  @ApiOperation({
    summary: 'Get LoRA model for a character',
    description: 'Returns the ready LoRA model for a specific character.',
  })
  async getCharacterLora(
    @CurrentUser() user: IJwtPayload,
    @Param('characterId') characterId: string
  ) {
    // Verify character ownership
    const character = await this.db.query.characters.findFirst({
      where: and(
        eq(schema.characters.id, characterId),
        eq(schema.characters.userId, user.userId)
      ),
      columns: { id: true },
    });

    if (!character) {
      throw new NotFoundException('Character not found or access denied');
    }

    const lora = await this.loraTrainingService.getLoraForCharacter(
      characterId
    );

    if (!lora) {
      return { lora: null, message: 'No LoRA model found for this character' };
    }

    return {
      lora: {
        id: lora.id,
        status: lora.status,
        triggerWord: lora.triggerWord,
        modelPath: lora.modelPath,
        trainingSteps: lora.trainingSteps,
        trainingDurationMs: lora.trainingDurationMs,
        createdAt: lora.createdAt,
        completedAt: lora.trainingCompletedAt,
      },
    };
  }

  @Get(':characterId/lora/available-images')
  @ApiOperation({
    summary: 'Get available images for LoRA training',
    description:
      'Returns completed images for a character that can be used for LoRA training. Images are sorted by liked status (liked first) then by creation date.',
  })
  async getAvailableTrainingImages(
    @CurrentUser() user: IJwtPayload,
    @Param('characterId') characterId: string
  ) {
    // Verify character ownership
    const character = await this.db.query.characters.findFirst({
      where: and(
        eq(schema.characters.id, characterId),
        eq(schema.characters.userId, user.userId)
      ),
      columns: { id: true, name: true },
    });

    if (!character) {
      throw new NotFoundException('Character not found or access denied');
    }

    const imagesRepository = new ImagesRepository(this.db);
    const result = await imagesRepository.getAvailableForTraining({
      characterId,
      userId: user.userId,
      limit: 50,
    });

    const MIN_IMAGES_FOR_TRAINING = 5;

    return {
      images: result.images.map((img) => ({
        id: img.id,
        url: img.s3Url,
        thumbnailUrl: img.thumbnailUrl || img.s3Url,
        liked: img.liked ?? false,
        createdAt: img.createdAt,
      })),
      likedCount: result.likedCount,
      totalCount: result.totalCount,
      canTrain: result.totalCount >= MIN_IMAGES_FOR_TRAINING,
      minImagesRequired: MIN_IMAGES_FOR_TRAINING,
      message:
        result.totalCount < MIN_IMAGES_FOR_TRAINING
          ? `Need at least ${MIN_IMAGES_FOR_TRAINING} images for training. You have ${result.totalCount}.`
          : null,
    };
  }
}
