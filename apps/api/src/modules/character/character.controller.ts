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
import type { FeatureId } from '@ryla/shared';
import { getLoraTrainingService } from '@ryla/business/services/lora-training.service';
import { eq, and } from 'drizzle-orm';
import * as schema from '@ryla/data/schema';
import type { CharacterConfig } from '@ryla/data/schema';

@ApiTags('Characters')
@Controller('characters')
@UseGuards(JwtAccessGuard)
@ApiBearerAuth()
export class CharacterController {
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
  ) {}

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

    // TODO: Add credit deduction for LoRA training
    // const creditResult = await this.creditService.deductCredits(
    //   user.userId,
    //   'lora_training',
    //   1,
    //   dto.characterId,
    //   `LoRA training for ${character.name}`,
    // );

    const loraService = getLoraTrainingService();
    const result = await loraService.startTraining({
      characterId: dto.characterId,
      triggerWord: dto.triggerWord,
      imageUrls: dto.imageUrls,
      config: {
        maxTrainSteps: dto.maxTrainSteps,
        rank: dto.rank,
        resolution: dto.resolution,
      },
    });

    if (result.status === 'error') {
      throw new Error(result.error || 'Failed to start LoRA training');
    }

    // TODO: Store training job in database for tracking
    // await this.db.insert(schema.loraTrainingJobs).values({
    //   id: result.jobId,
    //   characterId: dto.characterId,
    //   userId: user.userId,
    //   callId: result.callId,
    //   status: 'training',
    //   triggerWord: dto.triggerWord,
    //   imageCount: dto.imageUrls.length,
    //   createdAt: new Date(),
    // });

    return {
      jobId: result.jobId,
      callId: result.callId,
      characterId: dto.characterId,
      characterName: character.name,
      status: 'training',
      message: 'LoRA training started. This will take 5-10 minutes.',
      imageCount: dto.imageUrls.length,
      estimatedMinutes: 5,
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
    // TODO: Verify job ownership via database
    // const job = await this.db.query.loraTrainingJobs.findFirst({
    //   where: and(
    //     eq(schema.loraTrainingJobs.id, jobId),
    //     eq(schema.loraTrainingJobs.userId, user.userId)
    //   ),
    // });

    const loraService = getLoraTrainingService();
    const result = await loraService.getTrainingStatus(jobId);

    return {
      jobId,
      status: result.status,
      result: result.result,
      error: result.error,
      message: result.message,
    };
  }
}
