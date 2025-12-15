import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
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
    private readonly characterService: CharacterService,
    private readonly baseImageGenerationService: BaseImageGenerationService,
    private readonly characterSheetService: CharacterSheetService,
  ) {}

  @Post('generate-base-images')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate 3 base image options from wizard config' })
  async generateBaseImages(
    @CurrentUser() user: any,
    @Body() dto: GenerateBaseImagesDto,
  ) {
    const result = await this.baseImageGenerationService.generateBaseImages({
      appearance: dto.appearance,
      identity: dto.identity,
      nsfwEnabled: dto.nsfwEnabled,
    });

    return {
      jobId: result.jobId,
      status: 'queued',
      message: 'Base image generation started',
    };
  }

  @Get('base-images/:jobId')
  @ApiOperation({ summary: 'Get base image generation results' })
  async getBaseImageResults(
    @CurrentUser() user: any,
    @Param('jobId') jobId: string,
  ) {
    const results = await this.baseImageGenerationService.getJobResults(jobId);

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
    @CurrentUser() user: any,
    @Body() dto: GenerateCharacterSheetDto,
  ) {
    const result = await this.characterSheetService.generateCharacterSheet({
      baseImageUrl: dto.baseImageUrl,
      characterId: dto.characterId,
      nsfwEnabled: dto.nsfwEnabled,
    });

    return {
      jobId: result.jobId,
      status: 'queued',
      message: 'Character sheet generation started',
      variations: result.variations,
    };
  }

  @Get('character-sheet/:jobId')
  @ApiOperation({ summary: 'Get character sheet generation results' })
  async getCharacterSheetResults(
    @CurrentUser() user: any,
    @Param('jobId') jobId: string,
  ) {
    const results = await this.characterSheetService.getJobResults(jobId);

    return {
      status: results.status,
      images: results.images,
    };
  }
}
