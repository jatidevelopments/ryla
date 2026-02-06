import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ImageGenerationService } from '@ryla/business';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { GenerateBaseImagesDto } from './dto/req/generate-base-images.dto';
import { GenerateFaceSwapDto } from './dto/req/generate-face-swap.dto';
import { GenerateCharacterSheetDto } from './dto/req/generate-character-sheet.dto';
import { InpaintEditDto } from './dto/req/inpaint-edit.dto';
import { GenerateStudioImagesDto } from './dto/req/generate-studio-images.dto';
import { GenerateStudioVideoDto } from './dto/req/generate-studio-video.dto';
import { EditFaceSwapDto } from './dto/req/edit-face-swap.dto';
import { UpscaleImageDto } from './dto/req/upscale-image.dto';
import { BaseImageGenerationService } from './services/base-image-generation.service';
import { ComfyUIJobRunnerAdapter } from './services/comfyui-job-runner.adapter';
import { InpaintEditService } from './services/inpaint-edit.service';
import { StudioGenerationService } from './services/studio-generation.service';
import { ComfyUIResultsService } from './services/comfyui-results.service';
import { CreditManagementService } from '../credits/services/credit-management.service';
import { calculateFalModelCredits } from './services/fal-image.service';
import { getFeatureCost, type FeatureId } from '@ryla/shared';

@ApiTags('Images')
@Controller('image')
@UseGuards(JwtAccessGuard)
@ApiBearerAuth()
export class ImageController {
  constructor(
    @Inject(ImageGenerationService)
    private readonly imageGenerationService: ImageGenerationService,
    @Inject(BaseImageGenerationService)
    private readonly baseImageService: BaseImageGenerationService,
    @Inject(ComfyUIJobRunnerAdapter)
    private readonly comfyuiAdapter: ComfyUIJobRunnerAdapter,
    @Inject(InpaintEditService)
    private readonly inpaintEditService: InpaintEditService,
    @Inject(StudioGenerationService)
    private readonly studioGenerationService: StudioGenerationService,
    @Inject(ComfyUIResultsService)
    private readonly comfyuiResultsService: ComfyUIResultsService,
    @Inject(CreditManagementService)
    private readonly creditService: CreditManagementService
  ) {}

  /**
   * Start base image generation for authenticated user.
   * Uses ComfyUI pod with workflow factory for instant generation.
   * Returns internal jobId + workflow used.
   */
  @Post('generate/base')
  @ApiOperation({ summary: 'Generate base image(s) from character config' })
  @ApiResponse({ status: 200, description: 'Job queued successfully' })
  public async generateBaseImages(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: GenerateBaseImagesDto
  ) {
    // Use the new ComfyUI-based service with workflow factory
    const result = await this.baseImageService.generateBaseImages({
      appearance: dto.appearance,
      identity: dto.identity,
      nsfwEnabled: dto.nsfwEnabled,
      workflowId: dto.workflowId,
      seed: dto.seed,
      promptInput: dto.promptInput,
      promptEnhance: dto.promptEnhance,
    });

    return {
      jobId: result.jobId,
      userId: user.userId,
      workflowUsed: result.workflowUsed,
      status: 'queued',
      message: 'Base image generation started via ComfyUI pod',
    };
  }

  @Post('generate/face-swap')
  @ApiOperation({ summary: 'Generate face swap image' })
  public async generateFaceSwap(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: GenerateFaceSwapDto
  ) {
    return this.imageGenerationService.startFaceSwap({
      ...dto,
      userId: user.userId,
    });
  }

  @Post('generate/character-sheet')
  @ApiOperation({ summary: 'Generate character sheet (multiple angles)' })
  public async generateCharacterSheet(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: GenerateCharacterSheetDto
  ) {
    return this.imageGenerationService.startCharacterSheet({
      ...dto,
      userId: user.userId,
    });
  }

  @Post('edit/inpaint')
  @ApiOperation({
    summary: 'Edit an existing image asset via inpainting (Flux Fill)',
  })
  public async inpaintEdit(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: InpaintEditDto
  ) {
    return this.inpaintEditService.startInpaintEdit({
      userId: user.userId,
      characterId: dto.characterId,
      sourceImageId: dto.sourceImageId,
      prompt: dto.prompt,
      negativePrompt: dto.negativePrompt,
      maskedImageBase64Png: dto.maskedImageBase64Png,
      seed: dto.seed,
    });
  }

