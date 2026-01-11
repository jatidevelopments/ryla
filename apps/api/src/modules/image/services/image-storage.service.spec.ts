import { Test, TestingModule } from '@nestjs/testing';
import { ImageStorageService } from './image-storage.service';
import { AwsS3Service } from '../../aws-s3/services/aws-s3.service';
import { randomUUID } from 'crypto';

describe('ImageStorageService Integration', () => {
    let service: ImageStorageService;
    let s3ServiceMock: any;

    const mockBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const userId = randomUUID();
    const jobId = 'test-job-id';

    beforeEach(async () => {
        s3ServiceMock = {
            uploadFileDirect: vi.fn().mockResolvedValue(undefined),
            getFileUrl: vi.fn().mockImplementation((key) => Promise.resolve(`https://s3.amazonaws.com/${key}`)),
            deleteFile: vi.fn().mockResolvedValue(undefined),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ImageStorageService,
                { provide: AwsS3Service, useValue: s3ServiceMock },
            ],
        }).compile();

        service = module.get<ImageStorageService>(ImageStorageService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('uploadImages', () => {
        it('should parse base64 and upload to correct path', async () => {
            const results = await service.uploadImages([mockBase64Image], {
                userId,
                category: 'gallery',
                jobId,
            });

            expect(results.images).toHaveLength(1);
            expect(results.images[0].url).toContain(`users/${userId}/gallery/${jobId}_00_`);
            expect(s3ServiceMock.uploadFileDirect).toHaveBeenCalled();

            const [key, buffer, mimeType] = s3ServiceMock.uploadFileDirect.mock.calls[0];
            expect(key).toContain(`users/${userId}/gallery/${jobId}_00_`);
            expect(buffer).toBeInstanceOf(Buffer);
            expect(mimeType).toBe('image/png');
        });

        it('should handle multiple images with indices', async () => {
            const results = await service.uploadImages([mockBase64Image, mockBase64Image], {
                userId,
                category: 'character-sheets',
                jobId,
                characterId: 'char-123',
            });

            expect(results.images).toHaveLength(2);
            expect(results.images[0].key).toContain('_00_');
            expect(results.images[1].key).toContain('_01_');
            expect(results.images[0].key).toContain('characters/char-123/character-sheets');
        });
    });

    describe('deleteImages', () => {
        it('should call s3 delete for each key', async () => {
            const keys = ['key1', 'key2'];
            await service.deleteImages(keys);
            expect(s3ServiceMock.deleteFile).toHaveBeenCalledTimes(2);
            expect(s3ServiceMock.deleteFile).toHaveBeenCalledWith('key1');
            expect(s3ServiceMock.deleteFile).toHaveBeenCalledWith('key2');
        });
    });
});
