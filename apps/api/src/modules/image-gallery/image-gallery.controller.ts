import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Inject,
  ParseUUIDPipe,
  Redirect,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ImageGalleryService } from './services/image-gallery.service';

@ApiTags('Image Gallery')
@Controller('image-gallery')
@UseGuards(JwtAccessGuard)
@ApiBearerAuth()
export class ImageGalleryController {
  constructor(
    @Inject(ImageGalleryService)
    private readonly imageGalleryService: ImageGalleryService,
  ) {}

  @Get('characters/:characterId/images')
  @ApiOperation({ summary: 'Get images for a character (must own character)' })
  public async getImages(
    @Param('characterId', new ParseUUIDPipe()) characterId: string,
    @CurrentUser() user: IJwtPayload,
  ) {
    // Verify ownership - service should check character.userId === user.userId
    const images = await this.imageGalleryService.getCharacterImages(
      characterId,
      user.userId,
    );
    return { images };
  }

  @Get('images/:imageId/file')
  @ApiOperation({ summary: 'Get a stable auth-protected image URL (302 redirect to fresh signed URL)' })
  @Redirect(undefined, 302)
  public async getImageFileRedirect(
    @Param('imageId', new ParseUUIDPipe()) imageId: string,
    @CurrentUser() user: IJwtPayload,
  ) {
    const url = await this.imageGalleryService.getImageRedirectUrl(imageId, user.userId);
    return { url };
  }

  @Post('images/:imageId/like')
  @ApiOperation({ summary: 'Like an image (must own image)' })
  public async likeImage(
    @Param('imageId', new ParseUUIDPipe()) imageId: string,
    @CurrentUser() user: IJwtPayload,
  ) {
    // Service should verify image ownership before liking
    const liked = await this.imageGalleryService.likeImage(imageId, user.userId);
    return { success: true, liked };
  }

  @Delete('images/:imageId')
  @ApiOperation({ summary: 'Delete an image (soft delete; must own image)' })
  public async deleteImage(
    @Param('imageId', new ParseUUIDPipe()) imageId: string,
    @CurrentUser() user: IJwtPayload,
  ) {
    await this.imageGalleryService.deleteImage(imageId, user.userId);
    return { success: true };
  }
}

