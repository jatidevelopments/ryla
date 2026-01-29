import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageGalleryController } from './image-gallery.controller';
import { ImageGalleryService } from './services/image-gallery.service';
import { IJwtPayload } from '../auth/interfaces/jwt-payload.interface';

describe('ImageGalleryController', () => {
  let controller: ImageGalleryController;
  let mockImageGalleryService: ImageGalleryService;
  let mockUser: IJwtPayload;

  beforeEach(() => {
    mockUser = {
      userId: 'user-123',
      email: 'test@example.com',
    } as IJwtPayload;

    mockImageGalleryService = {
      getCharacterImages: vi.fn(),
      getImageRedirectUrl: vi.fn(),
      likeImage: vi.fn(),
      deleteImage: vi.fn(),
    } as unknown as ImageGalleryService;

    controller = new ImageGalleryController(mockImageGalleryService);
  });

  describe('getImages', () => {
    it('should return images for character', async () => {
      const mockImages = [{ id: 'img-1', s3Url: 'https://example.com/img.jpg' }];
      vi.mocked(mockImageGalleryService.getCharacterImages).mockResolvedValue(mockImages as any);

      const result = await controller.getImages('char-123', mockUser);

      expect(result).toEqual({ images: mockImages });
      expect(mockImageGalleryService.getCharacterImages).toHaveBeenCalledWith(
        'char-123',
        'user-123',
      );
    });
  });

  describe('getImageFileRedirect', () => {
    it('should return redirect URL', async () => {
      const mockUrl = 'https://s3.example.com/image.jpg';
      vi.mocked(mockImageGalleryService.getImageRedirectUrl).mockResolvedValue(mockUrl);

      const result = await controller.getImageFileRedirect('img-123', mockUser);

      expect(result).toEqual({ url: mockUrl });
      expect(mockImageGalleryService.getImageRedirectUrl).toHaveBeenCalledWith(
        'img-123',
        'user-123',
      );
    });
  });

  describe('likeImage', () => {
    it('should like image', async () => {
      vi.mocked(mockImageGalleryService.likeImage).mockResolvedValue(true);

      const result = await controller.likeImage('img-123', mockUser);

      expect(result).toEqual({ success: true, liked: true });
      expect(mockImageGalleryService.likeImage).toHaveBeenCalledWith('img-123', 'user-123');
    });
  });

  describe('deleteImage', () => {
    it('should delete image', async () => {
      vi.mocked(mockImageGalleryService.deleteImage).mockResolvedValue(true);

      const result = await controller.deleteImage('img-123', mockUser);

      expect(result).toEqual({ success: true });
      expect(mockImageGalleryService.deleteImage).toHaveBeenCalledWith('img-123', 'user-123');
    });
  });
});
