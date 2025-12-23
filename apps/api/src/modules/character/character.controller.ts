import {
  Controller,
  Post,
  Body,
  Get,
  Param,
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
import { GenerateBaseImagesDto } from './dto/generate-base-images.dto';
import { GenerateCharacterSheetDto } from './dto/generate-character-sheet.dto';

@ApiTags('Characters')
@Controller('characters')
@UseGuards(JwtAccessGuard)
@ApiBearerAuth()
export class CharacterController {
  constructor(
    @Inject(CharacterService) private readonly characterService: CharacterService,
    @Inject(BaseImageGenerationService) private readonly baseImageGenerationService: BaseImageGenerationService,
    @Inject(CharacterSheetService) private readonly characterSheetService: CharacterSheetService,
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
      userId: user.userId, // Include for client-side tracking
      status: 'queued',
      message: 'Base image generation started',
    };
  }

  @Get('base-images/:jobId')
  @ApiOperation({ summary: 'Get base image generation results' })
  async getBaseImageResults(
    @CurrentUser() user: IJwtPayload,
    @Param('jobId') jobId: string,
  ) {
    // TODO: Verify job ownership via DB lookup when jobs are persisted
    // Pass userId for proper S3 storage organization
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
}
