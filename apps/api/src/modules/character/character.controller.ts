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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CharacterService } from './services/character.service';
import { BaseImageGenerationService } from '../image/services/base-image-generation.service';
import { CharacterSheetService } from '../image/services/character-sheet.service';
import { ProfilePictureSetService } from '../image/services/profile-picture-set.service';
import { GenerateBaseImagesDto } from './dto/generate-base-images.dto';
import { GenerateCharacterSheetDto } from './dto/generate-character-sheet.dto';
import { GenerateProfilePictureSetDto } from '../image/dto/req/generate-profile-picture-set.dto';
import { RegenerateProfilePictureDto } from '../image/dto/req/regenerate-profile-picture.dto';

@ApiTags('Characters')
@Controller('characters')
@UseGuards(JwtAccessGuard)
@ApiBearerAuth()
export class CharacterController {
  constructor(
    @Inject(CharacterService) private readonly characterService: CharacterService,
    @Inject(BaseImageGenerationService) private readonly baseImageGenerationService: BaseImageGenerationService,
    @Inject(CharacterSheetService) private readonly characterSheetService: CharacterSheetService,
    @Inject(ProfilePictureSetService) private readonly profilePictureSetService: ProfilePictureSetService,
  ) {}

  @Post('generate-base-images')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate 3 base image options from wizard config' })
  async generateBaseImages(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: GenerateBaseImagesDto,
  ) {
    // TODO: Store job in DB with userId for full ownership tracking
    const result = await this.baseImageGenerationService.generateBaseImages({
      appearance: dto.appearance,
      identity: dto.identity,
      nsfwEnabled: dto.nsfwEnabled,
    });

    return {
      jobId: result.jobId,
      allJobIds: result.allJobIds || [result.jobId], // Include all 3 job IDs
      userId: user.userId, // Include for client-side tracking
      status: 'queued',
      message: 'Base image generation started (3 images)',
    };
  }

  @Get('base-images/:jobId')
  @ApiOperation({ summary: 'Get base image generation results (single job or batch)' })
  async getBaseImageResults(
    @CurrentUser() user: IJwtPayload,
    @Param('jobId') jobId: string,
    @Query('allJobIds') allJobIds?: string, // Comma-separated list of all job IDs for batch
  ) {
    // TODO: Verify job ownership via DB lookup when jobs are persisted
    // Pass userId for proper S3 storage organization
    
    // If allJobIds query param is provided, use batch method
    if (allJobIds) {
      const jobIds = allJobIds.split(',').filter((id) => id.trim());
      const results = await this.baseImageGenerationService.getBatchJobResults(
        jobIds,
        user.userId,
      );
      return {
        status: results.status,
        images: results.images,
        error: results.error,
      };
    }

    // Otherwise, get single job results
    const results = await this.baseImageGenerationService.getJobResults(jobId, user.userId);

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
      'This runs in the background after character creation. User can generate images with face swap while this processes.',
  })
  async generateCharacterSheet(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: GenerateCharacterSheetDto,
  ) {
    // TODO: Verify user owns the character before generating sheet
    // TODO: Store job in DB with userId for ownership tracking
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
    };
  }

  @Get('character-sheet/:jobId')
  @ApiOperation({ summary: 'Get character sheet generation results' })
  async getCharacterSheetResults(
    @CurrentUser() user: IJwtPayload,
    @Param('jobId') jobId: string,
  ) {
    // TODO: Verify job ownership via DB lookup when jobs are persisted
    // Pass userId for proper S3 storage organization
    const results = await this.characterSheetService.getJobResults(jobId, user.userId);

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
      'Generates a set of profile pictures with different positions using PuLID for face consistency.',
  })
  async generateProfilePictureSet(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: GenerateProfilePictureSetDto,
  ) {
    const result = await this.profilePictureSetService.generateProfilePictureSet({
      baseImageUrl: dto.baseImageUrl,
      characterId: dto.characterId,
      userId: dto.userId || user.userId,
      setId: dto.setId,
      nsfwEnabled: dto.nsfwEnabled,
    });

    return {
      jobId: result.jobId,
      userId: dto.userId || user.userId,
      status: 'queued',
      message: 'Profile picture set generation started',
      imageCount: result.images.length,
    };
  }

  @Get('profile-picture-set/:jobId')
  @ApiOperation({ summary: 'Get profile picture set generation results' })
  async getProfilePictureSetResults(
    @CurrentUser() user: IJwtPayload,
    @Param('jobId') jobId: string,
  ) {
    // TODO: Implement result retrieval from ProfilePictureSetService
    // For now, use base image service method
    const results = await this.baseImageGenerationService.getJobResults(jobId, user.userId);

    return {
      status: results.status,
      images: results.images,
    };
  }

  @Post('regenerate-profile-picture')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Regenerate a single profile picture with optional prompt override',
  })
  async regenerateProfilePicture(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: RegenerateProfilePictureDto,
  ) {
    const result = await this.profilePictureSetService.regenerateProfilePicture({
      baseImageUrl: dto.baseImageUrl,
      positionId: dto.positionId,
      prompt: dto.prompt,
      nsfwEnabled: dto.nsfwEnabled,
      setId: dto.setId || 'classic-influencer',
    });

    return {
      jobId: result.jobId,
      userId: dto.userId || user.userId,
      status: 'queued',
      message: 'Profile picture regeneration started',
    };
  }
}