  @Post('generate/studio')
  @ApiOperation({ summary: 'Generate Studio image assets (no posts/captions)' })
  public async generateStudioImages(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: GenerateStudioImagesDto
  ) {
    // Calculate image dimensions
    const aspectRatioToSize = (ratio: '1:1' | '9:16' | '2:3') => {
      switch (ratio) {
        case '1:1':
          return { width: 1024, height: 1024 };
        case '9:16':
          return { width: 832, height: 1472 };
        case '2:3':
          return { width: 896, height: 1344 };
      }
    };
    const { width, height } = aspectRatioToSize(dto.aspectRatio);

    // Calculate total credits needed
    let totalCredits = 0;
    // Provider selection: LoRA/reference require Modal, NSFW prefers Modal
    const hasLora = dto.useLora;
    const hasReference = !!dto.referenceImageUrl;
    const provider = hasLora || hasReference ? 'modal' : (dto.nsfw ? 'modal' : dto.modelProvider ?? 'modal');

    if (provider === 'fal' && dto.modelId) {
      // Fal models: dynamic pricing based on model and image size
      const creditsPerImage = calculateFalModelCredits(
        dto.modelId,
        width,
        height
      );
      totalCredits = creditsPerImage * dto.count;
    } else {
      // ComfyUI: use fixed feature-based pricing
      // qualityMode removed (EP-045) - always use studio_fast
      const featureId: FeatureId = 'studio_fast';
      totalCredits = getFeatureCost(featureId, dto.count);
    }

    // Check and deduct credits upfront
    if (provider === 'fal' && dto.modelId) {
      // For Fal models, use raw credit deduction since pricing is dynamic
      await this.creditService.deductCreditsRaw(
        user.userId,
        totalCredits,
        undefined,
        `Studio generation: ${dto.modelId} (${dto.count} images)`
      );
    } else {
      // For ComfyUI, use feature-based deduction
      // qualityMode removed (EP-045) - always use studio_fast
      const featureId: FeatureId = 'studio_fast';
      await this.creditService.deductCredits(user.userId, featureId, dto.count);
    }

    return this.studioGenerationService.startStudioGeneration({
      userId: user.userId,
      additionalDetails: dto.additionalDetails,
      characterId: dto.characterId,
      scene: dto.scene,
      environment: dto.environment,
      outfit: dto.outfit,
      poseId: dto.poseId,
      lighting: dto.lighting,
      expression: dto.expression,
      aspectRatio: dto.aspectRatio,
      // qualityMode removed - EP-045
      count: dto.count,
      nsfw: dto.nsfw,
      promptEnhance: dto.promptEnhance,
      seed: dto.seed,
      modelProvider: dto.modelProvider,
      modelId: dto.modelId,
      // LoRA support for character consistency
      useLora: dto.useLora,
      loraId: dto.loraId,
      loraStrength: dto.loraStrength,
      // Reference image support for face consistency
      referenceImageUrl: dto.referenceImageUrl,
      referenceStrength: dto.referenceStrength,
      referenceMethod: dto.referenceMethod,
    });
  }

  /**
   * Generate video using character appearance
   * Uses Wan 2.6 text-to-video via Modal.com
   */
  @Post('video/generate/studio')
  @ApiOperation({ summary: 'Generate Studio video from character' })
  public async generateStudioVideo(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: GenerateStudioVideoDto
  ) {
    // Calculate video credits based on duration
    const VIDEO_DURATION_CREDITS: Record<number, number> = {
      2: 50,
      4: 100,
      6: 150,
      8: 200,
    };
    const creditsNeeded = VIDEO_DURATION_CREDITS[dto.duration] || 100;

    // Deduct credits upfront
    await this.creditService.deductCreditsRaw(
      user.userId,
      creditsNeeded,
      undefined,
      `Video generation: ${dto.duration}s video`
    );

    return this.studioGenerationService.startVideoGeneration({
      userId: user.userId,
      characterId: dto.characterId,
      prompt: dto.prompt,
      duration: dto.duration,
      fps: dto.fps ?? 24,
      aspectRatio: dto.aspectRatio,
      nsfw: dto.nsfw,
      seed: dto.seed,
      useLora: dto.useLora ?? true,
    });
  }

