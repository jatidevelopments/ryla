import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ImageService } from './services/image.service';

@ApiTags('Images')
@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Get()
  public async getImages(@CurrentUser() user: any) {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Post('generate')
  public async generateImage(@CurrentUser() user: any, @Body() dto: any) {
    // TODO: Implement
    throw new Error('Not implemented');
  }
}

