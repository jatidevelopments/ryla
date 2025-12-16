import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ImageGenerationService } from '@ryla/business';
import { GenerateBaseImagesDto } from './dto/req/generate-base-images.dto';
import { GenerateFaceSwapDto } from './dto/req/generate-face-swap.dto';
import { GenerateCharacterSheetDto } from './dto/req/generate-character-sheet.dto';

@ApiTags('Images')
@Controller('image')
export class ImageController {
  constructor(private readonly imageGenerationService: ImageGenerationService) {}

  /**
   * MVP (Option 1): start base image generation without auth.
   * Returns internal jobId + external RunPod job id.
   */
  @Post('generate/base')
  public async generateBaseImages(@Body() dto: GenerateBaseImagesDto) {
    return this.imageGenerationService.startBaseImages(dto);
  }

  @Post('generate/face-swap')
  public async generateFaceSwap(@Body() dto: GenerateFaceSwapDto) {
    return this.imageGenerationService.startFaceSwap(dto);
  }

  @Post('generate/character-sheet')
  public async generateCharacterSheet(@Body() dto: GenerateCharacterSheetDto) {
    return this.imageGenerationService.startCharacterSheet(dto);
  }

  /**
   * MVP (Option 1): poll job status and sync to DB.
   */
  @Get('jobs/:jobId')
  public async getJob(@Param('jobId', new ParseUUIDPipe()) jobId: string) {
    const job = await this.imageGenerationService.syncJobStatus(jobId);
    if (!job) {
      return { status: 'not_found' as const };
    }
    return job;
  }
}

