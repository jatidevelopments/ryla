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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ImageGenerationService } from '@ryla/business';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { GenerateBaseImagesDto } from './dto/req/generate-base-images.dto';
import { GenerateFaceSwapDto } from './dto/req/generate-face-swap.dto';
import { GenerateCharacterSheetDto } from './dto/req/generate-character-sheet.dto';
import { BaseImageGenerationService } from './services/base-image-generation.service';
import { ComfyUIJobRunnerAdapter } from './services/comfyui-job-runner.adapter';

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
    @Body() dto: GenerateBaseImagesDto,
  ) {
    // Use the new ComfyUI-based service with workflow factory
    const result = await this.baseImageService.generateBaseImages({
      appearance: dto.appearance,
      identity: dto.identity,
      nsfwEnabled: dto.nsfwEnabled,
      workflowId: dto.workflowId,
      seed: dto.seed,
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
    @Body() dto: GenerateFaceSwapDto,
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
    @Body() dto: GenerateCharacterSheetDto,
  ) {
    return this.imageGenerationService.startCharacterSheet({
      ...dto,
      userId: user.userId,
    });
  }

  /**
   * Poll job status - only returns job if user owns it.
   * Uses database job tracking for jobs started via ImageGenerationService.
   */
  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get generation job status and results (DB tracked)' })
  public async getJob(
    @CurrentUser() user: IJwtPayload,
    @Param('jobId', new ParseUUIDPipe()) jobId: string,
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
    @Param('promptId') promptId: string,
  ) {
    // Get results and upload to storage
    const result = await this.baseImageService.getJobResults(promptId, user.userId);
    return result;
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
        'z-image-danrisi': 'Optimized workflow with custom samplers (faster, better quality)',
        'z-image-simple': 'Fallback workflow using built-in ComfyUI nodes',
        'z-image-pulid': 'PuLID workflow for face consistency with reference image',
      },
    };
  }
}

