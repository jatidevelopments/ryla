import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ImageGalleryService } from './services/image-gallery.service';

@ApiTags('Image Gallery')
@Controller('image-gallery')
export class ImageGalleryController {
  constructor(private readonly imageGalleryService: ImageGalleryService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Get('characters/:characterId/images')
  public async getImages(@Param('characterId') characterId: number, @CurrentUser() user: any) {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Post('images/:imageId/like')
  public async likeImage(@Param('imageId') imageId: number, @CurrentUser() user: any) {
    // TODO: Implement
    throw new Error('Not implemented');
  }
}