  /**
   * Apply face swap to existing image or video
   * Uses ReActor face swap via Modal.com
   */
  @Post('edit/face-swap')
  @ApiOperation({ summary: 'Apply face swap to image or video' })
  public async editFaceSwap(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: EditFaceSwapDto
  ) {
    // Face swap credits (fixed cost)
    const creditsNeeded = dto.sourceVideoId ? 80 : 30; // Video costs more

    // Deduct credits upfront
    await this.creditService.deductCreditsRaw(
      user.userId,
      creditsNeeded,
      undefined,
      dto.sourceVideoId ? 'Video face swap' : 'Image face swap'
    );

    return this.studioGenerationService.startFaceSwapEdit({
      userId: user.userId,
      characterId: dto.characterId,
      sourceImageId: dto.sourceImageId,
      sourceVideoId: dto.sourceVideoId,
      nsfw: dto.nsfw,
      restoreFace: dto.restoreFace ?? true,
    });
  }

  @Post('upscale')
  @ApiOperation({
    summary: 'Upscale an existing image using Fal.ai upscaling models',
  })
  public async upscaleImage(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: UpscaleImageDto
  ) {
    // Calculate credits needed (using default model if not specified)
    const modelId = dto.modelId ?? 'fal-ai/clarity-upscaler';
    // For upscaling, we estimate based on 2x upscale (roughly 4x the megapixels)
    // Use a fixed cost estimate since we don't know the exact output size
    const estimatedCredits = 20; // Fixed cost for upscaling (can be refined later)

    // Check and deduct credits upfront
    await this.creditService.deductCreditsRaw(
      user.userId,
      estimatedCredits,
      undefined,
      `Image upscaling: ${modelId}`
    );

    return this.studioGenerationService.startUpscale({
      userId: user.userId,
      imageId: dto.imageId,
      modelId: dto.modelId,
      scale: dto.scale,
    });
  }

  /**
   * Poll job status - only returns job if user owns it.
   * Uses database job tracking for jobs started via ImageGenerationService.
   */
  @Get('jobs/:jobId')
  @ApiOperation({
    summary: 'Get generation job status and results (DB tracked)',
  })
  public async getJob(
    @CurrentUser() user: IJwtPayload,
    @Param('jobId', new ParseUUIDPipe()) jobId: string
  ) {
    const job = await this.imageGenerationService.syncJobStatus(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Verify ownership
    if (job.userId !== user.userId) {
      throw new ForbiddenException('You do not have access to this job');
    }

    return job;
  }

  /**
   * Get ComfyUI job results with automatic storage upload.
   * Use this for jobs started via generateBaseImages.
   * Images are uploaded to S3/MinIO and permanent URLs are returned.
   */
  @Get('comfyui/:promptId/results')
  @ApiOperation({ summary: 'Get ComfyUI job results with storage URLs' })
  @ApiResponse({ status: 200, description: 'Job results with image URLs' })
  public async getComfyUIResults(
    @CurrentUser() user: IJwtPayload,
    @Param('promptId') promptId: string
  ) {
    return this.comfyuiResultsService.getResults(promptId, user.userId);
  }

  /**
   * Health check for image generation service
   */
  @Get('health')
  @ApiOperation({ summary: 'Check image generation service health' })
  public async healthCheck() {
    const health = await this.baseImageService.healthCheck();
    return {
      comfyui: health.available,
      recommendedWorkflow: health.recommendedWorkflow,
    };
  }

  /**
   * Get available workflows
   */
  @Get('workflows')
  @ApiOperation({ summary: 'Get available image generation workflows' })
  public async getWorkflows() {
    return {
      available: ['z-image-danrisi', 'z-image-simple', 'z-image-pulid'],
      recommended: this.comfyuiAdapter.getRecommendedWorkflow(),
      descriptions: {
        'z-image-danrisi':
          'Optimized workflow with custom samplers (faster, better quality)',
        'z-image-simple': 'Fallback workflow using built-in ComfyUI nodes',
        'z-image-pulid':
          'PuLID workflow for face consistency with reference image',
      },
    };
  }
}
