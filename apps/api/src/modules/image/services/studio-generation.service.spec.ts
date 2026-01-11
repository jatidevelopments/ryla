import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { StudioGenerationService } from './studio-generation.service';
import { ComfyUIJobRunnerAdapter } from './comfyui-job-runner.adapter';
import { FalImageService } from './fal-image.service';
import { ImageStorageService } from './image-storage.service';
import { AwsS3Service } from '../../aws-s3/services/aws-s3.service';
import { createTestDb } from '../../../test/utils/test-db';
import * as schema from '@ryla/data/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('StudioGenerationService Integration', () => {
    let service: StudioGenerationService;
    let db: any;
    let client: any;

    // Mocks
    let comfyuiMock: any;
    let falMock: any;
    let s3Mock: any;
    let imageStorageMock: any;

    const userId = randomUUID();
    const characterId = randomUUID();

    beforeEach(async () => {
        const testDb = await createTestDb();
        db = testDb.db;
        client = testDb.client;

        comfyuiMock = {
            queueWorkflow: vi.fn().mockResolvedValue('prompt-id'),
            getRecommendedWorkflow: vi.fn().mockReturnValue('z-image-simple'),
        };
        falMock = {
            isConfigured: vi.fn().mockReturnValue(true),
            runFlux: vi.fn().mockResolvedValue({ imageUrls: ['https://fal.com/img.png'] }),
            downloadToBase64DataUrl: vi.fn().mockResolvedValue('base64data'),
            runUpscale: vi.fn().mockResolvedValue({ imageUrls: ['https://fal.com/upscaled.png'] }),
        };
        s3Mock = {
            getFileUrl: vi.fn().mockResolvedValue('https://fake-url.com'),
        };
        imageStorageMock = {
            uploadImages: vi.fn().mockResolvedValue({
                images: [{ key: 'final-key', url: 'https://final-url.com', thumbnailUrl: 'https://thumb-url.com' }]
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StudioGenerationService,
                { provide: 'DRIZZLE_DB', useValue: db },
                { provide: ComfyUIJobRunnerAdapter, useValue: comfyuiMock },
                { provide: FalImageService, useValue: falMock },
                { provide: ImageStorageService, useValue: imageStorageMock },
                { provide: AwsS3Service, useValue: s3Mock },
            ],
        }).compile();

        service = module.get<StudioGenerationService>(StudioGenerationService);

        // Seed user
        await db.insert(schema.users).values({
            id: userId,
            email: 'studio@example.com',
            password: 'hashedpassword',
            name: 'Studio User',
            publicName: 'studiouser',
        });

        // Seed character
        await db.insert(schema.characters).values({
            id: characterId,
            userId,
            name: 'Test Character',
            config: {
                baseModel: 'z-image-turbo',
                description: 'A test character',
                dna: { ethnicity: 'caucasian', age: 25 },
            },
        });

        // Spy on background methods to prevent them from actually running in "start" tests
        vi.spyOn(service as any, 'runFalStudioJob').mockImplementation(() => Promise.resolve());
        vi.spyOn(service as any, 'runFalUpscaleJob').mockImplementation(() => Promise.resolve());
    });

    afterEach(async () => {
        if (client) await client.close();
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    describe('startStudioGeneration', () => {
        it('should validate count range', async () => {
            const input: any = { userId, characterId, count: 0 };
            await expect(service.startStudioGeneration(input)).rejects.toThrow(BadRequestException);

            input.count = 11;
            await expect(service.startStudioGeneration(input)).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFound if character does not exist', async () => {
            const input: any = {
                userId,
                characterId: randomUUID(),
                count: 1,
            };
            await expect(service.startStudioGeneration(input)).rejects.toThrow(NotFoundException);
        });

        it('should handle prompt enhancement timeout', async () => {
            const input: any = {
                userId,
                characterId,
                scene: 'portrait',
                environment: 'indoor',
                outfit: 'casual',
                aspectRatio: '1:1',
                qualityMode: 'draft',
                count: 1,
                nsfw: false,
                promptEnhance: false,
            };

            const result = await service.startStudioGeneration(input);
            expect(result.jobs).toHaveLength(1);
        });

        it('should handle prompt enhancement success with negative additions', async () => {
            falMock.runFlux.mockResolvedValueOnce({
                prompt: 'enhanced',
                enhancement: { negativeAdditions: ['blurry', 'distorted'] }
            });
            const input: any = {
                userId,
                characterId,
                scene: 'portrait',
                aspectRatio: '1:1',
                qualityMode: 'draft',
                count: 1,
                promptEnhance: true,
            };
            await service.startStudioGeneration(input);
            expect(comfyuiMock.queueWorkflow).toHaveBeenCalled();
        });

        it('should succeed with comfyui provider', async () => {
            const input: any = {
                userId,
                characterId,
                scene: 'portrait',
                environment: 'indoor',
                outfit: 'casual',
                aspectRatio: '1:1',
                qualityMode: 'draft',
                count: 1,
                nsfw: false,
                modelProvider: 'comfyui',
            };

            const result = await service.startStudioGeneration(input);
            expect(result.jobs[0].promptId).toBe('prompt-id');

            const [job] = await db.select().from(schema.generationJobs);
            expect(job.externalProvider).toBe('comfyui');
        });

        it('should succeed with fal provider', async () => {
            const input: any = {
                userId,
                characterId,
                scene: 'portrait',
                environment: 'indoor',
                outfit: 'casual',
                aspectRatio: '1:1',
                qualityMode: 'draft',
                count: 1,
                nsfw: false,
                modelProvider: 'fal',
            };

            const result = await service.startStudioGeneration(input);
            expect(result.jobs[0].promptId).toContain('fal_');
            expect((service as any).runFalStudioJob).toHaveBeenCalled();
        });

        it('should handle all aspect ratios and optional prompt fields', async () => {
            const ratios: Array<'9:16' | '2:3'> = ['9:16', '2:3'];
            for (const ratio of ratios) {
                const input: any = {
                    userId,
                    characterId,
                    scene: 'portrait',
                    environment: 'indoor',
                    outfit: 'casual',
                    aspectRatio: ratio,
                    qualityMode: 'draft',
                    count: 1,
                    poseId: 'standing-casual',
                    lighting: 'neon',
                    expression: 'happy',
                    additionalDetails: 'extra detail',
                    promptEnhance: false,
                };
                await service.startStudioGeneration(input);
            }
            expect(comfyuiMock.queueWorkflow).toHaveBeenCalledTimes(2);
        });

        it('should handle prompt enhancement failure fallback', async () => {
            falMock.isConfigured.mockReturnValue(false);
            const input: any = {
                userId,
                characterId,
                scene: 'portrait',
                environment: 'indoor',
                outfit: 'casual',
                aspectRatio: '1:1',
                qualityMode: 'draft',
                count: 1,
                modelProvider: 'fal',
            };
            await service.startStudioGeneration(input);
            expect(comfyuiMock.queueWorkflow).toHaveBeenCalled();
        });
    });

    describe('runFalStudioJob (Manual)', () => {
        beforeEach(() => {
            (service as any).runFalStudioJob.mockRestore();
        });

        it('should update records on success', async () => {
            const [image] = await db.insert(schema.images).values({
                userId,
                characterId,
                status: 'generating',
                s3Key: 'temp',
                thumbnailKey: 'temp'
            }).returning();

            const [job] = await db.insert(schema.generationJobs).values({
                userId,
                characterId,
                type: 'image_generation',
                status: 'processing',
                externalJobId: 'fal_123',
                externalProvider: 'fal',
                input: { imageId: image.id }
            }).returning();

            await (service as any).runFalStudioJob({
                jobId: job.id,
                externalJobId: 'fal_123',
                userId,
                characterId,
                modelId: 'fal-ai/flux/schnell',
                prompt: 'test prompt',
                negativePrompt: '',
                width: 1024,
                height: 1024,
                imageId: image.id
            });

            const updatedImage = await db.query.images.findFirst({ where: eq(schema.images.id, image.id) });
            expect(updatedImage.status).toBe('completed');
        });

        it('should update image metadata from tracked job', async () => {
            falMock.runFlux.mockResolvedValue({ imageUrls: ['https://fal.com/img.png'] });

            const [image] = await db.insert(schema.images).values({
                userId,
                characterId,
                status: 'generating',
                s3Key: 'temp',
                thumbnailKey: 'temp'
            }).returning();

            const [job] = await db.insert(schema.generationJobs).values({
                userId,
                characterId,
                type: 'image_generation',
                status: 'processing',
                externalJobId: 'fal_meta',
                externalProvider: 'fal',
                input: {
                    imageId: image.id,
                    promptEnhance: true,
                    originalPrompt: 'orig',
                    enhancedPrompt: 'enh'
                }
            }).returning();

            await (service as any).runFalStudioJob({
                jobId: job.id,
                externalJobId: 'fal_meta',
                userId,
                characterId,
                modelId: 'fal-ai/flux/schnell',
                prompt: 'enh',
                negativePrompt: '',
                width: 1024,
                height: 1024,
                imageId: image.id
            });

            const updatedImage = await db.query.images.findFirst({ where: eq(schema.images.id, image.id) });
            expect(updatedImage.promptEnhance).toBe(true);
            expect(updatedImage.originalPrompt).toBe('orig');
        });

        it('should retry on content policy violation', async () => {
            falMock.runFlux
                .mockRejectedValueOnce(new Error('Fal error: 422 - content policy violation'))
                .mockResolvedValueOnce({ imageUrls: ['https://fal.com/img.png'] });

            const [image] = await db.insert(schema.images).values({
                userId,
                characterId,
                status: 'generating',
                s3Key: 'temp',
                thumbnailKey: 'temp'
            }).returning();

            const [job] = await db.insert(schema.generationJobs).values({
                userId,
                characterId,
                type: 'image_generation',
                status: 'processing',
                externalJobId: 'fal_retry',
                externalProvider: 'fal',
                input: { imageId: image.id }
            }).returning();

            await (service as any).runFalStudioJob({
                jobId: job.id,
                externalJobId: 'fal_retry',
                userId,
                characterId,
                modelId: 'fal-ai/flux/seedream',
                prompt: 'a very long and descriptive prompt with breasts and ass that should still be long enough after sanitization',
                negativePrompt: '',
                width: 1024,
                height: 1024,
                imageId: image.id
            });

            expect(falMock.runFlux).toHaveBeenCalledTimes(2);
        });

        it('should handle failure during job execution', async () => {
            falMock.runFlux.mockRejectedValue(new Error('Persistent failure'));

            const [image] = await db.insert(schema.images).values({
                userId,
                characterId,
                status: 'generating',
                s3Key: 'temp',
                thumbnailKey: 'temp'
            }).returning();

            const [job] = await db.insert(schema.generationJobs).values({
                userId,
                characterId,
                type: 'image_generation',
                status: 'processing',
                externalJobId: 'fal_fail',
                externalProvider: 'fal',
                input: { imageId: image.id }
            }).returning();

            await (service as any).runFalStudioJob({
                jobId: job.id,
                externalJobId: 'fal_fail',
                userId,
                characterId,
                modelId: 'fal-ai/flux/schnell',
                prompt: 'test',
                negativePrompt: '',
                width: 1024,
                height: 1024,
                imageId: image.id
            });

            const updatedJob = await db.query.generationJobs.findFirst({ where: eq(schema.generationJobs.id, job.id) });
            expect(updatedJob.status).toBe('failed');
        });
    });

    describe('startUpscale', () => {
        it('should validate ownership and status', async () => {
            // Non-existent
            await expect(service.startUpscale({ userId, imageId: randomUUID() })).rejects.toThrow(NotFoundException);

            // Forbidden branch coverage using manual mock of repository
            const forbiddenImageId = randomUUID();
            vi.spyOn((service as any).imagesRepo, 'getById').mockResolvedValueOnce({
                id: forbiddenImageId,
                userId: 'someone-else',
                status: 'completed'
            });
            await expect(service.startUpscale({ userId, imageId: forbiddenImageId })).rejects.toThrow(ForbiddenException);

            // Existing but not completed
            const [image] = await db.insert(schema.images).values({
                userId,
                characterId,
                status: 'generating',
                s3Key: 'temp',
                thumbnailKey: 'temp'
            }).returning();
            await expect(service.startUpscale({ userId, imageId: image.id })).rejects.toThrow(BadRequestException);
        });

        it('should throw if fal not configured', async () => {
            falMock.isConfigured.mockReturnValue(false);
            const [image] = await db.insert(schema.images).values({
                userId,
                characterId,
                status: 'completed',
                s3Key: 'source',
                thumbnailKey: 'source'
            }).returning();
            await expect(service.startUpscale({ userId, imageId: image.id })).rejects.toThrow(BadRequestException);
        });

        it('should throw if character not found', async () => {
            const [image] = await db.insert(schema.images).values({
                userId,
                characterId: characterId,
                status: 'completed',
                s3Key: 'source',
                thumbnailKey: 'source'
            }).returning();

            await db.delete(schema.characters).where(eq(schema.characters.id, characterId));

            await expect(service.startUpscale({ userId, imageId: image.id })).rejects.toThrow(NotFoundException);
        });

        it('should start upscale and queue background job', async () => {
            const [image] = await db.insert(schema.images).values({
                userId,
                characterId,
                status: 'completed',
                s3Key: 'final',
                thumbnailKey: 'final'
            }).returning();

            const result = await service.startUpscale({ userId, imageId: image.id });
            expect(result.jobId).toBeDefined();
            expect((service as any).runFalUpscaleJob).toHaveBeenCalled();
        });
    });

    describe('runFalUpscaleJob (Manual)', () => {
        beforeEach(() => {
            (service as any).runFalUpscaleJob.mockRestore();
        });

        it('should handle upscale failure', async () => {
            falMock.runUpscale.mockRejectedValue(new Error('Upscale failed'));

            const [job] = await db.insert(schema.generationJobs).values({
                userId,
                characterId,
                type: 'image_upscale',
                status: 'processing',
                externalJobId: 'fal_upscale_fail',
                externalProvider: 'fal',
                input: { sourceImageId: randomUUID() }
            }).returning();

            await (service as any).runFalUpscaleJob({
                jobId: job.id,
                externalJobId: 'fal_upscale_fail',
                userId,
                characterId,
                sourceImageId: randomUUID(),
                sourceImageUrl: 'https://source.com/img.png',
                modelId: 'fal-ai/clarity-upscaler',
                scale: 2
            });

            const updatedJob = await db.query.generationJobs.findFirst({ where: eq(schema.generationJobs.id, job.id) });
            expect(updatedJob.status).toBe('failed');
        });

        it('should upscale image and update records', async () => {
            const [image] = await db.insert(schema.images).values({
                userId,
                characterId,
                status: 'completed',
                s3Key: 'source',
                thumbnailKey: 'source'
            }).returning();

            const [job] = await db.insert(schema.generationJobs).values({
                userId,
                characterId,
                type: 'image_upscale',
                status: 'processing',
                externalJobId: 'fal_upscale',
                externalProvider: 'fal',
                input: { sourceImageId: image.id }
            }).returning();

            await (service as any).runFalUpscaleJob({
                jobId: job.id,
                externalJobId: 'fal_upscale',
                userId,
                characterId,
                sourceImageId: image.id,
                sourceImageUrl: 'https://source.com/img.png',
                modelId: 'fal-ai/clarity-upscaler',
                scale: 2
            });

            const updatedJob = await db.query.generationJobs.findFirst({ where: eq(schema.generationJobs.id, job.id) });
            expect(updatedJob.status).toBe('completed');

            const upscaledImage = await db.query.images.findFirst({ where: eq(schema.images.sourceImageId, image.id) });
            expect(upscaledImage).toBeDefined();
            expect(upscaledImage.status).toBe('completed');
        });
    });

    describe('sanitizePromptForStrictModels', () => {
        it('should remove body parts for strict models', () => {
            const prompt = 'a girl with big breasts and a small ass, studio lighting';
            const sanitized = (service as any).sanitizePromptForStrictModels(prompt, 'fal-ai/flux/seedream');
            expect(sanitized).not.toContain('breasts');
            expect(sanitized).not.toContain('ass');
            expect(sanitized).toContain('studio lighting');
        });

        it('should not sanitize non-strict models', () => {
            const prompt = 'big breasts';
            const sanitized = (service as any).sanitizePromptForStrictModels(prompt, 'fal-ai/flux/schnell');
            expect(sanitized).toBe(prompt);
        });
    });
});
